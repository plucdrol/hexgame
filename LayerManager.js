

/* SINGLE RESPONSIBILITY: maintain relationship between layers of worlds */
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
		this.offset = new Point(0,0);

		this.world_input = {};
		this.world_renderer = {};

	}


	//This function creates a world and attaches all the necessary controllers
	//This doesn't seem like a very efficient way to do this
	this.createWorldLayer = function(radius, center_hex, color_scheme, sublayer) {

		var layer = new Layer();

	  //calculate offset due to sublayer
	  if (sublayer != undefined) {
	  	layer.scale = sublayer.scale * scale_ratio;
	    layer.offset = get_layer_offset( layer, sublayer );
	  }

	  //define the center tile
	  layer.hex_center_offset = center_hex;

	  //create a world object
	  console.log('creating world');
	  layer.world = new World(layer.offset, new Point(35/layer.scale, 35/layer.scale), radius, center_hex );// <-- point at which the sublayer affects this new layer

	  //create a unit controller
	  layer.unit_controller = layer.world.getUnitController();
	  layer.unit_controller.fillMap();

	  //create a world interface
	  layer.world_input = new WorldInput(layer.world, this.view);

	  //create a world renderer
	  layer.world_renderer = new WorldRenderer(canv_draw, layer.world.world_map, layer.unit_controller, this.view, color_scheme);  	  

	  return layer;
	}

}

function get_layer_offset(layer, sublayer) {
  var scale_difference = layer.scale / sublayer.scale;
  var test_hex = new Hex( -sublayer.hex_center_offset.getQ()*scale_difference, 
                          -sublayer.hex_center_offset.getR()*scale_difference );
  
  var layer_offset = sublayer.world_input.world.getLayout().hexToPoint( test_hex );
  layer_offset.x -= sublayer.offset.x;
  layer_offset.y -= sublayer.offset.y;

  return layer_offset;
}