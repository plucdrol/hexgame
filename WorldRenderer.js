
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

function WorldRenderer (canvas_draw, world, view) {
  
  this.hex_renderer = new HexRenderer(canvas_draw, view, world.getLayout() );

  this.view = view;
  this.world = world;

  this.ready_to_render = true;
}

WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.clear = function() {
    this.hex_renderer.renderer.canvas_draw.clear();
}

WorldRenderer.p.calculateHexesToRender = function() {
  var rectMap = this.hex_renderer.getHexRectangleBoundaries();
  //get the rectangular array of hex tiles
  let hexmap = this.world.world_map.getRectangleSubMap( rectMap.qmin,
                                                  rectMap.qmax,
                                                  rectMap.rmin, 
                                                  rectMap.rmax);

   return hexmap;
}
    

WorldRenderer.p.drawWorld = function(world) {

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
                       this.view,
                       this.world.getLayout()
                       );


  //draw the tiles of the array
  for (hex of hexarray) {
    
    //draw tile
    tile_renderer.drawTile(hex, this.getTile(hex));
    
    //draw resources
    var this_resource = this.world.getResource(hex);
    if (this_resource != undefined) {
        this.drawUnit(this_resource,hex,0);
    }

  }

  //draw the units and their associated zones
  for (hex of hexarray) {
    //draw units
    var this_unit = this.world.getUnit(hex);
    if (this_unit != undefined) {
        this.drawUnit(this_unit,hex,0);
    }
  }
}

WorldRenderer.p.getTile = function(hex) {
    return this.world.world_map.getValue(hex);
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

  if (unit.components.cityRadius != undefined) {
    this.drawCityRadius(hex, unit);
  }
};

WorldRenderer.p.drawCityRadius = function(hex, unit) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = unit.getComponent('cityRadiusColor');
  radius_style.line_color = unit.getComponent('cityRadiusLineColor');

  let radius_array = Hex.circle(hex, unit.components.cityRadius);
  this.hex_renderer.drawHexes(radius_array, radius_style);
}


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


