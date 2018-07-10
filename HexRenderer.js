

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEX RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// CanvasDraw
// View
// Hex

function HexRenderer(canvas_draw, view, hexlayout) {
  Renderer.call(this, canvas_draw, view); 
  this.hexlayout = hexlayout;
}

HexRenderer.prototype = Object.create(Renderer.prototype);
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

HexRenderer.p.mapColors = function(i) {
  return greenscale_colors(i);  
} 


// RENDERING FUNCTIONS
HexRenderer.p.drawHex = function(hex, style) {

  //if zoomed out enough, just draw a dot
  if (this.view.getScale() < 1) {

      var point = this.hexToPoint(hex);
      this.drawDot(point, 60, style);
  } else {
      //otherwise, draw the actual hex
      var corners = this.hexesToPoints(Hex.corners(hex));
      this.drawPolygon(corners,style);
  }

};

//Draw a series of short lines
HexRenderer.p.drawOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  for (let outline = 0; outline<number_of_loops; outline++){
    var corners = [];
    var edges = edge_arrays[outline];    
    for (var i=0;i<edges.length;i++){
      corners.push( this.hexToPoint(edges[i].getPoint1() ));
    }
    this.drawPolygon(corners,style);
  }
};

HexRenderer.p.drawRange = function(range) {

  let hex_array = [];
  console.log(range.values());
  for (let hex of range.values().map(
    function(cell){return cell.coord;}
    )) {
    hex_array.push(hex);
  }

  this.drawHexes(hex_array);
}

//Render an array of hexes on the screen
HexRenderer.p.drawHexes = function(hex_array) {
  
  var outline = Hex.outline(hex_array);

  var range_style = new RenderStyle();
  range_style.fill_color = "rgba(255,255,150, 0.2)";
  range_style.line_width = 3;
  range_style.line_color = "rgba(255,255,100,1)";

  //draw the outline of the range
  this.drawOutline( outline,range_style);
}

/*
HexRenderer.p.drawHexMap = function(hexmap) {
  //get the array
  var hexarray = hexmap.getHexArray();

  //make a tile renderer
  //var tile_renderer = new TileRenderer2D();
  //draw the tiles of the array
  for (hex of hexarray) {
    this.drawTile2D(hex);
    //tile_renderer.drawTile(hex);
  }
}*/