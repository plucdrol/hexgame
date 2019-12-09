
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

WorldRenderer.p.getVisibleHexes = function() {
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
  /*var hexmap = this.getVisibleHexes();
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
      this.drawTile(hex, {elevation: 32});
      continue;
    }
    //actual tiles
    if (this.getTile(hex).elevation >= 0)
      this.drawTile(hex, this.getTile(hex));
  }
}



WorldRenderer.p.drawRivers = function(hexarray) {

  let water_draw_level = 7;
  //draw the rivers
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (this.getTile(hex).river) {

      //downstream river first
      let downstream_hex = this.getTile(hex).river.downstream_hex;
      let water_level = this.getTile(hex).river.water_level;
      if (downstream_hex instanceof Hex && water_level >= water_draw_level)
        this.hex_renderer.drawCenterLine(hex, downstream_hex, Math.floor(Math.sqrt(water_level*9)), '#00D', 'half only' );

      //upstream rivers next
      let upstream_hexes = this.getTile(hex).river.upstream_hexes;
      if (upstream_hexes instanceof Array) {
        for (upstream_hex of upstream_hexes) {
          if (!this.getTile(upstream_hex).river)
            continue;
          let up_level = this.getTile(upstream_hex).river.water_level;
          if (up_level >= water_draw_level)
            this.hex_renderer.drawCenterLine(hex, upstream_hex, Math.floor(Math.sqrt(up_level*9)), '#00D', 'half only' );
        }
      }

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
      for (from of tile.road_from) {
        if (tile.elevation < 2 || this.world.alongRiver(hex, from) || this.world.enteringRiver(hex, from) || this.world.leavingRiver(hex, from) )
          this.hex_renderer.drawCenterLine(hex, from, 8, '#0DD', 'moving dots');
        else 
          this.hex_renderer.drawCenterLine(hex, from, 6, '#DD0', 'half only');
      }
    }
    if (tile.road_to) {
      for (from of tile.road_to) {
        if (tile.elevation < 2 || this.world.alongRiver(hex, from) || this.world.enteringRiver(hex, from) || this.world.leavingRiver(hex, from) )
          this.hex_renderer.drawCenterLine(hex, from, 8, '#0DD', 'moving dots backwards');
        else 
          this.hex_renderer.drawCenterLine(hex, from, 6, '#DD0', 'half only');
      }
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

  if (unit.type == 'unknown')
    unit_style.fill_color = "rgba("+(128+127*this.ocillate(1000))+","+(255*this.ocillate(1000))+","+(128-128*this.ocillate(1000))+",1)";


  //draw a square or hexagon
  if (unit.size > 4) {
    this.hex_renderer.drawHex(hex, unit_style);
  } else {
    this.hex_renderer.renderer.drawDot(position, 10*unit.size, unit_style);
  }

  //draw a number on the unit
  if (unit.pop) {
    let text_style = new RenderStyle();
    text_style.text_size = 45;
    let text = unit.pop;      
    this.hex_renderer.renderer.drawText(text, position, text_style, true);
  }

};

WorldRenderer.prototype.ocillate = function(length) {
  let time = new Date().getTime()%length;
  let value = 2*Math.abs(time/length-0.5);
  return value;
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
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds

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