
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
	TileGenerator.call(this);
	var range = 10;

	this.generateTile = function(x,y) {
		var value = 1+1*Math.floor((range+2)*Math.random());
		if (value >= range) 
			{value = range;}
		return value;
	}
}
RandomTileGenerator.prototype = Object.create(TileGenerator.prototype);




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
PerlinTileGenerator.prototype = Object.create(TileGenerator.prototype);


/*
	Perlin Custom
	*/



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

PerlinCustomTileGenerator.prototype = Object.create(TileGenerator.prototype);



/*
	Perlin Continents
	*/

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
ContinentsTileGenerator.prototype = Object.create(TileGenerator.prototype);

