

/* SINGLE RESPONSIBILITY: maintain relationship between layers of worlds */
function LayerManager() {

	var scale_ratio = 1/64;

	//single responsibility: hold the meta-data about a layer, and a link to the world
	function Layer() {
		this.scale = 1;
		this.offset = new Point(0,0);

		this.world_interface = {};
		this.world_renderer = {};
		this.view = {};

		this.setScale = function(scale) {
			var new_zoom = create_view(scale);
			this.world_interface.view = new_zoom;
		  layer.world_renderer.view = new_zoom;
		  layer.view = new_zoom;
		}

		this.setPosition = function(toplayer, sublayer_hex_location) {
				this.offset = get_layer_offset(layer.scale, 
	                                     sublayer.scale,     
	                                     sublayer.sublayer_hex, 
	                              			 sublayer.offset,
	                              			 sublayer.world_interface.world.layout
	                              				); 
			}
	}



  this.embedLayer = function(sublayer, layer, sublayer_hex_location) {
  	
		//adjust scale of new sublayer
		sublayer.setScale( layer.scale*scale_ratio );


		//calculate offset and scale due to sublayer
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

  this.surroundByLayer = function(sublayer, layer, sublayer_hex_location) {

  }


	//This function creates a world and attaches all the necessary controllers
	//This doesn't seem like a very efficient way to do this
	this.createWorldLayer = function(radius, color_scheme) {

		var layer = new Layer();

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
	    var world_renderer = new WorldRenderer(canv_draw, world_interface, color_scheme);  
	  } else {
	    var world_renderer = new WorldRenderer(canv_draw, world_interface);
	  }

	  //Create the layer object to be returned
	  var layer = {
	    world_interface: world_interface,
	    world_renderer: world_renderer,
	    scale: scale,
	    sublayer_hex: sublayer_hex,
	    offset: offset,
	    color_scheme: color_scheme
	  }

	  return layer;
	}


	//Give the offset from center of a layer based on the layer below
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