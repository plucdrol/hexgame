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

import Hex from './u/Hex.js'
import {HexMap} from './u/Hex.js'
import SimplexNoise from './u/Noise.js'
import PerlinTileGenerator from './TileGenerator.js'
import {RandomTileGenerator} from './TileGenerator.js'
import RiverGenerator from './RiverGenerator.js'

export default function MapGenerator(map_type) {
  
  var map = new HexMap();
  var simplex = new SimplexNoise();
  var radius = 0;

  if (map_type)
    var type = map_type;

  this.makeWorldMap = function(new_radius) {

    radius = new_radius;
    map = new HexMap();

    var hex = new Hex(0,0);
    //contains the position and content of each tile
    var value = {}; 
    var tile_gen = makeTileGenerator(type);


    // Iterates over the giant hexagon
    var qmin = -radius;
    var qmax = radius;
    for (var q = qmin; q <= qmax; q++) {
      var rmin = Math.max(-radius, -q - radius);
      var rmax = Math.min(+radius, -q + radius);

      for (var r = rmin; r <= rmax; r++) {
        
                
        //put in map
        hex = new Hex(q,r);
        setElevation(hex, tile_gen.generateTile(q,r));
        setWind(hex, tile_gen.generateWind(q,r));
      }
    }

    //fine tune the m ap
    addWaterRim(0.1);
    roundDown();
    addShallowWater();
    addIcePoles();

    //trim coasts
    trimPoints(1, [1,2,3,4,5,6,7], 2, 0 );

    //trim oceans
    trimPoints(0, [0], 2, 1 );

    //map = new RiverGenerator(map).getMap();

    //turn big rivers into coast tiles (fjords)
    for (hex of map.getHexes()) {
      if (map.get(hex).river && map.get(hex).river.water_level > 150)
        setElevation(hex, 1);
    }

    return map;
  }




  this.makeSystemMap = function(new_radius) {
    
    map = new HexMap();
    radius = new_radius;


    var hex = new Hex(0,0);
    //contains the position and content of each tile
    var value = {}; 

    // Iterates over the giant hexagon
    var qmin = -radius;
    var qmax = radius;
    for (var q = qmin; q <= qmax; q++) {
      var rmin = Math.max(-radius, -q - radius);
      var rmax = Math.min(+radius, -q + radius);

      for (var r = rmin; r <= rmax; r++) {
        
        //put in map
        hex = new Hex(q,r);
        setElevation(hex, 1);
      }
    }

    return map;
  }









  function getElevation(hex) {
    if (map.containsHex(hex)) {
      return map.getValue(hex).elevation;
    } else {
      return 0;
    }
  }

  function setWind(hex,new_value) {
    var current_tile = map.getValue(hex);
    if (current_tile instanceof Object) {
      current_tile.wind = new_value;  
    } else {
      //get value
      var new_tile = new Object();
      new_tile.wind = new_value;
      map.set(hex,new_tile)
    }
  }


  function setElevation(hex,new_value) {
    var current_tile = map.getValue(hex);
    if (current_tile instanceof Object) {
      current_tile.elevation = new_value;  
    } else {
      //get value
      var new_tile = new Object();
      new_tile.elevation = new_value;
      map.set(hex,new_tile)
    }
  }
    

  function setVariable(hex,variable,new_value) {
    var current_tile = map.getValue(hex);
    if (current_tile instanceof Object) {
      current_tile[variable] = new_value;  
    } else {
      //get value
      var new_tile = new Object();
      new_tile[variable] = new_value;
      map.set(hex,new_tile)
    }
  }



  function makeTileGenerator(type) {
    let tile_generator;

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



  











  function roundDown() {
    
    var value;

    for (let thishex of map.getHexes()) {

      value = Math.floor(getElevation(thishex));

      setElevation(thishex,value);
    }
  }

  //this function is used to eliminate thin strips of random tiles
  function trimPoints(land_type, required_neighbor_array, required_neighbor_count, new_land_type) {
    
    //initialize counter: tiles modified this run
    let tiles_modified = 6;

    while (tiles_modified > 5) {

      tiles_modified = 0;

      //run this code on each hex
      for (let thishex of map.getHexes()) {

        //if the tile is of land_type
        if (getElevation(thishex) == land_type) {
          
          //get its neighbors
          let neighbors = thishex.getNeighbors();
          let count = 0;
          
          //count the neighbors of type required_neighbor
          for (let neighbor of neighbors) {

            if (required_neighbor_array.includes(getElevation(neighbor))) {
              count++;
            }
          }

          //if the count is not at least required_neighbor_count
          if (count < required_neighbor_count) {
            //convert tile to new_land_type
            setElevation(thishex, new_land_type);
            tiles_modified++;
          }
        }
      }

    }
  }

  //Adds water in the ratio from the edge of the map
  //defined by rim_size/1
  function addWaterRim(rim_size) {
    
    //center hex
    var origin = new Hex(0,0);
    var value;

    //run this code on each hex
    for (let thishex of map.getHexes()) {
    
      //analyse map
      var distance_to_center = Hex.distance(origin, thishex);
      distance_to_center = Math.max(distance_to_center,0);
      var distance_to_edge = radius - distance_to_center;
      var rim_length = rim_size*radius;
      
      //define new value and insert
      value = getElevation(thishex);
      value *= 1-Math.pow((rim_length/distance_to_edge),2);

      //prevent negative values
      if (value < 0) {
        value = 0;
      }


      setElevation(thishex,value);



    }
  }

  function addIcePoles() {
    
    let origin = new Hex(0,0);

    for (let thishex of map.getHexes()) {  
      //ice rim around the edge of the map
      if (Hex.distance(origin, thishex) > radius-5 && Math.random() < 0.5) {
        setElevation(thishex, 22);
      }
      if (Hex.distance(origin, thishex) >= radius-2) {
        setElevation(thishex, 22);
      }

    }
  }

  function flatenRange(min,max) {

    //for each cell
    var qmin = -radius;
    var qmax = radius;
    for (var q = qmin; q <= qmax; q++) {
        var r1 = Math.max(-radius, -q - radius);
        var r2 = Math.min(+radius, -q + radius);

        for (var r = r1; r <= r2; r++) {
          var this_hex = new Hex(q,r);
          var this_value = getElevation(this_hex);

        //for cells between range_min and range_max
        for (var i = min; i < max; i++) {
          var diff = i-min;

          //if the cell is between min and max
          if (this_value == i) {
            setElevation(this_hex,this_value-diff);

          }

        }

        //for cells of value higher than range_max
        if (this_value > max) {
          setElevation(this_hex,this_value-(max-min));
        }
      }
    }
  }

  function addShallowWater() {
    var neighbors = [];

    //for each hex
    for (let thishex of map.getHexes()) {
      
      //if the hex is deep water
      if (getElevation(thishex) == 0) {

        //check its neighbors
        for (var dir =0; dir < 6; dir++) {
          var neighbor = thishex.getNeighbor(dir);
          if (map.containsHex(neighbor)) {
            //and if they are land
            if (getElevation(neighbor) > 1) {
              //turn the deep water into shallow water
              setElevation(thishex,1);

            }
          }
        }
      }
    }
  }

}