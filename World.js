
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////																								
//////							WORLD DATA REPRESENTATION
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


function World(size,layout) {


	
	this.layout = layout;
	this.size = size;

	this.button_ids = 1; //increments with every new button

	//and a bunch of units in it
	this.units = new HexMap();

	this.map = new HexMap();
	//A world is composed of a world map...
	this.generateWorldMap(size);

}

//create a new Unit at position Hex
World.prototype.createUnit = function(hex,unit_type) {
	
	//create new unit and add it to the map
	var newUnit = new Unit(unit_type);
	this.units.set(hex,newUnit);
}

//delete the new Unit at position Hex
World.prototype.removeUnit = function(hex) {
	this.units.remove(hex);
}




//returns the Unit at position Hex. For now only a single unit can be on each hex
World.prototype.unitAtPosition = function(hex) {
	if (this.units.containsHex(hex)) {
		return this.units.getValue(hex);
	} else {
		return false;
	}
}

World.prototype.generateWorldMap = function(size) {

	//delete tree units
	for (let hex of this.units.getArray())	{
		var unit = this.units.getValue(hex);
		if (unit.unit_type  == 'tree') {
			this.removeUnit(hex);
		}
	}

	//make a new map from scratch
	var map_generator = new HexMapGenerator();
	//this.map = map_generator.generateMap('perlin_custom',size,base,scales,scales, multis);
	map_generator.generateMap('perlin_custom',size);
	this.map = map_generator.getMap();

	this.addTreesToMap();
	this.addFishToMap();

}

World.prototype.addTreesToMap = function() {
	//add trees (this is the wrong place for world-generaion code)
	for (let hex of this.map.getArray()) {
		var hex_value = this.map.getValue(hex);
		if (hex_value >= 4 && hex_value <= 9) {
			if (Math.random() < 0.2) {
				this.createUnit(hex,'tree');
			}
		}
	}
}

World.prototype.addFishToMap = function() {
	//add fish (this is the wrong place for world-generaion code)
	for (let hex of this.map.getArray()) {
		var hex_value = this.map.getValue(hex);
		if (hex_value === 1) {
			if (Math.random() < 0.1) {
				this.createUnit(hex,'fish');
			}
		}
	}
}
















/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////																								
//////							WORLD INTERFACE
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


function WorldInterface(world,view) {
	
	this.world = world;
	this.hex_selected = 'undefined';
	this.hex_hovered = new Hex(0,0);
	this.hex_hovered_previous = new Hex(0,0);
	this.edge_hovered = 'undefined';
	this.view = view;
}

WorldInterface.prototype.setView = function(view) {
	this.view = view;
}
WorldInterface.prototype.getView = function() {
	return this.view;
}

WorldInterface.prototype.moveView = function(direction) {
	
	this.view.move(direction,0.2);
}
WorldInterface.prototype.zoomView = function(zoom) {
	
	this.view.zoom(zoom);
	drawScreen();
}

WorldInterface.prototype.getHex = function(screen_position) {
	var world_position = this.view.screenToWorld(screen_position);
	var hex = Hex.round(this.world.layout.pointToHex(world_position));
	return hex;
}

WorldInterface.prototype.setHex = function(screen_position,value) {
	var hex = this.getHex(screen_position);
	this.world.map.set(hex,value);
}

WorldInterface.prototype.hover = function(screen_position) {
	
	//get the hex being hovered
	this.hex_hovered = this.getHex(screen_position);

	//if the mouse moved to a new hex, redraw the screen
	if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
		drawScreen();
	}

	//remember the currently hovered hex
	this.hex_hovered_previous = this.hex_hovered;
}

WorldInterface.prototype.clickScreen = function(screen_position) {

	var hex_clicked = this.getHex(screen_position);
	this.clickHex(hex_clicked);
	drawScreen();

}

WorldInterface.prototype.clickHex = function(hex_clicked) {

	//if there is already a unit on the hex selected
	if (this.aUnitIsSelected()) {
		this.clickWhileUnitSelected(hex_clicked);
		
	//if there is no unit selected
	} else {
		this.clickWhileNothingSelected(hex_clicked);
	}
}



WorldInterface.prototype.aUnitIsSelected = function() {
	return (this.hex_selected instanceof Hex && this.world.unitAtPosition(this.hex_selected) instanceof Unit);
}

WorldInterface.prototype.clickWhileNothingSelected = function(hex_clicked) {
	
	//move the selection
	this.hex_selected = hex_clicked;

	//look if there is a unit
	var potential_unit = this.world.unitAtPosition(hex_clicked);

	if (potential_unit instanceof Unit) { 
		//if the unit exists, find its range
		potential_unit.findRange(this.world.map,hex_clicked);
	} 
}


WorldInterface.prototype.clickWhileUnitSelected = function(hex_clicked) {
	
	//if you are clicking inside the unit's range
	if (this.world.unitAtPosition(this.hex_selected).range.containsHex(hex_clicked)) {
		this.clickInsideSelectedUnitRange(hex_clicked);

	//if you are clicking outside the unit's range
	} else {
		this.clickOutsideSelectedUnitRange(hex_clicked);
	}

}

WorldInterface.prototype.clickInsideSelectedUnitRange = function(hex_clicked) {
	
	//if you are reclicking the unit
	if ( Hex.equals(this.hex_selected, hex_clicked)) {
		this.reClickUnit();
	
	//if you are clicking somewhere else
	} else {
		this.tellSelectedUnitToMove(hex_clicked);
	}
}

WorldInterface.prototype.reClickUnit = function() {
	this.selfActionUnit(this.hex_selected);
}

WorldInterface.prototype.clickOutsideSelectedUnitRange = function(hex_clicked) {
	this.hex_selected = 'undefined';
	this.clickHex(hex_clicked);
}

WorldInterface.prototype.tellSelectedUnitToMove = function(hex_clicked) {
	
	var unit_there = this.world.unitAtPosition(hex_clicked);

	//Do the unit's action if there is something there
	if (unit_there) {
		this.actionUnit(this.hex_selected,hex_clicked);

	
	//Move the unit there if there is nothing
	} else {	
		this.moveUnit(this.hex_selected,hex_clicked);
	}

}

//Move the unit from one hex to another hex
WorldInterface.prototype.moveUnit = function(current_hex,new_hex) {

		//get the unit which is moving
		var unit = this.world.unitAtPosition(current_hex);

		//Create player if unit is a hut
		if (unit.unit_type === 'hut') {
			this.world.createUnit(new_hex,'fast-player');
			
			//reduce the population of the unit by one
			if (unit.population > 1) {	
				unit.population -= 1;
			} else {
				this.world.units.remove(current_hex);
				this.hex_selected = new_hex;
			}


		//Move player if unit is a player
		} else {

			//move unit to the new position
			unit.move(this.world.map,current_hex,new_hex);
			this.world.units.set(new_hex,unit);
			this.world.units.remove(current_hex);

			//find the range of the unit at its new position
			this.world.unitAtPosition(new_hex).findRange(this.world.map,new_hex);

			this.hex_selected = new_hex;
		}
}

//Does the current_hex unit's action unto the new_hex unit
WorldInterface.prototype.actionUnit = function(current_hex,target_hex) {

	//get both units
	var active_unit = this.world.unitAtPosition(current_hex);
	var target_unit = this.world.unitAtPosition(target_hex);

	//Eat the tree if it is a tree
	if ((active_unit.unit_type === 'player' || active_unit.unit_type === 'fast-player') && target_unit.unit_type === 'tree') {
		this.world.removeUnit(target_hex);
		this.moveUnit(current_hex,target_hex);
		active_unit.movement_left = active_unit.movement;
		this.hex_selected = target_hex;
	}

	//increase population if a hut eats a tree
	if (active_unit.unit_type === 'hut' && target_unit.unit_type === 'tree' ) {
		this.world.removeUnit(target_hex);
		active_unit.population += 1;
	}


}

WorldInterface.prototype.selfActionUnit = function(unit_hex) {
	//get the unit
	var active_unit = this.world.unitAtPosition(unit_hex);

	//Become a hut if unit is a player
	if (active_unit.unit_type === 'player' || active_unit.unit_type === 'fast-player') {
		this.world.removeUnit(unit_hex);
		this.world.createUnit(unit_hex,'hut');
	}

	//Become a player if unit is a hut
	if (active_unit.unit_type === 'hut') {
		//this.removeUnit(unit_hex);
		//this.createUnit(unit_hex,'fast-player');
	}
}

WorldInterface.prototype.drag = function(current_mouse,previous_mouse) {
	
	//get the movement the mouse has moved since last tick
	var drag_movement = new Point(this.view.screenToWorld1D(previous_mouse.x-current_mouse.x),
																this.view.screenToWorld1D(previous_mouse.y-current_mouse.y));
	
	//shift the view by that movement
	this.view.shiftPosition(drag_movement);
	
	//redraw the screen after moving
	drawScreen();
	
	//draw a line tracing the mouse motion tracked
	world_renderer.drawLine(this.view.screenToWorld(previous_mouse),this.view.screenToWorld(current_mouse),5,'lightblue');
}

WorldInterface.prototype.resizeZoom = function(width,height) {

	//remember the current view
  var current_view = view;

  view.resize(width,height);

	//create the new view
  var view_ratio = width/height;
  var initial_zoom = 2;
  var view_out = new Rect(    new Point(0,0), new Point(width,height));
  var view_in = current_view.input;

  //match the aspect ratio to the new size
  var resizing_ratio = new Point( current_view.output.size.x/width,
                                  current_view.output.size.y/height);
  view_in.size.x = view_in.size.x/resizing_ratio.x;
  view_in.size.y = view_in.size.y/resizing_ratio.y;

  view = new View(view_in,view_out);

	//apply new view to the engine
  world_interface.view = view;
  world_renderer.view = view;

  //redraw the screen after resizing
  drawScreen();

}

