var DPoint_active=[];
var dragok=false;
var num_vehicles=3;
var formation_coord=new Array(num_vehicles);
var Move_Single_Flag =false, Show_Points_ID_Flag=false, Move_to_Specific_Flag=false;
var Custom_Mission_Flag=false;
var flags_show_vehicles=[];
function canvas_onmousemove_simple(event){
	var canvas = document.getElementById('ctrMap');
	canvas.style.cursor='crosshair';
	ChangePosLabel(canvas);
}

function canvas_onmousemove_move(event){
	var canvas = document.getElementById('ctrMap');
	canvas.style.cursor='crosshair';
	ChangePosLabel(canvas);
	myMove(event);
}

function myMove(e){
	if (dragok){
		if(Custom_Mission_Flag===true){
			toggle_point_button(document.all.custom_mission);
		}
		var canvas = document.getElementById('ctrMap');
		var mouse_canvas_pos=getMousePosCanvas(canvas,event);
		var dx=mouse_canvas_pos[0]-DPoint_active.x;
		var dy=mouse_canvas_pos[1]-DPoint_active.y;
		MoveMission(DPoint_active.index_to_display,DPoint_active.ind_seg,DPoint_active.ind_pt,dx,dy,0);
		DPoint_active.x=mouse_canvas_pos[0];
		DPoint_active.y=mouse_canvas_pos[1];
		update_displayed_mission();
	}
}

/*
 * index_to_display: index that display in mission index of mission.mission
 * flag_absolute = 0 for relative moves
 * flag_absolute = 1 for absolute moves
 */
//function MoveMission(index_to_display,index,flag_FinalPoint,dx,dy,flag_absolute){
function MoveMission(index_to_display,index_seg,index_pt,dx,dy,flag_absolute){
//document.all.toggleMoveAll.checked
	if(!Move_Single_Flag){ //Move the entire mission
		if(!flag_absolute){ // move with mouse
			mission.xrefpoint+=dx;
			mission.yrefpoint+=dy;
		}else{ // move to specific
			var aux_pts=mission.mission[index_seg].getPoints();
			var aux_pt=aux_pts[index_pt];
			mission.xrefpoint+=Scenarios[Scenario-1].refpoint[0]+dx-mission.xrefpoint-aux_pt[0];
			mission.yrefpoint+=Scenarios[Scenario-1].refpoint[1]+dy-mission.yrefpoint-aux_pt[1];
		}
	}else{
		if(!flag_absolute){ // move with mouse
			IncSegmentPoint(index_seg,index_pt,dx,dy,true);
		}else{ // move to specific
			var aux_pts=mission.mission[index_seg].getPoints();
			var aux_pt=aux_pts[index_pt];
			var displacement_x=Scenarios[Scenario-1].refpoint[0]+dx-mission.xrefpoint-aux_pt[0];
			var displacement_y=Scenarios[Scenario-1].refpoint[1]+dy-mission.yrefpoint-aux_pt[1];
			IncSegmentPoint(index_seg, index_pt, displacement_x, displacement_y);
		}
		UpdateCurveParameters(index_seg);
	}
}

function myDown(event){
	var canvas = document.getElementById('ctrMap');
	var mouse_canvas_pos=getMousePosCanvas(canvas,event);
	if(!dragok){
		var near_pt=find_near_points(mouse_canvas_pos,canvas,event);
	}
	if(!near_pt){ //near_pt is empty (if there's more than 1 point and the user presses "escape" or cancel
		myUp();
		return;
	}
	dragok = true;
	canvas.onmousemove=canvas_onmousemove_move;
	DPoint_active=near_pt;
}

function myUp(event){
	document.getElementById('ctrMap').onmousemove=canvas_onmousemove_simple;
	DPoint_active=[];
	dragok = false;
}

function canvas_click_function(event){
	if(Custom_Mission_Flag){
		var canvas = document.getElementById('ctrMap');
		btWayPoint_mod(canvas, event);
	}else{
		if(ZoomIn){ //correctly update the pos label (X= xx, Y= yy)
			btZoomIn(canvas, event);
		}
	}
}

function compute_statistics(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	var dist=0;
	var total_distance=0;
	var total_time=0;
	var data=[];
	var vehicle=0, vehicle_old=0;
    for(var i=0;i<mission_length(mission_to_work_on);i++){
    	seg=mission_to_work_on[i];
    	vehicle=seg.getVehicle();
    	if(vehicle!=vehicle_old && vehicle_old!=0){
    		data.push({distance: total_distance, time: total_time, vehicle: vehicle_old});
    		total_distance=0;
    		total_time=0;
    	}
		dist=seg.length();
		total_distance+=dist;
		total_time+=dist/seg.value[seg.dictionary.veloc];
		vehicle_old=vehicle;
	}
	if(vehicle_old!=0){
		data.push({distance: total_distance, time: total_time, vehicle: vehicle_old});
		total_distance=0;
		total_time=0;
	}
	var display_string="";
	for(var i=0; i<data.length; i++){
		display_string+="vehicle "+data[i].vehicle+":\n";
		display_string+="\tdistance: "+data[i].distance.toFixed(1)+"m\n";
		display_string+="\ttime: "+(data[i].time/60).toFixed(1)+"min\n";
	}
	//alert(display_string);
	return display_string;
	//alert("total_distance: "+Math.round(total_distance)+ ' m\n total_time: '+Math.round(total_time/60)+' min' +'\n invalid for multiple vehicles!!');
	//document.all.txt_vars.textContent = "total_distance: "+Math.round(total_distance)+ ' m\n'+"total_time: "+Math.round(total_time/60)+' min\n';
}

function find_near_points(mission_input, canvas_pos,that,event){
	var mission_to_work_on = mission_input.mission;
	var distance_threshold=3, vehicle=0, vehicle_old=0, index_to_display=0, near_points=[], pts,seg;
	if(mission_length(mission_to_work_on)<=0){
		return undefined;
	}
	
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		seg=mission_to_work_on[i];
		vehicle=seg.getVehicle(); // TODO: do this in a more generic way not to copy code (here and show_points_id)
		if(!check_disp_vehicle(vehicle)){
			continue;
		}
		pts=seg.getPoints();
		for(var j=0; j<pts.length; j++){
			if(j==0 && vehicle==vehicle_old){ // initial point of a segment is the same as the last point of previous segment
				continue;
			}
			//if(j!=0 && j!=(pts.length-1)) continue; // not initial or final point of the segment
			//var aux_pt=getCanvasPos_meter(pts[j], false);
			var aux_pt=[pts[j][0]+mission_input.xrefpoint, pts[j][1]+mission_input.yrefpoint];
			if( compute_eucl_dist(aux_pt,canvas_pos) < distance_threshold){
				near_points.push({x: aux_pt[0], y: aux_pt[1],index_to_display: index_to_display,ind_seg: i,ind_pt: j});
			}
			index_to_display++;
		}
		vehicle_old=vehicle;
	}
	if(near_points.length<1){
		return undefined;
	}

	return near_points;
	/*if(near_points.length>1){ //solve the conflict
		var temp_str="";
		for(var i=0;i<near_points.length;i++){
			temp_str+=near_points[i].index_to_display+", ";
		}
		temp_str=temp_str.substring(0, temp_str.length - 2)+"}"; //cut last ", "
		var flag_invalid=true;
		while(flag_invalid){
			var str=prompt("Warning: two or more very close points please select which of them you want\n{"+temp_str,""+near_points[0].index_to_display);
			if(str===null){
				DPoint_active=[];
				return;
			}
			var index=parseInt(str);//fazer check aqui!
			for(var i=0;i<near_points.length;i++){
				if(index==near_points[i].index_to_display){
					flag_invalid=false;
					return near_points[i];
				}
			}
		}
	}else{
		return near_points[0];
	}*/
}

function init_flags_show_vehicles(){
	for(var i=0;i<num_vehicles+1;i++){ //num_vehicles +1 because of nominal
		flags_show_vehicles.push(true);
	}
}

function check_disp_vehicle(vehicle){
	if(vehicle==-1){
		vehicle=0;
	}
	return flags_show_vehicles[vehicle];
}

function toggle_disp_vehicle(vehicle,show_flag){
	var show_flag = typeof show_flag != 'undefined' ? show_flag : false;
	if(vehicle===-1){
		vehicle=0;
	}
	var elemt=document.getElementById("Disp_V"+vehicle);
	if(show_flag){
		flags_show_vehicles[vehicle]=true;
		elemt.checked=true;
	}else{
		flags_show_vehicles[vehicle]=false;
		elemt.checked=false;
	}
}

function toggle_point_button(that){
	if(that.value==='Begin Mission'){
		that.value='End Mission'; that.style.color='red'; that.style.fontWeight='bold';
		Custom_Mission_Flag=true;
	}else{
		that.value='Begin Mission'; that.style.color='black'; that.style.fontWeight='normal';
		Custom_Mission_Flag=false;
		DPoints=[];
	}
}

function Disp_Vehicle(that){
	for(var i=0;i<(num_vehicles+1);i++){
		if(that.id===("Disp_V"+i)){
			flags_show_vehicles[i]=!flags_show_vehicles[i];
			break;
		}
	}
}

function ApplyMovingSpecific(obj){
	Move_to_Specific_Flag=true;
	Toggle_DropDown_Menu('Move_to_Specific');
	var index=parseInt(document.all.PointID_Moving.value);
	if(index===-1){
		alert('invalid index (-1)');
		return;
	}
	var xx=parseFloat(document.all.Xwanted.value);
	var yy=parseFloat(document.all.Ywanted.value);
	alert('warning define index conversion');
	var index_to_display=index;
	var index_seg=index;
	var index_pt=0;
	MoveMission(index_to_display,index_seg,index_pt,xx,yy,true); //TODO: index conversion index to display to (i,j) (segment id and #pt inside segment)
}

if(typeof(String.prototype.strip) === "undefined"){
    String.prototype.strip = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

function Toggle_DropDown_Menu(opt){
	if(opt=='Move_Single_Flag'){
		if (Move_Single_Flag){
			Move_Single_Flag=false;
			ddCheck('',0,'34',1);
		}else{
			Move_Single_Flag=true;
			ddCheck('34',1,'',0);
		}
	}else if(opt=='Move_to_Specific'){
			if (Move_to_Specific_Flag){
				Move_to_Specific_Flag=false;
				/*div_MoveSpecific.style.visibility="hidden";
				div_MoveSpecific.style.height="0px";*/
				toggle_div_visibility(div_MoveSpecific,true);
				ddCheck('',0,'35',1);
			}else{
				Move_to_Specific_Flag=true;
				/*div_MoveSpecific.style.visibility="visible";
				div_MoveSpecific.style.height="";*/
				toggle_div_visibility(div_MoveSpecific);
				ddCheck('35',1,'',0);
			}
	}else if(opt=='Show_Points_ID'){ 
			if (Show_Points_ID_Flag){
				Show_Points_ID_Flag=false;
				ddCheck('',0,'36',1);
			}else{
				Show_Points_ID_Flag=true;
				ddCheck('36',1,'',0);
			}
			update_displayed_mission();
	}else if(opt=='Rigid_Formation'){
			if (mission.Rigid_Formation_Flag){
				mission.Rigid_Formation_Flag=false;
				ddCheck('',0,'37',1);
				toggle_div_visibility(div_frmVehicle);
			}else{
				mission.Rigid_Formation_Flag=true;
				ddCheck('37',1,'',0);
				toggle_div_visibility(div_frmVehicle,true);
				document.forms['frmVehicle'].elements[3].checked=true; //nominal
			}
	}else if(opt=='Rotate_Mission'){
			if(div_RotateMission.style.visibility=="hidden"){
				toggle_div_visibility(div_RotateMission);
				ddCheck('',0,'38',1);
			}else{
				toggle_div_visibility(div_RotateMission);
				ddCheck('38',1,'',0);
			}
	}/*else if(opt=='RAW'){
			if (RAW){
				RAW=false;
				STRINGS.splice(STRINGS.indexOf("IMU_RAW"),1); STRINGS.splice(STRINGS.indexOf("GPS_RAW"),1); STRINGS.splice(STRINGS.indexOf("Thrusters_RAW"),1); STRINGS.splice(STRINGS.indexOf("Modem_RAW"),1);
				ddCheck('',0,'22',-1);				
			}else{
				RAW=true;
				STRINGS.push("IMU_RAW"); STRINGS.push("GPS_RAW");STRINGS.push("Thrusters_RAW"); STRINGS.push("Modem_RAW");
				ddCheck('22',-1,'',0);
			}
	}*/

	//localStorage['VARS']=JSON.stringify(VARS);
}

/* Convert from point in [absolute/relative] depending on global [true/false] to point in pixels  */
function getCanvasPos_pixel(point, global, mission_input){

  mission_input = typeof mission_input !== 'undefined' ? mission_input : mission;

	if(global===true){
		point[0] = point[0]-canvas_xtl;
		point[1] = point[1]-canvas_ytl;
	}else{
		point[0] = point[0]+mission_input.xrefpoint-canvas_xtl;
		point[1] = point[1]+mission_input.yrefpoint-canvas_ytl;
	}

	x = point[0]/canvas_pixelstometer;
	y = -point[1]/canvas_pixelstometer;
	return [x,y];
	
}

/* */ 
function getCanvasPos_meter(point, global){
		x = point[0]*canvas_pixelstometer;
    y = -point[1]*canvas_pixelstometer;
    if(global){
    	x += canvas_xtl;
    	y += canvas_ytl;
    }
	return [x,y];
}

function GetColor(index){
	if(typeof get_mission_mission()=== "undefined"  || mission_len()===0){
		return 'orange';
	}
	switch (mission.mission[index].getVehicle()){
		case 1:
			x='red';
			break;
		case 2:
			x='white';
			break;
		case 3:
			x='yellow';
			break;
		default:
			x='orange';
			break;
	}
	return x;
}

function btWayPoint_mod(obj, event){

	if(!Custom_Mission_Flag)
		return;

	var posx = posy = 0;
	var e=window.event || event;

	if (e.pageX || e.pageY){
		posx = e.pageX;
		posy = e.pageY;
	}else if (e.clientX || e.clientY){
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop 	+ document.documentElement.scrollTop;
	}

	var posObj = findPos(obj);
	var heightIUTM = Scenarios[Scenario-1].height;
	var widthIUTM = Scenarios[Scenario-1].width;
	var heightI=document.all.ctrMap.height; var widthI=document.all.ctrMap.width;

	var x = widthIUTM*((posx-posObj[0]))/widthI;
	var y = heightIUTM*(heightI-(posy-posObj[1]))/heightI;

	if(ZoomedIn){
		xn=widthIUTM*xiant/imgScen.width;
		yn=heightIUTM*(imgScen.height-yiant)/imgScen.height-heightIUTM*syant;
		heightIUTM = heightIUTM*syant;
		widthIUTM = widthIUTM *sxant;
		x = xn + widthIUTM*(posx-posObj[0])/widthI;
		y = yn + heightIUTM*(heightI-(posy-posObj[1]))/heightI;	
	}
	DPoints.push({'x':x+Scenarios[Scenario-1].refpoint[0],'y':y+Scenarios[Scenario-1].refpoint[1]});
	circles(x+Scenarios[Scenario-1].refpoint[0],y+Scenarios[Scenario-1].refpoint[1],"#FFFF00",false,'red');
	Generate_Mission();
}

function get_vehicle_id_radio(){
	var vehicle_id=-1;
	for(var j=0;j<4;j++){
		if(document.forms['frmVehicle'].elements[j].checked){
			vehicle_id = j+1;
			if(vehicle_id==4){
				vehicle_id=-1;
			}
			return vehicle_id;
		}
	}
	return vehicle_id;
}

function add_to_table(table_name,point_id,val){
	row=table_name.insertRow(table_name.rows.length-1);
	row.label="pt";
	c1=row.insertCell(0);
	c1.innerHTML = point_id.toString() +"-"+(point_id+1).toString();
	c2=row.insertCell(1);
	c2.innerHTML="<input id='p"+point_id.toString()+"' type='text' size='3' value='"+val+"'>";
}

function clear_table(table_name){
	var len_rows=table_name.rows.length;
	for(var i=0;i<len_rows;i++){
		index=len_rows-i-1;
		row=table_name.rows[index];
		if(row.label==="pt")
			table_name.deleteRow(index);
	}
}

function ShowEditSegmentsTable(div_name,table_name,function_name){
	if(div_name.style.visibility==="visible"){
		toggle_div_visibility(div_name,true);
		clear_table(table_name);
		return;
	}
	toggle_div_visibility(div_name);
	
	clear_table(table_name);
	var mission_changing=mission.mission;
	var num_pts_total=mission_length(mission_changing)+1, seg;
	for(var i=0, index_to_display=0;i<num_pts_total-1;i++,index_to_display++){
		seg=mission_changing[i];
		if(i>0 && seg.getVehicle() != mission_changing[i-1].getVehicle()){
			index_to_display++;
		}
		add_to_table(table_name,index_to_display,function_name(i));
	}
}

function ApplyEditSegments(div_name,table_name){
	var num_seg=table_name.rows.length-1; //last row is apply button
	var parameter= new Array(num_seg);
	for(var i=0;i<num_seg;i++){
		parameter[i]=parseFloat(table_name.rows[i].children[1].children[0].value);
	}
	ShowEditSegmentsTable(div_name,table_name); //to hide the table
	if(table_name.id==='table_EditSegmentsType'){ //Type
		Generate_Mission({new_segments_type:parameter});
		return;
	}
	if(table_name.id==='table_EditSegmentsVel'){ //Veloc
		Generate_Mission({new_segments_velocity:parameter});
		return;
	}
}

function toggle_div_visibility(that, off_flag){
	if(that.style.visibility ==='visible' || off_flag){
		that.style.visibility="hidden";
		that.style.height="0px";
	}else{
		that.style.visibility="visible";
		that.style.height="";
	}
}

function get_formation_coord_user(){
	var f_coord= new Array(num_vehicles);
	mission.formation=[];
	for(var i=0;i<table_formation.rows.length-1;i++){
		f_coord[i]=new Array(2);
		f_coord[i][0]=parseFloat(table_formation.rows[i].children[1].children[0].value);
		f_coord[i][1]=parseFloat(table_formation.rows[i].children[1].children[1].value);
		if(isNaN(f_coord[i][0]*f_coord[i][1])) continue;
		mission.formation.push(i+1,f_coord[i][0],f_coord[i][1]);
	}
	if(div_formation.style.visibility ==='visible'){
		toggle_div_visibility(div_formation);
	}
	return f_coord;
}

function update_displayed_mission(){
	if(mission.Rigid_Formation_Flag){
		Define_Formation(0,0);
	}
	/*var canvas = document.getElementById('ctrMap'); var ctf = canvas.getContext('2d');
	ctf.clearRect(0, 0, canvas.width, canvas.height);*/
	//Plot_Mission('ctrMap',1);
}

function ClearMission(){
	set_mission_mission([]);
	DPoints=[];
	update_displayed_mission();
}

function chVeiculo_alt(obj, force){
	force = typeof force !== 'undefined' ? force : false;
	
//	var radio = document.getElementById(VCurr);
//	var v_old = VCurr;	
	aux = parseInt(obj.id.charAt(obj.id.length-1));
	if (!aux || aux>4 || aux<0 || (aux==VCurr && !force )){
		return;
	}
	VCurr = aux;
}

function Init_mp(){
	//document.all.map_img.draggable=false;
	document.getElementById('map_img').draggable=false;
	Scenario =7;
	programming_ui=true;
	Toggle_DropDown_Menu('Rigid_Formation');
	Move_to_Specific_Flag=true;
	Toggle_DropDown_Menu('Move_to_Specific');
	// setInterval("draw(-1,-1,-1,-1);",1000);
	//setInterval("update_displayed_mission();",1000);
	
	if(localStorage.ScnID)
		chScen(localStorage.ScnID, localStorage.ScnUN);
	else
		chScen('11', 1);	
	//draw(-2,-2,-2,-2);
	init_flags_show_vehicles();
	update_displayed_mission();
}

function get_mission_bias_user(){
	var f_coord= new Array(num_vehicles);
	mission_bias=[];
	for(var i=0;i<table_same_mission_biased.rows.length-1;i++){
		aux_bias=parseFloat(table_same_mission_biased.rows[i].children[1].children[0].value);
		if(isNaN(aux_bias)) continue;
		mission_bias(i+1,aux_bias);
	}
	if(div_formation.style.visibility ==='visible'){
		toggle_div_visibility(div_formation);
	}
	return f_coord;
}

function Lawn_Mower_user_input(){
	var leg_length=parseFloat(lm_leg_len.value);
	var leg_dist=parseFloat(lm_leg_dist.value);
	var num_legs=parseInt(lm_num_len.value);
	var angle=parseFloat(lm_angle.value);
	var k=parseInt(lm_k.value);
	if(isNaN(leg_length)){
		alert("error, invalid parameter leg_length");
	}
	if(isNaN(leg_dist)){
		alert("error, invalid parameter leg_dist");
	}
	if(isNaN(num_legs)){
		alert("error, invalid parameter num_legs");
	}
	if(isNaN(angle)){
		alert("error, invalid parameter angle");
	}
	if(isNaN(k)){
		alert("error, invalid parameter k");
	}
	
	if(leg_length<=0){
		alert('leg_length<=0\nPlease try again');
		return;
	}
	if( leg_dist<=0 ){
		alert('leg_dist<=0\nPlease try again');
		return;
	}
	if( num_legs<=0 || (num_legs%1)!=0){
		alert('num_legs<=0 or not integer\nPlease try again');
		return;
	}
	if( k!=1 && k!=-1){
		alert('k must be -1 or 1\nPlease try again');
		return;
	}
	toggle_div_visibility(div_lawn_mower);
	return [leg_length,leg_dist,num_legs,angle,k];
}

function Same_Mission_Biased_user_input(){
	var x1=parseFloat(smb_x1.value);
	var x2=parseFloat(smb_x2.value);
	var x3=parseFloat(smb_x3.value);
	var biases=[];
	
	if(!isNaN(x1)){
		biases.push(1,x1);
	}
	if(!isNaN(x2)){
		biases.push(2,x2);
	}
	if(!isNaN(x3)){
		biases.push(3,x3);
	}
	toggle_div_visibility(div_same_mission_biased);
	return biases;
}

//function center_map(limit){
	//limit=300;
	/*(Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width)=limit;
	Scenarios[Scenario-1].refpoint[1]=-limit;
	Scenarios[Scenario-1].refpoint[0]=-limit;
	(Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height)=limit;*/
	
// 	width=(Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width)-Scenarios[Scenario-1].refpoint[0];
// 	height=(Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height)-Scenarios[Scenario-1].refpoint[1];
	
// 	Scenarios[Scenario-1].refpoint[1]=-height/2;
// 	(Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height)=-height/2;
// 	(Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width)=width/2;
// 	Scenarios[Scenario-1].refpoint[0]=-width/2;
// }

function back_forth_user_input(){
	var leg_length=parseFloat(bf_ll.value);
	var radius=parseFloat(bf_r.value);
	var number_legs=parseFloat(bf_nl.value);
	// update_displayed_mission();
	toggle_div_visibility(div_back_forth);
	return [leg_length, radius,number_legs];
}

function ApplyRotateMission(){ //TODO: rotate mission for separate vehicles
	var angle=parseFloat(RotateMission_ang_deg.value);
	rotateMission(mission.mission,-angle);
	toggle_div_visibility(div_RotateMission);
}
