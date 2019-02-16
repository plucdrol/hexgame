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
//-------1---------2---------3---------4---------5---------6--------
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

UnitInput.p.updateActionRange = function() {
  let hex = this.hex_selected;
  let unit = this.getUnitSelected();
  let current_action = this.updateActionButtons(unit);

  unit.range = this.getActionRange( unit, hex, this.getActionSelected() );
}

UnitInput.p.selectUnit = function(hex, unit) {

  if ( unit.hasComponent('actions') ) {
    this.updateActionRange();
  }

  //if (unit.hasComponent('resources')) {
    //this.trackUnitResources(unit);
  //}
}

UnitInput.p.selectNothing = function() {
  this.hex_selected = undefined;
  //clearInterval(this.stop_city_interval_number);
  //this.clearButtons();
  //this.writeMessage("");
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
  if (listContainsHex(hex, unit.range) ) {
    this.clickInsideUnitRange(hex);

  //if you are clicking outside the unit's range
  } else {
    this.clickOutsideUnitRange(hex);
  }
}

UnitInput.p.clickInsideUnitRange = function(hex) {

  let action = this.getActionSelected();
  let unit_there = this.units.get(hex);

  if (!action.requirement( this.getUnitSelected()))
    return;

  //both unit-targetting and land-targetting actions happen here
  if ((!unit_there && action.target=="land") || (unit_there && action.target=="unit")) {
    
    //then pay its cost and do the effect
    action.payCost(this.world, this.units.get(this.hex_selected), this.hex_selected, hex);
    action.effect(this.world, this.units.get(this.hex_selected), this.hex_selected, hex);

    //and select the new location (usually)
    this.selectHex(action.nextTarget(hex, this.hex_selected)); 
  }  
 
}

UnitInput.p.clickOutsideUnitRange = function(hex) {
  this.selectHex(undefined);
  this.clickHex(hex);
}










































/////////////////////////////////////////////////////////
                  // UNIT ACTIONS //
/////////////////////////////////////////////////////////

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

UnitInput.p.getActionRange = function(unit, hex, action) {
  var stepCostFunction = action.stepCostFunction.bind(action); //<---- depends on the action
  var neighborFunction = action.getNeighborsFunction.bind(action); //<--- standard for all hex actions

  var pathfinder = new PathFinder(stepCostFunction, neighborFunction);

  var max_distance = 3;
  if (action.max_distance)
    max_distance = action.max_distance;

  var actionRange = pathfinder.getRange( this.world.world_map, hex, max_distance );
  return actionRange;
}

UnitInput.p.updateActionButtons = function(unit) {

  //remember previous action
  var current_action = this.getActionSelectedId();

  //update the action list
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";
  for (let action of unit.actions) {
    
    //only show actions whose activation is met
    if (action.activation(unit)) {
      let new_button = this.makeActionButton(unit, action);
      action_buttons.innerHTML += new_button;
      
      //Show actions in grey if their requirements are not met
      if (!action.requirement(unit)) {
        document.getElementById("action-".concat(action.name)).disabled = true;
      }
    }
  }

  //add the click-detection code
  let self = this;
  for (let button of document.getElementsByClassName('action-button-input')) {
    button.addEventListener('click', function(){ self.updateActionRange(); });
  }

  //reset the action to the previously selected action
  if (current_action) {
    this.selectActionById(current_action);
  }

  //select the unit's default action if none is currently selected
  if (!this.getActionSelectedId() && unit.defaultAction) {
    this.selectActionById('action-'.concat(unit.defaultAction.name));
  }
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

UnitInput.p.makeActionButton = function(unit, action) {
  return "<label><input class='action-button-input' name='actions' type='radio'"
          .concat(" id='action-").concat(action.name)
          .concat("' value='").concat(action.name).concat("'><div class='action-button'>")
          .concat(action.name).concat("<br/>")
          .concat(action.displayCost(unit)).concat("</div></label></input>");
}

























