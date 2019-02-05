//-------1---------2---------3---------4---------5---------6---------7---------8

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
//  UnitMap

function World(scale, radius) {

  var tile_size = new Point(35/scale, 35/scale);
  
  var origin = new Point(0,0);

  this.layout = new HexLayout('pointy', tile_size, origin);
  
  this.world_map = new HexMap();
  this.createMap(radius);

  this.units = new HexMap();

  this.resources = new HexMap();
  this.resources = this.generateResources(this.world_map);

  this.startGathering = function() {
    var self = this; 
    setInterval( self.gatherCityResources(self), 1000 );
  }

  this.startGathering();

  
}

World.prototype.setMap = function(map) {
  this.world_map = map;
}

World.prototype.createMap = function(radius) {
  //create a map 
  var hexmap_generator = new MapGenerator('perlin'); 
  var map = hexmap_generator.makeMap(radius);
  this.setMap(map);
}

World.prototype.getLayout = function() {
  return this.layout;
}

World.prototype.getHex = function(world_position) {
  var hex = Hex.round(this.layout.pointToHex(world_position));
  return hex;
}

World.prototype.getPoint = function(hex) {
  return this.layout.hexToPoint(hex);
}

World.prototype.setHex = function(hex,value) {
  this.world_map.set(hex, value);
}

World.prototype.getMapValue = function(hex) {
  return this.world_map.getValue(hex);
}

World.prototype.getUnit = function(hex) {
  return this.units.get(hex);
}

World.prototype.getResource = function(hex) {
  return this.resources.getValue(hex);
}

World.prototype.generateResources = function(world_map) {
  var resources = new HexMap();
  for (let hex of world_map.getHexArray() )  {
    let terrain = world_map.getValue(hex);

    //only 30% of the land gets resources
    if (Math.random() < 0.8) {

      continue;
    }

    switch (terrain.elevation) {
      case 1: //coasts
        resources.set(hex, new Unit('fish') );
        break;
      case 3: //grass
      case 4: 
        resources.set(hex, new Unit('food'));
        break;
      case 5: //forest
      case 6: 
      case 7: 
      case 8: 
        resources.set(hex, new Unit('wood'));
        break;
      case 9: //forest
      case 10: 
      case 11: 
        resources.set(hex, new Unit('stone'));
        break;
    }
  }
  return resources;
}


//This function is created in WORLD for now, because we need access to the map
//Move it somewhere else where it belongs
World.prototype.gatherCityResources = function(world) {
  
  return function(){



    //For all units
    for (let unit_hex of world.units.getHexArray() )  {
      //if they are a city
      let unit = world.units.get(unit_hex);
      if (!unit) 
        continue;
      if (!unit.hasComponent('resources') || !unit.hasComponent('cityRadius')) 
        continue;
      //get the tiles in its radius
      let collection_hexes = Hex.circle(unit_hex,unit.cityRadius);
      //for each tile in that array

      for (let collection_hex of collection_hexes) {
        //add the resources to the city
        if (!world.resources.containsHex(collection_hex)) 
          continue;
        let resource = world.resources.getValue(collection_hex);
        let resource_type = resource.resource_type;
        if (unit.resources[resource_type] >= unit.capacity[resource_type]) 
          continue;
        unit.resources[resource_type] += resource.resource_value;


      }
    }
  }
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
  this.unit_controller = new UnitController(world.world_map, world.units);

  this.listenForEvents();
}

WorldInput.prototype.getUnitController = function() {
  return this.unit_controller;
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
  if (this.unit_controller != undefined) {


    var world_position = this.view.screenToWorld(screen_position);
    let hex_clicked = this.world.getHex(world_position);

    //Only reference to unit controller in WorldInterface
    this.unit_controller.clickHex(hex_clicked);
    
    drawScreen();
  }

}

