

//CanvasDraw should be useable for any game that touches the HTML5 canvas
//This should be replaceable with an actual library in the future
//This could also be replaced with a non-canvas library!
//The rest of the game should basically ignore what platform it is running on
//Use with CanvasInput

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
                                
            //                      CANVAS DRAW

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//The CanvasDraw object ONLY draws directly on the canvas.  It doesn't know about what game you're using
//All Renderer objects should use this class to draw on the screen
//This draws directly on the Canvas using the canvas coordinates given
//this should have no notions of hexagons or even tile-based game

function CanvasDraw (canvas) {
    this.canvas = canvas;
    this.saved_polygon = {};

}

    //Returns the Width of the HTML canvas object
    CanvasDraw.prototype.getWidth = function() {
        return this.canvas.width;
    }

    //Returns the Height of the HTML Canvas object
    CanvasDraw.prototype.getHeight = function() {
        return this.canvas.height;
    }

    CanvasDraw.prototype.reDrawPolygon = function(new_position) {


        //get the previous polygon
        var line = this.saved_polygon;
        console.log(line);

        /*//default fill color
        if (typeof fill_color === 'undefined') {
            fill_color = 'transparent';
        }
        //default line color
        if (typeof line.strokeStyle === 'undefined') {
            line.strokeStyle = 'transparent';
        }*/


        //apply the new colors and settings to it
        //line.fillStyle = fill_color;
        
        //move it to its new position
        //line.translate(new_position.x,new_position.y);
        
        //line.translate(canvas.width/2,canvas.height/2);
        line.translate(100,100);

        //draw it
        //if (line.width > 0) {
        //    line.stroke(); 
        //}

        //optional fill color
        if (line.fillStyle != 'transparent') {

            //line.fillStyle = fill_color;
            line.fill();
        }
        line.translate(-100,-100);
        //line.translate(-canvas.width/2,-canvas.height/2);
    }

    //draw a canvas polygon touching each points, with optional line width, line color and polygon fill color
    CanvasDraw.prototype.drawPolygon = function(points,width,fill_color,line_color) {
        
        var line = this.canvas.getContext('2d');
        
        //default line color
        if (typeof line_color === 'undefined') {
            line_color = 'black';
        }

        //default line width
        if (typeof width === 'undefined') {
            width = 0;
        }
        
        //line style
        line.lineWidth = width;
        line.lineCap = "butt";
        line.strokeStyle = line_color;  

        line.alpha = false;     

        //polygon outline
        line.beginPath();
        line.moveTo(points[0].x,points[0].y);
        for (i=1; i<points.length; i++) {
            line.lineTo(points[i].x,points[i].y);
            //this.drawText(i,points[i],'black',24); //add the index of each corner
        }
        //close polygons of at least 3 sides
        if (points.length > 2) {
            line.lineTo(points[0].x,points[0].y);
            line.closePath();
        }
        
        //remember the last polygon drawn
        this.saved_polygon = line;
        
        //draw the line if thick enough
        if (width > 0) {
            line.stroke(); 
        }

        //optional fill color
        if (typeof fill_color != 'undefined' && fill_color != 'transparent') {

            line.fillStyle = fill_color;
            line.fill(); 
        }
        
    };

    //Draw a line on the canvas from p1 to p2 with optional width and color
    CanvasDraw.prototype.drawLine = function(p1,p2,width,color) {

        //express this function as a polygon
        var points = [p1,p2];
        this.drawPolygon(points,width,'transparent',color);

    };

    //Draw a dot on the canvas at position 'point' with optional size and color
    CanvasDraw.prototype.drawDot = function (point,size,color) {

        //draw the dot as a very short line
        var point1 = new Point(point.x-size/2,point.y);
        var point2 = new Point(point.x+size/2,point.y);
        this.drawLine(point1,point2,size,color)

    };

    //draw text on the canvas at the specified position, with optional color and fontsize
    CanvasDraw.prototype.drawText = function(text,position,color,fontsize) {

        //default fontsize value
        if (typeof fontsize === "undefined") {
            fontsize = 14;
        }
        //default color value
        if (typeof color === "undefined") {
            color = black;
        }

        //get the canvas
        var context = this.canvas.getContext('2d');
        
        //select the font
        context.font = fontsize +"px Arial";
        
        //select the color
        context.fillStyle = color;

        //write the text
        context.fillText(text,position.x,position.y);
    };

    //draw a sprite on the canvas, at specified position
    CanvasDraw.prototype.draw_sprite = function() {

    }

    //clear the canvas of everything
    CanvasDraw.prototype.clear = function() {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }













