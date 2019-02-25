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
  this.units.set(new Hex(0,0), new Unit('camp'));
  this.units.get(new Hex(0,0)).civ.resources.food = 300;

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
    setInterval( self.everySecond().bind(self), 1000 );
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
World.prototype.getTile = World.prototype.getMapValue;

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
      case 9: //hills
      case 10: 
      case 11: 
        resources.set(hex, new Unit('stone'));
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
















///////////////////////////////////////////
//
//            FUNCTION RUN EVERY SECOND ON THE WORLD
//
////////////////////////////////////

//This function is created in WORLD for now, because we need access to the map
//Move it somewhere else where it belongs
World.prototype.everySecond = function() {
  
  return function(){

    this.setCityCulture();
    this.spreadCulture();
    this.collectResources();


    drawScreen();
  }
}
World.prototype.setCityCulture = function() {

  //set the culture of the city and surrounding tiles
  for (let hex of this.units.getHexArray() )  {
    if (!this.getUnit(hex).civ)
      continue;

    let tile = this.getTile(hex);
    tile.civ = this.getUnit(hex).civ;
    tile.culture = this.getUnit(hex).cityRadius+2;

  }
}


World.prototype.spreadCulture = function() {
  for (let hex of this.world_map.getHexArray() )  {
    let tile = this.getTile(hex);
    //ignore tiles with no civilization already
    if (!tile.civ) 
      continue;

    //reduce culture value of 1 per second
    if (tile.culture < 1) {
      tile.civ = undefined;
      tile.culture = 0;
    } else {
      tile.culture = tile.culture-1;
    }

    //spread that civ to all neighbor tiles
    for (let neighbor_hex of hex.getNeighbors()) {
      //skip tiles outside the map
      if (!this.world_map.containsHex(neighbor_hex))
        continue;

      if (tile.culture < 1)
          continue;


      //check the neighbor tile
      let neighbor_tile = this.getTile(neighbor_hex);
      if ((neighbor_tile.elevation < 14) || neighbor_tile.civ) {
        if (neighbor_tile.culture >= tile.culture)
          continue;

        //spready to neighbors
        neighbor_tile.civ = tile.civ;
        neighbor_tile.culture = tile.culture-1;
        neighbor_tile.hidden = false;
      }
    }

  }
}

World.prototype.collectResources = function() {
  let total_food = 0;

  //set resource total to 0 to start counting
  for (let unit_hex of this.units.getHexArray() ) {
    let unit = this.units.get(unit_hex);
    if (unit.civ && unit.civ.resources) {
      unit.civ.resources.food = 0;
      unit.civ.resources.wood = 0;
      unit.civ.resources.stone = 0;
    }
  }

  //add up all the food in civ tiles
  for (let hex of this.world_map.getHexArray() ) {

    //for each tile with a civilization
    let tile = this.getTile(hex);
    if (!tile.civ)
      continue;

    //add the resources to the civilization
    if (this.resources.containsHex(hex)) {
      let resource = this.getResource(hex);
      let resource_type = resource.resource_type;
      tile.civ.resources[resource_type] += resource.resource_value;
      if (resource_type == 'food')
        total_food += resource.resource_value*10;
    }

    //add food for rivers
    if (this.world_map.containsHex(hex)) {
      let river = this.getTile(hex).river;
      if (river && river.water_level >= 7) {
        tile.civ.resources.food += 1;
        total_food += 10;
      }
    }
  }

  this.total_population = Math.floor(total_food*(1+Math.random()*0.2));
}























///////////////////////////////////////////
//
//            HELPER FUNCTIONS FOR THE WORLD
//
////////////////////////////////////


World.prototype.clearClouds = function(position, radius) {
  for (hex of Hex.circle(position, 5)) {
    if (this.world_map.containsHex(hex))
      this.world_map.get(hex).hidden = false;
  }
}





//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noCitiesInArea = function(position, radius, unit_to_ignore) {
  let area = Hex.circle(position, radius);
  for (hex of area) {
    if (this.units.containsHex(hex) ) {
      if (this.units.get(hex) === unit_to_ignore)
        continue;
      return false;
    }
  }
  //no cities
  return true;
}

World.prototype.setCivOnTiles = function(civ, position) {
  this.world_map.get(position).civ = civ;
  this.world_map.get(position).culture = 3;
}