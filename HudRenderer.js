function HUDRenderer() {

  this.renderHUD = function(current_layer) {

    console.log(current_layer);
    var world_interface = current_layer.world_interface;
    var renderer = current_layer.world_renderer;
    var controller = current_layer.unit_controller;
    var hex_selected = controller.hex_selected;
    var view = world_interface.view;
    var layout = world_interface.world.layout;
    console.log(renderer);
    var hex_renderer = new HexRenderer(renderer.hex_renderer.renderer.canvas_draw, view, layout);

    //selection draw
    if (hex_selected instanceof Hex) {
    
      //draw range of selected unit  
      var potential_unit = controller.units.getValue(hex_selected);

      if (potential_unit instanceof Unit && potential_unit.hasComponent('range')) {
        hex_renderer.drawHexes(potential_unit.getComponent('range'));
      }

      //draw selection hex
      var select_style = new RenderStyle();
      select_style.fill_color = "rgba(200,200,0,0.5)";
      select_style.line_width = 2;
      hex_renderer.drawHex(hex_selected, select_style);
    }

    //draw hovered hex
    var hover_style = new RenderStyle();
    var hex_hovered = world_interface.hex_hovered;
    console.log(hex_hovered);
    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;
    hex_renderer.drawHex( hex_hovered, hover_style );
  }

}

