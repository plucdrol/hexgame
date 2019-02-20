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

function World(radius) {

  this.radius = radius;
  
  //configure world dimensions
  var tile_size = new Point(35, 35);
  var origin = new Point(0,0);
  this.layout = new HexLayout('pointy', tile_size, origin);
  
  //create land map
  this.world_map = new HexMap();
  this.world_map = new MapGenerator('perlin').makeMap(radius);

  //create units map
  this.units = new HexMap();
  this.units.set(new Hex(0,0), new Unit('camp'));
  this.units.get(new Hex(0,0)).resources.food = 30;

  //create resources map
  this.resources = new HexMap();
  this.resources = this.generateResources(this.world_map);

  //Make the center tile into sand
  let land_tile = new Unit('terrain');
  land_tile.elevation = 2;
  this.setHex(new Hex(0,0), land_tile);

  this.total_population = 0;


  //start the 1-second counter which gathers resources for cities
  this.startGathering = function() {
    var self = this; 
    setInterval( self.gatherCityResources(self), 1000 );
  }
  this.startGathering();



  
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
  return this.resources.get(hex);
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
      //forest
      case 5: 
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

    let total_food = 0;

    //For all units
    for (let unit_hex of world.units.getHexArray() )  {
      //if they are a city
      let unit = world.units.get(unit_hex);
      if (!unit) 
        continue;
      if (!unit.hasComponent('resources') || !unit.hasComponent('cityRadius')) 
        continue;

      //collect resources in city range
      let collection_hexes = Hex.circle(unit_hex,unit.cityRadius);
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

      //count total food
      total_food += unit.resources.food;
    }

    world.total_population = total_food;
    drawScreen();
  }
}