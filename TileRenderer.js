


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

/*This is actually an interface and thsu can be inherited*/
function TileRenderer (hex_renderer, layout) {
  this.hex_renderer = hex_renderer;


}
TileRenderer.prototype.drawTile = function(hex,value) {
}
TileRenderer.prototype.mapColors = function(i) {
  return greenscale_colors(i);  
} 





function TileRenderer2D(hex_renderer, layout) {
  TileRenderer.call(this, hex_renderer, layout); 
  this.tilesize = layout.size.x;
  this.actuallyDrawHexes = this.areHexesBigEnough(renderer.getScale(), this.tilesize);
}
TileRenderer2D.prototype = Object.create(TileRenderer.prototype);

TileRenderer2D.prototype.areHexesBigEnough = function(zoomScale, hex_size) {

  if (zoomScale > hex_size/350) {
    return true;
  } else {
    return false;
  }

}
TileRenderer2D.prototype.drawTile = function(hex,tile) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.elevation);
  style.fill_color = this.mapColors(height);

  //draw ground

  if (this.actuallyDrawHexes) {
    this.hex_renderer.drawHex(hex, style);
  } else {
    var point = this.hex_renderer.hexToPoint(hex);
    this.hex_renderer.renderer.drawDot(point, this.tilesize*1.73, style);
  }
  var position = this.hex_renderer.hexToPoint(hex);



}




getWindArrowCharacter = function(direction) {

    switch (direction) {
        case 0: return 8594; break;
        case 1: return 8599; break;
        case 2: return 8598; break;
        case 3: return 8592; break;
        case 4: return 8601; break;
        case 5: return 8600; break;
        default: return 8635;
    }
}



//colors of different tiles depending on height
var greenscale_colors = function (i) {

  var greenscale = ['#005','#00D','#AA3', //ocean coast sand 0 1 2
                    '#080','#062', //grass 3 4
                    '#052','#042','#032','#020', //forest 5 6 7 8
                    '#010','#110','#210', //hills 9 10 11 12 13
                    '#410','#420',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF',]; //ice

  return greenscale[i] ;  
}

