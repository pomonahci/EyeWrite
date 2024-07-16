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

let warmup = [
    // 2 warmup trials per category
    ...Array(3).fill().map((_, i) => `warmup_21_present_${i + 1}.jpg`),
    ...Array(3).fill().map((_, i) => `warmup_21_absent_${i + 1}.jpg`),
    ...Array(3).fill().map((_, i) => `warmup_35_present_${i + 1}.jpg`),
    ...Array(3).fill().map((_, i) => `warmup_35_absent_${i + 1}.jpg`)
]

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
        let warmup = img.substring(7, 17);
        if (counts.hasOwnProperty(category)) {
            let arrayIndex = counts[category].findIndex(count => count < 24);
            
            if (arrayIndex !== -1) {
                result[arrayIndex].push(img);
                counts[category][arrayIndex]++;
            }
        } else {
            if(counts.hasOwnProperty(warmup)){
                let arrayIndex = counts[warmup].findIndex(count => count < 1);
                if(arrayIndex !== -1){
                    result[arrayIndex].push(img);
                    counts[warmup][arrayIndex]++;
                }
            }else{
                console.log(`Unexpected image format: ${img}`);
            }
        }
    }

    return result;
}




function shuffleImages() {
    // Shuffle the images array
    let shuffledImages = distributeImages(pics);
    let warmupShuffle = distributeImages(warmup);
    console.log(warmupShuffle);
    const map = {0: 'SG', 1: 'SV', 2: 'SG + SV'};

    // Check if the 'shuffledImages' child already exists in Firebase
    firebaseRef.child('shuffledImages').once('value')
    .then((snapshot) => {
        if (!snapshot.exists()) {
            // Corrected reference and initiate all set operations, including warmup, simultaneously
            const promises = [];
            warmupShuffle.forEach((array, index) => {
                promises.push(firebaseRef.child('shuffledImages').child(`${map[index]}_warmup`).set(array));
            });

            shuffledImages.forEach((array, index) => {
                promises.push(firebaseRef.child('shuffledImages').child(map[index]).set(array));
            });

            // Wait for all set operations to complete
            Promise.all(promises).then(() => {
                console.log('All images added to Firebase successfully');
            }).catch((error) => {
                console.error('Error adding images to Firebase:', error);
            });
        } else {
            console.log("'shuffledImages' child already exists in Firebase");
        }
    })
    .catch((error) => {
        console.error("Error checking if 'shuffledImages' child exists in Firebase:", error);
    });
}