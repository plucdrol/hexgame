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
'ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','ice',
'clouds'
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



  //create resources map
  this.resources_gotten = 0;
  this.total_resources = 0;

  this.resources = new HexMap();
  this.generateResources();
  this.generateUnknown();

  this.resources_available = 12;
  this.resources_collected = 12;





}

////////////////////////////////////////////////////
/////////// POPULATION FUNCTIONS
////////////////////////////////////////////////////


World.prototype.getPopulation = function() {
  return Math.floor(this.resources_available);
}


World.prototype.getLayout = function() {
  return this.layout;
}





  World.prototype.highlightRange = function(range) {

    for (hex of range) {
      this.getTile(hex).highlighted = true;
    }
  }


  World.prototype.clearHighlights = function() {
    for (hex of this.getHexArray())
      this.getTile(hex).highlighted = false;
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

World.prototype.addUnit = function(hex, unit_type, owner) {

    let new_unit = new Unit(unit_type, owner);
    this.units.set(hex, new_unit);
}

World.prototype.destroyUnit = function(hex) {

    this.units.remove(hex);
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

  //road on tile 2
  if (!this.getTile(hex2).road_from)
    this.getTile(hex2).road_from = [];
  this.getTile(hex2).road_from.push(hex1);

  //road on tile 1
  if (!this.getTile(hex1).road_to)
    this.getTile(hex1).road_to = [];
  this.getTile(hex1).road_to.push(hex2);

}
World.prototype.removeRoads = function(hex) {
  this.getTile(hex).road_from = null;
  this.getTile(hex).road_to = null;
}

World.prototype.getResource = function(hex) {
  return this.resources.get(hex);
}

World.prototype.destroyResource = function(hex) {
  this.resources.remove(hex);
  if (this.getResource(hex))
    this.total_resources -= 1;
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

World.prototype.areRoadConnected = function(hex1, hex2) {

  let tile1 = this.getTile(hex1);
  let tile2 = this.getTile(hex2);

  if (tile1.road_from)
    for (var from1 of tile1.road_from)
      if (Hex.equals(from1, hex2))
        return true;

  if (tile1.road_to)
    for (var from2 of tile1.road_to)
      if (Hex.equals(from2, hex1))
        return true;

  //else
  return false;

}

World.prototype.riverStart = function(position) {
  return this.getTile(position).river_starts_here;
}

World.prototype.nearRiver = function(position, max_distance) {
  for (hex of Hex.circle(position, max_distance)) {
    if (this.getTile(hex))
      if (this.onRiver(hex))
        return true;
  }
}

World.prototype.alongRiver = function(position1, position2) {
  return (this.sameRiver(position1, position2) && 
        (Hex.equals(this.getTile(position1).river.downstream_hex, position2) ||
        Hex.equals(this.getTile(position2).river.downstream_hex, position1))
        );
}

World.prototype.onRiver = function(position) {
  let tile = this.getTile(position);
  return tile && tile.river && tile.river.water_level >= 7;
}

World.prototype.sameRiver = function(position1, position2) {
  return this.onRiver(position1) && this.onRiver(position2) 
          && this.getTile(position1).river.name == this.getTile(position2).river.name;
}

World.prototype.isUpstreamOf = function(upstream_position, position) {
  if (!world.sameRiver(position, upstream_position))
    return false;

  let upstream_tile = this.getTile(upstream_position);
  if (upstream_tile.river.river_starts_here)
    return false;

  if (Hex.equals(upstream_tile.river.downstream_hex, position) )
    return true;

  return this.isUpstreamOf(upstream_tile.river.downstream_hex, position);


}

World.prototype.leavingRiver = function(position1, position2) {
  return (this.onRiver(position1) && this.onWater(position2) && this.getTile(position2).river &&
          this.getTile(position2).river.river_starts_here && 
          this.getTile(position2).river.name == this.getTile(position1).river.name);
}

World.prototype.enteringRiver = function(position1, position2) {
  return this.leavingRiver(position2, position1);
}

World.prototype.onLand = function(position) {
  return (this.getTile(position).elevation >= 2);
}

World.prototype.onWater = function(position) {
  return !this.onLand(position);
}

World.prototype.onMountain = function(position) {
  return land_tiles[ this.getTile(position).elevation ] == 'mountains';
}

World.prototype.onIce = function(position) {
  return land_tiles[ this.getTile(position).elevation ] == 'ice';
}

World.prototype.countLand = function(position, radius, minimum) {
  let count = 0;

  for (neighbor of Hex.circle(position,radius)) {
    if (this.onLand(neighbor))
      count++;

    if (count > minimum)
      return true;
  }

  return false;
}

World.prototype.nearCoast = function(position, min_tiles, max_tiles) {
  let count = 0;
  let max = 6;
  let min = 1;

  if (max_tiles)
    max = max_tiles;

  if (min_tiles)
    min = min_tiles;

  for (neighbor of position.getNeighbors()) {
    if (this.getTile(neighbor) && 
        this.getTile(neighbor).elevation <= 1)
      count++;
  }

  return (count <= max && count >= min) 
}

//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noCitiesInArea = function(position, radius, position_to_ignore) {
  let area = Hex.circle(position, radius);
  for (hex of area) {
    //skip position_to_ignore
    if (position_to_ignore && Hex.equals(hex, position_to_ignore))
      continue;

    //returns false if a city is here
    if (this.units.containsHex(hex) ) {
      if (this.getUnit(hex).type=='city')
        return false;
    }
  }
  //no cities
  return true;
}

//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noUnitTypeInArea = function(position, radius, unit_type, position_to_ignore) {
  let area = Hex.circle(position, radius);
  for (hex of area) {
    //skip position_to_ignore
    if (position_to_ignore && Hex.equals(hex, position_to_ignore))
      continue;
    
    //returns false if a city is here
    if (this.units.containsHex(hex) ) {
      if (this.getUnit(hex).type==unit_type)
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
    if (this.getTile(random_hex).elevation > 15)
      continue;
    this.addResource(random_hex, 'unknown');
    count--;
  }
}

World.prototype.addResource = function(hex, type) {
  this.resources.set(hex, new Unit(type) );
  this.total_resources += 1;
}

World.prototype.generateResources = function() {
  for (let hex of this.world_map.getHexArray() )  {
    let terrain = this.getTile(hex);

    //only 20% of the land gets resources
    if (Math.random() < 0.8) {

      continue;
    }
    if (terrain.river && terrain.river.water_level >= 7) {
      this.addResource(hex, 'fish' );
      continue;
    }
    switch (terrain.elevation) {
      case 1: //coasts
        this.addResource(hex, 'fish' );
        break;
      case 3: //grass
      case 4: 
        this.addResource(hex, 'food');
        break;
      //forest
      case 5: 
      case 6: 
      case 7: 
      case 8: 
        this.addResource(hex, 'wood');
        break;
      case 9: //hills
      case 10: 
      case 11: 
        //resources.set(hex, new Unit('stone'));
        break;
    }
  }
}

World.prototype.makeCloudsEverywhere = function() {
  for (hex of this.world_map.getHexArray()) {
    if (Hex.distance(new Hex(0,0), hex) > 10)
      this.world_map.get(hex).hidden = true;
    else
      this.world_map.get(hex).hidden = false;
  }
}

World.prototype.clearClouds = function(position, radius) {

  if (!position) {
    for (hex of this.world_map.getHexArray())
      this.world_map.get(hex).hidden = false;
  }


  for (hex of Hex.circle(position, radius)) {
    if (this.world_map.containsHex(hex))
      this.world_map.get(hex).hidden = false;
  }
}













