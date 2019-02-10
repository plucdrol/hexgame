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


function UnitInput(map, units) {
  this.map = map;
  this.hex_selected = undefined;
  this.units = units;
  this.stop_city_interval_number = 0;
  this.action_selected = undefined;

}
//-------1---------2---------3---------4---------5---------6--------
UnitInput.p = UnitInput.prototype;













//Unit selection should be moved into UnitSelection class
/////////////////////////////////////////////////////////
                  // UNIT INPUT //
/////////////////////////////////////////////////////////

UnitInput.p.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  if (this.aUnitIsSelected()) {
    this.clickWithUnitSelected(hex);
    
  //if there is no unit selected
  } else {
    this.clickWithNoSelection(hex);
  }
}
UnitInput.p.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "";
}
UnitInput.p.writeMessage = function(message) {
  document.getElementById('city-resources').innerHTML = message;
}
UnitInput.p.writeResources = function(city) {
  var message = "Food:".concat(city.resources.food).concat("/").concat(city.capacity.food)
                 .concat(" Wood:").concat(city.resources.wood).concat("/").concat(city.capacity.wood)
                 .concat(" Stone:").concat(city.resources.stone).concat("/").concat(city.capacity.stone);
  this.writeMessage(message);
}

UnitInput.p.trackUnitResources = function(unit) {
  clearInterval(this.stop_city_interval_number);
  this.writeResources(unit); 
  function update_function() { 
    this.writeResources(unit); 
    this.updateActionButtons(unit);
  };
  this.stop_city_interval_number = setInterval(update_function.bind(this), 1000);
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

  if ( unit.hasComponent('actions') ) {
    this.updateActionButtons(unit);
  }

  //if the unit exists, find its range
  if (unit.hasComponent('range')) {
    unit.findRange(this.map, hex);

  }
  if (unit.hasComponent('resources')) {
      this.trackUnitResources(unit);
    }
}

UnitInput.p.selectNothing = function() {
  this.hex_selected = undefined;
  clearInterval(this.stop_city_interval_number);
  this.clearButtons();
  this.writeMessage("");
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
  }
}

UnitInput.p.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}






















/////////////////////////////////////////////////////////
                  // UNIT ACTIONS //
/////////////////////////////////////////////////////////

UnitInput.p.selectAction = function(action_id) {
  if (document.getElementById(action_id)) {
    document.getElementById(action_id).checked = true;
  }
}

UnitInput.p.getActionRange = function(unit, action) {
  var costFunction = action.stepCostFunction.bind(unit); //<---- depends on the action
  var neighborFunction = unit.getNeighborsFunction.bind(unit); //<--- standard for all hex actions
  var getTileFunction = unit.getTileFunction.bind(unit); //<-- standard for all hex actions

  var pathfinder = new PathFinder(getTileFunction, costFunction, neighborFunction);

  var max_distance = 5;
  if (action.max_distance)
    max_distance = action.mac_distance;

  var actionRange = pathfinder.getRange( this.map, position, max_distance);
  return actionRange;
}

UnitInput.p.updateActionButtons = function(unit) {

  //remember previous action
  var current_action = this.getSelectedAction();

  //update the action list
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";
  for (let action of unit.actions) {
    
    //only show actions whose activation is met
    if (action.activation(unit)) {
      let new_button = this.makeActionButton(action);
      action_buttons.innerHTML += new_button;
      
      //Show actions in grey if their requirements are not met
      if (!action.requirement(unit)) {
        document.getElementById("action-".concat(action.name)).disabled = true;
      }
    }
  }

  //reset the action to the previously selected action
  if (current_action) {
    this.selectAction(current_action);
  }

  //select the unit's default action if none is currently selected
  if (!this.getSelectedAction() && unit.defaultAction) {
    this.selectAction('action-'.concat(unit.defaultAction.name));
  }
}

//Returns the currently selected action of the selected unit
UnitInput.p.getSelectedAction = function() {
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

UnitInput.p.makeActionButton = function(unitAction) {
  return "<label><input class='action-button-input' name='actions' type='radio'"
          .concat(" id='action-").concat(unitAction.name)
          .concat("' value='").concat(unitAction.name).concat("'><div class='action-button'>")
          .concat(unitAction.name).concat("</div></label></input>");
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
  //if you are reclicking the unit
  if ( Hex.equals(this.getHexSelected(), hex)) {
    this.reClickUnit(this.getUnitSelected());
    this.selectHex(hex);
  
  //if you are clicking somewhere else inside its range
  } else {
    var command = new UnitCommand(this.map, this.units);
    command.commandUnit(this.getUnitSelected(), this.getHexSelected(), hex);
    this.selectHex(hex);
  }
}

UnitInput.p.reClickUnit = function() {
  var command = new UnitCommand(this.map, this.units);
  command.commandUnitToSelf(this.getUnitSelected(),this.getHexSelected());
}

UnitInput.p.clickOutsideUnitRange = function(hex) {
  this.selectHex(undefined);
  this.clickHex(hex);
}