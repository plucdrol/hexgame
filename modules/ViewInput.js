////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              VIEW INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

//receives input events from Canv_Input and affects only the View

import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import Events from './u/Events.js'

var render_update = false;

export default function ViewInput(view) {
  this.view = view;

  this.world_drag = new Point(0,0);
  this.screen_drag = new Point(0,0);

  this.zoom_amount = 1;


  //Event handling
  var self = this;

  Events.on('canvas_zoom', function(e){
    self.zoomViewEvent(e.detail.amount);
  } );
  Events.on('canvas_drag', function(e){
    self.dragEvent(e.detail.mousepos,e.detail.mouseposprevious);
  } );
  Events.on('canvas_resize', function(e){
    self.resizeEvent(e.detail.width, e.detail.height);
  } );
  document.addEventListener('keydown', logKey);




  //this one goes into WorldInput(world)
  function logKey(event) {
    console.log(event.keyCode);
    if (event.keyCode === 189 || event.keyCode === 173) { // minus
        self.zoomViewEvent(1.2);
    }
    if (event.keyCode === 187 || event.keyCode === 61) { // plus
        self.zoomViewEvent(0.8);
    }

    return false;
  }


  //React to either mouse scrolling or finger pinching
  this.zoomViewEvent = function(zoom) {

    this.zoom_amount *= zoom; //1.2 or 0.8

    if (1-this.zoom_amount <= -0.2) { // 1 - 1.1 = -=0.1     1 - 1.3 = -0.3
      this.view.zoom(this.zoom_amount);
      //console.log(this.zoom_amount);
      this.zoom_amount = 1;
    }
    if (1-this.zoom_amount <= 0.2) { // 1 - 0.7 = 0.3,  1-0.9 = 0.1
      this.view.zoom(this.zoom_amount);
      //console.log(this.zoom_amount);
      this.zoom_amount = 1;
    }
  }
  



  //React to dragging across the screen with finger or mouse
  this.dragEvent = function(mouse, previous_mouse) {

    //get the movement the mouse has moved since last tick
    var x_move = this.view.screenToWorld1D(previous_mouse.x-mouse.x);
    var y_move = this.view.screenToWorld1D(previous_mouse.y-mouse.y);
    var drag_move = new Point(x_move, y_move);

    //shift the view by that movement
    this.view.shiftPosition(drag_move);

    //shift the image in the temporary canvas
    var temp_context = canvas.getContext('2d');
    temp_context.drawImage(canvas, -(previous_mouse.x-mouse.x), -(previous_mouse.y-mouse.y));
  }


  this.actuallyDrag = function() {

    this.view.shiftPosition(this.world_drag);

    this.world_drag = new Point(0,0);
    this.screen_drag = new Point(0,0);
  }


  //React to the window being resized
  this.resizeEvent = function(width, height) {
    this.view.resizeOutput(width, height);
  }

}