



////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              LAYER MANAGER
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////



/* SINGLE RESPONSIBILITY: maintain relationship between world model, input, and output */
function LayerManager() {

	var scale_ratio = 1/64;
	this.view = create_view();


	//Event handling
  var layer_manager = this;
	listenForEvent('hexgame_zoom', function(e){
    layer_manager.zoomViewEvent(e.detail.amount);
  } );
  listenForEvent('hexgame_drag', function(e){
    layer_manager.dragEvent(e.detail.mousepos,e.detail.mouseposprevious);
  } );
  listenForEvent('hexgame_resize', function(e){
    layer_manager.resizeEvent(e.detail.width, e.detail.height);
  } );

  this.zoomViewEvent = function(zoom) {
	  this.view.zoom(zoom);
	  drawScreen();
	}
	
	this.dragEvent = function(mouse,previous_mouse) {
	  //get the movement the mouse has moved since last tick
	  var x_move = this.view.screenToWorld1D(previous_mouse.x-mouse.x);
	  var y_move = this.view.screenToWorld1D(previous_mouse.y-mouse.y);
	  var drag_move = new Point(x_move, y_move);
	  
	  //shift the view by that movement
	  this.view.shiftPosition(drag_move);
	  
	  //redraw the screen after moving
	  drawScreen();
	}

	this.resizeEvent = function(width,height) {
	  this.view.resizeOutput(width,height);

	  //redraw the screen after resizing
	  drawScreen();
	}



	//single responsibility: hold the meta-data about a layer, and a link to the world
	function Layer() {
		this.scale = 1;
		this.world_input = {};
		this.world_renderer = {};
	}


	//This function creates a world and joins the view and controller to it
	this.createWorldLayer = function(radius) {

		var layer = new Layer();

	  //create a world object
	  layer.world = new World(layer.scale, radius);// <-- model

	  //create a world interface
	  layer.world_input = new WorldInput(layer.world, this.view);	//<-- controller

	  //create a world renderer
	  layer.world_renderer = new WorldRenderer(canv_draw, layer.world, this.view);  	//<---view  

	  return layer;
	}

}








////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


// -- Dependencies: --
// World
// View
// Hex
// Events

///////// EVENTS /////////
function WorldInput(world, view) {
  this.world = world;
  this.view = view;
  //this is where the unit controller is created
  this.unit_controller = new UnitController(world.world_map, world.units); 

  this.listenForEvents();
}

WorldInput.prototype.getUnitController = function() {
  return this.unit_controller;
}


WorldInput.prototype.listenForEvents = function() {

  this.hex_hovered = new Hex();
  this.hex_hovered_previous = new Hex();

  var wif = this;

    if (this.unit_controller != false) {
      listenForEvent('hexgame_click', function(e){
        wif.clickScreenEvent(e.detail.click_pos);
      }); 
    }
        
    listenForEvent('hexgame_hover', function(e){
      wif.hoverEvent(e.detail.mousepos);
    } );
  }

WorldInput.prototype.hoverEvent = function(screen_position) {
  
  //get the hex being hovered

  var world_position = this.view.screenToWorld(screen_position);
  this.hex_hovered = this.world.getHex(world_position);

  //if the mouse moved to a new hex, redraw the screen
  if ( !Hex.equals(this.hex_hovered, this.hex_hovered_previous) ) {
    drawScreen();
  }

  //remember the currently hovered hex
  this.hex_hovered_previous = this.hex_hovered;
}

WorldInput.prototype.clickScreenEvent = function(screen_position) {
  
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

