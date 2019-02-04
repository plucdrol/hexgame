

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEX RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////



// Sole responsibility: drawing hexagons using the Renderer 

// CanvasDraw
// View
// Hex

function HexRenderer(canvas_draw, view, hexlayout) {
  this.renderer = new Renderer(canvas_draw, view); 
  this.hexlayout = hexlayout;
  this.view = view;
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
HexRenderer.p.drawHex = function(hex, style) {
  
  var corners = this.hexesToPoints(Hex.corners(hex));
  this.renderer.drawPolygon(corners,style);
};

//Draw a series of short lines
HexRenderer.p.drawHexOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  var corners = [];

  for (let outline = 0; outline<number_of_loops; outline++){

    var edges = edge_arrays[outline];

    for (var i=0;i<edges.length;i++){
      let corner = this.hexToPoint(edges[i].getPoint1() );
      corners.push( corner );
    }
    let corner = this.hexToPoint(edges[0].getPoint1() );
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

    range_style.line_width = 3;

  //draw the outline of the range
  this.drawHexOutline( outline,range_style);
}

//move this function down to hex renderer
// CALCULATING RECTANGLE FUNCTIONS!?
HexRenderer.p.getHexRectangleBoundaries = function() {

    var corners = this.renderer.view.getCorners();
   
    //find the corner hexes
    var toplefthex = Hex.round(this.pointToHex(corners.topleft));
    var toprighthex = Hex.round(this.pointToHex(corners.topright));
    var bottomlefthex = Hex.round(this.pointToHex(corners.bottomleft));
    var bottomrighthex = Hex.round(this.pointToHex(corners.bottomright));

    //define the limits of the iteration
    var qmin = Math.min( toplefthex.getQ(),    bottomrighthex.getQ(),
                         toprighthex.getQ(),   bottomlefthex.getQ());
    var qmax = Math.max( toplefthex.getQ(),    bottomrighthex.getQ(),
                         bottomlefthex.getQ(), toprighthex.getQ());
    var rmin = Math.min( toplefthex.getR(),    bottomrighthex.getR(),
                           toprighthex.getR(),   bottomlefthex.getR());
    var rmax = Math.max( toplefthex.getR(),    bottomrighthex.getR(),
                         toprighthex.getR(),   bottomlefthex.getR());
  
    var hex_rect = {
      qmin:qmin,
      qmax:qmax,
      rmin:rmin, 
      rmax:rmax
    };
    
    return hex_rect;
}










