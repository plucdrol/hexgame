
import Events from './u/Events.js'

export default function ButtonMenu(menu_id, unit_input, world) {

  this.getActionSelected = getActionSelected
  this.unselectActions = unselectActions
  this.update = update


  Events.on('hex_clicked', update );

  /////////////////////////////////////////////////////
  //           Function which updates all the menus
  /////////////////////////////////////////////////////

  function update() { 

    let actor = unit_input.getActorSelected();
    let position = unit_input.getHexSelected();

    let free_res = world.getPopulation();
    let total_res = world.resources_collected;

    //updateBonusButtons(unit_input.world.bonus_list, unit_input.world);
    

    if (actor && actor.selectable) {
      updateActionButtons(world, actor, position);
    } else {
      clearButtons();
    }
  }





  /////////////////////////////////////////////////////////
                    // ACTION MENU AND SELECTION //
  /////////////////////////////////////////////////////////



  //returns the actual action object
  function getActionSelected(actor) {
    return getActionFromId(actor, getActionSelectedId());
  };

  function getActionId(action) {
    return 'action-'.concat(action.name);
  }

  function actionIsSelected(action) {
    return getActionId(action) == getActionSelectedId();
  }

  //Returns the currently selected action_id of the selected unit
  function getActionSelectedId() {
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

  function getActionFromId(actor, action_id) {

    if (!actor || !actor.actions || !action_id)
      return undefined;

    for (let action of actor.actions) {
      if ('action-'.concat(action.name) == action_id) {
        return action;
      }
    }
  };

  function selectActionById(action_id) {
    if (document.getElementById(action_id)) {
      document.getElementById(action_id).checked = true;
    }
  };

  function unselectActions() {
    let buttons = document.getElementById('action-buttons').getElementsByClassName('button-input');
    for (button of buttons) {
      button.checked = false;
    }
  };

  //This is the place where REACT should take over
  function makeButton(menu_name, button_id, button_title, text, do_button) {

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

  function addButtonClickDetection(menu_name, function_call) {
    
    //add the click-detection code
    for (let button of document.getElementById(menu_name).getElementsByClassName('button-input')) {
      button.addEventListener('click', function_call );
    }
  }

  function addInstantButtonClickDetection(menu_name, bonus_list) {


    //add the click-detection code
    for (let button of document.getElementById(menu_name).getElementsByClassName('button-do')) {

      button.addEventListener('click', function(){ bonus_list.enableBonus(button.id); 
                                                   update(); });
    }
  }



























  /////////////////////////////////////////////////////
  //              Functions about action buttons
  /////////////////////////////////////////////////////



  function makeActionButton(action) {

    let description = action.getDescription();
    let extra_description = action.getExtraDescription();

    return makeButton('action', action.name, description, extra_description);
  }

  function updateActionButtons(world, actor, position) {

    //do nothing if there is no unit to update
    if (!actor) return;

    //remember previous action
    var current_action = getActionSelectedId();

    //generate new button list
    generateButtons(world, actor, position);
    addActionClickDetection();

    //reselect the previously selected action
    if (current_action) {
      selectActionById(current_action);
    } else {
      selectFirstActionIfNoneSelected();
    }
  }

  function generateButtons(world, actor, position) {

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

      //if (action.getActionTargets(world, actor, position).length < 1 && !action.infinite_range)
        //continue;

      let new_button = makeActionButton(action);
      action_buttons.innerHTML += new_button;
      
      //Show actions in grey if their requirements are not met
      if (!action.requirement(world, actor, position)) {
        document.getElementById("action-".concat(action.name)).disabled = true;
      }

      if (action.takes_city_pop && (action.free_pop_cost > actor.getPop() ))
        document.getElementById("action-".concat(action.name)).disabled = true;
    }
  }

  function selectFirstActionIfNoneSelected() {

    //test if an action is already selected
    let radio_elements = document.getElementById('action-buttons').getElementsByClassName('button-input');
    for (let radio of radio_elements) {
      if (radio.checked) 
        return;
    }

    //if none were selected, select the first one
    let first_action = radio_elements[0];
    if (first_action && !first_action.disabled) {
      first_action.checked = true;
      updateActionTargets();
    }


  }



  function addActionClickDetection() {
    addButtonClickDetection('action-buttons', updateActionTargets );
  }

  function clearButtons() {
    document.getElementById('action-buttons').innerHTML = "<h2 class='action-header'>Click a town</h2>";
  }












  /////////////////////////////////////////////////////
  //              Functions about bonus buttons
  /////////////////////////////////////////////////////

  function makeBonusButton(bonus) {

    return makeButton('bonus', bonus.name, bonus.getDescription(), bonus.getExtraDescription(), bonus.name);
  }

  function generateBonusButtons(bonus_list, world) {

    //get button-list HTML element
    var buttons = document.getElementById('bonus-buttons');
    buttons.innerHTML = "<h2 class='action-header'>Evolution</h2>";

    //display simple message if no bonus available
    if ( !bonus_list.bonusAvailable() ) {
      buttons.innerHTML = "";
      return;
    }

    for (let bonus of bonus_list.getBonusesAvailable(world)) {
      
      let new_button = makeBonusButton(bonus);
      buttons.innerHTML += new_button;
    }
  }



  function addBonusClickDetection(bonus_list) {

    addInstantButtonClickDetection('bonus-buttons', bonus_list);

  }

  function updateBonusButtons(bonus_list, world) {


    //generate new button list
    generateBonusButtons(bonus_list, world);
    addBonusClickDetection(bonus_list);

  }

  function clearBonusButtons() {
    document.getElementById('bonus-buttons').innerHTML = "<h2 class='action-header'>Evolution</h2>";
  }




  function updateActionTargets() {

      let actor = unit_input.getActorSelected();
      let action = getActionSelected(actor);
      let hex_selected = unit_input.getHexSelected();

      if (action) {
        action.updateActionTargets( world, actor, hex_selected);
        world.highlightRange(action.range, 'brown'); //brown is the color of COLONIZABLE
      } else {
        action.range = [];
      }
    };
































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




  function updateTooltip(hex_hovered) {
    clearTooltip();
    
    //skip hidden and out-of-bounds hexes
    if (!hex_hovered) 
      return;
    if (!world.tileIsRevealed(hex_hovered)) {
      addTooltip("clouds");
      return;
    }

    //HOVERING OVER THINGS
    addTooltipUnit(hex_hovered);
    //if (!getTooltip())
      addTooltipResource(hex_hovered);
    //if (!getTooltip())
      addTooltipTile(hex_hovered);

  }

  function addTooltipUnit(hex_hovered) {
    let unit = world.getUnit(hex_hovered);
    if (unit && unit.hasOwnProperty('size'))
      addTooltip(unit.type+", ");
  }

  function addTooltipResource(hex_hovered) {
    let resource = world.getResource(hex_hovered);
    if (resource && resource.resources) 
      addTooltip(resource.type+", ");
  }

  function addTooltipTile(hex_hovered) {
    let tile = world.getTile(hex_hovered);
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

  function writeMessage(message, element) {
    if (!element) 
      element = 'free-ants';

    document.getElementById(element).innerHTML = message;
  }





}