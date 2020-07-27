


  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

 function ActionPathfinder(action) {

    this.action = action;

    //get the movement functions
    let self = this;
    var stepCostFunction = self.stepCostFunction.bind(self); 
    var neighborFunction = self.getNeighborsFunction.bind(self);
    var stopFunction = self.stopFunction.bind(self); 

    //create a pathfinder to explore the area around the unit
    PathFinder.call(this, stepCostFunction, neighborFunction, stopFunction);
 }










 ActionPathfinder.prototype.getPathfinder = function() {
  return this.pathfinder;
 }

  //STOP FUNCTION (for pathfinder)
  ActionPathfinder.prototype.stopFunction = function(world, hex, next_hex, origins = null) {
    
    //make origins into an array if it is only a single hex
    if (origins && !Array.isArray(origins))
      origins = [origins];

    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    //climbing from water to land
    if (world.onWater(hex) && world.onLand(next_hex)) {

      if (this.action.stop_on_coast && (world.noUnitTypeInArea(next_hex, 0, 'city') || !this.action.disembark_at_cities)  )
        return true;
    }

    //leaving a river

    //entering a river from land (except the river tip tile)
    if (!world.onRiver(hex) && world.onRiver(next_hex) && world.onLand(hex) 
      && world.onLand(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'city') && next_tile.river.water_level != 7 ) {
      
      if (this.action.stop_on_rivers)
        return true;
    }

    
    //stepping from land to water, without a river      
    if (world.onLand(hex) && world.onWater(next_hex) && !world.leavingRiver(hex, next_hex) && !world.enteringRiver(hex,next_hex)) { 

      if (this.action.stop_on_water)
        return true;

      let is_coastal_start = false;
      if (this.action.coastal_start)
        for (let origin of origins) {
          if (Hex.equals(hex,origin))
            is_coastal_start = true;
        }
        if (is_coastal_start)
          return true;
    }

    
    
    return false;
  }









  //NEIGHBORS FUNCTION (for pathfinder)
  ActionPathfinder.prototype.getNeighborsFunction = function(world, hex) {
    return world.world_map.getNeighbors(hex);
  }








  //STEP COST FUNCTION (for pathfinder)
  ActionPathfinder.prototype.stepCostFunction = function(world, hex, next_hex, origins) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);


    let action = this.action;

    //going into clouds
    if (next_tile.hidden)
      if (!action.can_explore)
        return undefined;

    //going into moutains
    if (next_tile.elevation > 13)
      return undefined;

    if (world.onWater(next_hex)) {
      if (!action.can_water)
        return undefined;


    }

    if (world.onDesert(next_hex))
      if (!action.can_desert)
        return undefined;


    //walking on land, no river
    if (world.onLand(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex)) {
      if (!action.can_land) {
        return undefined;
      }
    }

    //stepping out of a river
    if (world.onRiver(hex) && !world.onRiver(next_hex)) {
      if (action.stay_on_rivers)
        return undefined;
    }

    //stepping onto a river from dry land
    if( !world.onRiver(hex) && world.onRiver(next_hex) && next_tile.river.water_level != 7) {
      if (!action.river_only && !action.can_river)
        return undefined;
    }

    //entering a deep sea tile
    if (world.onOcean(next_hex)) {
      if (!action.can_ocean)
        return undefined;
    }
    
    //climbing into water, but not from a river
    if (world.onLand(hex) && world.onWater(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {

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
          if (Hex.equals(origin, hex))
            continue;
          else
            return undefined;
        }
      }

    }

    //climbing from water to land without a river
    if (world.onWater(hex) && world.onLand(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {
      if (action.no_climbing_ashore)
        return undefined;
    }

    //if not along a river
    if (!world.alongRiver(hex, next_hex) ) {
      if (action.river_only)
        return undefined;
    }

    //if along a river
    if (world.alongRiver(hex, next_hex) ) {
      if (!action.can_river || (action.stop_on_rivers && !action.stay_on_rivers ))
        return undefined;
    }
    


    let cost = 1;



    if (world.onWater(hex) && world.onWater(next_hex))
      cost= 2;

    if (world.onWater(next_hex) && action.slow_in_water)
      cost = 100;

    if (world.onWater(hex) && world.onLand(next_hex) && action.slow_in_water)
      cost = 200;

    if (world.onLand(hex) && world.onWater(next_hex) && action.slow_in_water)
      if (world.noCitiesInArea(hex,0))
        cost = 10;
      else
        cost = 1;

    if ((world.areRoadConnected(hex,next_hex) && (action.can_use_roads) )) {

      if (action.double_road_speed )
        cost = 0;

      if (action.double_highway_speed && world.getRoadLevel(hex,next_hex) >= 2)
        cost = 0;

    }

    


    return cost;
  }




