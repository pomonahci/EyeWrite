const config = {
    container: document.querySelector('#heatmap'),
    radius: 10,
    maxOpacity: .5,
    minOpacity: 0,
    blur: .75
}

var heatmapInstance = h337.create(config);

//   var testData = {
//     max: 3,
//     data: [{
//         lat: 48.3333,
//         lng: 16.35,
//         count: 100
//     }, {
//         lat: 51.465558,
//         lng: 0.010986,
//         count: 100
//     }, {
//         lat: 33.5363,
//         lng: -5.044,
//         count: 100
//     }]
// };

// heatmapInstance.setData(testData);

// var dataPoint = {
//     x: 5, // x coordinate of the datapoint, a number
//     y: 5, // y coordinate of the datapoint, a number
//     value: 100 // the value at datapoint(x, y)
// };

// var data = {
//     max: 100,
//     min: 0,
//     data: [
//       dataPoint, dataPoint, dataPoint, dataPoint
//     ]
// };
// heatmapInstance.setData(data);


// heatmapInstance.addData({x: 100, y: 100, value: 100});
document.addEventListener('mousemove', (event) => {


    let cx = event.clientX, cy = event.clientY;

    console.log(`(${cx},${cy})`);

    heatmapInstance.addData({x: cx || 0, y: cy, value: 100});
    // console.log(heatmapInstance.getDataURL);
    heatmapInstance.repaint();
})