  var Scenario = 6;

// MDS Panel
var winMDeepSea;

// GPS Mode translation
var DICT_GPS_MODE = {0: 'NO GPS', 1: 'AUTO', 2: 'RFLOAT',3: 'RFIXED', 9: 'CADDY', 10: 'USBL'}
var DICT_OP_MODE  = {0: 'IDLE', 1:'JOY', 4: 'WP', 6: 'CPF', 7:'RRT_PF', 8: 'ROF', 9: 'IDLE', 10: 'MORPH'};

var VARS = ["GPS_X", "GPS_Y", "IMU_Head", "leaks_upper", "leaks_lower", "GPS_MODE", "Modem_Distance", "Modem_Depth", "Modem_Heading", "ECO_Distance", "BAT_Cell6", "Thrusters_OFF", "PIC_Pressure", "MAT_Flag", "MATLAB_Value1", "MATLAB_Value2", "MATLAB_Value3", "MATLAB_Value4", "Modem_Yellow_Time", "Modem_Black_Time"];
// USBL martelada
var RULER=false, MISSION_DESIGN=false;
var ROS_VARS = []; // ["bat_monit/data", "State", "gcv/state", "lsv/state", "position_usbl","HState","Leak1", "Leak2", "Pressure", "Gamma", "Flag", "Altimeter", "LoadCell", "uwsim/position", "State_black"];
var ROS_SPARE_VARS = [];
var ROS_GPS_VARS = ["mode"], ROS_GPS_ALL = false;
var ROS_IMU_VARS = ["Yaw"], ROS_IMU_ALL = false;
var ROS_BAT_VARS = ["Volt_Cell"], ROS_BAT_ALL = false;
var ROS_STATE_VARS = ["Yaw","Pitch", "X", "Y", "u", "GPS_Good", "In_Press", "Depth", "altitude"], ROS_STATE_ALL = false;
var CURRENT_KEYS = [], CURRENT_STATES = [];
var STRINGS = [];
var color_palette = {'red': '#F44336', 'white': '#FFFFFF', 'yellow': '#FFEB3B', 'amber': '#FFC107', 'green900': '#1B5E20', 'red900': '#B71C1C', 'light_green': '#8BC34A', 'black': '#212121', 'green': '#4CAF50', 'indigo': '#3F51B5', 'blue100':'#BBDEFB'};
var VehicleServer;
//var Gyros=false, Spds=false, Battery = false, GPS=false, RAW=false, MATLAB=false, Modems=false, ;
var display_flags, WayPoint=false, VCurr=1;

var DPoints = [], DPoints_green = [], CURRENT_STATES = new Array();
var teste;
var newDrawing = false;
//var moveSingle = false;
var over_bt =-1;
var VehiclesData = [];
var error_list =[];
function Vehicle_Config(name, img_path, color, active, ip, wp1, wp2, state_topic_name, state_topic_source) {
  this.name = name;
  this.img_path = img_path;
  this.color = color;
  this.active = active;
  this.ip = ip;
  this.wp1 = wp1;
  this.wp2 = wp2;
  this.state_topic_name = state_topic_name;
  this.state_topic_source = state_topic_source;
  this.trail_points = false;
  this.disable_icon = false;
  this.gps_mode = 0;
  this.battery = 0;
  this.op_mode = 0;
  this.inpressure = 0;
  this.upperleak = true;
  this.lowerleak = true;
  this.timer_update = 0;
  this.VehiclePos={'STOP':0, 'stop_action':false, 'Project_STOP':1, 'project_stop_action':false, 'holdpos':false};
  this.GPS_X=0;
  this.GPS_Y=0;
  this.surge=0
  this.Depth=0;    
  this.Altitude=0;
  this.YAW=90;
  this.PITCH=0;
  this.VehiclePath={'x':[],'y':[], 'z':[], 'alt':[], 'z_time':[]};
  this.SystemState=true;
  this.display_all=true;
  this.mds_panel = false;
  this.txtStatus = "No data received\n";
  /*create_spans(i);*/
}



function addVehicle(i){
    for(var j=0; j<holdPosPre.length; j++){
      holdPosPre[j].x.push(-1); holdPosPre[j].y.push(-1);
    }
    /*create_spans(i);*/
    CURRENT_STATES[i] = [];
}



/*
 * Init Vars
 */
function init_vars() {
  var vehicles_num = VehiclesData.length;
  holdPosPre = [];
  //holdPosPre
  var holdPosPre_num_sets = 3;
  for (var i=0; i< holdPosPre_num_sets; i++) {
    holdPosPre.push({'x': [],'y': []});
  }
  for (var i=0; i<VehiclesData.length;i++) {
  	addVehicle(i);
  }
}

init_vars();

function addClass( classname, element ) {
    if(element)
    {
        var cn = element.className;
        //test for existance
        if( cn.indexOf( classname ) != -1 ) {
            return;
        }
        //add a space if the element already has class
        if( cn != '' ) {
            classname = ' '+classname;
        }
        element.className = cn+classname;
    }
}

function removeClass( classname, element ) {
    if(element)
    {
        var cn = element.className;
        var rxp = new RegExp( "\\s?\\b"+classname+"\\b", "g" );
        cn = cn.replace( rxp, '' );
        element.className = cn;
    }
}

var sps;
//window.onresize = draw(-1,-1,-1,-1);
//var lastWindowHeight = $(window).height();
//var lastWindowWidth = $(window).width();

//$(window).resize(function() {

    //confirm window was actually resized
    //if($(window).height()!=lastWindowHeight || $(window).width()!=lastWindowWidth){

        //set this windows size
        //lastWindowHeight = $(window).height();
        //lastWindowWidth = $(window).width();

        //call my function
        //draw(-1,-1,-1,-1);
    //}
//});
window.onkeydown = KeyDownHandler;
window.onkeyup = KeyUpHandler;
//window.onmousedown = MouseDown;

if(document.getElementById('html')){
    document.getElementById('html').bind('keydown', function(){ KeyDownHandler(); });
    document.getElementById('html').bind('keyup', function(){ KeyUpHandler(); });
    document.getElementById('html').bind('mousewheel', function(){ scrollZoom(); });
    //document.getElementById('html').bind('mousedown', function(){ MouseDown(); });
}
// Mouse Scroll 
//adding the event listerner for Mozilla
if(window.addEventListener){
    document.addEventListener('DOMMouseScroll', scrollZoom, false);
}
//for IE/OPERA etc
document.onmousewheel = scrollZoom;
//document.onmousedown = MouseDown;

var MousePosition = new Array(0,0);
var scaleZoom = 1;
var ctrlpress =false, altpress=false, shiftpress=false, mouse_wheel_drag=false;
var Point = false;

var xmlhttp = new Array();
var requestTimer = [];

// Update xmlhttp variable
function addVehicleInterface(){

}

function init_VehicleInterface(){
	for(var i=0; i<VehiclesData.length; i++){
		addVehicleInterface(i);
	}
}


function toggle_stop_button(morph_flag,enable_flag, assign_flag){
    if(!morph_flag){
        if(enable_flag){
            if(assign_flag) VehiclesData[VCurr-1].VehiclePos.STOP =1;
            btSTOP_UI(true);
        }else{
            if(assign_flag) VehiclesData[VCurr-1].VehiclePos.STOP =0;
            btSTOP_UI(false);
        }
    }else{
        if(enable_flag){
            if(assign_flag) VehiclesData[VCurr-1].VehiclePos.Project_STOP =1;
            document.all.btmorphstp.innerHTML = "PROJECT START!";
            document.all.btmorphstp.style['color'] = color_palette['green'];
        }else{
            if(assign_flag) VehiclesData[VCurr-1].VehiclePos.Project_STOP =0;
            document.all.btmorphstp.innerHTML = "PROJECT STOP!";
            document.all.btmorphstp.style['color'] = color_palette['red'];
        }
    }
}

function KeyDownHandler(event){
	var keyCode = ('which' in event) ? event.which : event.keyCode;
    if(event.shiftKey){
        shiftpress = true;    
        vehicle_spans = document.getElementsByClassName('overimage');
        for(var i=0; i<vehicle_spans.length;i++)
            vehicle_spans[i].style.setProperty('cursor','url(style/images/openhand.cur)');
    }
    if(keyCode ==32) //space
        btSTOP();
    else if(keyCode ==72 && ctrlpress==true && shiftpress == true){ // alt+ h
        if($("#div_help_menu").hasClass("help_hidden")==true)
            $("#div_help_menu").removeClass("help_hidden");
        else
            $("#div_help_menu").addClass("help_hidden");
    }
    else if(keyCode ==37); //left
    else if(keyCode ==38); //up
    else if(keyCode ==39); //right
    else if(keyCode ==40); //down
    else if(keyCode ==17) //ctrl
        ctrlpress=true;
    else if(keyCode ==18){ //alt
        altpress=true;
    }else if(keyCode ==72){ //h
        document.all.txtXD.value = holdPosPre[0].x[VCurr-1];
        document.all.txtYD.value = holdPosPre[0].y[VCurr-1];localStorage['holdPosition']=JSON.stringify(holdPosPre);
        holdPos();
    }else if(keyCode ==74){ //j
        holdPosPre[0].x[VCurr-1] = holdPosPre[1].x[VCurr-1]; holdPosPre[0].y[VCurr-1] = holdPosPre[1].y[VCurr-1];
        document.all.txtXD.value = holdPosPre[1].x[VCurr-1];
        document.all.txtYD.value = holdPosPre[1].y[VCurr-1];localStorage['holdPosition']=JSON.stringify(holdPosPre);
        holdPos();
    }else if(keyCode ==75){ //k
        holdPosPre[0].x[VCurr-1] = holdPosPre[2].x[VCurr-1]; holdPosPre[0].y[VCurr-1] = holdPosPre[2].y[VCurr-1];
        document.all.txtXD.value = holdPosPre[2].x[VCurr-1];
        document.all.txtYD.value = holdPosPre[2].y[VCurr-1];localStorage['holdPosition']=JSON.stringify(holdPosPre);
        holdPos();
    }else if(keyCode ==49 && ctrlpress && altpress == true){ //ctrl + alt + 1
        chVeiculo(1);
    }else if(keyCode ==50 && ctrlpress && altpress == true){ //ctrl + alt + 2
        chVeiculo(2);
    }else if(keyCode ==51 && ctrlpress && altpress == true){ //ctrl + alt + 3
        chVeiculo(3);
    }else if(keyCode ==52 && ctrlpress && altpress == true){ //ctrl + alt + 4
        chVeiculo(4);
    }else if(keyCode ==53 && ctrlpress && altpress == true){ //ctrl + alt + 5
        chVeiculo(5);
    }else if(keyCode ==76 && ctrlpress==true && shiftpress == true){ //ctrl + shift + l
        displayLogBookEntry();
    }
    //PreventDefault();
    //alert(keyCode);
}

function KeyUpHandler(event){
	var keyCode = ('which' in event) ? event.which : event.keyCode;
    if(!event.shiftKey){
        shiftpress = false;
        vehicle_spans = document.getElementsByClassName('overimage');
        for(var i=0; i<vehicle_spans.length;i++)
            vehicle_spans[i].style.setProperty('cursor','pointer');
    }
    if(keyCode ==17)// ctrl
        ctrlpress=false;
    else if(keyCode ==18){ //alt
        altpress=false;
    }
    //alert(keyCode);
}

function chScen(id,un, init)
{
  var un2=1;
  localStorage.ScnID=id;
  localStorage.ScnUN=un;
  var name=''+(Scenario+10);
  //if(Scenario==ScenNames.length) // Last dropdown menu item
  //    un2=-1;
  var new_Scenario=parseInt(id)-10;
  if(new_Scenario != Scenario){
      //ddCheck(id,un,name, un2);
      Scenario=new_Scenario;
  }
  
  // Initialize critical variables
  if(init==true && localStorage.canvas_xtl)
  {
    console.log("initializing map with saved params")
    canvas_xtl = JSON.parse(localStorage.canvas_xtl);
    canvas_ytl = JSON.parse(localStorage.canvas_ytl);
    initial_scale = JSON.parse(localStorage.initial_scale);
    scaleZoom =  JSON.parse(localStorage.scaleZoom);
    scen_init_old_values = true;
  }
  else
  {
    canvas_xtl = Scenarios[Scenario-1].refpoint[0];
    canvas_ytl = Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height;
    scaleZoom = 1;
    scen_init_old_values = false;
  }

  console.log("change scenario!!!!")
  imgLoaded = false; // Not Loaded
  imgScen.src = Scenarios[Scenario-1].path;//ScenNames[Scenario-1];
  //draw(0,0,1,1);
}

function DrawVehiclePath(nVehicle){
    var canvas = document.getElementById('ctrMap'); var ctx = canvas.getContext('2d');    

    // Don't draw becouse it's checked
    if(!VehiclesData[nVehicle].display_all) return;

	if(VehiclesData[nVehicle].ellipse){
        drawellipse(VehiclesData[nVehicle].GPS_X,VehiclesData[nVehicle].GPS_Y, VehiclesData[nVehicle].ellipse_axisx,VehiclesData[nVehicle].ellipse_axisy, VehiclesData[nVehicle].ellipse_angle, VehiclesData[nVehicle].color, true, color_palette['blue100'],undefined)
	}else if(VehiclesData[nVehicle].trail_points){
        for(var i=0;i<(VehiclesData[nVehicle].VehiclePath.x.length-1);i++){
            circles(VehiclesData[nVehicle].VehiclePath.x[i],VehiclesData[nVehicle].VehiclePath.y[i], VehiclesData[nVehicle].color, false);
        }
    }else{
        ctx.lineWidth   = 2;
        ctx.strokeStyle = VehiclesData[nVehicle].color; 
        ctx.beginPath();
        for(var i=0;i<(VehiclesData[nVehicle].VehiclePath.x.length-1);i++){
            var pt=getCanvasPos_pixel([VehiclesData[nVehicle].VehiclePath.x[i],VehiclesData[nVehicle].VehiclePath.y[i]],true);
            ctx.moveTo(pt[0], pt[1]);
            pt=getCanvasPos_pixel([VehiclesData[nVehicle].VehiclePath.x[i+1],VehiclesData[nVehicle].VehiclePath.y[i+1]],true);
            ctx.lineTo(pt[0],pt[1]);
        }
        ctx.closePath();
        ctx.stroke();
    }
}
function drawTriangle(canvas, pt, size, color, angle,dist){
   var canvas = document.getElementById(canvas);
    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        angle =angle+Math.PI/2;
        /*var pt1= {'x':pt[0]-size/2*Math.cos(angle)-size/2*Math.sin(angle), 'y': pt[1]-size/2*(-Math.sin(angle))-size/2*Math.cos(angle)};
        var pt2= {'x':pt[0]+size/2*Math.cos(angle)-size/2*Math.sin(angle), 'y': pt[1]+size/2*(-Math.sin(angle))-size/2*Math.cos(angle)};
        var pt3= {'x':pt[0]+size/2*Math.sin(angle), 'y': pt[1]+size/2*Math.cos(angle)};
*/
        ctx.save();
        ctx.translate(pt[0],pt[1]);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeText(parseInt(dist)+"m", 0, -size);
        ctx.fillText(parseInt(dist)+"m", 0, -size);
/*        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.lineTo(pt3.x, pt3.y);*/
        ctx.moveTo(-size/2,-size/2);
        ctx.lineTo(size/2,-size/2);
        ctx.lineTo(0,size/2);
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
function PrintVehicle(){
    var posMap = findPos(document.all.ctrMap);
    var Xref = posMap[0];
    var Yref = posMap[1];
    var canvas = document.getElementById('ctrMap'); var ctx = canvas.getContext('2d');

    //draw(-1,-1,-1,-1); //Render again
    if(!sps) return;
    for(var i=0;i<sps.length;i++)
    {
	    var heightV = sps[i].clientHeight, widthV = sps[i].clientWidth;
      var pt=getCanvasPos_pixel([VehiclesData[i].GPS_X, VehiclesData[i].GPS_Y], true);
      var x=pt[0] + Xref-widthV/2, y = pt[1] + Yref-heightV/2;
      var x_val=parseInt(x)-0*widthV/2;
      var y_val=parseInt(y)-0*heightV/2;

      rad=VehiclesData[i].YAW*Math.PI/180; 
      cosd = Math.round(Math.cos(rad)*1000000)/1000000; 
      sind=Math.round(Math.sin(rad)*1000000)/1000000;

      // draw border around span
      if((VCurr-1)==i)
      {
        sps[i].style['border'] = '1px solid blue';
        sps[i].style['border-radius'] = '25px';
      }
      else
        sps[i].style['border'] = '0px';

      max_dim = Math.max(heightV, widthV);
      if(((y-heightV/2)<Yref || (x-widthV/2)<Xref || (y+max_dim)>(canvas.offsetHeight+Yref) || 
        (x+max_dim)>(canvas.offsetWidth+Xref) || VehiclesData[i].disable_icon && VehiclesData[i].display_all) ||
        (VehiclesData[i].GPS_X == 0 && VehiclesData[i].GPS_Y==0) )
      {
          sps[i].style.visibility='hidden';
          // Draw a triangle pointing the vehicle
          if(VehiclesData[i].active)
          {
              var triangle_size = 20;
              var x_sat = parseInt(Math.min(x_val+widthV/2, Xref+canvas.offsetWidth-triangle_size/2));
              var y_sat = parseInt(Math.min(y_val+heightV/2, Yref+canvas.offsetHeight-triangle_size/2));
              x_sat = parseInt(Math.max(x_sat, Xref+widthV/2));
              y_sat = parseInt(Math.max(y_sat, Yref+heightV/2));
              //var angle = Math.atan2(y-(pt[1]+Yref), x-(pt[0]+Xref));
              var angle = Math.atan2(y_sat-(y_val+heightV/2), x_sat-(x_val+widthV/2));
              var distance = Math.hypot(y_sat-(y_val+heightV/2), x_sat-(x_val+widthV/2));
              
              // Only print if the vehicle is not in 0,0
              if(VehiclesData[i].GPS_X!=0 && VehiclesData[i].GPS_Y!=0)
                  drawTriangle('ctrMap', [x_sat-Xref, y_sat-Yref], triangle_size,VehiclesData[i].color, angle, distance*canvas_pixelstometer);
          }
          x_val=0; y_val=0;
      }
      else
      {
        sps[i].style.visibility='visible';
        if(!VehiclesData[i].display_all) sps[i].style.visibility='hidden';

        if(VehiclesData[i].vector_icon!=undefined)
        {
          sps[i].style.visibility='hidden';
          // ctx.fillStyle = 'black';
          ctx.save();
          var ptn=getCanvasPos_pixel([VehiclesData[i].GPS_X, 
                                      VehiclesData[i].GPS_Y], true)
          ctx.translate(ptn[0],ptn[1])
          ctx.rotate(rad+Math.PI);
          ctx.lineCap = 'square';
          ctx.strokeStyle = VehiclesData[i].color;
          ctx.beginPath();
          ctx.lineWidth = 2;  
          ctx.moveTo(VehiclesData[i].vector_icon.x[0]/canvas_pixelstometer,
                     VehiclesData[i].vector_icon.y[0]/canvas_pixelstometer);
          for(var j=0;j<VehiclesData[i].vector_icon.x.length;j++)
          {
            ctx.lineTo(VehiclesData[i].vector_icon.x[j]/canvas_pixelstometer,
                       VehiclesData[i].vector_icon.y[j]/canvas_pixelstometer);
            ctx.moveTo(VehiclesData[i].vector_icon.x[j]/canvas_pixelstometer,
                       VehiclesData[i].vector_icon.y[j]/canvas_pixelstometer);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      }

      
      sps[i].style['-webkit-transform']      ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+x_val+','+y_val+')';
      sps[i].style.MozTransform               ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+x_val+','+y_val+')';
      sps[i].style['OTransform']          ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+x_val+','+y_val+')';
      sps[i].style['msTransform']         ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+x_val+','+y_val+')';
      sps[i].style['transform']                ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+x_val+','+y_val+')';        
    }
    if(newDrawing)
        newDrawing=false;
}

function Init(){
    //document.all.map_img.draggable=false;
    /*if(document.fullScreen){
        window.open ("index.html","","fullscreen=yes");  
        self.close();
    }*/
    //document.getElementById('map_img').draggable=false;
    // mds panel
    winMDeepSea = document.getElementById("iframeMDeepSea").contentWindow;

    Scenario =7;
    programming_ui=false;
    setInterval("askIMPVARS();",1000);
    setInterval("draw(-1,-1,-1,-1);",500);
    init_flags_show_vehicles();
    
    // Hide left bar by default
    VisualHide = false;
    hideVisualBar();
    
    if(localStorage.VCurr){
        VCurr = parseInt(localStorage.VCurr);
    }else{
        VCurr = 1;
    }
    
    if(localStorage.ROS_VARS)
        ROS_VARS = JSON.parse(localStorage.ROS_VARS);
    else{
        ROS_VARS = ['State', 'bat_monit/data','leaks/upper','leaks/lower','Flag','Altimeter', 'LoadCell'];
        localStorage['ROS_VARS']=JSON.stringify(ROS_VARS);
    }
    
    if(localStorage.ROS_SPARE_VARS)
        ROS_SPARE_VARS = JSON.parse(localStorage.ROS_SPARE_VARS);
    else{
        ROS_SPARE_VARS = ['imu/data','gps/data','ThrusterR/Status','ThrusterL/Status','ThrusterVR/Status','ThrusterVL/Status','gcv/state','lsv/state','HState','position_usbl'];
        localStorage['ROS_SPARE_VARS']=JSON.stringify(ROS_SPARE_VARS);
    }
        
    if(localStorage.ScnID){
        chScen(localStorage.ScnID, localStorage.ScnUN, true);
    }else{
        chScen('11', 1);
    }
    
    if(localStorage.ckStre){
        if(localStorage.ckStre ==1){
            document.all.ckStre.checked = true;
        }else{
            document.all.ckStre.checked = false;
        }
    }

    if(localStorage.display_flags)
        display_flags = JSON.parse(localStorage.display_flags);
    else{
        display_flags = {IMU: false, Thrusters: false, Battery: false, GPS: false, Pressure: false, RAW: false, MATLAB: false, Modems: false};
        localStorage['display_flags']=JSON.stringify(display_flags);
    }
    update_display_flags();
    
    // Load last trails
    if (localStorage.VehiclesData && localStorage.VehiclesData.length != 0) {
      VehiclesData = JSON.parse(localStorage.VehiclesData);
      // Important variables that shouldn't be saved
      for(var i=0;i<VehiclesData.length;i++){
        if(VehiclesData[i].active){
            VehiclesData[i].timer_update = 0;
            VehiclesData[i].received_var = Date.now()/1000.0-5.0;
        }
        if(!VehiclesData[i].vector_icon)
          VehiclesData[i].vector_icon = undefined;

        VehiclesData[i].inpressure = 0;
        VehiclesData[i].upperleak = true;
        VehiclesData[i].lowerleak = true;
        VehiclesData[i].battery = 0;
        VehiclesData[i].gps_mode = 0;
        VehiclesData[i].op_mode = 0;
        VehiclesData[i].txtStatus = "No data received\n";
        /* VehiclePath Clear */
        /*VehiclesData[i].VehiclePath.x = [];
        VehiclesData[i].VehiclePath.y = [];
        VehiclesData[i].VehiclePath.z = [];
        VehiclesData[i].VehiclePath.z_time= [];
        VehiclesData[i].VehiclePath.alt = [];
        VehiclesData[i].GPS_X = 0;
        VehiclesData[i].GPS_Y = 0;
        VehiclesData[i].surge=0*/
        //VehiclesData[i].display_all = true;
      }
    } else {
      //name, img_path, color, active, ip, wp1, wp2, state_topic_name, state_topic_source
      VehiclesData.push(new Vehicle_Config('mred', 'style/images/AUVm.png', color_palette['red'], true, 'mred', [-1, -1], [-1, -1], 'State', 0));
      VehiclesData.push(new Vehicle_Config('mblack', 'style/images/AUVe.png', color_palette['white'], true, 'mblack', [-1, -1], [-1, -1], 'State', 1));
      VehiclesData.push(new Vehicle_Config('myellow', 'style/images/AUVs.png', color_palette['yellow'], true, 'myellow', [-1, -1], [-1, -1], 'State', 2));
      VehiclesData.push(new Vehicle_Config('Delfim', 'style/images/ASV_delfim.png', color_palette['amber'], false, 'delfim', [-1, -1], [-1, -1], 'State', 3));
      VehiclesData.push(new Vehicle_Config('dummy', 'style/images/ASV_delfim.png', color_palette['amber'], false, 'dummy', [-1, -1], [-1, -1], 'State', 4));
      localStorage.VehiclesData = JSON.stringify(VehiclesData);
    }

    update_spans();
    sps = document.getElementsByClassName('overimage');
    
    for(var i=0;i<sps.length;i++){    
        sps[i].style['left']  = parseInt(0)+'px';
        sps[i].style['top']   = parseInt(0)+'px';
        //sps[i].style['-webkit-transform-origin']='3px 30px';
    }

    if(localStorage.DPoints_green)
      DPoints_green = JSON.parse(localStorage.DPoints_green);

    if(localStorage.DPoints)
      DPoints = JSON.parse(localStorage.DPoints);

    chVeiculo(-1, true);
    //if(localStorage['VARS'])
    //    VARS =     JSON.parse(localStorage['VARS']);
    //backCanvas = document.createElement('canvas');
    //draw(0,0,1,1); //Last thing to do

    createXMLRequesters();

    draw(-1,-1,-1,-1);
    $('.modal-trigger').leanModal();
    document.getElementById('ctrMap').addEventListener('touchstart', MouseDown,false);
    document.getElementById('ctrMap').addEventListener('touchend', MouseUpCanvas,false);
    document.getElementById('ctrMap').addEventListener('touchmove', MouseMoveCanvas,false);

    document.getElementById('bathyfile_UP').addEventListener('change', readSensorFile, false);
	
}

function createXMLRequesters(){
  //Http Requester
if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
    for (var i = 0; i < VehiclesData.length; i++) {
        xmlhttp.push(new XMLHttpRequest());
    }
}else{// code for IE6, IE5
    for (var i = 0; i < VehiclesData.length; i++) {
        xmlhttp.push(new ActiveXObject("Microsoft.XMLHTTP"));
    }
}

for(var j=0; j<VehiclesData.length;j++){
    //break;
    if (xmlhttp[j]){
      xmlhttp[j].onreadystatechange = function() {
            for(var i=0; i<VehiclesData.length;i++){
                if (xmlhttp[i] && xmlhttp[i].readyState != 4)  { continue; }
                
                clearTimeout(requestTimer[i]); 
                //VehiclesData[vehicle].txtStatus +=  "\nA="+i +" " +xmlhttp[i].status;
                if (xmlhttp[i] && xmlhttp[i].status != 200){
                    //VehiclesData[vehicle].txtStatus +=  "\nV="+i;
                    
                    // Handle error, e.g. Display error message on page
                    //if(VehiclePos[i].stop_action || VehiclePos[i].holdpos){
                        //if(xmlhttp[i].message)
                        //VehiclesData[vehicle].txtStatus += "=>" + i + " " + xmlhttp[i].message;
                            //xmlhttp[i].abort();
                    //    ;
                    //}else 
                    //VehiclesData[vehicle].txtStatus +=  "\nError: Server " + (i+1) + " is down!";
                    if(i==(VCurr-1)){
                        /*if(!xmlhttp[i].message){
                            VehiclesData[i].txtStatus +=  "Status = "+ xmlhttp[i].status + "\n";
                        }else{
                            VehiclesData[i].txtStatus +=  xmlhttp[i].message;
                            //VehiclesData[i].received_var = false;
                        }*/
                        document.all.txt_vars.scrollTop = document.all.txt_vars.scrollHeight;
                    }
                    xmlhttp[i].abort();
                    continue;
                }
                if(xmlhttp[i] && VehiclesData[i].VehiclePos.stop_action){
                    if(VehiclesData[i].VehiclePos.stop_action == true){
                        VehiclesData[i].VehiclePos.stop_action =false;
                        toggle_stop_button(false, i==(VCurr-1) && VehiclesData[VCurr-1].VehiclePos.STOP==0,true);
                    }
                }
                if(xmlhttp[i] && VehiclesData[i].VehiclePos.project_stop_action){
                    if(VehiclesData[i].VehiclePos.project_stop_action == true){
                        VehiclesData[i].VehiclePos.project_stop_action =false;
                        toggle_stop_button(true, i==(VCurr-1) && VehiclesData[VCurr-1].VehiclePos.Project_STOP==0,true);
                    }
                }
                if(i==(VCurr-1)){
                    readXML(xmlhttp[i],i,true);
                }else{
                    readXML(xmlhttp[i],i,false);
                }
          }
      };
    }
}
}
function askVAR(opt, value){
    if(opt=='IMU'){
        if (!value){
        	display_flags.IMU=false;
            VARS.splice(VARS.indexOf("IMU_Gx"),1); VARS.splice(VARS.indexOf("IMU_Gy"),1); VARS.splice(VARS.indexOf("IMU_Gz"),1);
            VARS.splice(VARS.indexOf("IMU_Pitch"),1); VARS.splice(VARS.indexOf("IMU_Roll"),1);
            del_elem(ROS_VARS,"imu/data");
        }else{
            display_flags.IMU=true;
            VARS.push("IMU_Gx"); VARS.push("IMU_Gy"); VARS.push("IMU_Gz"); VARS.push("IMU_Pitch"); VARS.push("IMU_Roll");
            add_elem(ROS_VARS,"imu/data");
        }
    }else if(opt=='Thrusters'){ 
            if (!value){
                display_flags.Thrusters=false;
                VARS.splice(VARS.indexOf("Thruster1_speed"),1); VARS.splice(VARS.indexOf("Thruster2_speed"),1);
                del_elem(ROS_VARS,"ThrusterR/Status"); del_elem(ROS_VARS,"ThrusterL/Status");
                del_elem(ROS_VARS,"ThrusterVR/Status"); del_elem(ROS_VARS,"ThrusterVL/Status");
            }else{
                display_flags.Thrusters=true;
                VARS.push("Thruster1_speed"); VARS.push("Thruster2_speed");
                add_elem(ROS_VARS,"ThrusterR/Status"); add_elem(ROS_VARS,"ThrusterL/Status");
                add_elem(ROS_VARS,"ThrusterVR/Status"); add_elem(ROS_VARS,"ThrusterVL/Status");
            }
    }else if(opt=='Battery'){
            if (!value){
                display_flags.Battery=false;
                VARS.splice(VARS.indexOf("BAT_Current"),1); VARS.splice(VARS.indexOf("BAT_Cell0"),1);VARS.splice(VARS.indexOf("BAT_Cell1"),1);VARS.splice(VARS.indexOf("BAT_Cell2"),1);VARS.splice(VARS.indexOf("BAT_Cell3"),1);VARS.splice(VARS.indexOf("BAT_Cell4"),1);VARS.splice(VARS.indexOf("BAT_Cell5"),1);
            }else{
                display_flags.Battery=true;
                VARS.push("BAT_Current"); VARS.push("BAT_Cell0");VARS.push("BAT_Cell1");VARS.push("BAT_Cell2");VARS.push("BAT_Cell3");VARS.push("BAT_Cell4");VARS.push("BAT_Cell5");
            }
    }else if(opt=='GPS'){
            if (!value){
                display_flags.GPS=false;
                VARS.splice(VARS.indexOf("GPS_num_satellites"),1); VARS.splice(VARS.indexOf("GPS_PDOP"),1); VARS.splice(VARS.indexOf("GPS_heading"),1); VARS.splice(VARS.indexOf("GPS_hor_velocity"),1); VARS.splice(VARS.indexOf("GPS_time_UTC"),1);
                del_elem(ROS_VARS,"gps/data");
            }else{
                display_flags.GPS=true;
                VARS.push("GPS_num_satellites");VARS.push("GPS_heading");VARS.push("GPS_PDOP");
                VARS.push("GPS_time_UTC"); VARS.push("GPS_hor_velocity");
                add_elem(ROS_VARS,"gps/data");
            }
    }else if(opt=='Pressure'){
            if (!value){
                display_flags.Pressure=false;
                del_elem(ROS_VARS,"Pressure");
            }else{
                display_flags.Pressure=true;
                add_elem(ROS_VARS,"Pressure");
            }
    
    }else if(opt=='RAW'){
            if (!value){
                display_flags.RAW=false;
                STRINGS.splice(STRINGS.indexOf("IMU_RAW"),1); STRINGS.splice(STRINGS.indexOf("GPS_RAW"),1); STRINGS.splice(STRINGS.indexOf("Thrusters_RAW"),1); STRINGS.splice(STRINGS.indexOf("Modem_RAW"),1);
            }else{
                display_flags.RAW=true;
                STRINGS.push("IMU_RAW"); STRINGS.push("GPS_RAW");STRINGS.push("Thrusters_RAW"); STRINGS.push("Modem_RAW");
            }
    }else if(opt=='Modems'){
            if (!value){
                display_flags.Modems=false;
                del_elem(ROS_VARS,"Modem_Data");
            }else{
                display_flags.Modems=true;
                add_elem(ROS_VARS,"Modem_Data");
            }
    }else if(opt=='MATLAB'){
            if (!value){
                display_flags.MATLAB=false;
                VARS.splice(VARS.indexOf("MATLAB_Value1"),1); VARS.splice(VARS.indexOf("MATLAB_Value2"),1); VARS.splice(VARS.indexOf("MATLAB_Value3"),1); VARS.splice(VARS.indexOf("MATLAB_Value4"),1);
            }else{
                display_flags.MATLAB=true;
                VARS.push("MATLAB_Value1"); VARS.push("MATLAB_Value2");VARS.push("MATLAB_Value3"); VARS.push("MATLAB_Value4");
            }
    }
    localStorage['VARS']=JSON.stringify(VARS);
    localStorage['display_flags']=JSON.stringify(display_flags);
    localStorage['ROS_VARS']=JSON.stringify(ROS_VARS);
}

function btClear(){
	//var canvas = document.getElementById('ctrMap'); var ctx = canvas.getContext('2d');
	// Firstly confirm if the user really wants to clear the mission
	var flag_time=false;
	for(var i=0; i<VehiclesData.length; i++){
		if(VehiclesData[i].VehiclePath.x.length>900){
			flag_time=true;
		}
	}
	if(flag_time){
		var str=prompt("Are you sure that you want to clear?\n","no");
		if(str===null || str==="no"){
			return;
		}
	}

	for(var i=0;i<VehiclesData.length;i++){
    VehiclesData[i].VehiclePath.x = [];
    VehiclesData[i].VehiclePath.y = [];
    VehiclesData[i].VehiclePath.z = [];
    VehiclesData[i].VehiclePath.z_time = [];
    VehiclesData[i].VehiclePath.alt = [];
    VehiclesData[i].received_var = undefined;
    VehiclesData[i].GPS_X = 0;
    VehiclesData[i].GPS_Y = 0;
	}

    // Clear profiler Points
    pointsProfiler = [];
    
    // Clear Altimeter Points
    pointsBathy = [];

    localStorage.VehiclesData = JSON.stringify(VehiclesData);
	draw(-1,-1,-1,-1);

	//ctx.clearRect(0, 0, canvas.width , canvas.height );
}


function askIMPVARS(){
    for(var j=0; j<VehiclesData.length;j++){
        if (!xmlhttp[j] || !VehiclesData[j].active)
            continue;

        var VehicleURL = getVehicleURL(j);

        xmlhttp[j].message = "\nError: Maybe server is down!";
        if(j==(VCurr-1)){
            if(VehiclesData[j].SystemState)
                xmlhttp[j].open("GET",VehicleURL+"VAR%20"+VehiclesData[j].name+"/"+ROS_VARS.join("%20")+"%20", true); //+VARS.join("%20")+"%20"+STRINGS.join("%20"),true); // Server stuck in a loop.
            else
                xmlhttp[j].open("GET",VehicleURL+"VAR%20"+VehiclesData[j].name+"/"+VARS.join("%20")+"%20"+STRINGS.join("%20"),true); // Server stuck in a loop.
        }else{
            if(VehiclesData[j].SystemState)
                xmlhttp[j].open("GET",VehicleURL+"VAR%20"+VehiclesData[j].name+"/"+ROS_VARS.join("%20"),true); // Server stuck in a loop.
            else
                xmlhttp[j].open("GET",VehicleURL+"VAR%20"+VehiclesData[j].name+"/"+VARS.join("%20"),true); // Server stuck in a loop.
        }
        
        requestTimer[j] = setTimeout(function() {
            for(var i=0; i<VehiclesData.length;i++)
                if (xmlhttp[i] && xmlhttp[i].readyState != 4){
                    xmlhttp[i].abort();
                    //if(i==(VCurr-1) )
                    //    VehiclesData[vehicle].txtStatus += "\nError: Request Timeout!";
                }
        }, 700);
        if(xmlhttp[j])
            xmlhttp[j].send();
    
    }
    /*requestTimer = setTimeout(function() {
        for(i=0; i<VehiclesIP.length;i++)
            if (xmlhttp[i] && xmlhttp[i].readyState != 4){
                xmlhttp[i].abort();
                //if(i==(VCurr-1) )
                //    VehiclesData[vehicle].txtStatus += "\nError: Request Timeout!";
            }
    }, 700);*/
}

/* Display points acquired with the profiler */
var pointsProfiler = new Array();
var old_seq_num = 0;
function processPoints(string, vehicle, seq_num){
    var pointsStr = string.split(',');
    //var points = new Array()
    var auxStr, auxObject;
    if(seq_num==0 || seq_num==old_seq_num)
        return;

    // TODO: Change this with interface
    var lat_lon = [38.765852, -9.09281873]; // Ref Point Expo
    var utmzone=temp_utmzone(lat_lon[0], lat_lon[1])+"S";
    var utm_aux = "+proj=utm +zone="+utmzone;
    var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    var refPoint_UTM = proj4(wgs84, utm_aux, [lat_lon[1], lat_lon[0]]);

    // Parse Points
for(var i=0;i<pointsStr.length;i++){
    auxStr = pointsStr[i].replace(/\n/g, ", ");
    auxStr = auxStr.replace("x", "\"x\"");
    auxStr = auxStr.replace("y", "\"y\"");
    auxStr = auxStr.replace("z", "\"z\"");
    auxStr = auxStr.replace(/\[|\]/g, "");
    auxObject = JSON.parse("{"+auxStr+"}");

    //DPoints_green_x.push(auxObject.y+VehiclesData[vehicle].GPS_X);
    //DPoints_green_y.push(auxObject.x+VehiclesData[vehicle].GPS_Y);
    if(auxObject.y==0 && auxObject.x==0)
        continue;
    //newObject= {'x': (auxObject.y+VehiclesData[vehicle].GPS_X), 'y': (auxObject.x + VehiclesData[vehicle].GPS_Y)}
    newObject= {'x': (auxObject.x), 'y': (auxObject.y)}

    pointsProfiler.push(newObject);
}
old_seq_num = seq_num;
}

/* 
Display points acquired with the Altimeter
TODO: Change this!!!!!!!
*/
var pointsBathy = new Array();
var bathy_grid_size=2;
var showBathyPoints = false;
function processPointsBathy(vehicle){
var newObject;
if(vehicle==2)
    return;
if(-(VehiclesData[vehicle].Depth+VehiclesData[vehicle].Altitude)<-50)
    return;

newObject= {'x': Math.round(VehiclesData[vehicle].GPS_X/bathy_grid_size)*bathy_grid_size, 'y': Math.round(VehiclesData[vehicle].GPS_Y/bathy_grid_size)*bathy_grid_size, 'z': -(VehiclesData[vehicle].Depth+VehiclesData[vehicle].Altitude)}
//newObject= {'x': VehiclesData[vehicle].GPS_X/bathy_grid_size*bathy_grid_size, 'y': VehiclesData[vehicle].GPS_Y/bathy_grid_size*bathy_grid_size, 'z': -(VehiclesData[vehicle].Depth+VehiclesData[vehicle].Altitude)}

for(var i=0; i<pointsBathy.length;i++){
    // Check if exists already
    if(newObject.x == pointsBathy[i].x && newObject.y == pointsBathy[i].y){
        pointsBathy[i].z = newObject.z;
        bathy_min_value = Math.min(bathy_min_value, -newObject.z);
        bathy_max_value = Math.max(bathy_max_value, -newObject.z);
        return;
    }
}

bathy_min_value = Math.min(bathy_min_value, -newObject.z);
bathy_max_value = Math.max(bathy_max_value, -newObject.z);
pointsBathy.push(newObject);
// Limit number of points
if(pointsBathy.length>3000){
    pointsBathy.shift();
}

}

var VX_ant= 0;
var VY_ant= 0;
function readXML(xmlhttp,vehicle, show) {

//VehiclesData[vehicle].txtStatus += "\nV="+ vehicle + " S " + show + " RS" + xmlhttp.readyState + " ST "+xmlhttp.status;
//xmlhttp.abort();
//return;

var altitude_rcv =false; // Received an altitude on this message?

if(xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status==200){
//VehiclesData[vehicle].received_var = Date.now()/1000.0;
xmlDoc=xmlhttp.responseXML;
if (xmlDoc){
    //if(show==true)
    VehiclesData[vehicle].txtStatus = "-------" + getClock() + "-------\n";
    
    CURRENT_KEYS=[];
    //VehiclesData[vehicle].txtStatus = xmlDoc.getElementsByTagName("ROSMessage").length;
    // ROS Code
    if(xmlDoc.getElementsByTagName("ROSMessage").length!=0){
        var rosmsg = xmlDoc.getElementsByTagName("ROSMessage");
        var rosn   = rosmsg.length;
        var seq_num = 0;
        for(i=0;i<rosn;i++){
            
            //    ~teste = rosmsg;
            // SHOW ALL THE MESSAGE
            /*if((ROS_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].attributes.getNamedItem("name").nodeValue)>=0){
                
                var n = rosmsg[i].getElementsByTagName("VAR").length; //Numero de Elementos
                for(j=0;j<n;j++){
                    if(show==true){
                        VehiclesData[vehicle].txtStatus +=rosmsg[i].getElementsByTagName("KEY")[j].textContent+ "=";
                        VehiclesData[vehicle].txtStatus +=rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent+ "\n";
                    }
                }
                
            }*/
            var var_elements = rosmsg[i].getElementsByTagName("VAR");
            var print_msg =false;
            for(var j=0;j<var_elements.length;j++){
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Errors"){
                    error_obj={'time_rcv': var_elements[j].getElementsByTagName("TIME")[0].textContent, 'vehicle':VehiclesData[vehicle].name, 'node': var_elements[j].getElementsByTagName("NODE")[0].textContent, 'msg':var_elements[j].getElementsByTagName("MSG")[0].textContent};
                    addErrorToList(error_obj);
                    new_notification('duplicater0', 
                        VehiclesData[vehicle].name+' - '+var_elements[j].getElementsByTagName("NODE")[0].textContent, 
                        var_elements[j].getElementsByTagName("MSG")[0].textContent);
                    continue;
                }
                CURRENT_KEYS.push(rosmsg[i].attributes.getNamedItem("name").nodeValue + "/" + rosmsg[i].getElementsByTagName("KEY")[j].textContent); // For Sensor Plotting
                
                // TODO: check this CURRENT_STATES
                /*var temp_field=rosmsg[i].getElementsByTagName("KEY")[j].textContent;
                if(temp_field=='GPS_Good'){
                    update_list(CURRENT_STATES[vehicle], rosmsg[i].attributes.getNamedItem("name").nodeValue); // List "State" topics
                }*/
                
                //Check Received Scan
                //if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "SingleScan"){
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "rrt_pointcloud"){
                    if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "seq"){
                        seq_num = parseInt(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                    }
                    if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "points"){
                            processPoints(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent, vehicle, seq_num);
                    }
                }



                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "gps_data"){// && show==true){
                    if(display_flags.GPS){
                        print_msg=true;
                        VehiclesData[vehicle].txtStatus +="GPS_";
                    }else if((ROS_GPS_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){
                        print_msg=true;
                        VehiclesData[vehicle].txtStatus += "GPS_";
                    }
                }
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "imu_data"){// && show==true){
                    if(display_flags.IMU){ print_msg=true; VehiclesData[vehicle].txtStatus +="IMU_";}
                    else if((ROS_IMU_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){
                        print_msg=true;
                        VehiclesData[vehicle].txtStatus += "IMU_";
                    }
                }
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Modem_Data"){// && show==true){
                    if(Modems){ print_msg=true; 
                    VehiclesData[vehicle].txtStatus +="Modem_";
                    }
                }
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "bat_monit_data"){// && show==true){
                    if(display_flags.Battery){ print_msg=true; VehiclesData[vehicle].txtStatus +="BAT_";}
                    else if((ROS_BAT_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){ 
                        print_msg=true;
                        VehiclesData[vehicle].txtStatus +="BAT_";
                    }
                }
                        
                if(rosmsg[i].attributes.getNamedItem("name").nodeValue == VehiclesData[vehicle].state_topic_name.replace(/\//gi,"_")){// && show==true){
                    if((ROS_STATE_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){
                            print_msg=true;
                            VehiclesData[vehicle].txtStatus +="State_";
                            if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "In_Press")
                                VehiclesData[vehicle].inpressure = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        }
                    }

                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Pressure"){
                        //if((ROS_STATE_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){ 
/*                            if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Inside_Pressure")
                                VehiclesData[vehicle].inpressure = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);*/
						//}
                        if(display_flags.Pressure){
                        	print_msg=true;
                        	VehiclesData[vehicle].txtStatus +="Pressure_";
                        }
                    }
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "seq"){
                            seq_num = parseInt(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Altimeter"){
                        //if((ROS_STATE_VARS.join("").replace(/\//gi,"_")).indexOf(rosmsg[i].getElementsByTagName("KEY")[j].textContent)>=0){ 
						//if(show==true){
                            print_msg=true;
                            VehiclesData[vehicle].txtStatus +="Altimeter_";
                        //}
                        //VehiclesData[vehicle].Altitude = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        processPointsBathy(vehicle);
                    }
					
					if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Path_Section"){
                        //console.log(rosmsg[i]);
                        if(mission.parseSection(rosmsg[i], vehicle))
							Plot_Mission();
                    }
                    
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Mission_Text"){
                        if(mission.parseTxt(rosmsg[i]))
                            Plot_Mission();
                    }

/*					if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Altitude"){
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "pos"){
							VehiclesData[vehicle].Altitude = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                            altitude_rcv = true;
						}
                    }*/

                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Flag"){// && show==true){
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "data"){ 
                            print_msg=true;
                            VehiclesData[vehicle].txtStatus +="Flag_";
                        }
                    }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "ThrusterR_Status"){// && show==true){
                        if(display_flags.Thrusters){ print_msg=true; VehiclesData[vehicle].txtStatus +="TH_HR_";}
                    }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "ThrusterL_Status"){// && show==true){
                        if(display_flags.Thrusters){ print_msg=true; VehiclesData[vehicle].txtStatus +="TH_HL_";}
                    }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "ThrusterVR_Status"){// && show==true){
                        if(display_flags.Thrusters){ print_msg=true; VehiclesData[vehicle].txtStatus +="TH_VR_";}
                    }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "ThrusterVL_Status"){// && show==true){
                        if(display_flags.Thrusters){ print_msg=true; VehiclesData[vehicle].txtStatus +="TH_VL_";}
                    }
                    if(print_msg){
                        VehiclesData[vehicle].txtStatus +=rosmsg[i].getElementsByTagName("KEY")[j].textContent+ "=";
                        if(!isNaN(parseFloat(parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent).toFixed(3))))
                            VehiclesData[vehicle].txtStatus +=parseFloat(parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent).toFixed(3))+ "\n";
                        else
                            VehiclesData[vehicle].txtStatus +=rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent + "\n";
                        print_msg = false;
                    }
                    
                    if(localStorage.CURRPLOT){// && show==true){
                        node_var = (localStorage.CURRPLOT).split("/");
                        if(rosmsg[i].attributes.getNamedItem("name").nodeValue ==node_var[0] && rosmsg[i].getElementsByTagName("KEY")[j].textContent == node_var[1]){
                            if(!localStorage['CURRPLOTVALUE'])
                                localStorage['CURRPLOTVALUE'] = JSON.stringify([~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent]);
                            else{
                                //alert(parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent));
                                var data = JSON.parse(localStorage['CURRPLOTVALUE']);
                                if(data.length>1500)
                                    data= data.slice(1); 
                                data.push(parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent));
                                localStorage['CURRPLOTVALUE'] = JSON.stringify(data);
                            }
                        }
                    }
                    // PAGE STYLE (Position, Colors and bars)
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Flag"){
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "data"){ 
                            Flag_Value = parseInt(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                            VehiclesData[vehicle].op_mode = Flag_Value;
                            update_divVisual_mode(vehicle, true);
                        }
                    }
                    if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "leaks_upper"){
                        VehiclesData[vehicle].upperleak = rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent;
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "data" && rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent == "False" && show==true)
                            document.all.ULe.style.setProperty("background-color",color_palette['green']);
                        else if(show==true)
                            document.all.ULe.style.setProperty("background-color",color_palette['red']);
                    }else if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "leaks_lower"){
                        VehiclesData[vehicle].lowerleak = rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent;
                        if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "data" && rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent == "False" && show==true)
                            document.all.LLe.style.setProperty("background-color",color_palette['green']);
                        else if(show==true)
                            document.all.LLe.style.setProperty("background-color",color_palette['red']);
                    }else if(rosmsg[i].attributes.getNamedItem("name").nodeValue == VehiclesData[vehicle].state_topic_name.replace(/\//gi,"_")){ //"State"){
                        /*if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Yaw")
                            VehiclesData[vehicle].YAW = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "X" && condition_state)  // USBL Martelada
                            GPS_X[vehicle] = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Y" && condition_state)
                            GPS_Y[vehicle] = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Yaw" && vehicle != 3){
                            YAW[vehicle] = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                        }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "GPS_Good"){ 
                            if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==1.0 && show==true){
                                document.all.RTK.style.setProperty("background-color",color_palette['red']);
                                document.all.RTK.innerHTML = "GPS&nbsp;<br>AUTO";
                            }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==3.0 && show==true){
                                document.all.RTK.style.setProperty("background-color",color_palette['green900']);
                                document.all.RTK.innerHTML = "RTK FIXED";
                            }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==2.0 && show==true){
                                document.all.RTK.style.setProperty("background-color",color_palette['yellow']);
                                document.all.RTK.innerHTML = "RTK FLOAT";
                            }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==0.0 && show==true){
                                document.all.RTK.style.setProperty("background-color",color_palette['red900']);
                                document.all.RTK.innerHTML = "NO GPS";
                            }
                        }
                    }*/
						if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Depth"){
							VehiclesData[vehicle].Depth = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
						}

                        /*if(rosmsg[i].attributes.getNamedItem("name").nodeValue == "Altitude"){
                            if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "pos"){
                                VehiclesData[vehicle].Altitude = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                                altitude_rcv = true;
                            }
                        }*/
                    }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "min_Cell"){
                        bat=100*(650-(4050-parseInt(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)))/650;
                        VehiclesData[vehicle].battery = parseInt(bat);
                        if(show==true){
                            
                            if(bat>100)
                                d=0xFF00+0x10000;
                            else if(bat>50)
                                d=0xFF00+0x10000*Math.round((1-bat/100)*510); 
                            else
                                d=0xFFFF00-0x100*Math.round((0.5-bat/100)*510);
                            str=d.toString(16).toUpperCase();
                            while (str.length < 6) str = '0' + str;
                            //alert(str);
                            document.all.barBAT.style.setProperty("background-color",'#'+str);
                            document.all.barBAT.innerHTML=parseInt(bat)+'%';    
                            
                        }
                    }/*else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Actual_Charge"){
                        if(show==true){
                            bat=100*parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[j].textContent)/24.0;
                            
                            if(bat>100)
                                d=0xFF00+0x10000;
                            else if(bat>50)
                                d=0xFF00+0x10000*Math.round((1-bat/100)*510); 
                            else
                                d=0xFFFF00-0x100*Math.round((0.5-bat/100)*510);
                            str=d.toString(16).toUpperCase();
                            while (str.length < 6) str = '0' + str;
                            //alert(str);
                            document.all.barBAT.style.setProperty("background-color",'#'+str);
                            document.all.barBAT.innerHTML=parseInt(bat)+'%';    
                            
                        }
                    }*/

                    for(var mm=0; mm<VehiclesData.length; mm++){
                        if((VehiclesData[mm].state_topic_source==vehicle) && (VehiclesData[mm].state_topic_name.replace(/\//gi,"_")==rosmsg[i].attributes.getNamedItem("name").nodeValue)){
                        	// Ellipse
                        	if(rosmsg[i].attributes.getNamedItem("name").nodeValue.search("_ellipse")!=-1){
                        		VehiclesData[mm].ellipse = true;
                                var ellipse_vars = rosmsg[i].getElementsByTagName("ROSMessage");
                                var ellipse_position = ellipse_vars[0];
                                var ellipse_orientation = ellipse_vars[1];
                                if(ellipse_orientation.attributes.getNamedItem("name").nodeValue=="orientation" && 
                                    ellipse_position.attributes.getNamedItem("name").nodeValue=="position"){
                                    VehiclesData[mm].GPS_X = parseFloat(ellipse_position.getElementsByTagName("DOUBLE")[0].textContent);
                                    VehiclesData[mm].GPS_Y = parseFloat(ellipse_position.getElementsByTagName("DOUBLE")[1].textContent);
                                    VehiclesData[mm].ellipse_axisx = parseFloat(ellipse_orientation.getElementsByTagName("DOUBLE")[0].textContent);
                                    VehiclesData[mm].ellipse_axisy = parseFloat(ellipse_orientation.getElementsByTagName("DOUBLE")[1].textContent);
                                    VehiclesData[mm].ellipse_angle = parseFloat(ellipse_orientation.getElementsByTagName("DOUBLE")[2].textContent);
                                }
                        	}else{
                              VehiclesData[mm].received_var = Date.now()/1000.0;
	                            if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "X"){
	                                VehiclesData[mm].GPS_X = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
	                            }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Y"){
	                                VehiclesData[mm].GPS_Y = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
	                                // Appending position to the vehicle maded path
          							        if(VehiclesData[mm].GPS_X !=0 && VehiclesData[mm].GPS_Y!=0){
          							            VehiclesData[mm].VehiclePath.x.push(VehiclesData[mm].GPS_X);
          							            VehiclesData[mm].VehiclePath.y.push(VehiclesData[mm].GPS_Y);
          							            if(VehiclesData[mm].VehiclePath.x.length>1000){ //Corresponds more or less to 17 mins15
          							                VehiclesData[mm].VehiclePath.x.shift();
          							                VehiclesData[mm].VehiclePath.y.shift();
          							            }
          							        }
                              }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Yaw"){
                                    VehiclesData[mm].YAW = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                              }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "Pitch"){
                                    VehiclesData[mm].PITCH = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
	                            }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "altitude"){
                                    VehiclesData[mm].Altitude = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
                                    altitude_rcv = true;
                                }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "u"){
	                                VehiclesData[mm].surge = parseFloat(rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent);
	                            }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "GPS_Good" && (VCurr-1)==mm){ 
	                                VehiclesData[mm].gps_mode = (~~xmlDoc.getElementsByTagName("DOUBLE")[j].textContent);
	                                if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==0.0 && show==true){
	                                    document.all.RTK.style.setProperty("background-color",color_palette['red']);
	                                    document.all.RTK.innerHTML = "GPS&nbsp;<br>AUTO";
                                    }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==1.0 && show==true){
                                        document.all.RTK.style.setProperty("background-color",color_palette['green']);
                                        document.all.RTK.innerHTML = "DGPS";
                                    }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==3.0 && show==true){
	                                    document.all.RTK.style.setProperty("background-color",color_palette['green']);
	                                    document.all.RTK.innerHTML = "RTK FIXED";
	                                }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==2.0 && show==true){
	                                    document.all.RTK.style.setProperty("background-color",color_palette['yellow']);
	                                    document.all.RTK.innerHTML = "RTK FLOAT";
	                                }else if((~~rosmsg[i].getElementsByTagName("DOUBLE")[j].textContent)==255.0 && show==true){
	                                    document.all.RTK.style.setProperty("background-color",color_palette['red900']);
	                                    document.all.RTK.innerHTML = "NO GPS";
	                                }
	                            }else if(rosmsg[i].getElementsByTagName("KEY")[j].textContent == "GPS_Good"){ 
	                                VehiclesData[mm].gps_mode = (~~xmlDoc.getElementsByTagName("DOUBLE")[j].textContent);
	                            }
	                        }
                        }    
                    }
                    // Update Widgets
                    if(show==true){
                         compass_update(VehiclesData[vehicle].YAW*Math.PI/180, 0);
                         speedmeter_update(VehiclesData[vehicle].surge, 0);
                         //speedmeter_update(VehiclesData[vehicle].surge*1.944, 0);
                         battery_update(VehiclesData[vehicle].battery/100,false);
                         
                    }
                }
            }
            document.all.txt_vars.scrollTop = document.all.txt_vars.scrollHeight;
            localStorage['CURRENT_KEYS']=JSON.stringify(CURRENT_KEYS);
            //localStorage['CURRENT_STATES']=JSON.stringify(CURRENT_STATES);
            
            //Update Z and altitude vectors
            if(altitude_rcv){
                VehiclesData[vehicle].VehiclePath.z_time.push(Date.now());
                VehiclesData[vehicle].VehiclePath.z.push(VehiclesData[vehicle].Depth);
                VehiclesData[vehicle].VehiclePath.alt.push(VehiclesData[vehicle].Altitude);
            }else{
                VehiclesData[vehicle].VehiclePath.z_time.push(Date.now());
                VehiclesData[vehicle].VehiclePath.z.push(0);
                VehiclesData[vehicle].VehiclePath.alt.push(0);
            }
            if(VehiclesData[vehicle].VehiclePath.z.length>100){
                VehiclesData[vehicle].VehiclePath.z_time.shift();
                VehiclesData[vehicle].VehiclePath.z.shift();
                VehiclesData[vehicle].VehiclePath.alt.shift();
            }

            localStorage.VehiclesData = JSON.stringify(VehiclesData);
            xmlhttp.abort();
            update_divSideBar();
            return;
        }
        
        // MOOS CODE
        if(!xmlDoc.getElementsByTagName("VAR")){
            xmlhttp.abort();
            return;
        }
        
        var n = xmlDoc.getElementsByTagName("VAR").length; //Numero de Elementos

        for(var i=0;i<n;i++){
            //    VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("KEY")[i].textContent+ "=";
            //    VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("DOUBLE")[i].textContent+ "\n";
            if ((VARS.join("")).indexOf(xmlDoc.getElementsByTagName("KEY")[i].textContent) >= 0 && show==true){
                VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("KEY")[i].textContent+ "=";
                VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("DOUBLE")[i].textContent+ "\n";
            }
            
            if((STRINGS.join("")).indexOf(xmlDoc.getElementsByTagName("KEY")[i].textContent) >= 0 && show==true){
                VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("KEY")[i].textContent+ "=";
                VehiclesData[vehicle].txtStatus +=xmlDoc.getElementsByTagName("STRING")[i].textContent+ "\n";
            }
            
            if(localStorage.CURRPLOT)
                if(xmlDoc.getElementsByTagName("KEY")[i].textContent == localStorage.CURRPLOT && show==true){
                    if(!localStorage['CURRPLOTVALUE'])
                        localStorage['CURRPLOTVALUE'] = JSON.stringify([~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent]);
                    else{
                        //alert(parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent));
                        var data = JSON.parse(localStorage['CURRPLOTVALUE']);
                        if(data.length>1000)
                            data= data.slice(1); 
                        data.push(parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent));
                        localStorage['CURRPLOTVALUE'] = JSON.stringify(data);
                    }
                }
            /*if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "MATLAB_Value3" && vehicle==0){
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==0.0)
                    continue;
                var heightIUTM = RefPointTLN[Scenario-1]- RefPointBRN[Scenario-1];
                var widthIUTM = RefPointBRE[Scenario-1]- RefPointTLE[Scenario-1];
                var heightI=document.all.ctrMap.height; var widthI=document.all.ctrMap.width;
                x =  Math.round(widthI*(parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)-RefPointTLE[Scenario-1])/widthIUTM);
                if(x != VX_ant && x>0){
                    VX_ant = x;
                    DPoints_green_x.push(x);
                }
            }
            if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "MATLAB_Value4" && vehicle==0){
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==0.0)
                    continue;
                var heightIUTM = RefPointTLN[Scenario-1]- RefPointBRN[Scenario-1];
                var widthIUTM = RefPointBRE[Scenario-1]- RefPointTLE[Scenario-1];
                var heightI=document.all.ctrMap.height; var widthI=document.all.ctrMap.width;
                y =  Math.round(heightI*(-(parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)-RefPointTLN[Scenario-1]))/heightIUTM);
                if(y !=  VY_ant && y>0){
                    VY_ant = y;
                    if(DPoints_green_x.length>DPoints_green_y.length)
                        DPoints_green_y.push(y);
                    else
                        DPoints_green_y[DPoints_green_y.length-1]=y;
                    circles(DPoints_green_x[DPoints_green_x.length-1],DPoints_green_y[DPoints_green_y.length-1], color_palette['light_green']);
                }
            }*/
            if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "Modem_Heading" && vehicle==0)
                VehiclesData[3].YAW = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);
            /*else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "MATLAB_Value1" && vehicle==0)
                GPS_X[3] = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);
            else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "MATLAB_Value2" && vehicle==0)
                GPS_Y[3] = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);*/
                
            if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "GPS_X")
                VehiclesData[vehicle].GPS_X = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);
            else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "GPS_Y")
                VehiclesData[vehicle].GPS_Y = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);
            else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "IMU_Head" && vehicle != 3)
                VehiclesData[vehicle].YAW = parseFloat(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent);
            else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "LEAK1"){
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==1.0){
                    alert("Leak in the Upper tube!\nVehicle " + (vehicle+1));
                    if(show==true)
                        document.all.ULe.style.setProperty("background-color",color_palette['red']);
                }else
                    if(show==true)
                        document.all.ULe.style.setProperty("background-color",color_palette['green']);
            }else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "LEAK2"){
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==1.0){
                    alert("Leak in the Lower tube!\nVehicle " + (vehicle+1));
                    if(show==true)
                        document.all.LLe.style.setProperty("background-color",color_palette['red']);
                }else
                    if(show==true)
                        document.all.LLe.style.setProperty("background-color",color_palette['green']);
            }else if(xmlDoc.getElementsByTagName("KEY")[i].textContent == "GPS_MODE"){
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)<2.0){
                    if(show==true){
                        document.all.RTK.style.setProperty("background-color",color_palette['red']);
                        document.all.RTK.innerHTML = "GPS&nbsp;<br>AUTO";
                    }
                }else if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==3.0){
                    if(show==true){
                        document.all.RTK.style.setProperty("background-color",color_palette['green']);
                        document.all.RTK.innerHTML = "RTK FIXED";
                    }
                }else if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==2.0){
                    if(show==true){
                        document.all.RTK.style.setProperty("background-color",color_palette['yellow']);
                        document.all.RTK.innerHTML = "RTK FLOAT";
                    }
                }
            }else if(xmlDoc.getElementsByTagName("KEY")[i].textContent.indexOf("BAT_Cell6")>=0){ //BAT_Cell*
                bat=100*(650-(4050-parseInt(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)))/650;
                if(show==true){
                    if(bat>100)
                        d=0xFF00+0x10000;
                    else if(bat>50)
                        d=0xFF00+0x10000*Math.round((1-bat/100)*510); 
                    else
                        d=0xFFFF00-0x100*Math.round((0.5-bat/100)*510);
                    str=d.toString(16).toUpperCase();
                    while (str.length < 6) str = '0' + str;
                    //alert(str);
                    document.all.barBAT.style.setProperty("background-color",'#'+str);
                    document.all.barBAT.innerHTML=parseInt(bat)+'%';         

                }    
                if((~~xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)<3500){
                    alert('The Batteries for vehicle ' + (vehicle+1) + ' are running out!');
                }
            }else if(xmlDoc.getElementsByTagName("KEY")[i].textContent.indexOf("Thrusters_OFF")>=0){
                if(parseInt(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)==0 && VehiclesData[vehicle].VehiclePos.stop_action){
                    xmlhttp.abort();
                    xmlhttp.open("GET",VehicleServer+"SET%20Thrusters_OFF=1",true); // Server stuck in a loop.
                    var requestTimer = setTimeout(function() {
                        //alert('Error:\nConsole wasn\'t able to send STOP signal!\nTry again later!');
                        xmlhttp.abort();
                        // Handle timeout situation, e.g. Retry or inform user.
                    }, 500);
                    xmlhttp.send();
                }
                if(show==true){
                    toggle_stop_button(false,parseInt(xmlDoc.getElementsByTagName("DOUBLE")[i].textContent)!=0, true);
                }
            }
        }
        xmlhttp.abort();

    }
}        
}

function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

function newIP() {
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) {
        return;
    }
    VehicleServer = getVehicleURL(VCurr-1);

    localStorage.VCurr = VCurr;
    localStorage.VehiclesData = JSON.stringify(VehiclesData);
}

function circles(xc, yc, color, stroke, strokeColor, canvas_id, circle_size) {
    stroke = typeof stroke !== 'undefined' ? stroke : true;
    strokeColor = typeof strokeColor !== 'undefined' ? strokeColor : color_palette['red'];
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'ctrMap';
    circle_size = typeof circle_size !== 'undefined' ? circle_size : 5;// 1/canvas_pixelstometer;
    var canvas = document.getElementById(canvas_id);
    var x,y;

    if (canvas && canvas.getContext){
        var ctx = canvas.getContext('2d');
        var pt=getCanvasPos_pixel([xc,yc],true);
        x=pt[0], y=pt[1];
        
        //ctx.mozImageSmoothingEnabled = true;
        ctx.beginPath();
        //ctx.arc(xc, yc, 4, 2 * Math.PI,0, false);
        ctx.arc(x, y, circle_size, 2 * Math.PI,0, false);
        
        ctx.fillStyle = color;
        ctx.fill();
        if(stroke){
            ctx.lineWidth = 2;//0.3/canvas_pixelstometer;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
        ctx.closePath();
        //ctx.save();
    }
}

function drawellipse(xc, yc, axis_1, axis_2, angle, color, stroke, strokeColor, canvas_id) {
	stroke = typeof stroke !== 'undefined' ? stroke : true;
	strokeColor = typeof strokeColor !== 'undefined' ? strokeColor : color_palette['black'];
	canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'ctrMap';
	var canvas = document.getElementById(canvas_id);

    axis_1 = Math.min(axis_1, 100);
    axis_2 = Math.min(axis_2, 100);
    if (canvas && canvas.getContext){
    	var ctx = canvas.getContext('2d');
        var pc=getCanvasPos_pixel([xc,yc],true);
        
		ctx.beginPath();
		ctx.globalAlpha = 0.7;
		ctx.ellipse(pc[0], pc[1], axis_1/canvas_pixelstometer, axis_2/canvas_pixelstometer, angle-Math.PI/2.0, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
        if(stroke){
            ctx.lineWidth = 2;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
		ctx.closePath();	
		ctx.globalAlpha = 1.0;
    }
}

function crosses(way_point, canvas_id) {
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'ctrMap';
    var canvas = document.getElementById(canvas_id);
    
    var xc = way_point.x, yc = way_point.y, x, y;
    var stroke = true, color = way_point.color;
    var x,y;
    
    if (canvas && canvas.getContext){
        var ctx = canvas.getContext('2d');
        var pt=getCanvasPos_pixel([xc,yc],true);
        x=pt[0], y=pt[1];
        
        ctx.beginPath();
        
        ctx.moveTo(x-4, y-4);
        ctx.lineTo(x+4, y+4);
        ctx.moveTo(x-4, y+4);
        ctx.lineTo(x+4, y-4);
		ctx.lineWidth = 2;
		ctx.strokeStyle = color;
        ctx.stroke();
        
        ctx.closePath();
    }
}

function getMousePosCanvas(obj,event){
    var posx = posy = 0;
    var e = window.event || event;
    
    if(typeof e.pageX == 'undefined')
        return;
    if ('undefined'!=typeof e.targetTouches){
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

    var posObj = findPos(obj);

    var res = getCanvasPos_meter([(posx-posObj[0]),(posy-posObj[1])],false);
    MousePosition[0] = posx-posObj[0];
    MousePosition[1] = posy-posObj[1];
    MousePosition[2] = res[0];
    MousePosition[3] = res[1];

    return [res[0],res[1], MousePosition[0], MousePosition[1]];
}

function ChangePosLabel(obj, event) {
    pos_canvas=getMousePosCanvas(obj,event);
    pos_meter = getCanvasPos_meter([pos_canvas[2], pos_canvas[3]], true)
    x=pos_canvas[0];
    y=pos_canvas[1];
    x=pos_meter[0];
    y=pos_meter[1];
    document.all.mousePos.textContent = "X=" + x.toFixed(2) + " Y=" + y.toFixed(2);

    //if((bt=CheckMousePosition(pos_canvas))!=-1)
        //chVeiculo(document.forms['frmVehicle'].elements[bt]);
    CheckMousePosition(pos_canvas);
    // First overlay test
    /*var canvas = document.getElementById('ctrMap'), ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    ctx.font = '16pt Calibri';
    ctx.fillStyle = "#7FFF00";
    a="X=" + x.toFixed(2) + " Y=" + y.toFixed(2);
    ctx.fillText(a, 100, 100);
    ctx.lineWidth = .7;
    ctx.strokeStyle = color_palette['black'];
    ctx.strokeText(a, 100, 100);
    //document.all.mousePos.textContent = "X=" + pos_canvas[0].toFixed(2) + " Y=" + pos_canvas[1].toFixed(2);*/
}

function rectangles(xc, yc, color, stroke, strokeColor, canvas_id, rect_size) {
    stroke = typeof stroke !== 'undefined' ? stroke : true;
    strokeColor = typeof strokeColor !== 'undefined' ? strokeColor : color_palette['red'];
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'ctrMap';
    rect_size = typeof rect_size !== 'undefined' ? rect_size : 8;
    var canvas = document.getElementById(canvas_id);
    if (canvas && canvas.getContext){
        var ctx = canvas.getContext('2d');        
        var aux_pt=getCanvasPos_pixel([xc,yc], true);
        var x=aux_pt[0], y=aux_pt[1];

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(x-rect_size/2, y-rect_size/2, rect_size, rect_size);
        ctx.fill();
        if(stroke){
            ctx.lineWidth = 1;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
        ctx.closePath();
    }
}

function arrow(xc, yc, color, angle, stroke, strokeColor, canvas_id) {
    stroke = typeof stroke !== 'undefined' ? stroke : true;
    strokeColor = typeof strokeColor !== 'undefined' ? strokeColor : color_palette['red'];
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'canvas_back';
    var canvas = document.getElementById(canvas_id);
    if (canvas && canvas.getContext){
        var ctx = canvas.getContext('2d');        
        var aux_pt=getCanvasPos_pixel([xc,yc], true);
        var x=aux_pt[0], y=aux_pt[1];

        xs = x-Math.cos(0.6+angle)*8;
        ys = y+Math.sin(0.6+angle)*8;
        xe = x;
        ye = y;
        ctx.beginPath();
        ctx.moveTo(xs, ys);
        ctx.lineTo(xe,ye);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
        
        xs = x-Math.cos(angle-0.6)*8;
        ys = y+Math.sin(angle-0.6)*8;
        xe = x;
        ye = y;
        ctx.beginPath();
        ctx.moveTo(xs, ys);
        ctx.lineTo(xe,ye);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

function Plot_Mission(canvas_id,globalAlpha, mission_to_display) {
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'canvas_back';
    globalAlpha = typeof globalAlpha !== 'undefined' ? globalAlpha : 0.4;
    mission_to_display = typeof mission_to_display !== 'undefined' ? mission_to_display : mission;
    var canvas = document.getElementById(canvas_id);
    //alert(mission.toText());
    /*var posMap = findPos(document.all.ctrMap);
    var Xref = posMap[0];
    var Yref = posMap[1];*/
    if (!mission_to_display || !(mission_to_display.mission) || mission_len(mission_to_display.mission)===0)
            return ;
            
    if (canvas && canvas.getContext){
        var ctx_mission = canvas.getContext('2d');
        //ctx_mission.mozImageSmoothingEnabled = true;
    
        var x = 0;
        var y = 0; 
        //var imgScen = new Image();
        //imgScen.src = ScenNames[Scenario-1];
        
        mission_plot = mission_w_formation(mission_to_display.formation, mission_to_display.mission);
        // Transparent Mission
        ctx_mission.globalAlpha = globalAlpha;
        // Draw Trajectory
        ctx_mission.lineWidth = 3;
        var color = color_palette['red'];
        var vehicle_old = 0, vehicle =0;
        ctx_mission.beginPath()
        for(var index=0; index<mission_plot.length;index++){
            // Select vehicle number
            var segment=mission_plot[index];
            vehicle=segment.getVehicle();
            if(vehicle != vehicle_old){
                if(vehicle_old!=0){// Not the First Mission
                    ctx_mission.stroke(); 
                }
                ctx_mission.closePath();
                ctx_mission.beginPath();
                
                if (vehicle==-1)
                    color = color_palette['amber'];
                else
                    color = VehiclesData[vehicle-1].color;
                ctx_mission.strokeStyle = color;
            }
            if(check_disp_vehicle(vehicle)){
                segment.draw(ctx_mission, mission_to_display.xrefpoint, mission_to_display.yrefpoint);
            }
            vehicle_old = vehicle;
        }
        ctx_mission.closePath(); //TODO: ver se muda plot
        ctx_mission.stroke();
        
        // Draw Circles in the beginning and end mission
        color = color_palette['red'];
        vehicle_old = 0, vehicle =0;
        ctx_mission.beginPath();
        for(var index=0; index<mission_plot.length;index++){
            var segment=mission_plot[index];
            // Select vehicle number
            vehicle=segment.getVehicle();
            //alert(vehicle);
            if(vehicle != vehicle_old){
                if(vehicle_old!=0){// Not the First Mission
                    // End Point
                    if(check_disp_vehicle(vehicle_old)){
                        rectangles(parseFloat(mission_plot[index-1].value[mission_plot[index-1].dictionary.xe])+mission_to_display.xrefpoint, parseFloat(mission_plot[index-1].value[mission_plot[index-1].dictionary.ye])+mission_to_display.yrefpoint, color, true, color_palette['red'], canvas_id);  //TODO remove this
                    }
                }
                //ctx_mission.closePath();
                //ctx_mission.beginPath();
                if (vehicle==-1)
                    color = color_palette['amber'];
                else
                    color = VehiclesData[vehicle-1].color; 
                ctx_mission.strokeStyle = color;
                // Beginning
                if(check_disp_vehicle(vehicle)){
                    circles(parseFloat(mission_plot[index].value[mission_plot[index].dictionary.xi])+mission_to_display.xrefpoint, parseFloat(mission_plot[index].value[mission_plot[index].dictionary.yi])+mission_to_display.yrefpoint, color, true, color_palette['green'], canvas_id);  //TODO remove this
                }
                vehicle_old = vehicle;
            }
            
            // Draw an arrow in the middle of the lines
            if(check_disp_vehicle(vehicle)){
                if(segment.type==="line")
                    arrow((mission_plot[index].value[2]+mission_plot[index].value[0])/2+mission_to_display.xrefpoint, (mission_plot[index].value[3]+mission_plot[index].value[1])/2+mission_to_display.yrefpoint, color, Math.atan2(mission_plot[index].value[3]-mission_plot[index].value[1], mission_plot[index].value[2]-mission_plot[index].value[0]),undefined,undefined,canvas_id);  //TODO remove this
            }
        }
        // End Point
        if(check_disp_vehicle(vehicle)){
            //if(segment.type==="line")
                rectangles(parseFloat(mission_plot[index-1].value[mission_plot[index-1].dictionary.xe])+mission_to_display.xrefpoint, parseFloat(mission_plot[index-1].value[mission_plot[index-1].dictionary.ye])+mission_to_display.yrefpoint, color, true, color_palette['red'], canvas_id);  //TODO remove this
        }
        ctx_mission.closePath();
        ctx_mission.globalAlpha = 1;
        //if(programming_ui){
            //showPointsID(canvas_id);
        //}
    }
}

// Loading the Image Scenario
var imgScen = new Image();
var imgLoaded = false;
var scen_init_old_values = true;

imgScen.onload = function(){
  console.log('Medusa_MOOS_ROS.js Image Loaded');
  imgLoaded = true;
  if(scen_init_old_values)
    draw(-1,-1,-1,-1);
  else
    draw(0, 0, 1, 1);
};

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return 'rgb(' + Math.round(r*255) + ',' + Math.round(g*255) + ',' + Math.round(b*255) + ')';
}

function RGB2Color(r,g,b)
{
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
}


var center_on_Vehicle = -1;
function centerVehicle(vehicle_id){
    var canvas = document.getElementById('ctrMap');
    canvas_xtl = VehiclesData[vehicle_id].GPS_X-(canvas.width*canvas_pixelstometer)/2;
    canvas_ytl = VehiclesData[vehicle_id].GPS_Y+(canvas.height*canvas_pixelstometer)/2;
                    
    //canvas_xtl=VehiclesData[vehicle_id].GPS_X-100;
    //canvas_ytl=VehiclesData[vehicle_id].GPS_Y+100;
    
    //initial_scale = 1;
    //canvas_pixelstometer=initial_scale;
    //draw(-2,-2,-2,-2);
}

// xi,yi - x,y of the left corner
// xiant,yiant - old x,y of the left corner
// sx,sy - scaling factors in x and y
// sxant,syant - old scaling factors in x and y
var xiant=0, yiant=0, sxant=1, syant=1;
// last time a draw was made
var draw_last_time = 0;

var canvas_xtl,  canvas_ytl;
var initial_scale = 0.5;
var canvas_pixelstometer=initial_scale;
function draw(xi,yi,sx,sy) 
{
    var div_wrapper = document.getElementById('divMaps');
    var canvas = document.getElementById('ctrMap');
    var cBack = document.getElementById('canvas_back');
    //console.log("draw("+xi+","+yi+","+sx+","+sy + ")");

    // Don't draw too fast 24 frames/s
    if((Date.now()-draw_last_time)<45 && !(xi==-2 && yi==-2 && sx==-2 && sy == -2))
        return;
    //console.log("time since last draw "+(Date.now()-draw_last_time))
    draw_last_time = Date.now();

  if (canvas && canvas.getContext && imgLoaded)
  {
    var ctx = cBack.getContext('2d');  
    var ctf = canvas.getContext('2d');
    ctf.save();
    ctx.save();
    //Clear front frame
    ctf.clearRect(0, 0, canvas.width, canvas.height);
      
    // if the window changes width or a zoom in
    if ((xi==0 && yi==0 && sxant==1 && syant==1) || 
      (canvas.width != canvas.parentNode.offsetWidth) || 
      (canvas.height != canvas.parentNode.offsetHeight) || 
      (sx!=-1 && sy!=-1) || (xi==-2 && yi==-2) || 
      center_on_Vehicle!=-1)
    {// || (xi==0 && yi==0 && sxant==1 && syant==1) ){
      // Update contexts in case they are different from the parants
      if (ctx.canvas.width != canvas.offsetWidth)
      {
        ctx.canvas.width = canvas.offsetWidth;
        ctf.canvas.width = canvas.offsetWidth;
      }

      if(ctx.canvas.height != canvas.offsetHeight)
      { 
        ctx.canvas.height = canvas.offsetHeight;
        ctf.canvas.height = canvas.offsetHeight;
      }

      //ctx.mozImageSmoothingEnabled = true;
      //ctf.mozImageSmoothingEnabled = true;

      // image already loaded
      if(imgLoaded)
      { 
        var scaleHeight =  Scenarios[Scenario-1].height/canvas.height;
        var scaleWidth  =  Scenarios[Scenario-1].width/canvas.width;
        var scaleAux = Math.max(scaleWidth, scaleHeight);
        //if(scaleAux!=initial_scale && center_on_Vehicle==-1){
        if((xi==0 && yi==0 && sxant==1 && syant==1))
        {
            canvas_xtl = Scenarios[Scenario-1].refpoint[0]-(canvas.width*scaleAux*scaleZoom - Scenarios[Scenario-1].width)/2;
            canvas_ytl = Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height+(canvas.height*scaleAux*scaleZoom - Scenarios[Scenario-1].height)/2;
            initial_scale = scaleAux;
        }

        // Zooming
        if(xi !=-1 && xi!=0 && !mouse_wheel_drag && xi!=-2){
            // Mouse coordinates in global coordinates
            var Zoom_meters = getCanvasPos_meter([xi, yi], true);

            canvas_xtl = Zoom_meters[0] - initial_scale*scaleZoom*(Zoom_meters[0]-canvas_xtl)/canvas_pixelstometer;
            canvas_ytl = Zoom_meters[1] - initial_scale*scaleZoom*(Zoom_meters[1]-canvas_ytl)/canvas_pixelstometer;
        }
        if(mouse_wheel_drag && xi!=-1 && xi !=-2){
            canvas_xtl = mouse_wheel_canvas_pos[0] - xi*canvas_pixelstometer;
            canvas_ytl = mouse_wheel_canvas_pos[1] + yi*canvas_pixelstometer;

        }

        // update convertion from pixels to meters
        canvas_pixelstometer = initial_scale*scaleZoom;

        if(center_on_Vehicle!=-1){
            centerVehicle(center_on_Vehicle);
        }
        // Top-left corner of the image in the meters
        img_xbl = Scenarios[Scenario-1].refpoint[0];
        img_ybl = Scenarios[Scenario-1].refpoint[1];
        img_xtl = img_xbl;
        img_ytl = img_ybl+Scenarios[Scenario-1].height;
        
        // Top-left corner of the image in canvas (pixels)
        img_canvas_xtl = (img_xtl-canvas_xtl)/canvas_pixelstometer;
        img_canvas_ytl = -(img_ytl-canvas_ytl)/canvas_pixelstometer;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var init_scale = 40;
        var gridScale = Math.round(init_scale*canvas_pixelstometer/5)*5;
        
        // TODO: Change this to smaller values than 1
        init_scale = 1;
        while(gridScale==0){
            gridScale = Math.round(init_scale*canvas_pixelstometer);
            init_scale=init_scale*2;
        }
        /*var gridScale =  Math.round(20*canvas_pixelstometer/5)*5;
        if(gridScale==0)
            gridScale = Math.round(20*canvas_pixelstometer)*/

        // Build the Grid in the map
        buildMapGrids(1/canvas_pixelstometer, "#444444", gridScale, "canvas_back",10);
            
        // Check if the image is on the screen
        var img_canvas_xbr = img_canvas_xtl+Scenarios[Scenario-1].width/canvas_pixelstometer;
        var img_canvas_ybr = img_canvas_ytl+Scenarios[Scenario-1].height/canvas_pixelstometer;
        /*if((img_canvas_xtl>=0 && img_canvas_xtl<canvas.width && img_canvas_ytl>=0 && img_canvas_ytl<canvas.height) || // TOP LEFT CORNER INSIDE THE MAP
          (img_canvas_xbr>=0 && img_canvas_xbr<canvas.width && img_canvas_ybr>=0 && img_canvas_ybr<canvas.height)) // BOTTOM RIGHT CORNER INSIDE THE MAP
        */
        if(img_canvas_xtl < canvas.width && img_canvas_xbr > 0 && 
          img_canvas_ytl < canvas.height && img_canvas_ybr > 0)
        {
          ctx.drawImage(imgScen,img_canvas_xtl,img_canvas_ytl,Scenarios[Scenario-1].width/canvas_pixelstometer,Scenarios[Scenario-1].height/canvas_pixelstometer);
          console.log("Draw Image img_canvas_xtl "+img_canvas_xtl+" img_canvas_ytl "+ img_canvas_ytl + "width " + Scenarios[Scenario-1].width/canvas_pixelstometer + " height " + Scenarios[Scenario-1].height/canvas_pixelstometer)
          console.log("Canvas width "+canvas.width+" height "+ canvas.height);
        }

        // Save to Local Storage
        localStorage.canvas_xtl = JSON.stringify(canvas_xtl);
        localStorage.canvas_ytl = JSON.stringify(canvas_ytl);
        localStorage.initial_scale = JSON.stringify(initial_scale);
        localStorage.scaleZoom = JSON.stringify(scaleZoom);
        console.log("saving map settings to localStorage");

        //}
        // Draw Bathymetry File points
        if(BathyFile_points!=undefined)
            drawBathy(BathyFile_points, "canvas_back");
        
        // Build Ruler
        buildGrids(1/canvas_pixelstometer, "#222222", gridScale, "canvas_back",10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth   = 4;
        ctx.strokeRect(0,  0, canvas.width, canvas.height);

        if(!MISSION_DESIGN){
            if(programming_ui)
                Plot_Mission('ctrMap', 1);
            else
            {
                if(typeof missions_to_be_displayed !== 'undefined' )
                {
                    for (var mn=0; mn< missions_to_be_displayed.length; mn++)
                    {
                        Plot_Mission('canvas_back',0.4,missions_to_be_displayed[mn]);
                    }
                }
            }
            //console.log("Ploting mission without mission design");
        }else{
            mission_program_resize();
        }
      }
    }else{
        // Clear front frame
        //var ctf = canvas.getContext('2d');
        //ctf.clearRect(0, 0, canvas.width, canvas.height);
    }
    //console.log("Draw Everything")
    
    // Draw Bathymetry points acquired by the vehicle
    if(pointsBathy.length!=0 && showBathyPoints)
        drawBathy(pointsBathy, "ctrMap");

    // Draw WayPoints
    for(var p=0; p<DPoints.length;p++){
        //circles(DPoints[p].x,DPoints[p].y,color_palette['yellow']);
        crosses(DPoints[p]);
    }
    localStorage.DPoints = JSON.stringify(DPoints);

    // Draw Points
    for(var p=0; p<DPoints_green.length;p++){
        circles(DPoints_green[p].x,DPoints_green[p].y, color_palette['light_green']);
        //drawellipse(DPoints_green[p].x,DPoints_green[p].y, 5,10, 45*Math.PI/180, color_palette['light_green'], false, undefined,undefined,2)
    }
    localStorage.DPoints_green = JSON.stringify(DPoints_green);
    
    // Draw Points Profiler
    for(var p=0; p<pointsProfiler.length;p++){
        circles(pointsProfiler[p].x,pointsProfiler[p].y,"#FFFFFF", false, undefined,undefined,2);
        circles(pointsProfiler[p].x,pointsProfiler[p].y,"#FFFFFF", false, undefined,undefined,2);
    }

    
    // Draw Path of Vehicles
    for(var i=0; i<VehiclesData.length;i++){
        DrawVehiclePath(i);
    }

     PrintVehicle();

    // Draw Vehicle Buttons
    buildVhButtons("ctrMap");
    
    // update sideBar div
    update_divSideBar();

    // Show Ruler distance 
    if(RULER && mouse_canvas_pos_old && actual_mouse_pos)
    {          
      pos_ini = mouse_canvas_pos_old;
      pos_end = actual_mouse_pos;

      // If shift straight line 
      if(shiftpress){
          // angle with 45deg res
          var angle = Math.round((Math.atan2(pos_end[3]-pos_ini[3], pos_end[2]-pos_ini[2])*180/Math.PI)/45.0)*45.0*Math.PI/180;
          var norm = Math.hypot(pos_end[3]-pos_ini[3], pos_end[2]-pos_ini[2]);
          pos_end[2] = pos_ini[2] + Math.cos(angle)*norm;
          pos_end[3] = pos_ini[3] + Math.sin(angle)*norm;

      }
      var line_angle = (Math.atan2(pos_end[3]-pos_ini[3], pos_end[2]-pos_ini[2])*180/Math.PI)+90;
      if(line_angle<0) line_angle+=360;
      //console.log("angle_line", angle_line);
      
      // Line
      ctf.beginPath();
      ctf.lineCap = 'square';
      ctf.strokeStyle = '#33691e';
      ctf.fillStyle = '#76ff03';
      ctf.lineWidth = 4;
      ctf.moveTo(pos_ini[2], pos_ini[3])
      ctf.lineTo(pos_end[2], pos_end[3])
      ctf.closePath();
      ctf.stroke();
      ctf.lineWidth = 2;
      ctf.strokeStyle = '#76ff03';
      ctf.stroke();

      // Begin cap
      ctf.beginPath();
      ctf.strokeStyle = '#33691e';
      ctf.arc(pos_ini[2], pos_ini[3], 5, 2 * Math.PI,0, false);
      ctf.closePath();      
      ctf.stroke();
      ctf.fill();
      
      // End cap
      ctf.beginPath();
      ctf.arc(pos_end[2], pos_end[3], 5, 2 * Math.PI,0, false);
      ctf.closePath();
      ctf.stroke();
      ctf.fill();
      
      // Text
      ctf.beginPath();
      ctf.strokeStyle = '#33691e';
      ctf.lineWidth = 2;
      ctf.font = "12pt Calibri,Geneva,Arial";
/*      ctf.textAlign = 'middle';
       //ctf.strokeText(compute_eucl_dist(actual_mouse_pos, pos_ini).toFixed(1)+ " m", mouse_canvas_pos_old[2]+(actual_mouse_pos[2]-mouse_canvas_pos_old[2])/2+5, mouse_canvas_pos_old[3]+(actual_mouse_pos[3]-mouse_canvas_pos_old[3])/2-5);
      line_text = compute_eucl_dist(actual_mouse_pos, mouse_canvas_pos_old).toFixed(1)+ "m";
      line_text += " " + line_angle.toFixed(1) + "deg";
      if(line_angle>90 && line_angle<270){
          ctf.strokeText(line_text, pos_ini[2]+(pos_end[2]-pos_ini[2])/2+5, pos_ini[3]+(pos_end[3]-pos_ini[3])/2+20);
          ctf.fillText(line_text, pos_ini[2]+(pos_end[2]-pos_ini[2])/2+5, pos_ini[3]+(pos_end[3]-pos_ini[3])/2+20);
      }else{
          ctf.strokeText(line_text, pos_ini[2]+(pos_end[2]-pos_ini[2])/2+5, pos_ini[3]+(pos_end[3]-pos_ini[3])/2-10);
          ctf.fillText(line_text, pos_ini[2]+(pos_end[2]-pos_ini[2])/2+5, pos_ini[3]+(pos_end[3]-pos_ini[3])/2-10);
      }*/
       //ctf.strokeText(compute_eucl_dist(actual_mouse_pos, pos_ini).toFixed(1)+ " m", mouse_canvas_pos_old[2]+(actual_mouse_pos[2]-mouse_canvas_pos_old[2])/2+5, mouse_canvas_pos_old[3]+(actual_mouse_pos[3]-mouse_canvas_pos_old[3])/2-5);
        if(line_angle>0 && line_angle<180){
            ctf.textAlign = 'left';
            line_text = compute_eucl_dist(pos_end, pos_ini).toFixed(1)+ "m";
            ctf.strokeText(line_text, pos_end[2]+20, pos_end[3]-10);
            ctf.fillText(line_text, pos_end[2]+20, pos_end[3]-10);
            line_text = line_angle.toFixed(1) + "deg";
            ctf.strokeText(line_text, pos_end[2]+20, pos_end[3]+10);
            ctf.fillText(line_text, pos_end[2]+20, pos_end[3]+10);
        }else{
            ctf.textAlign = 'right';
            line_text = compute_eucl_dist(pos_end, pos_ini).toFixed(1)+ "m";
            ctf.strokeText(line_text, pos_end[2]-20, pos_end[3]-10);
            ctf.fillText(line_text, pos_end[2]-20, pos_end[3]-10);
            line_text = line_angle.toFixed(1) + "deg";
            ctf.strokeText(line_text, pos_end[2]-20, pos_end[3]+10);
            ctf.fillText(line_text, pos_end[2]-20, pos_end[3]+10);
        }
      ctf.closePath();
      ctf.lineWidth = 1;
      ctf.stroke();
	  }
    ctx.restore();
    ctf.restore();
  }else{
      if(imgLoaded){
          imgLoaded = false;
          imgScen.src = Scenarios[Scenario-1].path;
          console.error('Medusa_MOOS_ROS.js Error loading image')
      }
  }
}

var ZoomIn = false, ZoomedIn=false;
function btZoomIn(obj,event){
    if (!ZoomIn)
        return;
    ZoomIn=false;

    var posx = posy = 0;
    var e = window.event || event;
    if (e.pageX || e.pageY)     {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY)     {
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    
    var posObj = findPos(obj);
    
    Zoom(posx-posObj[0], posy-posObj[1], 1/3);
}
function Zoom(posx, posy, scale){
    var canvas = document.getElementById('ctrMap');
    //var div_wrapper = document.getElementById('divMaps');
    //var imgScen = new Image();    
    //imgScen.src = ScenNames[Scenario-1];
    var wdt=imgScen.width;
    var hgt=imgScen.height;
/*    var Xpos =(posx)*wdt/canvas.width;
    var Ypos =(posy)*hgt/canvas.height;
*/
    var Xpos =posx;
    var Ypos =posy;
    /*if((Xpos+wdt*scale)>=wdt)
        Xpos=wdt-wdt*scale-1;
    if((Ypos+hgt*scale)>=hgt)
        Ypos=hgt-hgt*scale-1;*/
    //console.log(" x:" + Xpos + " Y:" + Ypos + " SCALE:" + scale);
        
    draw(Xpos,Ypos,scale,scale);
    scaleZoom = scale;
    
/*    if(scale==1)
        ZoomedIn=false;
    else
        ZoomedIn=true;*/

}
function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  else
	e.returnValue = false;  
}

var upperlimit = 50;
var lowerlimit = 0.000002;
function scrollZoom(event){
    var delta = 0;
//    var increm = 0.1; //TODO del this
    //alert("scroll");
    //preventDefault(event);
    if (!altpress)
        return;
    
    if (!event) event = window.event;
 
    // normalize the delta
    if (event.wheelDelta) {
        // IE and Opera
        delta = event.wheelDelta / 1200;
    } else if (event.detail) {
        // W3C
        delta = -event.detail / 40;
    }

    //calculating the next position of the object
    //var new_zoom = Math.round((scaleZoom-delta/3)*100)/100;
    //var new_zoom = Math.round((scaleZoom-delta*3)*100)/100;
    var new_zoom = Math.round((scaleZoom-delta*scaleZoom)*100000)/100000;
    if(new_zoom>=lowerlimit && delta>0){ //Zoom IN
        scaleZoom=new_zoom;
        Zoom(MousePosition[0], MousePosition[1], scaleZoom);
    }else if(new_zoom<=upperlimit && delta<0){ //Zoom Out
        scaleZoom=new_zoom;
/*        if(scaleZoom==upperlimit){
            draw(0,0,1,1);
        }else{*/
        Zoom(MousePosition[0], MousePosition[1], scaleZoom);
        //}
    }else if(new_zoom>=upperlimit && delta<0){
        scaleZoom = upperlimit;
        //draw(0,0,1,1);
        Zoom(MousePosition[0], MousePosition[1], scaleZoom);
    }else if(new_zoom>=lowerlimit && delta>0){
        scaleZoom = lowerlimit;
        Zoom(MousePosition[0], MousePosition[1], scaleZoom);
    }

	preventDefault(event);
    return false;
}

var mouse_down_obj = null;
var mouse_down_pos = null;
var mouse_down_event = null;
var actual_mouse_pos = undefined;
var dist_pinch_zoom = 0;
var scale_begin =0;
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
}

function MouseMoveCanvas(event, obj){
	if (!event) event = window.event;
	if (event.shiftKey) {console.log('shift pressed');shiftpress=true;} else shiftpress=false;
	if (event.altKey) {console.log('alt pressed');altpress=true;/*alt is down*/} else altpress=false;
	if (event.ctrlKey) {console.log('ctrl pressed');ctrlpress=true;} else ctrlpress=false;
	if (event.metaKey) {console.log('cmd pressed');/*cmd is down*/}

  pos_canvas=getMousePosCanvas(obj,event);
  pos_meter = getCanvasPos_meter([pos_canvas[2], pos_canvas[3]], true)

  CheckMousePosition(pos_canvas);
/*  if(obj.tagName.toLowerCase() == 'span')
    show_vehicle_info_menu(obj,-1);*/

  // Pinch Zoom Mobile devices
  if(event.type != undefined && event.type.indexOf("touch")!=-1){
      var touch1 = event.touches[0];
      var touch2 = event.touches[1];
      
      var canvas = document.getElementById("ctrMap");
      var ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      
      var posObj = findPos(document.getElementById("ctrMap"));
      if(touch1 && touch2) {
          var dist = getDistance({
              x: touch1.pageX,
              y: touch1.pageY
          }, {
              x: touch2.pageX,
              y: touch2.pageY
          });

          // First zoom
          var x_init = (touch1.pageX-posObj[0])+(touch2.pageX-touch1.pageX)/2;
          var y_init = (touch1.pageY-posObj[1])+(touch2.pageY-touch1.pageY)/2;
          if(!dist_pinch_zoom){
              dist_pinch_zoom = dist;
              scale_begin = scaleZoom;
              mouse_wheel_begin_pos=[x_init, y_init];
              mouse_wheel_canvas_pos = [canvas_xtl, canvas_ytl];
          }

          //var sMouseUpcale = scale_begin*((dist_pinch_zoom/dist-1)*0.2+1);
          var scale = scale_begin*(dist_pinch_zoom/dist);
          
          if(scale>upperlimit) scale= upperlimit;
          if(scale<lowerlimit) scale= lowerlimit;
          //draw(x_init, y_init, scale, scale);
          // Saturating zoom
          if(getDistance({'x': x_init, 'y': y_init}, {'x': mouse_wheel_begin_pos[0], 'y': mouse_wheel_begin_pos[1]})>10){
              mouse_wheel_drag = true;
              Zoom(x_init-mouse_wheel_begin_pos[0], y_init-mouse_wheel_begin_pos[1], scaleZoom+0.0000001);
              ctx.strokeText(String((x_init-mouse_wheel_begin_pos[0]).toFixed(1) + "  " + (y_init-mouse_wheel_begin_pos[1]).toFixed(1) + " " + (dist_pinch_zoom/dist).toFixed(1)), 200, 200);
          }
          mouse_wheel_drag = false;
          Zoom(x_init, y_init, scale);
          ctx.strokeText(String(x_init.toFixed(1) + "  " + y_init.toFixed(1) + " " + (dist_pinch_zoom/dist).toFixed(1)), 200, 200);
          scaleZoom = scale;
          
      }
  }

    if(over_bt==-1 && obj.tagName.toLowerCase() != 'span'){
      var divT=document.getElementById('div_vehicle_info_menu')
      divT.className="vehicle_info_menu_hidden";
      divT.style.left=0;
      divT.style.top=0;
    } 

    // Measuring tool Update
    // fast course line don't use mouse down
	if(RULER && mouse_canvas_pos_old ){
        //var canvas = document.getElementById('ctrMap');
    actual_mouse_pos = getMousePosCanvas(document.getElementById('ctrMap'),event);
		if((Date.now()-draw_last_time)>45)
            draw(-1, -1, -1, -1);
	}

    if(mouse_wheel_drag){
        var canvas = document.getElementById('ctrMap');
        canvas.style.cursor='move';
        //console.log(" x:" + (MousePosition[0]-mouse_wheel_begin_pos[0]) + " Y:" + (MousePosition[1]-mouse_wheel_begin_pos[1])+ " SCALE:" + scaleZoom);
        Zoom((MousePosition[0]-mouse_wheel_begin_pos[0]), (MousePosition[1]-mouse_wheel_begin_pos[1]), scaleZoom+0.0000001);
        //draw(-1,-1,-1,-1);
        console.log("doing mouse wheel drag");
    }
}

var mouse_canvas_pos_old;

function MouseUpCanvas(event, obj){
    dist_pinch_zoom=0;
    scale_begin=0;
    if(mouse_wheel_drag){
        mouse_wheel_drag = false;
        console.log("finish mouse whell drag");
    }
    if(RULER){
      //RULER=false;
      //activate_BT('measure',RULER);
      //var canvas = document.getElementById('ctrMap');
      //var mouse_canvas_pos=getMousePosCanvas(obj,event);
      //alert("distance: "+compute_eucl_dist(mouse_canvas_pos,mouse_canvas_pos_old).toFixed(2)+ " m");
      if(fast_course_line)
      {
        //console.error("fast_course_line not defined yet");
        console.log("fast_course_line")
        console.log(actual_mouse_pos);
        console.log(mouse_canvas_pos_old);
        var temp_mission=new missionObj();
        temp_mission.xrefpoint=canvas_xtl;
        temp_mission.yrefpoint=canvas_ytl;
        temp_mission.utmzone = Scenarios[Scenario-1].utm_zone;
        //temp_mission.mission = new Array();
        temp_mission.mission.push(new Line([mouse_canvas_pos_old[0],mouse_canvas_pos_old[1],actual_mouse_pos[0],actual_mouse_pos[1],0.5,VCurr]));
        send_mission_toVehicle(temp_mission, VCurr-1)
        temp_mission.mission_id = "course_line_v"+(VCurr-1);
        // Change the existing mission
        var found_mission = false;
        for (var mn=0; mn<missions_to_be_displayed.length; mn++)
        {
            if(missions_to_be_displayed[mn].mission_id==temp_mission.mission_id)
            {
                missions_to_be_displayed[mn] = temp_mission;
                found_mission = true;
                break;
            }
        }
        if(!found_mission)
                missions_to_be_displayed.push(temp_mission);

        fast_course_line = false;
        RULER = false;
        //update_displayed_mission();
      }

      mouse_canvas_pos_old = undefined;
      actual_mouse_pos = undefined;
      draw(-2, -2, -2, -2);
    }
}

// Start position of the mouse when mouse wheel drag
var mouse_wheel_begin_pos = []; 
// Start confs for canvas when mouse wheel drag
var mouse_wheel_canvas_pos = []; 
function MouseDown(event,obj){
    if(undefined == event)
        return;
	console.log("Canvas Button pressed " +event.button)
    // Check for canvas buttons
    if(event.button==0 && over_bt!=-1){
        // Only vehicle buttons in this stage
        chVeiculo(over_bt+1);
        return false;
    }
    // Waypoint or Point
   if(event.button==0 && Point == true)
    {
      mouse_down_obj = document.getElementById('ctrMap');
      mouse_down_event = event;
      mouse_down_pos = getMousePosCanvas(mouse_down_obj, event);
      return false;
    }

    if ((event.button==1 && !mouse_wheel_drag) || altpress){ // middle click button
        mouse_wheel_drag = true;
        mouse_wheel_begin_pos = MousePosition.slice(0);
        mouse_wheel_canvas_pos = [canvas_xtl, canvas_ytl];
        console.log("start mouse wheel drag")
        return false;
    }
	if (event.button==2 && !MISSION_DESIGN){ // Right click button
        var canvas = document.getElementById('ctrMap');
        mouse_down_obj = canvas;
        mouse_down_event = event;
        mouse_down_pos = getMousePosCanvas(canvas, event);
        //console.log("Button pressed " +event.button)
        Map_menu(event);
        preventDefault(event);
        return false;
    }

    // Measuring tool 
    if(RULER && !fast_course_line)
    {
        mouse_canvas_pos_old=getMousePosCanvas(obj,event);
    }


    if(!fast_course_line){
        VisualHide = false;
        hideVisualBar();
        chVeiculo(-1);
    }
    /*else if (document.layers||document.getElementById&&!document.all){ // Others
		if (event.which==2){//||event.which==3){
			//console.log("Button pressed " +event.which)
			//alert("2nd button disable");
			Map_menu(event);
			preventDefault(event);
			return false;
		}
	}*/
}

function show_vehicle_info_menu(obj, id){
//function show_vehicle_info_menu(obj){
    var divT = document.getElementById('div_vehicle_info_menu')  
    var canvas = document.getElementById('ctrMap'); 

	//spanid = parseInt(obj.id.split('sp')[1]);

    var p_title = document.getElementById('vhinfo_title');
    posObj = findPos(canvas);
    divT.style.left=Math.min(MousePosition[0] + posObj[0]+20, document.body.offsetWidth-divT.offsetWidth);
    divT.style.top=Math.min(MousePosition[1] + posObj[1]+20, document.body.offsetHeight-divT.offsetHeight);

    if(obj!='undefined'){
        spanid = parseInt(obj.id.split('sp')[1]);
    }else{
        spanid = id;
        divT.style.left=Math.min(MousePosition[0] + posObj[0]+20, document.body.offsetWidth-divT.offsetWidth);
        divT.style.top=Math.min(MousePosition[1] + posObj[1]-100, document.body.offsetHeight-divT.offsetHeight);
    }
    p_title.innerHTML = VehiclesData[spanid-1].name;
    //console.log('top' + divT.style.top)
    //divT.style['transform'] = obj.style['transform'];
    divT.className = "vehicle_info_menu";

    var gps_mode_id = document.getElementById('vhinfo_gps_mode');
    if(DICT_GPS_MODE[VehiclesData[spanid-1].gps_mode]=='undefined')
        gps_mode_id.innerHTML = "UND";
    else  
        gps_mode_id.innerHTML = DICT_GPS_MODE[VehiclesData[spanid-1].gps_mode];

    var op_mode_id = document.getElementById('vhinfo_op_mode');
    if(DICT_OP_MODE[VehiclesData[spanid-1].op_mode]=='undefined')
        op_mode_id.innerHTML = "UND";
    else  
        op_mode_id.innerHTML = DICT_OP_MODE[VehiclesData[spanid-1].op_mode];

    var battery_id = document.getElementById('vhinfo_battery');
    battery_id.innerHTML = VehiclesData[spanid-1].battery + "%";

    var inpressure_id = document.getElementById('vhinfo_inpressure');
    inpressure_id.innerHTML = VehiclesData[spanid-1].inpressure.toFixed(0) + " mBar";

    var lowerleak_id = document.getElementById('vhinfo_lowerleak');
    lowerleak_id.innerHTML = VehiclesData[spanid-1].lowerleak;

    var upperleak_id = document.getElementById('vhinfo_upperleak');
    upperleak_id.innerHTML = VehiclesData[spanid-1].upperleak;
}

function Map_menu(event){
	var divT = document.getElementById('div_menu')
	if(divT){
		
		var posx = posy = 0;
		var e = window.event || event;
		
		if(typeof e.pageX == 'undefined')
			return;
		if ('undefined'!=typeof e.pageX){
			posx = e.pageX;
			posy = e.pageY;
		}else if (e.clientX || e.clientY){
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		divT.style.top=posy;
		divT.style.left=posx;
        $("#div_menu").removeClass("map_menu_hidden");
	}
	
}


function canvasClick(obj,event){
	// Check if Point
	if(Point==true) 
		btWayPoint(obj, event, mouse_down_pos); 
	else if(ZoomIn == true) 
		btZoomIn(obj, event, mouse_down_pos);
	
	//document.getElementById('div_menu').className = "map_menu_hidden";
  if(!$("#div_menu").hasClass("map_menu_hidden"))
    $("#div_menu").addClass("map_menu_hidden");
	
}

function btSTOP_UI(force){
    var obj_jq=$('#stop_button');
    if(force===undefined){
        obj_jq.toggleClass("green");
        obj_jq.toggleClass("red");
        obj_jq.find(">:first-child").toggleClass("mdi-av-play-arrow");
        obj_jq.find(">:first-child").toggleClass("mdi-av-pause");
        return;
    }
    if(force==false){
        obj_jq.removeClass("green");
        obj_jq.addClass("red");
        obj_jq.find(">:first-child").removeClass("mdi-av-play-arrow");
        obj_jq.find(">:first-child").addClass("mdi-av-pause");
    }else{
        obj_jq.addClass("green");
        obj_jq.removeClass("red");
        obj_jq.find(">:first-child").addClass("mdi-av-play-arrow");
        obj_jq.find(">:first-child").removeClass("mdi-av-pause");
    }

}

function btSTOP(){

    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) {
        return;
    }
    btSTOP_UI();
    xmlhttp[VCurr-1].message = '\nError: Sending STOP signal! Try again later!';
    VehiclesData[VCurr-1].VehiclePos.stop_action = true;
    if(VehiclesData[VCurr-1].VehiclePos.STOP==0){
        xmlhttp[VCurr-1].abort();
        if(VehiclesData[VCurr-1].SystemState)
            xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/Thruster_Stop std_msgs/Int8 1",true); // Server stuck in a loop.
        else
            xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/Thrusters_OFF=1",true); // Server stuck in a loop.
        
    }else{
        xmlhttp[VCurr-1].abort();
        if(VehiclesData[VCurr-1].SystemState)
            xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/Thruster_Stop std_msgs/Int8 0",true); // Server stuck in a loop.
        else
            xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/Thrusters_OFF=0",true); // Server stuck in a loop.
    }
    var requestTimer = setTimeout(function() {
        //alert('Error:\nConsole wasn\'t able to send STOP signal!\nTry again later!');
        xmlhttp[VCurr-1].abort();
        // Handle timeout situation, e.g. Retry or inform user.
    }, 500);
    xmlhttp[VCurr-1].send();
}

function btSTOPProject(){
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) 
    {
        return;
    }
    //  alert(VehiclePos[VCurr-1].STOP);
    xmlhttp[VCurr-1].message = '\nError: Sending STOP signal! Try again later!';
    VehiclesData[VCurr-1].VehiclePos.project_stop_action = true;
    if(VehiclesData[VCurr-1].VehiclePos.Project_STOP==0){
        xmlhttp[VCurr-1].abort();
        if(VehiclesData[VCurr-1].SystemState)
            xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/project_enable std_msgs/Bool false",true); // Server stuck in a loop.
        else
            xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/Thrusters_OFF=1",true); // Server stuck in a loop.
        
    }else{
        xmlhttp[VCurr-1].abort();
        if(VehiclesData[VCurr-1].SystemState)
            xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/project_enable std_msgs/Bool true",true); // Server stuck in a loop.
        else
            xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/Thrusters_OFF=0",true); // Server stuck in a loop.
    }
    var requestTimer = setTimeout(function() {
        //alert('Error:\nConsole wasn\'t able to send STOP signal!\nTry again later!');
        xmlhttp[VCurr-1].abort();
        // Handle timeout situation, e.g. Retry or inform user.
    }, 500);
    xmlhttp[VCurr-1].send();
}

function btSTOPMission(){
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) {
        return;
    }
    xmlhttp[VCurr-1].message = '\nError: Sending STOP signal! Try again later!';
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState)
        xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/Flag std_msgs/Int8 0",true); // Server stuck in a loop.
    else
        xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/Flag=0",true); // Server stuck in a loop.
    var requestTimer = setTimeout(function() {
        //alert('Error:\nConsole wasn\'t able to send STOP signal!\nTry again later!');
        xmlhttp[VCurr-1].abort();
        // Handle timeout situation, e.g. Retry or inform user.
    }, 500);
    xmlhttp[VCurr-1].send();
}



function holdPos(){
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) 
        return;
    xmlhttp[VCurr-1].abort();
    VehiclesData[VCurr-1].VehiclePos.holdpos = true;
    
    if(parseFloat(document.all.txtXD.value)==-1 && parseFloat(document.all.txtYD.value)==-1)
        DPoints.push({'x':VehiclesData[VCurr-1].GPS_X,'y':VehiclesData[VCurr-1].GPS_Y, 'color':VehiclesData[VCurr-1].color});
    else
        DPoints.push({'x':parseFloat(document.all.txtXD.value),'y':parseFloat(document.all.txtYD.value), 'color':VehiclesData[VCurr-1].color});
    
    xmlhttp[VCurr-1].message = '\nError: Sending WayPoint! Try again!';
    //xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20POSD_X="+document.all.txtXD.value+"%20POSD_Y="+document.all.txtYD.value+"%20POSD_STOP=0.0",true); 
    if(VehiclesData[VCurr-1].SystemState){ //ROS
        //xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20goto_waypoint/goal%20GotoPoint/GotoPointActionGoal%20{goal: {Goal: {pose: {position: {x: "+parseFloat(document.all.txtXD.value)+", y: "+parseFloat(document.all.txtYD.value)+"}}}}}",true); 
        xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20/"+VehiclesData[VCurr-1].name+"/controls/send_wp_standard%20geometry_msgs/PointStamped%20{point: {x: "+parseFloat(document.all.txtXD.value)+", y: "+parseFloat(document.all.txtYD.value)+"}}",true); 
    }else
        xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20POSD_X="+document.all.txtXD.value+"%20POSD_Y="+document.all.txtYD.value+"%20POSD_STOP=0.0",true); 

    var requestTimer = setTimeout(function() {
        xmlhttp[VCurr-1].abort();
        // Handle timeout situation, e.g. Retry or inform user.
    }, 400);
    xmlhttp[VCurr-1].send();
}

function stopPos(){
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) 
        return;

    //xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20POSD_STOP=1.0",true); 
    if(VehiclesData[VCurr-1].SystemState) //ROS
        //xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20goto_waypoint/goal%20GotoPoint/GotoPointActionGoal%20{goal: {Goal: {pose: {position: {x: -2, y: -2}}}}}",true); 
        xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20/"+VehiclesData[VCurr-1].name+"/controls/send_wp_standard%20geometry_msgs/PointStamped%20{point: {x: -2, y: -2}}",true); 
    else
        xmlhttp[VCurr-1].open("GET",VehicleServer+"SET%20"+VehiclesData[VCurr-1].name+"/addons/POSD_STOP=1.0",true); 
    var requestTimer = setTimeout(function() {
        xmlhttp[VCurr-1].abort();
        //VehiclesData[vehicle].txtStatus += "\n[Timeout] No reply from host\n["+VehicleServer+"]\n";
        // Handle timeout situation, e.g. Retry or inform user.
    }, 400);
    xmlhttp[VCurr-1].send();
}

/*function CaddyDiverWaypoint(lat, long){
	var vmblack = 2;
	var CaddySurfaceServer='http://'+VehiclesData[vmblack-1].ip+port_txt;

    // TODO: Check Surface Vehicle 
    xmlhttp[vmblack-1].message = '\nError: Sending WayPoint! Try again!';
    xmlhttp[vmblack-1].open("GET",CaddySurfaceServer+"RSET%20caddy/buddy/guide_target_latlon%20geometry_msgs/PointStamped%20{point: {x: "+lat+", y: "+long+"}}",true); 
    
    console.log("[caddy] Surface Vehicle server: " + CaddySurfaceServer);
    var requestTimer = setTimeout(function() {
        xmlhttp[vmblack-1].abort();
        // Handle timeout situation, e.g. Retry or inform user.
    }, 400);
    xmlhttp[vmblack-1].send();
}*/

function btWayPoint(obj, event, pos){
    if(!Point)
        return;
    Point = false; 

    var mouseCanvas = getMousePosCanvas(obj, event);
    if(pos!=undefined) mouseCanvas = pos;
    var mouseinMeters = getCanvasPos_meter([mouseCanvas[2], mouseCanvas[3]], true);

    /*if(CaddyDiver){
    console.log("received waypoint" + Point);

        // Compute Lat Long
        var utm = "+proj=utm +zone="+Scenarios[Scenario-1].utm_zone;
        var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        var lat_lon = proj4(utm, wgs84, [mouseinMeters[0].toFixed(2), mouseinMeters[1].toFixed(2)]);

        var response = window.confirm("Do you want to send diver to lat:"+lat_lon[1].toFixed(5) + ", lon:" + lat_lon[0].toFixed(5));
        if (response == true) {
	    	DPoints_green.push({'x': mouseinMeters[0],'y': mouseinMeters[1], 'color':color_palette['red900']});
	        circles(DPoints_green[DPoints_green.length-1].x,DPoints_green[DPoints_green.length-1].y, "#99FF99");
		    txt = "You pressed OK!"; // Send the point
		    CaddyDiverWaypoint(lat_lon[1].toFixed(7), lat_lon[0].toFixed(7));
		} else {
		    txt = "You pressed Cancel!";
		}     
		CaddyDiver = false;
    	return;
    }*/

    if(!WayPoint){

        // Compute Lat Long
        var utm = "+proj=utm +zone="+Scenarios[Scenario-1].utm_zone;
        var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        var lat_lon = proj4(utm, wgs84, [mouseinMeters[0].toFixed(2), mouseinMeters[1].toFixed(2)]);

        ret = window.prompt("Copy point with Ctrl+x and ENTER", "UTM: "+mouseinMeters[0].toFixed(2) + ", " + mouseinMeters[1].toFixed(2) + " LatLong: " +
           lat_lon[1].toFixed(5) + ", " + lat_lon[0].toFixed(5));

        if(ret==null)
          return;

        DPoints_green.push({'x': mouseinMeters[0],'y': mouseinMeters[1], 'color':color_palette['red900']});
        circles(DPoints_green[DPoints_green.length-1].x,DPoints_green[DPoints_green.length-1].y, "#99FF99");
        return;
    }

    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) 
        return;

    console.log("Canvas X:" + mouseCanvas[0] + " y: " + mouseCanvas[1] )
    holdPosPre[0].x[VCurr-1] = mouseinMeters[0]; holdPosPre[0].y[VCurr-1] = mouseinMeters[1];
    document.all.txtXD.value = ''+(mouseinMeters[0]);
    document.all.txtYD.value = ''+(mouseinMeters[1]);

    DPoints.push({'x': mouseinMeters[0],'y': mouseinMeters[1], 'color':VehiclesData[VCurr-1].color});
    crosses(DPoints[DPoints.length-1]);
    WayPoint = false; 
    
    //activate_BT('waypoint',WayPoint);
    if(VehiclesData[VCurr-1].mds_panel == true)
      winMDeepSea.postMessage("waypoint:"+JSON.stringify(DPoints[DPoints.length-1]), "*" );
    else
      holdPos();
}
var VisualHide=false;
function hideVisualBar(){
    if(VisualHide==false){
        divVisual.style.position='absolute';
        divVisual.style.display='none'; 
        columnVisual.style.width = '1px'; 
        hideBar.innerHTML = "><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>><br>>";
        hideBar.style.width = '10px';
        VisualHide = true;
        divMDeepSea.style.visibility='hidden'
        divVisual.style.visibility='hidden'; 
        //ctrMap.width='100px';
        //draw(0,0,1,1);
        //var ctx = canvas.getContext('2d');
        //ctx.restore();
    }else{
        divVisual.style.position='absolute';
        divVisual.style.display='initial'; 
        //columnVisual.style.width = '260px'; 
        hideBar.innerHTML = "<<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><<br><";
        hideBar.style.width = '10px';
        VisualHide =false;
        if(VehiclesData[VCurr-1].mds_panel)
        {
          divMDeepSea.style.visibility='visible'; 
          divVisual.style.visibility='hidden'; 
        }
        else
        {
          divVisual.style.visibility='visible'; 
          divMDeepSea.style.visibility='hidden'
        }
        //ctrMap.width='100px';
        //draw(0,0,1,1);
        //var ctx = canvas.getContext('2d');
        //ctx.restore();
    }
}
function update_divSideBar()
{
  // Populate txtStatus
  if(VCurr>0 && VehiclesData[VCurr-1].txtStatus != undefined)
  {
    document.all.txt_vars.textContent = VehiclesData[VCurr-1].txtStatus;
    if(VehiclesData[VCurr-1].received_var == undefined || (Date.now()/1000-VehiclesData[VCurr-1].received_var) > 2.0)
      document.all.txt_vars.style.color = "red"
    else
      document.all.txt_vars.style.color = "black"

  }
  winMDeepSea.postMessage("update:"+String(VCurr-1), "*" );

}
function update_divVisual_mode(vid, flag_new_data){
    var op_mode_id = document.getElementById('divVisual_mode');
    if(vid != VCurr-1 && flag_new_data){
        op_mode_id.innerHTML = DICT_OP_MODE[0];
        return;
    }
    var Flag_string = DICT_OP_MODE[VehiclesData[vid].op_mode];
    if(Flag_string=='undefined')
        op_mode_id.innerHTML = "UND";
    else  
        op_mode_id.innerHTML = Flag_string;
}

function chVeiculo(aux, force){
    force = typeof force !== 'undefined' ? force : false;
    
    var v_old = VCurr;
    
    if (!aux || aux>10 || aux<-1 || (aux==VCurr && !force )){
        return;
    }
    VCurr = aux;
    // Show Vehicle bar
    if(VCurr == -1 || VehiclesData[VCurr-1].active==false) {
        VCurr = -1;
        $("#fast_menu_gohere").addClass("fast_menu_disable")
        $("#fast_menu_courseline").addClass("fast_menu_disable")
        VisualHide = false;
        return;
    }else
    {
        $("#fast_menu_gohere").removeClass("fast_menu_disable")
        $("#fast_menu_courseline").removeClass("fast_menu_disable")
        VisualHide = true;
    }

    //VehiclesData[vehicle].txtStatus = "\n";
    document.all.txtXD.value = holdPosPre[0].x[VCurr-1];
    document.all.txtYD.value = holdPosPre[0].y[VCurr-1];

    if(VehiclesData.length>=VCurr){
        //document.IP.txtIP.value = VehiclesData[VCurr-1].ip;
        newIP();
    }

    toggle_stop_button(false,VehiclesData[VCurr-1].VehiclePos.STOP !=0, false);
    toggle_stop_button(true,VehiclesData[VCurr-1].VehiclePos.Project_STOP !=0, false);
    
    // Reset everything
    document.all.ULe.style.setProperty("background-color",color_palette['red']);
    document.all.LLe.style.setProperty("background-color",color_palette['red']);
    document.all.RTK.style.setProperty("background-color",color_palette['red900']);
    document.all.RTK.innerHTML = "NO GPS";
    update_divVisual_mode(VCurr-1, false);
    draw(-1,-1,-1,-1);
    
    //update_divSideBar();

    hideVisualBar();
}

function changeSystem(obj){
    if(obj){
        VehiclesData[VCurr-1].SystemState = obj.checked;
    }
}

function inputChange(obj){
    if(obj.id=='txtXD')
        holdPosPre[0].x[VCurr-1] = obj.value;
    else if(obj.id=='txtYD')
        holdPosPre[0].y[VCurr-1] = obj.value;
    else if(obj.id=='XJ')
        holdPosPre[1].x[VCurr-1] = obj.value;
    else if(obj.id=='YJ')
        holdPosPre[1].y[VCurr-1] = obj.value;
    else if(obj.id=='XK')
        holdPosPre[2].x[VCurr-1] = obj.value;
    else if(obj.id=='YK')
        holdPosPre[2].y[VCurr-1] = obj.value;
    localStorage['holdPosition']=JSON.stringify(holdPosPre);
}

function Thruster_Test(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState)//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20Thruster_Test std_msgs/Bool true',true);
    else
        xmlhttp[VCurr-1].open('GET',VehicleServer+'SET%20Thruster_Test=1.0',true);
    xmlhttp[VCurr-1].send();
}

function Thruster_Wash(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState)//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20Thruster_Wash std_msgs/Bool true',true); 
    else
        xmlhttp[VCurr-1].open('GET',VehicleServer+'SET%20Thruster_Wash=900',true);
    xmlhttp[VCurr-1].send();
}

function Power_Shutdown(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState){//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20bat_monit/shutdown std_msgs/Bool true',true); 
        xmlhttp[VCurr-1].send();
    }
}

function Power_Reboot(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState){//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20bat_monit/power_reboot std_msgs/Bool true',true); 
        xmlhttp[VCurr-1].send();
    }
}

function PC_Shutdown(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState){//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20bat_monit/pc_shutdown std_msgs/Bool true',true); 
        xmlhttp[VCurr-1].send();
    }
}

function Compress_Logs(){
    xmlhttp[VCurr-1].abort();
    if(VehiclesData[VCurr-1].SystemState){//ROS
        xmlhttp[VCurr-1].open('GET',VehicleServer+'RSET%20compress_logs std_msgs/Bool true',true); 
        xmlhttp[VCurr-1].send();
    }
}

function getClock()
{
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    // add a zero in front of numbers<10
    m=checkTime(m);
    s=checkTime(s);
    return h+":"+m+":"+s;
}

function checkTime(i)
{
    if (i<10)
      {
      i="0" + i;
      }
    return i;
}

// TODO: Save the buttons somewhere
function CheckMousePosition(mouse_position){
    var canvas = document.getElementById("ctrMap");
    var button = 0;
    var buttonWidth = vhbuttons_width;   
    var xoffsetFirstButton = 30;
    var buttonHeight = 20;
    var px = mouse_position[2];
    var py = mouse_position[3];
    // Check Vehicle buttons
    for(var i=0; i<VehiclesData.length; i++){
        if(VehiclesData[i].active){
            button++;
            bt_px = (button-1)*buttonWidth + (button)*10+xoffsetFirstButton;
            bt_wd = (button-1)*buttonWidth + (button)*10+xoffsetFirstButton+buttonWidth;

            bt_py = canvas.height-buttonHeight-10;
            bt_ht = canvas.height-buttonHeight-10+buttonHeight;
            //console.log("px "+px + "py" + py + "bt_px" + bt_px + "bt_py" + bt_py + "bt_wd" + bt_wd + "bt_ht" + bt_ht);
            if(px<bt_wd && px>bt_px  && py<bt_ht && py>bt_py){
                canvas.style.cursor='pointer';
                show_vehicle_info_menu('undefined', i+1)
                over_bt = i;
                return i;
            }else
                canvas.style.cursor='crosshair';
        }
    }
    over_bt = -1;
    return -1;
}

// Print vehicle switch button canvas
var show_vehicle_legend = true;
var vhbuttons_width = 0;
function buildVhButtons(canvas_div)
{
    var canvas = document.getElementById(canvas_div);
    var ctx = canvas.getContext("2d");

    var button = 0;
    var buttonWidth = 60;

    var max_width_bt = 0;
    var xoffsetFirstButton = 30;
    ctx.font = "10pt Calibri,Geneva,Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for(var i=0; i<VehiclesData.length; i++){
        if(VehiclesData[i].active)
        {
            max_width_bt = Math.max(ctx.measureText(VehiclesData[i].name).width+10, max_width_bt);
        }
    }
    buttonWidth = Math.max(buttonWidth, max_width_bt);
    vhbuttons_width = buttonWidth;
    var buttonHeight = 20;
    var selected = VCurr-1;
    for(var i=0; i<VehiclesData.length; i++){
        if(VehiclesData[i].active){
            button++;
            ctx.lineWidth = 2;
            ctx.fillStyle = VehiclesData[i].color;
            if((Date.now()/1000.0-VehiclesData[i].received_var)<=0.5)
                ctx.strokeStyle = color_palette['green'];
            else{
                ctx.strokeStyle = color_palette['red'];
                var tnow = Date.now()/1000.0;
				        if((tnow-VehiclesData[i].received_var)>=30 && (tnow-VehiclesData[i].received_var)<=3600){
                    new_notification('duplicater0', 
                        VehiclesData[i].name+' - '+"shore_console", 
                        "No connection with the vehicle for 30s");
                    VehiclesData[i].received_var = tnow;
                }
            }
            ctx.fillRect((button-1)*buttonWidth + (button)*10 +xoffsetFirstButton, canvas.height-buttonHeight-10,buttonWidth,buttonHeight);
            ctx.strokeRect((button-1)*buttonWidth + (button)*10+xoffsetFirstButton, canvas.height-buttonHeight-10,buttonWidth,buttonHeight);
            ctx.font = "10pt Calibri,Geneva,Arial";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.strokeStyle = color_palette['black'];
            ctx.lineWidth = 1;
            ctx.strokeText(VehiclesData[i].name, (button-1)*buttonWidth + (button)*10 + buttonWidth/2+xoffsetFirstButton, canvas.height-buttonHeight/4-10);

            ctx.strokeStyle = color_palette['white'];
            ctx.lineWidth = 2;
            ctx.strokeRect((button-1)*buttonWidth + (button)*10+xoffsetFirstButton-2, canvas.height-buttonHeight-10-2,buttonWidth+4,buttonHeight+4);
                
            // Selected vehicle
            if(selected==i){

                ctx.strokeStyle = color_palette['white'];
                ctx.lineWidth = 1;
                ctx.strokeRect((button-1)*buttonWidth + (button)*10+xoffsetFirstButton-5, canvas.height-buttonHeight-10-5,buttonWidth+10,buttonHeight+10);

                ctx.strokeStyle = color_palette['indigo'];
                ctx.lineWidth = 2;
                ctx.strokeRect((button-1)*buttonWidth + (button)*10+xoffsetFirstButton-4, canvas.height-buttonHeight-10-4,buttonWidth+8,buttonHeight+8);
            }
        }
    }
    buttonHeight = 15;
    // Show vehicle lengend on left
    if(show_vehicle_legend){
        var num_hidden_vh = 0;
        var max_width_bt = 0;
        ctx.font = "8pt Calibri,Geneva,Arial";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        for(var i=0; i<VehiclesData.length; i++){
            if(!VehiclesData[i].active && VehiclesData[i].display_all){
                num_hidden_vh++;
                max_width_bt = Math.max(ctx.measureText(VehiclesData[i].name).width, max_width_bt);
            }
        }

        // Don't print if there's nothing to display
        if(num_hidden_vh>0){
	        // Background rectangle
	        ctx.globalAlpha = 0.7;
	        ctx.fillStyle = color_palette['white'];
	        ctx.strokeStyle = color_palette['black'];
	        ctx.fillRect( 35-buttonHeight/2-5, 60-buttonHeight/2-5+10, 35+max_width_bt+10, (num_hidden_vh-0.5)*buttonHeight+num_hidden_vh*10+10);
	        ctx.strokeRect( 35-buttonHeight/2-5, 60-buttonHeight/2-5+10, 35+max_width_bt+10, (num_hidden_vh-0.5)*buttonHeight+num_hidden_vh*10+10);
	        ctx.globalAlpha = 1.0;
		}

        var hidden_vh = 0;
        for(var i=0; i<VehiclesData.length; i++){
            if(!VehiclesData[i].active && VehiclesData[i].display_all){
                hidden_vh++;
                
                // Draw circles with vehicle color
                ctx.beginPath();
                ctx.arc(35, hidden_vh*buttonHeight + hidden_vh*10-buttonHeight+50+10, buttonHeight/2, 0, 2 * Math.PI, false);
                ctx.fillStyle = VehiclesData[i].color;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = color_palette['black'];
                ctx.stroke();

                // Draw vehicle name
                ctx.strokeStyle = color_palette['black'];
                ctx.lineWidth = 0.7;
                ctx.strokeText(VehiclesData[i].name, 35+buttonHeight*2/3, hidden_vh*buttonHeight + hidden_vh*10-buttonHeight+50 +10, canvas.height-buttonHeight/4-10);

            }
        }
    }
}

// Build Lateral and Top Ruler
function buildMapGrids(gridPixelSize, color, gap, div, linelength){
    var canvas = document.getElementById(div);
    var ctx = canvas.getContext("2d");
    var step = Math.round(4*gap*10)/10;

    if(step ==0){
        console.log("Step equal zero, don't display grid");
        return;
    }

    //gridPixelSize = Math.max(gridPixelSize,1);
    //gap = 5
    // To have this fixed to 0
    offsetX = -(canvas_xtl-Math.round(canvas_xtl/step)*step)/canvas_pixelstometer;
    offsetY = (canvas_ytl-Math.round(canvas_ytl/step)*step)/canvas_pixelstometer;
    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;
    ctx.setLineDash([ctx.canvas.width/500]);
    ctx.lineDashOffset=0;
    //ctx.setLineDash([step/4*gridPixelSize]);
    //ctx.lineDashOffset=step/4*gridPixelSize;//Math.round(step/6*gridPixelSize);
    // ctx.setLineDash([10, 10]);
    // ctx.lineDashOffset=5;//Math.round(10);
    // horizontal grid lines
    for(var i = 0; i*gridPixelSize+offsetY <= ctx.canvas.height; i=i+step)
    {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = color;
        ctx.setLineDash([ctx.canvas.width/500]);
        ctx.lineDashOffset=0;
        ctx.beginPath();
        //ctx.setLineDash([10]);
        ctx.moveTo(0, i*gridPixelSize+offsetY);
        ctx.lineTo(ctx.canvas.width, i*gridPixelSize+offsetY);
        //ctx.closePath();
        ctx.stroke();

/*        ctx.fillStyle = "rgba(230,230,230, 1.0)";
        ctx.strokeStyle = "#222222";
        ctx.font = "9pt Calibri,Geneva,Arial";
        ctx.setLineDash([0]);
        ctx.textAlign = 'left';
        ctx.lineWidth = 2;
        ctx.strokeText((Math.round(canvas_ytl-(i*gridPixelSize+offsetY)*canvas_pixelstometer)).toFixed(0), linelength*2+4,i*gridPixelSize+offsetY+3);
        ctx.fillText((Math.round(canvas_ytl-(i*gridPixelSize+offsetY)*canvas_pixelstometer)).toFixed(0), linelength*2+4, i*gridPixelSize+offsetY+3);*/
    }
     
    //vertical grid lines
    for(var j = 0; j*gridPixelSize+offsetX <= ctx.canvas.width; j=j+step)
    {
        ctx.lineWidth = 0.5;
        ctx.fillStyle = "rgba(0,0,0, 1.0)";
        ctx.strokeStyle = color;
        ctx.setLineDash([ctx.canvas.width/500]);
        ctx.lineDashOffset=0;
        
        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(j*gridPixelSize+offsetX, 0);
        ctx.lineTo(j*gridPixelSize+offsetX, ctx.canvas.height);
        //ctx.closePath();
        ctx.stroke();

/*        ctx.fillStyle = "rgba(230,230,230, 1.0)";
        ctx.strokeStyle = "#222222";
        ctx.font = "10pt Calibri,Geneva,Arial";
        ctx.setLineDash([0]);
        ctx.textAlign = 'center';
        ctx.lineWidth = 2;
        ctx.strokeText((Math.round(canvas_xtl+(j*gridPixelSize+offsetX)*canvas_pixelstometer)).toFixed(0), j*gridPixelSize+offsetX, linelength*2+8+4);
        ctx.fillText((Math.round(canvas_xtl+(j*gridPixelSize+offsetX)*canvas_pixelstometer)).toFixed(0), j*gridPixelSize+offsetX, linelength*2+8+4);*/
    }

    ctx.restore()
}


// Build Lateral and Top Ruler
function buildGrids(gridPixelSize, color, gap, div, linelength)
{
    var canvas = document.getElementById(div);
    var ctx = canvas.getContext("2d");
    
    var step = gap/5;
    if(Math.round((step)*10)/10 ==0){
        console.log("Step equal zero, don't display grid");
        return;
    }
    //gridPixelSize = Math.max(gridPixelSize,1);
    //gap = Math.max(gap,5);
    //gap = Math.ceil = gap;
    //gap = 5
    var off =  Math.round(4*gap*10)/10;
    offsetX = Math.round(-(canvas_xtl-Math.round(canvas_xtl/off)*off)/canvas_pixelstometer);
    offsetY = Math.round((canvas_ytl-Math.round(canvas_ytl/off)*off)/canvas_pixelstometer);
    // Draw Transparent Rectangles
    //while(offsetY<0) offsetY +=gap*2
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;
    ctx.setLineDash([0,0]);

    // Horizontal
    ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
    ctx.fillRect(0, 0, canvas.width, linelength*2);
    // Vertical
    ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
    ctx.fillRect(0, linelength*2, linelength*2, canvas.height);
    // horizontal grid lines
    ctx.fillStyle = "rgba(210,210,210, 1.0)";
    for(var i = 0; i*gridPixelSize+offsetY <= canvas.height; i=Math.round((i+step)*10)/10)
    {
      if(i*gridPixelSize+offsetY < 0 ) continue;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(0, i*gridPixelSize+offsetY);
        if((i) % (2*2*gap) == 0){
            ctx.font = "9pt Calibri,Geneva,Arial";
            ctx.textAlign = 'left';
            ctx.lineWidth = 2;
            ctx.strokeText((canvas_ytl-(i*gridPixelSize+offsetY)*canvas_pixelstometer).toFixed(0), linelength*2+4, i*gridPixelSize+offsetY+4);
            ctx.fillText((canvas_ytl-(i*gridPixelSize+offsetY)*canvas_pixelstometer).toFixed(0), linelength*2+4, i*gridPixelSize+offsetY+4);
        }
        if(i % (2*gap) == 0) {
            ctx.lineTo(linelength*2, i*gridPixelSize+offsetY);// Strong lines Big
            ctx.lineWidth = 2;
        }else if(i % gap == 0) {
            ctx.lineTo(linelength, i*gridPixelSize+offsetY); // Strong lines small
            ctx.lineWidth = 2;
        } else {
            ctx.lineTo(linelength, i*gridPixelSize+offsetY);
            ctx.lineWidth = 0.5;
        }
        ctx.closePath();
        ctx.stroke();
    }
     
    // vertical grid lines
    for(var j = 0; j*gridPixelSize+offsetX <= canvas.width; j=Math.round((j+step)*10)/10)
    {
      if(j*gridPixelSize+offsetY < 0 ) continue;
        ctx.beginPath();
        ctx.moveTo(j*gridPixelSize+offsetX, 0);
        if((j) % (2*2*gap) == 0){
            ctx.font = "9pt Calibri,Geneva,Arial";
            ctx.textAlign = 'center';
            ctx.lineWidth = 2;
            ctx.strokeText((canvas_xtl+(j*gridPixelSize+offsetX)*canvas_pixelstometer).toFixed(0), j*gridPixelSize+offsetX, linelength*2+8+4);
            ctx.fillText((canvas_xtl+(j*gridPixelSize+offsetX)*canvas_pixelstometer).toFixed(0), j*gridPixelSize+offsetX, linelength*2+8+4);
        }
        if(j % (2*gap) == 0) {
            ctx.lineTo(j*gridPixelSize+offsetX, linelength*2);// Strong lines Big
            ctx.lineWidth = 2;
        }else if(j % gap == 0) {
            ctx.lineTo(j*gridPixelSize+offsetX, linelength); // Strong lines small
            ctx.lineWidth = 2;
        } else {
            ctx.lineTo(j*gridPixelSize+offsetX, linelength);
            ctx.lineWidth = 0.5;
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Draw scale in the bottom right corner
    var offset_w = 12;
    var offset_h = offset_w+10;
    // Horizontal
    ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
    ctx.strokeStyle = color_palette['black'];
    ctx.lineWidth = 1;
    ctx.fillRect(canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w-4, canvas.height-(linelength*2)-offset_h-4,(2*Math.round(gap*gridPixelSize))+8, (linelength*2)+18);
    ctx.strokeRect(canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w-4, canvas.height-(linelength*2)-offset_h-4,(2*Math.round(gap*gridPixelSize))+8, (linelength*2)+18);
    // Horizontal Line
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h);
    ctx.lineTo(canvas.width-offset_w, canvas.height-offset_h);
    ctx.closePath();
    ctx.stroke();
    // Vertical Grid scale
    for(var j = 0; j<= 2*gap; j=Math.round((j+step)*10)/10)
    {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h);
        if(j % (2*gap) == 0) {
            ctx.lineTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h-linelength*2);
            ctx.lineWidth = 2;
        }else if(j % gap == 0) {
            ctx.lineTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h-linelength);
            ctx.lineWidth = 1;
            ctx.font = "8pt Calibri,Geneva,Arial";
            ctx.textAlign = 'center';
            ctx.strokeText((gap*2)+"m", j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h+10);
        } else {
            ctx.lineTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h-linelength);
            ctx.lineWidth = 0.5;
        }
        ctx.closePath();
        ctx.stroke();
    }
    var imgCompass = document.getElementById("imgCompass");
    ctx.drawImage(imgCompass,canvas.width-130,20,125,125);
          
}

// Span Drag Start
function dragVehicle(target, e) {
    if(!e.shiftKey){
        e.preventDefault();
        return false;
    }
    if (e.dataTransfer) {
        e.dataTransfer.setData('SpanImg', target.id);
        chVeiculo(target);
    }
}
// Span Drag End (Vehicle WayPoint)
function dropVehicle(target, e) {
    var id = e.dataTransfer.getData('SpanImg');
    if(id.substring(0, id.length-1) != "sp"){
        e.preventDefault();
        return;
    }    

    Point = true;
    WayPoint = true;
    btWayPoint(target, e);
    e.preventDefault();
}

/**
 * Estimates position from acoustic ranges, and GPS data from leaders.
 * xp = 1 sf = 1 :2 at front, 3 at back, follower at right
 *
 * FRONT
 *
 *    2
 *     Follower
 *    3
 *
 * sf changes 2 with 3
 * xp changes follower from left to right
 * 
 * @param  {double} x2 x position vehicle2
 * @param  {double} y2 y position vehicle2
 * @param  {double} x3 x position vehicle3
 * @param  {double} y3 y position vehicle3
 * @param  {double} z2 range to vehicle2
 * @param  {double} z3 range to vehicle3
 * @param  {int} xp see above
 * @param  {int} sf see above
 * @return {Array}    [x,y] of the vehicle1
 */
function acoustic_position(x2,y2,x3,y3,z2,z3,xp,sf){
    var conversion=1500/2000000;
    z2*=conversion;
    z3*=conversion;
    var rot = Math.atan2(sf*(y3-y2),sf*(x3-x2))-Math.PI/2;
    var R = [[Math.cos(rot),-Math.sin(rot)],[Math.sin(rot),Math.cos(rot)]];
    var R11=R[0][0], R12=R[0][1];
    var R21=R[1][0], R22=R[1][1];
    var b=bilateration(hypot(y3-y2,x3-x2),z2,z3,sf,xp);
    var b0=b[0], b1=b[1];
    p0= (x3+x2)/2 + (R11*b0 + R12*b1);
    p1= (y3+y2)/2 + (R21*b0 + R22*b1);
    return [p0,p1];
    //GPS_X[1]=491912; GPS_Y[1]=4290847; GPS_X[2]=491927; GPS_Y[2]=4290847;
}

function bilateration(d,d2,d3,sf,xp){
    var tt=Math.acos(Math.max(Math.min((Math.pow(d2,2)+Math.pow(d,2)-Math.pow(d3,2))/(2*d*d2),1),-1));
    var p0=-d2*Math.sin(tt)-0,p1=d2*Math.cos(tt)-d/2;
    p0*=xp;
    p1*=sf;
    return [p0,p1];
}

/*
 * update_list
 * This function keeps adding items to it if they are new, in order to count the number of different items 
 */ 
function update_list(list,item){
    if(!in_list(list,item)){
        list.push(item);
    }
    list.sort();
}

/*
 * in_list
 * Check if a item is in a list
 */
function in_list(list,item){
    if(list.indexOf(item) > -1){
        return true;
    }else{
        return false;
    }
}

function onclick_vehicle(obj){
    chVeiculo(parseInt(obj.id.replace('sp','')));
}

Array.prototype.clone = function() {
	return this.slice(0);
};

function create_spans(id, active=true){
    var div_elem=document.getElementById('div_vehicle_icons');
    var span_vehic=document.createElement('span');
    span_vehic.setAttribute('class','overimage');
    span_vehic.setAttribute('id','sp'+(id+1));
    span_vehic.setAttribute('draggable','true');
    span_vehic.setAttribute('onmouseover','show_vehicle_info_menu(this,-1);');
    span_vehic.setAttribute('onmousemove','MouseMoveCanvas(event, this);');
    span_vehic.setAttribute('onmouseup','MouseUpCanvas(event, this);');
    span_vehic.setAttribute('onmousedown','MouseDown(event, this);');
    span_vehic.setAttribute('ondragstart','dragVehicle(this, event);');
    span_vehic.setAttribute('onclick','onclick_vehicle(this);');
    if(active)
    	span_vehic.setAttribute('style','background:url('+VehiclesData[id].img_path+'); background-repeat: no-repeat; background-position:center; background-size: initial; z-index: 19;');
    else
    	span_vehic.setAttribute('style','background:url('+VehiclesData[id].img_path+'); background-repeat: no-repeat; background-position:center; background-size: initial; z-index: 18;');
    div_elem.appendChild(span_vehic);

    //span#sp1 {background:url(images/AUVm.png); background-repeat: no-repeat; display:block; cursor:pointer;}
 /*<span id="sp1" class="overimage" draggable="true" ondragstart="dragVehicle(this, event)" onclick="onclick_vehicle(this);"></span>   */
}

function update_spans(){
    //console.log("updating spans");
    var div_elem=document.getElementById('div_vehicle_icons');
    
    // Remove all spans
    while (div_elem.firstChild) {
        div_elem.removeChild(div_elem.firstChild);
    }
    //var children= div_elem.children;

    for(var i=0; i<VehiclesData.length; i++){
        /*if(i<children.length){
            //children[i].style.background='url('+VehiclesData[i].img_path+") no-repeat";
            children[i].setAttribute('style','background:url('+VehiclesData[i].img_path+'); background-repeat: no-repeat; background-position:center; background-size: contain; display:block; cursor:pointer; width: 25px; top: 0px; left: 0px;')
        }else{*/
        create_spans(i, VehiclesData[i].active);
        //}
    }
}

function copy_wp(){
    var objx=document.getElementById('txtXD');
    var objy=document.getElementById('txtYD');
    window.prompt("Copy to clipboard: Ctrl+C, Enter", parseFloat(objx.value).toFixed(2)+ " " +parseFloat(objy.value).toFixed(2));
}

function update_display_flags(){
	display_flags = JSON.parse(localStorage.display_flags);
	for (var key in display_flags) {
	  askVAR(key, display_flags[key]);
	}
}

function add_elem(vector, var_name){
	if(vector.indexOf(var_name)!=-1) return;
	vector.push(var_name);
}

function del_elem(vector, var_name){
	if(vector.indexOf(var_name)==-1) return;
	vector.splice(vector.indexOf(var_name),1);
}

function setLocalStorage(object){
    for(var i in object){
        localStorage[i]=object[i];
    }
}

// ERROR LIST PAGE
var errorlistWindow = undefined;
function openErrorListWindow() {
    if(!errorlistWindow || errorlistWindow.closed)
        errorlistWindow=window.open("", "Error_List");//, "width=300, height=300");
        
    errorlistWindow.focus();

    writeErrorListWindow();
}

function writeErrorListWindow() {
    if(!errorlistWindow || errorlistWindow.closed)
        return;
       
    errorlistWindow.document.body.innerHTML ="";
    for(var i=error_list.length-1; i>=0; i--){
        //errorlistWindow.document.write(error_list[i].time + "   [" + error_list[i].vehicle + "] " + error_list[i].node + " - "+ error_list[i].msg + "<br>");
        errorTime = new Date(1000* error_list[i].time_rcv);
        errorlistWindow.document.body.innerHTML += errorTime.getHours()+":"+errorTime.getMinutes()+":"+errorTime.getSeconds() + "  [" + error_list[i].vehicle + "] " + error_list[i].node + ": "+ error_list[i].msg + "<br>";
    }
}

function addErrorToList(obj) {
    if(error_list.length>100)// Limitting the number of saved errors
       error_list.shift();
                        
    var found = false
    for(var i=0; i<error_list.length; i++)
        if(error_list[i].time_rcv == obj.time_rcv && error_list[i].vehicle==obj.vehicle && error_list[i].node==obj.node){
            found=true;
            break;
        }
    if(!found){
        error_list.push(obj);
        error_list.sort(function(a,b) {
            return (a.time_rcv - b.time_rcv);
        });
        writeErrorListWindow();
    }
}

function points_save_to_file(){
  // No Points to download
  if(DPoints_green.length==0)
    return;

  A=document.createElement('a');
  // Compute Lat Long
  var utm = "+proj=utm +zone="+Scenarios[Scenario-1].utm_zone;
  var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
  
  var str = "# POINT X Y Lat Lon\n# Latitude and Longitude are not used for importing\n"
  for(var p=0; p<DPoints_green.length;p++)
  {
    lat_lon = proj4(utm, wgs84, [DPoints_green[p].x.toFixed(3), DPoints_green[p].y.toFixed(3)]);
    str = str + "POINT " + DPoints_green[p].x.toFixed(3) + " " + DPoints_green[p].y.toFixed(3) + " " + lat_lon[1].toFixed(7) + " " + lat_lon[0].toFixed(7) + "\n";
  }
  txt = openFile(str, 'text/plain');
  A.href = txt;
  var temp = new Date();
  var dateStr = padStrD(temp.getFullYear()) +
                 padStrD(1 + temp.getMonth()) +
                 padStrD(temp.getDate()) + "_" +
                 padStrD(temp.getHours()) +
                 padStrD(temp.getMinutes())

  A.download ="POINTS_"+dateStr+".ptxt";
  A.click();
}
