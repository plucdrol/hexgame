/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////																								
//////							UNIT CONTROLLER
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function UnitController(world,world_interface) {
	this.world_interface = world_interface;
	this.world = world;

}

UnitController.prototype.aUnitIsSelected = function() {
	var hex_selected = this.world_interface.getHexSelected();
	var unit_selected = this.world_interface.getUnitSelected();

	return (hex_selected instanceof Hex && unit_selected instanceof Unit);
}

UnitController.prototype.clickWhileNothingSelected = function(hex_clicked) {
	
	this.world_interface.selectHex(hex_clicked);
}


UnitController.prototype.clickWhileUnitSelected = function(hex_clicked) {
	
	//if you are clicking inside the unit's range
	if (this.world.unitAtPosition(this.world_interface.getHexSelected()).components.range.containsHex(hex_clicked)) {
		this.clickInsideSelectedUnitRange(hex_clicked);

	//if you are clicking outside the unit's range
	} else {
		this.clickOutsideSelectedUnitRange(hex_clicked);
	}

}

UnitController.prototype.clickInsideSelectedUnitRange = function(hex_clicked) {
	
	//if you are reclicking the unit
	if ( Hex.equals(this.world_interface.getHexSelected(), hex_clicked)) {
		this.reClickUnit();
	
	//if you are clicking somewhere else
	} else {
		this.tellSelectedUnitToMove(hex_clicked);
	}
}

UnitController.prototype.reClickUnit = function() {
	this.selfActionUnit(this.world_interface.getHexSelected());
}

UnitController.prototype.clickOutsideSelectedUnitRange = function(hex_clicked) {
	this.world_interface.selectHex('none');
	this.world_interface.clickHex(hex_clicked);
}

UnitController.prototype.tellSelectedUnitToMove = function(hex_clicked) {
	
	var unit_there = this.world.unitAtPosition(hex_clicked);

	//Do the unit's action if there is something there
	if (unit_there) {
		this.actionUnit(this.world_interface.hex_selected,hex_clicked);
	
	//Move the unit there if there is nothing
	} else {	
		this.moveUnit(this.world_interface.hex_selected,hex_clicked);
	}

}

//Move the unit from one hex to another hex
UnitController.prototype.moveUnit = function(current_hex,new_hex) {

		//get the unit which is moving
		var unit = this.world.unitAtPosition(current_hex);

		//Create player if unit is a hut
		if (unit.hasComponent('ground_action_create_unit')) {
			this.world.createUnit(new_hex,unit.components.ground_action_create_unit.type);
			
			//reduce the population of the unit by one
			if (unit.components.population > 1) {	
				unit.components.population -= 1;
			} else {
				this.world.units.remove(current_hex);
				this.world_interface.selectHex(new_hex);
			}


		//Move player if unit is a player
		} else {

			//move unit to the new position
			unit.move(this.world.map,current_hex,new_hex);
			this.world.units.set(new_hex,unit);
			this.world.units.remove(current_hex);

			//find the range of the unit at its new position
			this.world.unitAtPosition(new_hex).findRange(this.world.map,new_hex);

			this.world_interface.selectHex(new_hex);
		}
}

//Does the current_hex unit's action unto the new_hex unit
UnitController.prototype.actionUnit = function(current_hex,target_hex) {

	//get both units
	var active_unit = this.world.unitAtPosition(current_hex);
	var target_unit = this.world.unitAtPosition(target_hex);

	//Eat the tree if it is a tree
	if ((active_unit.components.hasOwnProperty('eats_food')) && target_unit.components.hasOwnProperty('food_value')) {
		this.world.removeUnit(target_hex);
		this.moveUnit(current_hex,target_hex);
		active_unit.components.movement_left = active_unit.components.movement;
		active_unit.findRange(this.world.map,target_hex);
		this.world_interface.selectHex(target_hex);
	}

	//increase population if a hut eats a tree
	if (active_unit.components.hasOwnProperty('collects_ressources') && target_unit.components.hasOwnProperty('food_value')) {
		this.world.removeUnit(target_hex);
		active_unit.components.population += 1;
	}


}

UnitController.prototype.selfActionUnit = function(unit_hex) {
	//get the unit
	var active_unit = this.world.unitAtPosition(unit_hex);

	//Become a hut if unit is a player
	if (active_unit.components.hasOwnProperty('self_action_become_unit')) {
		this.world.removeUnit(unit_hex);
		this.world.createUnit(unit_hex,active_unit.components.self_action_become_unit);
		
		new_unit = this.world.unitAtPosition(unit_hex);
		if (new_unit.hasComponent('range')) {
			new_unit.findRange(this.world.map,unit_hex);
		}	
	} else {
		this.world_interface.selectHex('none');
	}

}