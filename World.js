
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

	this.units = new HexMap();
	this.map = new HexMap();

	this.init();
}

World.prototype.init = function() {
	this.generateWorldMap(this.size);

}

World.prototype.hexToPoint = function(hex) {
	return this.layout.hexToPoint(hex);
}
World.prototype.pointToHex = function(point) {
	return this.layout.pointToHex(point);
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

	//delete units
	for (let hex of this.units.getArray())	{
		var unit = this.units.getValue(hex);
		if (unit.components.hasOwnProperty('food_value')) {
			this.removeUnit(hex);
		}
	}

	//make a new map from scratch
	var map_generator = new HexMapGenerator();
	//this.map = map_generator.generateMap('perlin_custom',size,base,scales,scales, multis);
	map_generator.generateMap('perlin-continents',size);
	this.map = map_generator.getMap();

	this.addTreesToMap();
	this.addFishToMap();

}

World.prototype.addTreesToMap = function() {
	//add trees (this is the wrong place for world-generaion code)
	for (let hex of this.map.getArray()) {
		var hex_value = this.map.getValue(hex).components.elevation;
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
		var hex_value = this.map.getValue(hex).components.elevation;
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
	this.hex_hovered = new Hex(0,0);
	this.hex_hovered_previous = new Hex(0,0);
	this.edge_hovered = 'undefined';
	this.view = view;

	this.unit_controller = new UnitController(this.world);

	this.init();
	
}

WorldInterface.prototype.init = function() {
	var wif = this;
	listenForEvent('hexgame_click', function(e){ wif.clickScreenEvent(e.detail.click_pos);} );
	listenForEvent('hexgame_zoom', function(e){ wif.zoomViewEvent(e.detail.amount);} );
	listenForEvent('hexgame_hover', function(e){ wif.hoverEvent(e.detail.mousepos);} );
	listenForEvent('hexgame_drag', function(e){ wif.dragEvent(e.detail.mousepos,e.detail.mouseposprevious);} );
	listenForEvent('hexgame_resize', function(e){ wif.resizeEvent(e.detail.width, e.detail.height);} );

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
WorldInterface.prototype.zoomViewEvent = function(zoom) {
	
	this.view.zoom(zoom);
	drawScreen();
}

WorldInterface.prototype.getHex = function(screen_position) {
	var world_position = this.view.screenToWorld(screen_position);
	var hex = Hex.round(this.world.pointToHex(world_position));
	return hex;
}

WorldInterface.prototype.setHex = function(screen_position,value) {
	var hex = this.getHex(screen_position);
	this.world.map.set(hex,value);
}


///////// EVENTS /////////

WorldInterface.prototype.hoverEvent = function(screen_position) {
	
	//get the hex being hovered
	this.hex_hovered = this.getHex(screen_position);

	//if the mouse moved to a new hex, redraw the screen
	if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
		drawScreen();
	}

	//remember the currently hovered hex
	this.hex_hovered_previous = this.hex_hovered;
}

WorldInterface.prototype.clickScreenEvent = function(screen_position) {

	var hex_clicked = this.getHex(screen_position);

	console.log(this.world.map.getValue(hex_clicked));

	this.unit_controller.clickHex(hex_clicked);
	
	drawScreen();

}

WorldInterface.prototype.dragEvent = function(current_mouse,previous_mouse) {
	
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

WorldInterface.prototype.resizeEvent = function(width,height) {

  view.resizeOutput(width,height);

  //redraw the screen after resizing
  drawScreen();

}