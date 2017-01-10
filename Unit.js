//-------1---------2---------3---------4---------5---------6---------7--------8

//           GENERIC UNIT --------------------//

function Unit(unit_type) {
  
  this.components = {};
  this.setType(unit_type);
};

Unit.prototype.tileCostFunction = function(tile) {

  var cost = tile.getComponent('elevation');
  if (cost > this.getComponent('maximum_elevation')) {
    cost = 9999;
  }
  if (cost < this.getComponent('minimum_elevation')) {
    cost = 9999;
  }
  return cost;
}

Unit.prototype.findRange = function(map, position) {
  var costFunction = this.tileCostFunction.bind(this);
  var pathfinder = new PathFinder(map, costFunction );
  var max_movement = this.getComponent('movement_left');
  var range = pathfinder.getRange(position, max_movement);
  this.setComponent('range', range);
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
    this.components.range = new HexMap();
    this.components.size = 2;
    this.components.minimum_elevation = 2;
    this.components.maximum_elevation = 13; 
    break;
  case 'fast-player':
    this.setMovement(24);
    this.components.color = 'blue';
    this.components.controllable = true;
    this.components.eats_food = true;
    this.components.self_action_become_unit = 'hut';
    this.components.range = new HexMap();
    this.components.size = 2;
    this.components.minimum_elevation = 2;
    this.components.maximum_elevation = 13; 
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
    let creation = {range:0, type:'fast-player'};
    this.components.ground_action_create_unit = creation;
    this.components.range = new HexMap();
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
Unit.prototype.setMovement = function(movement) {
  this.setComponent('movement', movement);
  this.setComponent('movement_left', movement);
}

Unit.prototype.move = function(map,current_hex,next_hex) {
  //measure the distance moved
  var costFunction = this.tileCostFunction.bind(this);
  var pathfinder = new PathFinder(map, costFunction);
  //calculate movements remaining
  var max_movement = this.getComponent('movement_left');
  //find the path to destination
  var movement_cost = pathfinder.moveCostRelative(current_hex, next_hex, max_movement);
  //substract it from the movement remaining
  this.components.movement_left -= movement_cost;
}
