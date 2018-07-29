

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

		this.setPosition = function() {
			}
	}


	//This function creates a world and attaches all the necessary controllers
	//This doesn't seem like a very efficient way to do this
	this.createWorldLayer = function(radius, center_hex, color_scheme, sublayer) {

		var layer = new Layer();

	  var hexmap_generator = new MapGenerator('perlin'); 
	  layer.map = hexmap_generator.makeMap(radius, center_hex);

	  //calculate offset due to sublayer
	  if (sublayer != undefined) {

	  	layer.scale = sublayer.scale * scale_ratio;

	    layer.offset = get_layer_offset(
	    	                        layer.scale, 
	                              sublayer.scale,     
	                              sublayer.hex_center_offset, 
	                              sublayer.offset,
	                              sublayer.world_interface.world.layout
	                              ); 
	  }

	  //create a world
	  var world = new World(layer.offset);
	  world.setMap(layer.map);

	  //create a unit controller
	  var unit_controller = new UnitController(layer.map);
	  if (color_scheme != 'space') {
	    unit_controller.fillMap();
	  }

	  //create a view for the map
	  var view = create_view( layer.scale );

	  //create a controller and renderer for the world
	  var world_interface = new WorldInterface(world, view, unit_controller);
	  if (color_scheme != undefined) {
	    var world_renderer = new WorldRenderer(canv_draw, world_interface, color_scheme);  
	  } else {
	    var world_renderer = new WorldRenderer(canv_draw, world_interface);
	  }

	  layer.world_interface = world_interface;
	  layer.unit_controller = unit_controller;
	  layer.world_renderer = world_renderer;
	  layer.hex_center_offset = center_hex;

	  return layer;
	}

}


function get_layer_offset(layer_scale, sublayer_scale, sublayer_center_hex_offset, sublayer_offset, sublayer_layout) {
  var scale_difference = layer_scale / sublayer_scale;
  var test_hex = new Hex( -sublayer_center_hex_offset.getQ()*scale_difference, 
                          -sublayer_center_hex_offset.getR()*scale_difference );
  
  var layer_offset = sublayer_layout.hexToPoint( test_hex );
  layer_offset.x -= sublayer_offset.x;
  layer_offset.y -= sublayer_offset.y;

  return layer_offset;
}