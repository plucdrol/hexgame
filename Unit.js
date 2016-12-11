

//           GENERIC UNIT --------------------//

function Unit(grid_position) {
	this.position = grid_position;
	this.range;
	
	this.movement = 6;
	this.movement_left = 6;
	
	this.sight = 3;
	this.colors = 'black';
	this.heighto = 0;
};
	Unit.prototype.moveTo = function(grid_position) {
		this.position = grid_position;
		//adjust the height of the unit
		if (this.range.containsHex(hex)) {
			this.heighto = this.range.getValue(hex)[2];
			console.log(this.heighto);
		}
	};
	Unit.prototype.moveDirection = function(direction) {
		var newPosition = hex_neighbor(this.position,direction);
		this.position = newPosition;
	};
	Unit.prototype.find_range = function(map) {
		var pathfinder = new PathFinder(map);
		this.range = pathfinder.path_with_terrain(this.position,this.movement);
	};

	Unit.prototype.action = function(action) {
		switch (action.type) {
			case 'move' :
				this.moveTo(action.position)
				break;
			case 'shoot' :
				this.attack(action.position);
				break;

		}
	}

	Unit.prototype.next_tick = function() {

	}





/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////																								
//////									UNIT TYPES
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// ------------------------------ LIVING UNIT ---------------------------------- //

function AliveUnit(hex) {
	Unit.call(this,hex); //this line defines inheritance of the constructor
	this.life = 10;
}

//this line defines inheritance of all methods except the constructor
AliveUnit.prototype = Object.create(Unit.prototype);

AliveUnit.prototype.hurt = function(health) {
	this.life -= health;
	if (this.life <= 0) {
		delete this;
	}
}



//------------------------------------ PLAYER UNIT ------------------------------------- //
function PlayerUnit(hex) {
		AliveUnit.call(this,hex);
		this.colors = 'blue';
}

//this line defines inheritance of all methods except the constructor
PlayerUnit.prototype = Object.create(AliveUnit.prototype);

// ------------------------------- ENEMY UNIT ------------------------------------- //
function EnemyUnit(hex) {
		AliveUnit.call(this,hex);
		this.colors = 'red';
}
//this line defines inheritance of all methods except the constructor
EnemyUnit.prototype = Object.create(AliveUnit.prototype);


// ------------------------------- VIRUS UNIT ------------------------------------- //
function VirusUnit(hex) {
		EnemyUnit.call(this,hex);
		this.colors = 'red';
}
//this line defines inheritance of all methods except the constructor
VirusUnit.prototype = Object.create(EnemyUnit.prototype);

VirusUnit.prototype.next_tick = function() {
	var neighbors = this.get_neighbors();
	for (neighbor of neighbors) {
		
	}

}




