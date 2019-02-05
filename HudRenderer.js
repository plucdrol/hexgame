function HUDRenderer() {

  this.renderHUD = function(current_layer) {

    var world_input = current_layer.world_input;
    var world_renderer = current_layer.world_renderer;
    var controller = world_input.unit_controller;
    var hex_selected = controller.hex_selected;
    var city_selected = controller.city_selected;
    var view = world_input.view;
    var layout = world_input.world.getLayout();
    var hex_renderer = world_renderer.hex_renderer;

    //selection draw
    if (hex_selected instanceof Hex) {
    
      //draw range of selected unit  
      var potential_unit = controller.unitAtPosition(hex_selected);

      if (potential_unit instanceof Unit && potential_unit.hasComponent('range')) {
        hex_renderer.drawHexes(potential_unit.range);
      }

      //draw selection hex
      var select_style = new RenderStyle();
      select_style.fill_color = "rgba(200,200,0,0.5)";
      select_style.line_width = 2;
      hex_renderer.drawHex(hex_selected, select_style);
    }

    //draw hovered hex
    var hover_style = new RenderStyle();
    var hex_hovered = world_input.hex_hovered;

    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;
    hex_renderer.drawHex( hex_hovered, hover_style );
  }

}

