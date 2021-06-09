// const e = require("express");

/**
 * (x,y) coordinate representing a destination point for a target
 * @param {*} x proportion representing how far left across the window the point is
 * @param {*} y proportion representing how far down the window the point is
 */
const TargetPoint = function(xProp, yProp) {
    this.x = xProp * window.innerWidth;
    this.y = yProp * window.innerHeight;
}

/**
 * Used for movement calculations
 * @param {*} magnitude 
 * @param {*} angle 
 */
function Vector(magnitude, angle) {
    this.magnitudeX = magnitude * Math.cos(angle);
    this.magnitudeY = magnitude * Math.sin(angle);
}

/**
 * Class that handles an array of targetpoints and moves to them smoothly in reverse order.
 * Note: Make sure www/css/targets.css is added to the head of whatever page you use this on.
 */
class Targets {
    /**
     * @param {*} points array of TargetPoint objects, popped out in reverse order
     * @param {*} mode data collection mode, 'calibration' or 'error'
     * @param {*} num if 'calibration': number of data points to collect at each TargetPoint;
     *                if 'error': number of distance errors to calculate at each TargetPoint
     */
    constructor (points, mode, num) {
        this.points = [...points]; // clone points
        this.numMeasurementsPerPoint = num;

        switch(mode) {
            case 'calibration':
                this.calibrationMode = true;
                this.measurements2 = [];
                break;
            case 'error':
                this.measurements = [];
                this.calibrationMode = false;
                break;
        }

        this.target = document.createElement("div");
        this.target.id = "target";
        document.body.appendChild(this.target);
    
        this.dot = document.createElement("div");
        this.dot.id = "dot";
        this.target.appendChild(this.dot);
    
        this.target.style.left = "0px";
        this.target.style.top = "0px";
    
        this.targetX = parseInt(this.target.style.left);
        this.targetY = parseInt(this.target.style.top);

        // Prepare for movement
        this.lastTimeMove = 0;
        // this.moving = false;

        // Bind moveFrame to maintain scope when calling requestAnimationFrame
        this.moveFrame = this.moveFrame.bind(this);
    }

    /**
     * Start moving Target to points
     */
    start() {
        // this.interval = setInterval(()=>(this.moveToPoints(points)), 5000);
        webgazer.params.showGazeDot = false;
        this.moveToPoints();
    }

    end() {
        webgazer.params.showGazeDot = true;
        this.target.removeChild(this.dot);
        document.body.removeChild(this.target);
    }
    
    /**
     * Moves target to a series of points
     * 
     * @param {array} points a "stack" of coordinates
     */
    moveToPoints() {
        // While there are points remaining, continue to move the target
        if (this.points.length > 0) {
            var dest = this.points.pop();
            this.moveTargetToPoint(dest.x, dest.y);
        }
        // If no more points remain
        else {
            // Pause for 250 ms
            this.sleep(250).then(()=> {
                // clear graphics
                this.end();
                 // Pause for 250 ms
                this.sleep(250).then(()=>{
                    // If in calibration mode, then calculate ridge regression after collecting all data pts
                    if (this.calibrationMode) {
                        console.log("regressing");
                        webgazer.getRegression()[0].train();
                        // console.log(webgazer.getRegression()[0].dataClicks.data);
                        var results = webgazer.getCalibrationPredictions(webgazer.getRegression()[0]);
                        var count1 = 0;
                        var count2 = 0;
                        for (var i=0;i<results.length;i++){
                            this.measurements2[count2].xPredArray[count1]=results[i].x;
                            this.measurements2[count2].yPredArray[count1]=results[i].y;
                            count1++;
                            if (count1 == this.numMeasurementsPerPoint){
                                count1 = 0;
                                count2++;
                            }
                        }
                        this.displayError(this.measurements2);

                    }
                    // If in error measurement mode, spit out all error measurements in a CSV formatted string
                    else {
                        console.log("calculating error");
                        var out = [];
                        out.push("actualX,actualY,predictedX,predictedY");
                        this.measurements.forEach((item, index) => {
                            // console.log(item);
                            for (var i = 0; i < item.xPredArray.length; i++) {
                                out.push(`${item.x},${item.y},${item.xPredArray[i]},${item.yPredArray[i]}`)
                            }
                        });
                        console.log(out.join('\n'));
                        this.displayError(this.measurements);
                    }
                })
            })
        }
    }

    /**
     * Called to move target to a given (x,y) coord
     * @param {*} x 
     * @param {*} y 
     */
    moveTargetToPoint(x, y) {
        // this.moving = true;
    
        this.lastTimeMove = 0;

        // Get current position
        this.targetX = parseInt(this.target.style.left);
        this.targetY = parseInt(this.target.style.top);

        this.destX = x;
        this.destY = y;

        // Start animation
        window.requestAnimationFrame(this.moveFrame);
    }

    /**
     * Callback for requestAnimationFrame
     * 
     * @param {*} ms elapsed time in ms, similar to performance.now(), passed in by requestAnimationFrame
     */
    moveFrame(ms) {
        var elapsed;
        
        // If we are beginning a new path to a dest, then we want to start the speed
        // (and therefore the elapsed time) out at 0
        if (this.lastTimeMove == 0) {
            elapsed = 0;
        } else {
            elapsed = ms - this.lastTimeMove;
        }
        this.lastTimeMove = ms;

        // Move target based on how long has passed since last tick
        this.moveTarget(elapsed);

        // Move until we are within 0.5px of the destination, then pulse the target.
        if (Math.abs(this.targetX - this.destX) >= 0.5 || Math.abs(this.targetY - this.destY) >= 0.5) {
            window.requestAnimationFrame(this.moveFrame);
        } else {
            // this.moving = false;
            this.pulseTarget();
            console.log("stopped");
        }
    }

    /**
     * One tick of movement
     * 
     * @param {*} ms elapsed time
     */
    moveTarget(ms) {
        // Get distance and angle between current and destination position
        var between = this.calcDistAndAngle(this.targetX, this.targetY, this.destX, this.destY);

        // Calculate velocity based on distance, and create the vector
        var velocity = between.dist / 0.4;
        var vector = new Vector(velocity, between.angle);
        var elapsedSeconds = ms / 1000;

        // Move target in Vector direction based on time elapsed
        this.targetX += (vector.magnitudeX * elapsedSeconds);
        this.targetY += (vector.magnitudeY * elapsedSeconds);

        // Update target
        this.target.style.left = Math.round(this.targetX) + "px";
        this.target.style.top = Math.round(this.targetY) + "px";
    }

    /**
     * Activates target pulsing and, upon finishing, triggers movement to the next TargetPoint
     */
    pulseTarget() {
        // Activate pulsing
        this.target.className = "pulsing";
        
        // Wait for the target to stop shrinking
        this.sleep(750).then(() => {
            // Calls either recordCalibrations or recordData based on the passed parameter
            this.calibrationMode ? this.recordCalibrations(0) : this.recordErrors(0, this.destX, this.destY);
            
            // Wait until done collecting data (1500ms) and target back to initial size (250ms)
            this.sleep(1750).then(() => {
                // Remove animation
                this.target.className = "none";

                // If in error measurement mode, clear canvas
                if (!this.calibrationMode) {
                    var canvas = document.getElementById("plotting_canvas");
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                }

                // Go to next point
                this.moveToPoints();
            });
        });
    }

    /**
     * Records 5 calibration points
     * @param {*} count start this at 0, counts up to 5
     */
    recordCalibrations = async function(count) {
        if (count < this.numMeasurementsPerPoint) {
            webgazer.recordScreenPosition(this.destX, this.destY);
            count++;
            setTimeout(()=>{this.recordCalibrations(count)}, 200);
        }
        else{
            this.measurements2.push({x: this.destX, y: this.destY, xPredArray:new Array(this.numMeasurementsPerPoint), yPredArray:new Array(this.numMeasurementsPerPoint)});
        }
    }

    /**
     * 
     * @param {*} count 
     */
    recordErrors = async function(count, x, y) {
        adjust_num_stored_points(this.numMeasurementsPerPoint);
        store_points_variable();
        this.sleep(1500).then(() => {
            var pts = get_points();
            this.measurements.push({
                x: x,
                y: y,
                xPredArray: pts[0],
                yPredArray: pts[1]
            });
            stop_storing_points_variable();
        });
    }

    /**
     * Given start and end (x,y) coords, gives the distance and angle in radians
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} x2 
     * @param {*} y2 
     */
    calcDistAndAngle(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;

        return {
            // pythagorean
            dist: Math.sqrt(dx * dx + dy * dy),
            // angle in radians
            angle: Math.atan2(dy, dx)
        }
    }

    /**
     * simple implementation of sleep
     * @param {*} milliseconds 
     */
    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    displayError(measurements){
        var ratios = 0;
        var distance = 0;
        measurements.forEach((item, index) => {
            // console.log(item);
            var m;
            var px1;
            var py1;
            var px2;
            var py2;
            var length;
            var b;
            for (var i = 0; i < item.xPredArray.length; i++) {
                // out.push(`${item.x},${item.y},${item.xPredArray[i]},${item.yPredArray[i]}`)
                distance += Math.sqrt((item.x-item.xPredArray[i])**2 + (item.y - item.yPredArray[i])**2);
                if (item.x == item.xPredArray[i]){//if x values are the same, take a vertical line
                    length = window.innerHeight;
                }
                else if (item.y == item.yPredArray[i]){//if y values are the same, take a horizontal line
                    length = window.innerWidth;
                }
                else{
                    m = (item.y-item.yPredArray[i])/(item.x - item.xPredArray[i]);
                    b = item.y-(m*item.x);
                    
                    py1 = 0;
                    py2 = window.innerHeight;
                    px1 = (py1-b)/m;
                    px2 = (py2-b)/m;

                    if (px1 < px2){
                        if ( px1 < 0 || px1 > window.innerWidth){
                            px1 = 0;
                            py1 = b;
                        }
                        if ( px2 < 0 || px2 > window.innerWidth){
                            px2 = window.innerWidth;
                            py2 = px2 * m + b;
                        }
                    }
                    else {
                        if ( px1 < 0 || px1 > window.innerWidth){
                            px1 = window.innerWidth;
                            py1 = px1*m + b;
                        }
                        if ( px2 < 0 || px2 > window.innerWidth){
                            px2 = 0;
                            py2 =  b;
                        }
                    }
                    length = Math.sqrt((px1-px2)**2 + (py1-py2)**2);
                }
                // console.log("length: "+ length);
                // console.log("distance: "+ Math.sqrt((item.x-item.xPredArray[i])**2 + (item.y-item.yPredArray[i])**2));
                // console.log("ratio: " +  (Math.sqrt((item.x-item.xPredArray[i])**2 + (item.y-item.yPredArray[i])**2))/length);
                ratios += (Math.sqrt((item.x-item.xPredArray[i])**2 + (item.y-item.yPredArray[i])**2))/length;
            }
        });
        distance = distance / (measurements.length*this.numMeasurementsPerPoint);
        var result = 100 - Math.floor((ratios/(measurements.length*this.numMeasurementsPerPoint)) * 100);
        var results = "Your accuracy percentage between the target and trained model prediction is: " + result + "%. \n Your pixel distance error is "+ Math.floor(distance)+"p.";
        document.getElementById("resultsDisp").innerHTML = results;
        document.getElementById("resultsDisp").style.visibility = "visible";
    }
}

