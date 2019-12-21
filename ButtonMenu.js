

function ButtonMenu(menu_id) {

	this.menu_id = menu_id;
}

ButtonMenu.p = ButtonMenu.prototype;

/////////////////////////////////////////////////////////
                  // ACTION MENU AND SELECTION //
/////////////////////////////////////////////////////////



//returns the actual action object
ButtonMenu.p.getActionSelected = function(actor) {
  return this.getActionFromId(actor, this.getActionSelectedId());
};

ButtonMenu.prototype.getActionId = function(action) {
  return 'action-'.concat(action.name);
}

ButtonMenu.prototype.actionIsSelected = function(action) {
  return this.getActionId(action) == this.getActionSelectedId();
}

//Returns the currently selected action_id of the selected unit
ButtonMenu.p.getActionSelectedId = function() {
  var action_buttons = document.getElementById('action-buttons').getElementsByClassName('button-input');
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
};

ButtonMenu.p.getActionFromId = function(actor, action_id) {

  if (!actor || !actor.actions || !action_id)
    return undefined;

  for (let action of actor.actions) {
    if ('action-'.concat(action.name) == action_id) {
      return action;
    }
  }
};

ButtonMenu.p.selectActionById = function(action_id) {
  if (document.getElementById(action_id)) {
    document.getElementById(action_id).checked = true;
  }
};

ButtonMenu.p.unselectActions = function() {
  let buttons = document.getElementById('action-buttons').getElementsByClassName('button-input');
  for (button of buttons) {
    button.checked = false;
  }
};






ButtonMenu.prototype.makeButton = function(menu_name, button_id, button_title, text, do_button) {

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







ButtonMenu.prototype.addButtonClickDetection = function(menu_name, function_call) {
  
  //add the click-detection code
  for (let button of document.getElementById(menu_name).getElementsByClassName('button-input')) {
    button.addEventListener('click', function_call );
  }
}

ButtonMenu.prototype.addInstantButtonClickDetection = function(menu_name, bonus_list) {

  let self = this;
  //add the click-detection code
  for (let button of document.getElementById(menu_name).getElementsByClassName('button-do')) {

    button.addEventListener('click', function(){ bonus_list.enableBonus(button.id); 
                                                 self.update_function(); });
  }
}



























/////////////////////////////////////////////////////
//              Functions about action buttons
/////////////////////////////////////////////////////



ButtonMenu.prototype.makeActionButton = function(action) {

  let description = action.getDescription();
  let extra_description = action.getExtraDescription();

  return this.makeButton('action', action.name, description, extra_description);
}

ButtonMenu.prototype.updateActionButtons = function(world, actor, position) {

  //do nothing if there is no unit to update
  if (!actor) return;

  //remember previous action
  var current_action = this.getActionSelectedId();

  //generate new button list
  this.generateButtons(world, actor, position);
  this.addActionClickDetection();

  //reselect the previously selected action
  if (current_action) {
    this.selectActionById(current_action);
  } else {
    //this.selectFirstActionIfNoneSelected();
  }
}

ButtonMenu.prototype.generateButtons = function(world, actor, position) {

  //get button-list HTML element
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "<h2 class='action-header'>"+actor.name+"</h2>";

  //display simple message if no unit is selected
  if (!actor.actions || actor.actions.length == 0) {
    //action_buttons.innerHTML = "Click a town";
    //return;
  }

  for (let action of actor.actions) {
    
    //only show actions whose activation is met
    if (!action.activation(world, actor, position)) 
      continue;

    //if (action.getActionTargets(this.world, actor, position).length < 1 && !action.infinite_range)
      //continue;

    let new_button = this.makeActionButton(action);
    action_buttons.innerHTML += new_button;
    
    //Show actions in grey if their requirements are not met
    if (!action.requirement(world, actor, position)) {
      document.getElementById("action-".concat(action.name)).disabled = true;
    }

    if (action.takes_city_pop && (action.free_pop_cost > actor.getPop() ))
      document.getElementById("action-".concat(action.name)).disabled = true;
  }
}

ButtonMenu.prototype.selectFirstActionIfNoneSelected = function() {

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
    this.unit_input.updateActionTargetsIndirectly();
  }


}



ButtonMenu.prototype.addActionClickDetection = function() {
  let self = this;

  this.addButtonClickDetection('action-buttons', function(){ self.unit_input.updateActionTargetsIndirectly() });

  /*
  //add the click-detection code
  for (let button of document.getElementById('action-buttons').getElementsByClassName('button-input')) {
    button.addEventListener('click', function(){ self.unit_input.updateActionTargetsIndirectly(); });
  }*/
}

ButtonMenu.prototype.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "<h2 class='action-header'>Click a town</h2>";
}












/////////////////////////////////////////////////////
//              Functions about bonus buttons
/////////////////////////////////////////////////////

ButtonMenu.prototype.makeBonusButton = function(bonus) {

  return this.makeButton('bonus', bonus.name, bonus.getDescription(), bonus.getExtraDescription(), bonus.name);
}

ButtonMenu.prototype.generateBonusButtons = function(bonus_list, world) {

  //get button-list HTML element
  var buttons = document.getElementById('bonus-buttons');
  buttons.innerHTML = "<h2 class='action-header'>Evolution</h2>";

  //display simple message if no bonus available
  if ( !bonus_list.bonusAvailable() ) {
    buttons.innerHTML = "";
    return;
  }

  for (let bonus of bonus_list.getBonusesAvailable(world)) {
    
    let new_button = this.makeBonusButton(bonus);
    buttons.innerHTML += new_button;
  }
}



ButtonMenu.prototype.addBonusClickDetection = function(bonus_list) {

  this.addInstantButtonClickDetection('bonus-buttons', bonus_list);

}

ButtonMenu.prototype.updateBonusButtons = function(bonus_list, world) {


  //generate new button list
  this.generateBonusButtons(bonus_list, world);
  this.addBonusClickDetection(bonus_list);

}

ButtonMenu.prototype.clearBonusButtons = function() {
  document.getElementById('bonus-buttons').innerHTML = "<h2 class='action-header'>Evolution</h2>";
}













/////////////////////////////////////////////////////
//           Function which updates all the menus
/////////////////////////////////////////////////////

ButtonMenu.prototype.update_function = function(world, unit_input) { 
  let actor = unit_input.getActorSelected();
  let position = unit_input.getHexSelected();

  let free_res = world.getPopulation();
  let total_res = world.resources_collected;

  let resources = world.total_resources;
  this.writeMessage("Free: "+free_res, 'free-ants');
  this.writeMessage("Total: "+total_res, 'total-ants');

  this.updateBonusButtons(world.bonus_list, world);
  

  if (actor && actor.selectable) {
    this.updateActionButtons(world, actor, position);
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

ButtonMenu.prototype.updateHover = function(hex_hovered) {
  //this.updateActionPath(hex_hovered);
  //this.updateTooltip(hex_hovered);
  this.last_hover = hex_hovered;
}


ButtonMenu.prototype.updateTooltip = function(hex_hovered) {
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
  //if (!getTooltip())
    this.addTooltipResource(hex_hovered);
  //if (!getTooltip())
    this.addTooltipTile(hex_hovered);

}

ButtonMenu.prototype.addTooltipUnit = function(hex_hovered) {
  let unit = this.world.getUnit(hex_hovered);
  if (unit && unit.hasOwnProperty('size'))
    addTooltip(unit.type+", ");
}

ButtonMenu.prototype.addTooltipResource = function(hex_hovered) {
  let resource = this.world.getResource(hex_hovered);
  if (resource && resource.resources) 
    addTooltip(resource.type+", ");
}

ButtonMenu.prototype.addTooltipTile = function(hex_hovered) {
  let tile = this.world.getTile(hex_hovered);
  if (tile && tile.hasOwnProperty('elevation')) {
    addTooltip(land_tiles[tile.elevation]+", ");
  }
  if (tile.river) {
    addTooltip('river '+tile.river.water_level);
  }
}


/////////////////////////////////////////////////////
//           Functions about top bar messages
/////////////////////////////////////////////////////

ButtonMenu.prototype.writeMessage = function(message, element) {
  if (!element) 
    var element = 'free-ants';
  document.getElementById(element).innerHTML = message;
}


