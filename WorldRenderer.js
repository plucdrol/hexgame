
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
                                                                
           //WORLD RENDERER

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//Dependencies:
//  CanvasDraw
//  World
//  Unit
//  UnitController
//  View
//  Hex
//  HexRenderer

var greenscale_colors = function(i) {
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



function WorldRenderer (canvas_draw,view,world,unit_controller,color_scheme) {
  HexRenderer.call(this,canvas_draw,view,world.layout); 
  this.world = world;

  this.unit_controller = unit_controller;

  this.corners = [];

  this.ready_to_render = true;
}

WorldRenderer.prototype = Object.create(HexRenderer.prototype);
WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.clear = function() {
    this.canvas_draw.clear();
}

WorldRenderer.p.drawOutline = function(edge_arrays,style) {
    
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

WorldRenderer.p.drawHexMap = function(hexmap) {
  //get the array
  var hexarray = hexmap.getHexArray();

  //make a tile renderer
  var tile_renderer = new TileRenderer2D(this.canvas_draw,
                       this.view,this.world.layout);
  //draw the tiles of the array
  for (hex of hexarray) {
    
    //draw tile
    tile_renderer.drawTile(hex, this.getTile(hex));
    
    //draw units
    var this_unit = this.unit_controller.units.getValue(hex);

    if (typeof this_unit == 'object') {
        this.drawUnit(this_unit,hex,0);
    }
  }
}


// CALCULATING RECTANGLE FUNCTIONS!?
WorldRenderer.p.getHexRectangleBoundaries = function() {
   

    var corners = this.view.getCorners();

    //find the corner hexes
    var toplefthex = Hex.round(this.pointToHex(corners.topleft));
    var toprighthex = Hex.round(this.pointToHex(corners.topright));
    var bottomlefthex = Hex.round(this.pointToHex(corners.bottomleft));
    var bottomrighthex = Hex.round(this.pointToHex(corners.bottomright));

    //define the limits of the iteration
    var qmin = Math.min(toplefthex.getQ(),bottomrighthex.getQ(),
            toprighthex.getQ(),bottomlefthex.getQ());
    var qmax = Math.max(toplefthex.getQ(),bottomrighthex.getQ(),
            bottomlefthex.getQ(),toprighthex.getQ());
    var rmin = Math.min(toplefthex.getR(),bottomrighthex.getR(),
            toprighthex.getR(),bottomlefthex.getR());
    var rmax = Math.max(toplefthex.getR(),bottomrighthex.getR(),
            toprighthex.getR(),bottomlefthex.getR());
  
    var hex_rect = {
      qmin:qmin,
      qmax:qmax,
      rmin:rmin, 
      rmax:rmax
    };
    
    return hex_rect;
}

WorldRenderer.p.drawRedRenderingRectangle = function() {
    var object = this.view.getCorners();
    var corners = [];
    for (corner in object) {
      corners.push(corner);
    }
    var rect_style = new RenderStyle();
    rect_style.fill_color = 'transparent';
    rect_style.line_color = 'red';
    rect_style.line_width = 20;


    this.drawPolygon(corners,rect_style);
}    

WorldRenderer.p.drawWorld = function() {

  if (this.ready_to_render) {
    var rectMap = this.getHexRectangleBoundaries();

    //get the rectangular array of hex tiles

    let hexmap = this.world.map.getRectangleSubMap(rectMap.qmin,
						  rectMap.qmax,
                                                  rectMap.rmin, 
                                                  rectMap.rmax);
    this.drawRedRenderingRectangle();
    this.drawHexMap(hexmap);
  }
}



WorldRenderer.p.getTile = function(hex) {
    return this.world.map.getValue(hex);
}


WorldRenderer.p.drawUnit = function(unit,hex,height) {

  var position = this.hexToPoint(hex);
  position = position.offset(0,-height);
 
  var unit_style = new RenderStyle();
  unit_style.fill_color = unit.getComponent('color');
  let size = 10*unit.getComponent('size');
  this.drawDot(position, size, unit_style);
  
  if (unit.components.population != undefined) {
    let text_style = new RenderStyle();
    text_style.font_size = 25;
    let text = unit.components.population;      
    this.drawText(text, position, text_style);
  }
};


WorldRenderer.p.drawPath = function(range,destination) {
    
  //draw the path
  if (range.containsHex(destination)) {
    var hex_style = new RenderStyle();
    hex_style.fill_color = "rgba(200, 255, 200, 0.5)";
    hex_style.width = 2;

    this.drawHex(destination,hex_style);
        

    //calculate points of the hexes
    var hexes = pathfinder.destinationPathfind(range, destination);
    var points = [];
    for (var i = 0; i<hexes.length;i++) {
      points.push(this.hexToPoint(hexes[i]));
    }

    //draw on screen
    this.drawLines(points,3);
  }
}


