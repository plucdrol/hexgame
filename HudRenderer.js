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

      if (potential_unit instanceof Unit && potential_unit.hasComponent('range')) {
        hex_renderer.drawHexes(potential_unit.range);

      }

      //draw line from selected unit to mouse position
      let action = unit_input.getActionSelected();
      if (action) {
        let action_step = action.stepCostFunction.bind(action);
        let action_neighbors = action.getNeighborsFunction.bind(action);

        let pathfinder = new PathFinder(action_step, action_neighbors );
        let path_hexes = pathfinder.getPath(world_input.world.world_map, hex_selected, hex_hovered);
        hex_renderer.drawLongLine(path_hexes, 5);
      }

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









  this.clearButtons = function() {
    document.getElementById('action-buttons').innerHTML = "";
  }
  this.writeMessage = function(message) {
    document.getElementById('city-resources').innerHTML = message;
  }
  this.writeResources = function(city) {
    var message = "Food:".concat(city.resources.food).concat("/").concat(city.capacity.food)
                   .concat(" Wood:").concat(city.resources.wood).concat("/").concat(city.capacity.wood)
                   .concat(" Stone:").concat(city.resources.stone).concat("/").concat(city.capacity.stone);
    this.writeMessage(message);
  }

  //starts an every-second screen update of city resources
  this.trackUnitResources = function() {
    
    //clearInterval(this.stop_city_interval_number);
    

    function update_function() { 
      let unit = unit_input.getUnitSelected();
      
      if (unit.resources) {
        this.writeResources(unit); 
        unit_input.updateActionButtons();
      } else {
        this.clearButtons();
        this.writeMessage("");
      }
    };
    this.stop_city_interval_number = setInterval(update_function.bind(this), 1000);
  }

  this.trackUnitResources();

}

