//-------1---------2---------3---------4---------5---------6---------7---------8
/*/////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
                
      //          PERLIN CONFIGURATION

      A configuration object for the Perlin Tile Generator and Map Generator

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////*/


PerlinConfiguration = function(config_name) {
  
  this.base;
  this.scales;
  this.weights;

  

  this.getLength = function() {
    return Math.min( this.scales.length, this.weights.length );
  }

  this.setConfigAlgorithmically = function(base,
                                           scale_initial, 
                                           scale_ratio,
                                           weight_initial, 
                                           weight_ratio)     {
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
      this.scales = [0.008,  0.014,0.025,0.083,0.151,0.272,0.489,0.881];
      this.weights = [16,    11.2,  7.84,  5.48,  3.84,  2.69,  1.88, 1.32];
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








/*/////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
                
      //            TILE GENERATOR

      Creates a single randomized tile, using different algorithms
      Those tiles can be assembled by different map generators


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////*/


//TileGenerator is not an interface, no abstract classes in Javascript
function TileGenerator() {
}

TileGenerator.prototype.generateTile = function(x,y) {
}

function RandomTileGenerator() {
  TileGenerator.call(this);
  var range = 10;
  console.log('new random tile generator');

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

  var tile_x;
  var tile_y;
  var tile_weight;

  
  this.generateTile = function(x,y) {
    //add up all the perlin values
    var total = config.base;
    for (var i = 0; i < config.getLength(); i++ ) {
      tile_x = config.scales[i]*x;
      tile_y = config.scales[i]*y;
      tile_weight = config.weights[i];
      total += Math.floor(simplex.noise(tile_x, tile_y)*tile_weight);
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
  this.generateWind = function(x,y) {
    var wind = Hex.spiralDirection(x,y);
    return wind;
  }
}
PerlinTileGenerator.prototype = Object.create(TileGenerator.prototype);
