function HUDRenderer(game_input, hex_renderer) {

  this.drawHUD = function() {

    var unit_controller = game_input.unit_controller;
    var hex_selected = unit_controller.hex_selected;

    //selection draw
    if (hex_selected instanceof Hex) {
    
      //draw range of selected unit  
      var potential_unit = unit_controller.unitAtPosition(hex_selected);

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
    var hex_hovered = game_input.hex_hovered;

    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;
    hex_renderer.drawHex( hex_hovered, hover_style );
  }

}

