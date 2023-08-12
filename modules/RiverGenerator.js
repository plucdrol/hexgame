


/////////////////////////////////////////////////////////
///////////////          RIVER  GENERATION //////////////////////
/////////////////////////////////////////////////////////
RiverGenerator = function(world_map) {
  var visited = new HexMap();
  var next = new HexMap();
  this.map = world_map;

  this.isOcean = function(hex) {
    if (!(hex instanceof Hex))
      return false;
    return (this.map.get(hex).elevation < 1);
  }

  this.isWater = function(hex) {
    if (!(hex instanceof Hex))
      return false;
    return (this.map.get(hex).elevation < 2);
  }

  this.oceanNeighbor = function(hex) {
    for (let neighbor of hex.getNeighbors() ) {
      if (this.isOcean(neighbor)) {
        return neighbor;
      }
    }
    return false;
  }

  this.generateRiverName = function() {
    let vowels = ['a','e','i','o','u','a','e','i','o','u', 'an','ou','in','eu'];
    let consonants = ['b','d','f','g','h','j','k','l','m','n','p','r','s','t','v',
                      'b','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','z'];
    let double_consonants = ['p','br','ch','cl','cr','ct','sk','pl','fl','gr','sm'];
    function v(){return vowels[Math.floor(Math.random()*vowels.length)]}
    function c(){return consonants[Math.floor(Math.random()*consonants.length)]}
    function cc(){return double_consonants[Math.floor(Math.random()*double_consonants.length)]}
    return cc()+v()+c()+v()+c();
  }

  this.startRiver = function(hex, downstream_hex) {
    tile = this.map.get(hex);
    tile.river = {};
    tile.river.water_level = 0;
    tile.river.downstream_hex = downstream_hex;
    tile.river.name = this.generateRiverName();
  }

  this.addNeighbors = function(hex) {
    if (!hex instanceof Hex) return;

    for (let neighbor of hex.getNeighbors() ) {
      //skip hexes outside the map
      if (!this.map.containsHex(neighbor))
       continue;
      //skip already waiting hexes
      if (next.containsHex(neighbor))
       continue;
      //skip the water
      if (this.isWater(neighbor))
        continue;
      //skip those with rivers already
      if (this.map.get(neighbor).river)
        continue;

      //add the new hexes to examine, with a pointer to their downstream hex
      next.set(neighbor,hex);
    }

    //remove the previous hex from the list
    next.delete(hex);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  this.getRandomNext = function() {
    var array_length = next.getHexArray().length;
    var random_number = getRandomInt(array_length);
    return next.getHexArray()[random_number];
  }

  this.growRiver = function(hex) {
    var downstream_hex = next.get(hex);
    var tile = this.map.get(hex);
    tile.river = {};
    if (tile.elevation >= 3 && tile.elevation < 12) 
      tile.river.water_level = 1;
    else
      tile.river.water_level = 0;
    tile.river.name = this.map.get(downstream_hex).river.name;
    tile.river.downstream_hex = downstream_hex;
    //add 1 water level to all river tiles downstream until you reach the ocean
    if (tile.elevation >= 3 && tile.elevation < 12)
      this.propagateWaterLevel(hex);
  }

  this.propagateWaterLevel = function(hex) {

    let current_hex = hex;
    let river_tile = this.map.get(current_hex);
    let downstream_hex = river_tile.river.downstream_hex;
    if (!downstream_hex)
      return;
    let next_river_tile = this.map.get(downstream_hex);

    //move down the river and add 1 to all river tiles until the ocean
    while (!this.isWater(downstream_hex)) {

      //add 1 to the lower tiles in the river
      next_river_tile = this.map.get(downstream_hex);
      next_river_tile.river.water_level++;

      //turn sand to grass once enough water is reached
      for (let neighbor of downstream_hex.getNeighbors() ) {
        if (this.map.get(neighbor) && this.map.get(neighbor).elevation == 2 && this.map.get(neighbor).river && this.map.get(neighbor).river.water_level > 5) {
          this.map.get(neighbor).elevation = 3;
        }
      }

      //move down the river
      current_hex = downstream_hex;
      river_tile = this.map.get(current_hex);
      downstream_hex = river_tile.river.downstream_hex;
      if (!(downstream_hex instanceof Hex)) {
        break;
      }

    }
  } 


  //1. Finding coastal tiles
  //check all tiles in the world
  for (let hex of this.map.getHexArray() ) {
    //find their coastal neighbor
    let water_neighbor = this.oceanNeighbor(hex);
    //skip if water tile
    if (this.isOcean(hex)) 
      continue;
    //skip if no coastal neighbor
    if (!water_neighbor) 
      continue;
    //make them tiny rivers with 1 water level
    this.startRiver(hex, water_neighbor);
    //put their land neighbors into a bag, no duplicates
    this.addNeighbors(hex);
  }

  //2. Growing rivers inland
  //as long as there are tiles in the bag
  while (next.getHexArray().length > 0) {

    //pick a tile randomly from the bag
    let nextHex = this.getRandomNext();
    //make it into a river, with 1 water level
    //connect it to the river that made it
    this.growRiver(nextHex);
    //add its neighbors to the bag
    this.addNeighbors(nextHex);
    //console.log(next.getHexArray().length);
  }

  //3. Simulate terrain erosion
  for (let hex of this.map.getHexArray() ) {
    var tile = this.map.get(hex);
    if (tile.river) {
      if (tile.river.water_level <= 2 && tile.elevation >= 3) {
        tile.elevation += 3;
      }
      if (tile.river.water_level >= 10 && tile.elevation >= 6) {
        tile.elevation -= 2;
      }
      if (tile.river.water_level >= 25 && tile.elevation >= 8) {
        tile.elevation -= 2;
      }
    }
  }

  this.getMap = function() {
    return this.map;
  }




}
