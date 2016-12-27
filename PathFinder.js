
// RANGE FINDING

//pathfinding arguments:
	//map of (hex,movement_cost) pairs

//pathfinding algorithms:
	//findRange(hex_origin,range) returns an array of hexes reachable from hex_origin in n steps
	//find_path(hex_origin,hex_destination) returns shortest path
	//path_distance(hex_origin,hex_destination) returns distance between two hexes


function PathFinderCell(path_cost,came_from,value) {
	this.path_cost = path_cost;
	this.came_from = came_from;
	this.value = value;
}

function PathFinder(map) {
	this.map = map;



	//Replaces the map that the pathfinder uses for calculations
	this.updateMap = function(map) {
		this.map = map;
	}

	//Returns an array of hexes within a certain 'range' of the 'origin' hex
	//Ignores movement cost for now
	//Sight-cost is not implemented (for example, mountains do not block sight)
	this.sight = function(origin,range) {
		
		var frontier = new Queue(); 	//frontier contains a growing perimeter of hexes to be examined
		frontier.put(origin); 				//frontier begins as only the initial hex
		var visited = new HexMap();		//visited is the list of hexes that will be returned as part of the 'visible' hexes
		var distance = 0;							//distance from the origin hex is 0 for the origin hex
		visited.set(origin,distance);	//the origin is always visible

		//while the frontier still has nodes to explore
		while ( !frontier.isEmpty() ) {
			
			//get a hex on the frontier
			var current = frontier.get();
			distance = visited.getValue(current)+1;

			//stop looking once distance goes over the desired range
			if (distance > range) {
				continue;
			}

			//otherwise, add its neighbors to the hexes to examine
			for (var i=0;i<6;i++) {
				var neighbor = Hex.neighbor(current,i);
				if (!visited.containsHex(neighbor)) {
					frontier.put(neighbor);
					visited.set(neighbor,distance);
				}

			}
		}

		return visited;
	}

	//Computes the total movement cost to all hexes within the given 'range' of the 'origin' hex
	//Movement cost it calculated with the moveCostRelative() function
	this.rangePathfind = function(origin,range) {
		
		var frontier = new Queue();	
		frontier.put(origin);
		var visited = new HexMap(); //this one takes three things as values: a momvement_cost, the cell it came from, and the value of the hex
		var cost_so_far = 0;
		var came_from = undefined;

		//create pathfinder cell for origin
		var pathfinder_cell = new PathFinderCell(cost_so_far,came_from,this.map.getValue(origin).components.elevation);
		visited.set(origin,pathfinder_cell); //define this triad as an object

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
					//add the cell if it hasnt been visited
					if (this.moveCostAbsolute(neighbor) > 1 && this.moveCostAbsolute(neighbor) < 14) { //not water or mountain
						frontier.put(neighbor);

						//create pathfinder cell for this hex
						pathfinder_cell = new PathFinderCell(path_cost,current,this.map.getValue(neighbor).components.elevation);

						//add to visited cells
						visited.set(neighbor,pathfinder_cell);
					} 

				} else {
					//also add the cell if it HAS been visited, but a shorter path is found
					//if a shorter path is found, all neighboring cells will have their cost re-calculated
					var previous_best_cost = visited.getValue(neighbor).path_cost;
					if (path_cost < previous_best_cost) {

						if (this.moveCostAbsolute(neighbor) > 1 && this.moveCostAbsolute(neighbor) < 14) { //not mountain
							frontier.put(neighbor);

							//create pathfinder cell for this hex
							pathfinder_cell = new PathFinderCell(path_cost,current,this.map.getValue(neighbor).components.elevation);
							visited.set(neighbor,pathfinder_cell);
						} 

					}
				}
			}
		}

		//return all cells that are within a certain movement cost
		return visited;
	}

	
	


	//returns a hexmap containing only the hexes on the path to the destination
	this.destinationPathfind = function(origin, destination, range) {
			
			//calculate all paths within the range
			var visited = this.rangePathfind(origin,range);

			//return false if the destination cannot be reached within the range
			if (!visited.containsHex(destination)) {
				console.log('range too short');
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
		return this.map.getValue(other_tile).components.elevation;
	}


	//Returns the movement cost to move from the first tile to the second tile.
	//For example, moving downhill is a smaller value than uphill.
	this.moveCostNeighbor = function(this_tile, other_tile) {
		
		//returns a positive number for uphill movement, negative number for downhill movement
		var difference = this.map.getValue(other_tile).components.elevation - this.map.getValue(this_tile).components.elevation;

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