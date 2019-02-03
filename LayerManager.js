

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