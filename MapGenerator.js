

/*/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						MAP GENERATOR

			Creates a randomized world map using the HexMap data type
			-method: What generation algorithm to use
			-size: the radius of the map in hexes


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////*/


HexMapGenerator = function() {
	this.map = new HexMap();
	this.simplex = new SimplexNoise();
	this.radius = 0;

	this.getMap = function(){
		return this.map;
	}

}

HexMapGenerator.prototype.makeTileGenerator = function(method) {

	switch (method){
		case 'perlin':
			tile_generator = new PerlinTileGenerator();	
			break;
		case 'perlin-continents':
			tile_generator = new ContinentsTileGenerator();
			break;
		case 'random':
			tile_generator = new RandomTileGenerator();
			break;
		default:
			tile_generator = new PerlinTileGenerator();
	}

	return tile_generator;
}

HexMapGenerator.prototype.generateMap = function(method,radius) {
	
	this.map = new HexMap();
	this.radius = radius;

	var hex, value; //contains the position and content of each tile
	var tile_generator = this.makeTileGenerator(method);

	//Traverses the world map while staying inside the giant hexagon
	for (var q = -radius; q <= radius; q++) {
	  var rmin = Math.max(-radius, -q - radius);
	  var rmax = Math.min(radius, -q + radius);

	  for (var r = rmin; r <= rmax; r++) {
	    
	    //get value
	    value = tile_generator.generateTile(q,r);
	        		
			//put in map
			hex = new Hex(q,r);
	    this.map.set(hex,value);	
	  }
	}

	//fine tune the map
	this.addWaterRim(0.1);
	this.roundDown();
	this.addShallowWater();
	this.flatenRange(2,3);
	this.flatenRange(3,6);

}

HexMapGenerator.prototype.roundDown = function() {
	
	var value;

	for (let thishex of this.map.getArray()) {

		value = Math.floor(this.map.getValue(thishex));
		this.map.set(thishex, value);
	}
}

//Adds water in the ratio from the edge of the map defined by rim_size/1
HexMapGenerator.prototype.addWaterRim = function(rim_size) {
	
	//center hex
	var origin = new Hex(0,0);
	var value;

	//run this code on each hex
	for (let thishex of this.map.getArray()) {
	
		//analyse map
		var distance_to_center = Math.max(Hex.distance(origin,thishex),0);
		var distance_to_edge = this.radius - distance_to_center;
		var rim_length = rim_size*this.radius;
		
		//define new value and insert
		value = this.map.getValue(thishex);
		value *= 1-Math.pow((rim_length/distance_to_edge),2);

		//prevent negative values
		if (value < 0) {
			value = 0;
		}

		this.map.set(thishex, value);

	}
}

HexMapGenerator.prototype.flatenRange = function(range_min,range_max) {
	
	var size = this.radius;

	//for each cell
	for (var q = -size; q <= size; q++) {
	    var r1 = Math.max(-size, -q - size);
	    var r2 = Math.min(size, -q + size);

	    for (var r = r1; r <= r2; r++) {
	    	var this_hex = new Hex(q,r);
	    	var this_value = this.map.getValue(this_hex);

	    	//for cells between range_min and range_max
			for (var i = range_min; i < range_max; i++) {
				var diff = i-range_min;

				//if the cell is equal to a value between range_min and range_max
				if (this_value == i) {
					this.map.set(this_hex,this_value-diff);
				}

			}

			//for cells of value higher than range_max
			if (this_value > range_max) {
				this.map.set(this_hex,this_value-(range_max-range_min));
			}
		}
	}
}

HexMapGenerator.prototype.addShallowWater = function() {
	var neighbors = [];


	//for each hex
	for (let thishex of this.map.getArray()) {
		
			//if the hex is deep water
			if (this.map.getValue(thishex) == 0) {

				//check its neighbors
				for (var dir =0; dir < 6; dir++) {
					var neighbor = Hex.neighbor(thishex,dir);
					if (this.map.containsHex(neighbor)) {
						//and if they are land
						if (this.map.getValue(neighbor) > 1) {
							//turn the deep water into shallow water
							this.map.set(thishex,1);

						}
					}
				}
			}
	}
}




















