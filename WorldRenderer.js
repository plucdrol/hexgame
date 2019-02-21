
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
//  Hex
//  HexRenderer

function WorldRenderer (world, hex_renderer) {
  
  this.hex_renderer = hex_renderer;

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
    

WorldRenderer.p.drawWorld = function() {

  if (this.ready_to_render) {
    this.drawBigHex(this.world.radius);
    var hexmap = this.calculateHexesToRender();
    this.drawHexMap(hexmap);
    
  }
}

WorldRenderer.p.drawBigHex = function(radius) {

  let big_corners = [];
  let center = new Hex(0,0);
  for (corner of center.getNeighbors()) {
    big_corners.push(this.hex_renderer.hexToPoint(Hex.multiply(corner,this.world.radius)));
  }

  let style = new RenderStyle();
  style.fill_color = "#005";
  this.hex_renderer.renderer.drawPolygon(big_corners, style);
}

WorldRenderer.p.drawHexMap = function(hexmap) {
  //get the array
  var hexarray = hexmap.getHexArray();

  //make a tile renderer
  var tile_renderer = new TileRenderer2D( this.hex_renderer, this.world.getLayout() );

  //draw the tiles of the array
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) {
      tile_renderer.drawTile(hex, {elevation: 21});
      continue;
    }
    //draw tile
    if (this.getTile(hex).elevation >= 2)
      tile_renderer.drawTile(hex, this.getTile(hex));
  }

  //draw the rivers
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (this.getTile(hex).river) {
      let downstream_hex = this.getTile(hex).river.downstream_hex;
      let water_level = this.getTile(hex).river.water_level;
      if (downstream_hex instanceof Hex && water_level >= 7)
        this.hex_renderer.drawCenterLine(hex, downstream_hex, Math.floor(Math.sqrt(water_level*3)) );
    }
  }

  //draw the coastal water
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    //draw tile
    if (this.getTile(hex).elevation == 1)
      tile_renderer.drawTile(hex, this.getTile(hex));

    //draw resources
    var this_resource = this.world.getResource(hex);
    if (this_resource != undefined) {
        this.drawUnit(this_resource,hex,0);
    }
  }

  //draw the units and their associated zones
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
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
  unit_style.fill_color = unit.color;
  let size = 10*unit.size;
  this.hex_renderer.renderer.drawDot(position, size, unit_style);
  
  if (unit.population != undefined) {
    let text_style = new RenderStyle();
    text_style.font_size = 25;
    let text = unit.population;      
    this.hex_renderer.renderer.drawText(text, position, text_style);
  }

  //draw the city radius
  if (unit.cityRadius != undefined) {
    this.drawCityRadius(hex, unit);
  }
};

WorldRenderer.p.drawCityRadius = function(hex, unit) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = unit.civ.fill_color;
  radius_style.line_color = unit.civ.line_color;

  let radius_array = Hex.circle(hex, unit.cityRadius);
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


