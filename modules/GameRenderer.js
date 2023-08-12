
import View from './u/View.js'
import Renderer from './u/Renderer.js';
import WorldRenderer from './WorldRenderer.js';
import HUDRenderer from './HUDRenderer.js';
import Events from './u/Events.js';



export default function GameRenderer(world, game_input, renderer) {

  let earth_layer = new LayerRenderer('earth_canvas', world);
  let thing_layer = new LayerRenderer('thing_canvas', world);
  let hud_renderer = new HUDRenderer(world, game_input, renderer);

  function clear() {
    earth_layer.clear();
    thing_layer.clear();
  }

  function updateLayers() {
    earth_layer.drawEarth();
    thing_layer.drawThings();
  }

  function draw() {

    //clear the real canvas
    renderer.clear();

    //copy the temporary canvas to the real canvas
    renderer.blitCanvas(earth_canvas);
    renderer.blitCanvas(thing_canvas);

    //draw the HUD on top
    hud_renderer.drawHUD();

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

  var temp_canvas = document.getElementById(canvas_name);
  temp_canvas.width = 1.7*2*35*35;
  temp_canvas.height = 1.7*2*35*35;

  var full_view = new View(canvas_name);
  full_view.setInput(-1.7*35*35, -1.7*35*35, 1.7*2*35*35, 1.7*2*35*35); //world coordinates
  full_view.setOutput(0, 0, temp_canvas.width, temp_canvas.height);  //canvas coordinates

  var renderer = new Renderer(canvas_name, full_view);

  this.world_renderer = new WorldRenderer(world, renderer); 
}

LayerRenderer.prototype.drawEarth = function() {
  this.world_renderer.drawTiles();
  this.world_renderer.drawRivers();
}

LayerRenderer.prototype.drawThings = function() {
  this.world_renderer.drawRoads();
  this.world_renderer.drawUnits();
  this.world_renderer.drawResources();
}

LayerRenderer.prototype.clear = function () {
  this.world_renderer.clear();
}

