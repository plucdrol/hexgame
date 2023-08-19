


  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

import PathFinder from './u/PathFinder.js'


export default function ActionPathfinder(action) {

  //create a pathfinder to explore the area around the unit
  PathFinder.call(this, stepCostFunction, getNeighborsFunction, stopFunction);

  function getPathfinder() {
    return this.pathfinder;
  }

  //The StopFunction determines which steps makes the pathfinding end, for example embarking into water
  //It does not determine which steps are IMPOSSIBLE, those are determined in the step cost function
  function stopFunction(world, hex, next_hex, origins = null) {
    
    //make origins into an array if it is only a single hex
    if (origins && !Array.isArray(origins))
      origins = [origins];

    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    //climbing from water to land
    if (world.onWater(this_tile) && world.onLand(next_tile)) {

      if (action.stop_on_coast && (world.noUnitTypeInArea(next_hex, 0, 'city') || !action.disembark_at_cities)  )
        return true;
    }

    //leaving a river

    //entering a river from land (except the river tip tile)
    if (!world.onRiver(this_tile) && world.onRiver(next_tile) && world.onLand(this_tile) 
      && world.onLand(next_tile) && world.noUnitTypeInArea(next_hex, 0, 'city')) {
      
      if (action.stop_on_rivers)
        return true;
    }

    
    //stepping from land to water, without a river      
    if (world.onLand(this_tile) && world.onWater(next_tile) && !world.leavingRiver(this_tile, next_tile) && !world.enteringRiver(this_tile,next_tile)) { 

      //stop if you must stop_on_water
      if (action.stop_on_water)
        return true;
    }

    
    
    return false;
  }









  //NEIGHBORS FUNCTION (for pathfinder)
  function getNeighborsFunction(world, hex) {
    return world.getNeighbors(hex);
  }








  //STEP COST FUNCTION (for pathfinder)
  function stepCostFunction(world, hex, next_hex, origins) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);

    let cost = 1;

    if (action.sky_action) {
      return 1;
    }

    // COST IS UNDEFINED FOR THE FOLLOWING IMPOSSIBLE ACTIONS:

    if (world.onClouds(next_tile))
      if (!action.can_explore)
        return undefined;

    if (world.onMountains(next_tile))
      return undefined;

    if (world.onWater(next_tile)) 
      if (!action.can_water)
        return undefined;

    if (world.onSand(next_tile))
      if (!action.can_desert)
        return undefined;

    //walking on land, no river
    if (world.onLand(this_tile) && world.onLand(next_tile) && !world.alongRiver(this_tile, next_tile)) 
      if (!action.can_land) 
        return undefined;


    //stepping out of a river
    if (world.onRiver(this_tile) && !world.onRiver(next_tile)) 
      if (action.stay_on_rivers)
        return undefined;

    //stepping onto a river from dry land
    if( !world.onRiver(this_tile) && world.onRiver(next_tile)) 
      if (!action.river_only && !action.can_river)
        return undefined;

    //entering a deep sea tile
    if (world.onOcean(next_tile)) 
      if (!action.can_ocean)
        return undefined;
    
    //climbing into water, but not from a river
    if (world.onLand(this_tile) && world.onWater(next_tile) && !world.enteringRiver(this_tile, next_tile) && !world.leavingRiver(this_tile, next_tile)) {

      //cannot water
      if (!action.can_water)
        return undefined;

      //can embark at any city
      if ( !action.coastal_start && action.embark_at_cities) {
        if (world.noCitiesInArea(hex,0))
          return undefined;
      }

      //coastal starts cannot enter water except from their start position
      if ( action.coastal_start && !action.embark_at_cities) {
        for (let origin of origins) {
          if (hex.equals(origin))
            continue;
          else
            return undefined;
        }
      }

    }

    //climbing from water to land without a river
    if (world.onWater(this_tile) && world.onLand(next_tile) && !world.enteringRiver(this_tile, next_tile) && !world.leavingRiver(this_tile, next_tile)) {
      if (action.no_climbing_ashore)
        return undefined;
    }

    //if not along a river
    if (!world.alongRiver(this_tile, next_tile) ) {
      if (action.river_only)
        return undefined;
    }

    //if along a river
    if (world.alongRiver(this_tile, next_tile) ) {
      if (!action.can_river || (action.stop_on_rivers && !action.stay_on_rivers ))
        return undefined;
    }
    


    // IF ACTION IS POSSIBLE, DETERMINING THE COST:
    if (world.onWater(this_tile) && world.onWater(next_tile))
      cost= 1;

    if (world.onWater(this_tile) && world.onWater(next_tile) && action.slow_in_water)
      cost = 2;

    if (world.onWater(this_tile) && world.onLand(next_tile) && action.slow_in_water)
      cost = 2;

    if (world.onLand(this_tile) && world.onWater(next_tile) && action.slow_in_water)
      if (world.noCitiesInArea(hex,0))
        cost = 10;
      else
        cost = 1;

    if ((world.areRoadConnected(this_tile,next_tile) && (action.can_use_roads) ))
      if (action.double_road_speed )
        cost = 0.01;




    


    return cost;
  }


}

