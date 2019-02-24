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
    this.addAction( new actionCreateCamp(6, 8));
    this.addAction( new actionConquer(6));
    this.addAction( new actionGrowCity() );
    this.addAction( new actionMove(5,2,13) );
    this.setGraphic('white',5);
    this.setCitySize(1);
    
    this.setCiv();
    this.civ.setResourceStores(35,0,0);
    break;

  case 'settler':
    this.addAction( new actionBuildCamp() );
    this.addAction( new actionMove(5,2,13) );
    this.setGraphic('blue',2);
    this.setCitySize(0);

    this.setCiv();
    this.civ.setResourceStores(5,0,0)

    break;
  
  case 'water-player':
    this.addAction( new actionMove(6,1,1) );
    this.setGraphic('white',2);
    this.setGraphic('blue',2);
    this.setCitySize(0);

    this.setCiv();
    this.civ.setResourceStores(5,0,0);

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

Unit.prototype.setResource = function(type, value) {
  this.resource_type = type;
  this.resource_value = value;
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

Unit.prototype.addAction = function( action ) {
  if (!this.actions) {
    this.actions = [];
  }
  this.actions.push( action );
}


///////////////////////////////////////////
//
//            RESOURCE DISPLAY COMPONENT
//
////////////////////////////////////

Unit.prototype.setGraphic = function(color,size) {
  this.color = color;
  this.size = size;
}

/////////////////////////////////////////
//
//               RESOURCE GATHERING COMPONENT
//
/////////////////////////////////////////////

Unit.prototype.setCitySize = function(size) {
  this.cityRadius = size;
}

Unit.prototype.setCiv = function(civilization) {
  if (civilization)
    this.civ = civilization;
  else
    this.civ = new Civilization();
}















/////////////////////////////////////////
//
//               CIVILIZATION
//
/////////////////////////////////////////////

function Civilization() {
  this.id = Math.floor(Math.random()*10000);
  this.setColors();
}

Civilization.prototype.setColors = function() {
  this.fill_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.6)"); 
  this.line_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
}

Civilization.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}

