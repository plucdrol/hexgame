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
        //find the hovered position
        this.mouse_pos[0] = this.getCursorPosition(event);

        //detect mouse hovering for animations
        world_interface.hover(this.mouse_pos[0]); //this should be replaced by an event

        //check if the mouse button is down, triggering a drag
        if (this.mouseButtonDown(event,'left')) {

            //check if the distance_dragged is over a treshold, to avoid mini-drags
            if (distance(this.mouse_pos[0],this.mouse_pos_previous[0]) > drag_treshold) {
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
                var previous_distance = distance(this.mouse_pos_previous[id[0]], this.mouse_pos_previous[id[1]] );
                var current_distance = distance(this.mouse_pos[id[0]], this.mouse_pos[id[1]] );
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

//returns the cartesian distance between two points
function distance(point1,point2) {

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





