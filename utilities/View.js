//-------0---------1---------2---------3---------4---------5---------6---------8
//takes two vectors. Position is the top-left corner, 
//size is a vector across
function Rect(position, size) {
  this.position = position;
  this.size = size;
}

//The View is a coordinate transformation tool
//input:  universe coordinates
//output: screen coordinates

function View (canvas_element_id, initial_zoom_level) {

  var canvas = document.getElementById(canvas_element_id);

  if (initial_zoom_level == undefined) {
    var initial_zoom_level = 1;
  }
  var view_ratio = canvas.width/canvas.height;
  var initial_zoom = initial_zoom_level;
  var output = new Rect(new Point(0,0), 
                          new Point(canvas.width,canvas.height));

  var input = new Rect(  new Point(-canvas.width*initial_zoom,
                                     -canvas.height*initial_zoom),

                            new Point(canvas.width*initial_zoom*view_ratio,
                                     canvas.height*initial_zoom*view_ratio));



  //PRIVILEGED FUNCTIOONS

  this.getInputRect = function() {
      return input;
  }
  this.getOutputRect = function() {
      return output;
  }
  this.getCenter = function() {
      var x = input.position.x + input.size.x/2;
      var y = input.position.y + input.size.y/2;

      return new Point(x,y);
  }
  this.setCenter = function(point) {
      input.position.x = point.x-input.size.x/2;
      input.position.y = point.y-input.size.y/2;
  }

  this.resizeOutput = function(width,height) {

    var canvas_position = new Point(0,0);
    var canvas_size = new Point(width,height);

    //create the view in the same position
    var view_out = new Rect(canvas_position, canvas_size);
    var view_in = input;

    var x_scaling = output.size.x / width;
    var y_scaling = output.size.y / height;

    //match the aspect ratio to the new size
    view_in.size.x = view_in.size.x / x_scaling ;
    view_in.size.y = view_in.size.y / y_scaling ;

    //apply the view to
    input = view_in;
    output = view_out;
  }

  this.worldToScreen = function(point) {

    var newPoint = new Point(0,0);

    newPoint.x = (point.x - input.position.x)*
                  output.size.x/input.size.x;
    newPoint.y = (point.y - input.position.y)*
                  output.size.y/input.size.y;

    return newPoint;
  };

  this.screenToWorld = function(point) {

    var newPoint = new Point(0,0);

    newPoint.x = (point.x * input.size.x/output.size.x) +
                  input.position.x ;
    newPoint.y = (point.y * input.size.y/output.size.y) 
                  + input.position.y ;

      return newPoint;
  };

  this.screenToWorld1D = function(scalar) {
      return scalar * input.size.x/output.size.x;
  };
  this.worldToScreen1D = function(scalar) {
      return scalar*output.size.x/input.size.x;
  };

  this.shiftPosition = function(point) {
      input.position.x += point.x;
      input.position.y += point.y;
  };

  this.setPosition = function(point) { 
      input.position = point; 
  };

  this.getZoom = function() {
    return output.size.x/input.size.x;
  }

  this.zoom = function(n) {

      var center_point = this.getCenter();

      //scales the view by n but keeps the screen centered 
      //on the same location
      var w = input.size.x;
      var h = input.size.y;

      input.size = new Point( w*n , h*n );
      this.setCenter(center_point);
  };

  this.getScale = function() { 
      return output.size.x / input.size.x; 
  };

  this.getCorners = function() {

    //find the screen position and width
    var x = input.position.x;
    var y = input.position.y;
    var height = input.size.y;
    var width = input.size.x;

    //find the boundaries
    var left = x; 
    var right = x+width;
    var top = y;
    var bottom = y+height;

    //find the corner points
    var corners = {};
    corners.topleft = new Point(left,top);
    corners.topright = new Point(right,top);
    corners.bottomleft = new Point(left,bottom);
    corners.bottomright = new Point(right,bottom);

    return corners;
  }
};

