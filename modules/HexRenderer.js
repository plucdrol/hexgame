/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEX RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////



// Sole responsibility: drawing hexagons on a regular grid using the Renderer 


import CanvasDraw from './u/CanvasDraw.js'
import Hex from './u/Hex.js'
import {Point} from './u/Hex.js'
import {RenderStyle} from './u/Renderer.js'

export default function HexRenderer(renderer, hexlayout) {
  this.renderer = renderer; 
  this.hexlayout = hexlayout;

}

HexRenderer.p = HexRenderer.prototype;

// HEX AND POINT CONVERSION
HexRenderer.p.hexToPoint = function(hex) {
  return this.hexlayout.hexToPoint(hex);
}
HexRenderer.p.hexesToPoints = function(hexes) {
  var points = [];
  for (let hex of hexes) {                            
      points.push(this.hexToPoint(hex));
  }
  return points;
}
HexRenderer.p.pointToHex = function(point) {
  return this.hexlayout.pointToHex(point);
}

// RENDERING FUNCTIONS
HexRenderer.p.drawCenterLine = function(hex1, hex2, width, line_color, option) {
  var style = new RenderStyle();
  style.line_width = width;
  style.line_color = line_color; 
  var p1 = this.hexToPoint(hex1);
  var p2 = this.hexToPoint(hex2);

  if (option && option=='half only') {
    p2 = new Point( (p2.x+p1.x)/2 , (p2.y+p1.y)/2 );
  }

  if (option && option=='moving dots') {
    p2 = new Point( (p2.x+p1.x)/2 , (p2.y+p1.y)/2 );
    p1 = this.fractionalRandomPoint1(p1,p2);
    p2 = p1;
  }

  if (option && option=='moving dots backwards') {
    p2 = new Point( (p2.x+p1.x)/2 , (p2.y+p1.y)/2 );
    p1 = this.fractionalRandomPoint1(p2,p1);
    p2 = p1;
  }

  this.renderer.drawLine(p1,p2, style);

}

HexRenderer.p.drawImage = function(hex) {

  let world_point = this.hexToPoint(hex);

  
  //this.renderer.drawImage(this.wheat, world_point, 60);



}

HexRenderer.p.fractionalRandomPoint1 = function(p1, p2, first_half) {
  let f = (new Date().getTime()%3000)/3000;
  return new Point( ((1-f)*p2.x+f*p1.x) , ((1-f)*p2.y+f*p1.y) );

}

HexRenderer.p.fractionalRandomPoint2 = function(p1, p2) {
  
}

HexRenderer.p.drawLongLine = function(hex_array, width) {
  var style = new RenderStyle();
  style.line_width = width;
  style.line_color = 'white';
  style.fill_color = "";
  let self = this;
  let points = [];
  for (let i=0;i<hex_array.length;i++){
    points.push(this.hexToPoint(hex_array[i]));
  }
  this.renderer.drawLines(points, style, width);
}
HexRenderer.p.drawHex = function(hex, style) {
  

  //draw hex the normal way

  //get the corners, then draww a polygon
  var corners = this.hexesToPoints(Hex.corners(hex));
  this.renderer.drawPolygon(corners,style);

  return;

  //draw a rectangle instead
  var left = this.hexToPoint(hex); left.x -= 31;
  var right = this.hexToPoint(hex); right.x += 30;

  style.line_caps = 'butt'
  style.line_width = 53;
  style.line_color = style.fill_color;
  this.renderer.drawLine(left, right, style);

};

//Draw a series of short lines
HexRenderer.p.drawHexOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  var corners = [];

  for (let outline = 0; outline<number_of_loops; outline++){

    var edges = edge_arrays[outline];

    for (var i=0;i<edges.length;i++){
      let corner = this.hexToPoint(edges[i].getPoint1(0.9) );
      corners.push( corner );
    }
    let corner = this.hexToPoint(edges[0].getPoint1(0.9) );
    corner.breakLine = true; //used in complex polygons to know when to break the drawing loops
    corners.push( corner ); //add the first point again to close the loop
  }
  this.renderer.drawPolygon(corners,style);
};

HexRenderer.p.drawRange = function(range) {

  let hex_array = [];
  for (let hex of range.values().map(
    function(cell){return cell.coord;}
    )) {
    hex_array.push(hex);
  }

  this.drawHexes(hex_array);
}

//Render an array of hexes on the screen
HexRenderer.p.drawHexes = function(hex_array, range_style) {
  
  var outline = Hex.outline(hex_array);

  if (range_style === undefined) {
    var range_style = new RenderStyle();
    range_style.fill_color = "rgba(255,255,150, 0.2)";
    range_style.line_color = "rgba(255,255,100,1)";
  }

  range_style.line_width = 4;

  //draw the outline of the range
  this.drawHexOutline( outline,range_style);
}


HexRenderer.prototype.clear = function() {
  this.renderer.clear();
}








