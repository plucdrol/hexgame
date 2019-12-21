//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

var unit_id_incrementer = 1000;

function Unit(unit_type, owner) {
  
  this.selectable = true;
  this.position = null;

  this.id = unit_id_incrementer++;
  
  this.owner = null;
  if (owner) {
    this.owner = owner;
    this.group = owner.group;
  } else {
    this.group = new Group();
    this.group.addUnit(this);
  }

  this.setType(unit_type);
};

Unit.prototype.getGroupPositions = function() {
  return this.group.getGroupPositions();
}
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

Unit.prototype.getActions = function() {
  if (this.actions)
    return this.actions;
  else
    return [];
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
    this.split = 1;
    this.name = "City";
    this.pop =  0;
    this.setGraphic('saddlebrown',4);
    this.can_move = true;
    this.addAction( new actionExploit(12, false));
    this.addAction( new actionExpand(3));
    this.addAction( new actionExpand2(12));
    this.addAction( new actionExplore(10));
    this.addAction( new actionMoveCity(8) );
    this.addAction( new actionExpandAll() );

    break;

  case 'village':
    this.name = "Village";
    this.setGraphic('saddlebrown',2);
    
    
    break;


  case 'flesh-canon':
    this.name = "City canon";
    this.setGraphic('grey',6);
    this.addAction( new actionCreateCityByAir( 10 ));
    break;

  case 'lighthouse':
    this.name = "Lighthouse";
    this.setGraphic('lightblue',4);
    //this.addAction( new actionGetShallowFish(3));
    this.addAction( new actionHydroDam());
    break;








  case 'colony':
    this.name = "Colony";
    this.setGraphic('saddlebrown',1);
    this.setResource('colony',1);
    break;

  case 'fishing-boat':
    this.name = "Fishing boat";
    this.setGraphic('white',2);
    this.setResource('colony',1);
    break;









  case 'fish':
    this.setGraphic('lightblue',1);
    this.setResource('food',1);
    this.setResource('fish',1);
    break;
  case 'food':
    this.setGraphic('#f33',1);
    this.setResource('food',1);
    break;
  case 'wood':
    this.setGraphic('#f33',1);
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
























var group_id_incrementer = 1000;


function Group() {

  this.units = [];
  this.id = group_id_incrementer++;

  this.addUnit = function(unit) {this.units.push(unit);}
  this.getUnits = function() {return this.units;}
  this.hasUnit = function(unit) {
    for (let my_unit of this.units)
      if (my_unit.id == unit.id)
        return true;

    return false;
  }

  this.getGroupPositions = function() {

  }

}

