const fs = require('fs');

function saveShuffledImagesToJSON(condition) {
    let pics = [
        ...Array(72).fill().map((_, i) => `21_present_${i + 1}.jpg`),
        ...Array(72).fill().map((_, i) => `21_absent_${i + 1}.jpg`),
        ...Array(72).fill().map((_, i) => `35_present_${i + 1}.jpg`),
        ...Array(72).fill().map((_, i) => `35_absent_${i + 1}.jpg`)
    ];

    let warmup = [
        ...Array(3).fill().map((_, i) => `warmup_21_present_${i + 1}.jpg`),
        ...Array(3).fill().map((_, i) => `warmup_21_absent_${i + 1}.jpg`),
        ...Array(3).fill().map((_, i) => `warmup_35_present_${i + 1}.jpg`),
        ...Array(3).fill().map((_, i) => `warmup_35_absent_${i + 1}.jpg`)
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

    let shuffledImages = distributeImages(pics);
    let warmupShuffle = distributeImages(warmup);

    const map = {0: 'G', 1: 'V', 2: 'B'};

    let result = {
        warmup: {},
        main: {}
    };

    warmupShuffle.forEach((array, index) => {
        result.warmup[`${map[index]}_warmup`] = array;
    });

    shuffledImages.forEach((array, index) => {
        result.main[map[index]] = array;
    });

    const jsonContent = JSON.stringify(result, null, 2);
    
    fs.writeFile(`shuffle/images.json`, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error("An error occurred while writing JSON Object to File.");
            return console.error(err);
        }
        console.log(`JSON file has been saved`);
    });
}

// Usage
saveShuffledImagesToJSON();
