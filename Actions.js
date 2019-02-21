
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
  this.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }
  //STEP COST FUNCTION
  this.stepCostFunction = function(map, hex, next_hex) {

    var tile = map.get(next_hex);
    if (tile.elevation > this.maximum_elevation) {
       return undefined;
    }
    if (tile.elevation < this.minimum_elevation) {
       return undefined;
    }
    let cost = 1;

    //4 times faster movement on rivers
    if (map.get(hex).river && map.get(hex).river.water_level > 7 &&
        map.get(next_hex).river && map.get(next_hex).river.water_level > 7 &&
        (map.get(hex).river.downstream_hex.equals(next_hex) || map.get(next_hex).river.downstream_hex.equals(hex) ) )
      cost = cost/4;

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

  this.nextTarget = function(position, target) {
    return target;
  }
  this.requirement = function(unit) {
    return unit.resources.food >= 1;
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
    unit.resources.food -= food_cost;
    if (unit.resources.wood > 10) unit.resources.wood = 10;
    if (unit.resources.stone > 10) unit.resources.stone = 10;
  }

  this.effect = function(world, unit, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
    unit.wood = 0;
    unit.stone = 0;
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
  
  this.activation = function(unit) {
    return unit.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.wood >= 5;
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
    unit.resources.wood -= wood_cost;
  }

  this.effect = function(world, unit, position, target) {
 
    //replace the unit
    world.units.remove( position );
    world.units.set( position, new Unit('camp') );
    new_unit = world.units.get( position );

    //keep resources of the old unit
    if (unit.resources) {
      new_unit.resources = unit.resources;
    }

  }

}











//This action transforms the unit into a camp
function actionCreateUnit(unit_type, min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 1;

  this.name = "create-".concat(unit_type);
  this.type = "target";
  this.target = "land";
  this.new_unit_type = unit_type;
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  function noCitiesInArea(world, position, radius) {
    let area = Hex.circle(position, radius);
    for (hex of area) {
      if (world.units.containsHex(hex)) {
        return false;
      }
    }
    //no cities
    return true;
  }

  this.activation = function(unit) {
    return unit.resources.food >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.food >= 30;
  };

  this.displayCost = function(unit) {
    return "30 food";
  }
  this.getCost = function(world, unit, position, target) {
    return { food: 30 };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost(world, unit, position, target).food;
    unit.resources.food -= food_cost;
  }



  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    if (noCitiesInArea(world,target,2))
      world.units.set(target, new Unit(this.new_unit_type));
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

  this.activation = function(unit) {
    return unit.resources.wood >= 30;
  }
  this.requirement = function(unit) {
    return unit.resources.wood >= 100;
  };

  this.displayCost = function(unit) {
    return "100 wood";
  }
  this.getCost = function(world, unit, position, target) {
    return { wood: 100 };
  };

  this.payCost = function(world, unit, position, target) {
    var wood_cost = this.getCost(world, unit, position, target).wood;
    unit.resources.wood -= wood_cost;
  }

  this.effect = function(world, unit, position, target) {
    let enemy = world.units.get(target);

    //take the enemy's resources
    unit.food += enemy.food;
    unit.wood += enemy.wood;
    unit.stone += enemy.stone;

    //Copy this unit at the target
    world.units.set(target, unit);
  }

}
















function actionGrowCity() {
  basicAction.call(this);
  this.name = "grow-city";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 0;
  this.max_distance = 0;

  this.activation = function(unit) {
    return unit.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.wood >= unit.cityRadius*30;
  };

  this.displayCost = function(unit) {
    return (unit.cityRadius*30).toString().concat(" wood");
  }
  this.getCost = function(map, unit, position, target) {
    return { wood: unit.cityRadius*30 };
  };

  this.payCost = function(map, unit, position, target) {
    var wood_cost = this.getCost(map, unit, position, target).wood;
    unit.resources.wood -= wood_cost;
  }

  this.effect = function(units, unit, position, target) {
    unit.cityRadius++;
  }
}
