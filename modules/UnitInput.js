///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             ACTOR INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

//Dependencies
//  Hex.js
//  PathFinder.js 


function UnitInput(world) {
  this.world = world;
  this.hex_selected = undefined;
  this.units = world.units;
  this.action_selected = undefined;
  this.civ_selected = undefined;


}
//-------1---------2---------3---------4---------5---------6--------7---------8--------
UnitInput.p = UnitInput.prototype;

UnitInput.p.clickHex = function(hex) {

  //if there is already a unit on the hex selected
  if (this.anActorIsSelected() ) {
    this.clickWithSelection(hex);
    return;
  }
    
  //if there is no unit selected
  this.clickWithNoSelection(hex);
};

//civ style
UnitInput.p.selectHex = function(hex) {

  this.unselectActions();

  if (hex) {
    if (this.world.getActor(hex)) {

      this.hex_selected = hex;

      //look if there is a unit
      var actor = this.getActorSelected();
      if (actor) { 
        this.selectActor(actor);
      }
    } 
  } else {
    this.hex_selected = undefined;
    this.selectNothing();
  }
};

UnitInput.p.selectActor = function(actor) {

  actor.range = [];
};

UnitInput.p.selectNothing = function() {
  this.getActorSelected().range = undefined;
  this.hex_selected = undefined;
};

UnitInput.p.aHexIsSelected = function() {
  return (this.hex_selected instanceof Hex);
};

UnitInput.p.getHexSelected = function()  {
  if (this.aHexIsSelected())
    return this.hex_selected;
  else
    return false;
};

UnitInput.p.anActorIsSelected = function() {
  if (!this.aHexIsSelected()) 
    return false;

  var maybe_actor = this.world.getActor(this.getHexSelected());
  if (maybe_actor) {
    return (maybe_actor instanceof Civilization);
  } else {
    return false;
  }
};

UnitInput.p.getActorSelected = function() {
  if (this.anActorIsSelected()) {
    return this.world.getActor(this.getHexSelected());
  } else {
    return false;
  }
};

UnitInput.p.clickWithNoSelection = function(target) {
  this.selectHex(target);
};

//This is where target-actions should take effect
//Instant effects will happen when the button is pressed instead
UnitInput.p.clickWithSelection = function(target) {
  
  var actor = this.getActorSelected();
  if (!actor.range ) {
    this.clickOutsideUnitRange(target);
    return 0;
  }

  //if you are clicking inside the actor's range
  if (actor.range && listContainsHex(target, actor.range) ) {
    this.clickInsideRange(target);

  //if you are clicking outside the actor's range
  } else {
    this.clickOutsideRange(target);
  }
};

UnitInput.p.clickInsideRange = function(target) {

  let origin = this.hex_selected;
  let action = this.getActionSelected();
  let actor = this.getActorSelected();

  if (action.requirement(this.world, actor, origin)) {
    action.doAction(this.world, actor, origin, target);
    if (action.nextSelection == 'target') {
      this.selectHex(target); 
    }
  }

};


UnitInput.p.clickOutsideRange = function(target) {
  this.selectNothing();
  this.clickHex(target);
};























/////////////////////////////////////////////////////////
                  // ACTION MENU AND SELECTION //
/////////////////////////////////////////////////////////

//uses nothing
UnitInput.p.updateActionRangeIndirectly = function() {

  let action = this.getActionSelected();
  let world = this.world;
  let actor = this.getActorSelected();

  if (action)
    actor.range = action.getActionRange(world, actor);
  else
    actor.range = new HexMap();
};

//returns the actual action object
UnitInput.p.getActionSelected = function() {
  return this.getActionFromId(this.getActorSelected(), this.getActionSelectedId());
};

//Returns the currently selected action_id of the selected unit
UnitInput.p.getActionSelectedId = function() {
  var action_buttons = document.getElementsByClassName('action-button-input');
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

UnitInput.p.getActionFromId = function(actor, action_id) {
  for (let action of actor.actions) {
    if ('action-'.concat(action.name) == action_id) {
      return action;
    }
  }
};

UnitInput.p.selectActionById = function(action_id) {
  if (document.getElementById(action_id)) {
    document.getElementById(action_id).checked = true;
  }
};

UnitInput.p.unselectActions = function() {
  let buttons = document.getElementsByClassName('action-button-input');
  for (button of buttons) {
    button.checked = false;
  }
};





