

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

  this.activation = function(unit, position) {
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
  this.activation = function(unit, position) {
    return unit.cityRadius < 2;
  }
  this.requirement = function(unit, position) {
    return unit.cityRadius < 2;
  };

  this.displayCost = function(unit) {
    return "";
  }

  this.effect = function(world, unit, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
    //unit.civ.resources.wood = 0;
    //unit.civ.resources.stone = 0;
    world.clearClouds(target, 5);
  };

}










//This action transforms the unit into a camp
function actionBecomeCamp() {
  basicAction.call(this);

  this.name = "settle";
  this.type = "target";
  this.target = "target";
  this.min_distance = 0;
  this.max_distance = 0;
  
  this.targetFilterFunction = function(world, unit, hex) {
    return world.noCitiesInArea(hex, 5, unit);
  }
  this.activation = function(unit, position) {
    return unit.civ.resources.food >= 1;
  }
  this.requirement = function(unit, position) {
    return unit.civ.resources.food >= 1;
  };

  this.displayCost = function(unit) {
    return "1 food";
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

  this.name = "resettlement";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;
  this.nextSelection = "target";

  this.targetFilterFunction = function(world, unit, hex) {
    return world.noCitiesInArea(hex,5);
  }
  this.activation = function(unit, position) {
    return true;
  }
  this.requirement = function(unit, position) {
    return unit.civ.resources.food >= 1;
  }

  this.displayCost = function(unit) {
    return "1 food";
  }
  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    let new_unit = new Unit(this.new_unit_type);
    //most of the time, keep the same civilization style
    if (Math.random() < 0.7) 
      new_unit.civ.setType(unit.civ.type);

    world.units.set(target, new_unit);
    world.setCivOnTiles(new_unit.civ, target);
    world.clearClouds(target, 5);
  }

}










//This action transforms the unit into a camp
function actionExtension(min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 2;

  this.name = "expansion";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  this.targetFilterFunction = function(world, unit, hex) {
    return world.noCitiesInArea(hex,2);
  }
  this.activation = function(unit, position) {
    return (unit.civ.resources.food >= 3 && unit.civ.resources.wood >= 1);
  }
  this.requirement = function(unit, position) {
    return (unit.civ.resources.food >= 5 && unit.civ.resources.wood >= 2);
  }

  this.displayCost = function(unit) {
    return "5 food, 2 wood";
  }
  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    let new_unit = new Unit(this.new_unit_type);
    new_unit.civ = unit.civ;
    world.units.set(target, new_unit);
    world.setCivOnTiles(new_unit.civ, target);
    world.clearClouds(target, 5);
  }

}













//This action transforms the unit into a camp
function actionFishermen(min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 0;

  this.name = "fishing-villages";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, unit, position) {


    if (!world.world_map.containsHex(position))
      return false;

    if (!world.noCitiesInArea(position,2))
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

  this.activation = function(unit, position) {
    let fish_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).type == 'fish')
        fish_count++;
    }
    if (fish_count == 0) 
      return false;

    return (unit.civ.resources.food >= 1 && !unit.civ.food_source);
  }
  this.requirement = function(unit, position) {
    let fish_count = 0;
    for (neighbor of position.getNeighbors()) {
      if (world.getResource(neighbor) && 
          world.getResource(neighbor).type == 'fish')
        fish_count++;
    }
    if (fish_count == 0) 
      return false;

    return (unit.civ.resources.food >= 1 && !unit.civ.food_source);
  }

  this.displayCost = function(unit) {
    return "1 food";
  }
  this.effect = function(world, unit, position, target) {
    
    unit.civ.food_source = 'fishing';
    unit.civ.border_growth = true;

    for (new_position of unit.range) {
      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = unit.civ;
      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
    }

  }

}











//This action transforms the unit into a camp
function actionRiverlands(min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 2;

  this.name = "river-farming";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, unit, position) {


    if (!world.world_map.containsHex(position))
      return false;
    
    if (world.getTile(position).river && world.getTile(position).river.water_level >= 9)
      return true;

    return false;
  }

  this.activation = function(unit, position) {
    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (unit.civ.resources.food >= 1 && !unit.civ.food_source);
  }
  this.requirement = function(unit, position) {
    if (!(world.getTile(position).river && world.getTile(position).river.water_level >= 9))
      return false;
    return (unit.civ.resources.food >= 1 && !unit.civ.food_source);
  }

  this.displayCost = function(unit) {
    return "1 food";
  }
  this.effect = function(world, unit, position, target) {
    
    unit.civ.food_source = 'rivers';
    unit.civ.border_growth = true;

    for (new_position of unit.range) {
      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = unit.civ;
      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
    }

  }

}












//This action transforms the unit into a camp
function actionForesters(min_distance, max_distance) {
  basicAction.call(this);

  this.minimum_elevation = 1;

  this.name = "forest-dwellers";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'camp';
  this.min_distance = min_distance;
  this.max_distance = max_distance;

  //return all tiles with fish in range
  this.targetFilterFunction = function(world, unit, position) {

    if (!world.world_map.containsHex(position))
      return false;

    if (!world.noCitiesInArea(position,2))
      return false;
    
    if (world.getResource(position) && world.getResource(position).type == 'wood')
        return true;
    
    return false;

  }

  this.activation = function(unit, position) {
    return (unit.civ.resources.wood >= 1 && !unit.civ.food_source);
  }
  this.requirement = function(unit, position) {
    return (unit.civ.resources.food >= 1 && !unit.civ.food_source);
  }

  this.displayCost = function(unit) {
    return "1 food";
  }
  this.effect = function(world, unit, position, target) {
    
    unit.civ.food_source = 'hunting';
    unit.civ.border_growth = true;

    for (new_position of unit.range) {
      //Create a unit_type at the target location
      let new_unit = new Unit(this.new_unit_type);
      new_unit.civ = unit.civ;
      world.units.set(new_position, new_unit);
      world.setCivOnTiles(new_unit.civ, target);
      world.clearClouds(target, 5);
    }

  }

}












//This action transforms the unit into a camp
function actionConquer(max_distance) {
  basicAction.call(this);
  this.name = "alliance";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 1;
  this.max_distance = max_distance;

  this.targetFilterFunction = function(world, unit, hex) {
    return true;
  }
  this.activation = function(unit, position) {
    return (unit.civ.resources.wood >= 1 && unit.civ.resources.stone >= 1);
  }
  this.requirement = function(unit, position) {
    return (unit.civ.resources.wood >= 2 && unit.civ.resources.stone >= 2);
  };
  this.displayCost = function(unit) {
    return "2 wood, 2 stone";
  }
  this.effect = function(world, unit, position, target) {
    //Make the other city part of this civilization
    let enemy = world.units.get(target);
    enemy.civ = unit.civ;
  }
}
















function actionGrowCity() {
  basicAction.call(this);
  this.name = "grow";
  this.type = "target";
  this.target = "unit";
  this.min_distance = 0;
  this.max_distance = 1;

  this.targetFilterFunction = function(world, unit, hex) {
    return true;
  }
  this.activation = function(unit, position) {
    return (unit.civ.resources.wood >= 1 && unit.cityRadius < 2);
  }
  this.requirement = function(unit, position) {
    return (unit.civ.resources.wood >= 2 && unit.cityRadius < 2);
  };
  this.displayCost = function(unit) {
    return "2 wood";
  }
  this.payCost = function(map, unit, position, target) {
    //unit.civ.resources.wood -= unit.cityRadius*30 ;
  }
  this.effect = function(units, unit, position, target) {
    unit.cityRadius++;
  }
}
