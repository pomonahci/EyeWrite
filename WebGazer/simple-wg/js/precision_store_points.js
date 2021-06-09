/*
 * Sets store_points to true, so all the occuring prediction
 * points are stored
 */
function store_points_variable(){
    store_points_var = true;
  }
  
  /*
   * Sets store_points to false, so prediction points aren't
   * stored any more
   */
  function stop_storing_points_variable(){
    store_points_var = false;
  }
  
  /*
   * Returns the stored tracker prediction points
   */
  function get_points() {
    var pastPoints = new Array(2);
    pastPoints[0] = xPastPoints;
    pastPoints[1] = yPastPoints;
    return pastPoints;
  }  

  function get_points2(){
    var pastPoints = new Array(2);
    pastPoints[0] = xPastPoints2;
    pastPoints[1] = yPastPoints2;
    return pastPoints;
  }  