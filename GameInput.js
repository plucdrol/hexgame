////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              GAME INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// -- Dependencies: --
// World
// View
// Hex
// Events

var render_update = false;

function GameInput(world, view) {
  this.world = world;
  this.view = view;

  this.world_drag = new Point(0,0);
  this.screen_drag = new Point(0,0);

  this.zoom_amount = 1;

  //this is where the unit controller is created
  this.unit_input = new UnitInput(world); 
  this.hex_hovered = new Hex();
  this.hex_hovered_previous = new Hex();


	//Event handling
  var self = this;





	listenForEvent('canvas_zoom', function(e){
    self.zoomViewEvent(e.detail.amount);
  } );
  listenForEvent('canvas_drag', function(e){
    self.dragEvent(e.detail.mousepos,e.detail.mouseposprevious);
  } );
  listenForEvent('canvas_resize', function(e){
    self.resizeEvent(e.detail.width, e.detail.height);
  } );
  listenForEvent('canvas_click', function(e){
    self.clickScreenEvent(e.detail.click_pos);
  }); 
  listenForEvent('canvas_hover', function(e){
    self.hoverEvent(e.detail.mousepos);
  });

  document.addEventListener('keydown', logKey);

  function logKey(event) {
    console.log(event.keyCode);
    if (event.keyCode === 189 || event.keyCode === 173) { // minus
        self.zoomViewEvent(1.2);
        return false;
    }
    if (event.keyCode === 187 || event.keyCode === 61) { // plus
        self.zoomViewEvent(0.8);
        return false;
    }
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

    this.world_drag.x += x_move;
    this.world_drag.y += y_move;

    this.screen_drag.x += previous_mouse.x-mouse.x;
    this.screen_drag.y += previous_mouse.y-mouse.y;

    if ( Math.pow(this.screen_drag.x, 2) + Math.pow(this.screen_drag.y, 2) > 1000 ) 
      this.actuallyDrag();
	}

  this.actuallyDrag = function() {

    this.view.shiftPosition(this.world_drag);

    //shift the image inside the temporary canvas
    var temp_context = canvas.getContext('2d');
    temp_context.drawImage(canvas, -this.screen_drag.x, -this.screen_drag.y);

    this.world_drag = new Point(0,0);
    this.screen_drag = new Point(0,0);
  }


  //React to the window being resized
	this.resizeEvent = function(width, height) {
	  this.view.resizeOutput(width, height);
	  updateWorldRender();
	}


  //React to the mouse hovering at screen_position
  this.hoverEvent = function(screen_position) {
  
    //get the hex being hovered by the mouse
    var world_position = this.view.screenToWorld(screen_position);
    this.hex_hovered = this.world.getHex(world_position);

    //if the mouse moved to a new hex, redraw the screen
    if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
      hud_renderer.updateHover(this.hex_hovered);
    }

    //remember the currently hovered hex
    this.hex_hovered_previous = this.hex_hovered;
  }


  //React to the screen being clicked at screen_position
  this.clickScreenEvent = function(screen_position) {
    
    if (this.unit_input != undefined) {

      var world_position = this.view.screenToWorld(screen_position);
      let hex_clicked = this.world.getHex(world_position);

      //Only reference to unit controller in WorldInterface
      this.unit_input.clickHex(hex_clicked);
      hud_renderer.update_function();
      hud_renderer.updateHover(this.hex_hovered);
      
      updateWorldRender();
    }
  }
}


