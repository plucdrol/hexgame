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
    console.log('creating color world');
    var world_renderer = new WorldRenderer(canv_draw, world_interface, color_scheme);  
  } else {
    var world_renderer = new WorldRenderer(canv_draw, world_interface);
  }

  var layer = {
    world_interface: world_interface,
    unit_controller: unit_controller,
    world_renderer: world_renderer,
    scale: scale,
    hex_center_offset: center_hex,
    offset: offset
  }

  return layer;
}

var world_layer = createWorldLayer(20, new Hex(0,0), 1, 'earth'); 
var space_layer = createWorldLayer(20, new Hex(-3,-3), 1/64, 'space', world_layer);
var galaxy_layer = createWorldLayer(20, new Hex(5,5), 1/4096, 'galaxy', space_layer);
var hyperspace_layer = createWorldLayer(20, new Hex(0,0), 1/262144, 'earth', galaxy_layer);


function get_layer_offset(current_layer_scale, previous_layer_scale, previous_layer_center_hex_offset, previous_layer_offset, layout) {
  var scale_difference = current_layer_scale / previous_layer_scale;
  var test_hex = new Hex( -previous_layer_center_hex_offset.getQ()*scale_difference, 
                          -previous_layer_center_hex_offset.getR()*scale_difference );
  
  var layer_offset = layout.hexToPoint( test_hex );
  layer_offset.x -= previous_layer_offset.x;
  layer_offset.y -= previous_layer_offset.y;

  return layer_offset;
}


//create units in the world
world_layer.unit_controller.createUnit(new Hex(0,0),'planet');
world_layer.unit_controller.createUnit(new Hex(1,0),'tree');
world_layer.unit_controller.createUnit(new Hex(15,-15),'water-player');
world_layer.unit_controller.createUnit(new Hex(15,0),'water-player');
world_layer.unit_controller.createUnit(new Hex(0,-15),'water-player');
world_layer.unit_controller.createUnit(new Hex(-15,-15),'water-player');
world_layer.unit_controller.createUnit(new Hex(-15,15),'water-player');
world_layer.unit_controller.createUnit(new Hex(-15,0),'water-player');
world_layer.unit_controller.createUnit(new Hex(1,0),'tree');

//level below is always at 0,0 even if the map is shifted to the side
space_layer.unit_controller.createUnit(new Hex(0,0),'planet');
space_layer.unit_controller.createUnit(new Hex(3,3),'sun');

//Level below is always at 0,0  even if the map is shifted to the side
galaxy_layer.unit_controller.createUnit(new Hex(0,0),'sun');
galaxy_layer.unit_controller.createUnit(new Hex(-5,-5),'galactic-center');



canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

function drawScreen() {

  world_layer.world_renderer.clear();
  var layer_to_control = hyperspace_layer;

  //draw the universe
  hyperspace_layer.world_renderer.drawWorld();

  //draw the galaxy
  if (galaxy_layer.world_renderer.hex_renderer.renderer.view.getZoom() > 0.06) {
    galaxy_layer.world_renderer.drawWorld();
    layer_to_control = galaxy_layer;
  }
  //draw the space
  if (space_layer.world_renderer.hex_renderer.renderer.view.getZoom() > 0.06) {
    space_layer.world_renderer.drawWorld(); 
    layer_to_control = space_layer;
  }
  //draw the world
  if (world_layer.world_renderer.hex_renderer.renderer.view.getZoom() > 0.06) {
    world_layer.world_renderer.drawWorld();    
    layer_to_control = world_layer;
    
  }



  //draw mouse interactions
  var hud_renderer = new HUDRenderer();
  hud_renderer.renderHUD(layer_to_control);
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
