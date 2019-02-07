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

// CanvasDraw
// View
// Renderer
// Hex
// Events

function GameInput(game, view) {
  this.game = game;
  this.world = game.world;
  this.view = view;

  //this is where the unit controller is created
  this.unit_controller = new UnitController(this.world.world_map, this.world.units); 
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

  //React to either mouse scrolling or finger pinching
  this.zoomViewEvent = function(zoom) {
	  this.view.zoom(zoom);
	  drawScreen();
	}
	
  //React to dragging across the screen with finger or mouse
	this.dragEvent = function(mouse, previous_mouse) {
	  //get the movement the mouse has moved since last tick
	  var x_move = this.view.screenToWorld1D(previous_mouse.x-mouse.x);
	  var y_move = this.view.screenToWorld1D(previous_mouse.y-mouse.y);
	  var drag_move = new Point(x_move, y_move);
	  
	  //shift the view by that movement
	  this.view.shiftPosition(drag_move);
	  
	  //redraw the screen after moving
	  drawScreen();
	}

  //React to the window being resized
	this.resizeEvent = function(width, height) {
	  this.view.resizeOutput(width, height);
	  drawScreen();
	}

  //React to the mouse hovering at screen_position
  this.hoverEvent = function(screen_position) {
  
    //get the hex being hovered by the mouse
    var world_position = this.view.screenToWorld(screen_position);
    this.hex_hovered = this.world.getHex(world_position);

    //if the mouse moved to a new hex, redraw the screen
    if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
      drawScreen();
    }

    //remember the currently hovered hex
    this.hex_hovered_previous = this.hex_hovered;
  }

  //React to the screen being clicked at screen_position
  this.clickScreenEvent = function(screen_position) {
    
    if (this.view.getZoom() < 0.06 || this.view.getZoom() > 64*0.06 ) {
      return;
    }
    if (this.unit_controller != undefined) {


      var world_position = this.view.screenToWorld(screen_position);
      let hex_clicked = this.world.getHex(world_position);

      //Only reference to unit controller in WorldInterface
      this.unit_controller.clickHex(hex_clicked);
      
      drawScreen();
    }
  }



}


