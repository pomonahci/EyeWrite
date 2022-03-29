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

    """
    NUM_PAR = len(server_csvs)
    overlapping = {}  # keys user_id, values lists (this_overlapping)
    start_timestamps = {}  # keys user_id, values ints
    for n in range(NUM_PAR):
        this_server_dict = {}
        this_server_dict["users"] = []  # list of user ids
        this_user = server_csvs[n][0]
        this_overlapping = []
        with open(server_csvs[n][1], mode='r') as server_file:
            csv_reader = csv.DictReader(server_file)
            line_count = 0
            for row in csv_reader:
                if row["Parameter"][:6] == "User: ":
                    # add user id (special handling)
                    this_server_dict["users"].append(row["Parameter"][6:])
                elif row["Parameter"] == "Experiment Start":
                    # timestamp of start
                    this_server_dict["experiment_start"] = int(row["Value"])
                    start_timestamps[this_user] = int(row["Value"])
                elif row["Parameter"] == "Participants":
                    # number of participants
                    this_server_dict["participants"] = int(row["Value"])
                    assert int(row["Value"]) == NUM_PAR
                elif row["Parameter"] == "Overlapping":
                    # because the last value (timestamp) has no header, we need to access the value directly
                    timestamp = int(list(row.values())[2][0])
                    color = row["Value"][1:]  # for some reason the color begins with a colon
                    this_overlapping.append((color, timestamp))
                else:
                    this_server_dict[row["Parameter"]] = row["Value"]
        overlapping[this_user] = this_overlapping
    return overlapping, start_timestamps


def make_overlap_buckets(overlapping_list, tolerance=1000):
    """Group data from a single user's overlapping_list (given by
    parse_overlapping) into buckets. A new bucket is made when `tolerance`
    milliseconds go by without an overlapping data point.

    """
    pass


def get_overlap_locations(buckets, gazelog: str):
    """Attach locations to the overlapping start and end time from `buckets`.
    `buckets` is a single user's buckets; `gazelog` is that single user's
    gazelog."""
    pass

# def parse_gazelogs(gazelog_dict: dict):
#     pass
