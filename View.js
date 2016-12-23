
//takes two vectors. One to its position, another from there to its opposite corner
function Rect(position,size) {
    this.position = position;
    this.size = size;
}

//The View is a coordinate transformation tool
//World coordinates are given to it as 'points' and it returns the coordinates on the screen (output rect)

function View (input_rect,output_rect) {

    //PRIVATE VARIABLES?
    var input = input_rect;
    var output = output_rect;

    //PRIVILEGES METHODS?
    View.prototype.worldToScreen = function(point) {

        var newPoint = new Point(0,0);

        newPoint.x = (point.x - this.input.position.x)*this.output.size.x/this.input.size.x;
        newPoint.y = (point.y - this.input.position.y)*this.output.size.y/this.input.size.y;

        return newPoint;
    };

}

    //PUBLIC METHODS?
    View.prototype.worldToScreenMulti = function(points) {

        var newPoints = [];

        for (var i = 0; i < points.length; i++) {
            
            newPoints.push(this.worldToScreen(points[i]));
        }
        

        return newPoints;
    };

    View.prototype.worldToScreen1D = function(scalar) {
        return scalar*this.output.size.x/this.input.size.x;
    };

    View.prototype.screenToWorld = function(point) {

        var newPoint = new Point(0,0);

        newPoint.x = (point.x * this.input.size.x/this.output.size.x) + this.input.position.x ;
        newPoint.y = (point.y * this.input.size.y/this.output.size.y) + this.input.position.y ;

        return newPoint;
    };
    View.prototype.screenToWorld1D = function(scalar) {
        return scalar*this.input.size.x/this.output.size.x;
    };

    View.prototype.setScale = function(point) { this.input.size = point; };
    View.prototype.getScale = function() { return this.output.size.x/this.input.size.x; };
    View.prototype.shiftPosition = function(point) {
        this.input.position.x += point.x;
        this.input.position.y += point.y;
    };
    View.prototype.move = function(direction,speed) {

        switch (direction) {
            case 'left':
                var shift = new Point(-this.input.size.x*speed,0);
            break;
            case'right':
                var shift = new Point(this.input.size.x*speed,0);
            break;
            case'up':
                var shift = new Point(0,-this.input.size.y*speed);
            break;
            case'down':
                var shift = new Point(0,this.input.size.y*speed);
            break;
        }
        this.shiftPosition(shift);
    }
    
    View.prototype.setPosition = function(point) { this.input.position = point; };

    View.prototype.focus = function(point) {
        this.input.position.x = point.x-this.input.size.x/2;
        this.input.position.y = point.y-this.input.size.y/2;
    }

    View.prototype.zoom = function(n) {
        //scales the view by n but keeps the screen centered on the same location
        var x = this.input.position.x;
        var y = this.input.position.y;
        var w = this.input.size.x;
        var h = this.input.size.y;


        this.input.size = new Point( w*n , h*n );
        this.input.position = new Point( x + w/2 - w*n/2 , y + h/2 - h*n/2 );
        //console.log('x:'+this.input.position.x+' y:'+this.input.position.y+' w:'+this.input.size.x+' h:'+this.input.size.y);
    };

