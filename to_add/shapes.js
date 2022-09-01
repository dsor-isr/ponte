// Last updated November 2010 by Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// This is a self-executing function that I added only to stop this
// new script from interfering with the old one. It's a good idea in general, but not
// something I wanted to go over during this tutorial
(function(window) {


// holds all our boxes
var boxes2 = []; 

// New, holds the 8 tiny boxes that will be our selection handles
// the selection handles will be in this order:
//    8    - Rotation
// 0  1  2
// 3     4
// 5  6  7
var selectionHandles = [];
var numHandles = 9;

// Right Side Mission buttons
var buttonHandles = [];
var button_text = ["+", "-", ">"];

// Hold canvas information
var canvas;
var ctx;
var WIDTH;
var HEIGHT;
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed

var isDrag = false;
var isResizeDrag = false;
var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
var mx, my; // mouse coordinates

 // when set to true, the canvas will redraw everything
 // invalidate() just sets this to false right now
 // we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel = null;

// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#CC0000';
var mySelWidth = 2;
var mySelBoxColor = 'darkred'; // New for selection boxes
var mySelBoxSize = 6;
var mySelIconSize = 20;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

// Box object to hold data
function Box2() {
  this.x = 0;
  this.y = 0;
  this.w = 1; // default width and height?
  this.h = 1;
  this.rot = 0*10*Math.PI/180; //rotation
  this.fill = '#444444';
}

// New methods on the Box class
Box2.prototype = {
  // we used to have a solo draw function
  // but now each box is responsible for its own drawing
  // mainDraw() will call this with the normal canvas
  // myDown will call this with the ghost canvas with 'black'
  draw: function(context, optionalColor) {
      if (context === gctx) {
        context.fillStyle = 'black'; // always want black for the ghost canvas
      } else {
        context.fillStyle = this.fill;
      }
      context.save();
      context.translate(this.x+this.w/2,this.y+this.h/2);
      context.rotate(this.rot);
      // We can skip the drawing of elements that have moved off the screen:
      if (this.x > WIDTH || this.y > HEIGHT) return; 
      if (this.x + this.w < 0 || this.y + this.h < 0) return;
      
      context.fillRect((this.x*0-this.w/2),(this.y*0-this.h/2),this.w,this.h);
      context.restore();
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (mySel === this) {
      //var pt_topleft, pt_botright;
      //pt_topleft.x = this.x*cos(this.rot) + this.y*sin(this.rot);
      //pt_topleft.y = -this.x*sin(this.rot) + this.y*cos(this.rot);

      //pt_botright.x = (this.x+this.w)*cos(this.rot) + (this.y+this.h)*sin(this.rot);
      //pt_botright.y = -(this.x+this.w)*sin(this.rot) + (this.y+this.h)*cos(this.rot);

      context.save();
      context.translate(this.x+this.w/2,this.y+this.h/2);
      context.rotate(this.rot);
      context.strokeStyle = mySelColor;
      context.lineWidth = mySelWidth;
      context.strokeRect((this.x*0-this.w/2),(this.y*0-this.h/2),this.w,this.h);
      
      // draw the boxes
      
      var half = mySelBoxSize / 2;
      
      //    8    - Rotation
      // 0  1  2
      // 3     4
      // 5  6  7
      
      // top left, middle, right
      selectionHandles[0].x = (this.x*0-this.w/2)-half;
      selectionHandles[0].y = (this.y*0-this.h/2)-half;
      
      selectionHandles[1].x = (this.x*0-this.w/2)+this.w/2-half;
      selectionHandles[1].y = (this.y*0-this.h/2)-half;
      
      selectionHandles[2].x = (this.x*0-this.w/2)+this.w-half;
      selectionHandles[2].y = (this.y*0-this.h/2)-half;
      
      //middle left
      selectionHandles[3].x = (this.x*0-this.w/2)-half;
      selectionHandles[3].y = (this.y*0-this.h/2)+this.h/2-half;
      
      //middle right
      selectionHandles[4].x = (this.x*0-this.w/2)+this.w-half;
      selectionHandles[4].y = (this.y*0-this.h/2)+this.h/2-half;
      
      //bottom left, middle, right
      selectionHandles[6].x = (this.x*0-this.w/2)+this.w/2-half;
      selectionHandles[6].y = (this.y*0-this.h/2)+this.h-half;
      
      selectionHandles[5].x = (this.x*0-this.w/2)-half;
      selectionHandles[5].y = (this.y*0-this.h/2)+this.h-half;
      
      selectionHandles[7].x = (this.x*0-this.w/2)+this.w-half;
      selectionHandles[7].y = (this.y*0-this.h/2)+this.h-half;

      selectionHandles[8].x = (this.x*0-this.w/2)+this.w/2-half;
      selectionHandles[8].y = (this.y*0-this.h/2)-half-half*5;
      
      context.fillStyle = mySelBoxColor;
      for (var i = 0; i < numHandles; i ++) {
        var cur = selectionHandles[i];
        context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
      }


      for (bt=0;bt<button_text.length;bt++){
        buttonHandles[bt].x = (this.x*0-this.w/2)+this.w + mySelIconSize;
        buttonHandles[bt].y = (this.y*0-this.h/2)+this.h/2-((button_text.length-1)/2)*3*(mySelIconSize/2)+bt*(mySelIconSize/2)*3+0*(button_text.length/2)+0*(mySelIconSize/4), mySelIconSize/2;
        context.beginPath();
        context.arc(buttonHandles[bt].x, buttonHandles[bt].y, mySelIconSize/2, 0, 2 * Math.PI, false);
        context.lineWidth = 2;
        context.strokeStyle = 'darkred';
        context.stroke();
        context.font = "11pt Calibri,Geneva,Arial";
        context.lineWidth = 2;
        context.textAlign = 'center';
        context.textBaseline = 'middle'; 
        context.strokeText(button_text[bt],buttonHandles[bt].x, buttonHandles[bt].y);
        ctx.closePath();
      }
      context.restore();
    }
    
  } // end draw

}

//Initialize a new Box, add it, and invalidate the canvas
function addRect(x, y, w, h, fill) {
  var rect = new Box2;
  rect.x = x;
  rect.y = y;
  rect.w = w
  rect.h = h;
  rect.fill = fill;
  boxes2.push(rect);
  invalidate();
}

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init2() {
  canvas = document.getElementById('canvas2');
  HEIGHT = canvas.height;
  WIDTH = canvas.width;
  ctx = canvas.getContext('2d');
  ghostcanvas = document.createElement('canvas');
  ghostcanvas.height = HEIGHT;
  ghostcanvas.width = WIDTH;
  gctx = ghostcanvas.getContext('2d');
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.onselectstart = function () { return false; }
  
  // fixes mouse co-ordinate problems when there's a border or padding
  // see getMouse for more detail
  if (document.defaultView && document.defaultView.getComputedStyle) {
    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)     || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)      || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)  || 0;
  }
  
  // make mainDraw() fire every INTERVAL milliseconds
  setInterval(mainDraw, INTERVAL);
  
  // set our events. Up and down are for dragging,
  // double click is for making new boxes
  canvas.onmousedown = myDown;
  canvas.onmouseup = myUp;
  canvas.ondblclick = myDblClick;
  canvas.onmousemove = myMove;
  
  // set up the selection handle boxes
  for (var i = 0; i < numHandles; i ++) {
    var rect = new Box2;
    selectionHandles.push(rect);
  }
  
  // Initialize buttons
  for (bt=0;bt<button_text.length;bt++){
    buttonHandles.push({x:0, y:0});
  }
  // add custom initialization here:

  
  // add a large green rectangle
  addRect(260, 70, 60, 65, 'rgba(0,205,0,0.7)');
  
  // add a green-blue rectangle
  //addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');  
  
  // add a smaller purple rectangle
  
  //addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');
}


//wipes the canvas context
function clear(c) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
}

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  if (canvasValid == false) {
    clear(ctx);
    
    // Add stuff you want drawn in the background all the time here
    
    // draw all boxes
    var l = boxes2.length;
    for (var i = 0; i < l; i++) {
      boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
    }
    
    // Add stuff you want drawn on top all the time here
    
    canvasValid = true;
  }
}

// Happens when the mouse is moving inside the canvas
function myMove(e){
  if (isDrag) {
    getMouse(e);
    
    mySel.x = mx - offsetx;
    mySel.y = my - offsety;   
    
    // something is changing position so we better invalidate the canvas!
    invalidate();
  } else if (isResizeDrag) {
    // time ro resize!
    var oldx = mySel.x;
    var oldy = mySel.y;
    
    //    8    - Rotation
    // 0  1  2
    // 3     4
    // 5  6  7
    switch (expectResize) {
      case 0:
        mySel.x = mx;
        mySel.y = my;
        mySel.w += oldx - mx;
        mySel.h += oldy - my;
        break;
      case 1:
        mySel.y = my;
        mySel.h += oldy - my;
        break;
      case 2:
        mySel.y = my;
        mySel.w = mx - oldx;
        mySel.h += oldy - my;
        break;
      case 3:
        mySel.x = mx;
        mySel.w += oldx - mx;
        break;
      case 4:
        mySel.w = mx - oldx;
        break;
      case 5:
        mySel.x = mx;
        mySel.w += oldx - mx;
        mySel.h = my - oldy;
        break;
      case 6:
        mySel.h = my - oldy;
        break;
      case 7:
        mySel.w = mx - oldx;
        mySel.h = my - oldy;
        break;
      case 8:
        mySel.rot = Math.atan2(my-(mySel.y+mySel.h/2), mx-(mySel.x+mySel.w/2))+Math.PI/2
        break;
    }
    
    invalidate();
  }
  
  getMouse(e);
  // if there's a selection see if we grabbed one of the selection handles
  if (mySel !== null && !isResizeDrag) {
    // Translation
    mx -= mySel.x+mySel.w/2;
    my -= mySel.y+mySel.h/2;
    // Rotation
    rotmx = mx*Math.cos(mySel.rot)+my*Math.sin(mySel.rot);
    rotmy =-mx*Math.sin(mySel.rot)+my*Math.cos(mySel.rot);

    mx = rotmx;
    my = rotmy;
    //console.log("cursor x" + mx + " y" + my + " x0"+selectionHandles[0].x + " y0"+selectionHandles[0].y )
    for (var i = 0; i <  numHandles; i++) {
      //    8    - Rotation
      // 0  1  2
      // 3     4
      // 5  6  7
      var cur = selectionHandles[i];
      
      // we dont need to use the ghost context because
      // selection handles will always be rectangles
      if (mx >= cur.x && mx <= cur.x + mySelBoxSize &&
          my >= cur.y && my <= cur.y + mySelBoxSize) {
        // we found one!
        expectResize = i;
        invalidate();
        
        switch (i) {
          case 0:
            this.style.cursor='nw-resize';
            break;
          case 1:
            this.style.cursor='n-resize';
            break;
          case 2:
            this.style.cursor='ne-resize';
            break;
          case 3:
            this.style.cursor='w-resize';
            break;
          case 4:
            this.style.cursor='e-resize';
            break;
          case 5:
            this.style.cursor='sw-resize';
            break;
          case 6:
            this.style.cursor='s-resize';
            break;
          case 7:
            this.style.cursor='se-resize';
            break;
          case 8: 
            this.style.cursor= 'url(cursor/rotate.png) 11 11, auto';
            break;
        }
        return;
      }
      
    }

    // Right Mission Buttons 
    for(bt=0;bt<button_text.length;bt++){
      var dist  = Math.sqrt(Math.pow(mx-buttonHandles[bt].x,2)+Math.pow(my-buttonHandles[bt].y,2));
      //console.log("dist "+dist)
      // Found one button
      if(dist<=mySelIconSize/2){
        expectResize = 9+bt;
        invalidate();
        this.style.cursor='pointer';
        return;
      }
    }
    // not over a selection box, return to normal
    isResizeDrag = false;
    expectResize = -1;
    this.style.cursor='auto';
  }
  
}

// Happens when the mouse is clicked in the canvas
function myDown(e){
  getMouse(e);
  
  //we are over a selection box
  if (expectResize !== -1) {
    isResizeDrag = true;
    return;
  } 
  
  clear(gctx);
  var l = boxes2.length;
  for (var i = l-1; i >= 0; i--) {
    // draw shape onto ghost context
    boxes2[i].draw(gctx, 'black');
    
    // get image data at the mouse x,y pixel
    var imageData = gctx.getImageData(mx, my, 1, 1);
    var index = (mx + my * imageData.width) * 4;
    
    // if the mouse pixel exists, select and break
    if (imageData.data[3] > 0) {
      mySel = boxes2[i];
      offsetx = mx - mySel.x;
      offsety = my - mySel.y;
      mySel.x = mx - offsetx;
      mySel.y = my - offsety;
      isDrag = true;
      
      invalidate();
      clear(gctx);
      return;
    }
    
  }
  // havent returned means we have selected nothing
  mySel = null;
  // clear the ghost canvas for next time
  clear(gctx);
  // invalidate because we might need the selection border to disappear
  invalidate();
}

function myUp(){
  // Clicking in one of the buttons
  if(isResizeDrag && expectResize>8 && expectResize<12){ 
    switch (expectResize) {
      case 9:
        console.log("Plus Mission");
        break;
      case 10:
        console.log("Minus Mission");
        break;
      case 11:
        console.log("Next type Mission");
        break;
    }
    invalidate();
  }
  isDrag = false;
  isResizeDrag = false;
  expectResize = -1;
}

// adds a new node
function myDblClick(e) {
  getMouse(e);
  // for this method width and height determine the starting X and Y, too.
  // so I left them as vars in case someone wanted to make them args for something and copy this code
  var width = 20;
  var height = 20;
  addRect(mx - (width / 2), my - (height / 2), width, height, 'rgba(220,205,65,0.7)');
}


function invalidate() {
  canvasValid = false;
}

// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(e) {
      var element = canvas, offsetX = 0, offsetY = 0;

      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }

      // Add padding and border style widths to offset
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;

      mx = e.pageX - offsetX;
      my = e.pageY - offsetY
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();
window.init2 = init2;
})(window);

