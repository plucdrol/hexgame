

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEX RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////



// Sole responsibility: drawing hexagons using the canvas-draw tools


// CanvasDraw
// View
// Hex

function HexRenderer(canvas_draw, view, hexlayout, color_scheme) {
  this.renderer = new Renderer(canvas_draw, view); 
  this.hexlayout = hexlayout;
  this.color_scheme = color_scheme;
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

HexRenderer.p.mapColors = function(i) {
  return greenscale_colors(i, this.color_scheme);  
} 


// RENDERING FUNCTIONS
HexRenderer.p.drawHex = function(hex, style) {

  //if zoomed out enough, just draw a dot
  if (this.renderer.view.getScale() < 1) {

      var point = this.hexToPoint(hex);
      this.renderer.drawDot(point, 60, style);
  } else {
      //otherwise, draw the actual hex
      var corners = this.hexesToPoints(Hex.corners(hex));
      this.renderer.drawPolygon(corners,style);
  }

};

//Draw a series of short lines
HexRenderer.p.drawHexOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  for (let outline = 0; outline<number_of_loops; outline++){
    var corners = [];
    var edges = edge_arrays[outline];    
    for (var i=0;i<edges.length;i++){
      corners.push( this.hexToPoint(edges[i].getPoint1() ));
    }
    this.renderer.drawPolygon(corners,style);
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













var greenscale_colors = function (i, color_scheme) {


  if (color_scheme == 'space') {
    var spacescale = ['#000','#000','#ccc','#222','#222',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000',];
     return spacescale[i];
   }

  if (color_scheme == 'galaxy') {
    var galaxyscale = ['#000','#000','#dd0','#222','#222',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000',];
     return galaxyscale[i];
   }

     if (color_scheme == 'earth') {
      var greenscale = ['#005','#00D','#AA3','#080','#062',
                    '#052','#042','#032','#020','#010',
                    '#110','#210','#410','#420','#777',
                    '#777','#777','#888','#888','#888',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF'];
     return greenscale[i];
   }

      var greenscale = ['#005','#00D','#AA3','#080','#062',
                    '#052','#042','#032','#020','#010',
                    '#110','#210','#410','#420','#777',
                    '#777','#777','#888','#888','#888',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF'];

  var fadedscale = ['#335','#66D','#AA7','#686','#575',
                    '#464','#353','#242','#232','#232',
                    '#110','#321','#421','#432','#777',
                    '#777','#777','#888','#888','#888',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF'];
    return greenscale[i];


    
}

