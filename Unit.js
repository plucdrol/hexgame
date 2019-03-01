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

  case 'village':
    this.addAction( new actionFishermen());
    this.addAction( new actionRiverlands());
    this.addAction( new actionForesters());
    this.addAction( new actionCreateCamp());
    this.addAction( new actionConquer());
    this.addAction( new actionMove() );
    this.setGraphic('white',5);
    this.setCitySize(1);
    
    this.setCiv();
    this.civ.setResourceStores(35,0,0);
    break;

  case 'settler':
    this.addAction( new actionBuildCamp() );
    this.addAction( new actionMove() );
    this.setGraphic('blue',2);
    this.setCitySize(0);

    this.setCiv();
    this.civ.setResourceStores(5,0,0)

    break;
  
  case 'water-player':
    this.addAction( new actionMove() );
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
  case 'unknown':
    this.setGraphic('purple',2);
    this.setResource('unknown',1);
    this.setResource('food',2);
    break;

  case 'terrain':
    this.elevation = 0;
    this.wind = 0;
    break;
  default:
    this.setGraphic('yellow',2);
    break;
  }
}

Unit.prototype.setResource = function(type, value) {
  if (!this.resources)
    this.resources = [];
  this.resources[type] = value;
  //this.resource_value = value;
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
  this.type = Math.floor(Math.random()*5)+1;
  this.id = Math.floor(Math.random()*10000);
  this.name = this.generateName();
  this.setColors();

}
Civilization.prototype.startCount = function() {
  this.resources.food = 0;
  this.resources.wood = 0;
  this.resources.stone = 0;
  this.resources.unknown = 0;
  this.pop = 0;
}
Civilization.prototype.setType = function(type) {
  this.type = type;
  this.name = this.generateName();
}
Civilization.prototype.setColors = function() {
  this.fill_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.6)"); 
  this.line_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
}

Civilization.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}

Civilization.prototype.generateName = function() {
  let vowels = ['a','e','i','o','u','a','e','i','o','u', 'an','ou','in','eu'];
  let consonants = ['b','d','f','g','h','j','k','l','m','n','p','r','s','t','v',
                    'b','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','z'];
  let double_consonants = ['p','br','ch','cr','sk','pl','fl','gr','sm','th'];
  function v(){return vowels[Math.floor(Math.random()*vowels.length)]}
  function c(){return consonants[Math.floor(Math.random()*consonants.length)]}
  function cc(){return double_consonants[Math.floor(Math.random()*double_consonants.length)]}
  if (this.type == 1)
    return v()+c()+v()+c()+v()+'nian';
  if (this.type == 2)
    return c()+v()+c()+'ese';
  if (this.type == 3)
    return v()+c()+c()+'ec';  
  if (this.type == 4)
    return c()+v()+c()+v()+c()+v()+c()+'al';
  if (this.type == 5)
    return c()+v()+cc()+'ish';
}

