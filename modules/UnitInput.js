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
import ButtonMenu from './ButtonMenu.js'
import Events from './u/Events.js'

import {listContainsHex} from './u/Hex.js'



export default function UnitInput(world) {
  
  var hex_selected;
  var button_menu = new ButtonMenu('action-buttons', world);
  let unit_input = this;

  this.selectNothing = selectNothing;
  this.getHexSelected = getHexSelected
  this.getActorSelected = getActorSelected
  this.getActionSelected = getActionSelected

  Events.on('hex_clicked', (event) => clickHex(event.detail) );



  //-------1---------2---------3---------4---------5---------6--------7---------8--------
  
 

  function clickHex(hex) {

    if (anActorIsSelected() ) 
      clickWithSelection(hex);
    else
      clickWithNoSelection(hex);

    button_menu.update(unit_input);
  };



  function selectHex(hex) {

    button_menu.unselectActions();

    if (hex && world.getActor(hex))
      hex_selected = hex;
    else
      selectNothing();
  };


  function selectNothing() {
    hex_selected = null;
    button_menu.update(unit_input);
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


  function clickWithSelection(target) {
    
    let actor = getActorSelected();
    let action = button_menu.getActionSelected(actor);

    if (action && action.infinite_range) 
      clickInsideRange(target);
    else if (action.canTarget(target)) 
      clickInsideRange(target);
    else
      clickOutsideRange(target);

  };

  function clickInsideRange(target) {

    let origin = hex_selected;
    let actor = getActorSelected();
    let action = button_menu.getActionSelected(actor);
      console.log('click inside range')
    if (action.requirement(world, actor, origin)) {

      action.doAction(world, actor, origin, target);

      if (action.nextSelection == 'target') 
        selectHex(target); 

      if (action.nextSelection == 'new_unit' && world.unitAtLocation(target) ) 
        selectHex(target); 

    }
  };


  function clickOutsideRange(target) {

    if (world.unitAtLocation(target)) {
      selectNothing();
      clickHex(target);
    }
  };
}