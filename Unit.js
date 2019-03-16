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
    this.setCiv();
    this.setGraphic('white',5);
    this.setCitySize(1);
    this.civ.setResourceStores(35,0,0);
    break;



  case 'fish':
    this.setGraphic('lightblue',1);
    this.setResource('food',1);
    this.setResource('fish',1);
    break;
  case 'food':
    this.setGraphic('yellow',2);
    this.setResource('food',1);
    break;
  case 'forest':
    this.setGraphic('brown',2);
    this.setResource('wood',1);
    this.setResource('forest',1);
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

Unit.prototype.hasDefinedRange = function() {
  return this.hasOwnProperty('range');
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
  else {
    this.civ = new Civilization();

  }
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
  this.generateColors();
    this.addAction( new actionFishermen());
    this.addAction( new actionRiverlands());
    this.addAction( new actionForesters());
    this.addAction( new actionCreateCamp());
    this.addAction( new actionConquer());
    //this.addAction( new actionMove() );

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
var color_index = -1;
Civilization.prototype.generateColors = function() {

  let colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', 
               '#f032e6', '#bfef45', '#fabebe', '#469990', '#e6beff', '#9A6324', '#fffac8', 
               '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'];

  color_index++;
  if (color_index > colors.length)
    color_index = -1;

  console.log(color_index);
  this.fill_color = colors[color_index];
  //this.fill_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.3)"); 
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

Civilization.prototype.addAction = function( action ) {
  if (!this.actions) {
    this.actions = [];
  }
  this.actions.push( action );
}

Civilization.prototype.hasDefinedRange = function() {
  return this.hasOwnProperty('range');
}

Civilization.prototype.createUnit = function(unit_type, capital_position) {
  
  let new_unit = new Unit( unit_type );
  new_unit.civ = this;
  new_unit.setGraphic('white',3);
  new_unit.capital_position = capital_position;
  return new_unit;
}

