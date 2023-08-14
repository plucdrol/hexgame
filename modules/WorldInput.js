////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import UnitInput from './UnitInput.js';
import Events from './u/Events.js'



export default function WorldInput(world, view) {



  //this is where the world's unit controller is created
  var unit_input = new UnitInput(world); 
  var hex_hovered = new Hex();
  var hex_hovered_previous = new Hex();

  this.getUnitInput = () => unit_input
  this.getHexHovered = () => hex_hovered

  //Event listeners
  Events.on('canvas_click', function(e){
    clickScreenEvent(e.detail.click_pos, 'mouse');
  }); 
  Events.on('canvas_touch', function(e){
    clickScreenEvent(e.detail.click_pos, 'touch');
  }); 
  Events.on('canvas_hover', function(e){
    hoverEvent(e.detail.mousepos);
  });

  document.addEventListener('keydown', logKey);






  //React to keys affecting units in this world
  function logKey(event) {
    console.log(event.keyCode);

    if (event.keyCode === 187 || event.keyCode === 27) { // escape
        unit_input.selectNothing();
        Events.emit('hex_hovered_changed', hex_hovered);
    }
    return false;
  }



  //React to the mouse hovering at screen_position
  function hoverEvent(screen_position) {
  
    //get the hex being hovered by the mouse
    var world_position = view.screenToWorld(screen_position);
    hex_hovered = world.getHex(world_position);

    //if the mouse moved to a new hex, redraw the screen
    if ( !hex_hovered.equals(hex_hovered_previous) ) {
      Events.emit('hex_hovered_changed', hex_hovered);

    }

    //remember the currently hovered hex
    hex_hovered_previous = hex_hovered;
  }



  //React to the screen being clicked at screen_position
  function clickScreenEvent(screen_position, device_type) {
    
    if (unit_input != undefined) {

      var world_position = view.screenToWorld(screen_position);
      let hex_clicked = world.getHex(world_position);

      if (device_type == "mouse" || hex_clicked.equals(hud_renderer.last_hover)) {
        Events.emit('hex_clicked', hex_clicked);
      }

      Events.emit('hex_hovered_changed', hex_hovered);
      
    }
  }



}


