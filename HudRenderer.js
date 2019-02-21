function HUDRenderer(world_input, hex_renderer) {

  this.stop_city_interval_number = 0;
  var unit_input = world_input.unit_input;

  this.drawHUD = function() {

    var hover_style = new RenderStyle();
    var hex_hovered = world_input.hex_hovered;
    var hex_selected = unit_input.hex_selected;

    //selection draw
    if (hex_selected instanceof Hex) {
    
      //draw range of selected unit  
      var potential_unit = unit_input.units.get(hex_selected);

      if (potential_unit instanceof Unit && potential_unit.range) {
        hex_renderer.drawHexes(potential_unit.range);

      }

      //draw line from selected unit to mouse position
      /*let action = unit_input.getActionSelected();
      if (action) {
        let action_step = action.stepCostFunction.bind(action);
        let action_neighbors = action.getNeighborsFunction.bind(action);

        let pathfinder = new PathFinder(action_step, action_neighbors );
        let path_hexes = pathfinder.getPath(world_input.world.world_map, hex_selected, hex_hovered);
        hex_renderer.drawLongLine(path_hexes, 5);
      }*/

      //draw selection hex
      var select_style = new RenderStyle();
      select_style.fill_color = "rgba(200,200,0,0.5)";
      select_style.line_width = 2;
      hex_renderer.drawHex(hex_selected, select_style);
    }

    //draw hovered hex
    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;
    hex_renderer.drawHex( hex_hovered, hover_style );
  }



  this.makeActionButton = function(unit, action) {
    return "<label><input class='action-button-input' name='actions' type='radio'"
            .concat(" id='action-").concat(action.name)
            .concat("' value='").concat(action.name).concat("'><div class='action-button'>")
            .concat(action.name).concat("<br/>")
            .concat(action.displayCost(unit)).concat("</div></label></input>");
  }

  this.updateActionButtons = function() {

    //do nothing if there is no unit to update
    let unit = unit_input.getUnitSelected();
    if (!unit) return;

    //remember previous action
    var current_action = unit_input.getActionSelectedId();

    //update the action list
    var action_buttons = document.getElementById('action-buttons');
    action_buttons.innerHTML = "";
    for (let action of unit.actions) {
      
      //only show actions whose activation is met
      if (action.activation(unit)) {
        let new_button = this.makeActionButton(unit, action);
        action_buttons.innerHTML += new_button;
        
        //Show actions in grey if their requirements are not met
        if (!action.requirement(unit)) {
          document.getElementById("action-".concat(action.name)).disabled = true;
        }
      }
    }

    //add the click-detection code
    for (let button of document.getElementsByClassName('action-button-input')) {
      button.addEventListener('click', function(){ unit_input.updateActionRange(); });
    }

    //reset the action to the previously selected action
    if (current_action) {
      unit_input.selectActionById(current_action);
    }
  }

  this.clearButtons = function() {
    document.getElementById('action-buttons').innerHTML = "";
  }
  this.writeMessage = function(message, element) {
    if (!element) 
      var element = 'city-resources';
    document.getElementById(element).innerHTML = message;
  }
  this.writeResources = function(city) {
    var message = "Food:".concat(city.resources.food)
                   .concat(" Wood:").concat(city.resources.wood)
                   .concat(" Stone:").concat(city.resources.stone);
    this.writeMessage(message);
  }

  //starts an every-second screen update of city resources
  this.trackUnitResources = function() {
    
    //clearInterval(this.stop_city_interval_number);
    

    function update_function() { 
      let unit = unit_input.getUnitSelected();
      let pop = Math.floor(world.total_population);
      this.writeMessage("World population: ".concat(pop), 'world-resources');

      if (unit.resources) {
        this.writeResources(unit); 
        this.updateActionButtons();
      } else {
        this.clearButtons();
        this.writeMessage("", 'city-resources');
      }
    };
    this.stop_city_interval_number = setInterval(update_function.bind(this), 1000);
  }

  //start tracking
  this.trackUnitResources();

}

