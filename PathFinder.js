
// RANGE FINDING

//pathfinding arguments:
	//map of (hex,movement_cost) pairs

//pathfinding algorithms:
	//find_range(hex_origin,range) returns an array of hexes reachable from hex_origin in n steps
	//find_path(hex_origin,hex_destination) returns shortest path
	//path_distance(hex_origin,hex_destination) returns distance between two hexes




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
		//var direction_from;						//direction_from remember which direction the expanding frontier came from
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
				var neighbor = hex_neighbor(current,i);
				if (!visited.containsHex(neighbor)) {
					frontier.put(neighbor);
					visited.set(neighbor,distance);
				}

			}
		}

		return visited;
	}

	//Computes the total movement cost to all hexes within the given 'range' of the 'origin' hex
	//Movement cost it calculated with the move_cost_relative() function
	this.path_with_terrain = function(origin,range) {
		
		var frontier = new Queue();	
		frontier.put(origin);
		var visited = new HexMap(); //this one takes three things as values: a momvement_cost, the cell it came from, and the value of the hex
		var cost_so_far = 0;
		var came_from = undefined;
		visited.set(origin,[cost_so_far,came_from,this.map.getValue(origin)]);

		//while the frontier still has nodes to explore
		while ( !frontier.isEmpty() ) {
			
			//get a hex on the frontier
			var current = frontier.pop();
			cost_so_far = visited.getValue(current)[0];
			
			//stop looking once cost_so_far goes over the desired range
			if (cost_so_far >= range) {
				continue;
			}
			//look at all its neighbors
			for (var i=0;i<6;i++) {

				//get the neighboring cell
				var neighbor = hex_neighbor(current,i);

				//make sure it exists
				if (!this.map.containsHex(neighbor)) {
					continue;
				}
				
				//calculate the distance from origin to this neighbor
				var cost_to_neighbor = this.move_cost_relative( current, neighbor );
				var path_cost = cost_so_far + cost_to_neighbor;

				
				if ( !visited.containsHex(neighbor) ) {
					//add the cell if it hasnt been visited
					if (this.move_cost_absolute(neighbor) > 1 && this.move_cost_absolute(neighbor) < 14) { //not mountain
						frontier.put(neighbor);
						visited.set(neighbor,[path_cost,current,this.map.getValue(neighbor)]);
					} 

				} else {
					//also add the cell if it HAS been visited, but a shorter path is found
					//if a shorter path is found, all neighboring cells will have their cost re-calculated
					var previous_best_cost = visited.getValue(neighbor)[0];
					if (path_cost < previous_best_cost) {

						if (this.move_cost_absolute(neighbor) > 1 && this.move_cost_absolute(neighbor) < 14) { //not mountain
							frontier.put(neighbor);
							visited.set(neighbor,[path_cost,current,this.map.getValue(neighbor)]);
						} 

					}
				}
			}
		}

		//return all cells that are within a certain movement cost
		return visited;
	}


	//Takes a small hexmap
	/*this.path = function(range,destination) {
		var hexes = [];
		hexes.push(destination);
		var next = range.getValue(destination)[1]; //take the came from
		while (next !== undefined) {
			hexes.push(next);
			next = range.getValue(next)[1];
		}
		return hexes;
	}*/


	//Returns the absolute movement cost value of the tile given
	this.move_cost_absolute = function(other_tile) {
		return this.map.getValue(other_tile);
	}


	//Returns the movement cost to move from the first tile to the second tile.
	//For example, moving downhill is a smaller value than uphill.
	this.move_cost_relative = function(this_tile, other_tile) {
		
		//returns a positive number for uphill movement, negative number for downhill movement
		var difference = this.map.getValue(other_tile) - this.map.getValue(this_tile);

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
}