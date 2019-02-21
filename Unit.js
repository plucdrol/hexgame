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
    this.setGraphic('white',5);
    this.setCitySize(1);
    this.setCityColor();
    this.setResourceStores(0,0,0);
    this.resources.food = 5;
    this.setCivilization();
    break;

  case 'settler':
    this.addAction( new actionBuildCamp() );
    this.addAction( new actionMove(5,2,13) );
    this.setGraphic('blue',2);
    this.setResourceStores(5,0,0)
    this.setCitySize(0);
    this.setCityColor();
    this.setCivilization();

    break;
  
  case 'water-player':
    this.addAction( new actionMove(6,1,1) );
    this.setGraphic('white',2);
    this.setGraphic('blue',2);
    this.setResourceStores(5,0,0)
    this.setCitySize(0);
    this.setCityColor();
    this.setCivilization();

    break;


  case 'fish':
    this.setGraphic('lightblue',1);
    this.setResource('food',1);
    break;
  case 'food':
    this.setGraphic('yellow',2);
    this.setResource('food',1);
    break;
  case 'wood':
    this.setGraphic('brown',2);
    this.setResource('wood',1);
    break;
  case 'stone':
    this.setGraphic('grey',2);
    this.setResource('stone',1);
    break;
  case 'terrain':
    this.elevation = 0;
    this.wind = 0;
    break;
  default:
    setGraphic('yellow',2);
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

Unit.prototype.setGraphic = function(color,size) {
  this.color = color;
  this.size = size;
}

Unit.prototype.setCityColor = function() {
  this.cityRadiusColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.6)"); 
  this.cityRadiusLineColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
}

/////////////////////////////////////////
//
//               RESOURCE GATHERING COMPONENT
//
/////////////////////////////////////////////

Unit.prototype.setCitySize = function(size) {
  this.cityRadius = size;
}
Unit.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}
Unit.prototype.setCivilization = function(civilization) {
  this.civilization = civilization | new Civilization();
}















/////////////////////////////////////////
//
//               CIVILIZATION
//
/////////////////////////////////////////////

function Civilization() {
  this.setColors();
}

Civilization.prototype.setColors = function() {
  this.fillColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.6)"); 
  this.lineColor = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
}
Civilization.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}