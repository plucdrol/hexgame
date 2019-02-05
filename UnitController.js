///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             UNIT CONTROLLER

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  PathFinder.js 

function UnitController(map, units) {
  this.map = map;
  this.hex_selected = undefined;
  this.city_selected = undefined;
  this.units = units;
  this.stop_city_interval_number = 0;

}
//-------1---------2---------3---------4---------5---------6--------
UnitController.p = UnitController.prototype;

UnitController.p.newMap = function(map) {
  
  this.map = map;
  this.units.removeAll();
}

UnitController.p.createUnit = function(hex, unit_type) {
    var newUnit = new Unit(unit_type);
    this.units.set(hex, newUnit);
  }













//These should be functions of the World itself
//It can call the unit controller for the 
/////////////////////////////////////////////////////////
                  // UNIT CREATION //
/////////////////////////////////////////////////////////


//returns the Unit at position Hex. only a single unit can be on each hex
UnitController.p.unitAtPosition = function(hex) {
  //This function returns false if there is no unit there
  return this.units.get(hex);
}

UnitController.p.getUnit = UnitController.p.unitAtPosition;





















//Unit selection should be moved into UnitSelection class
/////////////////////////////////////////////////////////
                  // UNIT CLICKING //
/////////////////////////////////////////////////////////

UnitController.p.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  if (this.aUnitIsSelected()) {
    this.clickWithUnitSelected(hex);
    
  //if there is no unit selected
  } else {
    this.clickWithNoSelection(hex);
  }
}

writeMessage = function(message) {
  document.getElementById('city-resources').innerHTML = message;
}
writeResources = function(city) {
  var message = "Food:".concat(city.resources.food).concat("/").concat(city.capacity.food)
                 .concat(" Wood:").concat(city.resources.wood).concat("/").concat(city.capacity.wood)
                 .concat(" Stone:").concat(city.resources.stone).concat("/").concat(city.capacity.stone);
  writeMessage(message);
}

UnitController.p.selectNothing = function() {
  this.hex_selected = undefined;
  this.city_selected = undefined;
  clearInterval(this.stop_city_interval_number);
  writeMessage("");
}

UnitController.p.selectCity = function(city) {
  clearInterval(this.stop_city_interval_number);
  this.city_selected = city;
  writeResources(city); 
  function update_function() { 
    writeResources(city); 
  };
  this.stop_city_interval_number = setInterval(update_function, 1000);
}

UnitController.p.selectHex = function(hex) {


  if (hex instanceof Hex) {
    if (this.units.get(hex)) {


      this.hex_selected = hex;
      //look if there is a unit
      var potential_unit = this.units.get(hex);

      if (potential_unit instanceof Unit) { 
        //if the unit exists, find its range
        if (potential_unit.hasComponent('range')) {
          potential_unit.findRange(this.map, hex);
        }
        if (potential_unit.hasComponent('resources')) {
          this.selectCity(potential_unit);
        }
      }
    } 
  } else {
    this.hex_selected = undefined;
      this.selectNothing();
  }
}

UnitController.p.aHexIsSelected = function() {
  return (this.hex_selected instanceof Hex);
}

UnitController.p.getHexSelected = function()  {
  if (this.aHexIsSelected())
    return this.hex_selected;
  else
    return false;
}

UnitController.p.aUnitIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_unit = this.units.get(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    return false;
  }
}
UnitController.p.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.units.get(this.getHexSelected());
  }
}
UnitController.p.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}

UnitController.p.clickWithUnitSelected = function(hex) {
  
  var unit_selected = this.getUnitSelected();
  if (!unit_selected.hasComponent('range') ) {
    this.clickOutsideUnitRange(hex);
    return 0;
  }

  var unit_range = unit_selected.getComponent('range');

  //if you are clicking inside the unit's range
  if (listContainsHex(hex, unit_range) ) {
    this.clickInsideUnitRange(hex);

  //if you are clicking outside the unit's range
  } else {
    this.clickOutsideUnitRange(hex);
  }
}

UnitController.p.clickInsideUnitRange = function(hex) {
  //if you are reclicking the unit
  if ( Hex.equals(this.getHexSelected(), hex)) {
    this.reClickUnit(this.getUnitSelected());
    this.selectHex(hex);
  
  //if you are clicking somewhere else
  } else {
    var command = new UnitCommand(this.map, this.units);
    command.commandUnit(this.getUnitSelected(), this.getHexSelected(), hex);
    this.selectHex(hex);
  }
}

UnitController.p.reClickUnit = function() {
  var command = new UnitCommand(this.map, this.units);
  command.commandUnitToSelf(this.getUnitSelected(),this.getHexSelected());
}

UnitController.p.clickOutsideUnitRange = function(hex) {
  this.selectHex('none');
  this.clickHex(hex);
}
























//Unit commands should be moved into UnitController class
/////////////////////////////////////////////////////////
                  // UNIT COMMAND //
/////////////////////////////////////////////////////////


function UnitCommand(map, units) {
  this.map = map;
  this.units = units;

}
UnitCommand.p = UnitCommand.prototype;

UnitCommand.p.commandUnit = function(unit, hex, new_hex) {
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
    this.moveUnit(current_hex,new_hex);
  }
}

UnitCommand.p.groundActionMoveUnit = function(unit, current_hex, new_hex) {
  //move unit to the new position if you have enough food
  if (unit.hasComponent('resources') ) {
    if (unit.resources.food >= 1) { 
      unit.resources.food -= 1;
      this.moveUnit(current_hex,new_hex);
    } else {
      this.units.remove(current_hex);
    }
  }
}

//Does the current_hex unit's action unto the new_hex unit
UnitCommand.p.commandUnitToOtherUnit = function(unit, current_hex,target_hex) {

  //get both units
  var active_unit = this.units.get(current_hex);
  var target_unit = this.units.get(target_hex);

}

UnitCommand.p.commandUnitToSelf = function(unit, hex) {

  if (unit.hasComponent('self_action_grow')) {

    //this little pieces of code shows how the components are getting unwieldly
    if (unit.resources.wood >= 6*unit.cityRadius*unit.self_action_grow) {
      unit.resources.wood -= 6*unit.cityRadius*unit.self_action_grow;
      unit.cityRadius++;
      unit.capacity.food *= 2;
      unit.capacity.wood *= 2;
      unit.capacity.stone *= 2;
    }

  } 

  //Become another unit if the action is defined
  else if (unit.hasComponent('self_action_become_unit')) {
    var type = unit.getComponent('self_action_become_unit').type;
    var cost = unit.getComponent('self_action_become_unit').cost;
    var cost_resource = unit.getComponent('self_action_become_unit').resource;

    if (unit.resources[cost_resource] >= cost) {
      unit.resources[cost_resource] -= cost;

    
      //keep resources component
      if (unit.resources != undefined) {
        var resources = unit.resources;
      }
      this.units.remove(hex);
      this.units.set(hex, new Unit(type) );

      new_unit = this.units.get(hex);


      if (new_unit.hasComponent('range')) {
        new_unit.findRange(this.map, hex);
      }  
      if (resources != undefined) {
        new_unit.resources = resources;
      }
    }


  } else {
    this.selectHex('none');
  }

}

UnitCommand.p.moveUnit = function(current_hex,next_hex) {
  //calculate movements remaining
  var the_unit = this.units.get(current_hex);
  var max_movement = the_unit.getComponent('movement_left');
  
  //find the path to destination
  var costFunction = the_unit.stepCostFunction.bind(the_unit);
  var neighborFunction = the_unit.getNeighborsFunction.bind(the_unit);
  var costFinder = PathFinder.getCostFinder(costFunction,neighborFunction);
  var cost = costFinder(this.map, current_hex, next_hex, max_movement);
  
  //OPTION A: movement reduces
  //substract it from the movement remaining
  //the_unit.increaseComponent('movement_left', -cost);

  //OPTION B: movement never runs out
  the_unit.setComponent('movement_left', max_movement);
  
  //update the map
  this.units.remove(current_hex);
  this.units.set(next_hex, the_unit);
}
