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
    this.addAction( new actionCreateUnit('settler') );
    this.addAction( new actionGrowCity() );
    this.addAction( new actionMove(2,2,13) );
    setGraphic(this,'white',5);
    setCitySize(this,1);
    setCityColor(this);
    setResourceStores(this,0,0,0);
    setResourceCapacity(this,30,30,30);
    setDefaultAction(this, 'move');
    this.resources.food = 5;
    break;

  case 'settler':
    this.addAction( new actionBuildCamp() );
    this.addAction( new actionMove(5,2,13) );
    setGraphic(this,'blue',2);
    setResourceStores(this,5,0,0)
    setResourceCapacity(this,5,10,5);
    setCitySize(this,0);
    setCityColor(this);
    setDefaultAction(this, 'move');

    break;
  
  case 'water-player':
    this.addAction( new actionMove(6,1,1) );
    setGraphic(this,'white',2);
    setGraphic(this,'blue',2);
    setResourceStores(this,5,0,0)
    setResourceCapacity(this,5,10,5);
    setCitySize(this,0);
    setCityColor(this);
    setDefaultAction(this, 'move');

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

Unit.prototype.addAction = function( action ) {
  if (!this.actions) {
    this.actions = [];
  }
  console.log('add action');
  this.actions.push( action );
}

































//requirements should eventually be a function that can be run on the unit
//cost would be a function evaluated once the action is taken
function setDefaultAction(unit, action_name) {
  for (let action of unit.actions) {
    if (action.name == action_name) {
      unit.defaultAction = action;
    }
  }
}

function selectAction(unit, action_name) {
  for (let action of unit.actions) {
    if (action.name == action_name) {
      document.getElementById("_1234").checked = true;
    }
  }
}



function actionMove(max_distance, minimum_elevation, maximum_elevation) {

  this.name = "move";
  this.type = "target";
  this.min_distance = 0;
  this.max_distance = max_distance;
  this.minimum_elevation = minimum_elevation;
  this.maximum_elevation = maximum_elevation;
  var action = this;

  this.activation = function(unit) {
    return true;
  }
  this.requirement = function(unit) {
    return unit.resources.food >= 1;
  };

  this.displayCost = function(unit) {
    return "1 food/step";
  }

  this.getCost = function(world, unit, position, target) {
    //calculate the cost of moving
    var costFunction = action.stepCostFunction.bind(action);
    var neighborFunction = action.getNeighborsFunction.bind(action);

    var pathfinder = new PathFinder(costFunction, neighborFunction);
    var foodCost = pathfinder.getCost( world.world_map, position, target, unit.resources.food );
    return { food: foodCost };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost(world, unit, position, target).food;
    unit.resources.food -= food_cost;
  }

  this.effect = function(world, unit, position, target) {
    
    //move the unit
    world.units.remove(position);
    world.units.set(target, unit);
  };

  //TILE COST FUNCTION
  this.tileCostFunction = function(tile) {

    if (tile.elevation > this.maximum_elevation) {
       return undefined;
    }
    if (tile.elevation < this.minimum_elevation) {
       return undefined;
    }
    return 1;
  }

  //GET NEIGHBORS FUNCTION
  this.getNeighborsFunction = function(map,hex) {
    return map.getNeighbors(hex);
  }

  //STEP COST FUNCTION
  this.stepCostFunction = function(map, hex, next_hex) {

    var tile = map.get(next_hex);
    var cost = this.tileCostFunction(tile);
    return cost;
  }
}





//This action transforms the unit into a camp
function actionBuildCamp() {

  this.name = "build-camp";
  this.type = "target";
  this.min_distance = 1;
  this.max_distance = 1;
  
  this.stepCostFunction = function(map, previous_hex, hex) {
    return 1;
  }
  this.activation = function(unit) {
    return unit.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.wood >= 5;
  };

  this.displayCost = function(unit) {
    return "5 wood";
  }
  this.getCost = function(world, unit, position, target) {
    //calculate the cost of moving
    return { wood: 5 };
  };

  this.payCost = function(world, unit, position, target) {
    var wood_cost = this.getCost(world, unit, position, target).wood;
    unit.resources.wood -= wood_cost;
  }

  this.effect = function(world, unit, position, target) {
 
    //replace the unit
    world.units.remove( position );
    world.units.set( position, new Unit('camp') );
    new_unit = world.units.get( position );

    //keep resources of the old unit
    if (unit.resources) {
      new_unit.resources = unit.resources;
    }

  }

}






//This action transforms the unit into a camp
function actionCreateUnit(unit_type) {

  this.name = "create-".concat(unit_type);
  this.type = "target";
  this.new_unit_type = unit_type;
  this.min_distance = 1;
  this.max_distance = 2;

  this.stepCostFunction = function(map, previous_hex, hex) {
    return 1;
  }
  this.activation = function(unit) {
    return unit.resources.food >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.food >= 30;
  };

  this.displayCost = function(unit) {
    return "30 food";
  }
  this.getCost = function(world, unit, position, target) {
    return { food: 30 };
  };

  this.payCost = function(world, unit, position, target) {
    var food_cost = this.getCost(world, unit, position, target).food;
    unit.resources.food -= food_cost;
  }

  this.effect = function(world, unit, position, target) {
    //Create a unit_type at the target location
    world.units.set(target, new Unit(this.new_unit_type));
  }

}

function actionGrowCity() {
  this.name = "grow-city";
  this.type = "target";
  this.min_distance = 0;
  this.max_distance = 0;

  this.stepCostFunction = function(map, hex, next_hex) {
    return 1;
  }
  this.activation = function(unit) {
    return unit.resources.wood >= 1;
  }
  this.requirement = function(unit) {
    return unit.resources.wood >= unit.cityRadius*30;
  };

  this.displayCost = function(unit) {
    return (unit.cityRadius*30).toString().concat(" wood");
  }
  this.getCost = function(map, unit, position, target) {
    return { wood: unit.cityRadius*30 };
  };

  this.payCost = function(map, unit, position, target) {
    var wood_cost = this.getCost(map, unit, position, target).wood;
    unit.resources.wood -= wood_cost;
  }

  this.effect = function(units, unit, position, target) {
    unit.cityRadius++;
    unit.capacity.food *= 2;
    unit.capacity.wood *= 2;
    unit.capacity.stone *= 2;
  }
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



