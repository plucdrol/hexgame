

//CanvasDraw and CanvasInput should be useable for any game that touches the HTML5 canvas
//This should be replaceable with an actual library in the future
//This could also be replaced with a non-canvas library!
//The rest of the game should basically ignore what platform it is running on


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

}

    //Returns the Width of the HTML canvas object
    CanvasDraw.prototype.getWidth = function() {
        return this.canvas.width;
    }

    //Returns the Height of the HTML Canvas object
    CanvasDraw.prototype.getHeight = function() {
        return this.canvas.height;
    }

    //Draw a dot on the canvas at position 'point' with optional size and color
    CanvasDraw.prototype.drawDot = function (point,size,color) {


        //draws the dot using screen coordinates

        //defines the default size
        if (size === 'undefined') {
            size = 1;
        }
        
        //defines the default color
        if (color === 'undefined') {
            color = 'black';
        }

        //create canvas line object
        var line = this.canvas.getContext('2d');

        //define line path
        line.beginPath();
        line.moveTo(point.x-size/2,point.y);
        line.lineTo(point.x+size/2,point.y);

        //define line style
        line.lineCap = "butt";
        line.lineWidth = size;
        line.strokeStyle = color;

        //draw
        line.stroke();
    };



    //Draw a line on the canvas from p1 to p2 with optional width and color
    CanvasDraw.prototype.drawLine = function(p1,p2,width,color) {

        //defines the default size
        if (typeof size === 'undefined') {
            size = 1;
        }
        
        //defines the default color
        if (typeof color === 'undefined') {
            color = 'black';
        }

        //create canvas line object
        var line = this.canvas.getContext('2d');
        

        //define line path
        line.beginPath();
        line.moveTo(p1.x,p1.y);
        line.lineTo(p2.x,p2.y);

        //define line style
        line.lineWidth = width;
        line.lineCap = "butt";
        line.strokeStyle = color;

        //draw
        line.stroke();
    };

    //draw a canvas polygon touching each points, with optional line width, line color and polygon fill color
    CanvasDraw.prototype.drawPolygon = function(points,width,fill_color,line_color) {
        
        var line = this.canvas.getContext('2d');
        
        //default line color
        if (typeof line_color === 'undefined') {
            line_color = 'black';
        }

        //default line width
        if (typeof width === 'undefined') {
            //width = 0;
        }
        
        //line style
        line.lineWidth = width;
        line.lineCap="round";
        line.strokeStyle = line_color;       

        //polygon outline
        line.beginPath();
        line.moveTo(points[0].x,points[0].y);
        for (i=1; i<points.length; i++) {
            line.lineTo(points[i].x,points[i].y);
            //this.drawText(i,points[i],'black',24); //add the index of each corner
        }
        line.lineTo(points[0].x,points[0].y);
        line.closePath();
        
        //draw the line if thick enough
        if (width > 0) {
            line.stroke(); 
        }

        //optional fill color
        if (typeof fill_color != 'undefined') {

            line.fillStyle = fill_color;
            line.fill();
        }
        
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













/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
                                
            //                      CANVAS INPUT

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////




//This is the event-detection part of the canvas interface
//Rather than defining the reaction to inputs, this section should only
//detect the inputs, then create a message that is sent to the entire system.
//Each part of the system can then decide how to react to it


function CanvasInput(canvas) {

    this.canvas = canvas;
    
    //create the mouse pointer (should be part of the mouse/screen controller)
    this.mouse_pos = new Object();
    this.mouse_pos_previous = new Object();
    this.currentHex = new Hex(0,0);

    this.is_dragging = false;
}

    //JAVASCRIPT EVENT FUNCTIONS


    //react to clicking canvas by drawing a dot
    CanvasInput.prototype.clickCanvas = function(event) {
        
        //avoid click at the end of a drag
        if (this.is_dragging == false) {
        
            //trigger the click event
            var click_pos = this.getCursorPosition(event);
            world_interface.click(click_pos);                //this is the part that should be replaced by an event
        }
        //remember that the mouse is done dragging
        this.is_dragging = false;
        this.mouse_pos_previous[0] = undefined;

    }

    CanvasInput.prototype.mouseWheel = function(event) {

        event.preventDefault();

        // cross-browser wheel delta
        var e = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        //HERE a message should be sent to the rest of the engine
        world_interface.zoomView(1-delta*0.2);

        return false;   
    }

    //react to the mouse moving, hovering and dragging
    CanvasInput.prototype.mouseMove = function(event) {

        var drag_treshold = 2;
        //find the hovered hexagon
        this.mouse_pos[0] = this.getCursorPosition(event);

        //detect mouse hovering for animations
        world_interface.hover(this.mouse_pos[0]); //this should be replaced by an event

        //check if the mouse button is down, triggering a drag
        if (this.mouseButtonDown(event,'left')) {

            //check if the distance_dragged is over a treshold, to avoid mini-drags
            if (this.distance(this.mouse_pos[0],this.mouse_pos_previous[0]) > drag_treshold) {
                this.is_dragging = true; //this variable prevents clicks from happening at the end of a drag
            }
            //call the drag function (should be replaced by an event)
            world_interface.drag(this.mouse_pos[0],this.mouse_pos_previous[0]);
            
        }

        //remember the previous mouse position
        this.mouse_pos_previous[0] = this.mouse_pos[0];

        
    }

    //react to touch events across the screen
    CanvasInput.prototype.touchMove = function(ev) {
        ev.preventDefault();

        var id = new Object();


        //iterate over all touches
        for (var i=0;i < ev.touches.length; i++) {

            //get the ID of that touch
            id[i] = ev.touches[i].identifier;

            //find the touch position on the canvas
            this.mouse_pos[id[i]] = this.getCursorPosition(ev.touches[i]);

        }

        //these only happen for one touch (should be for the first touch)
        if (ev.touches.length == 1) {

            if (this.mouse_pos_previous[id[0]] != undefined) {
                this.is_dragging = true; //this variable prevents clicks from happening at the end of a drag
                world_interface.drag(this.mouse_pos[id[0]],this.mouse_pos_previous[id[0]]);
            }
        }

        //this is what happens for double touches
        if (ev.touches.length == 2) {
                
            if (this.mouse_pos_previous[id[0]] != undefined && this.mouse_pos_previous[id[1]] != undefined) {
                var previous_distance = this.distance(this.mouse_pos_previous[id[0]], this.mouse_pos_previous[id[1]] );
                var current_distance = this.distance(this.mouse_pos[id[0]], this.mouse_pos[id[1]] );
                var difference = current_distance-previous_distance;

                world_interface.zoomView(1-difference/100);
            }
        }

        //remember the previous touches
        for (var i=0;i < ev.touches.length; i++) {
            //remember the previous 
            this.mouse_pos_previous[id[i]] = this.mouse_pos[id[i]];
        }
    }

    //React to finger starting to touch screen
    CanvasInput.prototype.touchStart = function(ev) {
        //ev.preventDefault();
        for(var i=0;i<ev.changedTouches.length;i++) {
            var id = ev.changedTouches[i].identifier;
            delete this.mouse_pos_previous[id];
        }
    }

    //React to finger removed from screen
    CanvasInput.prototype.touchEnd = function(ev) {
        //ev.preventDefault();
        for(var i=0;i<ev.changedTouches.length;i++) {
            var id = ev.changedTouches[i].identifier;
            delete this.mouse_pos_previous[id];
        }
        if (this.is_dragging == false) {
          //  this.clickCanvas(ev);
        }
        this.is_dragging = false;
    }

    //React to screen being resized
    CanvasInput.prototype.windowResize = function()  {

        //mesure the new window size
        var width = window.innerWidth;
        var height = window.innerHeight;

        //Send the resize event here
        world_interface.resizeZoom(width,height);

        //size canvas to fit resized window
        this.canvas.width = width;
        this.canvas.height = height;

    }






    //HELPER FUNCTIONS

    //returns the (x,y) position of the cursor in the canvas
    CanvasInput.prototype.getCursorPosition = function(event) {
        //get mouse position
        var e = event;
        var coords = this.canvas.rel_mouse_coords(e); //function defined
        return new Point(coords.x,coords.y);
    }

    

    CanvasInput.prototype.mouseButtonDown = function(ev,button) {
        if (typeof ev.which != undefined) {
            if(ev.which==1 && button=='left') {
                return true;
            }
            if (ev.which==2 && button=='middle'){
                return true;
            } 
            if(ev.which==3 && button=='right')  {
                return true;
            } 
        }
        if (typeof ev.which != undefined) {
            if(ev.button==1 && button=='left') {
                return true;
            }
            if (ev.button==2 && button=='middle'){
                return true;
            } 
            if(ev.button==3 && button=='right')  {
                return true;
            } 
        }

        return false;
        
    }


    

    

    CanvasInput.prototype.distance = function(point1,point2) {

        return Math.hypot(point2.x-point1.x, point2.y-point1.y);
    }

    










/* 
 * Get Mouse Coordinates on the Canvas element 
 */
function rel_mouse_coords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft /*- currentElement.scrollLeft*/;
        totalOffsetY += currentElement.offsetTop /*- currentElement.scrollTop*/;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
};
HTMLCanvasElement.prototype.rel_mouse_coords = rel_mouse_coords;





