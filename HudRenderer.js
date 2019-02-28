function HUDRenderer(world, game_input, hex_renderer) {

  this.stop_city_interval_number = 0;
  this.game_input = game_input;
  this.world = world;
  this.unit_input = game_input.unit_input;
  //start tracking
  this.trackUnitResources();
  this.hex_renderer = hex_renderer;
}

HUDRenderer.prototype.drawHUD = function() {


  var hex_hovered = this.game_input.hex_hovered;
  var hex_selected = this.unit_input.hex_selected;

  if (hex_selected) {
    this.drawUnitRange(hex_selected);
    this.drawSelectionHex(hex_selected);
  }

  if (hex_hovered) {
    this.drawHoveredHex(hex_hovered);
  }
}

HUDRenderer.prototype.drawUnitRange = function(hex_selected) {
  //draw range of selected unit  
  var potential_unit = this.unit_input.units.get(hex_selected);

  if (potential_unit instanceof Unit && potential_unit.range) {
    this.hex_renderer.drawHexes(potential_unit.range);

  }
}

HUDRenderer.prototype.drawHoveredHex = function(hex_hovered) {
  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  this.hex_renderer.drawHex( hex_hovered, hover_style );
}

HUDRenderer.prototype.drawSelectionHex = function(hex_selected) {
    //draw selection hex
    var select_style = new RenderStyle();
    select_style.fill_color = "rgba(200,200,0,0.5)";
    select_style.line_width = 2;
    this.hex_renderer.drawHex(hex_selected, select_style);
}

HUDRenderer.prototype.makeActionButton = function(unit, action) {
  return "<label><input class='action-button-input' name='actions' type='radio'"
          .concat(" id='action-").concat(action.name)
          .concat("' value='").concat(action.name).concat("'><div class='action-button'>")
          .concat(action.name).concat("<br/>")
          .concat(action.displayCost(unit)).concat("</div></label></input>");
}

HUDRenderer.prototype.updateActionButtons = function() {

  //do nothing if there is no unit to update
  let unit = this.unit_input.getUnitSelected();
  let position = this.unit_input.getHexSelected();
  if (!unit) return;

  //remember previous action
  var current_action = this.unit_input.getActionSelectedId();

  //update the action list
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";
  for (let action of unit.actions) {
    
    //only show actions whose activation is met
    if (action.activation(unit, position)) {
      let new_button = this.makeActionButton(unit, action);
      action_buttons.innerHTML += new_button;
      
      //Show actions in grey if their requirements are not met
      if (!action.requirement(unit, position)) {
        document.getElementById("action-".concat(action.name)).disabled = true;
      }
    }
  }

  let self = this;
  //add the click-detection code
  for (let button of document.getElementsByClassName('action-button-input')) {
    button.addEventListener('click', function(){ self.unit_input.updateActionRange(); });
  }

  //reset the action to the previously selected action
  if (current_action) {
    this.unit_input.selectActionById(current_action);
  }
}

HUDRenderer.prototype.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "";
}

HUDRenderer.prototype.writeMessage = function(message, element) {
  if (!element) 
    var element = 'city-resources';
  document.getElementById(element).innerHTML = message;
}

HUDRenderer.prototype.writeResources = function(city) {
  var message = "Food:".concat(city.civ.resources.food)
                 .concat(" Wood:").concat(city.civ.resources.wood)
                 .concat(" Stone:").concat(city.civ.resources.stone);
  if (city.civ.resources.unknown > 0)
    message = message.concat(" Unknown:").concat(city.civ.resources.unknown);
  this.writeMessage(message);
}

//starts an every-second screen update of city resources
HUDRenderer.prototype.trackUnitResources = function() {
  
  if (this.stop_city_interval_number != 0)
    clearInterval(this.stop_city_interval_number);

  function update_function() { 
    let unit = this.unit_input.getUnitSelected();
    let pop = Math.floor(this.world.total_population);
    this.writeMessage("World population: ".concat(pop), 'world-resources');

    if (unit.civ && unit.civ.resources) {
      this.writeResources(unit); 
      this.updateActionButtons();
    } else {
      this.clearButtons();
      this.writeMessage("", 'city-resources');
    }
  }

  let self = this;
  this.stop_city_interval_number = setInterval(update_function.bind(self), 1000);
}

function tooltip(message) {
  document.getElementById('tooltip').innerHTML += message;
}

HUDRenderer.prototype.updateTooltip = function(hex_hovered) {
  document.getElementById('tooltip').innerHTML = "";
  
  //skip hidden and out-of-bounds hexes
  if (!hex_hovered) 
    return;
  if (this.world.getTile(hex_hovered).hidden) {
    tooltip("clouds");
    return;
  }

  //HOVERING OVER UNITS
  let unit = this.world.getUnit(hex_hovered);
  if (unit && unit.hasComponent('size'))
    tooltip(unit.type+", ");

  //HOVERING OVER RESOURCES
  let resource = this.world.getResource(hex_hovered);
  if (resource && resource.resources) 
    tooltip(resource.type+", ");

  //HOVERING OVER LAND TILES, RIVERS, and CULTURE
  let tile = this.world.getTile(hex_hovered);
  if (tile && tile.elevation) {
    tooltip(land_tiles[tile.elevation]+", ");
  }
  if (tile && tile.river && tile.river.water_level >= 7) {
    tooltip('river '+tile.river.name+', ');
  }
  if (tile && this.world.getTile(hex_hovered).civ ) {
    tooltip(this.world.getTile(hex_hovered).civ.name);
  }

}