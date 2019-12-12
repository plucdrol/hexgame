

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


