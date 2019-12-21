

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////


//All actions inherit from this action
function Action() {

  //default action settings
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  this.min_distance = 1;
  this.max_distance = 1;
  this.nextSelection = "self";
  this.extra_description = "";

  this.can_explore = true;
  this.auto_explore = true;

  this.also_build_road = true;
  this.also_build_road_backwards = false;

  this.cloud_clear = 0;
  this.multi_target = false;
  this.destroy_resource = true;
  this.collect_resource = true;
  this.can_use_roads = false;
  this.infinite_range = false;
  this.sky_action = false;

  this.slow_in_water = false;

  this.river_only = false;
  this.can_river = false;
  this.can_water = false;
  this.can_land = true;
  this.stop_on_rivers = false;
  this.stop_on_water = false;
  this.stop_on_coast = false;
  this.no_climbing_ashore = false;


  this.coastal_start = false;

  this.takes_city_pop = false; //true makes resources LOCAL, false makes resources GLOBAL

  //evaluates if a target can receive an action
  this.targetFilterFunction = function(world, actor, target) {    return true;  }

  //evaluates if the action will be displayed in the list
  this.activation = function(world, actor, position) {    return true;  }

  //evaluates if the action will be enabled in the list
  this.requirement = function(world, actor, position) {    return true;  }

  //additional effects of the action, which happen after the default ones
  this.effect = function(world, actor, position, target) {  }

  this.getDescription = function() {    
    if (this.free_pop_cost && this.free_pop_cost > 0)
      return this.description+" <span style='float-right'>(-"+this.free_pop_cost+")</span>";
    else
      return this.description;  
  }

  this.getExtraDescription = function() {    return this.extra_description;  }















  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

  //STOP FUNCTION (for pathfinder)
  this.stopFunction = function(world, hex, next_hex, origins = null) {
    
    //make origins into an array if it is only a single hex
    if (origins && !Array.isArray(origins))
      origins = [origins];

    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    //climbing from water to land
    if (world.onWater(hex) && world.onLand(next_hex)) {

      if (this.stop_on_coast)
        return true;
    }


    //entering a river from land (except the river tip tile)
    if (!world.onRiver(hex) && world.onRiver(next_hex) && world.onLand(hex) 
      && world.onLand(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'city') && next_tile.river.water_level != 7 ) {
      
      if (this.stop_on_rivers)
        return true;
    }

    
    //stepping from land to water, without a river      
    if (world.onLand(hex) && world.onWater(next_hex) && !world.leavingRiver(hex, next_hex) && !world.enteringRiver(hex,next_hex)) { 

      if (this.stop_on_water)
        return true;

      let is_coastal_start = false;
      if (this.coastal_start)
        for (let origin of origins) {
          if (Hex.equals(hex,origin))
            is_coastal_start = true;
        }
        if (is_coastal_start)
          return true;
    }

    
    
    return false;
  }

  //NEIGHBORS FUNCTION (for pathfinder)
  this.getNeighborsFunction = function(world, hex) {
    return world.world_map.getNeighbors(hex);
  }


  //STEP COST FUNCTION (for pathfinder)
  this.stepCostFunction = function(world, hex, next_hex, origins) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);



    //going into clouds
    if (next_tile.hidden)
      if (!this.can_explore)
        return undefined;

    //going into moutains
    if (next_tile.elevation > 13)
      return undefined;

    if (world.onWater(next_hex)) {
      if (!this.can_water)
        return undefined;


    }


    //walking on land, no river
    if (world.onLand(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex)) {
      if (!this.can_land) {
        return undefined;
      }
    }

    //stepping onto a river from dry land
    if( !world.onRiver(hex) && world.onRiver(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'city') && next_tile.river.water_level != 7) {
      if (!this.river_only && !this.can_river)
        return undefined;
    }

    //climbing into ocean, but not from a river
    if (world.onLand(hex) && world.onWater(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {
      
      //coastal starts cannot enter water except from their start position
      if ( this.coastal_start )
        for (let origin of origins) {
          if (Hex.equals(origin, hex))
            continue;
          else
            return undefined;
        }

      else if (!this.can_water)
        return undefined;
    }

    //climbing from water to land without a river
    if (world.onWater(hex) && world.onLand(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {
      if (this.no_climbing_ashore)
        return undefined;
    }

    //if not along a river
    if (!world.alongRiver(hex, next_hex) ) {
      if (this.river_only)
        return undefined;
    }

    //if along a river
    if (world.alongRiver(hex, next_hex) ) {
      if (!this.can_river || this.stop_on_rivers)
        return undefined;
    }
    


    let cost = 1;



    if (world.onWater(hex) && world.onWater(next_hex))
      cost*= 0.5;

    if (world.onWater(next_hex) && this.slow_in_water)
      cost = 100;

    if (world.onWater(hex) && world.onLand(next_hex) && this.slow_in_water)
      cost = 200;

    if (world.onLand(hex) && world.onWater(next_hex) && this.slow_in_water)
      if (world.noCitiesInArea(hex,0))
        cost = 10;
      else
        cost = 1;

    if ((world.areRoadConnected(hex,next_hex) && (this.can_use_roads) )) {
      cost = 0.5;
      if (this.double_road_speed)
        cost = 0;

    }


    return cost;
  }

  this.getPathfinder = function() {

    let action = this;

    //get the movement functions
    var stepCostFunction = action.stepCostFunction.bind(action); 
    var neighborFunction = action.getNeighborsFunction.bind(action);
    var stopFunction = action.stopFunction.bind(action); 

    //create a pathfinder to explore the area around the unit
    return new PathFinder(stepCostFunction, neighborFunction, stopFunction);
  }






















  /////////////////////////////////////////////////////////
                    // ACTION EFFECTS //
  /////////////////////////////////////////////////////////

  this.doAction = function(world, actor, position, target) {

    let pathfinder = this.getPathfinder();
    let tree = pathfinder.getTree( world, position, this.max_distance);
      
    //Either do a single action or do the action on all targets
    if (this.multi_target) {

      //do actions in order from closest to furthest, with a preference for land tiles
      actor.range.sort((a, b) => (world.onWater(a) && world.onLand(b)) ? 1 : -1);
      actor.range.sort((a, b) => (tree.currentCell(a).path_cost > tree.currentCell(b).path_cost) ? 1 : -1);
      
      let action = this;
      let range = actor.range;
      let counter = 0;
      let step_time = 500;

      function stepByStep() {
        let hex = range[counter];
        if (action.targetFilterFunction(world, actor, hex)) {
          action.doSingleAction(world,actor,position,hex);
        } else {
          step_time = 20;
        }
        counter++;
        if (counter < range.length)
          setTimeout(stepByStep, step_time);
        step_time = 500;
      }
      stepByStep();

      //for (hex of actor.range) 
        //this.doSingleAction(world, actor, position, hex);
    } else {
      this.doSingleAction(world, actor, position, target);
    }
    
    this.updateActionTargets(world, actor, position);

  };


  //Trigger the effects of the action
  this.doSingleAction = function(world, actor, position, target) {

    world.clearClouds(target, this.cloud_clear);

    if (this.takes_city_pop)       
      if (this.transfer_resources)
        actor.owner.addPop(-this.free_pop_cost);
      else
        actor.addPop(-this.free_pop_cost);

    if (this.also_build_road)
      this.createRoad(world, position, target);

    if (this.also_build_road_backwards)
      this.createRoad(world, target, position);

    if (this.new_unit_type) {
      world.addUnit(target, this.new_unit_type, actor);
      let new_unit = world.getUnit(target);
      this.clearAllActionRangeClouds(world, new_unit, target);
    }

    if (this.collect_resource) {
      if (world.hasResource(target)) {
        world.resources_available++;
        world.resources_collected++;
      }
    }

    if (this.free_pop_cost)
      world.resources_available -= this.free_pop_cost;

    if (this.total_pop_cost)
      world.resources_collected -= this.total_pop_cost;

    if (this.destroy_resource && world.getResource(target) && !world.getResource(target).resources['unknown'])
      world.destroyResource(target);

    //then do the action
    this.effect(world, actor, position, target);

    //do automatic action if one exists
    if (this.hover_action && this.hover_action.multi_target) {
      //var target_actor = world.getUnit(target);

      this.hover_action.updateActionTargets(world, actor, target);
      if (actor.range.length > 0)
        this.hover_action.doAction(world, actor, target )
    }


    if (this.collect_resource ) 
      if (world.hasResource(target) && world.getUnit(target)) 
        world.getUnit(target).addPop(1);

    if (this.transfer_pop)
      if (world.getUnit(target) && world.getUnit(target).pop) {
        actor.addPop(world.getUnit(target).pop);
        world.getUnit(target).pop = 0;
      }


  }

  this.clearAllActionRangeClouds = function(world, actor, position) {
    for (let new_unit_action of actor.getActions()) {
        if (new_unit_action.auto_explore && new_unit_action.activation(world, actor, position)) {
          //console.log('clearing clouds for '+new_unit_action.name);
          let new_action_range = new_unit_action.getActionRange(world, actor, position);
          for (let hex of new_action_range) {
            world.clearClouds(hex);
          }
        }
      }
  }


  this.updateActionTargets = function(world, actor, position) {

    world.clearHighlights();
    actor.range = this.getActionTargets(world, actor, position );
    world.highlightRange(actor.range);

    //clear the clouds over the area explored
    //for (let hex of actor.range) {
    //  world.clearClouds(hex,0);
    //}
  };

  this.clearActionRange = function(world, actor) {
    world.clearHighlights();
    actor.range = [];
  }

  this.getActionRange = function(world, actor, position) {

    var max_distance = this.max_distance;
    var min_distance = this.min_distance;
    if (this.pop_action) 
      max_distance += actor.getPop()*this.pop_action;

    if (this.sky_action) {

      //just use a big circle for the action range
      var actionRange = Hex.circle(position, this.max_distance);
    } else {

      //pathfind to find the action rangee
      let pathfinder = this.getPathfinder();

      if (this.infinite_range) {
        world.clearClouds();
        return [];
      }      

      var actionRange = pathfinder.getRange( world, position, max_distance, min_distance );
    }

    return actionRange;
  };

  this.getActionTargets = function(world, actor, position) {

    let actionRange = this.getActionRange(world, actor, position);

    //remove unsuitable targets
    let filteredRange = actionRange.filter(target => this.targetFilterFunction(world, actor, target));

    return filteredRange;
  };



  this.getActionPath = function(world, actor, position, target, extra_max_distance) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance;
    if (extra_max_distance)
      max_distance = extra_max_distance;

    var min_distance = this.min_distance;
    var actionPath = pathfinder.getPath( world, position, target, max_distance );

    return actionPath;
  };



  this.createRoad = function(world, origin, target) {

    let pathfinder = this.getPathfinder();
      
    var actionPath = pathfinder.getPath( world, origin, target, 20 );

    if (actionPath instanceof Array)
      world.buildRoad(actionPath);
  }

  this.buildRoadUsingTree = function(world, actor, origin, target) {

    let actionPath = [target];
    let tree_tile = this.action_tree.currentCell(target);

    while (tree_tile.previous_coord) {

      actionPath.push(tree_tile.previous_coord);
      tree_tile = this.action_tree.currentCell(tree_tile.previous_coord);

    }

    world.buildRoad(actionPath);

  }
}

  //Modifies the pathfinder array result to be returned
  Map.prototype.currentCell = function(hex) {
    return this.get(JSON.stringify(hex));
  } ;




 






















function actionExpand2(distance) {
  Action.call(this);

  this.name = "city-by-land-2";
  //this.new_unit_type = 'city';

  this.hover_action = new actionExploit(2, true);

  this.stop_on_coast = true;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.can_water = false;
  this.coastal_start = false;

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 3;

  this.destroy_resource = true;
  this.collect_resource = true;

  this.cloud_clear = 6;

  this.free_pop_cost = 1;
  //this.takes_city_pop = false;

  this.can_use_roads = true;
  //this.double_road_speed = true;

  this.description = "Expand 2";
  this.extra_description = "Create a new node far away.";

  this.targetFilterFunction = function(world, actor, target) {
    return world.onLand(target) && !world.unitAtLocation(target);
  }

  this.effect = function(world, actor, position, target) {

    world.getUnit(target).pop = 1;
        for (let hex of Hex.circle(target,2))
      if (world.onLand(hex))
        world.getTile(hex).elevation = 3+Math.floor(Math.random()*4);

  }
}










function actionExplore(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "city-by-land";
  this.new_unit_type = 'colony';

  //this.pop_action = 1/3;

  //this.hover_action = new actionExploit(2, true);

  this.stop_on_coast = true;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.can_water = true;
  this.coastal_start = true;

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = false;
  this.hover_radius = 3;

  this.destroy_resource = true;
  this.collect_resource = true;

  this.cloud_clear = 6;

  this.free_pop_cost = 1;
  //this.takes_city_pop = false;

  this.can_use_roads = true;
  //this.double_road_speed = true;

  this.description = "Explore";
  this.extra_description = "Create a new node far away.";

  this.targetFilterFunction = function(world, actor, target) {
    return world.onLand(target) && !world.unitAtLocation(target) && !world.countResources([target],'food',1);
  }

  this.effect = function(world, actor, position, target) {

    //world.getUnit(target).pop = 1;
  }
}
















//This action transforms the unit into a camp
function actionExpand(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "village";
  this.new_unit_type = 'city';
  this.can_use_roads = true;
  //this.double_road_speed = true;

  this.can_land = true;
  this.can_river = true;
  this.stop_on_rivers = true;
  this.stop_on_coast = true;

  this.coastal_start = true;
  this.can_water = true;

  this.transfer_pop = true;

  this.hover_action = new actionExploit(1, true);

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;

  //this.pop_action = 1/3;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 3;

  this.free_pop_cost = 1;

  this.collect_resource = true;


  
  this.description = "Expand";
  this.extra_description = "Collect resources in a small circle";

  this.targetFilterFunction = function(world, actor, target) {
    return world.onLand(target) && !world.unitAtLocation(target) && !world.hasResource(target) && 
    (world.countResources(Hex.circle(target,1),'food',1) || world.nearCoast(target));
  }

  this.activation = function(world, actor, position) {
    return (world.bonusEnabled('can-create-villages') && actor.pop && actor.pop >= 0);
  }
  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 2;
  }
}










//This action transforms the unit into a camp
function actionExpandAll() {
  Action.call(this);

  this.name = "villagessss";
  this.new_unit_type = 'colony';
  this.can_use_roads = true;
  this.double_road_speed = true;

  this.can_explore = true;
  this.auto_explore = false;

  this.can_land = true;
  this.can_river = true;
  this.stop_on_rivers = true;

  this.coastal_start = false;
  this.can_water = false;
  this.stop_on_coast = false;
  this.stop_on_water = false;
  this.slow_in_water = true;
  this.no_climbing_ashore = false;

  this.transfer_pop = true;

  this.multi_target = true;



  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = 200000;

  //this.pop_action = 1/3;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 7;

  this.free_pop_cost = -1;
  this.total_pop_cost = -1;

  this.collect_resource = true;


  
  this.description = "Expansion";
  this.extra_description = "Collect all land resources";

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && world.noUnitTypeInArea (target,1, 'colony');
  }
  this.effect = function(world, actor, position, target) {
    for (let hex of world.getHexArray()) {
      if (world.countRoads(hex) >= 3)
        if (world.onLand(hex) && !world.unitAtLocation(hex))
          world.addUnit(hex, 'village', actor);
    }

    for (let hex of Hex.circle(target,2))
      if (world.onLand(hex))
        world.getTile(hex).elevation = 3+Math.floor(Math.random()*4);

    //actor.pop++;
  }
  

}










//This action transforms the unit into a camp
function actionMoveCity() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "move-city";
  this.can_use_roads = true;

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = 5;

  this.also_build_road = true;
  this.also_build_road_backwards = true;
  this.hover_radius = 3;

  this.hover_action = new actionExploit(3,true);

  this.cloud_clear = 6;

  this.collect_resource = true;
  this.destroy_resource = true;

  //this.total_pop_cost = 1;
  this.free_pop_cost = 1;

  this.description = "Move";
  this.extra_description = "Move into new lands";

  this.targetFilterFunction = function(world, actor, target) {
    return world.onLand(target) &&  
    (!world.unitAtLocation(target) || !world.noUnitTypeInArea(target, 0, 'colony') ) && 
    ( world.hasResource(target) || world.nearCoast(target) || world.nearRiver(target) ) ;
  }

  this.activation = function(world, actor, position,target) {
    return (actor.can_move /*&& world.bonusEnabled('moveable-cities')*/ );
  }

  this.requirement = function(world, actor, position,target) {
    return (actor.can_move && world.getPopulation() >= 1);
  }

  this.effect = function(world, actor, position, target) {

    actor.moveActionToTop(this);

    world.units.set(target, actor);

    world.destroyUnit(position);
    world.addUnit(position, 'city', actor);
    


  }



}







function actionExploit(max_distance, multi_target) {
  Action.call(this);

  this.name = "get-food";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 2;

  this.can_water = true;
  this.can_river = true;
  this.stop_on_rivers = true;
  this.no_climbing_ashore = true;
  this.coastal_start = true;

  this.also_build_road = true;
  this.can_use_roads = true;
  this.double_road_speed = true;

  this.collect_resource = false; //should be true but 'takes city pop' relies on free_pop_cost
  this.destroy_resource = true;

  this.free_pop_cost = -1;
  this.total_pop_cost = -1;
  this.takes_city_pop = true;

  this.multi_target = multi_target;
  //this.new_unit_type = 'colony';



  this.description = "Claim resources";
  this.extra_description = "Get all the food";

  this.targetFilterFunction = function(world, actor, target) {
    if (world.unitAtLocation(target)) 
      return false;

    if (!world.countResources(Hex.circle(target, 0), 'food', 1))
      return false;

    return true;
  }


  this.effect = function(world,actor,position,target) {
    //actor.addPop(1);
  }
}




































/*
//This action transforms the unit into a camp
function actionHydroDam() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "hydro-dam";
  this.min_distance = 0;
  this.max_distance = 10;
  this.hover_radius = 0;
  this.cloud_clear = 0;
  this.river_only = true;
  this.stop_on_rivers = false;

  this.also_build_road = false;

  this.destroy_resource = false;

  this.free_pop_cost = -4;

  this.multi_target = false;

  this.description = "Hydro Dam";
  this.extra_description = "Dam the river to get lots of resources";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.isUpstreamOf(target, position) /*&& Hex.equals(world.getTile(target).river.downstream_hex, position);
  }

  this.activation = function(world, actor, position) {
    return world.onRiver(position);
  }


  this.effect = function(world,actor,position,target) {
    actor.pop += 4;
    this.hydroDam(world, position);
  }

  this.hydroDam = function(world, target) {
    

    let tile = world.getTile(target);
    if (world.getTile(target).river.upstream_hexes) {
      for (upstream of world.getTile(target).river.upstream_hexes) {
        if (world.getTile(upstream).river.water_level >= 7)
          this.hydroDam(world, upstream);
        //setTimeout(function(){ self.hydroDam(world, upstream); }, 200);
      }
      
      //flood the tile
      tile.elevation = 1;     
      world.removeRoads(target);   
      if (!world.noUnitTypeInArea(target, 0, 'colony')) {
        world.getUnit(target).addPop(-1);
        world.resources_collected -= 1;
        world.resources_available -= 1;
        if (!world.getResource(target).resources['unknown'])
          world.destroyResource(target);
        world.destroyUnit(target);
      }
      if (Math.random() <= 0.2)
        world.addResource(target, 'fish');


    } else {
      tile.elevation = 3+Math.floor(5*Math.random());
    }





  }
}*/




function actionCreateCityByAir(max_distance) {
  actionCreateCity.call(this);
  this.name = 'city-by-air';
  this.minimum_elevation = 0;
  this.maximum_elevation = 30;
  this.min_distance = 0;
  this.also_build_road = false;
  this.also_build_road_backwards = false;
  this.can_use_roads = false;
  this.sky_action = true;
  this.pop_action = 1/3;

  if (max_distance)
    this.max_distance = max_distance;
  else
    this.infinite_range = true;

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && world.onLand(target) 
           && world.noCitiesInArea(target,5) && !world.onIce(target) && !world.onMountain(target);
  }

}



















