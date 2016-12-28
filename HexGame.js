/* MAIN GAME FILE */




//////////////////////////////////////// CREATING THE WORLD ///////////////////////////////////////////////

			//define the screen which can be drawn on
			var canvas = document.getElementById('mycanvas');

			//an interface for drawing on the canvas
			var canv_draw = new CanvasDraw(canvas);
			var canv_input = new CanvasInput(canvas);

			//create a world
			var map_radius = 50;
			var world_layout = new HexLayout(orientation_pointy,new Point(35,35),new Point(canvas.width,canvas.height));
			var world = new World(map_radius,world_layout);

			//create a default view, which can be edited
			var view_ratio = canvas.width/canvas.height;
			var initial_zoom = 1/4;
			var view_out = new Rect(new Point(0,0),
																        new Point(canvas.width,canvas.height));
			var view_in = new Rect(	new Point(-canvas.width*initial_zoom,	-initial_zoom*canvas.height),
															new Point(canvas.width*initial_zoom*view_ratio,	initial_zoom*canvas.height*view_ratio));
			var view = new View(view_in,view_out);



			//create a controller and renderer for the world
			var world_interface = new WorldInterface(world,view);
			var world_renderer = new WorldRenderer(canv_draw,view,world);

			canv_input.windowResize();
			
			//create a unit in the world
			world.createUnit(new Hex(0,0),'player');
			world.createUnit(new Hex(1,0),'tree');
			world.createUnit(new Hex(15,-15),'fast-player');
			world.createUnit(new Hex(15,0),'fast-player');
			world.createUnit(new Hex(0,-15),'fast-player');
			world.createUnit(new Hex(-15,-15),'fast-player');
			world.createUnit(new Hex(-15,15),'fast-player');
			world.createUnit(new Hex(-15,0),'fast-player');
			world.createUnit(new Hex(1,0),'tree');




			////////////////////////////////////////// DRAWING TO THE CANVAS ///////////////////////////////////

			function drawScreen() {

				//draw the world
				world_renderer.drawWorld();		

				//draw range of selected unit
				if (world_interface.hex_selected instanceof Hex) {
					var potentialUnit = world_interface.world.units.getValue(world_interface.hex_selected);
					if (potentialUnit instanceof Unit && potentialUnit.hasComponent('range')) {
						world_renderer.drawRange(potentialUnit.getComponent('range'));
						//world_renderer.drawPath(potentialUnit.components.range,world_interface.hex_hovered);
					}

					//draw selection hex
					world_renderer.drawHex(world_interface.hex_selected, 2, "rgba(200,200,0,0.5)");
				}

				//draw hovered hex
				world_renderer.drawHex(world_interface.hex_hovered, 0, "rgba(200,200,200,0.4)",'rgba(0,0,0,0)' );
			}

			
			///////////////////////////////////////// CHANGING THE WORLD //////////////////////////////////////////
			function newWorld() {
				world.generateWorldMap(map_radius);
				drawScreen();
			}

			////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////

			//add click, mouse, and touch functionality to canvas//
			canvas.addEventListener('click', function() {canv_input.clickCanvas(event);}, false);
			canvas.addEventListener('mousemove', function() {canv_input.mouseMove(event);}, false);
			canvas.addEventListener('touchmove', function() {canv_input.touchMove(event);}, false);
			canvas.addEventListener('touchend', function() {canv_input.touchEnd(event);}, false);
			canvas.addEventListener('touchstart', function() {canv_input.touchStart(event);}, false);
			if (canvas.addEventListener) {
				// IE9, Chrome, Safari, Opera
				canvas.addEventListener("mousewheel", function(){canv_input.mouseWheel(event);}, false);
				// Firefox
				canvas.addEventListener("DOMMouseScroll", function(){canv_input.mouseWheel(event);}, false);
			}

			//add window resize event
			window.addEventListener('resize',function() {canv_input.windowResize();}, false);