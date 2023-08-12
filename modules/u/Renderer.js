//-------1---------2---------3---------4---------5---------6---------7---------8



///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//   BASIC RENDERING FUNCTIONS
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

//Dependencies:
import CanvasDraw from './CanvasDraw.js'
import View from './View.js'

//this is a style for renderer
export function RenderStyle() {
  this.line_color = 'black';
  this.line_width = 0;
  this.fill_color = 'transparent';
  this.text_color = 'black';
  this.text_size = '12';
}

//this is a basic Renderer, it doesn't know about hexes!

export default function Renderer(canvas_element_id, view) {

    var canvas = document.getElementById(canvas_element_id);
    this.canvas = canvas;

    this.canvas_draw  = new CanvasDraw(canvas);

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
    let newsize = this.worldToScreen1D(size);
    var color = style.fill_color;

    this.canvas_draw.drawDot(coord, newsize, color);
};

Renderer.prototype.drawImage = function (image, point, size) {

  let coord = this.worldToScreen(point);
  let w = this.worldToScreen1D(size);
  let context = this.canvas_draw.canvas.getContext('2d');
  context.drawImage(image, coord.x-w/2, coord.y-w/2, w, w);

}


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
Renderer.prototype.drawText = function(text,position,style,center) {
  var coord = this.worldToScreen(position);
  var newfontsize = this.worldToScreen1D(style.text_size);
  var color = style.text_color;


  this.canvas_draw.drawText(text,coord,color,newfontsize,center);
};

//Draw multiple lines using the drawLine function
Renderer.prototype.drawLines = function(points,style, width) {
  for (var i=0;i<points.length-1;i++) {
      this.drawLine(points[i], points[i+1], style);
  }
};

//uses the view to render a section of the source canvas to the canvas
//but this section is wrong
Renderer.prototype.blitCanvas = function(source_canvas) {

  let context = this.canvas.getContext('2d');

  let input_size = this.view.getInputRect().size;
  let output_size = this.view.getOutputRect().size;
  let center = this.view.getCenter();


  let x = source_canvas.width/2  + center.x - this.view.screenToWorld1D(output_size.x/2);
  let y = source_canvas.height/2 + center.y - this.view.screenToWorld1D(output_size.y/2);
  let w = input_size.x;
  let h = input_size.y;

  context.drawImage(source_canvas, x, y, w, h, 0, 0, this.canvas.width, this.canvas.height );
}


Renderer.prototype.clear = function() {

  this.canvas_draw.clear();
}










