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
  this.units = units;

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
  if (this.units.containsHex(hex)) {
    return this.units.getValue(hex);
  } else {
    return false;
  }
}

UnitController.p.getUnit = UnitController.p.unitAtPosition;











//Unit selection should be moved into UnitSelection class
/////////////////////////////////////////////////////////
                  // UNIT SELECTION //
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

UnitController.p.selectHex = function(hex) {
  if (hex instanceof Hex) {
    if (this.unitAtPosition(hex)) {

      this.hex_selected = hex;
      //look if there is a unit
      var potential_unit = this.unitAtPosition(hex);

      if (potential_unit instanceof Unit) { 
        //if the unit exists, find its range
        if (potential_unit.hasComponent('range')) {
          potential_unit.findRange(this.map, hex);
        }
      }
    } 
  } else {
    this.hex_selected = undefined;
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

  var maybe_unit = this.unitAtPosition(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    return false;
  }
}
UnitController.p.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.unitAtPosition(this.getHexSelected());
  }
}
UnitController.p.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}

UnitController.p.clickWithUnitSelected = function(hex) {
  
  var unit_selected = this.getUnitSelected();
  if (!unit_selected.hasComponent('range') ) {
    this.clickOutsideUnitRange(hex);
    console.log('outside range');
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
    this.reClickUnit();
  
  //if you are clicking somewhere else
  } else {
    this.commandUnit(hex);
  }
}

UnitController.p.reClickUnit = function() {
  this.commandUnitToSelf(this.getHexSelected());
}

UnitController.p.clickOutsideUnitRange = function(hex) {
  this.selectHex('none');
  this.clickHex(hex);
}













//Unit commands should be moved into UnitCommand class
/////////////////////////////////////////////////////////
                  // UNIT COMMAND //
/////////////////////////////////////////////////////////

UnitController.p.commandUnit = function(hex) {
  var unit_there = this.unitAtPosition(hex);

  //Do the unit's action if there is something there
  if (unit_there) {
    this.commandUnitToOtherUnit(this.getHexSelected(),hex);
  
  //Move the unit there if there is nothing
  } else {  
    this.commandUnitToGround(this.getHexSelected(),hex);
  }
}

//Move the unit from one hex to another hex
UnitController.p.commandUnitToGround = function(current_hex,new_hex) {
    //get the unit which is moving
    var unit = this.unitAtPosition(current_hex);

    //if the unit has an action to create more units
    if (unit.hasComponent('ground_action_create_unit')) {
      var new_unit_type = unit.components.ground_action_create_unit.type;
      this.units.create(new_hex, new_unit_type);
      
      //reduce the population of the unit by one
      if (unit.components.population > 1) {  
        unit.components.population -= 1;
      } else {
        this.units.remove(current_hex);
        this.selectHex(new_hex);
      }

    //if the unit has an action to change the terrain
    } else if (unit.hasComponent('ground_action_change_terrain')) {
      var current_terrain_value = this.map.getValue(new_hex).components.elevation;
      var new_terrain_value = unit.components.ground_action_change_terrain.new_value;
      var affectable_terrain_value = unit.components.ground_action_change_terrain.affectable_value;

      console.log(current_terrain_value);
      console.log(affectable_terrain_value);
      if (current_terrain_value == affectable_terrain_value) {
        let tile = this.map.getValue(new_hex);
        tile.components.elevation = new_terrain_value;
      } else {

        //move unit to the new position
        this.moveUnit(current_hex,new_hex);
        this.selectHex(new_hex);
      }



    //Move player if unit is a player
    } else {
      //move unit to the new position
      this.moveUnit(current_hex,new_hex);

      this.selectHex(new_hex);
    }
}

//Does the current_hex unit's action unto the new_hex unit
UnitController.p.commandUnitToOtherUnit = function(current_hex,target_hex) {

  //get both units
  var active_unit = this.unitAtPosition(current_hex);
  var target_unit = this.unitAtPosition(target_hex);

  //Eat the tree if it is a tree
  if (active_unit.hasComponent('eats_food')) { 
    if (target_unit.hasComponent('food_value')) {
      this.units.remove(target_hex);
      this.commandUnitToGround(current_hex,target_hex);
      var full_movement = active_unit.getComponent('movement');
      active_unit.setComponent('movement_left', full_movement);
      active_unit.findRange(this.map,target_hex);
      this.selectHex(target_hex);
    }
  }

  //increase population if a hut eats a tree
  if (active_unit.hasComponent('collects_ressources')) {
    if (target_unit.hasComponent('food_value')) {
      this.units.remove(target_hex);
      active_unit.increaseComponent('population', 1);
    }
  }
}

UnitController.p.commandUnitToSelf = function(unit_hex) {
  //get the unit
  var active_unit = this.unitAtPosition(unit_hex);

  //Become a hut if unit is a player
  if (active_unit.hasComponent('self_action_become_unit')) {
    this.units.remove(unit_hex);
    var type = active_unit.getComponent('self_action_become_unit');
    this.units.create(unit_hex, type);
    
    new_unit = this.unitAtPosition(unit_hex);
    if (new_unit.hasComponent('range')) {
      new_unit.findRange(this.map, unit_hex);
    }  
  } else {
    this.selectHex('none');
  }

}

UnitController.p.moveUnit = function(current_hex,next_hex) {
  //calculate movements remaining
  var the_unit = this.unitAtPosition(current_hex);
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
  this.units.place(next_hex, the_unit);
  this.units.remove(current_hex);
}
