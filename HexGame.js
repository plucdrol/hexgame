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
function createWorldLayer(radius, scale, color_scheme) {
  var world_radius = radius;
  var hexmap_generator = new MapGenerator('perlin'); 
  var map = hexmap_generator.makeMap(world_radius);

  //create a world
  var world = new World(world_radius);
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
  if (color_scheme == 'space') {
    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller, 'space');  
  } else {
    var world_renderer = new WorldRenderer(canv_draw, view, world, unit_controller);
  }

  var layer_interface = {
    world_interface: world_interface,
    unit_controller: unit_controller,
    world_renderer: world_renderer
  }

  return layer_interface;
}
var galaxy_layer_interface = createWorldLayer(40, 1/8064, 'space');
var space_layer_interface = createWorldLayer(25, 1/128, 'space');
var world_layer_interface = createWorldLayer(35, 1/2);

//create a unit in the world
world_layer_interface.unit_controller.createUnit(new Hex(0,0),'planet');
world_layer_interface.unit_controller.createUnit(new Hex(1,0),'tree');
world_layer_interface.unit_controller.createUnit(new Hex(25,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(25,0),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(0,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-25,-25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-25,25),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(-15,0),'water-player');
world_layer_interface.unit_controller.createUnit(new Hex(1,0),'tree');


canv_input.windowResize();
////////////////////////// DRAWING TO THE CANVAS //////////////////

//world_interface, world_renderer, unit_controller, 

function drawScreenBeforeInterfaces() {

  world_renderer.clear();
  //draw the galaxy
  galaxy_renderer.drawWorld();
  //draw the space
  if (space_renderer.view.getZoom() > 0.06) {
    space_renderer.drawWorld(); 
  }
  //draw the world
  if (world_renderer.view.getZoom() > 0.06) {
    world_renderer.drawWorld();    
  }


  //draw range of selected unit
  if (unit_controller.hex_selected instanceof Hex) {
    var potentialUnit = unit_controller.units.getValue(unit_controller.hex_selected);
    if (potentialUnit instanceof Unit && potentialUnit.hasComponent('range')) {
      //world_renderer.drawPath(potentialUnit.components.range,world_interface.hex_hovered);
      world_renderer.drawHexes(potentialUnit.getComponent('range'));
    }

    //draw selection hex
    var select_style = new RenderStyle();
    select_style.fill_color = "rgba(200,200,0,0.5)";
    select_style.line_width = 2;
    world_renderer.drawHex(unit_controller.hex_selected, select_style);
  }

  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  world_renderer.drawHex(world_interface.hex_hovered, hover_style );
}

function drawScreen() {

  world_layer_interface.world_renderer.clear();
  //draw the galaxy
  galaxy_layer_interface.world_renderer.drawWorld();
  //draw the space
  if (space_layer_interface.world_renderer.view.getZoom() > 0.06) {
    space_layer_interface.world_renderer.drawWorld(); 
  }
  //draw the world
  if (world_layer_interface.world_renderer.view.getZoom() > 0.06) {
    world_layer_interface.world_renderer.drawWorld();    
  }


  //draw range of selected unit
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
