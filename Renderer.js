



/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                        BASIC RENDERING FUNCTIONS
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


//this is a basic Renderer, it doesn't know about hexes! only points

function Renderer(canvas_draw,view) {
    this.canvas_draw = canvas_draw;
    this.view = view;
}


    //PURE functions, use the CANVAS INTERFACE directly to draw on the screen

    Renderer.prototype.drawDot = function (point,size,color) {


        //this function draws directly, so modifies the coordinates
        var coord = this.view.worldToScreen(point);
        size = this.view.worldToScreen1D(size);

        this.canvas_draw.drawDot(coord,size,color);
    };

    //Draw multiple dots
    Renderer.prototype.drawDots = function(points,size,color) {
        for (let point of points) {
            this.drawDot(point,size,color);
        }
    }

    Renderer.prototype.drawLine = function(point1,point2,line_width,color) {

        //this function draws directly, so modifies the coordinates
        var p1 = this.view.worldToScreen(point1);
        var p2 = this.view.worldToScreen(point2);
        var newwidth = this.view.worldToScreen1D(line_width);

        this.canvas_draw.drawLine(p1,p2,newwidth,color)
    };

    Renderer.prototype.drawPolygon = function(points,line_width,fill_color,line_color) {
        
        //this function draws directly, so modifies the coordinates
        var coords = []; //creates an array or an object (vim test)
        
        //otherwise actually draw a polygon
        for (let point of points) {
            coords.push(this.view.worldToScreen(point));
        }

        this.canvas_draw.drawPolygon(coords,line_width,fill_color,line_color);

    };

    Renderer.prototype.drawText = function(text,position,shade,fontsize) {
        
        //this function draws directly, so modifies the coordinates
        var coord = this.view.worldToScreen(position);
        var newfontsize = this.view.worldToScreen1D(fontsize);

        this.canvas_draw.drawText(text,coord,shade,newfontsize);
    };

    //INDIRECT functions, use the previously defined functions to draw more complicated things

    Renderer.prototype.drawLines = function(points,width) {
        for (var i=0;i<points.length-1;i++) {
            this.drawLine(points[i], points[i+1], width);
        }
    };

    Renderer.prototype.doneRendering = function() {
        window.clearTimeout(this.render_timer);
        this.keep_rendering = true;
       

    };

    Renderer.prototype.stopRendering = function() {
        this.keep_rendering = false;
    };

    Renderer.prototype.startRendering = function(maximum_rendering_time_in_milliseconds) {
        this.keep_rendering = true;
        this.render_timer = window.setTimeout(this.stopRendering, maximum_rendering_time_in_milliseconds);
    };













/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                          WORLD RENDERER
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


var greenscale_colors = function(i) {
    var greenscale = ['#005','#00D','#AA3','#080','#062','#052','#042','#032','#020','#010','#110500','#210','#410','#420','#777','#777','#777','#888','#888','#888','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF'];
    var faded_greenscale = ['#335','#66D','#AA7','#686','#575','#464','#353','#242','#232','#232','#110','#321','#421','#432','#777','#777','#777','#888','#888','#888','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF'];
    return greenscale[i];
    
}


function WorldRenderer (canvas_draw,view,world) {
    Renderer.call(this,canvas_draw,view); 
    this.world = world;
    this.corners = [];

    this.drawn_at_least_one_hex = false;
}

    WorldRenderer.prototype = Object.create(Renderer.prototype);

    WorldRenderer.prototype.mapColors = function(i) {
        return greenscale_colors(i);  
    } 

    WorldRenderer.prototype.drawHex = function(hex,line_width,fill_color,line_color) {

        //if zoomed out enough, just draw a dot
        if (this.view.getScale() < 1) {
            var point = this.world.layout.hexToPoint(hex);
            this.drawDot(point,61,fill_color);
        } else {
            //otherwise, draw the actual hex
            var corners = this.world.layout.hexesToPoints(Hex.corners(hex));
            this.drawPolygon(corners,line_width,fill_color);
        }
        this.drawn_at_least_one_hex = true;
    };

    WorldRenderer.prototype.fastDrawHex = function(hex,fill_color) {

            //console.log('fat');
            //calculate shifted position between previous hex and next hex
            var world_position = this.world.layout.hexToPoint(hex);
            var screen_position = this.view.worldToScreen(world_position);


            //draw a polygon
            this.canvas_draw.reDrawPolygon(screen_position/*,fill_color*/);
    }

    WorldRenderer.prototype.drawHexElevated = function(hex,height,line_width,color_sides,color_top) {
        var low_corners = this.world.layout.hexesToPoints(Hex.corners(hex));
        var high_corners = [];
        for (var i=0;i<low_corners.length;i++) {
            high_corners[i] = new Point(low_corners[i].x,low_corners[i].y - height);
        }

        var column_corners = [low_corners[0],high_corners[1],high_corners[2],high_corners[3],low_corners[4],low_corners[5]];


        //this.drawPolygon(low_corners,line_width,color_sides);
        this.drawPolygon(column_corners,line_width,color_sides);
        this.drawHex(high_corners,line_width,color_top);

    };

    WorldRenderer.prototype.drawHexes = function(hexes,line_width,color) {
        for (var i=0;i<hexes.length;i++) {
            this.drawHex(hexes[i], line_width,color)
        }
    };

    WorldRenderer.prototype.drawOutline = function(edge_arrays,line_width,fill_color,line_color) {
        for (var outline = 0; outline < edge_arrays.length; outline++) {
            var corners = [];
            var edges = edge_arrays[outline];    
            for (var i=0;i<edges.length;i++){
                corners.push( this.world.layout.hexToPoint(edges[i].getPoint1() ));
            }
            this.drawPolygon(corners,line_width,fill_color,line_color);
            //this.drawDots(corners,10,fill_color);
        }
    };



    WorldRenderer.prototype.drawRectangleSection = function(qmin,qmax,rmin,rmax) {
        
        var currentr = 0;
        var r = 0;
        var q = 0;
        var hex = new Hex(0,0);


        //for columns
        for (r = rmin; r <= rmax; r++) {

            //shift even lines
            currentr = r;
            if (r%2!=0) currentr += 1;

            this.drawRectangleSectionLine(r,currentr,qmin,qmax,rmin,rmax);
            
        }
    }

    WorldRenderer.prototype.drawRectangleSectionLine = function(r,currentr,qmin,qmax,rmin,rmax) {
       
        var q=0;

        //for rows ( each shifted to become rectangular)
        for (q = Math.floor(qmin+(rmax-currentr)/2); q<qmax+(rmax-currentr)/2; q++) {
            hex = new Hex(q,r);
            if (this.world.map.containsHex(hex)) {

                this.drawTile2D(hex);
                
            }
        }
    }

    WorldRenderer.prototype.drawRedRenderingRectangle = function(qmin,qmax,rmin,rmax) {
        var corners = [];
        corners.push(this.world.layout.hexToPoint(new Hex(qmin,rmin)));
        corners.push(this.world.layout.hexToPoint(new Hex(qmin,rmax)));
        corners.push(this.world.layout.hexToPoint(new Hex(qmax,rmax)));
        corners.push(this.world.layout.hexToPoint(new Hex(qmax,rmin)));

        this.drawPolygon(corners,20,'transparent','red');
    }    

    WorldRenderer.prototype.drawWorld = function() {

        this.startRendering(1); //in milliseconds

        this.drawn_at_least_one_hex = false;
        var rectMap = this.view.getHexRectangleBoundaries(this.world.layout);
        this.drawRectangleSection(rectMap[0],rectMap[1],rectMap[2],rectMap[3]);
        this.drawn_at_least_one_hex = false;


        this.doneRendering();
    }


    WorldRenderer.prototype.drawTile2D = function(hex) {
        
        //analyze tile
        var height = Math.floor(this.world.map.getValue(hex));
        color = this.mapColors(height);

        //draw ground
        if (this.drawn_at_least_one_hex === true) {
            //this.fastDrawHex(hex,color);
            this.drawHex(hex,0,color);
        } else {
            this.drawHex(hex,0,color);
        }
        

        //draw units
        var this_unit = this.world.units.getValue(hex);
        if (typeof this_unit == 'object') {

            //this.drawUnit(this_unit,hex,0);

        }
    }

    WorldRenderer.prototype.drawTile3D = function(hex) {
        
        //analyze tile
        var color = Math.floor(this.world.map.getValue(hex));
        color = this.mapColors(color);
        var height = this.world.map.getValue(hex)*6;

        //draw ground
        if (this.world.map.getValue(hex) > 1) {
            this.drawHexElevated(hex,height,0,'#310',color);
        } else {
            this.drawHex(hex,0,color);
        }

        //draw unit
        //var this_unit = this.world.unitAtPosition(hex);
        //if (typeof this_unit == 'object') {

            //this.drawUnit(this_unit,hex,height);

        //}
    }

    WorldRenderer.prototype.drawTileSemi3D = function(hex) {
        
        //this code only works in POINTY_TOP layout


        //analyze tile
        var height = this.world.map.getValue(hex);
        var color = Math.floor(height);
        color = this.mapColors(color);
        this.drawHex(hex,0,color);
        //draw ground
        //
        var shade  = Math.floor(255-255*height/20);
        color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
        //this.drawHex(hex,0,color);

        //draw walls
        var wall_color = '#310';
        var wall_height = 6;
        
        //analyze neighbors
        var n_left = Hex.neighbor(hex,3);
        var n_upleft = Hex.neighbor(hex,2);
        var n_upright = Hex.neighbor(hex,1);

        //get height of neighbors
        var n_left_height = this.world.map.getValue(n_left);
        var n_upleft_height = this.world.map.getValue(n_upleft);
        var n_upright_height = this.world.map.getValue(n_upright);

        var corners = this.world.layout.Hex.corners(hex);
        //draw wall of the left if the heights are different
        if (n_left_height != height) {
           // wall_height = wall_height/2;
           // this.drawLine(corners[3],corners[4],wall_height,wall_color);
        }
        //draw wall on the top-left if that tile is higher
        if (n_upleft_height > height) {
            wall_height = 1.5*(n_upleft_height-height);
            this.drawLine(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
        }
        //draw wall on the top-right if that tile is higher
        if (n_upright_height > height) {
            wall_height = 1.5*(n_upright_height-height);
            this.drawLine(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
        }

        //draw unit
        var this_unit = this.world.unitAtPosition(hex);
        if (typeof this_unit == 'object') {

            this.drawUnit(this_unit,hex,0);

        }
    }


    WorldRenderer.prototype.drawUnit = function(unit,hex,height) {

        var position = this.world.layout.hexToPoint(hex);
        position = position.offset(0,-height);
        
        this.drawDot(position,10*unit.size,unit.color);
        if (unit.population != undefined) {
            this.drawText(unit.population,position,'black',25);

        }
    };

    WorldRenderer.prototype.drawRange = function(range) {
        
        var outline = Hex.outline(range.getArray());
        //var pathfinder = new PathFinder(map);
        //this.drawPath(view,pathfinder,destination);

        //draw the outline of the range
        this.drawOutline( outline ,3,"rgba(255,255,150, 0.2)","rgba(255,255,100,1)");
        
        //draw the range background color
        for (let this_hex of range.getArray()) {
            if (range.containsHex( this_hex )) {
                //var value = range.getValue(this_hex)[0]*200/10;
                //this.drawHex(thishex,0,"rgba(0,"+value+","+value+", 0.2)");
                //view.drawHexElevated(thishex, 3*this.range.getValue(thishex)[2], 0, "rgba("+value+","+value+","+value+", 0)", "rgba("+value+","+value+","+value+", 0.5)" );

                
            }
        }
    }

    WorldRenderer.prototype.drawPath = function(range,destination) {
        
        var pathfinder = new PathFinder(this.world.map);

        //draw the path
        if (range.containsHex(destination)) {
            this.drawHex(destination,1,"rgba(200, 255, 200, 0.5)");
            
            //calculate points of the hexes
            var hexes = pathfinder.path(range,destination);
            var points = [];
            for (var i = 0; i<hexes.length;i++) {
                points.push(this.world.layout.hexToPoint(hexes[i]));
            }
            //view.draw_multi_line(points,3);

            //draw on screen
            this.drawLines(points,3);
            
        }
    }


