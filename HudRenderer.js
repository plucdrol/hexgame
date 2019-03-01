function HUDRenderer(world, game_input, hex_renderer) {

  this.stop_city_interval_number = 0;
  this.game_input = game_input;
  this.world = world;
  this.unit_input = game_input.unit_input;
  
  //start tracking
  this.trackUnitResources();
  this.hex_renderer = hex_renderer;
}





/////////////////////////////////////////////////////
//          Functions about map overlay information
/////////////////////////////////////////////////////
HUDRenderer.prototype.drawHUD = function() {


  var hex_hovered = this.game_input.hex_hovered;
  var hex_selected = this.unit_input.hex_selected;

  if (hex_selected) {
    this.drawUnitRange();
    this.drawSelectionHex(hex_selected);
  }

  if (hex_hovered) {
    this.drawHoveredHex(hex_hovered);
  }
}


HUDRenderer.prototype.unitHasRenderableRange = function(unit) {
  return (unit && unit instanceof Unit && unit.range.length > 0)
}


HUDRenderer.prototype.drawUnitRange = function() {
  //draw range of selected unit  
  var unit = this.unit_input.getUnitSelected();

  if (this.unitHasRenderableRange(unit)) {
    this.hex_renderer.drawHexes(unit.range);

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













/////////////////////////////////////////////////////
//              Functions about action buttons
/////////////////////////////////////////////////////

HUDRenderer.prototype.makeActionButton = function(unit, action) {
  return "<label><input class='action-button-input' name='actions' type='radio' "
           +" id='action-" + action.name + "'"
           +" value='" + action.name + "'><div class='action-button'>"
           + action.description() + "</div></label></input>";
}

HUDRenderer.prototype.updateActionButtons = function() {

  //do nothing if there is no unit to update
  let unit = this.unit_input.getUnitSelected();
  let position = this.unit_input.getHexSelected();
  if (!unit) return;

  //remember previous action
  var current_action = this.unit_input.getActionSelectedId();

  //generate new button list
  this.generateButtons(unit, position);
  this.addClickDetection();

  //reselect the previously selected action
  if (current_action) {
    this.unit_input.selectActionById(current_action);
  }
}

HUDRenderer.prototype.generateButtons = function(unit, position) {

  //get button-list HTML element
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "";

  //display simple message if no unit is selected
  if (!unit.actions || unit.actions.length == 0) {
    action_buttons.innerHTML = "Click a village";
    return;
  }

  for (let action of unit.actions) {
    
    //only show actions whose activation is met
    if (!action.activation(this.world, unit, position)) 
      continue;

    let new_button = this.makeActionButton(unit, action);
    action_buttons.innerHTML += new_button;
    
    //Show actions in grey if their requirements are not met
    if (!action.requirement(this.world, unit, position)) {
      document.getElementById("action-".concat(action.name)).disabled = true;
    }
  }
}

HUDRenderer.prototype.addClickDetection = function() {
  let self = this;
  //add the click-detection code
  for (let button of document.getElementsByClassName('action-button-input')) {
    button.addEventListener('click', function(){ self.unit_input.updateActionRange(); });
  }
}

HUDRenderer.prototype.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "<p>Click a village</p>";
}











/////////////////////////////////////////////////////
//           Functions about top bar messages
/////////////////////////////////////////////////////

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

  let self = this;
  this.stop_city_interval_number = setInterval(self.update_function.bind(self), 1000);
}


HUDRenderer.prototype.update_function = function() { 
  let unit = this.unit_input.getUnitSelected();
  let pop = this.world.totalPopulation();
  this.writeMessage("World population: ".concat(pop), 'world-resources');

  if (unit.civ && unit.civ.resources) {
    this.writeResources(unit); 
    this.updateActionButtons();
  } else {
    this.clearButtons();
    this.writeMessage("", 'city-resources');
  }
}









/////////////////////////////////////////////////////
//              Functions about Tooltip
/////////////////////////////////////////////////////

function clearTooltip() {
  document.getElementById('tooltip').innerHTML = "";
}

function writeTooltip(message) {
  document.getElementById('tooltip').innerHTML += message;
}

HUDRenderer.prototype.updateTooltip = function(hex_hovered) {
  clearTooltip();
  
  //skip hidden and out-of-bounds hexes
  if (!hex_hovered) 
    return;
  if (this.world.tileIsRevealed(hex_hovered)) {
    writeTooltip("clouds");
    return;
  }

  //HOVERING OVER THINGS
  this.tooltipUnit(hex_hovered);
  this.tooltipResource(hex_hovered);
  this.tooltipTile(hex_hovered);

}

HUDRenderer.prototype.tooltipUnit = function(hex_hovered) {
  let unit = this.world.getUnit(hex_hovered);
  if (unit && unit.hasOwnProperty('size'))
    writeTooltip(unit.type+", ");
}

HUDRenderer.prototype.tooltipResource = function(hex_hovered) {
  let resource = this.world.getResource(hex_hovered);
  if (resource && resource.resources) 
    writeTooltip(resource.type+", ");
}

HUDRenderer.prototype.tooltipTile = function(hex_hovered) {
  let tile = this.world.getTile(hex_hovered);
  if (tile && tile.hasOwnProperty('elevation')) {
    writeTooltip(land_tiles[tile.elevation]+", ");
  }
  if (tile && tile.river && tile.river.water_level >= 7) {
    writeTooltip('river '+tile.river.name+', ');
  }
  if (tile && this.world.getTile(hex_hovered).civ ) {
    writeTooltip(this.world.getTile(hex_hovered).civ.name);
  }
}