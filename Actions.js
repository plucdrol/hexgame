

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////


//All actions inherit from this action
function Action() {

  //default action settings
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  this.min_distance = 1;
  this.max_distance = 1;
  this.nextSelection = "self";
  this.stop_elevation_up = 100;
  this.stop_elevation_down = -1;
  this.extra_description = "";
  this.also_build_road = true;
  this.cloud_clear = 0;
  this.multi_target = false;
  this.destroy_resource = true;
  this.can_use_roads = false;
  this.infinite_range = false;

  this.river_only = false;

  //evaluates if a target can receive an action
  this.targetFilterFunction = function(world, actor, position, target) {    return true;  }

  //evaluates if the action will be displayed in the list
  this.activation = function(world, actor, position) {    return true;  }

  //evaluates if the action will be enabled in the list
  this.requirement = function(world, actor, position) {    return true;  }

  //additional effects of the action, which happen after the default ones
  this.effect = function(world, actor, position, target) {  }

  this.getDescription = function() {    return this.description;  }

  this.getExtraDescription = function() {    return this.extra_description;  }















  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

  //STOP FUNCTION (for pathfinder)
  this.stopFunction = function(map, hex, next_hex) {
    
    //return false;
    return (map.get(next_hex).elevation >= this.stop_elevation_up && map.get(hex).elevation < this.stop_elevation_up)
        || (map.get(next_hex).elevation <= this.stop_elevation_down && map.get(hex).elevation > this.stop_elevation_down)
        || (this.stop_on_rivers && map.get(next_hex).river && map.get(next_hex).river.water_level >= 7);
  }

  //NEIGHBORS FUNCTION (for pathfinder)
  this.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }


  //STEP COST FUNCTION (for pathfinder)
  this.stepCostFunction = function(map, hex, next_hex) {
    var next_tile = map.get(next_hex);
    var this_tile = map.get(hex);

    if (next_tile.elevation > this.maximum_elevation) 
      return undefined;
    if (next_tile.elevation < this.minimum_elevation) 
      return undefined;

    if (!this.river_only && !this.can_river)
      if(next_tile.river && next_tile.river.water_level >= 7)
        return undefined;

    if (this.river_only) {
      if (!this_tile.river || !next_tile.river)
        return undefined;
      if (!this_tile.river.water_level >= 7 || !next_tile.river.water_level >= 7)
        return undefined;
      if ( !( Hex.equals(this_tile.river.downstream_hex, next_hex ) || Hex.equals(next_tile.river.downstream_hex, hex )   ))
        return undefined;
    }


    let cost = 1;

    if (this.areRoadConnected(map,hex,next_hex) && this.can_use_roads)
      cost = 0.5;

    return cost;
  }

  this.getPathfinder = function() {

    let action = this;

    //get the movement functions
    var stepCostFunction = action.stepCostFunction.bind(action); 
    var neighborFunction = action.getNeighborsFunction.bind(action);
    var stopFunction = action.stopFunction.bind(action); 

    //create a pathfinder to explore the area around the unit
    return new PathFinder(stepCostFunction, neighborFunction, stopFunction);
  }

  this.areRoadConnected = function(map, hex1, hex2) {

  let tile1 = map.getValue(hex1);
  let tile2 = map.getValue(hex2);

  if (tile1.road_from)
    for (var from1 of tile1.road_from)
      if (Hex.equals(from1, hex2))
        return true;

  if (tile2.road_from)
    for (var from2 of tile2.road_from)
      if (Hex.equals(from2, hex1))
        return true;

  //else
  return false;

}




















  /////////////////////////////////////////////////////////
                    // ACTION EFFECTS //
  /////////////////////////////////////////////////////////

  this.doAction = function(world, actor, position, target) {

    if (this.targetIsOK(world, actor, position, target)) {
      
      //Either do a single action or do the action on all targets
      if (this.multi_target) {
        for (hex of actor.range) 
          this.doSingleAction(world, actor, position, hex);
      } else {
        this.doSingleAction(world, actor, position, target);
      }


      this.updateActionRange(world, actor, position);


    //else just select that new location
    } else {
      actor.range = [];
    }  
  };


  //Trigger the effects of the action
  this.doSingleAction = function(world, actor, position, target) {

    world.clearClouds(target, this.cloud_clear);

    if (this.also_build_road)
      this.createRoad(world, position, target);

    if (this.new_unit_type)
      world.addUnit(target, this.new_unit_type, actor);

    if (this.free_pop_cost)
      world.population -= this.free_pop_cost;

    if (this.total_pop_cost)
      world.total_population -= this.total_pop_cost;

    if (this.destroy_resource)
      world.destroyResource(target);

    //then do the action
    this.effect(world, actor, position, target);
  }

  this.targetIsOK = function(world, actor, position, target) {
    let target_object = world.units.get(target);

    if (!this.targetFilterFunction(world, actor, position, target))
      return false;
    if (this.target == "both")
      return true;
    if (!target_object && this.target=="land")
      return true;
    if (target_object && this.target=="unit")
      return true;

    return false;
  };

  this.updateActionRange = function(world, actor, position) {

    actor.range = this.getActionRange(world, actor, position );
  };

  this.getActionRange = function(world, actor, position) {

    let pathfinder = this.getPathfinder();

    if (this.infinite_range) {
      world.clearClouds();
      return [];
    }

    var max_distance = this.max_distance;
    var min_distance = this.min_distance;
    var actionRange = pathfinder.getRange( world.world_map, position, max_distance, min_distance );

    //limit range to elevations
    let upperRange = actionRange.filter(hex => world.getMapValue(hex).elevation >= this.minimum_elevation );
    let middleRange = upperRange.filter(hex => world.getMapValue(hex).elevation <= this.maximum_elevation );

    //clear the clouds over the area explored
    for (let hex of middleRange) {
      for (let neighbor of hex.getNeighbors())
        world.world_map.get(neighbor).hidden = false;
    }

    //remove unsuitable targets
    let filteredRange = middleRange.filter(target => this.targetFilterFunction(world, actor, position, target));

    return filteredRange;
  };

  this.getActionPath = function(world, actor, position, target, extra_max_distance) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance;
    if (extra_max_distance)
      max_distance = extra_max_distance;

    var min_distance = this.min_distance;
    var actionPath = pathfinder.getPath( world.world_map, position, target, max_distance );

    return actionPath;
  };

  this.createRoad = function(world, origin, target) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance;
    var min_distance = this.min_distance;
    var actionPath = pathfinder.getPath( world.world_map, origin, target, max_distance );

    if (actionPath instanceof Array)
      world.buildRoad(actionPath);
  }
}




























//This action transforms the unit into a camp
function actionCreateCity(distance, extra) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "city-by-land";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'city';

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 3;

  this.cloud_clear = 6;

  this.free_pop_cost = 4;

  this.can_use_roads = false;

  this.description = "New city (-4 ants)";
  this.extra_description = "Click somewhere to create a new city";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.getTile(target).elevation >= 2 && world.noCitiesInArea(target,5);
  }
  this.activation = function(world, actor, position) {
    return !actor.can_move;

  }

  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 4;
  }
  this.effect = function(world, actor, position, target) {
    if (extra == 'settled')
      world.getUnit(target).can_move = false;
  }



}

function actionCreateCityBySea(distance) {
  actionCreateCity.call(this);
  this.name = 'city-by-sea';
  this.minimum_elevation = 0;
  this.maximum_elevation = 5;
  this.min_distance = 0;
  this.max_distance = distance;
  this.also_build_road = false;
  this.stop_elevation_up = 2;
  this.can_use_roads = false;

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.getTile(target).elevation >= 2 
           && world.noCitiesInArea(target,5) && world.nearCoast(target);
  }
  this.effect = function(world, actor, position, target) {
    world.unitAtLocation(target).can_move = false;
  }
}

function actionCreateCityByAir() {
  actionCreateCity.call(this);
  this.name = 'city-by-air';
  this.minimum_elevation = 0;
  this.maximum_elevation = 30;
  this.min_distance = 0;
  this.also_build_road = false;
  this.infinite_range = true;
  this.can_use_roads = false;

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.getTile(target).elevation >= 2 
           && world.noCitiesInArea(target,5);
  }

}


//This action transforms the unit into a camp
function actionCreateAirport(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "airport";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'airport';
  this.can_use_roads = true;

  this.nextSelection = "target";
  this.min_distance = 2;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 3;

  this.free_pop_cost = 6;
  
  this.description = "Airport (-6 ants)";
  this.extra_description = "Create a small village to collect some more resources";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.getTile(target).elevation >= 2 && world.noCitiesInArea(target,1);
  }


  this.activation = function(world, actor, position) {
    return world.total_population > 180;
  }

  this.requirement = function(world, actor, position) {
    return world.total_population >= 200;
  }



}


//This action transforms the unit into a camp
function actionCreateVillage(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "village";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'village';
  this.can_use_roads = true;

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 3;

  this.free_pop_cost = 2;
  
  this.description = "Village (-2 ants)";
  this.extra_description = "Create a small village to collect some more resources";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.getTile(target).elevation >= 2 && world.noCitiesInArea(target,1) && world.noUnitTypeInArea(target, 1, 'village');
  }

  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 2;
  }



}


//This action transforms the unit into a camp
function actionCreateRiverDock(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "create-river-dock";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'river-dock';
  this.can_use_roads = false;

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.can_river = true;

  this.cloud_clear = 3;

  this.free_pop_cost = 2;
  
  this.description = "River docks (-2 ants)";
  this.extra_description = "Can gather all resources on a river";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.onRiver(target);
  }
  this.activation = function(world, actor, position) {
    return world.nearRiver(position, 1);
  }
  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 2;
  }



}


//This action transforms the unit into a camp
function actionMoveCity() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "move-city";
  this.type = "target";
  this.target = "land";
  this.can_use_roads = true;

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 5;

  this.also_build_road = true;
  this.hover_radius = 3;

  this.cloud_clear = 6;

  this.total_pop_cost = 1;

  this.description = "Move the city (-1 ants)";
  this.extra_description = "Move your city somewhere else if the area is bad.";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.getTile(target).elevation >= 2 && world.noCitiesInArea(target,5,position);
  }

  this.activation = function(world, actor, position,target) {
    return (actor.can_move);
  }

  this.requirement = function(world, actor, position,target) {
    return (actor.can_move && world.getPopulation() >= 1);
  }

  this.effect = function(world, actor, position, target) {


    actor.moveActionToTop(this);

    world.units.set(target, actor);
    world.destroyUnit(position);
    world.addUnit(position, 'colony', actor);
    


  }



}








//This action transforms the unit into a camp
function actionCreateExpeditionCenter() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "expedition-center";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'expedition-center';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 1;
  this.hover_radius = 0;

  this.free_pop_cost = 4;

  this.cloud_clear = 5;

  this.description = "Expedition Center (-4)";
  this.extra_description = "Explore the area 10 tiles away.<br>Can create cities further away.";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && !world.noCitiesInArea(target,1);
  }
  this.activation = function(world, actor, position) {
    return !world.countUnits(Hex.circle(position, 1), 'expedition-center', 1);
  }
  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 8;
  }
}















//This action transforms the unit into a camp
function actionCreateHarbor() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "harbor";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'harbor';

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = 3;
  this.hover_radius = 0;

  this.cloud_clear = 5;

  this.free_pop_cost = 4;

  this.description = "Harbor (-4 ants)";
  this.extra_description = "Explore and settle the sea.";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.nearCoast(target, 1, 1);
  }
  this.activation = function(world, actor, position) {
    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1);
  }
  this.requirement = function(world, actor, position) {
    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1) &&  world.getPopulation() >= 8;
  }
}







//This action transforms the unit into a camp
function actionCreateLighthouse(distance) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.stop_elevation_up = 2;

  this.name = "lighthouse";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'lighthouse';

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;
  this.hover_radius = 5;

  this.cloud_clear = 5;

  this.free_pop_cost = 2;

  this.can_use_roads = false;

  this.description = "Lighthouse (-2 ants)";
  this.extra_description = "Gather resources in coastal waters";

  this.targetFilterFunction = function(world, actor, position, target) {
    return (!world.unitAtLocation(target) && world.nearCoast(target,2,6) && world.getTile(target).elevation >= 2)
  }
}








//This action transforms the unit into a camp
function actionGetResource(max_distance, multi_target) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.stop_elevation_down = 1;
  this.stop_on_rivers = true;
  this.can_river = true;

  this.name = "get";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;

  this.single_use_remains = true;

  this.cloud_clear = 0;
  this.multi_target = multi_target;

  this.new_unit_type = 'colony';

  this.free_pop_cost = -1;
  this.total_pop_cost = -2;

  this.destroy_resource = false;

  this.description = "Collect resources";
  this.extra_description = "Get all resources up to "+this.max_distance+" tiles away.<br>City can no longer move.";

  this.targetFilterFunction = function(world, actor, position, target) {

    return (
           //dry land food tiles within 3 tiles of the city or...
           (
            world.getTile(target).elevation >= 2 && 
           !world.onRiver(target) &&
           !world.unitAtLocation(target) && 
           world.countResources(Hex.circle(target, 0), 'food', 1)
           ) 
           ||
           //...or shallow water fish besides the city tile
           (
            world.getTile(target).elevation == 1 &&
           !world.unitAtLocation(target) &&
           world.countResources(Hex.circle(target, 0), 'food', 1) &&
           (!world.noCitiesInArea(target, 1) || !world.noUnitTypeInArea(target, 1, 'village'))
            )
           ||
           //...or river fish besides the city tile
           (
            world.onRiver(target) &&
           !world.unitAtLocation(target) &&
           world.countResources(Hex.circle(target, 0), 'food', 1) &&
           (!world.noCitiesInArea(target, 1) || !world.noUnitTypeInArea(target, 1, 'village'))
           )
           );
  }

  this.activation = function (world, actor, position, target) {

    return this.single_use_remains;

  }

  this.effect = function(world, actor, position, target) {
    this.single_use_remains = false;
    actor.can_move = false;
    actor.addPop(1);

  }







}


//This action transforms the unit into a camp
function actionCollectRiverFish(max_distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "collect-river-fish";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 0;
  this.river_only = true;

  this.also_build_road = false;

  this.destroy_resource = false;

  this.free_pop_cost = -1;
  this.total_pop_cost = -2;

  this.multi_target = true;
  this.new_unit_type = 'colony';

  this.description = "Harvest river";
  this.extra_description = "Get all the fish resources in this river";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.sameRiver(position, target)
         && world.countResources(Hex.circle(target, 0), 'food', 1);
  }

  this.activation = function(world, actor, position) {
    return world.onRiver(position);
  }


  this.effect = function(world,actor,position,target) {
    actor.addPop(1);
  }
}


//This action transforms the unit into a camp
function actionGoFishing(max_distance) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.maximum_elevation = 1;

  this.name = "fishing";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 0;

  this.destroy_resource = false;

  this.free_pop_cost = -1;
  this.total_pop_cost = -2;

  this.multi_target = true;
  this.new_unit_type = 'fishing-boat';



  this.description = "Go fishing";
  this.extra_description = "Get all the sea resources up to "+this.max_distance+" tiles away";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.countResources(Hex.circle(target, 0), 'food', 1);
  }

  this.requirement = function(world, actor, position) {
    return world.nearCoast(position);
  }

  this.effect = function(world,actor,position,target) {
    actor.addPop(1);
  }
}






/*
//This action transforms the unit into a camp
function actionCreateCouncilOfQueens() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "council-of-queens";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'council-of-queens';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 10;
  this.hover_radius = 10;

  this.cloud_clear = 5;

  this.free_pop_cost = 4;



  this.description = "Council of queens (-4 ants)";
  this.extra_description = "Get more ants if more queens chambers are nearby";

  this.targetFilterFunction = function(world, actor, position, target) {
    return (world.nearCoast(target) && world.getTile(target).elevation >= 2)
  }


  this.effect = function(world, actor, position, target) {  
      actor.council_connected = true;
      actor.addPop(-1);
      actor.setGraphic('red',6);
  }
}



//This action transforms the unit into a camp
function actionConnectQueensChambers() {
  Action.call(this);

  this.name = "connect-queens-chambers";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 1;
  this.max_distance = 10;
  this.hover_radius = 0;
  this.cloud_clear = 0;

  this.destroy_resource = false;

  this.free_pop_cost = -4;
  this.total_pop_cost = -4;

  this.also_build_road = true;
  this.multi_target = false;

  this.description = "Connect to a Queen's Chamber";
  this.extra_description = "Get more ants for each Queens Chamber nearby";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.countUnits(Hex.circle(target, 0), 'queens-chamber', 1) && !world.getUnit(target).council_connected;
  }


  this.effect = function(world, actor, position, target) { 
    
    let queens_chamber = world.getUnit(target);
    queens_chamber.council_connected = true;
    queens_chamber.setGraphic('red',6);
    actor.pop++;
    queens_chamber.pop--;
  }

}


*/

















