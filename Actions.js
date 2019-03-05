

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

  this.activation = function(world, civ, position) {
    return true;
  }

  this.targetFilterFunction = function(world, civ, hex) {
    return world.noCitiesInArea(hex,5);
  }

  this.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }
  //STEP COST FUNCTION
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

    actor.range = this.getActionRange(world, actor );
  };

  this.getActionRange = function(world, actor) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance | 3;
    var min_distance = this.min_distance | 0;
    var actionRange = pathfinder.getRange( world.world_map, actor.tile_array, max_distance, min_distance );
    let landRange = actionRange.filter(hex => world.getMapValue(hex).elevation > 1 );

    //clear the clouds over the area explored
    for (let hex of landRange) {
      for (let neighbor of hex.getNeighbors())
        world.world_map.get(neighbor).hidden = false;
    }

    //remove unsuitable targets
    let filteredRange = landRange.filter(position => this.targetFilterFunction(world, actor, position));

    return filteredRange;
  };

  this.getActionPath = function(world, actor, target) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance | 3;
    var min_distance = this.min_distance | 0;
    var actionPath = pathfinder.getPath( world.world_map, actor.tile_array, target, max_distance );

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









/*

function actionMove() {
  Action.call(this);

  this.name = "move";
  this.type = "target";
  this.target = "land";
  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = 5;
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  var action = this;

  this.targetFilterFunction = function(world, civ, hex) {
    let food_count = 0;

    for (neighbor of hex.getNeighbors().concat(hex) ) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).resources.food >= 1)
        food_count++;
    }
    if (food_count == 0) 
      return false;

    return world.noCitiesInArea(hex,5);
  }
  this.activation = function(world, civ, position) {
    return civ.resources.food < 1;
  }
  this.requirement = function(world, civ, position) {
    return civ.resources.food < 1;
  };

  this.description = function() {
    return "Move somewhere<br/> with more food";
  }

  this.effect = function(world, civ, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
    //unit.civ.resources.wood = 0;
    //unit.civ.resources.stone = 0;
    world.clearClouds(target, 5);
  };

}*/










//This action transforms the unit into a camp
function actionBecomeCamp() {
  Action.call(this);

  this.name = "settle";
  this.type = "target";
  this.target = "target";
  this.min_distance = 0;
  this.max_distance = 0;
  
  this.targetFilterFunction = function(world, civ, hex) {
    return world.noCitiesInArea(hex, 5);
  }
  this.activation = function(world, civ, position) {
    return civ.resources.food >= 1;
  }
  this.requirement = function(world, civ, position) {
    return civ.resources.food >= 1;
  };

  this.description = function() {
    return "Found a <br/> camp here";
  }
  this.effect = function(world, civ, position, target) {
 
    //replace the unit
    world.units.remove( position );
    world.units.set( position, new Unit('village') );
    new_unit = world.units.get( position );
  }
}











//This action transforms the unit into a camp
function actionCreateCamp() {
  Action.call(this);

  this.minimum_elevation = 1;

  this.name = "resettlement";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'village';
  this.min_distance = 6;
  this.max_distance = 8;

  this.targetFilterFunction = function(world, civ, hex) {
    let food_count = 0;
    for (neighbor of hex.getNeighbors().concat(hex)) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).resources.food >= 1)
        food_count++;
    }
    if (food_count == 0) 
      return false;

    return world.noCitiesInArea(hex,5);
  }
  this.activation = function(world, civ, position) {
    return true;
  }
  this.requirement = function(world, civ, position) {
    return true;
  }

  this.description = function() {
    return "Send settlers to<br/> found a new village";
  }
  this.effect = function(world, civ, position, target) {
    //Create a unit_type at the target location
    let new_unit = new Unit(this.new_unit_type);
    //most of the time, keep the same civilization style
    if (Math.random() < 0.7) 
      new_unit.civ.setType(civ.type);

    new_unit.previous_position = position;     
    this.createPath(world, civ.tile_array, target);

    world.units.set(target, new_unit);
    world.setCivOnTiles(new_unit.civ, target);
    world.clearClouds(target, 5);
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
  this.targetFilterFunction = function(world, civ, position) {
    if (targetIsSameCiv(civ, position))
      return false;

    if (!world.world_map.containsHex(position))
      return false;
    
    let fish_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).type == 'fish')
        fish_count++;
    }
    if (fish_count == 0) 
      return false;

    let coast_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getTile(neighbor) && 
          world.getTile(neighbor).elevation == 1)
        coast_count++;
    }
    if (coast_count == 0) 
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

  this.activation = function(world, civ, position) {

    if (!world.populationUnlock(1))
      return false;

    let fish_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).type == 'fish')
        fish_count++;
    }
    if (fish_count == 0) 
      return false;

    return (civ.resources.food >= 1 && !civ.food_source);
  }
  this.requirement = function(world, civ, position) {

    let fish_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).type == 'fish')
        fish_count++;
    }
    if (fish_count == 0) 
      return false;

    return (civ.resources.food >= 1 && !civ.food_source);
  }

  this.description = function() {
    return "Become fishermen<br/> requires fish";
  }
  this.effect = function(world, civ, position, target) {
    
    civ.food_source = 'fishing';
    civ.border_growth = true;

    for (new_position of civ.range) {

      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = civ;
      new_unit.setGraphic('white',3);
      if (world.getUnit(new_position)) {
        new_unit.setGraphic('red',3);
      }
      new_unit.capital_position = position;

      this.createPath(world, position, new_position);

      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
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
  this.targetFilterFunction = function(world, civ, position) {
    if (targetIsSameCiv(civ, position))
      return false;

    if (!world.world_map.containsHex(position))
      return false;
    
    if (world.getTile(position).river && world.getTile(position).river.water_level >= 9)
      return true;

    return false;
  }

  this.activation = function(world, civ, position) {
    if (!world.populationUnlock(1))
      return false;
    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (!civ.food_source);
  }
  this.requirement = function(world, civ, position) {
    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (!civ.food_source);
  }

  this.description = function() {
    return "Become farmers<br/> must be on river";
  }
  this.effect = function(world, civ, position, target) {
    
    civ.food_source = 'farming';
    civ.border_growth = true;

    for (new_position of civ.range) {
      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = civ;
      new_unit.setGraphic('white',3);
      if (world.getUnit(new_position)) {
        new_unit.setGraphic('red',3);
      }

      new_unit.capital_position = position;

      this.createPath(world, position, new_position);

      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
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
  this.targetFilterFunction = function(world, civ, position) {

    if (targetIsSameCiv(civ, position))
      return false;

    if (!world.world_map.containsHex(position))
      return false;
    
    if (world.getResource(position) && world.getResource(position).type == 'wood')
        return true;
    
    return false;

  }

  this.activation = function(world, civ, position) {
    if (!world.populationUnlock(1))
      return false;
    return (civ.resources.wood >= 1 && !civ.food_source);
  }
  this.requirement = function(world, civ, position) {
    return (civ.resources.food >= 1 && !civ.food_source);
  }

  this.description = function() {
    return "Become hunters</br> must be near forests";
  }
  this.effect = function(world, civ, position, target) {
    
    civ.food_source = 'hunting';
    civ.border_growth = true;

    for (new_position of civ.range) {
      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = civ;
      new_unit.setGraphic('white',3);
      if (world.getUnit(new_position)) {
        new_unit.setGraphic('red',3);
      }

      new_unit.capital_position = position;

      this.createPath(world, position, new_position);

      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
    }

  }

}








function targetIsSameCiv(civ, target) {
  return (world.getUnit(target) && world.getUnit(target).civ == civ)
}




//This action transforms the unit into a camp
function actionConquer() {
  Action.call(this);
  this.name = "conquer";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 1;
  this.max_distance = 6;

  this.targetFilterFunction = function(world, civ, hex) {
    return (!(world.getUnit(hex) && targetIsSameCiv(civ,hex)));
  }
  this.activation = function(world, civ, position) {
    if (!world.populationUnlock(3))
      return false;
    return (civ.resources.wood >= 1 && civ.resources.stone >= 1);
  }
  this.requirement = function(world, civ, position) {
    return (civ.resources.wood >= 2 && civ.resources.stone >= 2);
  };
  this.description = function() {
    return "Conquer a city";
  }
  this.effect = function(world, civ, position, target) {
    //Make the other city part of this civilization
    let enemy = world.units.get(target);
    enemy.civ = civ;
  }
}















