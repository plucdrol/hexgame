//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

function Unit(unit_type, owner) {
  
  this.selectable = true;
  
  this.owner = null;
  if (owner) 
    this.owner = owner;

  this.setType(unit_type);
};

Unit.prototype.addPop = function(pop_amount) {
  if (this.owner && this.type != 'city') 
    this.owner.addPop(pop_amount);
  else
    this.pop += pop_amount;
}

Unit.prototype.getPop = function() {
  if (this.owner && this.type != 'city') 
    return this.owner.getPop();
  else
    return this.pop;
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


  switch (unit_type) {

  case 'city':
    this.name = "City";
    this.pop =  0;
    this.setGraphic('white',6);
    this.can_move = true;
    this.addAction( new actionGetResource(3, true));
    this.addAction( new actionCreateVillage(4));
    this.addAction( new actionCreateLighthouse(3));

    this.addAction( new actionCreateExpeditionCenter());
    this.addAction( new actionCreateHarbor());
    this.addAction( new actionCreateFleshCanon(6));

    this.addAction( new actionMoveCity() );
    break;

  case 'village':
    this.name = "Village";
    this.pop = 2;
    this.setGraphic('white',4);
    
    this.addAction( new actionGetResource(1, true));
    this.addAction( new actionCreateLighthouse(1));
    break;

  case 'expedition-center':
    this.name = "Expedition Center";
    this.pop = 4;
    this.setGraphic('pink',5);
    this.addAction( new actionCreateCity(12));
    this.addAction( new actionCreateVillage(5));
    this.council_connected = false;
    break;

  case 'flesh-canon':
    this.name = "Flesh canon";
    this.pop = 6;
    this.setGraphic('grey',6);
    this.addAction( new actionCreateCityByAir( 10 ));
    break;

  case 'lighthouse':
    this.name = "Lighthouse";
    this.pop = 2;
    this.setGraphic('lightblue',4);
    this.addAction( new actionGetShallowFish(4));
    this.addAction( new actionHydroDam());
    break;

  case 'harbor':
    this.name = "Harbor";
    this.pop = 4;
    this.setGraphic('brown',5);
    this.addAction( new actionCreateCityBySea(12));
    this.addAction( new actionCreateLighthouseBySea(12));
    break;

  case 'colony':
    this.name = "Colony";
    this.setGraphic('white',3);
    this.setResource('colony',1);
    break;

  case 'fishing-boat':
    this.name = "Fishing boat";
    this.setGraphic('white',3);
    this.setResource('colony',1);
    break;









  case 'fish':
    this.setGraphic('lightblue',1);
    this.setResource('food',1);
    this.setResource('fish',1);
    break;
  case 'food':
    this.setGraphic('brown',2);
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






