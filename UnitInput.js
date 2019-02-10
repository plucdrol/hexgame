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
  this.city_selected = undefined;
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
clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "";
}
writeMessage = function(message) {
  document.getElementById('city-resources').innerHTML = message;
}
writeResources = function(city) {
  var message = "Food:".concat(city.resources.food).concat("/").concat(city.capacity.food)
                 .concat(" Wood:").concat(city.resources.wood).concat("/").concat(city.capacity.wood)
                 .concat(" Stone:").concat(city.resources.stone).concat("/").concat(city.capacity.stone);
  writeMessage(message);
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

UnitInput.p.selectNothing = function() {
  this.hex_selected = undefined;
  this.city_selected = undefined;
  clearInterval(this.stop_city_interval_number);
  clearButtons();
  writeMessage("");
}

UnitInput.p.selectCity = function(city) {
  clearInterval(this.stop_city_interval_number);
  this.city_selected = city;
  writeResources(city); 
  function update_function() { 
    writeResources(city); 
  };
  this.stop_city_interval_number = setInterval(update_function, 1000);
}





function updateActionButtons(unit) {
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";
  for (let action of unit.actions) {
    //add the action to the list if its requirement is met
    if (action.requirement(unit)) {
      let button = getActionButton(action);
      action_buttons.innerHTML += button;
    }
  }
}

function getActionButton(unitAction) {
  return "<label><input name='actions' type='radio' value='".concat(unitAction.name).concat("''><div class='action-button'>").concat(unitAction.name).concat("</div></label></input>");
}

UnitInput.p.selectUnit = function(hex, unit) {

  if ( unit.hasComponent('actions') ) {
    updateActionButtons(unit);
    console.log(JSON.stringify(unit.actions[0]));
    console.log(JSON.stringify(unit.actions[1]));
    console.log(JSON.stringify(unit.actions[2]));



  }

  //if the unit exists, find its range
  if (unit.hasComponent('range')) {
    unit.findRange(this.map, hex);

  }
  if (unit.hasComponent('resources')) {
    this.selectCity(unit);
  }
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

UnitInput.p.clickWithUnitSelected = function(hex) {
  
  var unit_selected = this.getUnitSelected();
  if (!unit_selected.hasComponent('range') ) {
    this.clickOutsideUnitRange(hex);
    return 0;
  }

  var unit_range = unit_selected.getComponent('range');

  //if you are clicking inside the unit's range
  if (listContainsHex(hex, unit_range) ) {
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