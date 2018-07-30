
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

function WorldRenderer (canvas_draw, world, unit_controller, view, color_scheme) {
  
  this.hex_renderer = new HexRenderer(canvas_draw, view, world.layout);
  if (color_scheme != undefined) {
    this.color_scheme = color_scheme;
  }

  this.view = view;
  this.world = world;
  this.unit_controller = unit_controller;

  this.ready_to_render = true;
}

WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.clear = function() {
    this.hex_renderer.renderer.canvas_draw.clear();
}

WorldRenderer.p.calculateHexesToRender = function() {
  var rectMap = this.hex_renderer.getHexRectangleBoundaries( this.hex_renderer.renderer.view.getCorners() );
  //get the rectangular array of hex tiles
  let hexmap = this.world.map.getRectangleSubMap( rectMap.qmin,
                                                  rectMap.qmax,
                                                  rectMap.rmin, 
                                                  rectMap.rmax);
   return hexmap;
}
    

WorldRenderer.p.drawWorld = function() {

  if (this.ready_to_render) {
    var hexmap = this.calculateHexesToRender();
    //this.hex_renderer.renderer.drawRedRenderingRectangle();
    this.drawHexMap(hexmap);
    
  }
}

WorldRenderer.p.drawHexMap = function(hexmap) {
  //get the array
  var hexarray = hexmap.getHexArray();

  //make a tile renderer
  var tile_renderer = new TileRenderer2D(
                       this.hex_renderer.renderer.canvas_draw,
                       this.hex_renderer.renderer.view,
                       this.world.layout,
                       this.color_scheme);
  //draw the tiles of the array
  for (hex of hexarray) {
    
    //draw tile
    tile_renderer.drawTile(hex, this.getTile(hex));
    
    //draw units
    var this_unit = this.unit_controller.getUnit(hex);

    if (typeof this_unit == 'object') {
        this.drawUnit(this_unit,hex,0);
    }
  }
}

WorldRenderer.p.getTile = function(hex) {
    return this.world.map.getValue(hex);
}


WorldRenderer.p.drawUnit = function(unit,hex,height) {

  var position = this.hex_renderer.hexToPoint(hex);
  position = position.offset(0,-height);
 
  var unit_style = new RenderStyle();
  unit_style.fill_color = unit.getComponent('color');
  let size = 10*unit.getComponent('size');
  this.hex_renderer.renderer.drawDot(position, size, unit_style);
  
  if (unit.components.population != undefined) {
    let text_style = new RenderStyle();
    text_style.font_size = 25;
    let text = unit.components.population;      
    this.hex_renderer.renderer.drawText(text, position, text_style);
  }
};


WorldRenderer.p.drawPath = function(range,destination) {
    
  //draw the path
  if (range.containsHex(destination)) {
    var hex_style = new RenderStyle();
    hex_style.fill_color = "rgba(200, 255, 200, 0.5)";
    hex_style.width = 2;

    this.hex_renderer.drawHex(destination,hex_style);
        

    //calculate points of the hexes
    var hexes = pathfinder.destinationPathfind(range, destination);
    var points = [];
    for (var i = 0; i<hexes.length;i++) {
      points.push(this.hex_renderer.hexToPoint(hexes[i]));
    }

    //draw on screen
    this.hex_renderer.renderer.drawLines(points,3);
  }
}


