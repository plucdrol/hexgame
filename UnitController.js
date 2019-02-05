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
  if (this.units.containsHex(hex)) {
    return this.units.getValue(hex);
  } else {
    return false;
  }
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
  var message = "Food:".concat(city.components.resources.food).concat("/").concat(city.components.capacity.food)
                 .concat(" Wood:").concat(city.components.resources.wood).concat("/").concat(city.components.capacity.wood)
                 .concat(" Stone:").concat(city.components.resources.stone).concat("/").concat(city.components.capacity.stone);
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
    if (this.unitAtPosition(hex)) {


      this.hex_selected = hex;
      //look if there is a unit
      var potential_unit = this.unitAtPosition(hex);

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

  var maybe_unit = this.unitAtPosition(this.getHexSelected());
  if (maybe_unit) {
    return (maybe_unit instanceof Unit);
  } else {
    return false;
  }
}
UnitController.p.getUnitSelected = function() {
  if (this.aUnitIsSelected()) {
    return this.unitAtPosition(this.getHexSelected());
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
    this.reClickUnit();
  
  //if you are clicking somewhere else
  } else {
    this.commandUnit(hex);
  }
}

UnitController.p.reClickUnit = function() {
  this.commandUnitToSelf(this.getHexSelected());
}

UnitController.p.clickOutsideUnitRange = function(hex) {
  this.selectHex('none');
  this.clickHex(hex);
}
























//Unit commands should be moved into UnitCommand class
/////////////////////////////////////////////////////////
                  // UNIT COMMAND //
/////////////////////////////////////////////////////////

UnitController.p.commandUnit = function(hex) {
  var unit_there = this.unitAtPosition(hex);

  //Do the unit's action if there is something there
  if (unit_there) {
    this.commandUnitToOtherUnit(this.getHexSelected(),hex);
  
  //Move the unit there if there is nothing
  } else {  
    this.commandUnitToGround(this.getHexSelected(),hex);
  }
}

//Move the unit from one hex to another hex
UnitController.p.commandUnitToGround = function(current_hex,new_hex) {
  console.log('command unit to ground');
  //get the unit which is moving
  var unit = this.unitAtPosition(current_hex);

  //if the unit has an action to create more units
  if (unit.hasComponent('ground_action_create_unit')) {
    console.log('create units');
    var new_unit_type = unit.components.ground_action_create_unit;
    if (unit.hasComponent('resources') && unit.components.resources.food >= 30) {
      unit.components.resources.food -= 30;
      this.units.set(new_hex, new Unit(new_unit_type));
      this.selectHex(new_hex);
    }

  //if the unit has an action to change the terrain
  } else if (unit.hasComponent('ground_action_change_terrain')) {
    var current_terrain_value = this.map.getValue(new_hex).components.elevation;
    var new_terrain_value = unit.components.ground_action_change_terrain.new_value;
    var affectable_terrain_value = unit.components.ground_action_change_terrain.affectable_value;

    if (current_terrain_value == affectable_terrain_value) {
      let tile = this.map.getValue(new_hex);
      tile.components.elevation = new_terrain_value;
    } else {

      //move unit to the new position
      this.moveUnit(current_hex,new_hex);
      this.selectHex(new_hex);
    }



  //Move player if unit is a player
  } else {
    //move unit to the new position if you have enough food
    if (unit.hasComponent('resources') ) {
      if (unit.components.resources.food >= 1) { 
        unit.components.resources.food -= 1;
        this.moveUnit(current_hex,new_hex);
        this.selectHex(new_hex);
      } else {
        this.selectNothing();
        this.units.remove(current_hex);
      }
    }
  }
}

//Does the current_hex unit's action unto the new_hex unit
UnitController.p.commandUnitToOtherUnit = function(current_hex,target_hex) {

  //get both units
  var active_unit = this.unitAtPosition(current_hex);
  var target_unit = this.unitAtPosition(target_hex);

  //Eat the tree if it is a tree
  if (active_unit.hasComponent('eats_food')) { 
    if (target_unit.hasComponent('food_value')) {
      this.units.remove(target_hex);
      this.commandUnitToGround(current_hex,target_hex);
      var full_movement = active_unit.getComponent('movement');
      active_unit.setComponent('movement_left', full_movement);
      active_unit.findRange(this.map,target_hex);
      this.selectHex(target_hex);
    }
  }

  //increase population if a hut eats a tree
  if (active_unit.hasComponent('collects_ressources')) {
    if (target_unit.hasComponent('food_value')) {
      this.units.remove(target_hex);
      active_unit.increaseComponent('population', 1);
    }
  }
}

UnitController.p.commandUnitToSelf = function(unit_hex) {
  //get the unit
  var active_unit = this.unitAtPosition(unit_hex);

  if (active_unit.hasComponent('self_action_grow')) {

    //this little pieces of code shows how the components are getting unwieldly
    if (active_unit.components.resources.wood >= 6*active_unit.components.cityRadius*active_unit.components.self_action_grow) {
      active_unit.components.resources.wood -= 6*active_unit.components.cityRadius*active_unit.components.self_action_grow;
      active_unit.components.cityRadius++;
      active_unit.components.capacity.food *= 2;
      active_unit.components.capacity.wood *= 2;
      active_unit.components.capacity.stone *= 2;
    }

  } 

  //Become another unit if the action is defined
  else if (active_unit.hasComponent('self_action_become_unit')) {
    var type = active_unit.getComponent('self_action_become_unit').type;
    var cost = active_unit.getComponent('self_action_become_unit').cost;
    var cost_resource = active_unit.getComponent('self_action_become_unit').resource;

    if (active_unit.components.resources[cost_resource] >= cost) {
      active_unit.components.resources[cost_resource] -= cost;

    
      //keep resources component
      if (active_unit.components.resources != undefined) {
        var resources = active_unit.components.resources;
      }
      this.units.remove(unit_hex);
      this.units.set(unit_hex, new Unit(type) );

      new_unit = this.unitAtPosition(unit_hex);


      if (new_unit.hasComponent('range')) {
        new_unit.findRange(this.map, unit_hex);
      }  
      if (new_unit.hasComponent('resources')) {
        this.selectCity(new_unit); 
      }  
      if (resources != undefined) {
        new_unit.components.resources = resources;
      }
    }


  } else {
    this.selectHex('none');
  }

}

UnitController.p.moveUnit = function(current_hex,next_hex) {
  //calculate movements remaining
  var the_unit = this.unitAtPosition(current_hex);
  var max_movement = the_unit.getComponent('movement_left');
  
  //find the path to destination
  var costFunction = the_unit.stepCostFunction.bind(the_unit);
  var neighborFunction = the_unit.getNeighborsFunction.bind(the_unit);
  var costFinder = PathFinder.getCostFinder(costFunction,neighborFunction);
  var cost = costFinder(this.map, current_hex, next_hex, max_movement);
  
  //OPTION A: movement reduces
  //substract it from the movement remaining
  //the_unit.increaseComponent('movement_left', -cost);

  //OPTION B: movement never runs out
  the_unit.setComponent('movement_left', max_movement);
  
  //update the map
  this.units.set(next_hex, the_unit);
  this.units.remove(current_hex);
}
