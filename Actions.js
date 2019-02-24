///////////////////////////////////////////
//
//            HELPER FUNCTIONS FOR UNIT ACTIONS
//
////////////////////////////////////

function clearClouds(world, position, radius) {
  for (hex of Hex.circle(position, 5)) {
    if (world.world_map.containsHex(hex))
      world.world_map.get(hex).hidden = false;
  }
}


function noCitiesInArea(world, unit, position, radius) {
  let area = Hex.circle(position, radius);
  for (hex of area) {
    if (world.units.containsHex(hex) ) {
      if (world.units.get(hex) === unit)
        continue;
      return false;
    }
  }
  //no cities
  return true;
}

function setCivOnTiles(world, civ, position) {
  world.world_map.get(position).civ = civ;
  world.world_map.get(position).culture = 3;
  for (hex of position.getNeighbors()) {
    //skip claimed hexes
    if (!world.world_map.containsHex(hex)) 
      continue;
    //skip water
    if (world.world_map.get(hex).elevation < 2) 
      continue;
    if (!world.world_map.get(hex).civ) {
      world.world_map.get(hex).civ = civ;
      world.world_map.get(hex).culture = 2;
    }
  }
}

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////


//All actions inherit from this action
function basicAction() {
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  this.nextSelection = "self";

  this.activation = function(unit) {
    return true;
  }

  this.targetFilterFunction = function(world, unit, hex) {
    return noCitiesInArea(world, unit, hex,5);
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

    //4 times faster movement on rivers
    /*if (map.get(hex).river && map.get(hex).river.water_level > 7 &&
        map.get(next_hex).river && map.get(next_hex).river.water_level > 7 &&
        (map.get(hex).river.downstream_hex.equals(next_hex) || map.get(next_hex).river.downstream_hex.equals(hex) ) )
      cost = cost/4;*/

    return cost;
  }

}












function actionMove(max_distance, minimum_elevation, maximum_elevation) {
  basicAction.call(this);

  this.name = "move";
  this.type = "target";
  this.target = "land";
  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = max_distance;
  this.minimum_elevation = minimum_elevation;
  this.maximum_elevation = maximum_elevation;
  var action = this;

  this.targetFilterFunction = function(world, unit, hex) {
    return noCitiesInArea(world, unit, hex,5);
  }
  this.nextTarget = function(position, target) {
    return target;
  }
  this.requirement = function(unit) {
    return unit.civ.resources.food >= 1;
  };

  this.displayCost = function(unit) {
    return "1 food/step<br/>All wood&stone";
  }

  this.getCost = function(world, unit, position, target) {
    //calculate the cost of moving
    var costFunction = action.stepCostFunction.bind(action);
    var neighborFunction = action.getNeighborsFunction.bind(action);

    var pathfinder = new PathFinder(costFunction, neighborFunction);
    var foodCost = pathfinder.getCost( world.world_map, position, target, 10 );
    return { food: foodCost };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost(world, unit, position, target).food;
    unit.civ.resources.food -= food_cost;
    if (unit.civ.resources.wood > 10) unit.civ.resources.wood = 10;
    if (unit.civ.resources.stone > 10) unit.civ.resources.stone = 10;
  }

  this.effect = function(world, unit, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
    unit.civ.resources.wood = 0;
    unit.civ.resources.stone = 0;
    clearClouds(world, target, 5);
  };

}










//This action transforms the unit into a camp
function actionBuildCamp() {
  basicAction.call(this);

  this.name = "build-camp";
  this.type = "target";
  this.target = "target";
  this.min_distance = 0;
  this.max_distance = 0;
  
  this.targetFilterFunction = function(world, unit, hex) {
    return noCitiesInArea(world, unit, hex,5);
  }
  this.activation = function(unit) {
    return unit.civ.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.civ.resources.wood >= 5;
  };

  this.displayCost = function(unit) {
    return "5 wood";
  }
  this.getCost = function(world, unit, position, target) {
    //calculate the cost of moving
    return { wood: 5 };
  };

  this.payCost = function(world, unit, position, target) {
    var wood_cost = this.getCost(world, unit, position, target).wood;
    unit.civ.resources.wood -= wood_cost;
  }

  this.effect = function(world, unit, position, target) {
 
    //replace the unit
    world.units.remove( position );
    world.units.set( position, new Unit('camp') );
    new_unit = world.units.get( position );

  }

}











//This action transforms the unit into a camp
function actionCreateCamp(min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 1;

  this.name = "create-camp";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  this.targetFilterFunction = function(world, unit, hex) {
    return noCitiesInArea(world, undefined, hex,5);
  }



  this.activation = function(unit) {
    return unit.civ.resources.food >= 1;
  }
  this.requirement = function(unit) {
    return unit.civ.resources.food >= 30;
  };

  this.displayCost = function(unit) {
    return "30 food";
  }
  this.getCost = function(world, unit, position, target) {
    return { food: 30 };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost(world, unit, position, target).food;
    unit.civ.resources.food -= food_cost;
  }



  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    let new_unit = new Unit(this.new_unit_type);
    world.units.set(target, new_unit);
    setCivOnTiles(world, new_unit.civ, target);
    clearClouds(world, target, 5);

  }

}











//This action transforms the unit into a camp
function actionConquer(max_distance) {
  basicAction.call(this);
  this.name = "conquer";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 1;
  this.max_distance = max_distance;

  this.targetFilterFunction = function(world, unit, hex) {
    return true;
  }
  this.activation = function(unit) {
    return unit.civ.resources.wood >= 30;
  }
  this.requirement = function(unit) {
    return unit.civ.resources.wood >= 100;
  };

  this.displayCost = function(unit) {
    return "100 wood";
  }
  this.getCost = function(world, unit, position, target) {
    return { wood: 100 };
  };

  this.payCost = function(world, unit, position, target) {
    unit.civ.resources.wood -= 100;
  }

  this.effect = function(world, unit, position, target) {
    let enemy = world.units.get(target);

    //take the enemy's resources
    unit.civ.resources.food += enemy.civ.resources.food;
    unit.civ.resources.wood += enemy.civ.resources.wood;
    unit.civ.resources.stone += enemy.civ.resources.stone;

    //Copy this unit at the target
    enemy.civ = unit.civ;
  }

}
















function actionGrowCity() {
  basicAction.call(this);
  this.name = "grow-city";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 0;
  this.max_distance = 0;

  this.targetFilterFunction = function(world, unit, hex) {
    return true;
  }
  this.activation = function(unit) {
    return unit.civ.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.civ.resources.wood >= unit.cityRadius*30;
  };

  this.displayCost = function(unit) {
    return (unit.cityRadius*30).toString().concat(" wood");
  }
  this.getCost = function(map, unit, position, target) {
    return { wood: unit.cityRadius*30 };
  };

  this.payCost = function(map, unit, position, target) {
    var wood_cost = this.getCost(map, unit, position, target).wood;
    unit.civ.resources.wood -= wood_cost;
  }

  this.effect = function(units, unit, position, target) {
    unit.cityRadius++;
  }
}
