

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
			}
	}


}