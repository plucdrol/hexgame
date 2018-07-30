

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

	  //calculate offset due to sublayer
	  if (sublayer != undefined) {
	  	layer.scale = sublayer.scale * scale_ratio;
	    layer.offset = get_layer_offset( layer, sublayer );
	  }

	  //define the center tile
	  layer.hex_center_offset = center_hex;

	  //create a world object
	  var world = new World(layer.offset);// <-- point at which the sublayer affects this new layer
	  world.createMap(radius, center_hex);

	  //create a unit controller
	  layer.unit_controller = new UnitController(world.map);
	  layer.unit_controller.fillMap();

	  //create a view for the map
	  layer.view = create_view( layer.scale ); // <- point at which the sublayer affects this new layer

	  //create a world interface
	  layer.world_interface = new WorldInterface(world, layer.view, layer.unit_controller);

	  //create a world renderer
	  layer.world_renderer = new WorldRenderer(canv_draw, layer.world_interface, color_scheme);  	  

	  return layer;
	}

}

function get_layer_offset(layer, sublayer) {
  var scale_difference = layer.scale / sublayer.scale;
  var test_hex = new Hex( -sublayer.hex_center_offset.getQ()*scale_difference, 
                          -sublayer.hex_center_offset.getR()*scale_difference );
  
  var layer_offset = sublayer.world_interface.world.layout.hexToPoint( test_hex );
  layer_offset.x -= sublayer.offset.x;
  layer_offset.y -= sublayer.offset.y;

  return layer_offset;
}