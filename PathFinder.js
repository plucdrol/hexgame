//-------1----------2---------3---------4---------5---------6---------7--------8
// RANGE FINDING

//pathfinding arguments:
  //map of (hex,movement_cost) pairs

//pathfinding algorithms:
  //findRange(hex_origin,range) returns an array of hexes reachable 
        //from hex_origin in n steps
  //find_path(hex_origin,hex_destination) returns shortest path
  //path_distance(origin,destination) returns distance between two hexes


function PathFinderCell(path_cost,came_from,value) {
  this.path_cost = 0;
  this.came_from = {};
  this.value = 0;
  
  this.set = function (path_cost,came_from,value) {
    this.path_cost = path_cost;
    this.came_from = came_from;
    this.value = value;
  };

  this.set(path_cost,came_from,value);
}

function PathFinder(map) {
  this.map = map;

                                                                               

  //Replaces the map that the pathfinder uses for calculations
  this.updateMap = function(map) {
    this.map = map;
  }

  this.getElevation = function(hex) {
    return this.map.getValue(hex).getComponent('elevation');
  }

  //Computes the movement cost to hexes within a 'range' of the 'origin' hex
  //Movement cost it calculated with the moveCostRelative() function
  this.rangePathfind = function(origin,range) {
    
    var frontier = new Queue();  
    frontier.put(origin);
    var visited = new HexMap(); //this one takes pathfinder cells input
    var cost_so_far = 0;
    var came_from = undefined;
    var neighbor_elevation = 0;
    
    //create pathfinder cell for origin
    var origin_elevation = this.getElevation(origin);
    var new_cell = new PathFinderCell(cost_so_far, came_from, origin_elevation);
    visited.set(origin, new_cell); 

    //while the frontier still has nodes to explore
    while ( !frontier.isEmpty() ) {
      
      //get a hex on the frontier
      var current = frontier.pop();
      cost_so_far = visited.getValue(current).path_cost;
      
      //stop looking once cost_so_far goes over the desired range
      if (cost_so_far >= range) {
        continue;
      }
      //look at all its neighbors
      for (var i=0;i<6;i++) {

        //get the neighboring cell
        var neighbor = Hex.neighbor(current,i);

        //make sure it exists
        if (!this.map.containsHex(neighbor)) {
          continue;
        }
        
        //calculate the distance from origin to this neighbor
        var cost_to_neighbor = this.moveCostNeighbor( current, neighbor );
        var path_cost = cost_so_far + cost_to_neighbor;

        if ( !visited.containsHex(neighbor) ) {
          //find elevation of the neighbor cell
	  neighbor_elevation = this.moveCostAbsolute(neighbor);
	  //if not water or mountain
          if (neighbor_elevation > 1 && neighbor_elevation < 14) {
            frontier.put(neighbor);

            //create pathfinder cell for this hex
            new_cell = new PathFinderCell(path_cost,current,neighbor_elevation);

            //add to visited cells
            visited.set(neighbor, new_cell);
          } 

        } else {
          //add the cell if it HAS been visited, but a shorter path is found
          //all neighboring cells will have their cost re-calculated
          var previous_best_cost = visited.getValue(neighbor).path_cost;
          if (path_cost < previous_best_cost) {

            if (neighbor_elevation > 1 && neighbor_elevation < 14) {   
	      frontier.put(neighbor);

              //create pathfinder cell for this hex
              new_cell = new PathFinderCell(path_cost,current,neighbor_elevation);
              visited.set(neighbor, new_cell);
            } 

          }
        }
      }
    }
    console.log('find path!');
    //return all cells that are within a certain movement cost
    return visited;
  }

  
  


  //returns a hexmap containing only the hexes on the path to the destination
  this.destinationPathfind = function(origin, destination, range) {
      
      //calculate all paths within the range
      var visited = this.rangePathfind(origin,range);

      //return false if the destination cannot be reached within the range
      if (!visited.containsHex(destination)) {
        return false;
      }

      //add the path hexes on the return hex list
      var hexes_on_path = [];
      var hex_being_examined = destination;
      do {

        //add the visited hex to the path
        hexes_on_path.unshift(visited.getValue(hex_being_examined));

        //prepare to look at the hex before it
        hex_being_examined = visited.getValue(hex_being_examined).came_from;


      } while (hex_being_examined != origin)

      return hexes_on_path;

  }

  //Returns the absolute movement cost value of the tile given
  this.moveCostAbsolute = function(other_tile) {
    return this.getElevation(other_tile);
  }


  //Returns the movement cost to move from the first tile to the second tile.
  //For example, moving downhill is a smaller value than uphill.
  this.moveCostNeighbor = function(this_tile, other_tile) {
    
    //returns a positive number for uphill movement, negative number for downhill movement
    var difference = this.getElevation(other_tile) - this.getElevation(this_tile);
    //Currently returns hard-coded values based on difference in elevation only
    if (difference >= 4) {
      return 100;
    }
    if (difference > 0)  {
      return 6;
    }
    if (difference == 0) {
      return 4;
    }
    if (difference < 0) {
      return 3;
    }
    if (difference < -4) {
      return 100;
    }
  }

  //return the cost to move from origin to destination
  this.moveCostRelative = function(origin, destination,range) {
    var hex_path = this.destinationPathfind(origin,destination,range);
    return hex_path[hex_path.length-1].path_cost;
  }
}
