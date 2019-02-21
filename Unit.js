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
    this.addAction( new actionCreateUnit('camp', 2, 8));
    this.addAction( new actionConquer(6));
    this.addAction( new actionGrowCity() );
    this.addAction( new actionMove(5,2,13) );
    setGraphic(this,'white',5);
    setCitySize(this,1);
    setCityColor(this);
    setResourceStores(this,0,0,0);
    setResourceCapacity(this,300,300,300);
    this.resources.food = 5;
    break;

  case 'settler':
    this.addAction( new actionBuildCamp() );
    this.addAction( new actionMove(5,2,13) );
    setGraphic(this,'blue',2);
    setResourceStores(this,5,0,0)
    setResourceCapacity(this,10,10,10);
    setCitySize(this,0);
    setCityColor(this);

    break;
  
  case 'water-player':
    this.addAction( new actionMove(6,1,1) );
    setGraphic(this,'white',2);
    setGraphic(this,'blue',2);
    setResourceStores(this,5,0,0)
    setResourceCapacity(this,5,10,5);
    setCitySize(this,0);
    setCityColor(this);

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
  this.actions.push( action );
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
  unit.cityRadiusColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.6)"); 
  unit.cityRadiusLineColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
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

