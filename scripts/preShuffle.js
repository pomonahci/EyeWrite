let pics = [
    // 21_present (72 items)
    ...Array(72).fill().map((_, i) => `21_present_${i + 1}.jpg`),

    // 21_absent (72 items)
    ...Array(72).fill().map((_, i) => `21_absent_${i + 1}.jpg`),

    // 35_present (72 items)
    ...Array(72).fill().map((_, i) => `35_present_${i + 1}.jpg`),

    // 35_absent (72 items)
    ...Array(72).fill().map((_, i) => `35_absent_${i + 1}.jpg`)
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
            let arrayIndex = counts[category].findIndex(count => count < 24);
            
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

