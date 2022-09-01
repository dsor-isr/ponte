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

// holds the old mission
var mission_backup = undefined;
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
//var button_text = ["*", "+", "-", ">"];
var button_text = []; // No Buttons

// Hold canvas information
var canvas_mp;
var ctx_planning;
var WIDTH;
var HEIGHT;
var INTERVAL = 50;  // how often, in milliseconds, we check to see if a redraw is needed

var isDrag = false;
var isResizeDrag = false;
var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
var expectMovePoints = undefined; // Points in the mission to move
var designBySection = false; // Design mission by section
var shiftDown = false; // When a shift down was detected
var mx, my; // mouse coordinates

 // when set to true, the canvas will redraw everything
 // invalidate() just sets this to false right now
 // we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel = null;

// The selection color and width. Right now we have a red selection with a small width
//var mySelColor = '#CC0000';
var mySelColor = '#66FF33';
var mySelWidth = 2;
//var mySelBoxColor = 'darkred'; // New for selection boxes
var mySelBoxColor = '#C63333';//'DeepSkyBlue'; // New for selection boxes
var mySelBoxSize = 20;
var mySelIconSize = 20;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

var mission_plan_loaded = false;

// Handle for the interfal call
var IntervalHandle = 0;
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
  this.real_x =0;
  this.real_y =0;
  this.w = 1; // default width and height?
  this.h = 1;
  this.rot = 0*10*Math.PI/180; //rotation
  this.fill = '#444444';
  this.mission_arg = 3;
  this.mission_type = 1;
  this.vehicle = -1;
  this.mission_type_text = "";
  this.missionPtr = undefined;
  this.missionOriginalPtr = undefined;
  this.mission_speed = 0.3;
}

// New methods on the Box class
Box2.prototype = {
  // we used to have a solo draw function
  // but now each box is responsible for its own drawing
  // mainDraw() will call this with the normal canvas
  // myDown will call this with the ghost canvas with 'black'
  draw: function(context_id, optionalColor) {
      if (context_id === gctx) {
        context_id.fillStyle = 'black'; // always want black for the ghost canvas
      } else {
      	if (mySel === this)
        	context_id.fillStyle = this.fill;
    	else
        	context_id.fillStyle = 'rgba(0,205,0,0.0)';    		
    	
      }
      context_id.save();
      context_id.translate(this.x+this.w/2*0,this.y+this.h/2*0);
      context_id.rotate(this.rot);
      // We can skip the drawing of elements that have moved off the screen:
      if (this.x - this.w/2> WIDTH || this.y - this.h/2> HEIGHT) return; 
      if (this.x + this.w/2 < 0 || this.y + this.h/2 < 0) return;
      
      context_id.fillRect((this.x*0-this.w/2),(this.y*0-this.h/2),this.w,this.h);
      context_id.restore();
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (mySel === this) {


      //var pt_topleft, pt_botright;
      //pt_topleft.x = this.x*cos(this.rot) + this.y*sin(this.rot);
      //pt_topleft.y = -this.x*sin(this.rot) + this.y*cos(this.rot);

      //pt_botright.x = (this.x+this.w)*cos(this.rot) + (this.y+this.h)*sin(this.rot);
      //pt_botright.y = -(this.x+this.w)*sin(this.rot) + (this.y+this.h)*cos(this.rot);

      context_id.save();
      //context_id.translate(this.x+this.w/2,this.y+this.h/2);
      context_id.translate(this.x,this.y);
      context_id.rotate(this.rot);
      context_id.strokeStyle = mySelColor;
      context_id.lineWidth = mySelWidth;
      context_id.strokeRect((this.x*0-this.w/2),(this.y*0-this.h/2),this.w,this.h);
      
      if(!moveSingle)
      {
        // draw the boxes
        var half = mySelBoxSize / 2;
        
        // Line from 8 to 1
        context_id.beginPath();
        context_id.moveTo((this.x*0-this.w/2)+this.w/2,(this.y*0-this.h/2)-half*5);
        context_id.lineTo((this.x*0-this.w/2)+this.w/2,(this.y*0-this.h/2));
        context_id.stroke();

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
        
        context_id.fillStyle = mySelBoxColor;
        for (var i = 0; i < numHandles; i ++) {
          var cur = selectionHandles[i];
          context_id.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
        }
      }

      // Side Buttons
      for (bt=0;bt<button_text.length;bt++){
        buttonHandles[bt].x = (this.x*0-this.w/2)+this.w + mySelIconSize;
        buttonHandles[bt].y = (this.y*0-this.h/2)+this.h/2-((button_text.length-1)/2)*3*(mySelIconSize/2)+bt*(mySelIconSize/2)*3+0*(button_text.length/2)+0*(mySelIconSize/4), mySelIconSize/2;
        context_id.beginPath();
        context_id.fillStyle = this.fill;
        context_id.arc(buttonHandles[bt].x, buttonHandles[bt].y, mySelIconSize/2, 0, 2 * Math.PI, false);
        context_id.lineWidth = mySelWidth;
        context_id.strokeStyle = mySelColor;//'darkred';
        context_id.stroke();
        context_id.closePath();
        context_id.fill();        
        context_id.beginPath();
        context_id.font = "11pt Calibri,Geneva,Arial";
        context_id.lineWidth = mySelWidth;
        context_id.textAlign = 'center';
        context_id.textBaseline = 'middle'; 
        context_id.strokeText(button_text[bt],buttonHandles[bt].x, buttonHandles[bt].y);
        context_id.closePath();
      }

      // Draw Mission Specs

      // Text to display
      var output_txt = "";
      output_txt += "width: "+ this.real_w.toFixed(1)+"m\n";
      output_txt += "height: "+ this.real_h.toFixed(1)+"m\n";
      output_txt += "rot: "+ (this.rot*180/Math.PI).toFixed(1)+"deg\n";
      if(this.mission_type==2 || this.mission_type==3){
        var num_legs=this.mission_arg;
        if(num_legs<2) num_legs=2;

        var leg_dist = this.real_w/(num_legs-1);
        output_txt += "leg dist: "+ leg_dist.toFixed(1) + "m\n";
      }
      output_txt +="\n";
      output_txt += compute_statistics(this.missionPtr.mission);
      var lines_to_display = output_txt.split('\n');
      //if(lines_to_display[lines_to_display.length-1][0]=="\n") 
      lines_to_display.splice(lines_to_display.length-1,1);
      // console.log(lines_to_display);
      var num_textinfo = lines_to_display.length-1, textSize=14;



      // Draw Text
      context_id.beginPath();
      context_id.font = "10pt Calibri,Geneva,Arial";
      context_id.lineWidth = 1;
      context_id.textAlign = 'left';
      context_id.textBaseline = 'middle'; 
      
      // Draw rectangle on the back
      context_id.globalAlpha = 0.4;
      context_id.fillStyle = color_palette['black'];
      context_id.strokeStyle = color_palette['black'];
      var max_width=0;
      for(var j =0; j< lines_to_display.length; j++)
        max_width = Math.max(context_id.measureText(lines_to_display[j]).width, max_width);
      context_id.fillRect(this.w/2+mySelIconSize*(2/3) , -(num_textinfo/2)*textSize-textSize/2-mySelIconSize*(1/3), max_width+mySelIconSize*(2/3), (num_textinfo+1.0)*textSize+mySelIconSize*(2/3));
      context_id.strokeRect(this.w/2+mySelIconSize*(2/3) , -(num_textinfo/2)*textSize-textSize/2-mySelIconSize*(1/3), max_width+mySelIconSize*(2/3), (num_textinfo+1.0)*textSize+mySelIconSize*(2/3));
      //context_id.strokeRect( 35-buttonHeight/2-5, 60-buttonHeight/2-5+10, 35+max_width_bt+10, (num_hidden_vh-0.5)*buttonHeight+num_hidden_vh*10+10);
      context_id.globalAlpha = 1.0;

      
      context_id.fillStyle = this.fill;
      context_id.strokeStyle = mySelColor;
      for(var j =0; j< lines_to_display.length; j++){
        context_id.strokeText(lines_to_display[j],this.w/2+mySelIconSize , -(num_textinfo/2)*textSize+j*textSize);
        context_id.fillText(lines_to_display[j],this.w/2+mySelIconSize ,   -(num_textinfo/2)*textSize+j*textSize);
      }

/*      context_id.strokeText("width: "+ this.real_w.toFixed(1)+"m",this.w/2+mySelIconSize , -(num_textinfo/2)*textSize+0*textSize);
      context_id.fillText("width: "+ this.real_w.toFixed(1)+"m",this.w/2+mySelIconSize ,-(num_textinfo/2)*textSize+0*textSize);
      context_id.strokeText("height: "+ this.real_h.toFixed(1)+"m",this.w/2+mySelIconSize ,-(num_textinfo/2)*textSize+1*textSize);
      context_id.fillText("height: "+ this.real_h.toFixed(1)+"m",this.w/2+mySelIconSize , -(num_textinfo/2)*textSize+1*textSize);
      context_id.strokeText("rot: "+ (this.rot*180/Math.PI).toFixed(1)+"deg",this.w/2+mySelIconSize ,-(num_textinfo/2)*textSize+2*textSize);
      context_id.fillText("rot: "+ (this.rot*180/Math.PI).toFixed(1)+"deg",this.w/2+mySelIconSize , -(num_textinfo/2)*textSize+2*textSize);*/
      context_id.closePath();

      // Draw the name of the mission
      context_id.beginPath();
      context_id.lineWidth = 1;
      context_id.strokeStyle = mySelBoxColor;
      context_id.fillStyle = mySelBoxColor;
      context_id.font = "13pt Calibri,Geneva,Arial";
      context_id.textAlign = 'center';
      //console.log(this.mission_type_text);
      context_id.strokeText(this.mission_type_text, 0, 0+this.h/2+14+5);
      context_id.fillText(this.mission_type_text, 0, 0+this.h/2+14+5);
      context_id.closePath();

      context_id.restore();
    }
    
  } // end draw

}

//Initialize a new Box, add it, and invalidate the canvas
function addRect(x, y, w, h, fill) {
  var rect = new Box2;
  rect.real_x = x;
  rect.real_y = y;
  rect.real_w = w;
  rect.real_h = h;

  rect.fill = fill;
  boxes2.push(rect);
  invalidate();
}


var xi_act, yi_act, sx_act, sy_act;
/*
// Function to convert real coordinates to local point in pixels
function convertReal2Point(x, y){
  xn=widthIUTM*xi_act/WIDTH;
  yn=heightIUTM*(HEIGHT-yi_act)/HEIGHT-heightIUTM*sy_act;
  heightIUTM = heightIUTM*sy_act;
  widthIUTM = widthIUTM *sx_act;
  
  // Real  to Pixels
  xpix = (x-xn)*widthI/widthIUTM;
  ypix = (y-yn)*heightI/heightIUTM;

  // Pixels to Real
  //x = xn + widthIUTM*(posx-posObj[0])/widthI;
  //y = yn + heightIUTM*(heightI-(posy-posObj[1]))/heightI;    
}*/

// Function called from outside the script to resize canvas
function mission_program_resize(xi, yi, sx, sy){
  canvas_orig = document.getElementById('ctrMap');
  div_maps = document.getElementById('divMaps');
  HEIGHT = canvas_orig.height;
  WIDTH = canvas_orig.width;
  canvas_mp.height=HEIGHT;
  canvas_mp.width=WIDTH;
  ghostcanvas.height = HEIGHT;
  ghostcanvas.width = WIDTH;

  // Update Real values in all the boxes before drawing it again
  /*var l = boxes2.length;
  for (var i = 0; i < l; i++) {
    boxes2[i].real_x = ;
    boxes2[i].real_y = ;

  }*/

  //console.log("mission_program_resize xi:"+xi +" yi:"+yi + " sx:"+sx+" sy:"+sy);
  xi_act=xi; yi_act=yi; 
  sx_act=sx; sy_act=sy;

  invalidate();
  mainDraw();
  
}

function mission_update_edited(mission_input){
  for(var bx=0; bx < boxes2.length; bx++)
  {
    if(boxes2[bx].missionPtr.mission_id === mission_input.mission_id)
    {
      if(boxes2[bx].missionPtr.standard_mission_flag)
      {
        boxes2[bx].missionPtr.formation = full_clone(mission_input.formation)
        boxes2[bx].missionOriginalPtr.formation = full_clone(mission_input.formation);
        boxes2[bx].mission_speed = mission_input.mission_speed;
        break;
      }

      boxes2[bx].missionPtr = full_clone(mission_input);
      boxes2[bx].missionPtr.mission = clone_mission(mission_input.mission);
      boxes2[bx].missionOriginalPtr = full_clone(mission_input);
      boxes2[bx].missionOriginalPtr.mission = clone_mission(mission_input.mission);
      boxes2[bx].mission_type = 0;
      mrect = surrounding_rect(mission_input);
      boxes2[bx].mission_type = 0;
      boxes2[bx].rot =0;
      console.log("box "+bx +" updated")
      mission_program_next_type();
      break;
    }
  }
  //Update to edited mission
  /*if(mission){
    mission_backup = full_clone(mission);
    mission_backup.mission = clone_mission(mission.mission);
    mySel.mission_type = 0;
    mySel.rot =0;
    mission_program_next_type();
  }*/
  invalidate();
  mainDraw();
}

function process_standard_mission_text(text)
{
//"#STDMISSION,"+mission_type+","+real_x+","+real_y+","+x+","+y+","+w+","+h+","+mission_arg+","+rot+","+vehicle+","+mission_speed;
  text.replace(" ","");
  var fields = text.split(",");
  
  if(fields[0] != "#STDMISSION") return undefined;
  var new_rect = new Box2;
  new_rect.mission_type   = parseFloat(fields[1]);
  new_rect.real_x         = parseFloat(fields[2]);
  new_rect.real_y         = parseFloat(fields[3]);
  new_rect.real_w         = parseFloat(fields[4]);
  new_rect.real_h         = parseFloat(fields[5]);
  new_rect.mission_arg    = parseFloat(fields[6]);
  new_rect.rot            = parseFloat(fields[7]);
  new_rect.vehicle        = parseFloat(fields[8]);
  new_rect.mission_speed  = parseFloat(fields[9]);
  
  return new_rect;
}
// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init_mission_planning(new_mission, section_by_section) {
  new_mission = typeof new_mission !== 'undefined' ? new_mission : false;
  section_by_section = typeof section_by_section !== 'undefined' ? section_by_section : false;

  if(mission_plan_loaded==true)
    return;
  canvas_orig = document.getElementById('ctrMap');
  div_maps = document.getElementById('divMaps');
  HEIGHT = canvas_orig.height;
  WIDTH = canvas_orig.width;
  canvas_mp = document.createElement('canvas');
  canvas_mp.setAttribute("id", "canvas2");
  canvas_mp.style['z-index'] = 4;
  canvas_mp.height=HEIGHT;
  canvas_mp.width=WIDTH;
  ctx_planning = canvas_mp.getContext('2d');

  ghostcanvas = document.createElement('canvas');
  ghostcanvas.setAttribute("id", "ghostcanvas");
  ghostcanvas.height = HEIGHT;
  ghostcanvas.width = WIDTH;
  ghostcanvas.style['z-index'] = 4;
  gctx = ghostcanvas.getContext('2d');
  
  div_maps.appendChild(canvas_mp);
  div_maps.appendChild(ghostcanvas);
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas_mp.onselectstart = function () { return false; }
  
  // fixes mouse co-ordinate problems when there's a border or padding
  // see getMouse for more detail
  if (document.defaultView && document.defaultView.getComputedStyle) {
    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas_mp, null)['paddingLeft'], 10)     || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas_mp, null)['paddingTop'], 10)      || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas_mp, null)['borderLeftWidth'], 10) || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas_mp, null)['borderTopWidth'], 10)  || 0;
  }
  
  // make mainDraw() fire every INTERVAL milliseconds
  IntervalHandle = setInterval(mainDraw, INTERVAL);
  
  // set our events. Up and down are for dragging,
  // double click is for making new boxes
  canvas_orig.addEventListener('mousedown', myDownPlan, false);
  canvas_orig.addEventListener('mouseup', myUpPlan, false); 
  canvas_orig.addEventListener('mousemove', myMovePlan, false);

  // Mobile devices
  canvas_orig.addEventListener('touchstart', myDownPlan,true);
  canvas_orig.addEventListener('touchend', myUpPlan,false);
  canvas_orig.addEventListener('touchmove', myMovePlan,true);

  // Keys
  document.addEventListener('keydown', mission_keydown, false);
  document.addEventListener('keyup', mission_keyup, false);

  /*canvas_orig.onmousedown = myDown;
  canvas_orig.onmouseup = myUpPlan;
  //canvas.ondblclick = myDblClick;
  canvas_orig.onmousemove   = myMovePlan;*/
  
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

  // Move points Button disable
  moveSingle = false;
  Show_Points_ID_Flag = false;
  var movesingle_bt = document.getElementById('mission_moveSingleBt');
  removeClass('activated',movesingle_bt); addClass('notactivated',movesingle_bt);
  mission_pt_selected = undefined;
  

  if(section_by_section)
  {
    addRect(0, 0, 10, 10, 'rgba(0,205,0,0.4)');
    boxes2[0].mission_type = 8;
    // Update the displayed missions
    var temp_Mission=new missionObj();
    temp_Mission.mission_id = Date.now()+"editor";
    boxes2[0].missionPtr = full_clone(temp_Mission);
    boxes2[0].missionPtr.mission = clone_mission(temp_Mission.mission);
    boxes2[0].missionOriginalPtr = full_clone(temp_Mission);
    boxes2[0].missionOriginalPtr.mission = clone_mission(temp_Mission.mission);
    missions_to_be_displayed.push(temp_Mission);
    lastPoint = undefined;
    designBySection = true;
    designing_arc = false;
    Show_Points_ID_Flag =true;
    mySel = boxes2[0];
  }
  else
  {
    var boxes_num = 0;
    // Add the existing missions
    for(var mn=0; mn<missions_to_be_displayed.length; mn++)
    {
      if(mission_len(missions_to_be_displayed[mn].mission)==0)
        continue;

      if(missions_to_be_displayed[mn].standard_mission_flag)
      {
        var new_box = process_standard_mission_text(missions_to_be_displayed[mn].standard_mission_text);
        if(new_box!=undefined)
        {
          boxes2.push(new_box);
          boxes2[boxes_num].fill = 'rgba(0,205,0,0.4)';
          boxes2[boxes_num].missionPtr = full_clone(missions_to_be_displayed[mn]);
          boxes2[boxes_num].missionPtr.mission = clone_mission(missions_to_be_displayed[mn].mission);
          boxes2[boxes_num].missionOriginalPtr = full_clone(missions_to_be_displayed[mn]);
          boxes2[boxes_num].missionOriginalPtr.mission = clone_mission(missions_to_be_displayed[mn].mission);
          boxes_num+=1;
          continue;
        }
      }

      mrect = surrounding_rect(missions_to_be_displayed[mn]);
      addRect(mrect[0], mrect[1], mrect[2], mrect[3], 'rgba(0,205,0,0.4)');
      boxes2[boxes_num].mission_type = 1;
      update_name_of_mission(boxes2[boxes_num]);
      boxes2[boxes_num].missionPtr = full_clone(missions_to_be_displayed[mn]);
      boxes2[boxes_num].missionPtr.mission = clone_mission(missions_to_be_displayed[mn].mission);
      boxes2[boxes_num].missionOriginalPtr = full_clone(missions_to_be_displayed[mn]);
      boxes2[boxes_num].missionOriginalPtr.mission = clone_mission(missions_to_be_displayed[mn].mission);
      boxes_num+=1;
      //mission_backup = full_clone(missions_to_be_displayed[mn]);
      //mission_backup.mission = clone_mission(missions_to_be_displayed[mn].mission);
    }
    
    mySel = boxes2[0];

    // If the idea is to add a new mission or just edit the existing ones
    if(new_mission)
    {
      // Draw the new mission in the center of the map
      var window_wdt = (WIDTH*canvas_pixelstometer);
      var window_hgt = (HEIGHT*canvas_pixelstometer);
      var init_size = Math.min(window_wdt/4, window_hgt/4);
      addRect(canvas_xtl+window_wdt/2, canvas_ytl-window_hgt/2, init_size, init_size, 'rgba(0,205,0,0.4)');
      boxes2[boxes_num].mission_type = 2;
      update_name_of_mission(boxes2[boxes_num]);
      // Update the displayed missions
      var temp_Mission=new missionObj();
      temp_Mission.mission_id = Date.now()+"editor";
      boxes2[boxes_num].missionPtr = full_clone(temp_Mission);
      boxes2[boxes_num].missionPtr.mission = clone_mission(temp_Mission.mission);
      boxes2[boxes_num].missionOriginalPtr = full_clone(temp_Mission);
      boxes2[boxes_num].missionOriginalPtr.mission = clone_mission(temp_Mission.mission);

      missions_to_be_displayed.push(temp_Mission);
      boxes_num +=1;
      mySel = boxes2[boxes2.length-1];
    }

    if(boxes2.length==0)
    {
      if(MISSION_DESIGN)
      {
        destroy_mission_planning();
        mission_design_toggle(false);
        return;
      }
    }
  }
  update_name_of_mission();
  mission_plan_loaded  = true;
}

function destroy_mission_planning() {
  if(mission_plan_loaded==false)
    return;
  //canvas = document.getElementById('canvas2');
  //ghostcanvas = document.getElementById('ghostcanvas');

  if(mySel!=null && mySel.missionPtr.mission.length==0)
    mission_clear();

  designBySection = false;
  canvas_mp.parentElement.removeChild(canvas_mp);
  ghostcanvas.parentElement.removeChild(ghostcanvas);

  
  // destroy call
  clearInterval(IntervalHandle);

  canvas_orig = document.getElementById('ctrMap');
  canvas_orig.removeEventListener('mousedown', myDownPlan);
  canvas_orig.removeEventListener('mouseup', myUpPlan); 
  canvas_orig.removeEventListener('mousemove', myMovePlan);

  // Delete Rectangle
  boxes2 = []

  mission_plan_loaded  = false;

  mission_backup = undefined;
  draw(-2,-2,-2,-2);
}



//wipes the canvas context
function clear(c) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
}

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  //console.log("mainDraw")
  // Testing
  //document.getElementById('missionMenu_sidetab').contentWindow.postMessage(mission.toText(), '*');

  if (canvasValid == false) {
    clear(ctx_planning);

    if(designBySection)
    {
      if(boxes2[0].missionPtr.mission.length>=1)
      {
        Plot_Mission('canvas2', 1, boxes2[0].missionPtr);
        showPointsID('canvas2', boxes2[0].missionPtr);
        update_mission_done(boxes2[0].missionPtr);
      }else if(lastPoint)
      {
        circles(lastPoint[0],lastPoint[1],'white',true,'red', 'canvas2');
      }
      canvasValid = true;
      return;
    }
    // Add stuff you want drawn in the background all the time here
    // draw all boxes
    var l = boxes2.length;
    for (var i = 0; i < l; i++) {
      // Convert to pixels
      var auxPt_tl = getCanvasPos_pixel([boxes2[i].real_x, boxes2[i].real_y], true);
      boxes2[i].x = auxPt_tl[0];
      boxes2[i].y = auxPt_tl[1];
      var auxPt_br = getCanvasPos_pixel([boxes2[i].real_x+boxes2[i].real_w, boxes2[i].real_y+boxes2[i].real_h], true);
      boxes2[i].w = auxPt_br[0]-auxPt_tl[0];
      boxes2[i].h = auxPt_tl[1]-auxPt_br[1];

      // Lawn Mower Parameter calculation
      var num_legs=boxes2[i].mission_arg;
      if(num_legs<2) num_legs=2;

      var leg_dist = boxes2[i].real_w/(num_legs-1);
      var radius = leg_dist/2.0;
      var leg_length = boxes2[i].real_h-2.0*radius;
      //var leg_length = boxes2[i].real_h;
      var angle = -boxes2[i].rot*180/Math.PI;
      var k = 1;
      var xref = boxes2[i].real_x+boxes2[i].real_w/2*0;
      var yref = boxes2[i].real_y-boxes2[i].real_h/2*0;
      //if(num_legs==2) leg_length = boxes2[i].real_h;  
      // Select Mission type
      if(!moveSingle){
        var backup_missionid = boxes2[i].missionPtr.mission_id;
        var backup_formation= boxes2[i].missionPtr.formation;
        if(boxes2[i].mission_type==1){ // preloaded mission
          var maux = full_clone(boxes2[i].missionOriginalPtr);
          maux.mission = clone_mission(boxes2[i].missionOriginalPtr.mission);
          mrect = surrounding_rect(maux);
          // scale using the ratio between old width and the new one
          scaleMission(maux.mission, boxes2[i].real_w/mrect[2],boxes2[i].real_h/mrect[3], [mrect[0]-maux.xrefpoint, mrect[1]-maux.yrefpoint])
          mrect = surrounding_rect(maux);
          rotateMission(maux.mission, angle, [mrect[0]-maux.xrefpoint, mrect[1]-maux.yrefpoint]);

          boxes2[i].missionPtr.mission =  clone_mission(maux.mission);
          boxes2[i].missionPtr.xrefpoint = maux.xrefpoint+xref-mrect[0];
          boxes2[i].missionPtr.yrefpoint = maux.yrefpoint+yref-mrect[1];
          boxes2[i].missionPtr.standard_mission_flag = false;
        }else if(boxes2[i].mission_type==2){
          k=1;
          // Generate Lawn Mower
          boxes2[i].missionPtr = Lawn_Mower_Gen(leg_length, leg_dist, num_legs, angle, k, xref, yref, boxes2[i].vehicle,boxes2[i].mission_speed);
        }else if(boxes2[i].mission_type==3){
          k=-1;
          // Generate Lawn Mower
          boxes2[i].missionPtr = Lawn_Mower_Gen(leg_length, leg_dist, num_legs, angle, k, xref, yref, boxes2[i].vehicle,boxes2[i].mission_speed);
        }else if(boxes2[i].mission_type==4){
          // Generate Zero Mission
          //Zero_Gen(boxes2[i].real_h-2*boxes2[i].real_w/2, boxes2[i].real_w, boxes2[i].mission_arg, angle, k, xref, yref, boxes2[i].vehicle);
          boxes2[i].missionPtr = Zero_Gen(boxes2[i].real_h-2*boxes2[i].real_w/2, boxes2[i].real_w, boxes2[i].mission_arg, angle, -k, xref, yref, boxes2[i].vehicle);   
        }else if(boxes2[i].mission_type==5){
          // Circle
          var m_dim = Math.min(boxes2[i].real_h, boxes2[i].real_w);
          boxes2[i].missionPtr = circle_mission(angle,boxes2[i].mission_arg,m_dim/2,xref, yref,boxes2[i].vehicle,boxes2[i].mission_speed);
        }else if(boxes2[i].mission_type==6){
          // Generate Star Mission
          var side =Math.min(boxes2[i].real_w, boxes2[i].real_h);
          var radius =side/2; 
          boxes2[i].missionPtr = star_mission(angle,boxes2[i].mission_arg,radius,xref, yref,boxes2[i].vehicle,boxes2[i].mission_speed);
        }else if(boxes2[i].mission_type==7){
          // Generate an eight mission
          boxes2[i].missionPtr = eight_mission(boxes2[i].real_w, boxes2[i].real_h, angle, xref, yref, boxes2[i].mission_arg);
        }
        with (boxes2[i])
        {
          if(mission_type!=1)
          {  
            missionPtr.standard_mission_flag = true;
            missionPtr.standard_mission_text = "#STDMISSION,"+mission_type+","+real_x+","+real_y+","+real_w+","+real_h+","+mission_arg+","+rot+","+vehicle+","+mission_speed;
          }
          else
            missionPtr.standard_mission_flag = false;
          missionPtr.mission_id = backup_missionid;
          missionPtr.formation = backup_formation;
        }
      }
      boxes2[i].draw(ctx_planning); // we used to call drawshape, but now each box draws itself
      update_mission_done(boxes2[i].missionPtr);
      Plot_Mission('canvas2', 1, boxes2[i].missionPtr);

    }
    //  Show_Points_ID_Flag = true;
    if(Show_Points_ID_Flag && mySel!= null)
      showPointsID('canvas2', mySel.missionPtr);
    // Add stuff you want drawn on top all the time here
    canvasValid = true;
  }
}

function mission_keydown(e){
    e = e || window.event;

    if(designBySection)
    {
      mySel = boxes2[0];
      if(e.keyCode == 16) // shift key
      {
        shiftDown = true;
        myMovePlan(e);
      }
      else if(e.keyCode == '27')  // escape
      {
        designBySection = false;
        if(mySel.missionPtr.mission.length>0)
        {
          mySel.missionPtr.mission.pop(); 
          if(MISSION_DESIGN)
            mission_design_toggle(false);
        }
      else
        mission_clear();

      }
      else if (e.keyCode == '46') // delete
      {
        designBySection = false;
        mission_clear();
        /*if(MISSION_DESIGN )
          mission_design_toggle(false);*/
      }
    }

    if (mySel == null || isResizeDrag) 
      return;

    // map dimensions in meters
    var window_wdt = (WIDTH*canvas_pixelstometer);
    var window_hgt = (HEIGHT*canvas_pixelstometer);
    var m_shift = 0.005; // mission shift in percentage
    console.log('fromCharCode   [' +String.fromCharCode(e.keyCode) + '] num = '+ e.keyCode);
    if(e.shiftKey){
      // left arrow
      if (e.keyCode == '37') mySel.rot = mySel.rot - 0.1*Math.PI/180;
      // right arrow
      else if (e.keyCode == '39') mySel.rot = mySel.rot + 0.1*Math.PI/180;
      //if (String.fromCharCode(e.keyCode) == '<') mission_program_next_type();
    }else if(!e.shiftKey){
      if (e.which == '38') {
          // up arrow
          mySel.real_y=mySel.real_y+m_shift*window_hgt;
      }else if (e.which == '40') {
          // down arrow
          mySel.real_y=mySel.real_y-m_shift*window_hgt;
      }
      
      if (e.which == '37') {
         // left arrow
         mySel.real_x=mySel.real_x-m_shift*window_wdt;
      }else if (e.which == '39') {
         // right arrow
         mySel.real_x=mySel.real_x+m_shift*window_wdt;
      }
      //if (String.fromCharCode(e.keyCode) == '>') mission_program_next_type();
    }
    if(e.keyCode == '27') {
      //MISSION_DESIGN=false;
      if(MISSION_DESIGN)
        mission_design_toggle(false);
      //activate_BT("mission",MISSION_DESIGN);
    }else if (e.keyCode == '187') {
       mission_program_add_leg();
    }else if (e.keyCode == '189') {
       mission_program_del_leg();
    }else if (e.keyCode == '46') {
      mission_clear();
    }
    invalidate();
}

function mission_keyup(e){
    e = e || window.event;

    //console.log('fromCharCode   [' +String.fromCharCode(e.keyCode) + '] num = '+ e.keyCode);
    if(e.keyCode == 16 && designBySection)
    {
      shiftDown = false;
      myMovePlan(e);
    }
    invalidate();
}

// Happens when the mouse is moving inside the canvas
var mission_pt_selected=undefined;
var designing_arc = false;
function myMovePlan(e){

  //console.log(boxes2[0].mission_type)
  getMouse(e);
  if(designBySection && boxes2[0].missionPtr.mission.length>=1){
    
    var customPoint = getCanvasPos_meter([mx, my], true);

    if(shiftDown && !designing_arc && boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1].type=="line"){
      // delete line
      boxes2[0].missionPtr.mission.pop(); 

      // Last segment update to arc
      seg = boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1];
      
      var arc_seg = arc_from_3_points(seg.getPoints()[0], [customPoint[0]-boxes2[0].missionPtr.xrefpoint,
        customPoint[1]-boxes2[0].missionPtr.yrefpoint], seg.getPoints()[1]);

      boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1]=new Arc([seg.getPoints()[0][0],seg.getPoints()[0][1], arc_seg.xc, arc_seg.yc, 
        seg.getPoints()[1][0], seg.getPoints()[1][1],boxes2[0].mission_speed,arc_seg.k, arc_seg.r, -1, customPoint[0]-boxes2[0].missionPtr.xrefpoint,
        customPoint[1]-boxes2[0].missionPtr.yrefpoint])
      designing_arc = true;
      invalidate();
      return;
    }else if(!shiftDown  && designing_arc){ //&& boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1].type=="arc"){
      seg = boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1];
      boxes2[0].missionPtr.mission.pop();
      boxes2[0].missionPtr.mission.push(new Line([seg.getPoints()[0][0],seg.getPoints()[0][1], seg.getPoints()[2][0],seg.getPoints()[2][1],0.3,-1]));
      boxes2[0].missionPtr.mission.push(new Line([seg.getPoints()[2][0],seg.getPoints()[2][1],  customPoint[0]-boxes2[0].missionPtr.xrefpoint,
        customPoint[1]-boxes2[0].missionPtr.yrefpoint,0.3,-1]));
      designing_arc = false;
    }


    mp_tmp = [];
    mp_tmp.push({x: customPoint[0]-boxes2[0].missionPtr.xrefpoint, y: customPoint[1]-boxes2[0].missionPtr.yrefpoint,index_to_display: 1,
      ind_seg: boxes2[0].missionPtr.mission.length-1,ind_pt: 1});
    if(boxes2[0].missionPtr.mission[mp_tmp[0].ind_seg].type=="arc")
    {
      seg = boxes2[0].missionPtr.mission[mp_tmp[0].ind_seg];
      //var arc_seg = arc_from_3_points([seg.getPoints()[0][0],seg.getPoints()[0][1]], [mp_tmp[0].x, mp_tmp[0].y],[seg.getPoints()[1][0],seg.getPoints()[1][1]]);
      //var arc_seg = arc_from_3_points(seg.getPoints()[0], [customPoint[0]-boxes2[0].missionPtr.xrefpoint,
      //  customPoint[1]-boxes2[0].missionPtr.yrefpoint], seg.getPoints()[1]);

      var ind_seg = boxes2[0].missionPtr.mission.length-1;
      SegmentPoint_Global(ind_seg,3,customPoint[0]-boxes2[0].missionPtr.xrefpoint,
        customPoint[1]-boxes2[0].missionPtr.yrefpoint, true, boxes2[0].missionPtr.mission)
      
      //seg_get =boxes2[0].missionPtr.mission[mp_tmp[0].ind_seg]; 
      //seg_get.value[seg_get.dictionary.k]=arc_seg.k;
      //seg_get.value[seg_get.dictionary.R]=arc_seg.R;
      //lastPoint = [seg.getPoints()[1][0],seg.getPoints()[1][1]];
    }
    else
    { 
      SegmentPoint_Global(mp_tmp[0].ind_seg,mp_tmp[0].ind_pt,mp_tmp[0].x, mp_tmp[0].y,true, boxes2[0].missionPtr.mission)
      //lastPoint = [mp_tmp[0].x, mp_tmp[0].y];
    }
    //if(mission_backup){
    //mission_backup = full_clone(mission);
    //mission_backup.mission = clone_mission(boxes2[0].missionPtr.mission);

/*    mrect = surrounding_rect(mission_backup);
    // Update surrounding box
    boxes2[0].real_x = mrect[0];
    boxes2[0].real_y = mrect[1];
    boxes2[0].real_w = mrect[2];
    boxes2[0].real_h = mrect[3];*/
    //boxes2[0].mission_type =1;
    //update_name_of_mission();
    //}

    mySel = boxes2[0];
    invalidate();
    isResizeDrag = false;
    expectResize = -1;
    return;
  }else if(designBySection)
  {
    var customPoint = getCanvasPos_meter([mx, my], true);
    lastPoint = customPoint;
    invalidate();
    return;
  }

  // Move a Specific point in the mission
  if(moveSingle){
    if(mission_pt_selected!=undefined){
      var canvas_pos = getCanvasPos_meter([mx, my], true);
      console.log("ind_seg" + mission_pt_selected.ind_seg)
      SegmentPoint_Global(mission_pt_selected.ind_seg,mission_pt_selected.ind_pt,canvas_pos[0]-mySel.missionPtr.xrefpoint,
        canvas_pos[1]-mySel.missionPtr.yrefpoint,true, mySel.missionPtr.mission)
      UpdateCurveParameters(mission_pt_selected.ind_seg, true,  mySel.missionPtr.mission);

      //if(mission_backup){
      /*mission_backup = full_clone(mission);
      mission_backup.mission = clone_mission(mission.mission);
      mrect = surrounding_rect(mission_backup);*/
      mySel.missionOriginalPtr = full_clone(mySel.missionPtr);
      mySel.missionOriginalPtr.mission = clone_mission(mySel.missionPtr.mission);
      
      mrect = surrounding_rect(mySel.missionPtr);

      // Update surrounding box
      mySel.real_x = mrect[0];
      mySel.real_y = mrect[1];
      mySel.real_w = mrect[2];
      mySel.real_h = mrect[3];
      mySel.mission_type =1;
      update_name_of_mission();
      //}

      //mySel = null;
      this.style.cursor='hand';
      invalidate();
      isResizeDrag = false;
      expectMovePoints = undefined;
      expectResize = -1;
    }
    else
    {
      var canvas_pos = getCanvasPos_meter([mx, my], true);
      expectMovePoints = find_near_points(mySel.missionPtr, [canvas_pos[0],canvas_pos[1]]);
      //mission_pt_selected = points;
      //console.log("[mission box planning] " + mission_pt_selected);
      //mySel.mission_type = 1;
      isResizeDrag = false;
      expectResize = -1;
      if(expectMovePoints != undefined)
        this.style.cursor='hand';
      //console.log(expectMovePoints);
      invalidate();
    }
    
    return;
  }

  if (isDrag) {
    
    mySel.x = mx - offsetx;
    mySel.y = my - offsety;   
    
    var auxPt_tl =getCanvasPos_meter([mySel.x, mySel.y], true);
    mySel.real_x =auxPt_tl[0];
    mySel.real_y =auxPt_tl[1];
    var auxPt_br =getCanvasPos_meter([mySel.x+mySel.w/2, mySel.y+mySel.h/2], true);
    mySel.real_w =Math.abs(auxPt_br[0]-auxPt_tl[0])*2;
    mySel.real_h =Math.abs(auxPt_br[1]-auxPt_tl[1])*2;

    // something is changing position so we better invalidate the canvas!
    invalidate();
  } else if (isResizeDrag) {

    // time ro resize!
    var oldx = mySel.x;
    var oldy = mySel.y;
    
    //console.log(oldy - my);
    //    8    - Rotation
    // 0  1  2
    // 3     4
    // 5  6  7
    var x_rel =(oldx - mx);
    var y_rel =(oldy - my);

    rotmx = x_rel*Math.cos(mySel.rot)+y_rel*Math.sin(mySel.rot);
    rotmy =-x_rel*Math.sin(mySel.rot)+y_rel*Math.cos(mySel.rot);

    switch (expectResize) {
      case 0: case 2: case 5: case 7:
        mySel.w  = rotmx*2;
        mySel.h  = rotmy*2;
        break;
      case 1: case 6:
        mySel.h = rotmy*2;//mySel.h/2 + (oldy - my);
        break;
      case 3: case 4:
        mySel.w = rotmx*2;
        break;
      case 8:
        mySel.rot = Math.atan2(my-(mySel.y+mySel.h/2*0), mx-(mySel.x+mySel.w/2*0))+Math.PI/2
        break;
    }

    var auxPt_tl =getCanvasPos_meter([mySel.x, mySel.y], true);
    mySel.real_x =auxPt_tl[0];
    mySel.real_y =auxPt_tl[1];
    var auxPt_br =getCanvasPos_meter([mySel.x+mySel.w/2, mySel.y+mySel.h/2], true);
    mySel.real_w =Math.abs(auxPt_br[0]-auxPt_tl[0])*2;
    mySel.real_h =Math.abs(auxPt_br[1]-auxPt_tl[1])*2;

    if(shiftpress){
      mySel.rot = Math.round(mySel.rot*180/Math.PI/5)*Math.PI/180*5;  // Round to 1deg
      mySel.real_w = Math.round(mySel.real_w/10)*10;                    // Round to 1m
      mySel.real_h = Math.round(mySel.real_h/10)*10;
    } 
    invalidate();
  }

  // if there's a selection see if we grabbed one of the selection handles
  if (mySel !== null && !isResizeDrag) {
    // Translation
    mx -= mySel.x+mySel.w/2*0;
    my -= mySel.y+mySel.h/2*0;
    // Rotation
    rotmx = mx*Math.cos(mySel.rot)+my*Math.sin(mySel.rot);
    rotmy =-mx*Math.sin(mySel.rot)+my*Math.cos(mySel.rot);

    mx = rotmx;
    my = rotmy;
    /*console.log("cursor x" + mx + " y" + my + " x0"+selectionHandles[0].x + " y0"+selectionHandles[0].y )*/
    //console.log("Rot"+ mySel.rot);
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
        
        
        /*console.log("antes "+expectResize)
        if(expectResize!=8 && (mySel.rot>Math.PI/4)){
          i = i+3;
          if(i>7){
            i-=8;
            expectResize = i;
          }
        }
        console.log("depois "+expectResize)*/
        if(this.style!=undefined){// Mobile
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
              this.style.cursor= 'url(style/cursor/rotate.png) 11 11, auto';
              break;
          }
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
    if(this.style!=undefined){// Mobile
      this.style.cursor='auto';
    }
  }
  
}
// Fill with zeros
function padStrD(i) {
   return (i < 10) ? "0" + i : "" + i;
}

Array.prototype.remove = function(elem, all) {
  for (var i=this.length-1; i>=0; i--) {
    if (this[i] === elem) {
        this.splice(i, 1);
        if(!all)
          break;
    }
  }
  return this;
};

function save_designed_Mission(){
  A=document.createElement('a');
  str = mySel.missionPtr.toText();
  txt = openFile(str, 'text/plain');
  A.href = txt;
  var temp = new Date();
  var dateStr = padStrD(temp.getFullYear()) +
                 padStrD(1 + temp.getMonth()) +
                 padStrD(temp.getDate()) + "_" +
                 padStrD(temp.getHours()) +
                 padStrD(temp.getMinutes())

  A.download =dateStr+".txt";
  A.click();
}


function mission_save_morph(){
  A=document.createElement('a');
  str = mySel.missionPtr.toTextMorph();
  txt = openFile(str, 'text/plain');
  A.href = txt;
  var temp = new Date();
  var dateStr = padStrD(temp.getFullYear()) +
                 padStrD(1 + temp.getMonth()) +
                 padStrD(temp.getDate()) + "_" +
                 padStrD(temp.getHours()) +
                 padStrD(temp.getMinutes())

  A.download =dateStr+".scxml";
  A.click();
}
// Happens when the mouse is clicked in the canvas
function myDownPlan(e){
  if(e.type != undefined)
    if(e.type=="touchstart")
      myMovePlan(e);
  getMouse(e);

  designing_arc = false;

  if(moveSingle){
    if(!mission_pt_selected){
/*      var canvas_pos = getCanvasPos_meter([mx, my], true);
      var points = find_near_points(mySel.missionPtr, [canvas_pos[0],canvas_pos[1]]);*/
      //solve the conflict more than one point selected
      if(expectMovePoints.length>1){ 
        var temp_str="";
        for(var i=0;i<expectMovePoints.length;i++)
          temp_str+=expectMovePoints[i].index_to_display+", ";
        
        temp_str=temp_str.substring(0, temp_str.length - 2)+"}"; //cut last ", "
        
        var flag_invalid=true;
        while(flag_invalid){
          var str=prompt("Warning: two or more very close points please select which of them you want\n{"+temp_str,""+expectMovePoints[0].index_to_display);
          if(str===null)
          {
            mission_pt_selected = undefined;
            expectMovePoints = undefined;
            return;
          }

          
          var index=parseInt(str);//fazer check aqui!
          for(var i=0;i<expectMovePoints.length;i++)
            if(index==expectMovePoints[i].index_to_display){
              flag_invalid=false;
              expectMovePoints =expectMovePoints[i];
              break;
            }
        }
      }else if(expectMovePoints.length==1)
        expectMovePoints =expectMovePoints[0];
      mission_pt_selected = expectMovePoints;
      console.log("[mission box planning] " + mission_pt_selected);
      mySel.mission_type = 1;
    }
    return;
  }

  //we are over a selection box
  if (expectResize !== -1) {
    isResizeDrag = true;
    return;
  } 
  
  // Don't show anything on this mode
  if(designBySection) return;

  //clear(gctx);
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
      
      clear(gctx);
      invalidate();
      return;
    }
    
  }
  // havent returned means we have selected nothing
  //mySel = null;
  // clear the ghost canvas for next time
  clear(gctx);
  // invalidate because we might need the selection border to disappear
  //invalidate();
}

function myUpPlan(e){

  // ensure that the deactivate arc design
  designing_arc = false;
  // End mission design
  if(designBySection && e.button==2)
  {
      /*boxes2[0].missionPtr.mission.pop();
      boxes2[0].missionOriginalPtr = full_clone(boxes2[0].missionPtr);
      boxes2[0].missionOriginalPtr.mission = clone_mission(boxes2[0].missionPtr.mission);
      update_mission_done(boxes2[0].missionPtr);

      mrect = surrounding_rect(boxes2[0].missionPtr);
      // Update surrounding box
      mySel = boxes2[0]
      mySel.real_x = mrect[0];
      mySel.real_y = mrect[1];
      mySel.real_w = mrect[2];
      mySel.real_h = mrect[3];
      mySel.mission_type =1;
      designBySection = false;
      //MISSION_DESIGN=false;
      update_name_of_mission();
      destroy_mission_planning();
      mission_design_toggle(false);*/
      mySel = boxes2[0];
      designBySection = false;
      if(mySel.missionPtr.mission.length>0)
      {
        mySel.missionPtr.mission.pop(); 
        if(MISSION_DESIGN)
          mission_design_toggle(false);
      }
      else
        mission_clear();

      return;
  }
  // Desinning point mission
  if(designBySection && !moveSingle){
    getMouse(e);
    var customPoint = getCanvasPos_meter([mx, my], true);
    console.log("Point X=%f Y=%f", customPoint[0],customPoint[1])
    addMissionPoint(customPoint[0],customPoint[1]);
    //mySel.rot=0;
    shiftDown = false;
  }

  // Drag Mission Points
  if(moveSingle && mission_pt_selected){
    mission_pt_selected = undefined;
    expectMovePoints = undefined;
    return;
  }

  if((isResizeDrag || isDrag) && e.button==2 && ctrlpress){
    console.log("button 2 pressed mission design");
    save_designed_Mission();
  }

  if((isResizeDrag || isDrag) && e.button==1 && ctrlpress){
    console.log("button 1 pressed mission design");
    send_mission(mySel.missionPtr);
  }

  // Clicking in one of the buttons
  if(isResizeDrag && expectResize>8 && expectResize<13){ 
    console.log(button_text[expectResize-9]);
    switch (button_text[expectResize-9]) {
      case '+':
        console.log("Plus Mission");
        mySel.mission_arg++;
        break;
      case '-':
        console.log("Minus Mission");
        mySel.mission_arg--;
        // Saturate mission to 1 leg
        if(mySel.mission_arg<2) mySel.mission_arg=2;
        break;
      case '>':
        mySel.mission_type++;
        if(mySel.mission_type>3) mySel.mission_type=1;
        if(!mission_backup && mySel.mission_type==1 )
          mySel.mission_type=2;

        switch (mySel.mission_type){
          case 1: mySel.mission_type_text ="PRE-LOADED MISSION"; break;
          case 2: ClearMission(); mySel.mission_type_text ="LAWNMOWER NORMAL"; break;
          case 3: ClearMission(); mySel.mission_type_text ="LAWNMOWER INVERTED"; break;
          case 4: ClearMission(); mySel.mission_type_text ="ZERO x20"; mySel.mission_arg = 1;  break;
          case 5: ClearMission(); mySel.mission_type_text ="CIRCLE x20"; mySel.mission_arg = 1;  break;
        }
        console.log("Next type Mission");
        break;
      case '*':
        localStorage['mdconf_formation']=JSON.stringify(mission.formation);
        disp_overlay('mission_design_configs');
        console.log("Configurations");
        break;
    }
    invalidate();
    isDrag = false;
    isResizeDrag = false;
    return;
  }
  isDrag = false;
  isResizeDrag = false;
  expectResize = -1;
}

// Copy this to Mission_Planning.js
var lastPoint = undefined;
var moveSingle = false;
//var arc_segment = undefined;
function addMissionPoint(x, y){
  if(boxes2[0].missionPtr.xrefpoint == undefined && boxes2[0].missionPtr.yrefpoint == undefined)
  {
    boxes2[0].missionPtr.xrefpoint=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
    boxes2[0].missionPtr.yrefpoint=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
  }
  // Mission already have something
  x -= boxes2[0].missionPtr.xrefpoint;
  y -= boxes2[0].missionPtr.yrefpoint;

  // First Point
  if(boxes2[0].missionPtr.mission.length<1)
  {
    boxes2[0].missionPtr.mission.push(new Line([x,y,x+1,y+1,0.3,-1]))
  }
  else
  {
    seg = boxes2[0].missionPtr.mission[boxes2[0].missionPtr.mission.length-1];
    boxes2[0].missionPtr.mission.push(new Line([seg.value[seg.dictionary.xe],seg.value[seg.dictionary.ye],x,y,0.3,-1]))
  }
  lastPoint = [x, y];
  invalidate();
}

// adds a new node
function myDblClick(e) {
  getMouse(e);
  // for this method width and height determine the starting X and Y, too.
  // so I left them as vars in case someone wanted to make them args for something and copy this code
  var width = 20;
  var height = 20;
  addRect(mx - (width / 2), my - (height / 2), width, height, 'rgba(220,205,65,0.2)');
}


function invalidate() {
  canvasValid = false;
}

// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(e) {
      var element = canvas_mp, offsetX = 0, offsetY = 0;

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

    var posx = posy = 0;
    //var e = window.event || event;
    
    if(typeof e.pageX == 'undefined')
        return;
    if (e.targetTouches && e.type.indexOf("touch")!=-1){
        posx = e.targetTouches[0].pageX;
        posy = e.targetTouches[0].pageY;
    }else if ('undefined'!=typeof e.pageX){//e.pageX || e.pageY)     {
        posx = e.pageX;
        posy = e.pageY;
    }else if (e.clientX || e.clientY){
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
      mx = posx - offsetX;
      my = posy - offsetY
}

function update_mission_done(mission_input)
{
  var found_mission = false;
  for (var mn=0; mn<missions_to_be_displayed.length; mn++)
  {
      if(missions_to_be_displayed[mn].mission_id===mission_input.mission_id)
      {
          missions_to_be_displayed[mn] = mission_input;
          found_mission = true;
          break;
      }
  }
  if(!found_mission)
    console.error("something went wrong the mission is not there")
}
// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();
window.init_mission_planning = init_mission_planning;
window.destroy_mission_planning = destroy_mission_planning;
window.mission_program_resize = mission_program_resize;
window.mission_save_morph =mission_save_morph;
window.mission_update_edited =mission_update_edited;
window.update_mission_done =update_mission_done;
window.mission_clear =mission_clear;
window.mission_box_send_to_vehicle = mission_box_send_to_vehicle;

function mission_box_send_to_vehicle(){
  send_mission(mySel.missionPtr)
}

function mission_clear(){
  var found_index = -1;
  for (var mn=0; mn<missions_to_be_displayed.length; mn++)
  {
      if(missions_to_be_displayed[mn].mission_id==mySel.missionPtr.mission_id)
      {
          found_index=mn;
          break;
      }
  }
  if(found_index!=-1)
  {
    // HACK for backward compatibility
    if(found_index==0)
    {
      mission.mission=[];
      missions_to_be_displayed[0].mission = [];
    }
    else
      missions_to_be_displayed.splice(found_index,1);

    if(missions_to_be_displayed.length==1 && missions_to_be_displayed[0].mission.length==0)
    {
      mySel =null; 
      lastPoint=undefined;
      destroy_mission_planning();
      mission_design_toggle(false);
    }
    else
    {
      boxes2.splice(boxes2.indexOf(mySel),1);
      mySel = boxes2[0];
    }
    //MISSION_DESIGN=false; 
    //activate_BT("mission",MISSION_DESIGN);
    invalidate();
  }
}

window.mission_moveSingle = function (flag){
  if(flag===undefined){
    if(moveSingle==false) moveSingle=true; else moveSingle = false; // Toggle moveSingle flag
  }else{
    moveSingle = flag;
  }

  Show_Points_ID_Flag=moveSingle;
  var obj = document.getElementById('mission_moveSingleBt');
  if(moveSingle) {
    //mySel = null;
    removeClass('notactivated',obj); addClass('activated',obj); 
  } else { 
    //mySel = boxes2[0];
    removeClass('activated',obj); addClass('notactivated',obj);
  }
  
  invalidate();
}

function update_name_of_mission(box){
  box = typeof box !== 'undefined' ? box : mySel;
  switch (box.mission_type){
    case 1: box.mission_type_text ="PRE-LOADED MISSION"; break;
    case 2: box.mission_type_text ="LAWNMOWER NORMAL";  break;
    case 3: box.mission_type_text ="LAWNMOWER INVERTED"; break;
    case 4: box.mission_type_text ="ZERO "+box.mission_arg+" Turns"; break;
    case 5: box.mission_type_text ="CIRCLE "+box.mission_arg+" Turns"; break;
    case 6: box.mission_type_text ="STAR "+box.mission_arg+" Edges"; break;
    case 7: box.mission_type_text ="EIGHT "+box.mission_arg+" Turns";; break;
  }
  invalidate();
}

window.mission_program_add_leg = function () { 
  //mySel = boxes2[0]; 
  mySel.mission_arg++;  
  // Star;
  if(mySel.mission_type ==6) mySel.mission_arg++;  // Two times

  mission_moveSingle(false);
  update_name_of_mission();
}

window.mission_program_del_leg = function () { 
  // Auto select mission
  //mySel = boxes2[0];
  mySel.mission_arg--; 
  // Lawn Mower
  if(mySel.mission_arg<2 && (mySel.mission_type ==1 || mySel.mission_type==2)) mySel.mission_arg=2; 
  // Zero Mission or Eight Mission
  if((mySel.mission_type ==4 || mySel.mission_type ==5 || mySel.mission_type ==7) && mySel.mission_arg<1) mySel.mission_arg=1;
  // Star Mission
  if(mySel.mission_type ==6){
    mySel.mission_arg--;  // Two times
    if(mySel.mission_arg<3)  mySel.mission_arg=3;
  } 
  mission_moveSingle(false);
  update_name_of_mission();
}
window.mission_program_next_type = function () {     
  // De activate move Single
  mission_moveSingle(false);

  // Auto select mission
  //mySel = boxes2[0];

  mySel.mission_type++;
  
  // Circular list
  if(mySel.mission_type>7) mySel.mission_type=1;

  // Check for a preloaded mission
  if(mySel.mission_type==1 && (!mySel.missionPtr || mySel.missionOriginalPtr.mission.length==0))
    mySel.mission_type=2;

  ClearMission();
  switch (mySel.mission_type){
    /*case 1: mySel.mission_type_text ="PRE-LOADED MISSION"; break;
    case 2: ClearMission(); mySel.mission_type_text ="LAWNMOWER NORMAL";  break;
    case 3: ClearMission(); mySel.mission_type_text ="LAWNMOWER INVERTED"; break;*/
    case 4: ClearMission(); if(mySel.mission_arg<1)  mySel.mission_arg=1; break;
    case 5: ClearMission(); if(mySel.mission_arg<1)  mySel.mission_arg=1; break;
    case 6: ClearMission(); if(mySel.mission_arg<5 || (mySel.mission_arg%2==0))  mySel.mission_arg=5; break;
    case 7: ClearMission(); if(mySel.mission_arg<1)  mySel.mission_arg=1; break;
    case 8: ClearMission(); mySel =null; lastPoint=undefined; break;
  }

  update_name_of_mission();
}
window.dummy_update = function () {
  localStorage['mdconf_mission']=JSON.stringify(mySel.missionPtr.mission);
  localStorage['mdconf_mission_id']=JSON.stringify(mySel.missionPtr.mission_id);
}

window.mission_program_configs = function () {
  //mySel.missionPtr.formation = localStorage.getItem('mdconf_formation');
  //mySel.missionPtr.mission = localStorage.getItem('mdconf_mission');
  //mySel.missionPtr.mission_id = localStorage.getItem('mdconf_mission_id');
  //mySel.missionPtr.standard_mission_flag = localStorage.getItem('mdconf_standard_mission_flag');
  //mySel.mission_speed=localStorage.getItem('mdconf_mission_speed');
  update_mission_done(mySel.missionPtr)
  //localStorage['mdconf_formation']=JSON.stringify(mySel.missionPtr.formation);
  localStorage['mdconf_mission']=JSON.stringify(mySel.missionPtr.mission);
  localStorage['mdconf_mission_id']=JSON.stringify(mySel.missionPtr.mission_id);
  //localStorage['mdconf_standard_mission_flag']=JSON.stringify(mySel.missionPtr.standard_mission_flag);
  //localStorage['mdconf_mission_speed']=JSON.stringify(mySel.mission_speed);
  disp_overlay('mission_design_configs');
  //window.close();
  //setTimeout(function(){   update_mission_done(mySel.missionPtr);
  //dummy_update();
  //disp_overlay('mission_design_configs_dummy');
  //}, 1000);
  //disp_overlay('mission_design_configs_dummy');
  disp_overlay('mission_design_configs');
  close();
  console.log("Configurations");
}
})(window);

