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

//A hex-shaped array of tiles, with each tile having some information inside them

//Dependencies
//  Hex.js
//  WorldMap
//  UnitMap

var land_tiles = [
'ocean',
'coast',
'sand',
'grass','grass',
'forest','forest','forest','forest',
'hills','hills','hills','hills','hills',
'mountains','mountains','mountains','mountains','mountains','mountains',
'ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','ice'
];

function World(radius) {

  this.radius = radius;
  
  //configure world dimensions
  var tile_size = new Point(35, 35);
  var origin = new Point(0,0);
  this.layout = new HexLayout('pointy', tile_size, origin);
  
  //create land map
  this.world_map = new HexMap();
  this.world_map = new MapGenerator('perlin').makeMap(radius);
  this.makeCloudsEverywhere();

  //create units map
  this.units = new HexMap();
  this.units.set(new Hex(0,0), new Unit('village'));

  //create resources map
  this.resources = new HexMap();
  this.resources = this.generateResources();
  this.generateUnknown();

  //Make the center tile into sand
  let land_tile = new Unit('terrain');
  land_tile.elevation = 2;
  this.setHex(new Hex(0,0), land_tile);

  this.population = 8;
  this.total_population = 8;



}

////////////////////////////////////////////////////
/////////// POPULATION FUNCTIONS
////////////////////////////////////////////////////


World.prototype.getPopulation = function() {
  return Math.floor(this.population);
}


World.prototype.getLayout = function() {
  return this.layout;
}






















////////////////////////////////////////////////////
///////////
///////////         WORLD MAP BASIC FUNCTIONS
///////////
////////////////////////////////////////////////////

World.prototype.getHex = function(world_position) {
  var hex = Hex.round(this.layout.pointToHex(world_position));
  return hex;
}

World.prototype.getHexArray = function() {
  return this.world_map.getHexArray();
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
World.prototype.getTile = World.prototype.getMapValue;

World.prototype.getActor = function(hex) {
  return this.getUnit(hex);
}

World.prototype.getRandomHex = function() {

  let hex_array = this.world_map.getHexArray();
  let random_hex = hex_array[Math.floor(Math.random()*hex_array.length)];
  return random_hex;
}

World.prototype.getUnit = function(hex) {
  return this.units.get(hex);
}

World.prototype.addUnit = function(hex, unit_type) {

    let new_unit = new Unit(unit_type);
    this.units.set(hex, new_unit);
}


World.prototype.buildRoad = function(hexarray) {
  let previous_hex;

  for (hex of hexarray) {
    if (previous_hex && this.getTile(hex)) {
      this.addRoadTile(previous_hex, hex);
    }
    previous_hex = hex;
  }
}
World.prototype.addRoadTile = function(hex1, hex2) {

  if (!this.getTile(hex2).road_from)
    this.getTile(hex2).road_from = [];

  this.getTile(hex2).road_from.push(hex1);

}

World.prototype.getResource = function(hex) {
  return this.resources.get(hex);
}
World.prototype.tileIsRevealed = function(hex) {
  return (this.world_map.containsHex(hex) && !this.getTile(hex).hidden);
}


World.prototype.getRectangleSubMap = function(qmin, qmax,rmin, rmax) {
  return this.world_map.getRectangleSubMap( qmin, qmax,rmin, rmax);
}













///////////////////////////////////////////////////
//
//            MAP ANALYSIS FUNCTION
//
///////////////////////////////////////////////////

World.prototype.unitAtLocation = function(hex) {
  if (this.getUnit(hex) instanceof Unit) {
    return true;
  }

  return false

}
World.prototype.countUnits = function(hexarray, unit_type, minimum_count) {

  let count = 0;

  for (hex of hexarray) {
    if (this.getUnit(hex) && this.getUnit(hex).type == unit_type)
      count++;
  }

  return (count >= minimum_count) 

}

World.prototype.countResources = function(hexarray, resource_type, minimum_count) {
  let count = 0;

  for (hex of hexarray) {
    if (this.getResource(hex) && 
      this.getResource(hex).resources &&
        this.getResource(hex).resources[resource_type])
      count++;
  }

  return (count >= minimum_count) 
}

World.prototype.nearCoast = function(position) {
  let count = 0;

  for (neighbor of position.getNeighbors()) {
    if (this.getTile(neighbor) && 
        this.getTile(neighbor).elevation <= 1)
      count++;
  }

  return (count >= 1) 
}

//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noCitiesInArea = function(position, radius, position_to_ignore) {
  let area = Hex.circle(position, radius);
  for (hex of area) {
    if (this.units.containsHex(hex) ) {
      if (this.getUnit(hex).type=='village')
        return false;
    }
  }
  //no cities
  return true;
}







///////////////////////////////////////////////////
//
//            RESOURCE GENERATION FUNCTIONS
//
///////////////////////////////////////////////////


World.prototype.generateUnknown = function() {
  let count=8;
  while(count > 0) {
    let random_hex = this.getRandomHex();
    if (this.getTile(random_hex).elevation < 1)
      continue;
    this.resources.set(random_hex, new Unit('unknown'));
    count--;
  }
}

World.prototype.addResource = function(hex, type) {
  this.resources.set(hex, new Unit(type) );
}

World.prototype.generateResources = function() {
  var resources = new HexMap();
  for (let hex of this.world_map.getHexArray() )  {
    let terrain = this.getTile(hex);

    //only 20% of the land gets resources
    if (Math.random() < 0.8) {

      continue;
    }
    if (terrain.river && terrain.river.water_level >= 7) {
      resources.set(hex, new Unit('fish'));
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
      case 9: //hills
      case 10: 
      case 11: 
        //resources.set(hex, new Unit('stone'));
        break;
    }
  }
  return resources;
}

World.prototype.makeCloudsEverywhere = function() {
  for (hex of this.world_map.getHexArray()) {
    if (Hex.distance(new Hex(0,0), hex) > 10)
      this.world_map.get(hex).hidden = true;
    else
      this.world_map.get(hex).hidden = false;
  }
}

World.prototype.createSubCity = function( origin, target ) {

  //Create a new unit
  let new_unit = new Unit('village');

  //change color if conquering
  if (this.getUnit(target))
    new_unit.setGraphic('red',3);

  //Add it to the world
  this.units.set(target, new_unit);
  this.clearClouds(target, 5);

  //add new
  new_unit.colony = this.getUnit(origin).colony;
}

World.prototype.clearClouds = function(position, radius) {
  for (hex of Hex.circle(position, radius)) {
    if (this.world_map.containsHex(hex))
      this.world_map.get(hex).hidden = false;
  }
}













