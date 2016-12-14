
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
	
	this.hex_hovered = this.getHex(screen_position);
	if ( !hex_equals(this.hex_hovered, this.hex_hovered_previous) ) {
		console.log('draw!');
	}
	this.hex_hovered_previous = this.hex_hovered;
}

WorldInterface.prototype.click = function(screen_position) {

	//convert to hex coordinates
	var hex_clicked = this.getHex(screen_position);

	// HEX SELECTION CODE
	var unit_clicked = 'undefined';

	//if there is already a unit on the hex selected
	if (this.world.units.containsHex(hex_clicked) instanceof Unit) {

		//and you are re-clicking the unit
		if ( hex_equals(this.hex_selected, hex_clicked)) {
				this.hex_selected = 'undefined';
				console.log('reclicking the unit');

		} else {
		//and you are clicking..

			//inside the unit's range outline
			if (this.world.units.getValue(hex_selected).range.containsHex(hex_clicked)) {
				console.log('moving the unit from');
				console.log(this.hex_selected);
				console.log(hex_clicked);

				//Move the unit then generate its new range
				this.world.move_unit(this.hex_selected,hex_clicked);
				this.world.units.getValue(hex_clicked).find_range(this.world.map);

			//outside the unit's range
			} else {
				this.hex_selected = 'undefined';
				console.log('unselecting the unit');
			}
		}
	} else {
		//if there is no unit selected
		this.hex_selected = hex_clicked;

		if (this.world.units.getValue(hex_clicked) instanceof Unit) { 
			//and you clicked a unit
			console.log('selecting a unit');
			this.world.units.getValue(this.hex_selected).find_range(this.world.map,hex_clicked);
			//this.makeButton(unit_clicked,new Action('move',new Hex(3,3)),'blablabla');
		} else {
			//changing the terrain
			//console.log('changing terrain');
			//this.world.map.set(currentHex,1);

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
