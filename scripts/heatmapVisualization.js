const config = {
    container: document.querySelector('#heatmap'),
    // container: document.querySelector('html'),
    radius: 20,
    maxOpacity: .75,
    minOpacity: 0,
    blur: .85,
    // gradient: {
    //     // enter n keys between 0 and 1 here
    //     // for gradient color customization
    //     '.5': 'blue',
    //     '.1': 'red',
    //     '.35': 'white',
    //     '.15': 'yellow',
    //     '.05': 'pink',
    //     '.65': 'violet'
    //   }
}

var heatmapInstance = h337.create(config);

document.addEventListener('mousemove', (event) => {


    let cx = event.clientX, cy = event.clientY;

    console.log(`(${cx},${cy})`);

    heatmapInstance.addData({x: cx, y: cy, value: 100});
})