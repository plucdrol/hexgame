//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths

function PathFinderCell(path_cost,came_from,value) {
  this.path_cost = 0;
  this.came_from = {};
  
  this.set = function (path_cost,came_from) {
    this.path_cost = path_cost;
    this.came_from = came_from;
  };

  this.set(path_cost,came_from);
}



//PathFinder takes maps and generates ranges and paths
function PathFinder(map) {
  this.map = map;
  this.visited = new HexMap();
  this.frontier = new Queue();

  //Replaces the map that the pathfinder uses
  this.replaceMap = function(map) {
    this.map = map;
  };

  this.getElevation = function(hex) {
    var tile = this.map.getValue(hex);
    var elevation = tile.getComponent('elevation');
    return elevation;
  }

  //Deletes previous path to start a new path search
  this.reset = function() {
    this.visited = new HexMap();
    this.frontier = new Queue();
  }

  //Modifies the pathfinder array result to be returned
  this.getCell(hex) {
    return this.visited.getValue(hex);
  } 
  this.setCell(hex, cell) {
    this.visited.setValue(hex,cell);
  }
  this.hasCell(hex) {
    return this.visited.containsHex(hex);
  }

  //Find movement cost to all cells within range of origin
  this.rangePathfind = function(origin,range) {
    
    this.reset();
    this.frontier.put(origin);

    //this one takes pathfinder cells input
    var path_cost = 0;
    var came_from; 
    
    //create pathfinder cell for origin
    var origin_elevation = this.getElevation(origin);
    var new_cell = new PathFinderCell(path_cost, undefined);
    this.setCell(origin, new_cell);

    //while the frontier still has nodes to explore
    while ( !this.frontier.isEmpty() ) {
      
      //get a hex on the frontier
      var current_hex = this.frontier.pop();
      var current_cell = this.getCell(current_hex);
      cost = current_cell.path_cost;
      
      //ignore that hex if it is too far
      if (cost >= range) {
        continue;
      }
      //look at all its neighbors
      for (neighbor of current_hex.getNeighbors()) {
	this.processCell(current_hex, neighbor);
      }
    }
    //return all cells that are within a certain distance 
    return this.visited;
  };

  //Process a cell while pathfinding
  this.processCell = function(current_hex, neighbor_hex) {
    var already_visited = this.hasCell(neighbor_hex);
    var neighbor_cell = this.getCell(neighbor_hex);
    var new_cell = this.getNeighborCell(current_hex,neighbor_hex,cost_so_far);

    if (new_cell) {
      if (already_visited) {
      //Compare the two cells if it has been visited
        if (this.recheckNeighborCell(neighbor_cell,new_cell)) {
          this.frontier.put(neighbor_hex);
          this.setCell(neighbor_hex, new_cell);
        }
      } else {
        //Add the new cell if it has not been visited
        if (this.hexIsPassable(neighbor_hex)) {
          this.frontier.put(neighbor_hex);
          this.setCell(neighbor_hex, new_cell);
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
    var new_cell = new PathFinderCell(path_cost,current_hex);

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

  //Returns if the hex can be walked on
  this.hexIsPassable = function(hex) {
    var elevation = this.getElevation(hex);
    if (elevation > 1 && elevation < 14) {
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
      return cell_b;
    } 

    return cell_a;    
  
  };  


  //returns a hexmap containing only the hexes on the path
  //to the target
  this.targetPathfind = function(origin, target, range) {
      
    //calculate all paths within the range
    this.visited = this.rangePathfind(origin,range);

    //return false if the target is out of range 
    if (!this.visited.containsHex(target)) {
      return false;
    }

    //add the path hexes on the return hex list
    var hexes_on_path = [];
    var hex_being_examined = target;
    do {

      //add the visited hex to the path
      var visited_cell = this.getCell(hex_being_examined);
      hexes_on_path.unshift(visited_cell);

      //prepare to look at the hex before it
      hex_being_examined = visited_cell.came_from;


    } while (hex_being_examined != origin);

    return hexes_on_path;

  };

  //Returns the absolute movement cost value of the tile 
  this.moveCostAbsolute = function(other_tile) {
    return this.getElevation(other_tile);
  };


 //Returns the movement cost from first tile to second.
  //Moving downhill is a smaller value than uphill.
  this.moveCostNeighbor = function(this_tile, other_tile) {
    
    //returns a positive number for uphill movement
    // negative number for downhill movement
    var cost_this  = this.get_elevation(other_tile);
    var cost_other = this.getElevation(other_tile);
    var difference = cost_other - cost_this; 
    //Returns values based on difference in elevation only
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

  //return the cost to move from origin to target
  this.moveCostRelative = function(origin, target,range) {
    var path = this.targetPathfind(origin,target,range);
    return hex_path[hex_path.length-1].path_cost;
  }
}
