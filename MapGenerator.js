
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


}

HexMapGenerator.prototype.generateMap = function(method,size) {
	
	var map = new HexMap();

	var simplex = new SimplexNoise();
	var value;
	

	for (var q = -size; q <= size; q++) {
	    var r1 = Math.max(-size, -q - size);
	    var r2 = Math.min(size, -q + size);

	    for (var r = r1; r <= r2; r++) {
	        var this_hex = new Hex(q,r);

	        switch (method) {
	        	case 'random':
	        		value = this.generateTileRandom(10);
	        		break;
	        	case 'perlin':
	        		value = this.generateTilePerlin(q,r,simplex);
	        		break;
	        	case 'perlin_custom':
	        		//create a world using the new world code
							var scales = [0.02,0.1,0.2,0.5,1.0,2.0];
							var multis = [16,8,4,2,1,0];
							var base = 4;
	        		value = this.generateTilePerlinCustom(q,r,simplex,base,scales,scales,multis);
	        		break;
	        	case 'perlin_continents':
	        		value = this.generateTilePerlinContinents(q,r,simplex,size);
	        		break;
	        }
	        		
			//put in map
	        map.set(this_hex,value);	
	    }
	}

	this.addWaterRim(map,size, 0.1);
	this.roundDown(map);
	this.addShallowWater(map);
	this.flatenRange(map,size,2,3);
	this.flatenRange(map,size,3,6);
	return map;

}



HexMapGenerator.prototype.generateTileRandom = function(range) {
	var value = 1+1*Math.floor((range+2)*Math.random());
	if (value >= range) 
		{value = range;}
	return value;
}



HexMapGenerator.prototype.generateTilePerlin = function(x,y,simplex) {

	//create noise profile
	var value_list = [];
	value_list.push(6);
	value_list.push(Math.floor(simplex.noise(0.02*x,0.02*y)*10));
	value_list.push(Math.floor(simplex.noise(0.1*x,0.1*y)*7));
	value_list.push(Math.floor(simplex.noise(0.2*x,0.2*y)*4));
	value_list.push(Math.floor(simplex.noise(0.5*x,0.5*y)*2));
	value_list.push(Math.floor(simplex.noise(1.0*x,1.0*y)*1));

	//add the noise values together
	var value = 0;
	for (var i=0; i<value_list.length; i++) {
		value += value_list[i];
	}
	
	//add shallow water
	if (value < 1 && value > -4) 
		{value = 1;}

	//prevent negative values
	if (value < 0) 
		{value = 0;}

  return value;

}

HexMapGenerator.prototype.generateTilePerlinCustom = function(x,y,simplex,base,scales_x,scales_y,multiplicands) {

	var length = Math.min( scales_x.length, scales_y.length, multiplicands.length );
	var total = base;
	var great_emptyness = false;

	for (var i = 0; i < length; i++ ) {
		total += Math.floor(simplex.noise(scales_x[i]*x, scales_y[i]*y)*multiplicands[i]);
		if (i==0 && total < 5) {
			total -= 5;
		}
		if (i==1 && total > 5) {
			total += 5;
		}

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

HexMapGenerator.prototype.generateTilePerlinContinents = function(x,y,simplex,size) {


	//initial settings

	//these settings make small continents
	//var scale_initial = 1.5/size;	//for 100
	//var multi_initial = 16;

  //these settings make large continents
	var scale_initial = 0.8/size;
	var multi_initial = 16;
	var base = 4;

	//changing settings
	var total = base;
	var scale = scale_initial;
	var multi = multi_initial;

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

	//more flatlands, and more mountain heights
	//total = Math.pow((total+1)/6,2);

	//shallow water availability (between 0 and 1)
	//total += 0.75;

    return total;

}

//Adds water in the ratio from the edge of the map defined by rim_size/1
HexMapGenerator.prototype.roundDown = function(map) {
	
	var value;

	for (let thishex of map.getArray()) {
		
		//for each hex
		if (map.containsHex(thishex)) {

			value = Math.floor(map.getValue(thishex));
			map.set(thishex, value);

		}

	}


}

//Adds water in the ratio from the edge of the map defined by rim_size/1
HexMapGenerator.prototype.addWaterRim = function(map, size, rim_size) {
	
	//center hex
	var origin = new Hex(0,0);
	var value;


	for (let thishex of map.getArray()) {
		
		//for each hex
		if (map.containsHex(thishex)) {

			//analyse map
			var distance_to_center = Math.max(Hex.distance(origin,thishex),0);
			var distance_to_edge = size - distance_to_center;
			var rim_length = rim_size*size;
			
			//define new value and insert
			
			//value = Math.max(  0, 1.5 * value * (distance_to_edge/2 - rim_size ) / (distance_to_edge/2+1)  )  ;
			value = map.getValue(thishex);

			value *= 1-Math.pow((rim_length/distance_to_edge),2);

			//prevent negative values
			if (value < 0) {
				value = 0;
			}

			map.set(thishex, value);

		}

	}

	//value = Math.max(  0, Math.floor(value * 4 * ((distance_to_edge*(15+distance_to_center)*distance_to_edge)/(size*size*size) ) )  );

}

HexMapGenerator.prototype.flatenRange = function(map, size, range_min,range_max) {
	
	//for each cell
	for (var q = -size; q <= size; q++) {
	    var r1 = Math.max(-size, -q - size);
	    var r2 = Math.min(size, -q + size);

	    for (var r = r1; r <= r2; r++) {
	    	var this_hex = new Hex(q,r);
	    	var this_value = map.getValue(this_hex);

	    	//for cells between range_min and range_max
			for (var i = range_min; i < range_max; i++) {
				var diff = i-range_min;

				//if the cell is equal to a value between range_min and range_max
				if (this_value == i) {
					map.set(this_hex,this_value-diff);
				}

			}

			//for cells of value higher than range_max
			if (this_value > range_max) {
				map.set(this_hex,this_value-(range_max-range_min));
			}
		}
	}
}

HexMapGenerator.prototype.addShallowWater = function(map) {
	var neighbors = [];


	for (let thishex of map.getArray()) {
		
		//for each hex
		if (map.containsHex(thishex)) {
			///console.log('contains one hex');
			//if the hex is deep water
			if (map.getValue(thishex) == 0) {

				//check its neighbors
				for (var dir =0; dir < 6; dir++) {
					var neighbor = Hex.neighbor(thishex,dir);
					if (map.containsHex(neighbor)) {
						//and if they are land
						if (map.getValue(neighbor) > 1) {
							//turn the deep water into shallow water
							map.set(thishex,1);

						}
					}
				}
			}
		}
	}
}

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


function isEven(n) {
	return n%2==0;
}




