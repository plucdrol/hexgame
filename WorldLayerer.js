

/* SINGLE RESPONSIBILITY: maintain relationship between layers of worlds */
function LayerManager() {

	var scale_ratio = 1/64;

	//single responsibility: hold the meta-data about a layer, and a link to the
	function Layer() {
		this.scale = 1;
	}

  this.embedLayer = function(layer, sublayer, sublayer_hex) {
  	
  	//define the layer's scale in relation to sub-layer
		layer.scale = sublayer.scale*scale_ratio;

		//adjust scale
		let new_zoom = create_view( layer.scale );
		layer.world_interface.view = new_zoom;
		layer.world_renderer.view = new_zoom;
		layer.view = new_zoom;


		//calculate offset and scale due to sublayer
		layer.offset = new Point(0,0);
	  if (sublayer != undefined) {
	    layer.offset = get_layer_offset(layer.scale, 
	                              sublayer.scale,     
	                              sublayer.sublayer_hex, 
	                              sublayer.offset,
	                              sublayer.world_interface.world.layout
	                              ); 
	  }

	  return layer;
  }


	//This function creates a world and attaches all the necessary controllers
	//This doesn't seem like a very efficient way to do this
	this.createWorldLayer = function(radius, color_scheme) {

		var scale = 1;
		var offset = new Point(0,0);
		var sublayer_hex = new Hex(0,0);

	  //creating a hex map
	  var hexmap_generator = new MapGenerator('perlin'); 
	  var map = hexmap_generator.makeMap(radius, sublayer_hex);

	  //create a world
	  var world = new World(offset);
	  world.setMap(map);

	  //create a unit controller
	  var unit_controller = new UnitController(map);
	  if (color_scheme != 'space') {
	    unit_controller.fillMap();
	  }

	  //create a view for the galaxy map
	  var view = create_view( scale );

	  //create a controller and renderer for the world
	  var world_interface = new WorldInterface(world, view, unit_controller);
	  if (color_scheme != undefined) {
	    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller, color_scheme);  
	  } else {
	    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller);
	  }

	  //Create the layer object to be returned
	  var layer = {
	    world_interface: world_interface,
	    world_renderer: world_renderer,
	    unit_controller: unit_controller,
	    scale: scale,
	    sublayer_hex: sublayer_hex,
	    offset: offset,
	    color_scheme: color_scheme
	  }

	  return layer;
	}


	//Give  the offset from center of a layer based on the layer below
	function get_layer_offset (current_layer_scale, previous_layer_scale, previous_layer_center_hex_offset, previous_layer_offset, layout) {
	  var scale_difference = current_layer_scale / previous_layer_scale;
	  var test_hex = new Hex( -previous_layer_center_hex_offset.getQ()*scale_difference, 
	                          -previous_layer_center_hex_offset.getR()*scale_difference );
	  
	  var layer_offset = layout.hexToPoint( test_hex );
	  layer_offset.x -= previous_layer_offset.x;
	  layer_offset.y -= previous_layer_offset.y;

	  return layer_offset;
	}

}