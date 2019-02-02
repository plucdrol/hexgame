//-------1---------2---------3---------4---------5---------6---------7---------8
/*
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                
                      MAP GENERATOR

    Creates a randomized world map using the HexMap struct 
    -method: What generation algorithm to use
    -size: the radius of the map in hexes


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////*/


MapGenerator = function(map_type) {
  this.map = new HexMap();
  this.simplex = new SimplexNoise();
  this.radius = 0;
  this.map_type = map_type;

  this.getMap = function(){
    return this.map;
  }
  this.getElevation = function(hex) {
    console.log(hex);
    if (this.map.containsHex(hex)) {
      return this.map.getValue(hex).components.elevation;
    } else {
      return 0;
    }
  }
  this.setWind = function(hex,new_value) {

    var current_tile = this.map.getValue(hex);
    if (current_tile instanceof Unit) {
      current_tile.components.wind = new_value;  
    } else {
      //get value
      var new_tile = new Unit('terrain');
      new_tile.components.wind = new_value;
      this.map.set(hex,new_tile)
    }
  }
  this.setElevation = function(hex,new_value) {
    
    var current_tile = this.map.getValue(hex);
    if (current_tile instanceof Unit) {
      current_tile.components.elevation = new_value;  
    } else {
      //get value
      var new_tile = new Unit('terrain');
      new_tile.components.elevation = new_value;
      this.map.set(hex,new_tile)

    }

    
  }
    this.setVariable = function(hex,variable,new_value) {
    
    var current_tile = this.map.getValue(hex);
    if (current_tile instanceof Unit) {
      current_tile.components[variable] = new_value;  
    } else {
      //get value
      var new_tile = new Unit('terrain');
      new_tile.components[variable] = new_value;
      this.map.set(hex,new_tile)

    }

    
  }

}

MapGenerator.prototype.makeTileGenerator = function(type) {
  switch (type){
    case 'perlin':
      tile_generator = new PerlinTileGenerator();  
      break;
    case 'random':
      tile_generator = new RandomTileGenerator();
      break;
    default:
      tile_generator = new PerlinTileGenerator();
  }

  return tile_generator;
}



MapGenerator.prototype.makeMap = function(radius, center) {
  
  this.map = new HexMap();
  this.radius = radius;
  this.center = center;

  if (center == undefined) {
    var center = new Hex(0,0);
  }

  var type = this.map_type;
  var hex = new Hex(0,0);
  //contains the position and content of each tile
  var value = {}; 
  var tile_gen = this.makeTileGenerator(type);


  // Iterates over the giant hexagon
  var qmin = -center.getQ()-radius;
  var qmax = -center.getQ()+radius;
  for (var q = qmin; q <= qmax; q++) {
    var rmin = Math.max(-center.getR()-radius, -center.getR()-center.getQ()-q - radius);
    var rmax = Math.min(-center.getR()+radius, -center.getR()-center.getQ()-q + radius);

    for (var r = rmin; r <= rmax; r++) {
      
              
      //put in map
      hex = new Hex(q,r);
      this.setElevation(hex,tile_gen.generateTile(q,r));
      this.setWind(hex,tile_gen.generateWind(q,r));
    }
  }

  //fine tune the map
  this.addWaterRim(0.1);
  this.roundDown();
  this.addShallowWater();

  //trip coasts
  this.trimPoints(1, [1,2,3,4,5,6,7], 2, 0 );

  //trip oceans
  this.trimPoints(0, [0], 2, 1 );

  //this.flatenRange(2,3);
  //this.flatenRange(3,6);

  return this.map;
}

MapGenerator.prototype.roundDown = function() {
  
  var value;

  for (let thishex of this.map.getHexArray()) {

    value = Math.floor(this.getElevation(thishex));

    this.setElevation(thishex,value);
  }
}

MapGenerator.prototype.trimPoints = function(land_type, required_neighbor_array, required_neighbor_count, new_land_type) {
  
  //initialize counter: tiles modified this run
  let tiles_modified = 6;

  while (tiles_modified > 5) {

    tiles_modified = 0;

    //run this code on each hex
    for (let thishex of this.map.getHexArray()) {

      //if the tile is of land_type
      if (this.getElevation(thishex) == land_type) {
        
        //get its neighbors
        let neighbors = thishex.getNeighbors();
        let count = 0;
        
        //count the neighbors of type required_neighbor
        for (let neighbor of neighbors) {

          if (required_neighbor_array.includes(this.getElevation(neighbor))) {
            count++;
          }
        }

        //if the count is not at least required_neighbor_count
        if (count < required_neighbor_count) {
          //convert tile to new_land_type
          this.setElevation(thishex, new_land_type);
          tiles_modified++;
        }
      }
    }

  }
}

//Adds water in the ratio from the edge of the map
//defined by rim_size/1
MapGenerator.prototype.addWaterRim = function(rim_size) {
  
  //center hex
  var origin = new Hex(0,0);
  var value;
  var size = this.radius;

  //run this code on each hex
  for (let thishex of this.map.getHexArray()) {
  
    //analyse map
    var distance_to_center = Hex.distance(origin, thishex);
    distance_to_center = Math.max(distance_to_center,0);
    var distance_to_edge = size - distance_to_center;
    var rim_length = rim_size*size;
    
    //define new value and insert
    value = this.getElevation(thishex);
    value *= 1-Math.pow((rim_length/distance_to_edge),2);

    //prevent negative values
    if (value < 0) {
      value = 0;
    }

    this.setElevation(thishex,value);

  }
}

MapGenerator.prototype.flatenRange = function(min,max) {
  
  var size = this.radius;
  var center = this.center;

  //for each cell
  var qmin = -center.getQ()-radius;
  var qmax = -center.getQ()+radius;
  for (var q = qmin; q <= qmax; q++) {
      var r1 = Math.max(-center.getR()-size, -center.getR()-q - size);
      var r2 = Math.min(-center.getR()+size, -center.getR()-q + size);

      for (var r = r1; r <= r2; r++) {
        var this_hex = new Hex(q,r);
        var this_value = this.getElevation(this_hex);

        //for cells between range_min and range_max
      for (var i = min; i < max; i++) {
        var diff = i-min;

        //if the cell is between min and max
        if (this_value == i) {
          this.setElevation(this_hex,this_value-diff);

        }

      }

      //for cells of value higher than range_max
      if (this_value > max) {
        this.setElevation(this_hex,this_value-(max-min));
      }
    }
  }
}

MapGenerator.prototype.addShallowWater = function() {
  var neighbors = [];


  //for each hex
  for (let thishex of this.map.getHexArray()) {
    
      //if the hex is deep water
      if (this.getElevation(thishex) == 0) {

        //check its neighbors
        for (var dir =0; dir < 6; dir++) {
          var neighbor = thishex.getNeighbor(dir);
          if (this.map.containsHex(neighbor)) {
            //and if they are land
            if (this.getElevation(neighbor) > 1) {
              //turn the deep water into shallow water
              this.setElevation(thishex,1);

            }
          }
        }
      }
  }
}
