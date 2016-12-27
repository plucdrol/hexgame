

//           GENERIC UNIT --------------------//

function Unit(unit_type) {
	
	this.range = new HexMap();
	this.components = {};
	this.setType(unit_type);
};


	Unit.prototype.findRange = function(map,position) {
		var pathfinder = new PathFinder(map);
		this.range = pathfinder.rangePathfind(position,this.movement_left);
	};


	Unit.prototype.setType = function(unit_type) {

		this.components = {};

		switch (unit_type) {
		case 'player':
			this.setMovement(6);
			this.components.color = 'red';
			this.components.controllable = true;
			this.components.eats_food = true;
			this.components.self_action_become_unit = 'hut';
			break;
		case 'fast-player':
			this.setMovement(24);
			this.components.color = 'blue';
			this.components.controllable = true;
			this.components.eats_food = true;
			this.components.self_action_become_unit = 'hut';
			break;
		case 'tree':
			this.setMovement(0);
			this.components.color = 'red';
			this.components.size = 1;
			this.components.food_value = 1;
			break;
		case 'fish':
			this.setMovement(0);
			this.components.color = 'lightblue';
			this.components.size = 1;
			this.components.food_value = 5;
			break;
		case 'hut':
			this.setMovement(2);
			this.components.color = 'brown';
			this.components.population = 1;
			this.components.size = 4;
			this.components.controllable = true;
			this.components.collects_ressources = true;
			this.components.ground_action_create_unit = {range:0, type:'fast-player'};
			break;
		default:
			this.components.size = 2;
			this.setMovement(0);
			this.components.color = 'yellow';
			break;
		}
	}

	Unit.prototype.setMovement = function(movement) {
		this.components.movement = movement;
		this.components.movement_left = movement;
	}
	Unit.prototype.setColor = function(color) {
		this.components.color = color;
	}

	Unit.prototype.move = function(map,current_hex,next_hex) {
		//measure the distance moved
		var pathfinder = new PathFinder(map);
		//var movement_cost = pathfinder.moveCostRelative(current_hex,next_hex);
		pathfinder.destinationPathfind(current_hex,next_hex,this.components.movement_left);
		//calculate movement cost
		var movement_cost = pathfinder.moveCostRelative(current_hex,next_hex,this.components.movement_left)
		//substract it from the movement remaining
		this.components.movement_left -= movement_cost;

		if (this.components.movement_left <= 0) {
			//this.movement_left = this.movement;
		}

	}