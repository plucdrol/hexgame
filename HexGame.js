/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE WORLD //////////////////////////////
//define the screen which can be drawn on
var canvas = document.getElementById('mycanvas');

//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(canvas);

//This function creates a world and attaches all the necessary controllers
//This doesn't seem like a very efficient way to do this
function createWorldLayer(radius, center_hex, scale, color_scheme, sublayer) {

  var hexmap_generator = new MapGenerator('perlin'); 
  var map = hexmap_generator.makeMap(radius, center_hex);


  var offset = new Point(0,0);
  //calculate offset due to sublayer
  if (sublayer != undefined) {
    offset = get_layer_offset(scale, 
                              sublayer.scale,     
                              sublayer.hex_center_offset, 
                              sublayer.offset,
                              sublayer.world_interface.world.layout
                              ); 
  }

  //create a world
  var world = new World(offset);
  world.setMap(map);

  //create a unit controller
  var unit_controller = new UnitController(map);
  if (color_scheme != 'space') {
    unit_controller.fillMap();
  }

  //create a view for the galaxy map
  var view = create_view( scale );

  //create a controller and renderer for the world
  var world_interface = new WorldInterface(world, view, unit_controller);
  if (color_scheme != undefined) {
    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller, color_scheme);  
  } else {
    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller);
  }

  var layer_interface = {
    world_interface: world_interface,
    unit_controller: unit_controller,
    world_renderer: world_renderer,
    scale: scale,
    hex_center_offset: center_hex,
    offset: offset
  }

  return layer_interface;
}

var world_layer_interface = createWorldLayer(20, new Hex(0,0), 1, 'earth'); 
var space_layer_interface = createWorldLayer(20, new Hex(-3,-3), 1/64, 'space', world_layer_interface);
var galaxy_layer_interface = createWorldLayer(20, new Hex(5,5), 1/4096, 'galaxy', space_layer_interface);
var hyperspace_layer_interface = createWorldLayer(20, new Hex(0,0), 1/262144, 'earth', galaxy_layer_interface);


function get_layer_offset(current_layer_scale, previous_layer_scale, previous_layer_center_hex_offset, previous_layer_offset, layout) {
  var scale_difference = current_layer_scale / previous_layer_scale;
  var test_hex = new Hex( -previous_layer_center_hex_offset.getQ()*scale_difference, 
                          -previous_layer_center_hex_offset.getR()*scale_difference );
  //console.log(layout);
  var layer_offset = layout.hexToPoint( test_hex );
  layer_offset.x -= previous_layer_offset.x;
  layer_offset.y -= previous_layer_offset.y;

  return layer_offset;
}


//create units in the world
world_layer_interface.unit_controller.createUnit(new Hex(0,0),'planet');
world_layer_interface.unit_controller.createUnit(new Hex(1,0),'tree');
world_layer_interface.unit_controller.createUnit(new Hex(25,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(25,0),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(0,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-25,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-25,25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-15,0),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(1,0),'tree');

//level below is always at 0,0 even if the map is shifted to the side
space_layer_interface.unit_controller.createUnit(new Hex(0,0),'planet');
space_layer_interface.unit_controller.createUnit(new Hex(3,3),'sun');

//Level below is always at 0,0  even if the map is shifted to the side
galaxy_layer_interface.unit_controller.createUnit(new Hex(0,0),'sun');
galaxy_layer_interface.unit_controller.createUnit(new Hex(-5,-5),'planet');



canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

function drawScreen() {

  world_layer_interface.world_renderer.clear();
  //draw the universe
  hyperspace_layer_interface.world_renderer.drawWorld();
  //draw the galaxy
  if (galaxy_layer_interface.world_renderer.view.getZoom() > 0.06) {
    galaxy_layer_interface.world_renderer.drawWorld();
  }
  //draw the space
  if (space_layer_interface.world_renderer.view.getZoom() > 0.06) {
    space_layer_interface.world_renderer.drawWorld(); 
  }
  //draw the world
  if (world_layer_interface.world_renderer.view.getZoom() > 0.06) {
    world_layer_interface.world_renderer.drawWorld();    
  }


  //draw range of selected unit (this should be somewhere else)
  if (world_layer_interface.unit_controller.hex_selected instanceof Hex) {
    var potentialUnit = world_layer_interface.unit_controller.units.getValue(world_layer_interface.unit_controller.hex_selected);
    if (potentialUnit instanceof Unit && potentialUnit.hasComponent('range')) {
      //world_renderer.drawPath(potentialUnit.components.range,world_interface.hex_hovered);
      world_layer_interface.world_renderer.drawHexes(potentialUnit.getComponent('range'));
    }

    //draw selection hex
    var select_style = new RenderStyle();
    select_style.fill_color = "rgba(200,200,0,0.5)";
    select_style.line_width = 2;
    world_layer_interface.world_renderer.drawHex(world_layer_interface.unit_controller.hex_selected, select_style);
  }

  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  world_layer_interface.world_renderer.drawHex(world_layer_interface.world_interface.hex_hovered, hover_style );
}

function clickingOnTheScreen() {
    //draw range of selected unit (this should be somewhere else)
  if (world_layer_interface.unit_controller.hex_selected instanceof Hex) {
    var potentialUnit = world_layer_interface.unit_controller.units.getValue(world_layer_interface.unit_controller.hex_selected);
    if (potentialUnit instanceof Unit && potentialUnit.hasComponent('range')) {
      //world_renderer.drawPath(potentialUnit.components.range,world_interface.hex_hovered);
      world_layer_interface.world_renderer.drawHexes(potentialUnit.getComponent('range'));
    }

    //draw selection hex
    var select_style = new RenderStyle();
    select_style.fill_color = "rgba(200,200,0,0.5)";
    select_style.line_width = 2;
    world_layer_interface.world_renderer.drawHex(world_layer_interface.unit_controller.hex_selected, select_style);
  }

  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  world_layer_interface.world_renderer.drawHex(world_layer_interface.world_interface.hex_hovered, hover_style );
}
////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
