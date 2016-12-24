
/*/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//					PERLIN CONFIGURATION

			A configuration object for the Perlin Tile Generator and Map Generator

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////*/


PerlinConfiguration = function(config_name) {
	
	this.base;
	this.scales;
	this.weights;

	

	this.getLength = function() {
		return Math.min( this.scales.length, this.weights.length );
	}

	this.setConfigAlgorithmically = function(base,scale_initial,scale_ratio,weight_initial,weight_ratio) {
		
		//reset values
		this.base = base;
		this.scales = [];
		this.weights = [];
		var i = 0;

		//fill the scale and weight values
		while (Math.pow(scale_ratio,i) < 1) {
			this.scales[i] = scale_initial*Math.pow(scale_ratio,i);
			this.weights[i] = weight_initial*Math.pow(weight_ratio,i);
			i++;
		}
	}

	this.setConfig = function(config_name) {
		switch (config_name) {
		case 'continents':
			this.scales = [0.008,	0.014,0.025,0.083,0.151,0.272,0.489,0.881];
			this.weights = [16,		11.2,	7.84,	5.48,	3.84,	2.69,	1.88, 1.32];
			this.base = 4;


			break;
		default:
			this.scales = [0.02,0.1,0.2,0.5,1.0,2.0];
			this.weights = [16,8,4,2,1,0.5];
			this.base = 4;
		}
	}

	this.setConfig(config_name);
}








/*/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						TILE GENERATOR

			Creates a single randomized tile, using different algorithms
			Those tiles can be assembled by different map generators


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////*/


//TileGenerator is not an interface, because abstract classes dont exist in Javascript
function TileGenerator() {
}

TileGenerator.prototype.generateTile = function(x,y) {
}





function RandomTileGenerator() {
	var range = 10;

	this.generateTile = function(x,y) {
		var value = 1+1*Math.floor((range+2)*Math.random());
		if (value >= range) 
			{value = range;}
		return value;
	}
}





function PerlinTileGenerator() {
  TileGenerator.call(this); 
  var config = new PerlinConfiguration('continents');
  var simplex = new SimplexNoise();  
	
	this.generateTile = function(x,y) {
		//add up all the perlin values
		var total = config.base;
		for (var i = 0; i < config.getLength(); i++ ) {
			total += Math.floor(this.simplex.noise(config.scales[i]*x, config.scales[i]*y)*config.weights[i]);
		}

		//shallow water for anything between these numbers
		if (total < 1 && total > -7) 
			{total = 1;}

		//cutoff underwater to ocean
		if (total < 0) 
			{total = 0;}

		//more flatlands, and more mountain heights
		total = Math.pow((total+1)/6,2);

		//shallow water availability (between 0 and 1)
		total += 0.75;


	  return total;
	}
}



function PerlinCustomTileGenerator() {
    TileGenerator.call(this); 
    var config = new PerlinConfiguration('continents');
    var simplex = new SimplexNoise();    	


    this.generateNoise = function() {
			simplex = new SimplexNoise();    	
    }


    this.generateTile = function(x,y) {
    	//add up all the perlin values
			var total = config.base;
			for (var i = 0; i < config.getLength(); i++ ) {
				total += Math.floor(simplex.noise(config.scales[i]*x, config.scales[i]*y)*config.weights[i]);
			}

			//shallow water for anything between these numbers
			if (total < 1 && total > -7) 
				{total = 1;}

			//cutoff underwater to ocean
			if (total < 0) 
				{total = 0;}

			//more flatlands, and more mountain heights
			total = Math.pow((total+1)/6,2);

			//shallow water availability (between 0 and 1)
			total += 0.75;


		  return total;
    }
  }

PerlinTileGenerator.prototype = Object.create(TileGenerator.prototype);


function ContinentsTileGenerator() {

  TileGenerator.call(this); 
  var config = new PerlinConfiguration('continents');
  var simplex = new SimplexNoise();    	


  this.generateTile = function(x,y) {
		//initial settings
		var size = 100;

	  //these settings make large continents
		var scale = 0.8/size; //increase this value for smaller continents
		var multi = 16;
		var base = 4;

		//Add up the perlin values
		var total = base;
		while (scale < 1) {
			total += Math.floor(simplex.noise(scale*x+multi,scale*y+multi) *multi);
			multi = multi/1.4;
			scale = scale*1.8;	
		}

		//shallow water for anything between these numbers
		if (total < 1 && total > -2) 
			{total = 2;}

		//cutoff underwater to ocean
		if (total < 0) 
			{total = 0;}

	  return total;
	}

}




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

	this.getMap = function(){
		return this.map;
	}

}

HexMapGenerator.prototype.generateNoise = function() {
	this.simplex = new SimplexNoise();
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
	this.generateNoise();
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
	this.addWaterRim(radius, 0.1);
	this.roundDown();
	this.addShallowWater();
	this.flatenRange(radius,2,3);
	this.flatenRange(radius,3,6);

}

HexMapGenerator.prototype.roundDown = function() {
	
	var value;

	for (let thishex of this.map.getArray()) {

		value = Math.floor(this.map.getValue(thishex));
		this.map.set(thishex, value);
	}
}

//Adds water in the ratio from the edge of the map defined by rim_size/1
HexMapGenerator.prototype.addWaterRim = function(size, rim_size) {
	
	//center hex
	var origin = new Hex(0,0);
	var value;

	//run this code on each hex
	for (let thishex of this.map.getArray()) {
	
		//analyse map
		var distance_to_center = Math.max(Hex.distance(origin,thishex),0);
		var distance_to_edge = size - distance_to_center;
		var rim_length = rim_size*size;
		
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

HexMapGenerator.prototype.flatenRange = function(size, range_min,range_max) {
	
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















/*/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						SHARED FUNCTIONS

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////*/

 function lerp(a, b, x) {
     return (1.0 - x)*a + x*b;
 }

function gradient(x,y) {
	var coordinates = [0,0];
	var angle = 15;//(Math.random()*20*x+Math.random()*20*y)%360;
	coordinates[0] = Math.cos(angle);
	coordinates[1] = Math.sin(angle);
	return [0.3,0.5];
}







