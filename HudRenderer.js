function HUDRenderer(world, game_input, hex_renderer) {

  this.game_input = game_input;
  this.world = world;
  this.unit_input = game_input.unit_input;
  this.button_menu = this.unit_input.button_menu;
  this.hex_renderer = hex_renderer;
  this.action_path = [];
  this.action_targets = [];
}





/////////////////////////////////////////////////////
//          Functions about map overlay information
/////////////////////////////////////////////////////
HUDRenderer.prototype.drawHUD = function() {


  var hex_hovered = this.game_input.hex_hovered;
  var hex_selected = this.unit_input.hex_selected;

  if (hex_selected) {
    let unit = this.unit_input.getActorSelected();

    this.drawSelectionHex(hex_selected);

    if (hex_hovered) {
      this.drawHoveredHex(hex_hovered);
    }

    if (unit) {
      let action = this.button_menu.getActionSelected(unit);
      if (action /*&& action.name != 'city-by-air'*/) {
        //this.drawActorRange();

        if (this.action_path.length > 0) {
          //this.drawActionPath(hex_hovered);
        }

        if (this.action_targets.length > 0) {
          this.drawActionTargets(hex_hovered);
        }
      }
    } 

  } else {
    if (hex_hovered ) {
      this.drawHoveredHex(hex_hovered);
    }
  }



}


HUDRenderer.prototype.updateActionPath = function (hex_hovered) {
  
  let actor = this.unit_input.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);
  let hex_selected = this.unit_input.hex_selected;

  if (action && actor && hex_selected) {
    this.action_path = action.getActionPath(world, actor, hex_selected, hex_hovered, 15);
  } else {
    this.action_path = [];
  }
}

HUDRenderer.prototype.drawActionPath = function (hex_hovered) {

  let actor = this.unit_input.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);
  let hex_selected = this.unit_input.hex_selected;

  //draw a line from actor to target
  let color = '#C50';
  if ( action.targetFilterFunction(this.world, actor, hex_selected, hex_hovered) )
    color = '#5C0';

  this.drawPath(this.action_path, color);
}


HUDRenderer.prototype.updateActionTargets = function (hex_hovered) {
  
  let actor = this.unit_input.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);
  let hex_selected = this.unit_input.hex_selected;

  this.action_targets = [];

  if (action && actor && hex_selected && action.hover_action) {
    if (!action.targetFilterFunction(this.world, actor, hex_selected, hex_hovered))
      return;

    let hover_action = action.hover_action;
    this.action_targets = hover_action.getActionRange(this.world, actor, hex_hovered );
  } 
}

HUDRenderer.prototype.drawActionTargets = function (hex_hovered) {

  let actor = this.unit_input.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);
  
  let hex_selected = this.unit_input.hex_selected;
  
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(50,200,50,0)";
  hover_style.line_width = 3;
  hover_style.line_color = "rgba(50,200,50,1)";

  for (target of this.action_targets) {
    if (!this.world.getTile(target).hidden)
      this.hex_renderer.drawHex( target, hover_style );

  }
  
}


HUDRenderer.prototype.drawPath = function(hexarray, color) {
  var previous = hexarray[0];
  if (hexarray.length > 0)
    for (hex of hexarray) {
      this.hex_renderer.drawCenterLine(hex, previous, 6, color );
      previous = hex;
    }
}

HUDRenderer.prototype.actorHasRenderableRange = function(actor) {
  return (actor && actor.selectable && actor.range.length > 0)
}



HUDRenderer.prototype.drawActorRange = function() {
  //draw range of selected actor
  var actor = this.unit_input.getActorSelected();
  
  //range style
  var range_style = new RenderStyle();
  range_style.fill_color = "rgba(255,255,150, "+this.ocillate(900)+")";
  range_style.line_color = "rgba(255,255,100,"+(0.5+0.5*this.ocillate(900))+")";

  if (this.actorHasRenderableRange(actor)) {
    this.hex_renderer.drawHexes(actor.range, range_style);

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

    select_style.fill_color = "rgba(200,200,0,"+this.ocillate(500)+")";
    select_style.line_width = 2;
    //this.hex_renderer.drawHex(hex_selected, select_style);
    this.hex_renderer.drawCenterLine(
          hex_selected,
          Hex.add(hex_selected,new Hex(20,-40)),
          16*this.unit_input.getActorSelected().size, 
          "rgba(0,200,200,"+(0.3+0.7*this.ocillate(1000))+")" );
}

HUDRenderer.prototype.ocillate = function(length) {
  let time = new Date().getTime()%length;
  let opacity = Math.abs(time/length-0.5);
  return opacity;
}








/////////////////////////////////////////////////////
//              Functions about action buttons
/////////////////////////////////////////////////////

HUDRenderer.prototype.makeButton = function(menu_name, button_id, button_title, text, do_button) {

  if (do_button)
    var do_button =  "<button type='button' id='"+button_id+"'class='button-do'>Choose</button>";
  else 
    var do_button = "";

  return "<label><input class='button-input' name='"+menu_name+"' type='radio' "
           +" id='" + menu_name + "-" + button_id + "'"
           +" value='" + button_id + "'><div class='action-button'>"
           + button_title + "<br><span class='extra-description'>" +
           text +"</span>"+do_button+"</div></label></input>";
}

HUDRenderer.prototype.makeActionButton = function(action) {

  let description = action.getDescription();
  let extra_description = action.getExtraDescription();

  return this.makeButton('action', action.name, description, extra_description);
}

HUDRenderer.prototype.updateActionButtons = function() {

  //do nothing if there is no unit to update
  let actor = this.unit_input.getActorSelected();
  let position = this.unit_input.getHexSelected();
  if (!actor) return;

  //remember previous action
  var current_action = this.button_menu.getActionSelectedId();

  //generate new button list
  this.generateButtons(actor, position);
  this.addClickDetection();

  //reselect the previously selected action
  if (current_action) {
    this.button_menu.selectActionById(current_action);
  } else {
    this.selectFirstActionIfNoneSelected();
  }
}

HUDRenderer.prototype.generateButtons = function(actor, position) {

  //get button-list HTML element
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "<h2 class='action-header'>"+actor.name+"</h2>";

  //display simple message if no unit is selected
  if (!actor.actions || actor.actions.length == 0) {
    action_buttons.innerHTML = "Click a town";
    return;
  }

  for (let action of actor.actions) {
    
    //only show actions whose activation is met
    if (!action.activation(this.world, actor, position)) 
      continue;

    if (action.getActionRange(this.world, actor, position).length < 1 && !action.infinite_range)
      continue;

    let new_button = this.makeActionButton(action);
    action_buttons.innerHTML += new_button;
    
    //Show actions in grey if their requirements are not met
    if (!action.requirement(this.world, actor, position)) {
      document.getElementById("action-".concat(action.name)).disabled = true;
    }

    if (action.takes_city_pop && (action.free_pop_cost > actor.getPop() ))
      document.getElementById("action-".concat(action.name)).disabled = true;
  }
}

HUDRenderer.prototype.selectFirstActionIfNoneSelected = function() {

  //test if an action is already selected
  let radio_elements = document.getElementById('action-buttons').getElementsByClassName('button-input');
  for (radio of radio_elements) {
    if (radio.checked) 
      return;
  }

  //if none were selected, select the first one
  let first_action = radio_elements[0];
  if (first_action && !first_action.disabled) {
    first_action.checked = true;
    this.unit_input.updateActionRangeIndirectly();
  }


}

HUDRenderer.prototype.addClickDetection = function() {
  let self = this;
  //add the click-detection code
  for (let button of document.getElementById('action-buttons').getElementsByClassName('button-input')) {
    button.addEventListener('click', function(){ self.unit_input.updateActionRangeIndirectly(); });
  }
}

HUDRenderer.prototype.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "<h2 class='action-header'>Click a town</h2>";
}






/////////////////////////////////////////////////////
//              Functions about bonus buttons
/////////////////////////////////////////////////////

HUDRenderer.prototype.makeBonusButton = function(bonus) {

  return this.makeButton('bonus', bonus.name, bonus.getDescription(), bonus.getExtraDescription(), bonus.name);

  /*return "<label><input class='button-input' name='bonus' type='radio' "
           +" id='bonus-" + bonus.name + "'"
           +" value='" + bonus.name + "'><div class='action-button'>"
           + bonus.getDescription() + extra_description + do_button + "</div></label></input>";*/
}

HUDRenderer.prototype.generateBonusButtons = function(bonus_list) {

  //get button-list HTML element
  var buttons = document.getElementById('bonus-buttons');
  buttons.innerHTML = "<h2 class='action-header'>Evolution</h2>";

  //display simple message if no bonus available
  if ( !bonus_list.bonusAvailable() ) {
    buttons.innerHTML = "";
    return;
  }

  for (let bonus of bonus_list.getBonuses()) {
    
    //only show actions whose activation is met
    if (!bonus.requirement(this.world)) 
      continue;

    if (bonus.enabled) 
      continue;

    let new_button = this.makeBonusButton(bonus);
    buttons.innerHTML += new_button;
  }
}

HUDRenderer.prototype.addBonusClickDetection = function(bonus_list) {
  let self = this;
  //add the click-detection code
  for (let button of document.getElementsByClassName('button-do')) {

    button.addEventListener('click', function(){ bonus_list.enableBonus(button.id, self.world); 
                                                 self.update_function(); });
  }
}

HUDRenderer.prototype.updateBonusButtons = function(bonus_list) {


  //generate new button list
  this.generateBonusButtons(bonus_list);
  this.addBonusClickDetection(bonus_list);

}

HUDRenderer.prototype.clearBonusButtons = function() {
  document.getElementById('bonus-buttons').innerHTML = "<h2 class='action-header'>Evolution</h2>";
}




/////////////////////////////////////////////////////
//           Functions about top bar messages
/////////////////////////////////////////////////////

HUDRenderer.prototype.writeMessage = function(message, element) {
  if (!element) 
    var element = 'free-ants';
  document.getElementById(element).innerHTML = message;
}

HUDRenderer.prototype.update_function = function() { 
  let actor = this.unit_input.getActorSelected();
  let free_res = this.world.getPopulation();
  let total_res = this.world.resources_collected;

  let resources = this.world.total_resources;
  this.writeMessage("Free: "+free_res, 'free-ants');
  this.writeMessage("Total: "+total_res, 'total-ants');

  this.updateBonusButtons(this.world.bonus_list);

  if (actor && actor.selectable) {
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

function getTooltip() {
  return document.getElementById('tooltip').innerHTML;
}

function addTooltip(message) {
  document.getElementById('tooltip').innerHTML += message;
}

HUDRenderer.prototype.updateHover = function(hex_hovered) {
  //this.updateActionPath(hex_hovered);
  this.updateTooltip(hex_hovered);

  this.action_targets = [];
  let self = this;
  if (this.hoverTimeout)
    clearTimeout(this.hoverTimeout);
  this.hoverTimeout = setTimeout(function(){ self.updateActionTargets(hex_hovered) }, 100);

}


HUDRenderer.prototype.updateTooltip = function(hex_hovered) {
  clearTooltip();
  
  //skip hidden and out-of-bounds hexes
  if (!hex_hovered) 
    return;
  if (!this.world.tileIsRevealed(hex_hovered)) {
    addTooltip("clouds");
    return;
  }

  //HOVERING OVER THINGS
  this.addTooltipUnit(hex_hovered);
  if (!getTooltip())
    this.addTooltipResource(hex_hovered);
  if (!getTooltip())
    this.addTooltipTile(hex_hovered);

}

HUDRenderer.prototype.addTooltipUnit = function(hex_hovered) {
  let unit = this.world.getUnit(hex_hovered);
  if (unit && unit.hasOwnProperty('size'))
    addTooltip(unit.type+", ");
}

HUDRenderer.prototype.addTooltipResource = function(hex_hovered) {
  let resource = this.world.getResource(hex_hovered);
  if (resource && resource.resources) 
    addTooltip(resource.type+", ");
}

HUDRenderer.prototype.addTooltipTile = function(hex_hovered) {
  let tile = this.world.getTile(hex_hovered);
  if (tile && tile.hasOwnProperty('elevation')) {
    addTooltip(land_tiles[tile.elevation]+", ");
  }
  if (this.world.onRiver(hex_hovered)) {
    addTooltip('river, ');
  }
}