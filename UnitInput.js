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
  this.civ_selected = undefined;


}
//-------1---------2---------3---------4---------5---------6--------7---------8--------
UnitInput.p = UnitInput.prototype;

UnitInput.p.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  //if (this.aUnitIsSelected() ) {
    //this.clickWithUnitSelected(hex);
   // return;
  //}

  //if there is already a unit on the hex selected
  if (this.aCivIsSelected() ) {
    this.clickWithCivSelected(hex);
    return;
  }
    
  //if there is no unit selected
  this.clickWithNoSelection(hex);
}

/* //unit style
UnitInput.p.selectHex = function(hex) {

  this.unselectActions();

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
}*/

//civ style
UnitInput.p.selectHex = function(hex) {

  this.unselectActions();

  if (hex) {
    if (this.world.getCiv(hex)) {

      this.hex_selected = hex;

      //look if there is a unit
      var potential_civ = this.getCivSelected();
      if (potential_civ) { 
        this.selectCiv(hex, potential_civ);
      }
    } 
  } else {
    this.hex_selected = undefined;
    this.selectNothing();
  }
}

UnitInput.p.selectUnit = function(hex, unit) {

  unit.range = [];
}

UnitInput.p.selectCiv = function(hex, civ) {

  civ.range = [];
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

UnitInput.p.aCivIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_civ = this.world.getTile(this.getHexSelected()).civ;
  if (maybe_civ) {
    return (maybe_civ instanceof Civilization);
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

UnitInput.p.getCivSelected = function() {
  if (this.aCivIsSelected()) {
    return this.world.getTile(this.getHexSelected()).civ;
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
  if (!unit.hasDefinedRange() ) {
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

UnitInput.p.clickWithCivSelected = function(hex) {
  
  var civ = this.getCivSelected();
  if (!civ.hasDefinedRange() ) {
    this.clickOutsideUnitRange(hex);
    return 0;
  }

  //if you are clicking inside the civ's range
  if (civ.range && listContainsHex(hex, civ.range) ) {
    this.clickInsideCivRange(hex);

  //if you are clicking outside the civ's range
  } else {
    this.clickOutsideCivRange(hex);
  }
}

UnitInput.p.clickInsideUnitRange = function(hex) {

  let action = this.getActionSelected();
  let unit = this.getUnitSelected();

  if (action.requirement(this.world, this.getUnitSelected(), this.hex_selected))
    this.doAction(unit, action, this.hex_selected, hex);

}

UnitInput.p.clickInsideCivRange = function(hex) {

  let action = this.getActionSelected();
  let civ = this.getCivSelected();

  if (action.requirement(this.world, this.getCivSelected(), this.hex_selected))
    this.doAction(civ, action, this.hex_selected, hex);

}

UnitInput.p.clickOutsideUnitRange = function(hex) {
  this.selectNothing();
  this.clickHex(hex);
}

UnitInput.p.clickOutsideCivRange = function(hex) {
  this.selectNothing();
  this.clickHex(hex);
}









































/////////////////////////////////////////////////////////
                  // UNIT ACTIONS //
/////////////////////////////////////////////////////////

UnitInput.p.doAction = function(object, action, position, target) {

  if (this.actionTargetIsOK(action, target)) {
    
    //then do the action
    action.effect(this.world, object, position, target);

    //and select the new location (usually)
    if (action.nextSelection == 'target') {
      this.selectHex(target); 
    }
    this.updateActionRange();

  //else just select that new location
  } else {
    object.range = [];
    this.selectHex(target);
  }  
}

UnitInput.p.actionTargetIsOK = function(action, target) {
  let target_object = this.units.get(target);

  if (action.target == "both")
    return true;
  if (!target_object && action.target=="land")
    return true;
  if (target_object && action.target=="unit")
    return true;

  return false;
}

UnitInput.p.getActionFromId = function(object, action_id) {
  for (let action of object.actions) {
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
  let civ = this.getCivSelected();
  let action = this.getActionSelected();

  if (action)
    civ.range = this.getActionRange(civ, hex, this.getActionSelected() );
  else
    civ.range = new HexMap();
}

UnitInput.p.getActionRange = function(civ, hex, action) {

  //get the movement functions from the action
  var stepCostFunction = action.stepCostFunction.bind(action); 
  var neighborFunction = action.getNeighborsFunction.bind(action);
  var targetFilterFunction = action.targetFilterFunction.bind(action); 

  //create a pathfinder to explore the area around the unit
  var pathfinder = new PathFinder(stepCostFunction, neighborFunction);
  var max_distance = action.max_distance | 3;
  var min_distance = action.min_distance | 0;
  var actionRange = pathfinder.getRange( this.world.world_map, civ.tile_array, max_distance, min_distance );
  let landRange = actionRange.filter(hex => this.world.getMapValue(hex).elevation > 1 );

  //clear the clouds over the area explored
  for (hex of landRange) {
    for (neighbor of hex.getNeighbors())
      world.world_map.get(neighbor).hidden = false;
  }

  //remove unsuitable targets
  let filteredRange = landRange.filter(position => targetFilterFunction(this.world, civ, position, hex));

  return filteredRange;
}

UnitInput.p.unselectActions = function() {
  let buttons = document.getElementsByClassName('action-button-input');
  for (button of buttons) {
    button.checked = false;
  }
}

//returns the actual action object
UnitInput.p.getActionSelected = function() {
  return this.getActionFromId(this.getCivSelected(), this.getActionSelectedId());
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


























