let pics = ['21_present_1.jpg', '21_present_2.jpg', '21_present_3.jpg', '21_present_4.jpg', '21_present_5.jpg', '21_present_6.jpg', '21_present_7.jpg', '21_present_8.jpg', '21_present_9.jpg', '21_present_10.jpg', '21_present_11.jpg', '21_present_12.jpg',
    '21_absent_1.jpg', '21_absent_2.jpg', '21_absent_3.jpg', '21_absent_4.jpg', '21_absent_5.jpg', '21_absent_6.jpg', '21_absent_7.jpg', '21_absent_8.jpg', '21_absent_9.jpg', '21_absent_10.jpg', '21_absent_11.jpg', '21_absent_12.jpg',
    '35_present_1.jpg', '35_present_2.jpg', '35_present_3.jpg', '35_present_4.jpg', '35_present_5.jpg', '35_present_6.jpg', '35_present_7.jpg', '35_present_8.jpg', '35_present_9.jpg', '35_present_10.jpg', '35_present_11.jpg', '35_present_12.jpg',
    '35_absent_1.jpg', '35_absent_2.jpg', '35_absent_3.jpg', '35_absent_4.jpg', '35_absent_5.jpg', '35_absent_6.jpg', '35_absent_7.jpg', '35_absent_8.jpg', '35_absent_9.jpg', '35_absent_10.jpg', '35_absent_11.jpg', '35_absent_12.jpg'];

// Utility function to shuffle an array elements in random order
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

let shuffledImagesLength
var shuffledImages = [];
function shuffleImages() {
    // Shuffle the images array
    shuffledImages = shuffleArray(pics);
    console.log('Shuffled images:', shuffledImages);

    // Add the shuffled array to Firebase
    firebaseRef.child('shuffledImages').child('SG').set(shuffledImages)
    .then(() => {
        console.log('Shuffled array added to Firebase successfully');
    })
    .catch((error) => {
        console.error('Error adding shuffled array to Firebase:', error);
    });
}

