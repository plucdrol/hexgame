///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             ACTOR INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


//Receives input and affects actors inside a single World

//Dependencies
import Hex from './u/Hex.js'
import PathFinder from './u/Pathfinder.js'
import ButtonMenu from './ButtonMenu.js'
import Events from './u/Events.js'

import {listContainsHex} from './u/Hex.js'



export default function UnitInput(world) {
  
  var hex_selected = undefined;
  var button_menu = new ButtonMenu('action-buttons', this, world);


  this.selectNothing = selectNothing;
  this.getHexSelected = getHexSelected
  this.getActorSelected = getActorSelected
  this.getActionSelected = getActionSelected

  Events.on('hex_clicked', clickHex );
  


  //-------1---------2---------3---------4---------5---------6--------7---------8--------

  function clickHex(hex) {

    //if there is already a unit on the hex selected
    if (anActorIsSelected() ) {
      clickWithSelection(hex.detail);
      return;
    }
      
    //if there is no unit selected
    clickWithNoSelection(hex.detail);
  };

  //selecting a tile
  function selectHex(hex) {

    button_menu.unselectActions();

    if (hex) {
      if (world.getActor(hex)) {

        hex_selected = hex;

        /* ----Do not clear the range----
        //look if there is a unit
        var actor = getActorSelected();
        if (actor) { 
          clearRange(actor);
        }*/
      } 
    } else {
      hex_selected = undefined;
      selectNothing();
    }
  };


  function selectNothing() {
    //getActorSelected().range = undefined;
    hex_selected = undefined;
    button_menu.update();
  };

  function aHexIsSelected() {
    return (hex_selected instanceof Hex);
  };

  function getHexSelected()  {
    if (aHexIsSelected())
      return hex_selected;
    else
      return false;
  };

  function anActorIsSelected() {
    
    if (!aHexIsSelected()) 
      return false;

    var maybe_actor = world.getActor(getHexSelected());
    if (maybe_actor) {
      return (maybe_actor.selectable);
    } else {
      return false;
    }
  };

  function getActorSelected() {
    if (anActorIsSelected()) {
      return world.getActor(getHexSelected());
    } else {
      return false;
    }
  };

  function getActionSelected() {
    if (anActorIsSelected()) {
      let actor = getActorSelected();
      return button_menu.getActionSelected(actor);
    } else {
      return false;
    }
  };

  function clickWithNoSelection(target) {
    selectHex(target);
  };

  //This is where target-actions should take effect
  //Instant effects will happen when the button is pressed instead
  function clickWithSelection(target) {
    
    var actor = getActorSelected();
    var action = button_menu.getActionSelected(actor);


    if (action && !action.infinite_range && !action.range ) {
      clickOutsideRange(target);
      return 0;
    }

    //if you are clicking inside the actor's range
    if ((action && action.infinite_range) || (action.range && listContainsHex(target, action.range)) ) {
      clickInsideRange(target);

    //if you are clicking outside the actor's range
    } else {
      clickOutsideRange(target);
    }
  };

  function clickInsideRange(target) {

    let origin = hex_selected;
    let actor = getActorSelected();
    let action = button_menu.getActionSelected(actor);

    if (action.requirement(world, actor, origin)) {
      action.doAction(world, actor, origin, target);
      if (action.nextSelection == 'target') {
        selectHex(target); 
      } 

      if (action.nextSelection == 'new_unit_if_exists' && world.unitAtLocation(target) ) {
        selectHex(target); 
      } 
    }

    button_menu.update();

  };


  function clickOutsideRange(target) {

    if (world.unitAtLocation(target)) {
      selectNothing();
      clickHex(target);
    }
  };





}