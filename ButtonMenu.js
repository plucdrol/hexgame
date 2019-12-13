

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

ButtonMenu.prototype.addInstantButtonClickDetection = function(menu_name, bonus_list, world, hud_renderer) {

  //add the click-detection code
  for (let button of document.getElementById(menu_name).getElementsByClassName('button-do')) {

    button.addEventListener('click', function(){ bonus_list.enableBonus(button.id, hud_renderer.world); 
                                                 hud_renderer.update_function(); });
  }
}