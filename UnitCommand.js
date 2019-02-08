

/////////////////////////////////////////////////////////
                  // UNIT COMMAND //
/////////////////////////////////////////////////////////


function UnitCommand(map, units) {
  this.map = map;
  this.units = units;

}
UnitCommand.p = UnitCommand.prototype;

UnitCommand.p.commandUnit = function(unit, hex, new_hex) {
  console.log(JSON.stringify(unit.actions));
  var unit_there = this.units.get(new_hex);

  //Do the unit's action if there is something there
  if (unit_there) {
    this.commandUnitToOtherUnit(unit, hex, new_hex);
  
  //Move the unit there if there is nothing
  } else {  

    this.commandUnitToGround(unit, hex, new_hex);

  }
}

//Move the unit from one hex to another hex
UnitCommand.p.commandUnitToGround = function(unit, hex, new_hex) {

  //if the unit has an action to create more units
  if (unit.hasComponent('ground_action_create_unit')) {
    this.groundActionCreateUnit(unit, new_hex);

  //if the unit has an action to change the terrain
  } else if (unit.hasComponent('ground_action_change_terrain')) {
    this.groundActionChangeTerrain(unit, new_hex);

  //Move player if unit is a player
  } else {
    this.groundActionMoveUnit(unit, hex, new_hex);
  }
}

UnitCommand.p.commandUnitToSelf = function(unit, hex) {

  console.log(JSON.stringify(unit.actions));
  console.log(unit.self_action_grow);
  if (unit.hasComponent('self_action_grow')) {
    this.selfActionGrow(unit, hex);
  } 

  //Become another unit if the action is defined
  else if (unit.hasComponent('self_action_become_unit')) {
    this.selfActionBecomeUnit(unit, hex);
  } else {
    this.selectHex('none');
  }

}

//Does the current_hex unit's action unto the new_hex unit
UnitCommand.p.commandUnitToOtherUnit = function(unit, current_hex,target_hex) {

  //get both units
  var active_unit = this.units.get(current_hex);
  var target_unit = this.units.get(target_hex);

  //nothing happens

}












//



UnitCommand.p.groundActionCreateUnit = function(unit, new_hex) {
  var new_unit_type = unit.ground_action_create_unit;
  if (unit.hasComponent('resources') && unit.resources.food >= 30) {
    unit.resources.food -= 30;
    this.units.set(new_hex, new Unit(new_unit_type));
  }
}

UnitCommand.p.groundActionChangeTerrain = function(unit, new_hex) {
  var current_terrain_value = this.map.getValue(new_hex).elevation;
  var new_terrain_value = unit.ground_action_change_terrain.new_value;
  var affectable_terrain_value = unit.ground_action_change_terrain.affectable_value;

  if (current_terrain_value == affectable_terrain_value) {
    let tile = this.map.getValue(new_hex);
    tile.elevation = new_terrain_value;
  } else {

    //move unit to the new position
    this.moveUnit(unit, current_hex,new_hex);
  }
}

UnitCommand.p.groundActionMoveUnit = function(unit, current_hex, new_hex) {

  //move unit to the new position if you have enough food
  if (unit.hasComponent('resources') ) {

    //calculate the cost of moving
    //this stuff should be under unit or pathfinder or something
    var costFunction = unit.stepCostFunction.bind(unit);
    var neighborFunction = unit.getNeighborsFunction.bind(unit);
    var getFunction = unit.getFunction.bind(unit);
    var pathfinder = new PathFinder(getFunction, costFunction, neighborFunction);
    var cost = pathfinder.getCost( this.map, current_hex, new_hex, unit.movement_left );

    if (unit.resources.food < cost) { 
      return;
    }

    unit.resources.food -= cost;

    //calculate movements remaining
    //unit.movement_left = unit.resources.food;
    var max_movement = unit.resources.food;//unit.movement_left; 

    //update the map
    this.units.remove(current_hex);
    this.units.set(new_hex, unit);

    //unit.setComponent('movement_left', max_movement);
    unit.findRange(this.map, new_hex);
  }
}



UnitCommand.p.selfActionGrow = function(unit, hex) {
  console.log('try growing');
  if (unit.resources.wood >= unit.getGrowCost() ) {
    unit.resources.wood -= unit.getGrowCost();
    unit.cityRadius++;
    unit.capacity.food *= 2;
    unit.capacity.wood *= 2;
    unit.capacity.stone *= 2;
  }
}

UnitCommand.p.selfActionBecomeUnit = function(unit, hex) {
  console.log('try become unit');
  var type = unit.self_action_become_unit.type;
  var cost = unit.self_action_become_unit.cost;
  var cost_resource = unit.self_action_become_unit.resource;


  if (unit.resources.wood >= 1) {
    unit.resources.wood -= 1;

  
    //keep resources component
    if (unit.resources != undefined) {
      var resources = unit.resources;
    }
    console.log('creating house');
    this.units.remove(hex);
    this.units.set(hex, new Unit('camp') );

    new_unit = this.units.get(hex);


    if (new_unit.hasComponent('range')) {
      new_unit.findRange(this.map, hex);
    }  
    if (resources != undefined) {
      new_unit.resources = resources;
    }
  }
}

