

//           GENERIC UNIT --------------------//

function Unit(unit_type) {
	this.range;
	
	this.sight = 3;
	
	this.color;
	this.movement;
	this.movement_left;

	this.heighto = 0;

	this.setType(unit_type);
};


	Unit.prototype.findRange = function(map,position) {
		var pathfinder = new PathFinder(map);
		this.range = pathfinder.pathWithTerrain(position,this.movement);
	};

	Unit.prototype.action = function(action) {
		switch (action.type) {
			//case 'move' :
			//	this.move_to(action.position)
				//break;
			case 'shoot' :
				this.attack(action.position);
				break;

		}
	}

	Unit.prototype.setType = function(unit_type) {
		this.unit_type = unit_type;
		switch (unit_type) {
		case 'player':
			this.setMovement(6);
			this.setColor('red');
			break;
		case 'fast-player':
			this.setMovement(24);
			this.setColor('blue');
			break;
		case 'tree':
			this.setMovement(0);
			this.setColor('green');
			break;
		default:
			this.setMovement(0);
			this.setColor('yellow');
			break;
		}
	}

	Unit.prototype.getType = function() {
		return this.unit_type;
	}

	Unit.prototype.setMovement = function(movement) {
		this.movement = movement;
		this.movement_left = movement;
	}
	Unit.prototype.setColor = function(color) {
		this.color = color;
	}
