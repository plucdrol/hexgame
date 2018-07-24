
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



function WorldRenderer (canvas_draw,view,world,unit_controller,color_scheme) {
  
  this.hex_renderer = new HexRenderer(canvas_draw,view,world.layout,color_scheme);
  this.world = world;

  this.unit_controller = unit_controller;

  this.corners = [];

  this.ready_to_render = true;
}

WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.clear = function() {
    this.hex_renderer.renderer.canvas_draw.clear();
}

WorldRenderer.p.calculateHexesToRender = function() {
  var rectMap = this.hex_renderer.getHexRectangleBoundaries();
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
    var this_unit = this.unit_controller.units.getValue(hex);

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


