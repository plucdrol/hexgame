


/////////////////////////////////////////////////////////
///////////////          RIVER  GENERATION //////////////////////
/////////////////////////////////////////////////////////

//Must be supplied with a pregenerated map. Will add rivers to it.


import Hex from './u/Hex.js'
import {HexMap} from './u/Hex.js'

export default function RiverGenerator (map) {
  var visited = new HexMap();
  var next = new HexMap();

  addRivers();

  //Call this to get the updated map
  this.getMap = () => map;

  function isOcean(hex) {
    if (!(hex instanceof Hex))
      return false;
    return (map.get(hex).elevation < 1);
  }

  function isCoastal(hex) {
    for (let neighbor of hex.getNeighbors() ) {
      if (!map.get(neighbor))
        continue;
      if (map.get(neighbor).elevation < 2) {
        return true;
      }
    }
    return false;
  }

  function isWater(hex) {
    if (!(hex instanceof Hex))
      return false;
    return (map.get(hex).elevation < 2);
  }

  function oceanNeighbor(hex) {
    for (let neighbor of hex.getNeighbors() ) {
      if (isOcean(neighbor)) {
        return neighbor;
      }
    }
    return false;
  }

  function generateRiverName() {
    let vowels = ['a','e','i','o','u','a','e','i','o','u', 'an','ou','in','eu'];
    let consonants = ['b','d','f','g','h','j','k','l','m','n','p','r','s','t','v',
                      'b','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','z'];
    let double_consonants = ['p','br','ch','cl','cr','ct','sk','pl','fl','gr','sm'];
    function v(){return vowels[Math.floor(Math.random()*vowels.length)]}
    function c(){return consonants[Math.floor(Math.random()*consonants.length)]}
    function cc(){return double_consonants[Math.floor(Math.random()*double_consonants.length)]}
    return cc()+v()+c()+v()+c();
  }

  function startRiver(hex, downstream_hex) {
    var tile = map.get(hex);
    tile.river = {};
    tile.river.river_starts_here = true;
    tile.river.water_level = 0;
    tile.river.downstream_hex = downstream_hex;
    tile.river.name = generateRiverName();
  }

  function addNeighbors(hex) {
    if (!hex instanceof Hex) return;

    for (let neighbor of hex.getNeighbors() ) {
      //skip hexes outside the map
      if (!map.containsHex(neighbor))
       continue;
      //skip already waiting hexes
      if (next.containsHex(neighbor))
       continue;
      //skip the water
      if (isWater(neighbor))
        continue;
      if (isCoastal(neighbor) && !isWater(hex))
        continue;
      //skip those with rivers already
      if (map.get(neighbor).river)
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

  function getRandomNext() {
    return next.getRandomHex();
  }

  function growRiver(hex) {

    //get current water hex
    var downstream_hex = next.get(hex);
    var downstream_tile = map.get(downstream_hex);

    //create new tile
    var tile = map.get(hex);
    tile.river = {};
    if (tile.elevation >= 3 && tile.elevation < 9) 
      tile.river.water_level = 1;
    else
      tile.river.water_level = 0;
    tile.river.name = map.get(downstream_hex).river.name;
    tile.river.downstream_hex = downstream_hex;

    //add this new river branch to the lower river tile
    if (!downstream_tile.river.upstream_hexes)
      downstream_tile.river.upstream_hexes = [];
    downstream_tile.river.upstream_hexes.push(hex);

    //add 1 water level to all river tiles downstream until you reach the ocean
    if (tile.elevation >= 3 && tile.elevation < 12)
      propagateWaterLevel(hex);
  }

  function propagateWaterLevel(hex) {

    let current_hex = hex;
    let river_tile = map.get(current_hex);
    let downstream_hex = river_tile.river.downstream_hex;
    if (!downstream_hex)
      return;
    let next_river_tile = map.get(downstream_hex);

    //move down the river and add 1 to all river tiles until the ocean
    while (!isWater(downstream_hex)) {

      //add 1 to the lower tiles in the river
      next_river_tile = map.get(downstream_hex);
      next_river_tile.river.water_level++;

      //turn sand to grass once enough water is reached
      for (let neighbor of downstream_hex.getNeighbors() ) {
        if (map.get(neighbor) && map.get(neighbor).elevation == 2 && map.get(neighbor).river && map.get(neighbor).river.water_level > 5) {
          map.get(neighbor).elevation = 3;
        }
      }

      //move down the river
      current_hex = downstream_hex;
      river_tile = map.get(current_hex);
      downstream_hex = river_tile.river.downstream_hex;
      if (!(downstream_hex instanceof Hex)) {
        break;
      }

    }
  } 


  






  function addRivers() {
    //1. Finding coastal tiles
    //check all tiles in the world
    for (let hex of map.getHexes() ) {
      //find their coastal neighbor
      let water_neighbor = oceanNeighbor(hex);
      //skip if water tile
      if (isOcean(hex)) 
        continue;
      //skip if no coastal neighbor
      if (!water_neighbor) 
        continue;
      //make them tiny rivers with 1 water level
      startRiver(hex, water_neighbor);
      //put their land neighbors into a bag, no duplicates
      addNeighbors(hex);
    }

    //2. Growing rivers inland
    //as long as there are tiles in the bag
    while (next.size() > 0) {

      //pick a tile randomly from the bag
      let nextHex = getRandomNext();
      //make it into a river, with 1 water level
      //connect it to the river that made it
      
      growRiver(nextHex);
      //add its neighbors to the bag
      addNeighbors(nextHex);
      //console.log(next.size());
    }

    //3. Simulate terrain erosion
    for (let hex of map.getHexes() ) {
      var tile = map.get(hex);
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
  }






}
