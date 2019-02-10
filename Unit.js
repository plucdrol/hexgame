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
    setGroundActionCreateUnit(this,'settler');
    setSelfActionGrowCity(this,5);
    setGraphic(this,'white',5);
    setElevationRange(this,2,13);
    setMovement(this, 2);
    setCitySize(this,1);
    setCityColor(this);
    setResourceStores(this,0,0,0);
    setResourceCapacity(this,30,30,30);
    break;

  case 'settler':
    this.food_is_range = true;
    setSelfActionBecomeUnit(this,'camp', 'wood', 10);
    setGraphic(this,'blue',2);
    setElevationRange(this,2,13);
    setMovement(this,5);
    setResourceStores(this,5,0,0)
    setResourceCapacity(this,5,10,5);
    setCitySize(this,0);
    setCityColor(this);

    break;
  
  case 'water-player':
    setGroundActionChangeTerrain(unit, 2, 1);
    setGraphic(this,'white',2);
    setElevationRange(this,0,2);
    setMovement(this,6);
    break;


  case 'fish':
    setGraphic(this,'lightblue',1);
    setResource(this,'food',1);
    break;
  case 'food':
    setGraphic(this,'yellow',2);
    setResource(this,'food',1);
    break;
  case 'wood':
    setGraphic(this,'brown',2);
    setResource(this,'wood',1);
    break;
  case 'stone':
    setGraphic(this,'grey',2);
    setResource(this,'stone',1);
    break;
  case 'terrain':
    this.elevation = 0;
    this.wind = 0;
    break;
  default:
    setGraphic(this,'yellow',2);
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
//            ACTION COMPONENT
//
////////////////////////////////////

function updateActionButtons(unit) {
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";
  for (let action of unit.actions) {
    let button = getActionButton(action);
    action_buttons.innerHTML += button;
  }
}

function getActionButton(unitAction) {
  return "<label><input name='actions' type='radio' value='".concat(unitAction.name).concat("''><div class='action-button'>").concat(unitAction.name).concat("</div></label></input>");
}




//requirements should eventually be a function that can be run on the unit
//cost would be a function evaluated once the action is taken

function moveAction() {

  this.name = "Move";

  this.type = "target";

  this.requirement = function(unit) {
    unit.resources.food >= 1;
  };

  this.getCost = function(world, unit, position, target) {
    //calculate the cost of moving
    var costFunction = unit.stepCostFunction.bind(unit);
    var neighborFunction = unit.getNeighborsFunction.bind(unit);
    var getFunction = unit.getFunction.bind(unit);
    var pathfinder = new PathFinder(getFunction, costFunction, neighborFunction);
    var foodCost = pathfinder.getCost( this.map, position, target, unit.resources.food );
    return { food: foodCost };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost().food;
    unit.resources.food -= cost;
  }

  this.effect = function(world, unit, position, target) {
    
    //calculate the cost of moving
    var costFunction = unit.stepCostFunction.bind(unit);
    var neighborFunction = unit.getNeighborsFunction.bind(unit);
    var getFunction = unit.getFunction.bind(unit);
    var pathfinder = new PathFinder(getFunction, costFunction, neighborFunction);
    var cost = pathfinder.getCost( this.map, position, target, unit.resources.food );

    //move the unit
    this.units.remove(position);
    this.units.set(target, unit);
  };
}



function setGroundActionChangeTerrain(unit, affectable_value, new_value) {
  unit.actions.push(action);
  unit.ground_action_change_terrain = {};
  unit.ground_action_change_terrain.affectable_value = affectable_value;
  unit.ground_action_change_terrain.new_value = new_value;
}

function setSelfActionBecomeUnit(unit, type, resource, cost) {
  var requirement = function(unit){ unit.resources.wood >= 10; };
  var cost = function(unit){ unit.resources.wood -= 10; };

  var action = new unitAction('become_city', 'self', requirement, cost);
  if (!unit.actions) {
    unit.actions = [];
  }
  unit.actions.push(action);

  unit.self_action_become_unit = {};
  unit.self_action_become_unit.type = type;
  unit.self_action_become_unit.resource = resource;
  unit.self_action_become_unit.cost = cost;
}

function setSelfActionGrowCity(unit, base_cost) {
  var requirement = function(unit){ unit.resources.wood >= 5; };
  var cost = function(unit){ unit.resources.wood -= 5; };

  var action = new unitAction('grow_city', 'self', requirement, cost);
  if (!unit.actions) {
    unit.actions = [];
  }
  unit.actions.push(action);

  unit.self_action_grow = base_cost;
  unit.getGrowCost = function(){return 5};
}

function setGroundActionCreateUnit(unit, new_unit_type) {
  var requirement = function(unit){ unit.resources.food >= 30; };
  var cost = function(unit){ unit.resources.food -= 30; };
  var effect = function(world, hex) { 
    world.units.sex( hex, new Unit('settler') );
  }

  var action = new unitAction('create_settlers', 'ground', requirement, cost, effect);
  if (!unit.actions) {
    unit.actions = [];
  }
  unit.actions.push(action);

  unit.ground_action_create_unit = new_unit_type;
}

///////////////////////////////////////////
//
//            CITY DISPLAY COMPONENT
//
////////////////////////////////////

function setGraphic(unit,color,size) {
  unit.color = color;
  unit.size = size;
}

function setCityColor(unit) {
  unit.cityRadiusColor = "rgba(255,50,50, 0.4)";
  unit.cityRadiusLineColor = "rgba(255,50,200, 0.6)";
}







/////////////////////////////////////////
//
//               RESOURCE GATHERING COMPONENT
//
/////////////////////////////////////////////

function setResource(unit,resource_type, resource_value) {
  unit.resource_type = resource_type;
  unit.resource_value = resource_value;
}
function setCitySize(unit, size) {
  unit.cityRadius = size;
}
function setResourceStores(unit, food, wood, stone) {
  unit.resources = {'food':food, 'wood':wood, 'stone':stone};
}
function setResourceCapacity(unit, food, wood, stone) {
  unit.capacity = {'food':food, 'wood':wood, 'stone':stone};
}






//////////////////////////////////////////////
//
//              MOVEMENT COMPONENT
//
////////////////////////////////////////////////

function setElevationRange(unit, minimum, maximum) {
  unit.minimum_elevation = minimum;
  unit.maximum_elevation = maximum;
}

function setMovement(unit, movement) {
  var requirement = function(unit){ unit.resources.food >= 1; };
  var cost = function(unit){ unit.resources.food -= 1; };

  var action = new unitAction('move', 'ground', requirement, cost);
  if (!unit.actions) {
    unit.actions = [];
  }
  unit.actions.push(action);

  unit.range = {};
  unit.movement = movement;
  unit.movement_left = movement;

  //GET NEIGHBORS FUNCTION
  unit.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }

  unit.getFunction = function(map, coord) {
    return map.getValue(coord);
  }

  //TILE COST FUNCTION
  unit.tileCostFunction = function(tile) {

    var cost = tile.elevation;
    if (cost > unit.maximum_elevation) {
       cost = undefined;
    }
    if (cost < unit.minimum_elevation) {
       cost = undefined;
    }
    return cost;
  }



  //STEP COST FUNCTION
  unit.stepCostFunction = function(previous_tile, tile) {

    //returns a positive number for uphill movement
    // negative number for downhill movement
    var cost_this = unit.tileCostFunction(tile);
    var cost_previous = unit.tileCostFunction(previous_tile);

    if (cost_this === undefined) {
      return undefined;
    }

    if (cost_previous === undefined) {
      cost_previous = 0;
    }
    
    return 1;
  }

  //FIND RANGE FUNCTION
  //find the available movement of the unit and place it in the
  // range component. This code should not be in the bare unit class
  unit.findRange = function(map, position) {
    let max_movement = unit.movement_left;

    //setup movement cost functions
    var self = this;
    var costFunction = unit.stepCostFunction.bind(unit);
    var neighborFunction = unit.getNeighborsFunction.bind(unit);
    var getFunction = unit.getFunction.bind(unit);

    //ask pathfinder for info on area
    var pathfinder = new PathFinder(getFunction, costFunction, neighborFunction);
    pathfinder.fromUnit = true;
    var range = pathfinder.getRange(map, position, max_movement);

    //set info for later
    unit.setComponent('range', range);
  }
}
