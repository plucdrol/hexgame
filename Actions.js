

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
  this.stop_elevation_up = 100;
  this.stop_elevation_down = -1;
  this.extra_description = "";

  this.also_build_road = true;
  this.also_build_road_backwards = false;

  this.cloud_clear = 0;
  this.multi_target = false;
  this.destroy_resource = false;
  this.collect_resource = true;
  this.can_use_roads = false;
  this.infinite_range = false;
  this.sky_action = false;

  this.river_only = false;
  this.can_river = false;
  this.rivers_and_coasts = false;
  this.stop_on_rivers = false;

  this.takes_city_pop = false; //true makes resources LOCAL, false makes resources GLOBAL

  //evaluates if a target can receive an action
  this.targetFilterFunction = function(world, actor, position, target) {    return true;  }

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
  this.stopFunction = function(world, hex, next_hex) {
    
    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    if (next_tile.elevation >= this.stop_elevation_up /*&& this_tile.elevation < this.stop_elevation_up*/)
      return true;

    if (next_tile.elevation <= this.stop_elevation_down && this_tile.elevation > this.stop_elevation_down)
      return true;

    if (this.stop_on_rivers && world.onRiver(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'lighthouse') )
      return true;

    if (this.rivers_and_coasts) {
      
      //stepping into coastal water only allowed for same river
      if (world.onLand(hex) && world.onWater(next_hex) && !world.leavingRiver(hex, next_hex)) 
       return true;

      //stop if moving on land
      if (world.onLand(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex))
        return true;

      //stop if moving to land and you're not entering a river
      if ( world.onWater(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex) && !world.enteringRiver(hex, next_hex) )
        return true;
    }
    
    return false;
  }

  //NEIGHBORS FUNCTION (for pathfinder)
  this.getNeighborsFunction = function(world, hex) {
    return world.world_map.getNeighbors(hex);
  }


  //STEP COST FUNCTION (for pathfinder)
  this.stepCostFunction = function(world, hex, next_hex) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);

    if (next_tile.elevation > this.maximum_elevation) 
      return undefined;
    if (next_tile.elevation < this.minimum_elevation) 
      return undefined;

    //no stepping on rivers without the proper ability
    if (!this.river_only && !this.rivers_and_coasts && !this.can_river && this.minimum_elevation >= 2)
      if( world.onRiver(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'lighthouse') )
        return undefined;

    //river_only can only move along rivers
    if (this.river_only) {
      if (!world.alongRiver(hex, next_hex) )
        return undefined;
    }

    if (this.rivers_and_coasts) {
      if (world.onLand(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex))
        return undefined;
    }


    let cost = 1;

    if ((world.areRoadConnected(hex,next_hex) && (this.can_use_roads) ) /*|| world.sameRiver(hex, next_hex)*/) {
      cost = 0.5;
      if (this.double_road_speed)
        cost = 0.25;

    }

    if (this.two_max_distances && world.onWater(next_hex))
      cost = 0.4;


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
      
    //Either do a single action or do the action on all targets
    if (this.multi_target) {
      //do actions in order from closest to furthest
      actor.range.sort((a, b) => (Hex.distance(a, position) > Hex.distance(b, position)) ? 1 : -1);
      for (hex of actor.range) 
        this.doSingleAction(world, actor, position, hex);
    } else {
      this.doSingleAction(world, actor, position, target);
    }
    
    this.updateActionRange(world, actor, position);

  };


  //Trigger the effects of the action
  this.doSingleAction = function(world, actor, position, target) {

    world.clearClouds(target, this.cloud_clear);

    if (this.takes_city_pop)
      actor.addPop(-this.free_pop_cost);

    if (this.also_build_road)
      this.createRoad(world, actor, position, target);

    if (this.also_build_road_backwards)
      this.createRoad(world, actor, target, position);

    if (this.new_unit_type) {
      world.addUnit(target, this.new_unit_type, actor);
      let new_unit = world.getUnit(target);

      if (this.free_pop_cost > 0)
        new_unit.pop = this.free_pop_cost;
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

    if (this.destroy_resource)
      world.destroyResource(target);

    //then do the action
    this.effect(world, actor, position, target);

    //do automatic action if one exists
    if (this.hover_action && this.hover_action.multi_target) {
      let actor = world.getUnit(target);
      this.hover_action.updateActionRange(world, actor, target);
      this.hover_action.doAction(world, actor, target )
    }


  }

  this.updateActionRange = function(world, actor, position) {

    world.clearHighlights();
    actor.range = this.getActionRange(world, actor, position );
    world.highlightRange(actor.range);

    //clear the clouds over the area explored
    for (let hex of actor.range) {
      world.clearClouds(hex,1);
    }
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

    //limit range to elevations
    let upperRange = actionRange.filter(hex => world.getMapValue(hex).elevation >= this.minimum_elevation );
    let middleRange = upperRange.filter(hex => world.getMapValue(hex).elevation <= this.maximum_elevation );



    //remove unsuitable targets
    let filteredRange = middleRange.filter(target => this.targetFilterFunction(world, actor, position, target));

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

  this.createRoad = function(world, actor, origin, target) {

    let pathfinder = this.getPathfinder();

    var max_distance = this.max_distance;
    if (this.pop_action) 
        max_distance += actor.getPop()*this.pop_action;
      
    var actionPath = pathfinder.getPath( world, origin, target, max_distance+1 );

    if (actionPath instanceof Array)
      world.buildRoad(actionPath);
  }
}




























//This action transforms the unit into a camp
function actionCreateCity(distance, extra) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "city-by-land";
  this.new_unit_type = 'city';

  this.pop_action = 1/3;

  this.hover_action = new actionGetResource(5,true);


  this.can_river = true;
  this.stop_on_rivers = true;

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = false;
  this.hover_radius = 3;

  this.destroy_resource = true;
  this.collect_resource = true;

  this.cloud_clear = 6;

  this.free_pop_cost = 4;
  this.takes_city_pop = false;

  this.can_use_roads = true;
  //this.double_road_speed = true;

  this.description = "Expedition";
  this.extra_description = "Create a new city far away. Goes further from bigger cities";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.onLand(target) && !world.unitAtLocation(target);
  }

  this.effect = function(world, actor, position, target) {
    if (extra == 'settled') {
      world.getUnit(target).can_move = false;

    }
  }



}

function actionCreateCityBySea(distance) {
  actionCreateCity.call(this);
  this.name = 'city-by-sea';
  this.minimum_elevation = 0;
  this.min_distance = 0;
  this.max_distance = distance;
  this.also_build_road = false;
  this.also_build_road_backwards = false;
  this.stop_elevation_up = 2;
  this.can_use_roads = false;
  this.pop_action = 1/3;
    this.can_river = true;
  this.stop_on_rivers = false;

    this.description = "Sea expedition";
  this.extra_description = "Create a new city by sea. Goes further from bigger cities";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.onLand(target) && world.nearCoast(target);
  }
  this.activation = function(world, actor, position) {
    return world.nearCoast(position);
  }
  this.effect = function(world, actor, position, target) {
    world.unitAtLocation(target).can_move = false;
  }
}







//This action transforms the unit into a camp
function actionCreateLighthouseBySea(distance) {
  actionCreateLighthouse.call(this);

  this.minimum_elevation = 0;
  this.stop_elevation_up = 2;

  this.name = "lighthouse-by-sea";
  this.max_distance = distance;
  this.can_river = true;
  this.stop_on_rivers = false;

  this.hover_action = new actionGetShallowFish( 4 );

  this.pop_action = 1/3;
  this.free_pop_cost = 3;

  this.also_build_road = true;

  this.description = "Water Den by sea";

  this.targetFilterFunction = function(world, actor, position, target) {
    //coastal land tile
    if (!world.unitAtLocation(target) && world.nearCoast(target,1,6) && world.onLand(target))
      return true

    return false;
  }

  this.activation = function(world,actor,position) {
    return world.nearCoast(position);
  }

  this.effect  = function(world, actor, position, target) {
    world.getUnit(target).pop = 3;
  }

}







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

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.onLand(target) 
           && world.noCitiesInArea(target,5) && !world.onIce(target) && !world.onMountain(target);
  }

}



//This action transforms the unit into a camp
function actionCreateCityCanon(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "flesh-canon";
  this.new_unit_type = 'flesh-canon';
  this.can_use_roads = true;

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 0;

  this.cloud_clear = 3;

  this.destroy_resource = true;
  this.collect_resource = false;

  this.free_pop_cost = 6;
  
  this.description = "City canon";
  this.extra_description = "Creates cities anywhere within 20 tiles";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.onLand(target) && world.noCitiesInArea(target,3) && !world.unitAtLocation(target);
  }

  this.activation = function(world, actor, position) {
    return (actor.pop && actor.pop >= 30);
  }
}



//This action transforms the unit into a camp
function actionCreateVillage(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "village";
  this.new_unit_type = 'village';
  this.can_use_roads = true;
  //this.double_road_speed = true;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.hover_action = new actionGetFood( 1 );

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;

  //this.pop_action = 1/3;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 3;

  //this.free_pop_cost = 2;
  
  this.description = "Collect resources";
  this.extra_description = "Collect resources in a small circle";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.onLand(target) && !world.unitAtLocation(target);
  }

  this.activation = function(world, actor, position) {
    return (world.bonusEnabled('can-create-villages'));
  }
  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 2;
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

  this.also_build_road = false;
  this.also_build_road_backwards = true;
  this.hover_radius = 3;

  this.hover_action = new actionGetResource(3,true);

  this.cloud_clear = 6;

  this.collect_resource = true;
  this.destroy_resource = true;

  //this.total_pop_cost = 1;
  this.free_pop_cost = 1;

  this.description = "Expand city";
  this.extra_description = "Grow the city into new lands";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.onLand(target) && world.noCitiesInArea(target,5,position) && 
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

    actor.split++;
    actor.addPop( -Math.floor(actor.getPop()/actor.split)  );
    actor.moveActionToTop(this);

    world.units.set(target, actor);
    //world.destroyUnit(position);
    //world.addUnit(position, 'colony', actor);
    


  }



}








//This action transforms the unit into a camp
function actionCreateExpeditionCenter() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "expedition-center";
  this.new_unit_type = 'expedition-center';

  this.nextSelection = "target";
  this.min_distance = 1;
  this.max_distance = 1;
  this.hover_radius = 0;

  this.free_pop_cost = 4;

  this.cloud_clear = 5;

  this.destroy_resource = true;
  

  this.description = "Expedition Center";
  this.extra_description = "Explore the area 10 tiles away.<br>Can create cities further away.";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && !world.noCitiesInArea(target,1);
  }
  this.activation = function(world, actor, position) {
    return !world.countUnits(Hex.circle(position, 1), 'expedition-center', 1) && world.bonusEnabled('expedition-centers');
  }
  this.requirement = function(world, actor, position) {
    return world.getPopulation() >= 8;
  }
}















//This action transforms the unit into a camp
function actionCreateHarbor() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "harbor";
  this.new_unit_type = 'harbor';

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = 3;
  this.hover_radius = 0;

  this.cloud_clear = 5;

  this.destroy_resource = true;
  

  this.free_pop_cost = 2;

  this.description = "Harbor";
  this.extra_description = "Explore and settle the sea.";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.nearCoast(target);
  }
  this.activation = function(world, actor, position) {

    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1);
  }
  this.requirement = function(world, actor, position) {
    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1) &&  world.getPopulation() >= 4;
  }
}







//This action transforms the unit into a camp
function actionCreateLighthouse(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "lighthouse";
  this.new_unit_type = 'lighthouse';

  this.hover_action = new actionGetShallowFish( 4 );

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = distance;
  this.hover_radius = 0;

  this.cloud_clear = 5;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.free_pop_cost = 2;

  this.can_use_roads = false;

  this.description = "Water den";
  this.extra_description = "Gather resources in shallow water";

  this.targetFilterFunction = function(world, actor, position, target) {
    //coastal land tile
    if (!world.unitAtLocation(target) && world.onLand(target) && world.nearCoast(target))
      return true

    //river tiles
    if (world.onRiver(target) && !world.unitAtLocation(target))
      return true;

    return false;
  }

  this.activation = function(world, actor, position) {
    return (world.bonusEnabled('can-create-waterdens'));
  }

}










//This action transforms the unit into a camp
function actionGetResource(max_distance, multi_target) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.stop_elevation_down = 1;
  this.stop_on_rivers = true;
  this.can_river = true;

  this.name = "get";
  this.min_distance = 0;
  this.max_distance = max_distance;
  this.hover_radius = 0;

  this.cloud_clear = 0;
  this.multi_target = multi_target;

  this.new_unit_type = 'colony';

  this.free_pop_cost = -1;
  this.total_pop_cost = -1;
  this.takes_city_pop = true;

  this.collect_resource = false; //should be true but 'takes city pop' relies on free_pop_cost
  this.destroy_resource = false;

  this.description = "Collect resources";
  this.extra_description = "Get all resources up to "+this.max_distance+" tiles away.<br>City can no longer move.";

  this.targetFilterFunction = function(world, actor, position, target) {


    return (
           //dry land food tiles within 3 tiles of the city or...
           (
            world.onLand(target) && 
           !world.onRiver(target) &&
           !world.unitAtLocation(target) && 
           world.countResources(Hex.circle(target, 0), 'food', 1)
           ) 
           ||
           //...or shallow water fish besides the city tile
           (
            world.getTile(target).elevation == 1 &&
           !world.unitAtLocation(target) &&
           world.countResources(Hex.circle(target, 0), 'food', 1) &&
           (Hex.areNeighbors(position, target))
            )
           ||
           //...or river fish besides the city tile
           (
            world.onRiver(target) &&
           !world.unitAtLocation(target) &&
           world.countResources(Hex.circle(target, 0), 'food', 1) &&
           (Hex.areNeighbors(position, target))
           )
           );
  }


  this.effect = function(world, actor, position, target) {
    //actor.can_move = false;
    //actor.addPop(1);

  }
}









function actionGetShallowFish(max_distance) {
  Action.call(this);

  this.minimum_elevation = 1;

  this.name = "get-shallow-fish";
  this.min_distance = 0;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 1;


  this.rivers_and_coasts = true;
  this.continue_in_water = true;
  this.stop_on_rivers = false;

  this.also_build_road = true;

  this.collect_resource = false; //should be true but 'takes city pop' relies on free_pop_cost
  this.destroy_resource = false;

  this.free_pop_cost = -1;
  this.total_pop_cost = -1;
  this.takes_city_pop = true;

  this.multi_target = true;
  this.new_unit_type = 'colony';



  this.description = "Harvest shallow waters";
  this.extra_description = "Get all the fish resources in water range";

  this.targetFilterFunction = function(world, actor, position, target) {
    if (world.unitAtLocation(target)) 
      return false;

    if (!world.countResources(Hex.circle(target, 0), 'food', 1))
      return false;

    if (world.onRiver(target) ) 
      return true;

    if (world.onWater(target))
      return true;
  }


  this.effect = function(world,actor,position,target) {
    //actor.addPop(1);
  }
}









function actionGetFood(max_distance) {
  Action.call(this);

  this.minimum_elevation = 1;

  this.name = "get-food";
  this.min_distance = 0;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 2;

  this.can_river = true;
  this.stop_on_rivers = true;
  this.two_max_distances = true;

  //this.rivers_and_coasts = true;

  this.also_build_road = true;

  this.collect_resource = false; //should be true but 'takes city pop' relies on free_pop_cost
  this.destroy_resource = false;

  this.free_pop_cost = -1;
  this.total_pop_cost = -1;
  this.takes_city_pop = true;

  this.multi_target = true;
  this.new_unit_type = 'colony';



  this.description = "Weird village action";
  this.extra_description = "Get all the food";

  this.targetFilterFunction = function(world, actor, position, target) {
    if (world.unitAtLocation(target)) 
      return false;

    if (!world.countResources(Hex.circle(target, 0), 'food', 1))
      return false;

    /*if (world.onRiver(target)) 
      return true;

    if (!world.onLand(target))
      return true;*/
    return true;
  }


  this.effect = function(world,actor,position,target) {
    //actor.addPop(1);
  }
}



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
    return world.isUpstreamOf(target, position) /*&& Hex.equals(world.getTile(target).river.downstream_hex, position)*/;
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
      
      //floor the tile
      tile.elevation = 1;     
      world.removeRoads(target);   
      if (!world.noUnitTypeInArea(target, 0, 'colony')) {
        world.getUnit(target).addPop(-1);
        world.resources_collected -= 1;
        world.resources_available -= 1;
        world.destroyResource(target);
        world.destroyUnit(target);
      }
      if (Math.random() <= 0.2)
        world.addResource(target, 'fish');


    } else {
      tile.elevation = 3+Math.floor(5*Math.random());
    }





  }
}






















