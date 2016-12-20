
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

	//console.log(this.map);
	//and a bunch of units in it
	this.units = new HexMap();

	this.map;
	//A world is composed of a world map...
	this.generateWorldMap(size);

}

//create a new Unit at position Hex
World.prototype.createUnit = function(hex,unit_type) {
	
	//create new unit and add it to the map
	var newUnit = new Unit(unit_type);
	this.units.set(hex,newUnit);
	return newUnit;
}

//delete the new Unit at position Hex
World.prototype.removeUnit = function(hex) {
	this.units.remove(hex);
}


//Move the unit from one hex to another hex
World.prototype.moveUnit = function(current_hex,new_hex) {

	//unit at the next position
	var unit_at_position = this.unitAtPosition(new_hex);

	//if there is a unit in that hex, abort the move
	if (typeof this.unitAtPosition(current_hex) != 'undefined') {

			//get the unit which is moving
			var unit = this.unitAtPosition(current_hex);

			//let unit figure out its movement
			unit.move(this.map,current_hex,new_hex);

			//place it at the new position
			this.units.set(new_hex,unit);

			//delete the unit in the old location
			this.units.remove(current_hex);

			//return the unit at the new position
			return this.units.getValue(new_hex);
	}
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
	this.map = map_generator.generateMap('perlin_continents',size);

	//add trees (this is the wrong place for world-generaion code)
	for (let hex of this.map.getArray()) {
		var hex_value = this.map.getValue(hex);
		if (hex_value >= 4 && hex_value <= 9) {
			this.createUnit(hex,'tree');
		}
	}


}

World.prototype.nextTick = function() {

	//update all tickable elements
	for (let unit of this.units.getValues()) {
		unit.nextTick();
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

WorldInterface.prototype.makeButton = function(unit,action,text) {

	var button_text = "<button type='button' id='test123' onclick='world_interface.unitAction("+unit+","+action+")'>"+text+"</button>";

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

WorldInterface.prototype.click = function(screen_position) {

	//convert to hex coordinates
	var hex_clicked = this.getHex(screen_position);

	//if there is already a unit on the hex selected
	if (this.hex_selected instanceof Hex && this.world.unitAtPosition(this.hex_selected) instanceof Unit) {

		//and you are re-clicking the unit
		if ( Hex.equals(this.hex_selected, hex_clicked)) {
				this.hex_selected = 'undefined';

		} else {
			
			//and you are clicking inside the unit's range outline
			if (this.world.unitAtPosition(this.hex_selected).range.containsHex(hex_clicked)) {

				//if there is already a unit there
				if (this.world.unitAtPosition(hex_clicked)) {
					this.hex_selected = 'undefined';
				} else { //if there is no unit there
					//Move the unit then generate its new range
					this.world.moveUnit(this.hex_selected,hex_clicked);
					this.world.unitAtPosition(hex_clicked).findRange(this.world.map,hex_clicked);
					this.hex_selected = hex_clicked;
				}

			//if you are clicking outside the unit's range
			} else {
				this.hex_selected = 'undefined';
				this.click(screen_position);
			}
		}
	} else {
		//if there is no unit selected
		this.hex_selected = hex_clicked;

		if (this.world.unitAtPosition(hex_clicked) instanceof Unit) { 
			
			//and you clicked a unit
			console.log('selecting a unit');
			this.world.unitAtPosition(this.hex_selected).findRange(this.world.map,hex_clicked);
		} else {


		}
	
	}

	drawScreen();
	//console.log(this.unit_selected);
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

WorldInterface.prototype.nextTick = function() {
	this.world.nextTick();
}


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////																								
//////							ACTIONS 
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function Action(type,argument1,argument2,argument3) {
	this.type = type;
	switch (type) {
		case 'move':
			this.position = argument1;
			break;
		case 'shoot' :
			this.position = argument1;
			break;
		case 'moveview':
			this.direction = argument1;
			break;

			
	}
}
