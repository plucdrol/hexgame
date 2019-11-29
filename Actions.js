

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////


//All actions inherit from this action
function Action() {
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  this.nextSelection = "self";

  this.activation = function(world, actor, position) {
    return true;
  }

  this.targetFilterFunction = function(world, actor, hex) {
    return world.noCitiesInArea(hex,5);
  }

  //NEIGHBORS FUNCTION (for pathfinder)
  this.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }
  //STEP COST FUNCTION (for pathfinder)
  this.stepCostFunction = function(map, hex, next_hex) {
    var tile = map.get(next_hex);
    if (tile.elevation > this.maximum_elevation) 
      return undefined;
    if (tile.elevation < this.minimum_elevation) 
      return undefined;

    let cost = 1;

    return cost;
  }

  this.getPathfinder = function() {

    let action = this;

    //get the movement functions
    var stepCostFunction = action.stepCostFunction.bind(action); 
    var neighborFunction = action.getNeighborsFunction.bind(action);
    var targetFilterFunction = action.targetFilterFunction.bind(action); 

    //create a pathfinder to explore the area around the unit
    return new PathFinder(stepCostFunction, neighborFunction);
  }

  /////////////////////////////////////////////////////////
                    // ACTION EFFECTS //
  /////////////////////////////////////////////////////////

  this.doAction = function(world, actor, position, target) {

    if (this.targetIsOK(world, target)) {
      
      //then do the action
      this.effect(world, actor, position, target);
      this.updateActionRange(world, actor, position);

    //else just select that new location
    } else {
      actor.range = [];
    }  
  };

  this.targetIsOK = function(world, target) {
    let target_object = world.units.get(target);

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

    var max_distance = this.max_distance | 3;
    var min_distance = this.min_distance | 0;
    var actionRange = pathfinder.getRange( world.world_map, position, max_distance, min_distance );

    //limit range to elevations
    let upperRange = actionRange.filter(hex => world.getMapValue(hex).elevation >= this.minimum_elevation );
    let middleRange = actionRange.filter(hex => world.getMapValue(hex).elevation <= this.maximum_elevation );

    //clear the clouds over the area explored
    for (let hex of middleRange) {
      for (let neighbor of hex.getNeighbors())
        world.world_map.get(neighbor).hidden = false;
    }

    //remove unsuitable targets
    let filteredRange = middleRange.filter(position => this.targetFilterFunction(world, actor, position));

    return filteredRange;
  };

  this.getActionPath = function(world, actor, position, target) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance | 3;
    var min_distance = this.min_distance | 0;
    var actionPath = pathfinder.getPath( world.world_map, position, target, max_distance );

    return actionPath;
  };

  this.createPath = function(world, origin, target) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance | 3;
    var min_distance = this.min_distance | 0;
    var actionPath = pathfinder.getPath( world.world_map, origin, target, max_distance );

    if (actionPath instanceof Array)
      world.buildRoad(actionPath);
  }
}

















//This action transforms the unit into a camp
function actionCreateCamp() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "resettlement";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'village';

  this.nextSelection = "target";
  this.min_distance = 6;
  this.max_distance = 8;

  this.targetFilterFunction = function(world, actor, position) {
    
    //if (!world.countResources(Hex.circle(position, 1), 'food', 1))
      //return false;

    if (world.getTile(position).elevation < 2)
      return false;

    return world.noCitiesInArea(position,5);
  }
  this.activation = function(world, actor, position) {
    return true;
  }
  this.requirement = function(world, actor, position) {

    if (world.getPopulation() >= 4)
      return true;
    return false;
  }

  this.description = function() {
    return "New colony (4 ants)";
  }
  this.effect = function(world, actor, position, target) {
    //Create a unit_type at the target location

    this.createPath(world, position, target);

    world.addUnit(target, this.new_unit_type);
    world.clearClouds(target, 5);
    world.population -= 4;
  }



}







//This action transforms the unit into a camp
function actionCreateQueensChamber() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "queenschamber";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'queens-chamber';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 1;

  this.targetFilterFunction = function(world, actor, position) {

    return !world.noCitiesInArea(position,1);
  }
  this.activation = function(world, actor, position) {
    return true;
  }
  this.requirement = function(world, actor, position) {

    if (world.getPopulation() >= 4)
      return true;
    return false;
  }

  this.description = function() {
    return "Queen's chamber (4 ants)<br>Creates new colonies";
  }
  this.effect = function(world, actor, position, target) {
    //Create a unit_type at the target location
 
    this.createPath(world, position, target);

    world.addUnit(target, this.new_unit_type);
    world.clearClouds(target, 5);
    world.population -= 4;
  }



}










//This action transforms the unit into a camp
function actionCreateSeaExpeditionCenter() {
  Action.call(this);

  this.minimum_elevation = 2;
  this.maximum_elevation = 4;

  this.name = "sea-expedition-center";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'sea-expedition';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 2;

  this.targetFilterFunction = function(world, actor, target) {

    if (!world.nearCoast(target))
      return false;

    return true;
  }
  this.activation = function(world, actor, position) {
    if (world.countUnits(Hex.circle(position, 2), 'fishing-center', 1))
      return true;
    else
      return false;
  }
  this.requirement = function(world, actor, position) {
    if (world.countUnits(Hex.circle(position, 2), 'fishing-center', 1))
      return true;
    else
      return false;
  }

  this.description = function() {
    return "Sea Expeditions (4 ants)<br>Can settle overseas";
  }
  this.effect = function(world, actor, position, target) {
    //Create a unit_type at the target location
  
    this.createPath(world, position, target);
    world.addUnit(target, this.new_unit_type);
    world.clearClouds(target, 5);
    world.population -= 4;
  }



}







//This action transforms the unit into a camp
function actionCreateFishingCenter() {
  Action.call(this);

  this.minimum_elevation = 2;
  this.maximum_elevation = 4;

  this.name = "fishing-center";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'fishing-center';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 2;

  this.targetFilterFunction = function(world, actor, position) {

    if (!world.nearCoast(position))
      return false;

    //if (world.countResources(Hex.circle(position, 1), 'fish', 1))
      return true;
  }
  this.activation = function(world, actor, position) {
    return true;
  }
  this.requirement = function(world, actor, position) {

    return true;
  }

  this.description = function() {
    return "Fishing center (2 ants)<br>Can collect fish";
  }
  this.effect = function(world, actor, position, target) {
    //Create a unit_type at the target location
  
    this.createPath(world, position, target);
    world.addUnit(target, this.new_unit_type);
    world.clearClouds(target, 5);
    world.population -= 2;
  }



}








//This action transforms the unit into a camp
function actionGetResource() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "get";
  this.type = "target";
  this.target = "land";
  this.min_distance = 0;
  this.max_distance = 3;

  this.new_unit_type = 'route';

  this.targetFilterFunction = function(world, actor, position) {

    if (world.unitAtLocation(position))
      return false;

    if (world.countResources(Hex.circle(position, 0), 'food', 1))
      return true;

    if (world.countResources(Hex.circle(position, 0), 'wood', 1))
      return true;

    return false;
  }
  this.activation = function(world, actor, position) {
    return true;
  }
  this.requirement = function(world, actor, position) {
    return true;
  }

  this.description = function() {
    return "Collect resource";
  }

  this.effect = function(world, actor, position, target) {
    
    //Build a road to the resource 
    this.createPath(world, position, target);

    world.addUnit(target, this.new_unit_type);
    world.population += 1;
    world.total_population += 1
  }



}



//This action transforms the unit into a camp
function actionGoFishing() {
  Action.call(this);

  this.minimum_elevation = 1;
  this.maximum_elevation = 1;

  this.name = "fishing";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = 5;

  this.targetFilterFunction = function(world, actor, position) {

    if (world.countResources(Hex.circle(position, 0), 'fish', 1))
      return true;

    return false;
  }
  this.activation = function(world, actor, position) {
    //if (world.total_population >= 20)
      return true;
    //else
      //return false;
  }
  this.requirement = function(world, actor, position) {
    //if (world.total_population < 20)
      //return false;

    if (!world.nearCoast(position))
      return false;

    return true;
  }

  this.description = function() {
    return "Go fishing";
  }

  this.effect = function(world, actor, position, target) {
    
    //Build a road to the resource
    this.createPath(world,position,target);

    world.addResource(target, 'route');
    world.population += 1;
    world.total_population += 1;
  }



}











//This action transforms the unit into a camp
function actionFishermen() {
  Action.call(this);

  this.minimum_elevation = 0;

  this.name = "fishing-villages";
  this.type = "target";
  this.target = "both";
  this.new_unit_type = 'village';
  this.min_distance = 1;
  this.max_distance = 6;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, actor, position) {

    if (!world.world_map.containsHex(position))
      return false;
    
    if (!world.countResources(Hex.circle(position, 1), 'fish', 1))
      return false;

    if (!world.nearCoast( position))
      return false;

    return true;
  }

  this.stepCostFunction = function(map, hex, next_hex) {
    var tile = map.get(hex);
    var next_tile = map.get(next_hex);

    if (tile.elevation > this.maximum_elevation) 
      return undefined;
    if (tile.elevation < this.minimum_elevation) 
      return undefined;
    //movement across land forbidden
    if (tile.elevation > 1 && next_tile.elevation > 1) 
      return undefined;

    let cost = 1;

    return cost;
  }

  this.activation = function(world, actor, position) {



    if (!world.countResources(Hex.circle(position, 1), 'fish', 1))
      return false;

    return (true);
  }
  this.requirement = function(world, actor, position) {

    if (!world.countResources(Hex.circle(position, 1), 'fish', 1))
      return false;

    return (true);
  }

  this.description = function() {
    return "Become fishermen";
  }
  this.effect = function(world, actor, position, target) {

    
    let pathfinder = this.getPathfinder();

    for (new_position of actor.range) {

      world.createSubCity(position, new_position);
    }

  }

}











//This action transforms the unit into a camp
function actionRiverlands() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "river-farming";
  this.type = "target";
  this.target = "both";
  this.new_unit_type = 'village';
  this.min_distance = 1;
  this.max_distance = 5;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, actor, position) {

    if (!world.world_map.containsHex(position))
      return false;
    
    if (world.getTile(position).river && world.getTile(position).river.water_level >= 9)
      return true;

    return false;
  }

  this.activation = function(world, actor, position) {

    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (true);
  }
  this.requirement = function(world, actor, position) {
    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (true);
  }

  this.description = function() {
    return "Become farmers";
  }
  this.effect = function(world, actor, position, target) {
    
    let pathfinder = this.getPathfinder();
    for (new_position of actor.range) {
      world.createSubCity(position, new_position);
      //Build a road to the sub-city
      let tile_array = pathfinder.getPath(world.world_map, position, new_position, 15);   
      world.buildRoad(tile_array);
    }

  }

}













//This action transforms the unit into a camp
function actionForesters() {
  Action.call(this);

  this.minimum_elevation = 1;

  this.name = "forest-dwellers";
  this.type = "target";
  this.target = "both";
  this.new_unit_type = 'village';
  this.min_distance = 1;
  this.max_distance = 6;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, actor, position) {

    if (!world.world_map.containsHex(position))
      return false;
    
    if (world.getResource(position) && world.getResource(position).type == 'wood')
        return true;
    
    return false;

  }

  this.activation = function(world, actor, position) {

    return (true);
  }
  this.requirement = function(world, actor, position) {
    return (true);
  }

  this.description = function() {
    return "Become hunters";
  }
  this.effect = function(world, actor, position, target) {
    
    let pathfinder = this.getPathfinder();
    for (new_position of actor.range) {
      world.createSubCity(position, new_position);

      //Build a road to the sub-city
      let tile_array = pathfinder.getPath(world.world_map, position, new_position, 15);   
      world.buildRoad(tile_array);
    }

  }

}













//This action transforms the unit into a camp
function actionConquer() {
  Action.call(this);
  this.name = "conquer";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 1;
  this.max_distance = 6;

  this.targetFilterFunction = function(world, actor, hex) {
    return (!(world.getUnit(hex) ));
  }
  this.activation = function(world, actor, position) {
    return (true);
  }
  this.requirement = function(world, actor, position) {
    return (true);
  };
  this.description = function() {
    return "Conquer a city";
  }
  this.effect = function(world, actor, position, target) {
    let enemy = world.units.get(target);
  }
}















