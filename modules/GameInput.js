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

var render_update = false;

export default function GameInput(world, view) {
  this.world = world;
  this.view = view;


  //this is where the world's unit controller is created
  this.unit_input = new UnitInput(world); 
  this.hex_hovered = new Hex();
  this.hex_hovered_previous = new Hex();


  //Event listeners
  var self = this;

  Events.on('canvas_click', function(e){
    self.clickScreenEvent(e.detail.click_pos, 'mouse');
  }); 
  Events.on('canvas_touch', function(e){
    self.clickScreenEvent(e.detail.click_pos, 'touch');
  }); 
  Events.on('canvas_hover', function(e){
    self.hoverEvent(e.detail.mousepos);
  });

  document.addEventListener('keydown', logKey);






  //this one goes into WorldInput(world)
  function logKey(event) {
    console.log(event.keyCode);

    if (event.keyCode === 187 || event.keyCode === 27) { // escape
        self.unit_input.selectNothing();
        this.unit_input.button_menu.update_function(this.unit_input.world, this.unit_input);
        Events.emit('hex_hovered_changed', this.hex_hovered);
    }
    return false;
  }


  //this one should go into WorldInput(world)
  //React to the mouse hovering at screen_position
  this.hoverEvent = function(screen_position) {
  
    //get the hex being hovered by the mouse
    var world_position = this.view.screenToWorld(screen_position);
    this.hex_hovered = this.world.getHex(world_position);

    //if the mouse moved to a new hex, redraw the screen
    if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
      Events.emit('hex_hovered_changed', this.hex_hovered);

    }

    //remember the currently hovered hex
    this.hex_hovered_previous = this.hex_hovered;
  }


  //this one should go into WorldInput(world)
  //React to the screen being clicked at screen_position
  this.clickScreenEvent = function(screen_position, device_type) {
    
    if (this.unit_input != undefined) {

      var world_position = this.view.screenToWorld(screen_position);
      let hex_clicked = this.world.getHex(world_position);

      if (device_type == "mouse" || Hex.equals(hud_renderer.last_hover, hex_clicked)) {
        Events.emit('hex_clicked', hex_clicked);
      }

      Events.emit('hex_hovered_changed', this.hex_hovered);
      
    }
  }



}


