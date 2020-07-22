///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             ACTOR INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


//Receives input and affects actors inside a single World

//Dependencies
//  Hex.js
//  PathFinder.js 


function UnitInput(world) {
  this.world = world;
  this.hex_selected = undefined;

  listenForEvent('hex_clicked', this.clickHex.bind(this) );
  
  this.button_menu = new ButtonMenu('action-buttons', this);
}
//-------1---------2---------3---------4---------5---------6--------7---------8--------
UnitInput.p = UnitInput.prototype;

UnitInput.p.clickHex = function(hex) {

  //if there is already a unit on the hex selected
  if (this.anActorIsSelected() ) {
    this.clickWithSelection(hex.detail);
    return;
  }
    
  //if there is no unit selected
  this.clickWithNoSelection(hex.detail);
};

//selecting a tile
UnitInput.p.selectHex = function(hex) {

  this.button_menu.unselectActions();

  if (hex) {
    if (this.world.getActor(hex)) {

      this.hex_selected = hex;

      /* ----Do not clear the range----
      //look if there is a unit
      var actor = this.getActorSelected();
      if (actor) { 
        this.clearRange(actor);
      }*/
    } 
  } else {
    this.hex_selected = undefined;
    this.selectNothing();
  }
};
/*
UnitInput.p.clearRange = function(actor) {

  actor.range = [];
  this.world.clearHighlights();
};*/

UnitInput.p.selectNothing = function() {
  //this.getActorSelected().range = undefined;
  this.world.clearHighlights();
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
    return (maybe_actor.selectable);
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
  var action = this.button_menu.getActionSelected(actor);


  if (action && !action.infinite_range && !action.range ) {
    this.clickOutsideRange(target);
    return 0;
  }

  //if you are clicking inside the actor's range
  if ((action && action.infinite_range) || (action.range && listContainsHex(target, action.range)) ) {
    this.clickInsideRange(target);

  //if you are clicking outside the actor's range
  } else {
    this.clickOutsideRange(target);
  }
};

UnitInput.p.clickInsideRange = function(target) {

  let origin = this.hex_selected;
  let actor = this.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);

  if (action.requirement(this.world, actor, origin)) {
    action.doAction(this.world, actor, origin, target);
    if (action.nextSelection == 'target') {
      this.selectHex(target); 
    } 

    if (action.nextSelection == 'new_unit_if_exists' && this.world.unitAtLocation(target) ) {
      this.selectHex(target); 
    } 
  }

  this.button_menu.update_function(this.world, this);

};


UnitInput.p.clickOutsideRange = function(target) {
  //this.selectNothing();
  //this.clickHex(target);
};










UnitInput.p.updateActionTargetsIndirectly = function() {

  let actor = this.getActorSelected();
  let action = this.button_menu.getActionSelected(actor);

  if (action) {
    action.updateActionTargets(this.world, actor, this.hex_selected);
    world.highlightRange(action.range);
  } else {
    action.range = [];
    world.clearHighlights();
  }
};





