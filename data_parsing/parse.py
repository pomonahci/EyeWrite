#!/usr/bin/env python3
"""Script for parsing the data that comes out of Eyedraw.

There are two kinds of files that we're concerned about: `.txt` and `.csv`.
There is only one `.txt` we're concerned about: `clientGazeLog.txt`. There are
three `.csv`s we're concerned about: `[url_params]_[user_id]_action.csv`,
`[url_params]_[user_id]_mouse.csv`, and `[url_params]_server.csv`.

It's crucial that we have all of these files for each user (except for the
server csv. which we only need one of (TODO check this: that all server csvs are
identical)). If there are `n` users, there should be `3 * n + 1` files. (The
three files per user are action, mouse, and clientGazeLog. The plus one is the
server csv.)

*Please append the user's ID to each `clientGazeLog.txt` file's name:
 `clientGazeLog_[user_ID].txt`.*

The script assumes that all these files are in one directory. Therefore, it
takes exactly one argument: the location of the folder containing all data.

TODO add example script call

The script will output a CSV summarizing gaze overlap data. It indicates the
duration of each overlap, and which users were involved.

I've written the script with a primary concern to legibility and modifiability.
That means it's not optimized, but our files will never be that big.


Preconditions:

  - All data files are in one folder, provided as an argument, which follow the
    naming conventions above.
  - There are no more than six users.

Author: Andy Han, late March 2022

"""


import argparse
import os
import csv
import json
import pprint

# get the files
parser = argparse.ArgumentParser()
parser.add_argument("data_location")
args = parser.parse_args()

DATA_LOCATION = args.data_location

def get_user_id_gazelog(fname: str):
    return fname[14:-4]


def get_user_id_csv(fname: str):
    # need to search for it, cause "mouse" and "action" are not the same length
    # still O(1) since it's either five or six chars, plus the user id's length
    end_of_id = -1
    while fname[end_of_id] != '_':
        end_of_id -= 1

    start_of_id = end_of_id - 1
    while fname[start_of_id] != '_':
        start_of_id -= 1
    start_of_id += 1

    return fname[start_of_id:end_of_id]


def get_files():
    """
    Get file names from directory and organize them by user.
    """
    # keys str (user id); values dict with keys str ("action" or "mouse") and
    # values str (filenames)
    csv_dict = {}
    gazelog_dict = {}  # keys str (user id); values str (user's gazelog)
    server_csv = ""  # filename of server csv
    for filename in os.listdir(DATA_LOCATION):
        f = os.path.join(DATA_LOCATION, filename)
        if os.path.isfile(f):
            # that is, not a directory: detect what kind it is
            if filename[-3:] == "txt":
                # it's a clientGazeLog
                user = get_user_id_gazelog(filename)
                gazelog_dict[user] = f
                continue

            # now we know it's a csv: is it the server csv?
            if filename[-10:] == "server.csv":
                server_csv = filename
                continue
            # otherwise, it's an action or mouse csv
            user = get_user_id_csv(filename)
            if not csv_dict[user]:
                csv_dict[user] = {}
            if filename[-10:] == "action.csv":
                csv_dict[user]["action"] = f
                continue
            if filename[-9:] == "mouse.csv":
                csv_dict[user]["mouse"] = f
            continue
    return csv_dict, gazelog_dict, server_csv

# At this point, csv_dict, gazelog_dict, and server_csv are populated. We now
# have to get the data into csv objects, for the csv; into some data structure,
# for the gazelog.


def parse_overlapping(server_csvs: list):
    """server_csvs is a list of tuples: (user_id, file_location). The file
    location is of the server_csv for each user. I think we only need the
    server_csv to get the duration, time bounds, and color of overlap. (But
    color doesn't seem consistent across csvs from the same experiment, which is
    problematic.) We need clientGazeLog to get locations of overlap.

    Tbh, we only need one server csv to get the data. We need the others in
    order to figure out the time offset for each user, so to later figure
    out the locations of the overlap.

    Returns a tuple `overlapping`, `start_timestamps`. `overlapping` is a
    dictionary with keys user_id (str) and values list that contain tuples
    (color: str, timestamp: int).

    `start_timestamps` is a dictionary that associates a user_id with the time
    that that user reports having started the experiment. It's necessary to sync
    the different computers' clocks.

    """
    overlapping = {}  # keys user_id, values lists (this_overlapping)
    start_timestamps = {}  # keys user_id, values ints
    for user, server_csv in server_csvs:
        overlapping_single = parse_overlapping_single(server_csv)
        start_timestamps[user] = overlapping_single["start_ts"]
        overlapping[user] = overlapping_single["overlapping"]

    return overlapping, start_timestamps


def parse_overlapping_single(server_csv):
    """Helper function that parses one user's overlapping. Cf. parse_overlapping for more."""
    this_server_dict = {}
    this_server_dict["users"] = []  # list of user ids
    this_overlapping = []
    this_start_ts = 0
    with open(server_csv, mode='r') as server_file:
        csv_reader = csv.DictReader(server_file)
        for row in csv_reader:
            if row["Parameter"][:6] == "User: ":
                # add user id (special handling)
                this_server_dict["users"].append(row["Parameter"][6:])
            elif row["Parameter"] == "Experiment Start":
                # timestamp of start
                this_server_dict["experiment_start"] = int(row["Value"])
                this_start_ts = int(row["Value"])
            elif row["Parameter"] == "Participants":
                # number of participants
                this_server_dict["participants"] = int(row["Value"])
            elif row["Parameter"] == "Overlapping":
                # because the last value (timestamp) has no header, we need to access the value directly
                timestamp = int(list(row.values())[2][0])
                color = row["Value"][1:]  # for some reason the color begins with a colon
                this_overlapping.append((color, timestamp))
            else:
                this_server_dict[row["Parameter"]] = row["Value"]

    return {"overlapping": this_overlapping, \
            "server_dict": this_server_dict, \
            "start_ts": this_start_ts}


def make_overlap_buckets(overlapping_list, tolerance=1000):
    """Group data from a single user's overlapping_list (given by
    parse_overlapping) into buckets. A new bucket is made when `tolerance`
    milliseconds go by without an overlapping data point, or when the color changes.

    The output is a list of dictionaries. The dictionaries have keys
    "start" (value int), "end" (value int), and "color" (value str).
    """
    prev_color = overlapping_list[0][0]
    prev_timestamp = overlapping_list[0][1]
    buckets = []
    this_bucket = {"start": prev_timestamp, "color": prev_color}
    for color, timestamp in overlapping_list[1:]:
        if abs(timestamp - prev_timestamp) >= tolerance or color != prev_color:
            # finish this bucket
            this_bucket["end"] = prev_timestamp
            buckets.append(this_bucket)
            # add this as the start of a new bucket
            this_bucket = {"start": timestamp, "color": color}
        prev_timestamp = timestamp
        prev_color = color

    return buckets


def get_overlap_locations(orig_buckets: list, gazelog: str, user_id=None, tolerance=30):
    """Attach locations to the overlapping start and end time from `buckets`.
    `buckets` is a single user's buckets; `gazelog` is the file location of that
    single user's gazelog. `tolerance` is how much tolerance we're allowing on
    either side of the gazelog. That is, if `buckets` says that a user had
    overlap at time 100 and we have tolerance of 10, then we will look in the
    gazelog for a log any time between 90 and 110 (inclusive) and count the
    first location so found as the location for the overlap at time 100.

    The algorithm is one that is slow--O(len(gazelog) * len(orig_buckets))--but
    the reason that we scan the entire buckets list is so that we deal with
    search misses gracefully. If the function can't find a gazelog log within
    the tolerance, then it won't add location info at that bucket, and will move
    onto the next bucket. This means we can fine-tune tolerance to get the least
    tolerance possible.

    If `user_id` (as an int) is passed to this function, it will stop iterating
    through the gazelog file when the gazelog user id is not the same. This will
    improve performance quite a bit, cause our gazelogs don't make distinctions
    between experiments except by changing the user id in the log.

    Returns a modified copy of the `buckets` list, with four additional keys
    in each bucket: "start_loc_x", "start_loc_y", "end_loc_x", and "end_loc_y".

    """
    start_timestamps = []
    end_timestamps = []
    buckets = []
    for i, bucket in enumerate(orig_buckets):
        # TODO this is stupid the i is obviously just going up by 1; can just
        # use the index of the element in start_timestamps itself
        buckets.append(bucket)  # make copy of orig_buckets
        start_timestamps.append((bucket["start"], i))
        end_timestamps.append((bucket["end"], i))

    with open(gazelog, mode='r') as gazelog_file:
        for line in gazelog_file:
            found = False
            log = json.loads(line)

            if user_id and int(log["user"]) != user_id:
                # keep going until we find the user
                continue

            # search in start timestamps
            for start_ts, i in start_timestamps:
                if start_ts - tolerance <= log["epoch"] and start_ts + tolerance >= log["epoch"]:
                    buckets[i]["start_loc_x"] = log["X"]
                    buckets[i]["start_loc_y"] = log["Y"]
                    # this will overwrite any existing locations found, so it has a bias towards later time
                    # break both for loops once we've found target
                    found = True
                    break

            # the same gazelog log can't refer to the start of one bucket and
            # the end of another, so long as this tolerance is less than the
            # bucket tolerance in `make_overlap_buckets`, so we're done with
            # this gazelog log if we found a start loc
            if found: continue

            for end_ts, i in end_timestamps:
                if end_ts - tolerance <= log["epoch"] and end_ts + tolerance >= log["epoch"]:
                    buckets[i]["end_loc_x"] = log["X"]
                    buckets[i]["end_loc_y"] = log["Y"]
                    # this will overwrite any existing locations found, so it has a bias towards later time
                    break

    return buckets


def get_single_buckets(server_csv, gazelog, user_id=None):
    """Example of how to get a single user's buckets."""
    overlapping_single = parse_overlapping_single(server_csv)
    print(f"Done parsing overlapping; found start_ts {overlapping_single['start_ts']}")

    buckets = make_overlap_buckets(overlapping_single['overlapping'])
    # print(f"Done making initial buckets. Found {len(buckets)} buckets:")
    # pprint.pprint(buckets)

    location_buckets = get_overlap_locations(buckets, gazelog, user_id)
    print(f"Done making location buckets with server_csv {server_csv}. Found {len(location_buckets)} buckets:")
    pprint.pprint(location_buckets)


def filter_fleeting_overlaps(overlap_buckets:list, ms: int=150) -> list:
    """Filter out buckets with overlap duration less than `ms` milliseconds. Default 150"""
    return [d for d in overlap_buckets if d["end"] - d["start"] < ms]


def make_csv_from_dict_list(d_list: list, output_location: str):
    """Utility function to make a csv from list of dicts `d_list` to file `output_location`."""
    keys = set().union(*(d.keys() for d in d_list))  # cause first entry might not have all keys
    with open(output_location, 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(d_list)
