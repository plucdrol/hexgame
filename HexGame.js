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

//Create a map generator
var map_radius = 35;
var hexmap_generator = new MapGenerator('perlin'); 
hexmap_generator.makeMap(map_radius);
var map = hexmap_generator.makeMap(map_radius);

//create a world
var world = new World(map_radius);
world.setMap(map);

//populate the world
var unit_controller = new UnitController(map);
  unit_controller.fillMap();

//create a default view, which can be edited
var view_ratio = canvas.width/canvas.height;
var initial_zoom = 1/4;
var view_out = new Rect(new Point(0,0), 
                        new Point(canvas.width,canvas.height));

var view_in = new Rect(  new Point(-canvas.width*initial_zoom,
                                   -initial_zoom*canvas.height),

                      new Point(canvas.width*initial_zoom*view_ratio,
      			          initial_zoom*canvas.height*view_ratio));

var view = new View(view_in,view_out);



//create a controller and renderer for the world
var world_interface = new WorldInterface(world,view,unit_controller);
var world_renderer = new WorldRenderer(canv_draw,view,world,unit_controller);


//create a unit in the world
unit_controller.createUnit(new Hex(0,0),'player');
unit_controller.createUnit(new Hex(1,0),'tree');
unit_controller.createUnit(new Hex(5,-5),'fast-player');
unit_controller.createUnit(new Hex(5,0),'fast-player');
unit_controller.createUnit(new Hex(0,-5),'fast-player');
unit_controller.createUnit(new Hex(-5,-5),'fast-player');
unit_controller.createUnit(new Hex(-5,5),'fast-player');
unit_controller.createUnit(new Hex(-15,0),'fast-player');
unit_controller.createUnit(new Hex(1,0),'tree');


canv_input.windowResize();
////////////////////////// DRAWING TO THE CANVAS //////////////////

function drawScreen() {

  //draw the world
  world_renderer.drawWorld();    

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


///////////////////////////////////////// CHANGING THE WORLD //////////////////////////////////////////
function newWorld() {
  
  var new_map =  hexmap_generator.makeMap(map_radius);
  //update the world map
  world.setMap(new_map);

  //update the units 
  unit_controller.newMap(new_map);
  unit_controller.fillMap();
  
  drawScreen();
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
