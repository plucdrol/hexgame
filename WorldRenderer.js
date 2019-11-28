
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
  this.render_start = 0;
  this.render_portions = Math.floor(world.radius/3);

  var self = this; 
  setInterval( self.drawWorld.bind(self), 2 );
}
WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.calculateHexesToRender = function() {
  var rectMap = this.hex_renderer.getHexRectangleBoundaries();
  //get the rectangular array of hex tiles
  let hexmap = this.world.getRectangleSubMap( rectMap.qmin,
                                                  rectMap.qmax,
                                                  rectMap.rmin, 
                                                  rectMap.rmax);
   return hexmap;
}
    

WorldRenderer.p.drawWorld = function() {

  //draw the world to the canvas and to a backupcanvas
  /*var hexmap = this.calculateHexesToRender();
  var hexarray = hexmap.getHexArray();
  */

  
  var hexarray = this.world.getHexArray();
  let section = Math.floor(hexarray.length/this.render_portions);
  hexarray = hexarray.slice(this.render_start*section, (this.render_start+1)*section );
  this.render_start++;
  if (this.render_start >= this.render_portions)
    this.render_start = 0;
  

  
  //this.drawBigHex(this.world.radius);
  this.drawTiles(hexarray);
  this.drawRivers(hexarray);
  //this.drawCivTiles(hexarray);

  this.drawRoads(hexarray);
  this.drawUnits(hexarray);
  this.drawResources(hexarray);

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

WorldRenderer.p.drawTiles = function(hexarray) {

  //draw the land colors
  for (hex of hexarray) {

    //clouds if not explored
    if (this.getTile(hex).hidden) {
      this.drawTile(hex, {elevation: 21});
      continue;
    }
    //actual tiles
    if (this.getTile(hex).elevation >= 0)
      this.drawTile(hex, this.getTile(hex));
  }
}

WorldRenderer.p.drawCivTiles = function(hexarray) {
  let civ_tile_arrays = [];
    
  //collect all civ tiles into arrays for each civilization
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (!this.getTile(hex).civ) continue;
    if (!civ_tile_arrays[this.getTile(hex).civ.id])
      civ_tile_arrays[this.getTile(hex).civ.id] = [];
    civ_tile_arrays[this.getTile(hex).civ.id].push(hex);
  }

  //draw tile arrays
  if (!civ_tile_arrays)
    return;
  for (culture of civ_tile_arrays) {
    if (!(culture instanceof Array))
      continue;
    let civ = this.getTile(culture[0]).civ;    


    //draw the selected civ as yellow
    let selected_civ = game_input.unit_input.getActorSelected();
    if (selected_civ && selected_civ.name == civ.name) {
        let golden_civ = new RenderStyle();
        golden_civ.fill_color = "rgba(150,150,50,0.8)";
        golden_civ.line_color = "black";
        this.drawCivHexes(culture, golden_civ);
    } else {
        this.drawCivHexes(culture, civ);
    }

  }
  
}

WorldRenderer.p.drawRivers = function(hexarray) {
  //draw the rivers
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (this.getTile(hex).river) {
      let downstream_hex = this.getTile(hex).river.downstream_hex;
      let water_level = this.getTile(hex).river.water_level;
      if (downstream_hex instanceof Hex && water_level >= 7)
        this.hex_renderer.drawCenterLine(hex, downstream_hex, Math.floor(Math.sqrt(water_level*6)), '#00D' );
    }
  }
}

WorldRenderer.p.drawRoads = function(hexarray) {
  //draw the rivers
  for (hex of hexarray) {
    let tile = this.getTile(hex);
    if (!tile) continue;
    if (tile.hidden) continue;
    if (tile.road_from) {
      for (from of tile.road_from)
      this.hex_renderer.drawCenterLine(hex, from, 6, '#DD0' );
    }
  }
}

//draw the units and their resource-collection area
WorldRenderer.p.drawUnits = function(hexarray) {
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    //draw units
    var this_unit = this.world.getUnit(hex);
    if (this_unit != undefined) {
        this.drawUnit(this_unit,hex,0);
    }
  }
}

//draw the resource icons
WorldRenderer.p.drawResources = function(hexarray) {
  //draw resources
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    var this_resource = this.world.getResource(hex);
    if (this_resource != undefined) {
        this.drawUnit(this_resource,hex,0);
    }
  }
}














WorldRenderer.p.getTile = function(hex) {
    return this.world.getTile(hex);
}

WorldRenderer.p.drawTile = function(hex,tile) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.elevation);
  style.fill_color = greenscale_colors(height);

  this.hex_renderer.drawHex(hex, style);
}

WorldRenderer.p.drawUnit = function(unit,hex,height) {

  var position = this.hex_renderer.hexToPoint(hex);
  position = position.offset(0,-height);
 
  var unit_style = new RenderStyle();
  unit_style.fill_color = unit.color;
  let size = 10*unit.size;
  this.hex_renderer.renderer.drawDot(position, size, unit_style);
  
  if (unit.population) {
    let text_style = new RenderStyle();
    text_style.font_size = 25;
    let text = unit.population;      
    this.hex_renderer.renderer.drawText(text, position, text_style);
  }

  //draw the city radius
  if (unit.cityRadius) {
    //this.drawCityRadius(hex, unit);
  }
};

WorldRenderer.p.drawCityRadius = function(hex, unit) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = 'rgba(0,0,0,0)';
  radius_style.line_color = unit.civ.line_color;

  let radius_array = Hex.circle(hex, unit.cityRadius);
  this.hex_renderer.drawHexes(radius_array, radius_style);
}

WorldRenderer.p.drawCivTile = function(hex, tile) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = tile.civ.fill_color;
  radius_style.line_color = tile.civ.line_color;
  this.hex_renderer.drawHex(hex, radius_style);
}
WorldRenderer.p.drawCivHexes = function(hexes, civ) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = civ.fill_color;
  radius_style.line_color = civ.line_color;
  this.hex_renderer.drawHexes(hexes, radius_style);
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










getWindArrowCharacter = function(direction) {

    switch (direction) {
        case 0: return 8594; break;
        case 1: return 8599; break;
        case 2: return 8598; break;
        case 3: return 8592; break;
        case 4: return 8601; break;
        case 5: return 8600; break;
        default: return 8635;
    }
}


//colors of different tiles depending on height
var greenscale_colors = function (i) {

  var oldgreenscale = ['#005','#00D','#AA3', //ocean coast sand 0 1 2
                    '#080','#062', //grass 3 4
                    '#052','#042','#032','#020', //forest 5 6 7 8
                    '#310','#310','#320', //hills 9 10 11 12 13
                    '#310','#310',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF',]; //ice

  var greenscale = [224,190,61, //ocean coast sand 0 1 2
                    90,100, //grass 3 4
                    100,105,110,120, //forest 5 6 7 8
                    34,35,36,37,38];  //hills 9 10 11 12 13
                    
 return oldgreenscale[i];

  //ice
  if (i >= 20)
    return "hsl(0, 0%, 90%)"; 
  //mountains
  if (i >= 14)
    return "hsl(0, 0%, 50%)"; 
  //land
  return "hsl("+greenscale[i]+", 30%, 50%)"; 

}