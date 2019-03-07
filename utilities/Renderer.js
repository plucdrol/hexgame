//-------1---------2---------3---------4---------5---------6---------7---------8



///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//   BASIC RENDERING FUNCTIONS
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

//Dependencies:
//  CanvasDraw.js
//  View.js

//this is a style for renderer
function RenderStyle() {
  this.line_color = 'black';
  this.line_width = 0;
  this.fill_color = 'transparent';
  this.text_color = 'black';
  this.text_size = '12';
}

//this is a basic Renderer, it doesn't know about hexes!
function Renderer(canvas_draw, view) {
    this.canvas_draw = canvas_draw;
    this.view = view;

    this.ready_to_render = true;
    this.render_timer = {};
}

//Coordinate transformation
Renderer.prototype.worldToScreen = function(point) {
  return this.view.worldToScreen(point);
}
Renderer.prototype.worldToScreen1D = function(scalar) {
  return this.view.worldToScreen1D(scalar);
}


//PURE functions, directly draw on the screen
Renderer.prototype.drawDot = function (point,size,style) {

    var coord = this.worldToScreen(point);
    newsize = this.worldToScreen1D(size);
    var color = style.fill_color;

    this.canvas_draw.drawDot(coord, newsize, color);
};

//Transform coordinates and draw a line using CanvasDraw
Renderer.prototype.drawLine=function(point1,point2,style) {

  var p1 = this.worldToScreen(point1);
  var p2 = this.worldToScreen(point2);
  var newwidth = this.worldToScreen1D(style.line_width);
  var color = style.line_color;

  this.canvas_draw.drawLine(p1, p2, newwidth, color);
};

//Transform coordinates and draw a polyon using CanvasDraw
Renderer.prototype.drawPolygon = function(points,style) {
  var coords = []; //creates an array 
  
  //otherwise actually draw a polygon
  for (let point of points) {
    let coord = this.worldToScreen(point);
    if (point.breakLine != undefined) 
      coord.breakLine = point.breakLine;
    coords.push(coord);
  }

  this.canvas_draw.drawPolygon(coords,style.line_width,
    style.fill_color,style.line_color);

};

//Transform coordinatess and draw text using CanvasDraw
Renderer.prototype.drawText = function(text,position,style) {
  var coord = this.worldToScreen(position);
  var newfontsize = this.worldToScreen1D(style.text_size);
  var color = style.text_color;

  this.canvas_draw.drawText(text,coord,color,newfontsize);
};

//Draw multiple lines using the drawLine function
Renderer.prototype.drawLines = function(points,style, width) {
  for (var i=0;i<points.length-1;i++) {
      this.drawLine(points[i], points[i+1], style);
  }
};

Renderer.prototype.drawRedRenderingRectangle = function() {
    var object = this.view.getCorners();
    
    var corners = [];
    corners.push(object.topleft);
    corners.push(object.topright);
    corners.push(object.bottomright);
    corners.push(object.bottomleft);

    var rect_style = new RenderStyle();
    rect_style.fill_color = 'transparent';
    rect_style.line_color = 'red';
    rect_style.line_width = 20;

    this.drawPolygon(corners,rect_style);
}

Renderer.prototype.getViewCorners = function() {

    return this.view.getCorners();

}

Renderer.prototype.getScale = function() {

    return this.view.getScale();

}













