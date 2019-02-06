///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             UNIT CONTROLLER

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  PathFinder.js 

function UnitController(map, units) {
  this.map = map;
  this.hex_selected = undefined;
  this.city_selected = undefined;
  this.units = units;
  this.stop_city_interval_number = 0;

}
//-------1---------2---------3---------4---------5---------6--------
UnitController.p = UnitController.prototype;

UnitController.p.newMap = function(map) {
  
  this.map = map;
  this.units.removeAll();
}

UnitController.p.createUnit = function(hex, unit_type) {
    var newUnit = new Unit(unit_type);
    this.units.set(hex, newUnit);
  }













//These should be functions of the World itself
//It can call the unit controller for the 
/////////////////////////////////////////////////////////
                  // UNIT CREATION //
/////////////////////////////////////////////////////////


//returns the Unit at position Hex. only a single unit can be on each hex
UnitController.p.unitAtPosition = function(hex) {
  //This function returns false if there is no unit there
  return this.units.get(hex);
}

UnitController.p.getUnit = UnitController.p.unitAtPosition;





















//Unit selection should be moved into UnitSelection class
/////////////////////////////////////////////////////////
                  // UNIT CLICKING //
/////////////////////////////////////////////////////////

UnitController.p.clickHex = function(hex) {
  //if there is already a unit on the hex selected
  if (this.aUnitIsSelected()) {
    this.clickWithUnitSelected(hex);
    
  //if there is no unit selected
  } else {
    this.clickWithNoSelection(hex);
  }
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

UnitController.p.selectNothing = function() {
  this.hex_selected = undefined;
  this.city_selected = undefined;
  clearInterval(this.stop_city_interval_number);
  writeMessage("");
}

UnitController.p.selectCity = function(city) {
  clearInterval(this.stop_city_interval_number);
  this.city_selected = city;
  writeResources(city); 
  function update_function() { 
    writeResources(city); 
  };
  this.stop_city_interval_number = setInterval(update_function, 1000);
}

UnitController.p.selectHex = function(hex) {


  if (hex instanceof Hex) {
    if (this.units.get(hex)) {


      this.hex_selected = hex;
      //look if there is a unit
      var potential_unit = this.units.get(hex);

      if (potential_unit instanceof Unit) { 
        //if the unit exists, find its range
        if (potential_unit.hasComponent('range')) {
          potential_unit.findRange(this.map, hex);
        }
        if (potential_unit.hasComponent('resources')) {
          this.selectCity(potential_unit);
        }
      }
    } 
  } else {
    this.hex_selected = undefined;
      this.selectNothing();
  }
}

UnitController.p.aHexIsSelected = function() {
  return (this.hex_selected instanceof Hex);
}

UnitController.p.getHexSelected = function()  {
  if (this.aHexIsSelected())
    return this.hex_selected;
  else
    return false;
}

UnitController.p.aUnitIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_unit = this.units.get(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    return false;
  }
}
UnitController.p.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.units.get(this.getHexSelected());
  }
}
UnitController.p.clickWithNoSelection = function(hex) {
  this.selectHex(hex);
}

UnitController.p.clickWithUnitSelected = function(hex) {
  
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

UnitController.p.clickInsideUnitRange = function(hex) {
  //if you are reclicking the unit
  if ( Hex.equals(this.getHexSelected(), hex)) {
    this.reClickUnit(this.getUnitSelected());
    this.selectHex(hex);
  
  //if you are clicking somewhere else
  } else {
    var command = new UnitCommand(this.map, this.units);
    command.commandUnit(this.getUnitSelected(), this.getHexSelected(), hex);
    this.selectHex(hex);
  }
}

UnitController.p.reClickUnit = function() {
  console.log('reclick');
  var command = new UnitCommand(this.map, this.units);
  command.commandUnitToSelf(this.getUnitSelected(),this.getHexSelected());
}

UnitController.p.clickOutsideUnitRange = function(hex) {
  this.selectHex('none');
  this.clickHex(hex);
}