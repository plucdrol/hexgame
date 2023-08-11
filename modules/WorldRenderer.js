
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
                                                                
           //WORLD RENDERER

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////


import CanvasDraw from './u/CanvasDraw.js'
import World from './World.js'
import Unit from './Unit.js'
import Hex from './u/Hex.js'
import View from './u/View.js'
import HexRenderer from './HexRenderer.js'
import {RenderStyle} from './u/Renderer.js'



export default function WorldRenderer (world, renderer) {
  
  this.hex_renderer = new HexRenderer(renderer, world.getLayout() );
  this.world = world;

  var self = this; 

}

WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.clear = function() {
  this.hex_renderer.clear();
}

WorldRenderer.p.drawWorld = function() {
  this.drawTiles();
  this.drawRivers();
  this.drawRoads();
  this.drawUnits();
  this.drawResources();
}

WorldRenderer.p.drawWorldByPortions = function() {

  this.render_portions = Math.floor(world.radius/3);
  this.render_start = 0;

  var self = this; 
  this.stop_rendering = setInterval( self.drawWorldPortion.bind(self), 2 );
}   

WorldRenderer.p.drawWorldPortion = function() {

  var hexarray = this.world.quick_hexarray;

  let sections = Math.floor(hexarray.length/this.render_portions);
  hexarray = hexarray.slice(this.render_start*sections, (this.render_start+1)*sections );
  this.render_start++;

  if (this.render_start >= this.render_portions) {
    //this.render_start = 0;
    clearInterval(this.stop_rendering);
  }

  this.renderLayer(hexarray);


}












WorldRenderer.p.drawBigHex = function(radius) {

  let big_corners = [];
  let center = new Hex(0,0);
  for (let corner of center.getNeighbors()) {
    big_corners.push(this.hex_renderer.hexToPoint(Hex.multiply(corner,this.world.radius)));
  }

  let style = new RenderStyle();
  style.fill_color = "#005";
  this.hex_renderer.renderer.drawPolygon(big_corners, style);
}


WorldRenderer.p.drawTiles = function() {

  var hexarray = this.world.getHexArray();  

  let purple = ['#924','#915','#925','#926','#936','#926','#924' ];
  let green = ['#228822','#226633', '#337744','#336633','#337722','#225533','#228822'];
  let brown = ['#421','#412','#431','#421','#412','#431','#421','#412','#431'];

  //draw the land colors
  for (let hex of hexarray) {

    //draw clouds if not explored
    if (this.getTile(hex).hidden) {
      this.drawTile(hex, {elevation: 32});
      continue;
    }

    //draw tiles lighter if highlighted
    if (this.getTile(hex).highlighted) {
      //this.drawTile(hex, this.getTile(hex));
      if (this.getTile(hex).elevation >= 2) {
        if (this.getTile(hex).highlighted['brown'])
          if (this.getTile(hex).highlighted['green'])
            this.drawTile(hex, {elevation: 32}, green[this.getTile(hex).elevation%7] );
          else
            this.drawTile(hex, {elevation: 32}, brown[this.getTile(hex).elevation%7] );
          

      }
        
      else
       // this.drawTile(hex, {elevation: 32}, 'aqua' );
      this.drawTile(hex, this.getTile(hex));
      //this.drawTile(hex, {elevation: 32}, lighter( color_scale(this.getTile(hex).elevation) ) );
      continue;
    }

    //actual tiles, darker when highlights are on
    if (this.getTile(hex).elevation >= 0) {
      //if (this.world.highlights_on)
        //this.drawTile(hex, {elevation: 32}, darker( color_scale(this.getTile(hex).elevation) ) );
      //else
        this.drawTile(hex, this.getTile(hex));
    }
  }
}



WorldRenderer.p.drawRivers = function() {

  var hexarray = this.world.getHexArray();  

  let water_draw_level = 7;
  let max_draw_level = 150;

  //draw the rivers
  for (let hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (this.getTile(hex).river) {

      //downstream river first
      let downstream_hex = this.getTile(hex).river.downstream_hex;
      let water_level = this.getTile(hex).river.water_level;
      if (downstream_hex instanceof Hex && water_level >= water_draw_level)
        this.hex_renderer.drawCenterLine(hex, downstream_hex, Math.floor(Math.sqrt(Math.min(water_level,max_draw_level)*9)), '#22D', 'half only' );

      //upstream rivers next
      let upstream_hexes = this.getTile(hex).river.upstream_hexes;
      if (upstream_hexes instanceof Array) {
        for (let upstream_hex of upstream_hexes) {
          if (!this.getTile(upstream_hex).river)
            continue;
          let up_level = this.getTile(upstream_hex).river.water_level;
          if (up_level >= water_draw_level)
            this.hex_renderer.drawCenterLine(hex, upstream_hex, Math.floor(Math.sqrt(Math.min(up_level,max_draw_level)*9)), '#22D', 'half only' );
        }
      }

    }
  }
}

WorldRenderer.p.drawRoads = function() {

  var hexarray = this.world.getHexArray();  

  let road_style = 'half only'
  let zoom = this.hex_renderer.renderer.view.getZoom();
  let road_color = '#040';

  let self=this;

  //draw the roads
  for (let hex of hexarray) {
    let tile = this.getTile(hex);
    if (!tile) continue;
    if (tile.hidden) continue;

    if (tile.road_from)
      drawRoadHalf(tile.road_from)

    if (tile.road_to) 
      drawRoadHalf(tile.road_to)

    function drawRoadHalf(road_fromto) {
      for (let from of road_fromto.getHexArray()) {
        let road_size = road_fromto.getValue(from);
        if (road_size < 2) continue;

        road_color = '#040';
        if (road_size > 12) 
          road_color = 'saddlebrown'; 
        
        self.hex_renderer.drawCenterLine(hex, from, 3+road_size, road_color, 'half only');
      }
    }
  }
}



//draw the units and their resource-collection area
WorldRenderer.p.drawUnits = function() {

  var hexarray = this.world.getHexArray();  

  for (let hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    //draw units
    var this_unit = this.world.getUnit(hex);
    if (this_unit != undefined) {
        this.drawUnit(this_unit,hex,0);
    }
  }
}

//draw the resource icons
WorldRenderer.p.drawResources = function() {

  var hexarray = this.world.getHexArray();  

  //draw resources
  for (let hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    var this_resource = this.world.getResource(hex);
    if (this_resource != undefined && this_resource.resources) {
      this.drawUnit(this_resource,hex,0);
    }
  }
}














WorldRenderer.p.getTile = function(hex) {
    return this.world.getTile(hex);
}

WorldRenderer.p.drawTile = function(hex, tile, color) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.elevation);
  style.fill_color = color_scale(height);
  if (color)
    style.fill_color = color;

  this.hex_renderer.drawHex(hex, style);
}

WorldRenderer.p.drawUnit = function(unit,hex,height) {

  let view = this.hex_renderer.renderer.view;


  var position = this.hex_renderer.hexToPoint(hex);
  position = position.offset(0,-height);
 
  var unit_style = new RenderStyle();
  unit_style.fill_color = unit.color;

  if (unit.type == 'unknown')
    unit_style.fill_color = "rgba("+(128+127*this.ocillate(1000))+","+(255*this.ocillate(1000))+","+(128-128*this.ocillate(1000))+",1)";

  let zoom = view.getZoom();

  if (this.world.biggestRoad(hex) <= 2) {
    //draw a square or hexagon
    if (unit.size > 4 || (unit.pop && unit.pop > 9)) {
      this.hex_renderer.drawHex(hex, unit_style);
    } else {
      if (unit.pop && unit.pop < 2)
        this.hex_renderer.renderer.drawDot(position, Math.min(10*unit.size/2, 15*unit.size/2/zoom ), unit_style);
      else
        this.hex_renderer.renderer.drawDot(position, Math.min(10*unit.size, 15*unit.size/zoom ), unit_style);
    }
  }

  

  //draw a number on the unit
  if (unit.pop && unit.pop >= 2) {
    let text_style = new RenderStyle();
    let zoom = view.getZoom();
    text_style.text_size = Math.min(45, 1.5*45/zoom );
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
    for (let i = 0; i<hexes.length;i++) {
      points.push(this.hex_renderer.hexToPoint(hexes[i]));
    }

    //draw on screen
    this.hex_renderer.renderer.drawLines(points,3);
  }
}










var getWindArrowCharacter = function(direction) {

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
var color_scale = function (i) {

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

  var newgreenscale = ['#115','#22D','#994', //ocean coast sand 0 1 2
                    '#282','#163', //grass 3 4
                    '#363','#242','#232','#231', //forest 5 6 7 8
                    '#321','#312','#331', //hills 9 10 11 12 13
                    '#412','#422',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds



  var even_greenscale = ['#222255','#2222DD','#999944', //ocean coast sand 0 1 2
                    '#228822','#226633', //grass 3 4
                    '#336644','#446633','#336622','#225533', //forest 5 6 7 8
                    '#664433','#663344','#666633', //hills 9 10 11 12 13
                    '#441122','#442222',
                    '#777777', '#777777','#777777', //mountains 14 15 16
                    '#888888','#888888','#888888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds


  var rockscale = ['#115','#22D','#443', //ocean coast sand 0 1 2
                    '#333','#444','#413937', //grass 3 4 5
                    '#333','#444','#414241', //forest  6 7 8
                    '#474047','#404740','#404747', //hills 9 10 11 12 13
                    '#585951','#484951',
                    '#BBB', '#BBB','#BBB', //mountains 14 15 16
                    '#CCC','#DDD','#EEE', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds



                    
 return oldgreenscale[i];

}

function darker(col) {
  return LightenDarkenColor(col, -0.7);
}

function lighter(col) {
  return LightenDarkenColor(col, 0.3);
}

function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    if (col.length == 3)
      col = ""+col[0]+col[0]+col[1]+col[1]+col[2]+col[2];

    var num = parseInt(col,16);

    if (amt >= 0)
      {var r = (num >> 16); r=r+(255-r)*amt;}
    else
      {var r = (num >> 16); r=-r*amt;}

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    if (amt >= 0)
      {var b = ((num >> 8) & 0x00FF); b=b+(255-b)*amt;}
    else
      {var b = ((num >> 8) & 0x00FF);  b=-b*amt;}

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    if (amt >= 0)
      {var g = (num & 0x0000FF); g=g+(255-g)*amt;}
    else 
      {var g = (num & 0x0000FF);  g=-g*amt;}

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}