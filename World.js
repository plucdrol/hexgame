//-------1---------2---------3---------4---------5---------6---------7---------8

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//////                                  
//////                WORLD MAP 
//////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  MapGenerator.js

function WorldMap(origin, tile_size) {

  if (tile_size == undefined) 
    var tile_size = new Point(35,35);  
  
  if (origin == undefined)
    var origin = new Point(0,0);
    
  this.layout = new HexLayout('pointy', tile_size, origin);

}

WorldMap.prototype.createMap = function(radius, center_hex) {
  //create a map 
  var hexmap_generator = new MapGenerator('perlin'); 
  var map = hexmap_generator.makeMap(radius, center_hex);
  this.setMap(map);
}
WorldMap.prototype.setMap = function(map) {
  this.map = map;
}
WorldMap.prototype.hexToPoint = function(hex) {
  return this.layout.hexToPoint(hex);
}
WorldMap.prototype.pointToHex = function(point) {
  return this.layout.pointToHex(point);
}
WorldMap.prototype.getTile = function(hex) {
  return this.map.getValue(hex);
}
WorldMap.prototype.setTile = function(hex, value) {
  this.map.set(hex, value);
}















////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  WorldMap
//  Unitcontroller.js

function World(origin, tile_size, radius, center_hex) {
  
  this.world_map = new WorldMap(origin, tile_size);// <-- point at which the sublayer affects this new layer
  this.world_map.createMap(radius, center_hex);

  this.unit_controller = new UnitController(this.world_map.map);
  
}

World.prototype.getLayout = function() {
  return this.world_map.layout;
}

World.prototype.getUnitController = function() {
  return this.unit_controller;
}

World.prototype.getHex = function(world_position) {
  var hex = Hex.round(this.world_map.pointToHex(world_position));
  return hex;
}

World.prototype.setHex = function(world_position,value) {
  this.world_map.setTile(hex, value);
}

World.prototype.getMapValue = function(hex) {
  return this.world_map.getTile(hex);
}

World.prototype.getUnit = function(hex) {
  return this.unit_controller.getUnit(hex);
}




















////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


// -- Dependencies: --
// World
// View
// Hex
// Events

///////// EVENTS /////////
function WorldInput(world, view) {
  this.world = world;
  this.view = view;

  this.listenForEvents();
}

WorldInput.prototype.listenForEvents = function() {

  this.hex_hovered = new Hex(0,0);
  this.hex_hovered_previous = new Hex(0,0);

  var wif = this;

    if (this.world.unit_controller != false) {
      listenForEvent('hexgame_click', function(e){
        wif.clickScreenEvent(e.detail.click_pos);
      }); 
    }
        
    listenForEvent('hexgame_hover', function(e){
      wif.hoverEvent(e.detail.mousepos);
    } );
  }

WorldInput.prototype.hoverEvent = function(screen_position) {
  
  //get the hex being hovered

  var world_position = this.view.screenToWorld(screen_position);
  this.hex_hovered = this.world.getHex(world_position);

  //if the mouse moved to a new hex, redraw the screen
  if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
    drawScreen();
  }

  //remember the currently hovered hex
  this.hex_hovered_previous = this.hex_hovered;
}

WorldInput.prototype.clickScreenEvent = function(screen_position) {
  
  if (this.view.getZoom() < 0.06 || this.view.getZoom() > 64*0.06 ) {
    return;
  }
  if (this.world.unit_controller != undefined) {
    console.log('click');


    var world_position = this.view.screenToWorld(screen_position);
    let hex_clicked = this.world.getHex(world_position);

    //Only reference to unit controller in WorldInterface
    this.world.unit_controller.clickHex(hex_clicked);
    
    drawScreen();
  }

}

