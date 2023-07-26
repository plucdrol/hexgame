


function actionExpand(distance) {
  Action.call(this);

  this.name = "city-by-land-2";

  this.nextSelection = 'self';//new_unit_if_exists';
  //this.new_unit_type = 'city';

  this.hover_action = new actionGrowRoots(1);



  this.can_river = true;
  this.stop_on_rivers = true;

  this.stay_on_rivers = false;
  this.can_leave_rivers_on_first_step = true;
  this.stop_on_river_exit=true;

  this.stop_on_coast = true;
  this.can_water = true;
  this.can_ocean = true;
  this.coastal_start = false;
  this.embark_at_cities = true;
  this.disembark_at_cities = true;

  this.slow_in_water = true;

  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = false;
  this.hover_radius = 3;

  this.destroy_resource = true;
  this.collect_resource = true;

  this.cloud_clear = 6;

  //this.free_pop_cost = 2;
  //this.takes_city_pop = false;

  this.also_build_road = true;

  this.can_use_roads = true;
  this.double_road_speed = false;
  this.double_highway_speed = true;

  this.description = "Expand";
  this.extra_description = "Create a new node far away.";

  this.targetFilterFunction = function(world, actor, target) {
    return true;//world.onLand(target);
  }

  this.preEffect = function(world, actor, position, target) {


    //grow city if clicking on it
    if (world.unitAtLocation(target) && world.getUnit(target).pop && world.getUnit(target).pop < 5) {

      actor.pop -= 2;
      world.getUnit(target).pop++;

      world.highlightRange(Hex.circle(target, world.getUnit(target).pop), 'green');

      //grow to connect more resources around city
      let grow_roots_action = new actionGrowRoots( world.getUnit(target).pop );
      grow_roots_action.triggerMultiAction( world, actor, target) 
    }

    //grow road and build a city if clicking somewhere else
    if (!world.unitAtLocation(target)) {

      actor.pop -= 2;

      //builds a city if clicking on rivers or on a road
      world.highlightRange(Hex.circle(target, 1), 'green');
      world.addUnit(target, 'city', actor);

      //automatically connect resources around new city
      let grow_roots_action = new actionGrowRoots( 1 );
      grow_roots_action.triggerMultiAction( world, actor, target) 

      //create highway to new city     
      this.createRoad(world, position, target, 2);

    }

    //add a village if clicling directly on a resource
    if (world.getResource(target) && !world.getResource(target).resources['unknown'])
      world.addUnit(target, 'village', actor);

  }

  this.effect = function(world, actor, position, target) {


  }
}





function actionGrowRoots(max_distance) {
  Action.call(this);

  this.name = "get-food";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 2;

  this.can_water = true;
  this.can_ocean = false;
  this.can_river = true;
  this.stop_on_rivers = true;
  this.no_climbing_ashore = true;
  this.coastal_start = true;

  this.also_build_road = true;
  this.can_use_roads = false;
  this.double_road_speed = false;

  this.collect_resource = false; //should be true but 'takes city pop' relies on free_pop_cost
  this.destroy_resource = true;

  //this.free_pop_cost = -1;
  //this.total_pop_cost = -1;
  //this.takes_city_pop = true;

  this.multi_target = true;
  //this.new_unit_type = 'colony';



  this.description = "Claim resources";
  this.extra_description = "Get all the food";

  this.targetFilterFunction = function(world, actor, target) {
    if (world.unitAtLocation(target)) 
      return false;

    //if (world.countRoads(target) >= 1)
      //return false;

    if (!world.countResources(Hex.circle(target, 0), 'food', 1))
      return false;

    return true;
  }


  this.effect = function(world,actor,position,target) {
    actor.addPop(1);
    this.createRoad(world, position, target);
    world.addUnit(target, 'village', actor);
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
  this.stop_on_rivers = false;

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
  this.double_road_speed = true;

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
  this.double_road_speed = false;

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
}*/

function cutRiver(world, position) {
  let tile = world.getTile(position);
  let step_time = 300;

  if (world.onRiver(position)) {
    var water_level = tile.river.water_level;
    stepByStepCutRiver();
  }

  

  function stepByStepCutRiver() {   
    
    tile.river.water_level -= Math.floor(2*water_level/3);
    tile = world.getTile(tile.river.downstream_hex);

    if (tile.river.downstream_hex)
      setTimeout(stepByStepCutRiver, step_time);

  }
}




/*
function hydroDam = function(world, target) {
    

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
*/



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



















