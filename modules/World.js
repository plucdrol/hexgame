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
import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import MapGenerator from './MapGenerator.js'
import RiverGenerator from './RiverGenerator.js'
import BonusList from './BonusList.js'
import Unit from './Unit.js'



var land_tiles = [
'ocean',
'coast',
'sand',
'grass','grass',
'forest','forest','forest','forest',
'hills','hills','hills','hills','hills',
'mountains','mountains','mountains','mountains','mountains','mountains',
'ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','atmosphere','ice',
'clouds'
];



export default function World(radius, type, origin) {

  this.radius = radius;
  this.type = type;

  //configure world dimensions
  if (type == 'system') {
    let scale = 60;
    var tile_size = new Point(35*scale, 35*scale);  
    if (!origin)
      var origin = new Point(0,0);
    this.layout = new HexLayout('orientation_flat', tile_size, origin);  
  } else {// == 'planet'
    let scale = 1;
    var tile_size = new Point(35*scale, 35*scale);  
    if (!origin)
      var origin = new Point(15*10*80, 0);  
    this.layout = new HexLayout('orientation_pointy', tile_size, origin);  
  }


  this.world_map = new HexMap();

  if (type == 'system') {
    
    this.world_map = new MapGenerator().makeSystemMap(radius);
    //create units map
    this.units = new HexMap();
    //for (let hex of Hex.circle(new Hex(0,0), 3))
    let hex = new Hex(0,0)
      this.units.set(hex, new Unit('star'));
    //create resources map
    this.resources = new HexMap();
    this.generateSystemResources();
    this.clearClouds();

  } else {

    //create land map
    this.world_map = new MapGenerator('perlin').makeWorldMap(radius);
    this.highlights_on = false;
    this.makeCloudsEverywhere();


    //create units map
    this.units = new HexMap();
    this.resources = new HexMap();

    if (type=='dust')
      this.generateResources();

    if (type=='earth')
      this.world_map = new RiverGenerator(this.world_map).getMap();

  }


}

World.prototype.getTileName = function(elevation) {
  return land_tiles[elevation]
}

World.prototype.getZoom = function() {
  return this.layout.size.x/35;
}

World.prototype.getLayout = function() {
  return this.layout;
}
World.prototype.containsHex = function(hex) {
  return this.hasHex(hex);
}
World.prototype.hasHex = function(hex) {
  return this.world_map.containsHex(hex);
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


World.prototype.getHexes = function() {
  return this.world_map.getHexes();
}

World.prototype.tileCount = function() {
  return this.world_map.size();
}



















////////////////////////////////////////////////////
///////////
///////////         WORLD MAP BASIC FUNCTIONS
///////////
////////////////////////////////////////////////////


World.prototype.getMapValue = function(hex) {
  return this.world_map.getValue(hex);
}
World.prototype.getTile = World.prototype.getMapValue;

World.prototype.getNeighbors = function(hex) {
  return this.world_map.getNeighbors(hex);
}

World.prototype.getActor = function(hex) {
  return this.getUnit(hex);
}


World.prototype.getRandomHex = function() {

  let hex_array = this.world_map.getHexes();
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

World.prototype.destroyUnit = function(hex) {
    this.units.delete(hex);
}




World.prototype.buildRoad = function(hexarray, road_level) {
  let previous_hex;

  if (!road_level)
      road_level = 1;

  for (let hex of hexarray) {
    if (previous_hex && this.getTile(hex)) {
      this.addRoadTile(previous_hex, hex, road_level);
      this.clearClouds(hex,1);

    }
    previous_hex = hex;
  }
}


World.prototype.addRoadTile = function(hex1, hex2, road_level) {

  if (!road_level)
    road_level = 1;

  let world = this;

  function addRoadHalf(hexA, hexB) {

    let tile1 = world.getTile(hexA);
    if (!tile1.road_to) {
      tile1.road_to = new HexMap();
    }

    let new_road = true;

    if ( tile1.road_to.containsHex(hexB) )
      new_road = false;

    if (new_road) {
      tile1.road_to.set(hexB, road_level);

    } else {
      let current_road_level = tile1.road_to.getValue(hexB);
      if (current_road_level < 32) 
        tile1.road_to.set(hexB, current_road_level+road_level );
    } 

    
  }


  addRoadHalf(hex2, hex1);
  addRoadHalf(hex1, hex2);

}

World.prototype.countRoads = function(hex) {
  let count = 0;
  if (this.getTile(hex).road_to)
    count += this.getTile(hex).road_to.size();
  return count;

}

World.prototype.getRoadLevel = function(hex1,hex2) {

  if (!this.areRoadConnected(hex1,hex2))
    return 0;

  if (this.getTile(hex1).road_to)
    return this.getTile(hex1).road_to.getValue(hex2);
  else 
    return 0;
}

World.prototype.biggestRoad = function(hex) {
  let road_level = 0;
  for (let hex2 of this.getNeighbors(hex))
    road_level = Math.max(road_level, this.getRoadLevel(hex,hex2));    
  return road_level

}



World.prototype.removeRoads = function(hex) {
  this.getTile(hex).road_to = null;

}

World.prototype.getResource = function(hex) {
  return this.resources.get(hex);
}

World.prototype.hasResource = function(hex, resource_type = 'food') {
  if (this.getResource(hex))
    return (this.getResource(hex).resources[resource_type] > 0);
  else
    return false;
}

World.prototype.destroyResource = function(hex) {
  this.resources.delete(hex);
  if (this.getResource(hex))
    this.total_resources -= 1;
}

World.prototype.tileExists = function(hex) {
  return (this.world_map.containsHex(hex))
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
  return (this.containsHex(hex) && this.getUnit(hex) instanceof Unit);
}

World.prototype.countUnits = function(hexarray, unit_type, minimum_count) {

  let count = 0;

  for (let hex of hexarray) {
    if (this.getUnit(hex) && this.getUnit(hex).type == unit_type)
      count++;
  }

  return (count >= minimum_count) 


}

World.prototype.countResources = function(hexarray, resource_type) {
  let count = 0;


  for (let hex of hexarray) {
    if (this.getResource(hex) && 
      this.getResource(hex).resources &&
        this.getResource(hex).resources[resource_type])
      count++;
  }

  return count;
}


World.prototype.areRoadConnected = function(hex1, hex2) {

  let tile1 = this.getTile(hex1);
  let tile2 = this.getTile(hex2);

  if (tile1.road_to)
    for (let to1 of tile1.road_to.getHexes())
      if (hex2.equals(to1))
        return true;

  if (tile2.road_to)
    for (let to2 of tile2.road_to.getHexes())
      if (hex1.equals(to2))
        return true;

  //else
  return false;

}

World.prototype.riverStart = function(position) {
  return this.getTile(position).river_starts_here;
}

World.prototype.nearRiver = function(position, max_distance) {
  for (let hex of Hex.circle(position, max_distance)) {
    if (this.getTile(hex))
      if (this.onRiver(hex))
        return true;
  }
}

World.prototype.alongRiver = function(position1, position2) {
  return (this.sameRiver(position1, position2) && 
        (position2.equals(this.getTile(position1).river.downstream_hex) ||
        position1.equals(this.getTile(position2).river.downstream_hex))
        );
}

World.prototype.onRiver = function(position) {
  let tile = this.getTile(position);
  return tile && tile.river && tile.river.water_level > 7;
}

World.prototype.onClouds = function(position) {
  let tile = this.getTile(position);
  return tile.hidden;
}

World.prototype.onMountains = function(position) {
  let tile = this.getTile(position);
  return tile.elevation > 13;
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

  if (position.equals(upstream_tile.river.downstream_hex) )
    return true;

  return this.isUpstreamOf(upstream_tile.river.downstream_hex, position);


}

World.prototype.leavingRiver = function(position1, position2) {
  return (this.onRiver(position1) && this.onWater(position2) && 
          this.getTile(position2).river && this.getTile(position2).river.river_starts_here && 
          this.getTile(position2).river.name == this.getTile(position1).river.name);
}

World.prototype.enteringRiver = function(position1, position2) {
  return this.leavingRiver(position2, position1);
}

World.prototype.onLand = function(position) {
  return (this.getTile(position).elevation >= 2);
}

World.prototype.onSand = function(position) {
  return (this.getTile(position).elevation == 2);
}

World.prototype.onWater = function(position) {
  return !this.onLand(position);
}

World.prototype.onOcean = function(position) {
  return this.getTile(position).elevation == 0;
}

World.prototype.onMountain = function(position) {
  return this.getTileName( this.getTile(position).elevation ) == 'mountains';
}

World.prototype.onIce = function(position) {
  return this.getTileName(  this.getTile(position).elevation ) == 'ice';
}

World.prototype.countLand = function(position, radius, minimum) {
  let count = 0;

  for (let neighbor of Hex.circle(position,radius)) {
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

  for (let neighbor of position.getNeighbors()) {

    if (this.getTile(neighbor) && 
        this.getTile(neighbor).elevation <= 1)
      count++;
  }

  return (count <= max && count >= min) 
}

//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noCitiesInArea = function(position, radius, position_to_ignore) {
  let area = Hex.circle(position, radius);

  for (let hex of area) {
    //skip position_to_ignore
    if (position_to_ignore && hex.equals(position_to_ignore))
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
  for (let hex of area) {
    //skip position_to_ignore
    if (position_to_ignore && hex.equals(position_to_ignore))
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

World.prototype.addLocalResource = function(hex) {
  let terrain = this.getTile(hex);

  if (terrain.river && terrain.river.water_level >= 7) {
      this.addResource(hex, 'fish' );
      return;
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

World.prototype.generateResources = function() {
  for (let hex of this.world_map.getHexes() )  {
    
    //only 20% of the land gets resources
    if (Math.random() < 0.8) 
      continue;

    this.addLocalResource(hex);
  }
}

World.prototype.generateSystemResources = function() {


  for (let hex of this.world_map.getHexes() )  {
    let terrain = this.getTile(hex);
    
    //only 20% of the land gets these resources
    if (Math.random() < 0.8) {
      continue;
    }
    if ((hex.distanceToCenter() >= this.radius*0.4) 
      && (hex.distanceToCenter() <= this.radius*0.5) 
      || (hex.distanceToCenter() >= this.radius*0.9)) {
      this.addResource(hex, 'asteroid');
    }


    //only 1% of land gets these resources
    if (Math.random() < 0.97) {
      continue;
    }
    if (Math.random() < hex.distanceToCenter()/(this.radius)) {
      continue;
    }

    //sometimes a gas giant
    if (Math.random() < 0.3) {
      this.resources.set(hex, new Unit('giant'));
      for (let neighbor of hex.getNeighbors()) {
        if (Math.random() < 0.3) {
          this.addResource(neighbor, 'planet');
        }
      }
      continue;
    }

    //otherwise a rocky planet
    this.addResource(hex, 'planet'); 
  }
}

World.prototype.makeCloudsEverywhere = function() {
  for (let hex of this.world_map.getHexes()) {
      this.world_map.get(hex).hidden = true;
  }
}

World.prototype.clearClouds = function(position, radius) {

  if (!position) {
    for (var hex of this.world_map.getHexes())
      this.world_map.get(hex).hidden = false;
    return;
  }

  if (!radius) {
    this.world_map.get(position).hidden = false;
    return;
  }


  for (var hex of Hex.circle(position, radius)) {
    if (this.world_map.containsHex(hex))
      this.world_map.get(hex).hidden = false;
  }
  return;
}
















////////////////////////////////////////////////
/////        UI PERFORMANCE FUNCTION          //
////////////////////////////////////////////////


  World.prototype.highlightRange = function(original_range, color) {
    this.highlights_on = true;

    let range = original_range.concat(); //makes a copy of the array, in case it gets modified later
    let counter = 0;
    let step_time = 100;
    let world = this;

    function stepByStepHighlight() {
        let hex = range[counter];
          
        if (counter >= range.length)
          return;
        if (!world.containsHex(hex))
          return;

        let tile = world.getTile(hex);
        
        if (!tile.highlighted)
          tile.highlighted = [];

        //skip tiles if already the right color
        if (tile.highlighted[color]) {
          counter++;
          stepByStepHighlight();
        } else {

          //color the tile with the new color
          if (color) {
            tile.highlighted[color] = true;
            world.clearClouds(hex,3);
          } else {
            tile.highlighted['neutral'] = true;
          }

          //go to the next tile in 100ms
          counter++;
          if (counter < range.length)
            setTimeout(stepByStepHighlight, step_time);
        }

      }
      stepByStepHighlight();

  }








  ////////////////////////////////////////////////
/////        BONUS-RELATED FUNCTION          //
////////////////////////////////////////////////

World.prototype.bonusEnabled = function(bonus_name) {
  return this.bonus_list.bonusEnabled(bonus_name);
}

