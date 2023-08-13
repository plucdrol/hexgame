
import View from './u/View.js'
import Renderer from './u/Renderer.js';
import WorldRenderer from './WorldRenderer.js';
import HUDRenderer from './HUDRenderer.js';
import Events from './u/Events.js';



export default function GameRenderer(world, system, game_input, view) {

  let renderer = new Renderer('canvas', view);

  let space_layer = new LayerRenderer('space_canvas', system);
  let earth_layer = new LayerRenderer('earth_canvas', world);
  let thing_layer = new LayerRenderer('thing_canvas', world);
  let hud_renderer = new HUDRenderer(world, game_input, renderer);

  function clear() {
    space_layer.clear();
    earth_layer.clear();
    thing_layer.clear();
  }

  function updateLayers() {

    //draw to 3 temporary canvases
    space_layer.drawThings();
    earth_layer.drawEarth();
    thing_layer.drawThings();
  }

  function draw() {

    //clear the real canvas
    renderer.clear();

    //copy the temporary canvas to the real canvas

    //replace this with 
    //renderer.blitCanvas(space_canvas);
    //renderer.blitCanvas(earth_canvas);
    //renderer.blitCanvas(thing_canvas);

    //blit the temporary canvases to the final canvas
    space_layer.blit('canvas',view);
    earth_layer.blit('canvas',view);
    thing_layer.blit('canvas',view);

    //draw the HUD on top
    hud_renderer.drawHUD();

    /* This used to decide which HUD to render 
    //draw the HUD on top
    if (view.getZoom() <= 0.08)
      space_hud_renderer.drawHUD();
    else
      hud_renderer.drawHUD();
     */

  }

  function loop(callback, time) {
    let then = new Date().getTime();

    function step() {

      let now = new Date().getTime();

      //if the required time hasnt elapsed yet, wait till next frame
      if (now-then < time) { 
       window.requestAnimationFrame(step);
       return;
      }

      callback();

      now = then = new Date().getTime();
      window.requestAnimationFrame(step);
    }
    step();
  }

  this.startDrawing = function() {
    loop(draw, 30);
    loop(updateLayers, 300);
  }


  Events.on('click', updateLayers);
  Events.on('canvas_resize', updateLayers);
  updateLayers();
}



















function LayerRenderer(canvas_name, world) {

  let tilesize = world.layout.size.x;
  let worldwidth = 4*tilesize*world.radius;
  let canvaswidth = 4*35*world.radius;

  //a canvas is created large enough to draw the whole world
  this.temp_canvas = document.getElementById(canvas_name);
  this.temp_canvas.width = canvaswidth;
  this.temp_canvas.height = canvaswidth;

  //a view is created to fit the world into that canvas
  this.full_view = new View(canvas_name);
  this.full_view.setInput(
    world.layout.origin.x-worldwidth/2, 
    world.layout.origin.y-worldwidth/2, 
    worldwidth, 
    worldwidth
    ); //world coordinates
  this.full_view.setOutput(0, 0, canvaswidth, canvaswidth);  //canvas coordinates

  //this temp world renderer draws the entire layer into a full-sized canvas
  //later on, it must blit a section of this canvas to the final canvas
  var renderer = new Renderer(canvas_name, this.full_view);
  this.world_renderer = new WorldRenderer(world, renderer); 
}


LayerRenderer.prototype.RendererFromTempCanvasToScreen = function(canvas_name, view) {
  let blitview = new View(canvas_name);
  
  //view.getPosition returns a position in the world, say 0,0
  //full_view.worldToScreen( view.getPosition) 

  blitview.setInput(
    this.full_view.worldToScreen( view.getPosition() ).x,
    this.full_view.worldToScreen( view.getPosition() ).y,
    this.full_view.worldToScreen1D( view.getInputSize().x ),
    this.full_view.worldToScreen1D( view.getInputSize().y ),
  );

  return new Renderer(canvas_name, blitview);
}

LayerRenderer.prototype.blit = function(canvas_name, view) {
  let renderer = this.RendererFromTempCanvasToScreen(canvas_name, view);
  renderer.blitCanvas(this.temp_canvas);
}

//draw onto the temp canvas
LayerRenderer.prototype.drawEarth = function() {
  this.world_renderer.drawTiles();
  this.world_renderer.drawRivers();
}

//draw onto the temp canvas
LayerRenderer.prototype.drawThings = function() {
  this.world_renderer.drawRoads();
  this.world_renderer.drawUnits();
  this.world_renderer.drawResources();
}


LayerRenderer.prototype.clear = function () {
  this.world_renderer.clear();
}

