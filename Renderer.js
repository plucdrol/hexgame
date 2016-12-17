


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

function Renderer(canvas_interface,view) {
    this.canvas_interface = canvas_interface;
    this.view = view;
    this.drawn_at_least_one_polygon = false; //for some reason, until the renderer has drawn one real polygon, it sucks drawing dots
}


    //PURE functions, use the CANVAS INTERFACE directly to draw on the screen

    Renderer.prototype.draw_dot = function (point,size,color) {


        //this function draws directly, so modifies the coordinates
        var coord = this.view.world_to_screen(point);
        size = this.view.world_to_screen_1D(size);

        this.canvas_interface.draw_dot(coord,size,color);
    };

    //Draw multiple dots
    Renderer.prototype.draw_dots = function(points,size,color) {
        for (let point of points) {
            this.draw_dot(point,size,color);
        }
    }

    Renderer.prototype.draw_line = function(point1,point2,lineWidth,color) {

        //this function draws directly, so modifies the coordinates
        var p1 = this.view.world_to_screen(point1);
        var p2 = this.view.world_to_screen(point2);
        var newwidth = this.view.world_to_screen_1D(lineWidth);

        this.canvas_interface.draw_line(p1,p2,newwidth,color)
    };

    Renderer.prototype.draw_polygon = function(points,lineWidth,fillColor,lineColor) {
        
        //this function draws directly, so modifies the coordinates
        var coords = [];
        
        //if zoomed out enough, just draw a dot
        if (this.view.getScale() < 0.2 && this.drawn_at_least_one_polygon == true) {
            this.canvas_interface.draw_dot(this.view.world_to_screen(points[0]),60*this.view.getScale(),fillColor);
            //this.canvas_interface.draw_dot(this.view.world_to_screen(points[0]),12,fillColor);
        } else {
            //otherwise actually draw a polygon
            coords = this.view.world_to_screen_multi(points);

            this.canvas_interface.draw_polygon(coords,lineWidth,fillColor,lineColor);
            this.drawn_at_least_one_polygon = true;
        }

    };

    Renderer.prototype.draw_text = function(text,position,shade,fontsize) {
        
        //this function draws directly, so modifies the coordinates
        var coord = this.view.world_to_screen(position);
        //var newfontsize = this.view.world_to_screen_1D(fontsize);
        var newfontsize = fontsize;

        this.canvas_interface.draw_text(text,coord,shade,newfontsize);
    };

    //INDIRECT functions, use the previously defined functions to draw more complicated things

    Renderer.prototype.draw_line_multi = function(points,width) {
        for (var i=0;i<points.length-1;i++) {
            this.draw_line(points[i], points[i+1], width);
        }
    };

    //this function is deprecated because the basic Renderer doesn't need to know about Edges
    /*Renderer.prototype.draw_edges = function(edges,width) {

        for (var i=0;i<edges.length;i++) {
            draw_line( edges[i].getPoint1(layout), edges[i].getPoint2(layout) ,width);
        }

    };*/













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
    return greenscale[i];
}


function WorldRenderer (canvas_interface,view,world) {
    Renderer.call(this,canvas_interface,view); 
    this.world = world;
    
}

    WorldRenderer.prototype = Object.create(Renderer.prototype);

    WorldRenderer.prototype.map_colors = function(i) {
        return greenscale_colors(i);  
    } 

    WorldRenderer.prototype.draw_hex = function(hex,linewidth,fillColor,lineColor) {

        var corners = this.world.layout.hexes_to_points(hex_corners(hex));
        this.draw_polygon(corners,linewidth,fillColor);
    };

    WorldRenderer.prototype.draw_hex_elevated = function(hex,height,linewidth,color_sides,color_top) {
        var low_corners = this.world.layout.hexes_to_points(hex_corners(hex));
        var high_corners = [];
        for (var i=0;i<low_corners.length;i++) {
            high_corners[i] = new Point(low_corners[i].x,low_corners[i].y - height);
        }

        var column_corners = [low_corners[0],high_corners[1],high_corners[2],high_corners[3],low_corners[4],low_corners[5]];


        //this.draw_polygon(low_corners,linewidth,color_sides);
        this.draw_polygon(column_corners,linewidth,color_sides);
        this.draw_polygon(high_corners,linewidth,color_top);

    };

    WorldRenderer.prototype.draw_hex_multi = function(hexes,linewidth,color) {
        for (var i=0;i<hexes.length;i++) {
            this.draw_hex(hexes[i], linewidth,color)
        }
    };

    WorldRenderer.prototype.draw_outline = function(edge_arrays,linewidth,fillColor,lineColor) {
        for (var outline = 0; outline < edge_arrays.length; outline++) {
            var corners = [];
            var edges = edge_arrays[outline];    
            for (var i=0;i<edges.length;i++){
                corners.push( this.world.layout.hex_to_point(edges[i].getPoint1() ));
            }
            this.draw_polygon(corners,linewidth,fillColor,lineColor);
            //this.draw_dots(corners,10,fillColor);
        }
    };

    WorldRenderer.prototype.get_hex_rectangle_boundaries = function() {
        
        //find the boundaries
        var extra = 0; //this variable defines how much bigger than the screen to render
        var left = this.view.input.position.x-extra;
        var right = this.view.input.position.x+this.view.input.size.x+extra;
        var top = this.view.input.position.y-extra;
        var bottom = this.view.input.position.y+this.view.input.size.y+extra;

        //find the corner points
        var topleft = new Point(left,top);
        var topright = new Point(right,top);
        var bottomleft = new Point(left,bottom);
        var bottomright = new Point(right,bottom);

        //find the corner hexes
        var toplefthex = hex_round(this.world.layout.point_to_hex(topleft));
        var toprighthex = hex_round(this.world.layout.point_to_hex(topright));
        var bottomlefthex = hex_round(this.world.layout.point_to_hex(bottomleft));
        var bottomrighthex = hex_round(this.world.layout.point_to_hex(bottomright));

        //define the limits of the iteration
        var qmin = Math.min(toplefthex.getQ(),bottomrighthex.getQ(),toprighthex.getQ(),bottomlefthex.getQ());
        var qmax = Math.max(toplefthex.getQ(),bottomrighthex.getQ(),bottomlefthex.getQ(),toprighthex.getQ());
        var rmin = Math.min(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());
        var rmax = Math.max(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());

        var hex_rect = [qmin,qmax,rmin,rmax];
        return hex_rect;
    }

    WorldRenderer.prototype.draw_rectangle_section = function(qmin,qmax,rmin,rmax) {
        //for columns
        for (var r = rmin; r <= rmax; r++) {
            
            //shift even-r lines
            if (r%2!=0) {
                var currentr = r+1;
            } else {
                var currentr = r;
            }
            
            
            //for rows ( each shifted to become rectangular)
            for (var q = Math.floor(qmin+(rmax-currentr)/2); q<qmax+(rmax-currentr)/2-(qmax-qmin)*1/4; q++) { //I subsctract 1/4 of q to make up for the min and max being ill-defined
                var hex = new Hex(q,r);
                //rectMap.set(hex,1);
                if (this.world.map.containsHex(hex)) {
                    //this.draw_tile_3D(hex);
                    this.draw_tile_2D(hex);
                    //this.draw_text(hex.getQ(),this.world.layout.hex_to_point(hex),'black',10);
                    //this.draw_text(hex.getR(),this.world.layout.hex_to_point(hex),'black',10);
                    //this.draw_text('[]',this.world.layout.hex_to_point(hex),'black',15);
                    //this.draw_text(index,this.world.layout.hex_to_point(hex),'black',20);
                }
            }
        }
    }

    WorldRenderer.prototype.draw_world = function() {

        var rectMap = this.get_hex_rectangle_boundaries();
        this.draw_rectangle_section(rectMap[0],rectMap[1],rectMap[2],rectMap[3]);
    }


    WorldRenderer.prototype.draw_tile_2D = function(hex) {
        
        //analyze tile
        var height = Math.floor(this.world.map.getValue(hex));
        color = this.map_colors(height);

        //draw ground
        this.draw_hex(hex,0,color);
        
        //this.draw_text(this.world.map.getValue(hex) ,this.world.layout.hex_to_point(hex),'black',20);


        
        //draw unit
        var this_unit = this.world.units.getValue(hex);
        if (typeof this_unit == 'object') {

            this.draw_unit(this_unit,hex,0);

        }
    }

    WorldRenderer.prototype.draw_tile_3D = function(hex) {
        
        //analyze tile
        var color = Math.floor(this.world.map.getValue(hex));
        color = this.map_colors(color);
        var height = this.world.map.getValue(hex)*6;

        //draw ground
        if (this.world.map.getValue(hex) > 1) {
            this.draw_hex_elevated(hex,height,0,'#310',color);
        } else {
            this.draw_hex(hex,0,color);
        }

        //draw unit
        //var this_unit = this.world.unit_at_position(hex);
        //if (typeof this_unit == 'object') {

            //this.draw_unit(this_unit,hex,height);

        //}
    }

    WorldRenderer.prototype.draw_tile_semi_3D = function(hex) {
        
        //this code only works in POINTY_TOP layout


        //analyze tile
        var height = this.world.map.getValue(hex);
        var color = Math.floor(height);
        color = this.map_colors(color);
        this.draw_hex(hex,0,color);
        //draw ground
        //
        var shade  = Math.floor(255-255*height/20);
        color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
        //this.draw_hex(hex,0,color);

        //draw walls
        var wall_color = '#310';
        var wall_height = 6;
        
        //analyze neighbors
        var n_left = hex_neighbor(hex,3);
        var n_upleft = hex_neighbor(hex,2);
        var n_upright = hex_neighbor(hex,1);

        //get height of neighbors
        var n_left_height = this.world.map.getValue(n_left);
        var n_upleft_height = this.world.map.getValue(n_upleft);
        var n_upright_height = this.world.map.getValue(n_upright);

        var corners = this.world.layout.hex_corners(hex);
        //draw wall of the left if the heights are different
        if (n_left_height != height) {
           // wall_height = wall_height/2;
           // this.draw_line(corners[3],corners[4],wall_height,wall_color);
        }
        //draw wall on the top-left if that tile is higher
        if (n_upleft_height > height) {
            wall_height = 1.5*(n_upleft_height-height);
            this.draw_line(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
        }
        //draw wall on the top-right if that tile is higher
        if (n_upright_height > height) {
            wall_height = 1.5*(n_upright_height-height);
            this.draw_line(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
        }

        //draw unit
        var this_unit = this.world.unit_at_position(hex);
        if (typeof this_unit == 'object') {

            this.draw_unit(this_unit,hex,0);

        }
    }


    WorldRenderer.prototype.draw_unit = function(unit,hex,height) {

        var position = this.world.layout.hex_to_point(hex);
        position = position.offset(0,-height);
        
        this.draw_dot(position,20,unit.colors);
    };

    WorldRenderer.prototype.draw_range = function(range) {
        
        var outline = hex_outline(range.getArray());
        //var pathfinder = new PathFinder(map);
        //this.draw_path(view,pathfinder,destination);

        //draw the outline of the range
        this.draw_outline( outline ,3,"rgba(150,150,255, 0.2)","rgba(0,0,255,1)");
        
        //draw the range background color
        for (let thishex of range.getArray()) {
            if (range.containsHex( thishex )) {
                var value = range.getValue(thishex)[0]*200/10;
                //this.draw_hex(thishex,0,"rgba(0,"+value+","+value+", 0.2)");
                //view.draw_hex_elevated(thishex, 3*this.range.getValue(thishex)[2], 0, "rgba("+value+","+value+","+value+", 0)", "rgba("+value+","+value+","+value+", 0.5)" );

                
            }
        }
    }

    WorldRenderer.prototype.draw_path = function(range,destination) {
        
        var pathfinder = new PathFinder(this.world.map);

        //draw the path
        if (range.containsHex(destination)) {
            this.draw_hex(destination,1,"rgba(200, 255, 200, 0.5)");
            
            //calculate points of the hexes
            var hexes = pathfinder.path(range,destination);
            var points = [];
            for (var i = 0; i<hexes.length;i++) {
                points.push(this.world.layout.hex_to_point(hexes[i]));
            }
            //view.draw_multi_line(points,3);

            //draw on screen
            this.draw_line_multi(points,3);
            
        }
    }


