
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


	//A world is composed of a world map...
	this.generate_world_map(size);
	this.layout = layout;
	this.size = size;

	this.button_ids = 1; //increments with every new button

	//console.log(this.map);
	//and a bunch of units in it
	this.units = new HexMap();

	this.map;


}

//create a new Unit at position Hex
World.prototype.create_unit = function(hex) {
	var newUnit = new VirusUnit();
	
	this.units.set(hex,newUnit);
	return newUnit;
}

//delete the new Unit at position Hex
World.prototype.remove_unit = function(hex) {
	this.units.remove(hex);
}


//Move the unit from one hex to another hex
//If a unit is already there, abort the move
World.prototype.move_unit = function(current_hex,new_hex) {
	//if there is no unit in that hex, abort the move
	//if (typeof this.unit_at_position(current_hex) != 'undefined') {

		//if a unit is already there, abort the move
		//if (typeof this.unit_at_position(new_hex) === 'undefined') {

			//create the unit in the new location
			this.create_unit(new_hex);
			//delete the unit in the current location
			this.remove_unit(current_hex);

			//return the unit at the new position
			return this.units.getValue(new_hex);
	//	}
	//}
}

//returns the Unit at position Hex. For now only a single unit can be on each hex
World.prototype.unit_at_position = function(hex) {
	if (this.units.containsHex(hex)) {
		return this.units.getValue(hex);
	} else {
		return false;
	}
}

World.prototype.generate_world_map = function(size) {
	

	//make a new map from scratch
	var map_generator = new HexMap_Generator();
	//this.map = map_generator.generate_map('perlin_custom',size,base,scales,scales, multis);
	this.map = map_generator.generate_map('perlin_continents',size);


}

World.prototype.next_tick = function() {

	//update all tickable elements
	for (let unit of this.units.getValues()) {
		unit.next_tick();
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


function WorldInterface(world) {
	
	this.world = world;
	this.hex_selected = 'undefined';
	this.hex_hovered = new Hex(0,0);
	this.hex_hovered_previous = new Hex(0,0);
	this.edge_hovered = 'undefined';

	//create a default view, which can be edited
	var view_in = new Rect(new Point(-canvas.width*8,-canvas.height*8),new Point(canvas.width*16,canvas.height*16));
	var view_out = new Rect(new Point(0,0),new Point(canvas.width,canvas.height));
	this.view = new View(view_in,view_out);
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
}

WorldInterface.prototype.getHex = function(screen_position) {
	var world_position = this.view.screen_to_world(screen_position);
	var hex = hex_round(this.world.layout.point_to_hex(world_position));
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
	
	//get the edge being hovered
	this.edge_hovered = this.near_which_edge(screen_position,0.1);

	//get the hex being hovered
	this.hex_hovered = this.getHex(screen_position);

	//if the mouse moved to a new hex, refresh the screen
	if ( !hex_equals(this.hex_hovered, this.hex_hovered_previous) ) {
		refreshCanvas();
	}

	//remember the currently hovered hex
	this.hex_hovered_previous = this.hex_hovered;
}

WorldInterface.prototype.near_which_edge = function(screen_position,edge_width) {
	if (screen_position.x > canvas.width*(1-edge_width)) {
		return "right";
	}
	if (screen_position.x < canvas.width*(edge_width)) {
		return "left";
	}
	if (screen_position.y < canvas.height*(edge_width)) {
		return "up";
	}
	if (screen_position.y > canvas.height*(1-edge_width)) {
		return "down";
	}
	return "none";

}

WorldInterface.prototype.click = function(screen_position) {

	//convert to hex coordinates
	var hex_clicked = this.getHex(screen_position);

	//if there is already a unit on the hex selected
	if (this.hex_selected instanceof Hex && this.world.unit_at_position(this.hex_selected) instanceof Unit) {

		//and you are re-clicking the unit
		if ( hex_equals(this.hex_selected, hex_clicked)) {
				this.hex_selected = 'undefined';

		} else {
			
			//and you are clicking inside the unit's range outline
			if (this.world.unit_at_position(this.hex_selected).range.containsHex(hex_clicked)) {

				//if there is already a unit there
				if (this.world.unit_at_position(hex_clicked)) {
					this.hex_selected = 'undefined';
				} else { //if there is no unit there
					//Move the unit then generate its new range
					this.world.move_unit(this.hex_selected,hex_clicked);
					this.world.unit_at_position(hex_clicked).find_range(this.world.map,hex_clicked);
					this.hex_selected = hex_clicked;
				}

			//if you are clicking outside the unit's range
			} else {
				this.hex_selected = 'undefined';
			}
		}
	} else {
		//if there is no unit selected
		this.hex_selected = hex_clicked;

		if (this.world.unit_at_position(hex_clicked) instanceof Unit) { 
			
			//and you clicked a unit
			console.log('selecting a unit');
			this.world.unit_at_position(this.hex_selected).find_range(this.world.map,hex_clicked);
		} else {


		}
	
	}

	//console.log(this.unit_selected);
}

WorldInterface.prototype.next_tick = function() {
	this.world.next_tick();
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
