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
import ActionButtons from './ActionButtons.js'
import Events from './u/Events.js'

import {listContainsHex} from './u/Hex.js'



export default function UnitInput(origin_world) {
  
  var hex_selected;
  var action_buttons = new ActionButtons('action-buttons');


  this.clickHex = clickHex;
  this.selectNothing = selectNothing;
  this.getHexSelected = getHexSelected
  this.getActorSelected = getActorSelected
  this.getActionSelected = getActionSelected

  Events.on('hex_clicked', (event) => {clickHex(event.detail.world, event.detail.hex_clicked)} );



  //-------1---------2---------3---------4---------5---------6--------7---------8--------
  
 
  //The hex clicked might be outside the world
  //for local actions, this will do nothing
  //for sky_actions that have a long range, this
  //When clicking, the Actor and Target should be able to be in different worlds.

  //Is it possible to bridge the gap between worlds with events?
  //Actor triggers an action, sends an event, the other worldInput receives the event, and initiates the action?

  //each world has 1 actor represented by the HEX SELECTED

  function clickHex(world_clicked, hex_clicked) {

    if (!world_clicked.containsHex(hex_clicked))
      return;

    if (anActorIsSelected() ) 
      clickWithSelection(world_clicked, hex_clicked);
    else
      clickWithNoSelection(world_clicked, hex_clicked);
  };



  function selectHex(hex) {

    let actor = origin_world.getActor(hex);

    if (hex && actor && origin_world.containsHex(hex)) {
      hex_selected = hex;
      action_buttons.showButtonsFor( origin_world, actor, hex );
    }
    else
      selectNothing();
  };


  function selectNothing() {
    hex_selected = null;
  };

  function aHexIsSelected() {
    if (hex_selected)
      return true;
  };

  function getHexSelected()  {
    if (hex_selected)
      return hex_selected;
    else
      return false;
  };

  function anActorIsSelected() {
    if (!hex_selected) 
      return false;

    var maybe_actor = origin_world.getActor(getHexSelected());
    if (maybe_actor) {
      return (maybe_actor.selectable);
    } else {
      return false;
    }
  };

  function getActorSelected() {
    if (anActorIsSelected()) {
      return origin_world.getActor(getHexSelected());
    } else {
      return false;
    }
  };

  function getActionSelected() {
    if (anActorIsSelected()) {
      let actor = getActorSelected();
      let action = action_buttons.getActionSelected(actor);
      return action;
    } else {
      return false;
    }
  };

  function clickWithNoSelection(world_clicked, target) {
    selectHex(target);
  };


  //clickWithSelection EVENT (world, actor, action, target)
  //for interplanetary actions, the WORLD and ACTOR and POSITION are together, but the TARGET is in another world
  // the first UnitInput will have coordinates that correspond to no world
  //the second UnitInput will have no HEX or ACTOR selected, and therefore trigger no action

  function clickWithSelection(world_clicked, target) {
    
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action && action.sky_action && action.infinite_range) 
      clickInsideRange(world_clicked, target);   //when clicking another world with an infinite_range action, this will be triggered (but the hex is wrong)
    else if (origin_world.id == world_clicked.id && action.canTarget(origin_world, actor, hex_selected, target)) 
      clickInsideRange(origin_world, target);
    else if (origin_world.id == world_clicked.id)
      clickOutsideRange(origin_world, target);

  };

  //clickInsideRange(world, actor, origin, target, targetworld = world )
  function clickInsideRange(world_clicked, target) {  

    let origin = hex_selected;
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action.requirement(origin_world, actor, origin)) {

      action.doAction(world_clicked, actor, origin, target);

      if (action.nextSelection == 'self')
        action_buttons.showButtonsFor(origin_world, actor, origin);

      if (action.nextSelection == 'target') 
        selectHex(target); 

      if (action.nextSelection == 'new_unit' && world.unitAtLocation(target) )
        selectHex(target); 

    }
  };


  function clickOutsideRange(world, target) {

    if (world.unitAtLocation(target)) {
      selectNothing();
      clickHex(world,target);
    }
  };
}