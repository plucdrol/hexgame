//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

function Unit(unit_type) {
  
  this.components = {};
  this.setType(unit_type);

};

Unit.prototype.setType = function(unit_type) {
  this.components = {};

  switch (unit_type) {
  case 'planet':
    this.setMovement(8);
    this.components.color = 'darkblue';
    this.components.range = {};
    this.components.size = 3;
    break;
  case 'land-player':
    this.setMovement(12);
    this.components.color = 'blue';
    this.components.controllable = true;
    this.components.eats_food = true;
    this.components.self_action_become_unit = 'hut';
    this.components.range = {};
    this.components.size = 2;
    this.components.minimum_elevation = 2;
    this.components.maximum_elevation = 13; 
    break;
  case 'water-player':
    this.setMovement(12);
    this.components.color = 'white';
    this.components.controllable = true;
    this.components.eats_food = true;
    this.components.self_action_become_unit = 'hut';
    this.components.range = {};
    this.components.size = 2;
    this.components.minimum_elevation = 0;
    this.components.maximum_elevation = 1; 
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
    this.setMovement(4);
    this.components.color = 'brown';
    this.components.population = 1;
    this.components.size = 4;
    this.components.controllable = true;
    this.components.collects_ressources = true;
    let creation = {range:0, type:'fast-player'};
    this.components.ground_action_create_unit = creation;
    this.components.range = {};
    break;
  case 'terrain':
    this.components.elevation = 0;
    this.components.wind = 0;
    break;
  default:
    this.components.size = 2;
    this.setMovement(0);
    this.components.color = 'yellow';
    break;
}
}

Unit.prototype.hasComponent = function(component_name) {
  if (this.components.hasOwnProperty(component_name)) {
    return true;
  }
  return false;
}
Unit.prototype.getComponent = function(component_name) {
  if (this.hasComponent(component_name)) {
    return this.components[component_name];
  }
}

Unit.prototype.setComponent = function(label, value) {
  this.components[label] = value;  
}
Unit.prototype.increaseComponent = function(label, value) {
  if (this.hasComponent(label)){
    this.components[label] += value;
  }
}


/*
 * example of click system
 *
 *   function isMoveableUnit(unit) {
 *     return unit.hasComponent('movement');
 *   }
 *
 *   unit = array_of_units.filter(isOnHex(hex))
 *                        .filter(isMoveableUnit);
 *                 
 */























//////////////////////////////////////////////
//
//              MOVEMENT COMPONENT
//
////////////////////////////////////////////////

Unit.prototype.setMovement = function(movement) {
  this.setComponent('movement', movement);
  this.setComponent('movement_left', movement);

  
  if (this.move === undefined) {
    this.move = function(map,current_hex,next_hex) {
      
      var movement_cost = this.costFind(map, current_hex, next_hex);
      this.components.movement_left -= movement_cost;
    }
  }

  if (this.getNeighborsFunction === undefined) {
    this.getNeighborsFunction = function(map,hex) {
      return map.getNeighbors(hex);
      
    }
  }

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
	var difference = cost_this - cost_previous;

	//Returns values based on difference in elevation only
	if (difference >= 4) {
	  return undefined;
	}
	if (difference > 0)  {
	  return 6;
	}
	if (difference === 0) {
	  return 4;
	}
	if (difference < 0) {
	  return 3;
	}
	if (difference < -4) {
	  return undefined;
	}
	
	return undefined;
    }
  }

  //find the available movement of the unit and place it in the
  // range component. This code should not be in the bare unit class
  if (this.findRange === undefined) {
    this.findRange = function(map, position) {
      let max_movement = this.getComponent('movement_left');
      var range = this.rangeFind(map, position, max_movement);
      this.setComponent('range', range);
    };
  }


  var costFunction = this.stepCostFunction.bind(this);
  var neighborFunction = this.getNeighborsFunction.bind(this);
  this.rangeFind = PathFinder.getRangeFinder(costFunction, neighborFunction);
  this.costFind = PathFinder.getCostFinder(costFunction, neighborFunction);
}
