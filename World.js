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

function World() {
  var tile_size = new Point(35,35);
  var origin = new Point(0,0);
  this.layout = new HexLayout('pointy', tile_size, origin);

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

function WorldInterface(world,view,unit_controller) {
  
  this.world = world;
  this.hex_hovered = new Hex(0,0);
  this.hex_hovered_previous = new Hex(0,0);
  this.view = view;

  this.unit_controller = unit_controller;
  
  this.init();
}

WorldInterface.prototype.init = function() {
  var wif = this;

  if (this.unit_controller != false) {
    
    listenForEvent('hexgame_click', function(e){
      wif.clickScreenEvent(e.detail.click_pos);
    } );

  }
    
    listenForEvent('hexgame_zoom', function(e){
      wif.zoomViewEvent(e.detail.amount);
    } );
    
    listenForEvent('hexgame_hover', function(e){
      wif.hoverEvent(e.detail.mousepos);
    } );
    
    listenForEvent('hexgame_drag', function(e){
      wif.dragEvent(e.detail.mousepos,e.detail.mouseposprevious);
    } );
    
    listenForEvent('hexgame_resize', function(e){
      wif.resizeEvent(e.detail.width, e.detail.height);
    } );


}

WorldInterface.prototype.setView = function(view) {
  this.view = view;
}
WorldInterface.prototype.getView = function() {
  return this.view;
}
WorldInterface.prototype.moveView = function(direction) {

  this.view.move(direction,0.2);
}

WorldInterface.prototype.zoomViewEvent = function(zoom) {
  this.view.zoom(zoom);
  drawScreen();
}

WorldInterface.prototype.getHex = function(screen_position) {
  var world_position = this.view.screenToWorld(screen_position);
  var hex = Hex.round(this.world.pointToHex(world_position));
  return hex;
}

WorldInterface.prototype.setHex = function(screen_position,value) {
  var hex = this.getHex(screen_position);
  this.world.map.set(hex,value);
}

WorldInterface.prototype.getMapValue = function(hex) {
  return this.world.map.getValue(hex);
}

///////// EVENTS /////////

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

  let hex_clicked = this.getHex(screen_position);

  //Only reference to unit controller
  unit_controller.clickHex(hex_clicked);
  
  drawScreen();

}

WorldInterface.prototype.dragEvent = function(mouse,previous_mouse) {
  
  //get the movement the mouse has moved since last tick
  var x_move = this.view.screenToWorld1D(previous_mouse.x-mouse.x);
  var y_move = this.view.screenToWorld1D(previous_mouse.y-mouse.y);
  var drag_move = new Point(x_move, y_move);
  
  //shift the view by that movement
  this.view.shiftPosition(drag_move);
  
  //redraw the screen after moving
  drawScreen();
}

WorldInterface.prototype.resizeEvent = function(width,height) {

  this.view.resizeOutput(width,height);

  //redraw the screen after resizing
  drawScreen();

}
