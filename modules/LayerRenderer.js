
import View from './u/View.js'
import Renderer from './u/Renderer.js';
import HexRenderer from './HexRenderer.js';
import WorldRenderer from './WorldRenderer.js';


export default function LayerRenderer(canvas_name, world) {

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

