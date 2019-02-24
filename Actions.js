

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
    return world.noCitiesInArea(hex,5,unit);
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

    //this is disabled 
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
    return world.noCitiesInArea(hex,5,unit);
  }
  this.requirement = function(unit) {
    return unit.civ.resources.food >= 1;
  };

  this.displayCost = function(unit) {
    return "5 food<br/>All wood&stone";
  }

  this.payCost = function(world, unit, position, target) {
    unit.civ.resources.food -= 5;
    if (unit.civ.resources.wood > 10) unit.civ.resources.wood = 10;
    if (unit.civ.resources.stone > 10) unit.civ.resources.stone = 10;
  }

  this.effect = function(world, unit, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
    unit.civ.resources.wood = 0;
    unit.civ.resources.stone = 0;
    world.clearClouds(target, 5);
  };

}










//This action transforms the unit into a camp
function actionBecomeCamp() {
  basicAction.call(this);

  this.name = "build-camp";
  this.type = "target";
  this.target = "target";
  this.min_distance = 0;
  this.max_distance = 0;
  
  this.targetFilterFunction = function(world, unit, hex) {
    return world.noCitiesInArea(hex, 5, unit);
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
  this.payCost = function(world, unit, position, target) {
    unit.civ.resources.wood -= 5;
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
    return world.noCitiesInArea(hex,5);
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
  this.payCost = function(world, unit, position, target) {
    unit.civ.resources.food -= 30;
  }
  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    let new_unit = new Unit(this.new_unit_type);
    world.units.set(target, new_unit);
    world.setCivOnTiles(new_unit.civ, target);
    world.clearClouds(target, 5);
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
    return (unit.civ.resources.wood >= 1 && unit.cityRadius < 2);
  }
  this.requirement = function(unit) {
    return unit.civ.resources.wood >= unit.cityRadius*30;
  };
  this.displayCost = function(unit) {
    return (unit.cityRadius*30).toString().concat(" wood");
  }
  this.payCost = function(map, unit, position, target) {
    unit.civ.resources.wood -= unit.cityRadius*30 ;
  }
  this.effect = function(units, unit, position, target) {
    unit.cityRadius++;
  }
}
