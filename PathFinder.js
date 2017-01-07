//-------1---------2---------3---------4---------5---------6---------7--------8
// RANGE FINDING

//pathfinding arguments:
  //map of (hex,movement_cost) pairs

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


  //Replaces the map that the pathfinder uses
  this.replaceMap = function(map) {
    this.map = map;
  };

  this.getElevation = function(hex) {
    var this_tile = this.map.getValue(hex);
    return this_tile.getComponent('elevation');
  };

  //Computes the movement cost to hexes within
  // a 'range' of the 'origin' hex
  this.rangePathfind = function(origin,range) {
    
    var frontier = new Queue();  
    frontier.put(origin);
    //this one takes pathfinder cells input
    var visited = new HexMap(); 
    var cost_so_far = 0;
    var came_from; 
    var neighbor_elevation = 0;
    var best_cell = {};
    var path_cost = 0;
    
    //create pathfinder cell for origin
    var origin_elevation = this.getElevation(origin);
    var new_cell = new PathFinderCell(cost_so_far,
                                      came_from, 
				      origin_elevation);
    visited.set(origin, new_cell); 

    //while the frontier still has nodes to explore
    while ( !frontier.isEmpty() ) {
      
      //get a hex on the frontier
      var current_hex = frontier.pop();
      var current_cell = visited.getValue(current_hex);
      cost_so_far = current_cell.path_cost;
      
      //stop looking once  over the desired range
      if (cost_so_far >= range) {
        continue;
      }
      //look at all its neighbors
      for (neighbor of current_hex.getNeighbors()) {
	this.processCell(current_hex, neighbor, visited, frontier, cost_so_far);
      }
    }
    //return all cells that are within a certain distance 
    return visited;
  };

  //Process a cell while pathfinding
  this.processCell = function(current_hex,neighbor_hex,visited,frontier,cost_so_far) {
    var already_visited = visited.containsHex(neighbor_hex);
    var neighbor_cell = visited.getValue(neighbor_hex);
    var new_cell = this.getNeighborCell(current_hex,neighbor_hex,cost_so_far);

    if (new_cell) {
      if (already_visited) {
      //Compare the two cells if it has been visited
        if (this.recheckNeighborCell(neighbor_cell,new_cell)) {
          frontier.put(neighbor_hex);
          visited.set(neighbor_hex, new_cell);
        }
      } else {
        //Add the new cell if it has not been visited
        if (this.checkCell(new_cell)) {
          frontier.put(neighbor_hex);
          visited.set(neighbor_hex, new_cell);
        }
     }
    }
  }

  //Creates a PathFinder cell going from one hex to another
  this.getNeighborCell = function(current_hex, neighbor_hex, cost_so_far) {

    if (!this.map.containsHex(neighbor_hex)) {
      return false;
    }
  
    var cost_to_neighbor = this.moveCostNeighbor(current_hex, neighbor_hex);
    var path_cost = cost_so_far  + cost_to_neighbor;
    
    neighbor_elevation = this.moveCostAbsolute(neighbor_hex);
    var new_cell = new PathFinderCell(path_cost,current_hex,neighbor_elevation);

    return new_cell;
  }

  //While pathfinding, returns true if new cell is better
  this.recheckNeighborCell = function(cell, new_cell) {
    
    best_cell = this.compareCells(cell, new_cell );
    if (best_cell === new_cell) {
      return true;
    }

    return false;
  };

  //While pathfinding, returns true to add the new cell
  this.checkCell = function(new_cell) {
    if (this.cellIsPassable(new_cell)) {
      return true;
    }
      
    return false;
  };

  //Returns if the cell can be walked on
  this.cellIsPassable = function(cell) {
    if (cell.value > 1 && cell.value < 14) {
      return true;
    } else {
      return false;
    }
  };
  
  //Returns which cell is the best path step
  this.compareCells = function(cell_a, cell_b) {
    var cost_a = cell_a.path_cost;
    var cost_b = cell_b.path_cost;

    if (cost_b < cost_a) {
      if (this.cellIsPassable(cell_b)) {
	return cell_b;
      }
    } 

    return cell_a;    
  
  };  


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


      } while (hex_being_examined != origin);

      return hexes_on_path;

  };

  //Returns the absolute movement cost value of the tile given
  this.moveCostAbsolute = function(other_tile) {
    return this.getElevation(other_tile);
  };


  //Returns the movement cost to move from the first tile to the second tile.
  //For example, moving downhill is a smaller value than uphill.
  this.moveCostNeighbor = function(this_tile, other_tile) {
    
    //returns a positive number for uphill, negative for downhill
    var difference = this.getElevation(other_tile)-this.getElevation(this_tile);
    //Currently returns hard-coded values based on difference in elevation only
    if (difference >= 4) {
      return 100;
    }
    if (difference > 0)  {
      return 6;
    }
    if (difference === 0) {
      return 4;
    }
    if (difference < 0) {
      return 3;
    }
    if (difference < -4) {
      return 100;
    }
  };

  //return the cost to move from origin to destination
  this.moveCostRelative = function(origin, destination,range) {
    var hex_path = this.destinationPathfind(origin,destination,range);
    return hex_path[hex_path.length-1].path_cost;
  };
}
