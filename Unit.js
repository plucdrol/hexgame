

//           GENERIC UNIT --------------------//

function Unit() {
	this.range;
	
	this.movement = 6;
	this.movement_left = 6;
	
	this.sight = 3;
	this.colors = 'black';
	this.heighto = 0;
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

	Unit.prototype.nextTick = function() {

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

VirusUnit.prototype.nextTick = function() {
	var neighbors = this.get_neighbors();
	for (neighbor of neighbors) {
		
	}

}




