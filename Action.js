

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
    this.preEffect = function(world, actor, position, target) {  }
  this.effect = function(world, actor, position, target) {  }

  this.getDescription = function() {    
    if (this.free_pop_cost && this.free_pop_cost > 0)
      return this.description+" <span style='float-right'>(-"+this.free_pop_cost+")</span>";
    else
      return this.description;  
  }

  this.getExtraDescription = function() {    return this.extra_description;  }






  /////////////////////////////////////////////////////////
                    // ACTION EFFECTS //
  /////////////////////////////////////////////////////////

  this.doAction = function(world, actor, position, target) {

    let pathfinder = new ActionPathfinder(this);
    let tree = pathfinder.getTree( world, position, this.max_distance);
    let range = this.range.concat();
      
    //Either do a single action or do the action on all targets
    if (this.multi_target) {

      //do actions in order from closest to furthest, with a preference for land tiles
      range.sort((a, b) => (world.onWater(a) && world.onLand(b)) ? 1 : -1);
      range.sort((a, b) => (tree.currentCell(a).path_cost > tree.currentCell(b).path_cost) ? 1 : -1);
      
      let action = this;
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
    world.highlightRange(this.range);

  };


  //Trigger the effects of the action
  this.doSingleAction = function(world, actor, position, target) {

    world.clearClouds(target, this.cloud_clear);

    this.preEffect(world, actor, position, target);

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
        actor.addPop(1);
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
      if (this.hover_action.range.length > 0)
        this.hover_action.doAction(world, actor, target )
    }


    if (this.collect_resource ) 
      if (world.hasResource(target)) 
        world.getUnit(position).addPop(1);

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

    //world.clearHighlights();
    this.range = this.getActionTargets(world, actor, position );
    //world.highlightRange(this.range);

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
      let pathfinder = new ActionPathfinder(this);

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

    let pathfinder = new ActionPathfinder(this);

    var max_distance = this.max_distance;
    if (extra_max_distance)
      max_distance = extra_max_distance;

    var min_distance = this.min_distance;
    var actionPath = pathfinder.getPath( world, position, target, max_distance );

    return actionPath;
  };



  this.createRoad = function(world, origin, target) {

    let pathfinder = new ActionPathfinder(this);
      
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




 














