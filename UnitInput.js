///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             UNIT INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  PathFinder.js 


function UnitInput(world) {
  this.world = world;
  this.hex_selected = undefined;
  this.units = world.units;
  this.action_selected = undefined;


}
//-------1---------2---------3---------4---------5---------6--------7---------8--------
UnitInput.p = UnitInput.prototype;

UnitInput.p.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  if (this.aUnitIsSelected()) {
    this.clickWithUnitSelected(hex);
    
  //if there is no unit selected
  } else {
    this.clickWithNoSelection(hex);
  }
}

UnitInput.p.selectHex = function(hex) {

  if (hex) {
    if (this.units.get(hex)) {

      this.hex_selected = hex;

      //look if there is a unit
      var potential_unit = this.units.get(hex);
      if (potential_unit) { 
        this.selectUnit(hex, potential_unit);
      }
    } 
  } else {
    this.hex_selected = undefined;
    this.selectNothing();
  }
}

UnitInput.p.selectUnit = function(hex, unit) {

  //nothing happens
}

UnitInput.p.selectNothing = function() {
  this.getUnitSelected().range = undefined;
  this.hex_selected = undefined;
}

UnitInput.p.aHexIsSelected = function() {
  return (this.hex_selected instanceof Hex);
}

UnitInput.p.getHexSelected = function()  {
  if (this.aHexIsSelected())
    return this.hex_selected;
  else
    return false;
}

UnitInput.p.aUnitIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_unit = this.units.get(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    return false;
  }
}

UnitInput.p.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.units.get(this.getHexSelected());
  } else {
    return false;
  }
}

UnitInput.p.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}

//This is where target-actions should take effect
//Instant effects will happen when the button is pressed instead
UnitInput.p.clickWithUnitSelected = function(hex) {
  
  var unit = this.getUnitSelected();
  if (!unit.hasComponent('range') ) {
    this.clickOutsideUnitRange(hex);
    return 0;
  }

  //if you are clicking inside the unit's range
  if (unit.range && listContainsHex(hex, unit.range) ) {
    this.clickInsideUnitRange(hex);

  //if you are clicking outside the unit's range
  } else {
    this.clickOutsideUnitRange(hex);
  }
}

UnitInput.p.clickInsideUnitRange = function(hex) {

  let action = this.getActionSelected();
  let maybe_unit = this.units.get(hex);
  let unit = this.getUnitSelected();

  if (action.requirement( this.getUnitSelected()))
    this.takeAction(unit, action, this.hex_selected, hex);

}

UnitInput.p.clickOutsideUnitRange = function(hex) {
  this.selectNothing();
  this.clickHex(hex);
}










































/////////////////////////////////////////////////////////
                  // UNIT ACTIONS //
/////////////////////////////////////////////////////////

UnitInput.p.takeAction = function(unit, action, position, target) {

  let target_unit = this.units.get(target);

  //both unit-targetting and land-targetting actions happen here
  if ((!target_unit && action.target=="land") || (target_unit && action.target=="unit")) {
    
    //then pay its cost and do the effect
    action.payCost(this.world, unit, position, target);
    action.effect(this.world, unit, position, target);

    //and select the new location (usually)
    if (action.nextSelection == 'target') {
      this.selectHex(target); 
      this.updateActionRange();
    }

  } else {
    this.selectHex(target);
  }  
}

UnitInput.p.getActionFromId = function(unit, action_id) {
  for (let action of unit.actions) {
    if ('action-'.concat(action.name) == action_id) {
      return action;
    }
  }
}

UnitInput.p.selectActionById = function(action_id) {
  if (document.getElementById(action_id)) {
    document.getElementById(action_id).checked = true;
  }
}

UnitInput.p.updateActionRange = function() {
  let hex = this.hex_selected;
  let unit = this.getUnitSelected();
  let action = this.getActionSelected();

  if (action)
    unit.range = this.getActionRange( unit, hex, this.getActionSelected() );
  else
    unit.range = new HexMap();
}

UnitInput.p.getActionRange = function(unit, hex, action) {
  var stepCostFunction = action.stepCostFunction.bind(action); //<---- depends on the action
  var neighborFunction = action.getNeighborsFunction.bind(action); //<--- standard for all hex actions

  var pathfinder = new PathFinder(stepCostFunction, neighborFunction);

  var max_distance = action.max_distance | 3;
  var min_distance = action.min_distance | 0;

  var actionRange = pathfinder.getRange( this.world.world_map, hex, max_distance, min_distance );
  let landRange = actionRange.filter(hex => this.world.getMapValue(hex).elevation > 1 );

  for (hex of landRange) {
    for (neighbor of hex.getNeighbors())
      world.world_map.get(neighbor).hidden = false;
  }

  return landRange;
}



//returns the actual action object
UnitInput.p.getActionSelected = function() {
  return this.getActionFromId(this.units.get(this.hex_selected), this.getActionSelectedId());
}

//Returns the currently selected action_id of the selected unit
UnitInput.p.getActionSelectedId = function() {
  var action_buttons = document.getElementsByClassName('action-button-input');
  for (let input of action_buttons) {
    if (input.checked) {
      var current_action = input.id;
      break;
    }
  }

  if (current_action)
    return current_action;
  else
    return false;
}


























