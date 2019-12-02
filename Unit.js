//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

function Unit(unit_type) {
  
  this.setType(unit_type);
  this.selectable = true;

};

Unit.prototype.addPop = function(pop_amount) {
  if (this.transfer_pop && this.owner) 
    this.owner.addPop(pop_amount);
  else
    this.pop += pop_amount;
}

Unit.prototype.addAction = function( action ) {
  if (!this.actions) {
    this.actions = [];
  }
  this.actions.push( action );
}

Unit.prototype.moveActionToTop = function( action) {
  let i;
  for (i=this.actions.length-1;i>=0; i--) {
    if (this.actions[i].name == action.name)
      this.actions.splice(i, 1);
  }
  this.actions.unshift(action);
}

Unit.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}


Unit.prototype.setType = function(unit_type) {
  this.type = unit_type;
  this.owner = null;

  switch (unit_type) {

  case 'city':
    this.pop = 4;
    this.setGraphic('white',6);
    this.addAction( new actionGetResource(3, true));
    this.addAction( new actionCreateQueensChamber());
    this.addAction( new actionCreateAirport(5));
    this.addAction( new actionCreateLighthouse());
    this.addAction( new actionCreateHarbor());
    this.addAction( new actionCreateVillage(5));
    this.addAction( new actionMoveCity() );
    break;

  case 'village':
    this.pop = 2;
    this.transfer_pop = true;
    this.setGraphic('white',4);
    this.addAction( new actionGetResource(1, true));
    //this.addAction( new actionCreateVillage(4));
    break;

  case 'queens-chamber':
    this.pop = 1;
    this.setGraphic('pink',6);
    this.addAction( new actionCreateCity());
    this.addAction( new actionCreateCouncilOfQueens());
    this.council_connected = false;
    break;

  case 'airport':
    this.pop = 6;
    this.setGraphic('grey',6);
    this.addAction( new actionCreateCityByAir());
    break;

  case 'council-of-queens':
    this.pop = 1;
    this.setGraphic('red',5);
    this.addAction( new actionConnectQueensChambers());
    break;

  case 'lighthouse':
    this.pop = 2;
    this.transfer_pop = true;
    this.setGraphic('lightblue',4);
    this.addAction( new actionGoFishing(5));
    break;

  case 'harbor':
    this.pop = 4;
    this.transfer_pop = true;
    this.setGraphic('brown',5);
    this.addAction( new actionCreateCityBySea());
    this.addAction( new actionCreateLighthouse());
    break;

  case 'route':
    this.setGraphic('white',3);
    this.setResource('route',1);
    break;

  case 'fishing-boat':
    this.setGraphic('white',3);
    this.setResource('route',1);
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
  case 'wood':
    this.setGraphic('brown',2);
    this.setResource('food',1);
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






