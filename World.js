//-------1---------2---------3---------4---------5---------6---------7---------8

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//////                                  
//////   WORLD DATA REPRESENTATION
//////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  MapGenerator.js

function World(origin, tile_size) {

  if (tile_size == undefined) 
    var tile_size = new Point(35,35);  
  
  if (origin == undefined)
    var origin = new Point(0,0);
    
  this.layout = new HexLayout('pointy', tile_size, origin);

}

World.prototype.createMap = function(radius, center_hex) {
  //create a map 
  var hexmap_generator = new MapGenerator('perlin'); 
  var map = hexmap_generator.makeMap(radius, center_hex);
  this.setMap(map);
}
World.prototype.setMap = function(map) {
  this.map = map;
}
World.prototype.hexToPoint = function(hex) {
  return this.layout.hexToPoint(hex);
}
World.prototype.pointToHex = function(point) {
  return this.layout.pointToHex(point);
}
World.prototype.getTile = function(hex) {
  return this.map.getValue(hex);
}
World.prototype.setTile = function(hex, value) {
  this.map.set(hex, value);
}















////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD INTERFACE
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  Unitcontroller.js
//  View.js
//  World.js
//  Events.js

function WorldInterface(world, view, unit_controller) {
  
  this.world = world;
  this.hex_hovered = new Hex(0,0);
  this.hex_hovered_previous = new Hex(0,0);
  this.view = view;

  this.unit_controller = unit_controller;
  
  this.init();
}

WorldInterface.prototype.getHex = function(screen_position) {
  var world_position = this.view.screenToWorld(screen_position);
  var hex = Hex.round(this.world.pointToHex(world_position));
  return hex;
}

WorldInterface.prototype.setHex = function(screen_position,value) {
  var hex = this.getHex(screen_position);
  this.world.setTile(hex,value);
}

WorldInterface.prototype.getMapValue = function(hex) {
  return this.world.getTile(hex);
}

WorldInterface.prototype.getUnit = function(hex) {
  return this.unit_controller.getUnit(hex);
}









///////// EVENTS /////////
WorldInterface.prototype.init = function() {
  var wif = this;

    if (this.unit_controller != false) {
      listenForEvent('hexgame_click', function(e){
        wif.clickScreenEvent(e.detail.click_pos);
      }); 
    }
        
    listenForEvent('hexgame_hover', function(e){
      wif.hoverEvent(e.detail.mousepos);
    } );
  }

WorldInterface.prototype.hoverEvent = function(screen_position) {
  
  //get the hex being hovered
  this.hex_hovered = this.getHex(screen_position);

  //if the mouse moved to a new hex, redraw the screen
  if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
    drawScreen();
  }

  //remember the currently hovered hex
  this.hex_hovered_previous = this.hex_hovered;
}

WorldInterface.prototype.clickScreenEvent = function(screen_position) {
  
  if (this.view.getZoom() < 0.06 || this.view.getZoom() > 64*0.06 ) {
    return;
  }
  if (this.unit_controller != undefined) {
    console.log('click');

    let hex_clicked = this.getHex(screen_position);

    //Only reference to unit controller in WorldInterface
    this.unit_controller.clickHex(hex_clicked);
    
    drawScreen();
  }

}

