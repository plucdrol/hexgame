
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
	this.units.set(hex,new VirusUnit(hex));
}

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
	this.unit_selected = 'undefined';
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
	var hex = this.getHex(screen_position);

	// UNIT SELECTION CODE
	//console.log(unit_selected);
	var unit_clicked = 'undefined';
	var unit_found = false;

	//if there is already a unit selected
	if (this.unit_selected instanceof Unit) {

		//and you are re-clicking the unit
		//console.log(this.unit_selected);
		if ( hex_equals(this.unit_selected.position, hex)) {
				this.unit_selected = 'undefined';
				console.log('reclicking the unit');

		} else {
		//and you are clicking..

			//inside the unit's rangeoutlilne
			if (this.unit_selected.range.containsHex(hex)) {
				console.log('moving the unit');
				this.unit_selected.moveTo(hex);
				this.unit_selected.find_range(this.world.map);
				//unit_selected = 'undefined';
			//outside the unit's range
			} else {
				this.unit_selected = 'undefined';
				console.log('unselecting the unit');
			}
		}
	} else {
		//if there is no unit selected
		unit_clicked = this.world.unit_at_position(hex);

		if (unit_clicked instanceof Unit) { 
			//and you clicked a unit
			console.log('selecting the unit');
			this.unit_selected = unit_clicked;
			this.unit_selected.find_range(this.world.map);
			unit_found = true;
			this.makeButton(unit_clicked,new Action('move',new Hex(3,3)),'blablabla');
		} else {
			//changing the terrain
			console.log('changing terrain');
			this.unit_selected = 'undefined';
			this.hex_selected = hex;
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
