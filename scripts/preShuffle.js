let pics = [
    '21_present_1.jpg', '21_present_2.jpg', '21_present_3.jpg', '21_present_4.jpg', '21_present_5.jpg', '21_present_6.jpg', '21_present_7.jpg', '21_present_8.jpg', '21_present_9.jpg', '21_present_10.jpg', '21_present_11.jpg', '21_present_12.jpg', '21_present_13.jpg', '21_present_14.jpg', '21_present_15.jpg', '21_present_16.jpg', '21_present_17.jpg', '21_present_18.jpg', '21_present_19.jpg', '21_present_20.jpg', '21_present_21.jpg', '21_present_22.jpg', '21_present_23.jpg', '21_present_24.jpg', '21_present_25.jpg', '21_present_26.jpg', '21_present_27.jpg', '21_present_28.jpg', '21_present_29.jpg', '21_present_30.jpg', '21_present_31.jpg', '21_present_32.jpg', '21_present_33.jpg', '21_present_34.jpg', '21_present_35.jpg', '21_present_36.jpg',
    '21_absent_1.jpg', '21_absent_2.jpg', '21_absent_3.jpg', '21_absent_4.jpg', '21_absent_5.jpg', '21_absent_6.jpg', '21_absent_7.jpg', '21_absent_8.jpg', '21_absent_9.jpg', '21_absent_10.jpg', '21_absent_11.jpg', '21_absent_12.jpg', '21_absent_13.jpg', '21_absent_14.jpg', '21_absent_15.jpg', '21_absent_16.jpg', '21_absent_17.jpg', '21_absent_18.jpg', '21_absent_19.jpg', '21_absent_20.jpg', '21_absent_21.jpg', '21_absent_22.jpg', '21_absent_23.jpg', '21_absent_24.jpg', '21_absent_25.jpg', '21_absent_26.jpg', '21_absent_27.jpg', '21_absent_28.jpg', '21_absent_29.jpg', '21_absent_30.jpg', '21_absent_31.jpg', '21_absent_32.jpg', '21_absent_33.jpg', '21_absent_34.jpg', '21_absent_35.jpg', '21_absent_36.jpg',
    '35_present_1.jpg', '35_present_2.jpg', '35_present_3.jpg', '35_present_4.jpg', '35_present_5.jpg', '35_present_6.jpg', '35_present_7.jpg', '35_present_8.jpg', '35_present_9.jpg', '35_present_10.jpg', '35_present_11.jpg', '35_present_12.jpg', '35_present_13.jpg', '35_present_14.jpg', '35_present_15.jpg', '35_present_16.jpg', '35_present_17.jpg', '35_present_18.jpg', '35_present_19.jpg', '35_present_20.jpg', '35_present_21.jpg', '35_present_22.jpg', '35_present_23.jpg', '35_present_24.jpg', '35_present_25.jpg', '35_present_26.jpg', '35_present_27.jpg', '35_present_28.jpg', '35_present_29.jpg', '35_present_30.jpg', '35_present_31.jpg', '35_present_32.jpg', '35_present_33.jpg', '35_present_34.jpg', '35_present_35.jpg', '35_present_36.jpg',
    '35_absent_1.jpg', '35_absent_2.jpg', '35_absent_3.jpg', '35_absent_4.jpg', '35_absent_5.jpg', '35_absent_6.jpg', '35_absent_7.jpg', '35_absent_8.jpg', '35_absent_9.jpg', '35_absent_10.jpg', '35_absent_11.jpg', '35_absent_12.jpg', '35_absent_13.jpg', '35_absent_14.jpg', '35_absent_15.jpg', '35_absent_16.jpg', '35_absent_17.jpg', '35_absent_18.jpg', '35_absent_19.jpg', '35_absent_20.jpg', '35_absent_21.jpg', '35_absent_22.jpg', '35_absent_23.jpg', '35_absent_24.jpg', '35_absent_25.jpg', '35_absent_26.jpg', '35_absent_27.jpg', '35_absent_28.jpg', '35_absent_29.jpg', '35_absent_30.jpg', '35_absent_31.jpg', '35_absent_32.jpg', '35_absent_33.jpg', '35_absent_34.jpg', '35_absent_35.jpg', '35_absent_36.jpg'
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function distributeImages(pics) {
    let shuffled = shuffleArray(pics);
    let result = [[], [], []];
    let counts = {
        '21_present': [0, 0, 0],
        '35_present': [0, 0, 0],
        '21_absent_': [0, 0, 0],
        '35_absent_': [0, 0, 0]
    };

    for (let img of shuffled) {
        let category = img.substring(0, 10);
        if (counts.hasOwnProperty(category)) {
            let arrayIndex = counts[category].findIndex(count => count < 12);
            
            if (arrayIndex !== -1) {
                result[arrayIndex].push(img);
                counts[category][arrayIndex]++;
            }
        } else {
            console.log(`Unexpected image format: ${img}`);
        }
    }

    return result;
}




function shuffleImages() {
    // Shuffle the images array
    let shuffledImages = distributeImages(pics);
    console.log(shuffledImages.map(arr => arr.length));
    const map = {0: 'SG', 1: 'SV', 2: 'SG + SV'};

    // Check if the 'shuffledImages' child already exists in Firebase
    firebaseRef.child('shuffledImages').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                // Add the shuffled array to Firebase
                shuffledImages.forEach((array, index) => {
                    firebaseRef.child('shuffledImages').child(map[index]).set(array)
                        .then(() => {
                            console.log(`Array ${index} added to Firebase successfully`);
                        })
                        .catch((error) => {
                            console.error(`Error adding array ${index} to Firebase:`, error);
                        });      
                });
            } else {
                console.log("'shuffledImages' child already exists in Firebase");
            }
        })
        .catch((error) => {
            console.error("Error checking if 'shuffledImages' child exists in Firebase:", error);
        });

}

