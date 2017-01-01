/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
                              
 //             UNIT CONTROLLER

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

function UnitController(world) {
  this.world = world;
  this.hex_selected = undefined;

}
//--------1---------2---------3---------4---------5---------6--------

UnitController.prototype.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  if (this.aUnitIsSelected()) {
    this.clickWithUnitSelected(hex);
    
  //if there is no unit selected
  } else {
    this.clickWithNoSelection(hex);
  }
}

UnitController.prototype.selectHex = function(hex) {
  if (hex instanceof Hex && this.world.map.containsHex(hex)) {
    this.hex_selected = hex;
    //look if there is a unit
    var potential_unit = this.getUnit(hex);

    if (potential_unit instanceof Unit) { 
      //if the unit exists, find its range
      if (potential_unit.hasComponent('range')) {
	console.log(potential_unit+" looks for range starting at");
	console.log(hex);
        potential_unit.findRange(this.world.map,hex);
      }
    } 
  } else {
    this.hex_selected = undefined;
  }
}

UnitController.prototype.aHexIsSelected = function() {
  return (this.hex_selected instanceof Hex);
}

UnitController.prototype.getHexSelected = function()  {
  if (this.aHexIsSelected())
    return this.hex_selected;
  else
    return false;
}

UnitController.prototype.getUnit = function(hex) {
  return this.world.unitAtPosition(hex);
}
UnitController.prototype.aUnitIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_unit = this.getUnit(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    console.log('error no hex selected');
    return false;
  }
}
UnitController.prototype.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.getUnit(this.getHexSelected());
  }
}
UnitController.prototype.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}


UnitController.prototype.clickWithUnitSelected = function(hex) {
  //if you are clicking inside the unit's range
  if (this.getUnitSelected().components.range.containsHex(hex)) {
    this.clickInsideUnitRange(hex);

  //if you are clicking outside the unit's range
  } else {
    this.clickOutsideUnitRange(hex);
  }
}

UnitController.prototype.clickInsideUnitRange = function(hex) {
  //if you are reclicking the unit
  if ( Hex.equals(this.getHexSelected(), hex)) {
    this.reClickUnit();
  
  //if you are clicking somewhere else
  } else {
    this.commandUnit(hex);
  }
}

UnitController.prototype.reClickUnit = function() {
  this.commandUnitToSelf(this.getHexSelected());
}

UnitController.prototype.clickOutsideUnitRange = function(hex) {
  this.selectHex('none');
  this.clickHex(hex);
}

UnitController.prototype.commandUnit = function(hex) {
  var unit_there = this.getUnit(hex);

  //Do the unit's action if there is something there
  if (unit_there) {
    this.commandUnitToOtherUnit(this.getHexSelected(),hex);
  
  //Move the unit there if there is nothing
  } else {  
    this.commandUnitToGround(this.getHexSelected(),hex);
  }
}

//Move the unit from one hex to another hex
UnitController.prototype.commandUnitToGround = function(current_hex,new_hex) {
    //get the unit which is moving
    var unit = this.getUnit(current_hex);
    console.log(unit);

    //Create player if unit is a hut
    if (unit.hasComponent('ground_action_create_unit')) {
      var new_unit_type = unit.components.ground_action_create_unit.type;
      this.world.createUnit(new_hex, new_unit_type);
      
      //reduce the population of the unit by one
      if (unit.components.population > 1) {  
        unit.components.population -= 1;
      } else {
        this.world.units.remove(current_hex);
        this.selectHex(new_hex);
      }


    //Move player if unit is a player
    } else {
      //move unit to the new position
      unit.move(this.world.map,current_hex,new_hex);
      this.world.units.set(new_hex,unit);
      this.world.units.remove(current_hex);

      this.selectHex(new_hex);
    }
}

//Does the current_hex unit's action unto the new_hex unit
UnitController.prototype.commandUnitToOtherUnit = function(current_hex,target_hex) {

  //get both units
  var active_unit = this.getUnit(current_hex);
  var target_unit = this.getUnit(target_hex);

  //Eat the tree if it is a tree
  if (active_unit.hasComponent('eats_food')) { 
    if (target_unit.hasComponent('food_value')) {
      this.world.removeUnit(target_hex);
      this.commandUnitToGround(current_hex,target_hex);
      var full_movement = active_unit.getComponent('movement');
      active_unit.setComponent('movement_left', full_movement);
      console.log(full_movement);
      active_unit.findRange(this.world.map,target_hex);
      this.selectHex(target_hex);
    }
  }

  //increase population if a hut eats a tree
  if (active_unit.hasComponent('collects_ressources')) {
    if (target_unit.hasComponent('food_value')) {
      this.world.removeUnit(target_hex);
      active_unit.increaseComponent('population', 1);
    }
  }
}

UnitController.prototype.commandUnitToSelf = function(unit_hex) {
  //get the unit
  var active_unit = this.getUnit(unit_hex);

  //Become a hut if unit is a player
  if (active_unit.hasComponent('self_action_become_unit')) {
    this.world.removeUnit(unit_hex);
    var type = active_unit.getComponent('self_action_become_unit');
    this.world.createUnit(unit_hex,type);
    
    new_unit = this.getUnit(unit_hex);
    if (new_unit.hasComponent('range')) {
      new_unit.findRange(this.world.map,unit_hex);
    }  
  } else {
    this.selectHex('none');
  }

}
