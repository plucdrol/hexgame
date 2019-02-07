//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

function Unit(unit_type) {
  
  this.setType(unit_type);

};

Unit.prototype.setType = function(unit_type) {
  this.type = unit_type;

  switch (unit_type) {

  case 'camp':
    this.setMovement(2);
    this.color = 'white';
    this.controllable = true;
    this.range = {};
    this.size = 2;
    this.minimum_elevation = 2;
    this.maximum_elevation = 13; 
    this.ground_action_create_unit = 'land-player';
    this.self_action_grow = 5;
    this.getGrowCost = function(){return 6*this.cityRadius*this.self_action_grow;};
    this.setCitySize(1);
    this.setCityColor();
    this.setResources(0,0,0);
    this.setCapacity(30,30,30);
    break;

  case 'land-player':
    this.is_unit = true;
    this.setMovement(5);
    this.color = 'blue';
    this.controllable = true;
    this.range = {};
    this.size = 2;
    this.minimum_elevation = 2;
    this.maximum_elevation = 13; 
    this.self_action_become_unit = {type:'camp', resource:'wood', cost:10};
    this.setResources(5,0,0);
    this.setCapacity(5,10,5);
    this.setCitySize(0);
    this.setCityColor();

    break;
  
  case 'water-player':
    this.setMovement(6);
    this.color = 'white';
    this.controllable = true;
    this.range = {};
    this.size = 2;
    this.minimum_elevation = 0;
    this.maximum_elevation = 2; 
    this.ground_action_change_terrain = {};
    this.ground_action_change_terrain.affectable_value = 2;
    this.ground_action_change_terrain.new_value = 1;
    this.setResources(0,0,0);
    this.setCitySize(0);
    this.setCityColor();
    break;


  case 'fish':
    this.color = 'lightblue';
    this.size = 1;
    this.resource_type = 'food';
    this.resource_value = 2;
    break;
  case 'food':
    this.color = 'yellow';
    this.size = 1;
    this.resource_type = 'food';
    this.resource_value = 1;
    break;
  case 'wood':
    this.color = 'brown';
    this.size = 1;
    this.resource_type = 'wood';
    this.resource_value = 1;
    break;
  case 'stone':
    this.color = 'grey';
    this.size = 1;
    this.resource_type = 'stone';
    this.resource_value = 1;
    break;
  case 'terrain':
    this.elevation = 0;
    this.wind = 0;
    break;
  default:
    this.size = 2;
    this.color = 'yellow';
    break;
  }
}

Unit.prototype.hasComponent = function(component_name) {
  if (this.hasOwnProperty(component_name)) {
    return true;
  }
  return false;
}
Unit.prototype.getComponent = function(component_name) {
  if (this.hasComponent(component_name)) {
    return this[component_name];
  } else {
    return false;
  }
}

Unit.prototype.setComponent = function(label, value) {
  this[label] = value;  
}
Unit.prototype.increaseComponent = function(label, value) {
  if (this.hasComponent(label)){
    this[label] += value;
  }
}








///////////////////////////////////////////
//
//            CITY DISPLAY COMPONENT
//
////////////////////////////////////


Unit.prototype.setCityColor = function() {
  this.cityRadiusColor = "rgba(255,50,50, 0.4)";
  this.cityRadiusLineColor = "rgba(255,50,200, 0.6)";
}







/////////////////////////////////////////
//
//               RESOURCE GATHERING COMPONENT
//
/////////////////////////////////////////////


Unit.prototype.setCitySize = function(size) {
    this.cityRadius = size;
}

Unit.prototype.setResources = function(food,wood,stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}
Unit.prototype.setCapacity = function(food,wood,stone) {
  this.capacity = {'food':food, 'wood':wood, 'stone':stone};
}






//////////////////////////////////////////////
//
//              MOVEMENT COMPONENT
//
////////////////////////////////////////////////

Unit.prototype.setMovement = function(movement) {
  this.setComponent('movement', movement);
  this.setComponent('movement_left', movement);

  //MOVE FUNCTION
  if (this.move === undefined) {
    this.move = function(map,current_hex,next_hex) {
      
      var movement_cost = this.costFind(map, current_hex, next_hex);
      this.movement_left -= movement_cost;
    }
  }

  //GET NEIGHBORS FUNCTION
  if (this.getNeighborsFunction === undefined) {
    this.getNeighborsFunction = function(map,hex) {
      return map.getNeighbors(hex);
      
    }
  }

  //TILE COST FUNCTION
  if (this.tileCostFunction === undefined) {
    this.tileCostFunction = function(tile) {

      var cost = tile.getComponent('elevation');
      if (cost > this.getComponent('maximum_elevation')) {
	cost = undefined;
      }
      if (cost < this.getComponent('minimum_elevation')) {
	cost = undefined;
      }
      return cost;
    }
  }



  //STEP COST FUNCTION
  if (this.stepCostFunction === undefined) {
    this.stepCostFunction = function(previous_tile, tile) {

	//returns a positive number for uphill movement
	// negative number for downhill movement
	var cost_this = this.tileCostFunction(tile);
	var cost_previous = this.tileCostFunction(previous_tile);

	if (cost_this === undefined) {
	  return undefined;
	}

	if (cost_previous === undefined) {
	  cost_previous = 0;
	}
	
  return 1;

  /*
  var difference = cost_this - cost_previous;

	//Returns values based on difference in elevation only
	if (difference >= 4) {
	  return undefined;
	}
	if (difference > 0)  {
	  return 4;
	}
	if (difference === 0) {
	  return 4;
	}
	if (difference < 0) {
	  return 4;
	}
	if (difference < -4) {
	  return undefined;
	}
	
	return undefined;
  */
    }
  }

  //FIND RANGE FUNCTION
  //find the available movement of the unit and place it in the
  // range component. This code should not be in the bare unit class
  if (this.findRange === undefined) {
    this.findRange = function(map, position) {
      let max_movement = this.movement_left;
      var range = this.rangeFind(map, position, max_movement);
      this.setComponent('range', range);
    };
  }


  //EXTERNAL FUNCTIONS
  var costFunction = this.stepCostFunction.bind(this);
  var neighborFunction = this.getNeighborsFunction.bind(this);
  var pathfinder = new PathFinder();
  this.rangeFind = pathfinder.getRangeCalculator(costFunction, neighborFunction);
  this.costFind = pathfinder.getCostCalculator(costFunction, neighborFunction);
}
