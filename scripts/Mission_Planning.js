/*
 *  Mission_Planning.js
 *  console
 *
 *  Created by Miguel Ribeiro 
 *  And Jorge Ribeiro on Apr 07, 2014.
 *  Copyright 2014 DSOR/ISR/IST. All rights reserved.
 *
 */

//create object javascript
//person={firstname:"John",lastname:"Doe",age:50,eyecolor:"blue"};
//var canvas = document.getElementById("ctrMap");

function compute_eucl_dist(a,b){
	return Math.sqrt( Math.pow(a[0]-b[0],2)+ Math.pow(a[1]-b[1],2) );
}

function set_mission_mission(new_m){
	mission.mission=new_m;
}

function get_mission_mission(mission_input){
  mission_input = typeof mission_input !== 'undefined' ? mission_input : mission;
	return mission_input.mission;
}

var default_speed=0.5;
function Lawn_Mower_Gen_Read_Input(){
	//load parameters
	var lm_params=Lawn_Mower_user_input(); // read the GUI params
	if(lm_params===undefined) return;
	var leg_length=lm_params[0], leg_dist=lm_params[1], num_legs=lm_params[2], angle=lm_params[3], k=lm_params[4];
	Lawn_Mower_Gen(leg_length, leg_dist, num_legs, angle, k);
}

function Lawn_Mower_Gen(leg_length, leg_dist, num_legs, angle, k, xref, yref, vehicle, vl){
	if(vl==undefined)
		vl = default_speed;
/*	if(mission.Rigid_Formation_Flag){
		ClearMission();
	}
*/
	var tempMission = new missionObj();
	tempMission.xrefpoint=xref;
	tempMission.yrefpoint=yref;

	var num_segments=2*num_legs-1, temp_mission=new Array();
	var vid;

	if(vehicle!= undefined)
		vid = vehicle;
	else
		vid= get_vehicle_id_radio(); // Compatibility
	var xi=0,yi=0,xe=0,ye=0,xc=0,yc=0;

	console.log("New Lawn mower")
	xi = -(num_legs-1)*(leg_dist/2.0);
	xe = -(num_legs-1)*(leg_dist/2.0);
	yi = -k*leg_dist/2.0-k*leg_length/2.0;
	ye = -k*leg_length/2.0;
	
	// Create the lawn mower mission
	for(var i=0; i<num_segments-1;i+=2){
		ye+=k*leg_length;
		temp_mission.push(new Line([xi,yi,xe,ye,vl,vid]));
		xi=xe; yi=ye;
		xe+=leg_dist;
		curve_params=ComputeCurveParams_PI([xi,yi],[xe,ye]);
		xc=curve_params[0]; yc=curve_params[1]; R=curve_params[2];

		p_arc = point_in_arc([xi,yi],[xc, yc], [xe, ye],R,-k);
		temp_mission.push(new Arc([xi,yi,xc,yc,xe,ye,vl,-k,R,vid,p_arc[0], p_arc[1]]));
		xi=xe; yi=ye;
		k=-k;
	}
	ye+=k*leg_length + k*leg_dist/2.0;
	temp_mission.push(new Line([xi,yi,xe,ye,vl,vid]));
	rotateMission(temp_mission,angle, [0,0]);
	
	var midpoint_x, midpoint_y;
	tempMission.utmzone=Scenarios[Scenario-1].utm_zone;
	//Define reference point	
	if(xref != undefined && yref != undefined)
	{
		midpoint_x=xref;
		midpoint_y=yref;
	}
	else
	{
		midpoint_x=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
		midpoint_y=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
	}

	
	var x_init=y_init=0;
	if(tempMission.xrefpoint===undefined || tempMission.yrefpoint===undefined){
		//If the reference point is not defined, define it as the center of the map (centering the mission also) 
		tempMission.xrefpoint=midpoint_x;
		tempMission.yrefpoint=midpoint_y;
		var centroid=computeCentroid(temp_mission), pts;
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
			temp_mission[i].setPoints(pts);
		} //TODO: create a function to sum point to mission
	}else{
		// If the reference point already exists, center the new mission only
		//var centroid=computeCentroid(temp_mission), pts;
		var centroid = [0,0];//[(num_legs-1)*(leg_dist/2), leg_length/2];
		var x_init=-(tempMission.xrefpoint-midpoint_x)-centroid[0], y_init=-(tempMission.yrefpoint-midpoint_y)-centroid[1];
		
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[x_init,y_init]);
			temp_mission[i].setPoints(pts);
		}
	}

	tempMission.mission = temp_mission;
	
	return tempMission;
	//merge_mission(vid,temp_mission);
	//update_displayed_mission();

}

function Zero_Gen(leg_length, leg_dist, num_turns, angle, k, xref, yref, vehicle, vl){
	if(vl==undefined)
		vl = default_speed;
	
	/*if(mission.Rigid_Formation_Flag){
		ClearMission();
	}*/
	var tempMission = new missionObj();
	tempMission.xrefpoint=xref;
	tempMission.yrefpoint=yref;

	var temp_mission=new Array();
	var vid;

	//k=-k;
	if(vehicle!= undefined)
		vid = vehicle;
	else
		vid= get_vehicle_id_radio(); // Compatibility
	var xi=0,yi=0,xe=0,ye=0,xc=0,yc=0;

	// Create the lawn mower mission
	for(var i=0; i<num_turns;i++){
		// Line
		ye+=k*leg_length;
		temp_mission.push(new Line([xi,yi,xe,ye,vl,vid])); 
		xi=xe; yi=ye;
		xe+=leg_dist;
		// Arc
		curve_params=ComputeCurveParams_PI([xi,yi],[xe,ye]);
		xc=curve_params[0]; yc=curve_params[1]; R=curve_params[2];
		p_arc = point_in_arc([xi,yi],[xc, yc], [xe, ye],R,-k);
		temp_mission.push(new Arc([xi,yi,xc,yc,xe,ye,vl,-k,R,vid, p_arc[0], p_arc[1]]));
		xi=xe; yi=ye;
		//k=-k;
		// Line
		ye-=k*leg_length;
		temp_mission.push(new Line([xi,yi,xe,ye,vl,vid])); // Line
		xi=xe; yi=ye;
		xe-=leg_dist;
		// Arc
		curve_params=ComputeCurveParams_PI([xi,yi],[xe,ye]);
		xc=curve_params[0]; yc=curve_params[1]; R=curve_params[2];
		p_arc = point_in_arc([xi,yi],[xc, yc], [xe, ye],R,-k);
		temp_mission.push(new Arc([xi,yi,xc,yc,xe,ye,vl,-k,R,vid, p_arc[0], p_arc[1]])); // Arc
		xi=xe; yi=ye;
		//k=-k;
	}
	ye+=k*leg_length;
	temp_mission.push(new Line([xi,yi,xe,ye,vl,vid]));
	rotateMission(temp_mission,angle);
	
	var midpoint_x, midpoint_y;
	mission.utmzone=Scenarios[Scenario-1].utm_zone;
	//Define reference point	
	if(xref != undefined && yref != undefined)
	{
		midpoint_x=xref;
		midpoint_y=yref;
	}
	else
	{
		midpoint_x=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
		midpoint_y=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
	}

	
	var x_init=y_init=0;
	if(tempMission.xrefpoint===undefined || tempMission.yrefpoint===undefined){
		//If the reference point is not defined, define it as the center of the map (centering the mission also) 
		tempMission.xrefpoint=midpoint_x;
		tempMission.yrefpoint=midpoint_y;
		var centroid=computeCentroid(temp_mission), pts;
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
			temp_mission[i].setPoints(pts);
		} //TODO: create a function to sum point to mission
	}else{
		// If the reference point already exists, center the new mission only
		/*var centroid=computeCentroid(temp_mission), pts;
		var x_init=-(mission.xrefpoint-midpoint_x)-centroid[0], y_init=-(mission.yrefpoint-midpoint_y)-centroid[1];
		
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[x_init,y_init]);
			temp_mission[i].setPoints(pts);
		}*/
		var pts;
		var centroid_old = computeCentroid(temp_mission);

		var temp_full_mission ={};
		temp_full_mission.mission = temp_mission;
		temp_full_mission.xrefpoint = tempMission.xrefpoint;
		temp_full_mission.yrefpoint = tempMission.yrefpoint;
		var surr_rect = surrounding_rect(temp_full_mission);

		var centroid = [surr_rect[0]-temp_full_mission.xrefpoint, surr_rect[1]-temp_full_mission.yrefpoint];
		var x_init=-(tempMission.xrefpoint-midpoint_x)-centroid[0], y_init=-(tempMission.yrefpoint-midpoint_y)-centroid[1];
		
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[x_init,y_init]);
			temp_mission[i].setPoints(pts);
		}
	}
	tempMission.mission = temp_mission;
	return tempMission;

	/*merge_mission(vid,temp_mission);
	update_displayed_mission();*/
}
/*
 * insert the new mission for one vehicle in its place
 */
function merge_mission(vehicle_id,mission_new){
	clear_mission_vehicle(vehicle_id);
	var vehicle=0; var vehicle_old=0;
	var mission_to_work_on=get_mission_mission();
	if(mission_length(mission_to_work_on)==0){
		set_mission_mission(mission_new);
		return;
	}
	var len_mission=mission_length(mission_to_work_on);
	for(var index=0; index<len_mission; index++){
		vehicle=mission_to_work_on[index].getVehicle();
		if(vehicle_id <= vehicle){
			var after_vec=mission_to_work_on.slice(index,len_mission);
			after_vec=mission_new.concat(after_vec);
			var prev_vec=mission_to_work_on.slice(0,index);
			set_mission_mission(prev_vec.concat(after_vec));
			return;
		}
		vehicle_old=vehicle;
	}
	set_mission_mission(mission_to_work_on.concat(mission_new));
}

function rot_matrix_deg(angle){
	var cosine=Math.cos(angle*Math.PI/180);
	var sine=Math.sin(angle*Math.PI/180);
	return [[cosine,sine],[-sine,cosine]];
}

function point_coord_to_mission(point_coord,mission_type,vehicle_vec,mission_velocity){
	var num_segments=mission_type.length;
	var aux_mission = new Array(num_segments);
	var check_line;
	var value;
	var change_vehicle=false;
	for(var i=0;i<num_segments;i++){
		check_line=(mission_type[i]===1);
		var init_pt=point_coord.splice(0,1);
		var pi=init_pt[0];
		var vehicle_id=vehicle_vec[i];
		var velocity=mission_velocity[i];
		if(vehicle_id !=vehicle_vec[i+1] && vehicle_vec[i+1] != undefined){
			var end_pt=point_coord.splice(0,1);
			var pe=end_pt[0];
		}else{
			try{
				var pe=point_coord[0];
			}catch(e){
				console.log('error: '+e+' index: '+i);
			}
		}
		if(check_line){
			aux_mission[i]=new Line([pi[0],pi[1],pe[0],pe[1],velocity,vehicle_id]);
		}else{
			var k=0;
			if(mission_type[i]===2){ //clock wise
				k=-1;
			}else{ //counter clock wise
				k=1;
			}
			curve_params=ComputeCurveParams_PI(pi,pe);
			p_arc = point_in_arc(pi,[curve_params[0],curve_params[1]], pe,curve_params[2],k);
			aux_mission[i]=new Arc([pi[0],pi[1],curve_params[0],curve_params[1],pe[0],pe[1],velocity,k,curve_params[2],vehicle_id]);
		}
	}
	return aux_mission;
}

function mission_to_point_coord(){
	var point_coord=new Array(mission_len()+1);
	var aux_pt;
	for(var i=0;i<mission_len();i++){
		point_coord[i]=new Array(2);
		aux_pt=GetInitialSegmentPoint(i);
		point_coord[i][0]=aux_pt[0];
		point_coord[i][1]=aux_pt[1];
	}
	aux_pt=GetFinalSegmentPoint(i);
	point_coord[i][0]=aux_pt[0];
	point_coord[i][1]=aux_pt[1];
	return point_coord;
}

/* 
 * ComputeCurveParams_PI
 * Compute the center and radius of a segment 
 */
function ComputeCurveParams_PI(pi,pe, parc){
	var r, xc,yc, k;
	if(typeof parc==="undefined")
	{
		r=Math.sqrt(Math.pow(pe[0]-pi[0],2)+Math.pow(pe[1]-pi[1],2))/2;
		xc=(pi[0]+pe[0])/2;
		yc=(pi[1]+pe[1])/2;
		k = undefined;
	}
	else
	{
		var arc = arc_from_3_points(pi,parc, pe);
		xc = arc.xc;
		yc = arc.yc;
		r  = arc.R;
		k  = arc.k
	}

	return [xc,yc,r, k];
}

function matrix_multiplication(matA,matB){
	var matA_width=matA[0].length;
	var matA_height=matA.length;
	var matB_width=matB[0].length;
	var matB_height=matB.length;
    if (matA_width != matB_height) {
        throw "error: incompatible sizes";
    }
 
    var result = [];
    for (var i = 0; i < matA_height; i++) {
        result[i] = [];
        for (var j = 0; j < matB_width; j++) {
            var sum = 0;
            for (var k = 0; k < matA_width; k++) {
                sum += matA[i][k] * matB[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result; 
}

/*
 * update_list
 * This function keeps adding items to it if they are new, in order to count the number of different items 
 */ 
//function update_list(list,item){
	//if(!in_list(list,item)){
		//list.push(item);
	//}
	//list.sort();
//}

/*
 * in_list
 * Check if a item is in a list
 */
//function in_list(list,item){
	//if(list.indexOf(item) > -1){
		//return true;
	//}else{
		//return false;
	//}
//}

// TODO: later
/*function parse_parameters(params,field){
	return (typeof params === "undefined" || typeof params.new_segments_type === "undefined") ? "undefined" : params.new_segments_type;
}*/

function Generate_Mission(params){
	var new_segments_type= (typeof params === "undefined" || typeof params.new_segments_type === "undefined") ? undefined : params.new_segments_type;
	var new_segments_velocity= (typeof params === "undefined" || typeof params.new_segments_velocity === "undefined") ? undefined :  params.new_segments_velocity;
	var mission_length=mission_len();
	var vehicle_new = get_vehicle_id_radio();
	toggle_disp_vehicle(vehicle_new,true);
	var vehicle =0, vehicle_old=0;
	var flag_new_vehicle=true; //check if new_vehicle has already been used
	if(!new_segments_type && !new_segments_velocity){
		for(var j=0;j<mission_length;j++){
			if(mission.mission[j].getVehicle()===vehicle_new){
				flag_new_vehicle=false;
				break;
			}
		}
		if(mission_length===0){
			mission_length=-1; // in order to have num_pts_mission===0 if mission_length===0
			if(DPoints.length<2 ){
				return; // if it's not defined or it would have just 1 point to add (not sufficient to create a segment)
			}
		}
		if(flag_new_vehicle && DPoints.length<2){
			return;
		}
	}
	var num_pts_mission=mission_length+1;// var num_pts_total=num_pts_mission+DPoints.length;
	var point_coord = new Array (), mission_type = new Array (), mission_velocity = new Array(), vehicle_vec = new Array();
	var i, mission_vehicles=new Array();
	for(i=0;i<num_pts_mission;i++){ // get the points from the already defined mission
		if(i<(num_pts_mission-1)){
			if(!new_segments_type){
				mission_type.push(GetSegmentType(i));
			}else{
				mission_type.push(new_segments_type[i]);
			}
			if(!new_segments_velocity){
				mission_velocity.push(GetSegmentVelocity(i));
			}else{
				mission_velocity.push(new_segments_velocity[i]);
			}
			vehicle=mission.mission[i].getVehicle();
			vehicle_vec.push(vehicle);
			update_list(mission_vehicles,vehicle);
			if(i!=0 && vehicle != vehicle_old){
				point_coord.push(GetFinalSegmentPoint(i-1));
			}
			point_coord.push(GetInitialSegmentPoint(i));
			if(i===(num_pts_mission-2)){
				point_coord.push(GetFinalSegmentPoint(i));
			}
		}
		vehicle_old=vehicle;
	}
	if(typeof get_mission_mission()==="undefined"){
		mission.xrefpoint=Scenarios[Scenario-1].refpoint[0];
		mission.yrefpoint=Scenarios[Scenario-1].refpoint[1];
		mission.utmzone=Scenarios[Scenario-1].utm_zone;
	}
	
	if(DPoints.length!=0){
		var index_new=0;
		/*this code is to get how many ending points are in the middle*/
		var aux_i;
		if(in_list(mission_vehicles,vehicle_new)){
			aux_i=1;
		}else{
			aux_i=0;
		}
		update_list(mission_vehicles,vehicle_new);
		var veic_index_aux=mission_vehicles.indexOf(vehicle_new)+aux_i;
		if( !(get_mission_mission()===undefined || vehicle_vec[0]>vehicle_new)){
			for(var j=0;j<mission_length;j++,index_new++){
				if(vehicle_vec[j]<=vehicle_new && (j+1)<mission_length && vehicle_vec[j+1] > vehicle_new){
					index_new++;
					break;
				}else{
					if(j===mission_length-1){
						index_new++;
						break;						
					}
				}
			}
		}
		
		for(var jj=0;jj<DPoints.length;jj++){
			point_coord.splice(index_new+veic_index_aux, 0, [DPoints[DPoints.length-jj-1].x-mission.xrefpoint,DPoints[DPoints.length-jj-1].y-mission.yrefpoint]); // add DPoints in the inverse order (easier for the point_coord index management
		}
		mission_type.splice(index_new, 0, 1); //add line
		vehicle_vec.splice(index_new, 0, vehicle_new); //add vid
		mission_velocity.splice(index_new, 0, default_speed); //add default_speed
		DPoints=[];
	}
	set_mission_mission(point_coord_to_mission(point_coord,mission_type,vehicle_vec,mission_velocity));
	update_displayed_mission();
}

function showPointsID(canvas_id, mission_input){
    canvas_id = typeof canvas_id !== 'undefined' ? canvas_id : 'canvas_back';
    mission_input = typeof mission_input !== 'undefined' ? mission_input : mission;
    var canvas = document.getElementById(canvas_id); ctx = canvas.getContext('2d');

	if(!Show_Points_ID_Flag || mission_input === undefined){
		return;
	}
	var mission_to_work_on=get_mission_mission(mission_input),index_to_display=0;//, x=0, y=0;  //TODO del this
	ctx.font = '16pt Calibri';
	ctx.fillStyle = 'white';
	var color="white";
	var vehicle = 0, vehicle_old = vehicle;//, index_to_print=0; //TODO del this
 	for(var i=0; i<mission_length(mission_to_work_on);i++){
		vehicle=mission_to_work_on[i].getVehicle();
		var pts=mission_to_work_on[i].getPoints();
		for(var j=0; j<pts.length; j++){
			if(!check_disp_vehicle(vehicle)){
				continue;
			}
			if(j==0 && vehicle==vehicle_old){ //initial point of a segment is the same as the last point of previous segment
				continue;
			}
			//if(j!=0 && j!=(pts.length-1)) continue; //TODO: only first and last point, when trying to change arcs see this
			//circles(pts[j][0]+mission.xrefpoint,pts[j][1]+mission.yrefpoint,color,false,'red');
			circles(parseFloat(pts[j][0])+mission_input.xrefpoint,parseFloat(pts[j][1])+mission_input.yrefpoint,color,true,'red', canvas_id);
			//var aux_pt = getCanvasPos_pixel(pts[j], false, mission_input);
			var aux_pt = getCanvasPos_pixel([parseFloat(pts[j][0])+mission_input.xrefpoint,parseFloat(pts[j][1])+mission_input.yrefpoint,color], true);
			ctx.fillStyle = color;
			ctx.fillText(index_to_display.toString(), aux_pt[0]+5, aux_pt[1]+5);
			index_to_display++;
		}
		vehicle_old=vehicle;
	}
}

function Define_Formation(ask_flag_i,flag_update){
//only defined for maximum of 3 vehicles
	var ask_flag= typeof ask_flag_i!='undefined' ? ask_flag_i : 0;
	var flag_update= typeof flag_update!='undefined' ? flag_update : 1;
	if(ask_flag===1){
		//formation_coord=get_formation_coord_user();
		get_formation_coord_user();
	}else{
		if(ask_flag===2){
			var default_values="[0,0];[0,5];[0,-5]";//"[0,0];[0,2.5];[0,-2.5]";
			var str=prompt("Please define the formation coordinates as shown '[]' in order not to use the vehicle",default_values);
			var params=str.split(";");
			for(var i=0;i<num_vehicles;i++){
				//formation_coord[i]=new Array(2);
				var str=params[i].strip();
				var new_str=new String();
				for(var j=0;j<str.length;j++){
					if( !(str[j]=='[' || str[j]==']') ){
						new_str+=str[j];
					}
				}
				str=new_str.split(',');
				aux1=parseFloat(str[0]);aux2=parseFloat(str[1]);
				if(isNaN(aux1*aux2)) continue;
				//mission.formation.push(i+1,aux1,aux2); //wrong! check if it already exists
			}
		}
	}
	// if(mission.formation != undefined && mission.formation.length != 0){
		// toggle_disp_vehicle(-1,false);
	// }
	

	var vehicles_in_formation=[];
	for(var i=0;i<mission.formation.length;i=i+3){
		if(!in_list(vehicles_in_formation,mission.formation[i])){
			update_list(vehicles_in_formation,mission.formation[i]);
		}
	}
	for(var i=0;i<num_vehicles;i++){
		if(in_list(vehicles_in_formation,i+1)){
			clear_mission_vehicle(i+1);
		}
	}
	// save_a_copy_nominal_mission();
	FORMATION(mission.formation,get_mission_mission());
	//mission.ReWriteMission();
	if(flag_update === 1){
		update_displayed_mission();
	}
}

function save_a_copy_nominal_mission(){
	var mission_nominal=new Array();
	for(var i=0;i<mission_len();i++){
		if(mission.mission[i].getVehicle() === -1){
			mission_nominal.push(get_mission_mission()[i]);
		}
	}
	if(mission_nominal.length === 0 && mission.mission_nominal != undefined){
		mission_nominal=mission.mission_nominal;
	}
	if( mission_nominal.length !=0){
		mission.mission_nominal = mission_nominal.slice(0); //make a copy
		set_mission_mission(mission_nominal.slice(0));
	}
}

function remove_from_formation(vehicle_id){
	var form_len=mission.formation.length;
	for(var i=0;i<form_len;i=i+3){
		if(mission.formation[form_len-i-3] === vehicle_id){
			mission.formation.splice(form_len-i-3,3);
			break;
		}
	}
}

function newFilledArray(len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

function GetMissionPoint(index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	if(index<mission_len(mission_changing)){
		return GetInitialSegmentPoint(index,mission_changing);
	}
	else{
		if(index==mission_len(mission_changing)){
			return GetFinalSegmentPoint(index-1,mission_changing);
		}else{
			alert('warning, invalid index');
		}
	}
}

//Manage Initial Segment Points
function GetInitialSegmentPoint(index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	return [mission_changing[index].value[0],mission_changing[index].value[1] ];
}

/*function SetInitialSegmentPoint(index,x,y,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	mission_changing[index].value[0]=x;
	mission_changing[index].value[1]=y;
}*/

//Manage Final Segment Points
function GetFinalSegmentPoint(index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	// if(mission_changing[index]===undefined){
		// index=index-1;
	// }
	if(mission.mission[index].type==="line" || isThisSegmentA_Line(index,mission_changing)){
		return [mission_changing[index].value[2],mission_changing[index].value[3]];
	}else{
		return [mission_changing[index].value[4],mission_changing[index].value[5]];
	}
}

/*function SetFinalSegmentPoint(index,x,y,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	if(mission.mission[index].type==="line" || isThisSegmentA_Line(index)){
		mission_changing[index].value[2]=x;
		mission_changing[index].value[3]=y;
	}else{
		mission_changing[index].value[4]=x;
		mission_changing[index].value[5]=y;
	}
}*/

function isThisSegmentA_Line(){
	console.log("delete this");
	return false;
}

/* SetSegmentCurveParams
 * Set a segment curve parameters
 * curve_params[0]: xc (x coordinate of the center)
 * curve_params[1]: yc (y coordinate of the center)
 * curve_params[2]: R  (radius of the circle)
 */
function SetSegmentCurveParams(index,curve_params,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	mission_changing[index].value[2]=curve_params[0];
	mission_changing[index].value[3]=curve_params[1];
	mission_changing[index].value[8]=curve_params[2];
}


function GetSegmentVelocity(index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	console.log("delete this");
	return mission_changing[index].getVelocity();
}

function SetVehicle(vehicle_id,index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	if(mission_changing===undefined){
		return undefined;
	}
	if(index==mission_len(mission_changing)){
		index=index-1;
	}
	if(mission.mission[index].type==="line" || isThisSegmentA_Line(index,mission_changing)){ //is it is a line
		if(mission_changing[index].value.length>=6){
			mission_changing[index].value[5]=vehicle_id;
		}else{
			return undefined;
		}
	}else{ //is it is an arc
		if(mission_changing[index].value.length>=10){
			mission_changing[index].value[9]=vehicle_id;
		}else{
			return undefined;
		}
	}
}

function GetSegmentType(index,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	var aux_pt=GetMissionPoint(index,mission_changing);
	// if(index===mission_len()){ //trying to delete this
		// index=index-1;
	// }
	if(mission.mission[index].type==="line" || isThisSegmentA_Line(index,mission_changing)){
		return 1;
	}
	if(mission_changing[index].value[7]===-1){
		return 2;
	}else{
		return 3;
	}
}

function mission_len(this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	if(typeof mission_changing==="undefined")
		return 0;
	// try{
		// console.log(mission_changing.length)
	// }catch(e){
		// console.log(mission_changing)
		// console.log("this mission "+this_mission.toString())
		// console.log("mission mission "+get_mission_mission())
	// }
	return mission_changing.length;
}

function print_point_coord(point_coord){
	console.log('point_coord.length: '+point_coord.length);
	for(var abcd=0;abcd<point_coord.length;abcd++){
		console.log(point_coord[abcd].join(' '));
	}
}

function clear_mission_vehicle(vehicle){
	var miss_len=mission_len();
	for(var i=0; i< miss_len;i++){
		if(mission.mission[miss_len-i-1].getVehicle() === vehicle){
			mission.mission.splice(miss_len-i-1,1);
		}
	}
}

function clear_non_nominal(){
	for(var i=0;i<num_vehicles;i++){
		clear_mission_vehicle(i+1);
	}
}

function ClearMission(mission_input){
	mission_input.mission=[];
	//set_mission_mission([]);
	//DPoints=[];
	update_displayed_mission();
}

function Same_Mission_Biased(){
	//if(mission.Rigid_Formation_Flag) Toggle_DropDown_Menu('Rigid_Formation');
	//var biases=Same_Mission_Biased_user_input();
	var biases=[1,12.5,2,-12.5];
	var mission_nominal=[];
	for(var i=0;i<mission_len();i++){
		if(mission.mission[i].getVehicle()==-1){
			mission_nominal=mission_nominal.concat(get_mission_mission()[i]);
		}
	}
	// var max_bias=0;
	// for(var i=0;i<biases.length;i+=2){
	// 	if(biases[i+1]>max_bias){
	// 		max_bias=biases[i+1];
	// 	}
	// }
	for(var i=0;i<biases.length;i+=2){
		var vehicle_id=biases[i];
		var mission_new=clone_mission(mission_nominal);// shallow copy

		for(var index=0;index<mission_nominal.length;index++){
			SetVehicle(vehicle_id,index,mission_new);
		}
		var aux_pts=mission_new[0].getPoints();
		var pi=aux_pts[0], pe=aux_pts[aux_pts.length-1];
		var ang_i = Math.atan2(pe[1]-pi[1],pe[0]-pi[0]);
		pi[0]+=Math.cos(ang_i)*biases[i+1]; pi[1]+=Math.sin(ang_i)*biases[i+1];
		aux_pts[0]=pi;
		mission_new[0].setPoints(aux_pts);
		
		var aux_pts=mission_new[mission_new.length-1].getPoints(); //TODO: do not use .length
		var pi=aux_pts[0], pe=aux_pts[aux_pts.length-1];
		var ang_e = Math.atan2(pe[1]-pi[1],pe[0]-pi[0]);
		pe[0]+=Math.cos(ang_e)*biases[i+1]; pe[1]+=Math.sin(ang_e)*biases[i+1];
		aux_pts[aux_pts.length-1]=pe;
		mission_new[mission_new.length-1].setPoints(aux_pts);
				
		merge_mission(vehicle_id,mission_new);
		// TODO:
		// - Divide the straight lines
		// - check the biggest bias and make prevent it from exceding the end of the mission 
	}
}

function Back_and_Forth(){ // TODO: add angle, velocity
	if(mission.Rigid_Formation_Flag){
		ClearMission();
	}
	var bf_params=back_forth_user_input();
	// alert(bf_params);
	if(bf_params===undefined) return;
	var leg_length=bf_params[0];
	var radius=bf_params[1];
	var num_legs=bf_params[2];

	if(leg_length<=0){
		alert('leg_length<=0\nPlease try again');
		return;
	}
	if( radius<=0 ){
		alert('radius<=0\nPlease try again');
		return;
	}
	if( num_legs<=0 || (num_legs%1)!=0){
		alert('num_legs<=0 or not integer\nPlease try again');
		return;
	}

	mission.utmzone=Scenarios[Scenario-1].utm_zone;
	var midpoint_x=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
	var midpoint_y=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
	if(mission.xrefpoint===undefined || mission.yrefpoint===undefined){
		mission.xrefpoint=midpoint_x;
		mission.yrefpoint=midpoint_y;
	}else{
		x_init=mission.xrefpoint-midpoint_x;
		y_init=mission.yrefpoint-midpoint_y;
	}
	
	x=0;y=0;
	var k=-1;
	var vehicle_id=2;
	//var aux_mission= new Array(num_legs*3);
	// for(var i=0; i<num_legs*3;i+=3){
	// 	xi=x;
	// 	xe=xi-k*leg_length;
	// 	aux_mission[i]={'line':true,'value':[xi,y,xe,y,velocity,vehicle_id]};
	// 	x=xe;
	// 	xi=x;
	// 	xe+=-k*radius*2;
	// 	curve_params=ComputeCurveParams_PI(xi,y,xe,y);
		
	// 	aux_mission[i+1]={'line':false,'value':[xi,y,curve_params[0],curve_params[1],xe,y,velocity,k,curve_params[2],vehicle_id]};
	// 	aux_mission[i+2]={'line':false,'value':[xe,y,curve_params[0],curve_params[1],xi,y,velocity,k,curve_params[2],vehicle_id]};
	// 	k=-k;
	// }
	/*for(var i=0; i<num_legs*3;i+=3){
		yi=y;
		ye=yi-k*leg_length;
		aux_mission[i]={'line':true,'value':[x,yi,x,ye,velocity,vehicle_id]};
		y=ye;
		yi=y;
		ye+=-k*radius*2;
		curve_params=ComputeCurveParams_PI(x,yi,x,ye);
		
		aux_mission[i+1]={'line':false,'value':[x,yi,curve_params[0],curve_params[1],x,ye,velocity,k,curve_params[2],vehicle_id]};
		aux_mission[i+2]={'line':false,'value':[x,ye,curve_params[0],curve_params[1],x,yi,velocity,k,curve_params[2],vehicle_id]};
		k=-k;
	}*/
	/*var aux_mission= new Array(num_legs);
	for(var i=0; i<num_legs;i++){
		yi=y;
		ye=yi-k*leg_length;
		aux_mission[i]={'line':true,'value':[x,yi,x,ye,velocity,vehicle_id]};
		y=ye;
		yi=y;
		ye+=-k*radius*2;
		k=-k;
	}*/
	var aux_mission = new Array();
	for(var i=0; i<num_legs;i++){
		xi=x;
		xe=xi-k*leg_length;
		aux_mission.push(new Line([xi,y,xe,y,default_speed,vehicle_id]));
		x=xe;
		xi=x;
		xe+=-k*radius*2;
		k=-k;
 	}
	mission.mission=aux_mission;
	update_displayed_mission();
}

function debug_getvehicle(this_mission){
	var to_print="";
	for(var i=0;i<mission_len(this_mission);i++){
		to_print=to_print+i.toString()+"\t"+GetVehicle(i,this_mission).toString()+"\n";
		// console.log(i.toString()+" "+GetVehicle(i,this_mission).toString());
	}
	console.log(to_print);
}

// Object.prototype.clone = function() {
	// var newObj = (this instanceof Array) ? [] : {};
	// for (i in this) {
		// if (i == 'clone') continue;
		// if (this[i] && typeof this[i] == "object") {
			// newObj[i] = this[i].clone();
		// } else newObj[i] = this[i]
	// } return newObj;
// };

function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function isNumber(n){
    return typeof n == 'number' && !isNaN(n) && isFinite(n);
 }

function eight_mission(max_width, max_height, angle, xref, yref, num_turns){
	// max_width=10;
	// max_height=20.1;
	// angle=0;
	//ClearMission();
	console.log("New Eight")
	var tempMission = new missionObj();
	tempMission.xrefpoint=xref;
	tempMission.yrefpoint=yref;

	var x_init=y_init=0;
	var midpoint_x, midpoint_y;
	tempMission.utmzone=Scenarios[Scenario-1].utm_zone;
	//Define reference point	
	if(xref != undefined && yref != undefined)
	{
		midpoint_x=xref;
		midpoint_y=yref;
	}
	else
	{
		midpoint_x=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
		midpoint_y=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
	}
	tempMission.xrefpoint = midpoint_x;
	tempMission.yrefpoint = midpoint_y;

	if (max_height <= max_width*2){//} || !isNumber(aperture)){
	    //alert('mission may be impossible due to the proportions. height needs to be > 2*width');
	    // Switching height and width
	    max_width = max_height/2.000001;
/*	   	var aux = max_height;
	   	max_height = max_width;
	   	max_width = aux;*/
	    //return;
	}

	DEG2RAD=Math.PI/180;
	var pi=Math.PI;
	radius=max_width/2;
	aperture=(2*pi - 2*Math.acos((2*radius)/(2*radius - max_height)));
	angi=-pi/2+aperture/2; ange=3*pi/2-aperture/2;
	xi=radius*Math.cos(angi); yi=radius*Math.sin(angi);
	xe=radius*Math.cos(ange); ye=radius*Math.sin(ange);
	m1=Math.tan(pi/2-angi); m2=Math.tan(pi/2-ange);
	b1=yi+m1*xi; b2=ye+m2*xe;

	l1i=[xe,m1*xe+b1]; l1e=[xi,m1*xi+b1];
	l2i=[xi,m2*xi+b1]; l2e=[xe,m2*xe+b1];

	var centroid = new Array();
	centroid[0]=(b2-b1)/(m1-m2);
	centroid[1]=m1*centroid[0]+b1;
	// rotation
	/*ang=ang*DEG2RAD;
	rot=[cos(ang), sin(ang); -sin(ang) cos(ang)];
	pts=[l1i; l1e; l2i; l2e; centroid]-[repmat(centroid,4,1); 0,0];
	pts=pts*rot;*/
	var aux_centroid=[centroid[0]*2,centroid[1]*2];
	var pts = new Array(l1i, l1e, l2i, l2e, aux_centroid);
	pts=rotate_pts(pts,angle,centroid);

	var temp_mission=new Array();
	var ki=-1;
	var vid=-1;
	for(var turn=0; turn < num_turns;turn++){
		xi=pts[0][0]; yi=pts[0][1]; xe=pts[1][0]; ye=pts[1][1];
		tempMission.mission.push( new Line([xi,yi,xe,ye,default_speed,vid]) );

		xi=pts[1][0]; yi=pts[1][1]; xc=pts[4][0]; yc=pts[4][1]; k=ki; xe=pts[3][0]; ye=pts[3][1];
		p_arc = point_in_arc([xi,yi],[xc,yc], [xe,ye],radius,k);
		tempMission.mission.push( new Arc([xi,yi,xc,yc,xe,ye,default_speed,k,radius,vid, p_arc[0], p_arc[1]]));

		xi=pts[3][0]; yi=pts[3][1]; xe=pts[2][0]; ye=pts[2][1];
		tempMission.mission.push( new Line([xi,yi,xe,ye,default_speed,vid]) );

		xi=pts[2][0]; yi=pts[2][1]; xc=-pts[4][0]; yc=-pts[4][1]; k=-k; xe=pts[0][0]; ye=pts[0][1];
		p_arc = point_in_arc([xi,yi],[xc,yc], [xe,ye],radius,k);
		tempMission.mission.push( new Arc([xi,yi,xc,yc,xe,ye,default_speed,k,radius,vid, p_arc[0], p_arc[1]]) );

		xi=pts[0][0]; yi=pts[0][1]; xe=pts[1][0]; ye=pts[1][1];
		tempMission.mission.push( new Line([xi,yi,xe,ye,default_speed,vid]) );
	}
	console.log("End Eight")
	return tempMission;
}

function rotate_pts ( point_cloud, angle, centroid ){
	var R=rot_matrix_deg(angle);

	for(var i=0;i<point_cloud.length;i++){
		point_cloud[i][0]-=centroid[0];
		point_cloud[i][1]-=centroid[1];
	}//remove the centroid

	point_cloud=matrix_multiplication(point_cloud,R);
	// var d_x,d_y;
	// d_x=x_init-point_cloud[0][0];
	// d_y=x_init-point_cloud[0][1];
	// for(var i=0;i<point_cloud.length;i++){
	// 	point_cloud[i][0]+=d_x;
	// 	point_cloud[i][1]+=d_y;
	// }
	return point_cloud;
}

/********************* Mission Smoother *********************/

function hypot(a,b){
    return Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
}

function fit_arc(p1,p2,p3){
	var a = (Math.atan2((p2[1]-p1[1]),(p2[0]-p1[0])));
	var b = (Math.atan2((p3[1]-p2[1]),(p3[0]-p2[0])));
	var c = (Math.atan2((p3[1]-p1[1]),(p3[0]-p1[0])));
	var k = sign(a-b);
	console.log('862 c: '+c+' '+k);
	if(Math.round(c*1000)<Math.round(-Math.PI/2*1000) || Math.round(c*1000)>Math.round(Math.PI/2*1000)){
		k=-k;
	}
	var th  = angle_diff(Math.PI/2,angle_diff(c,a));
	var len = hypot(p2[1]-p1[1],p2[0]-p1[0]);
	
	var r = len*Math.tan(th);
	var t = a -k*Math.PI/2;
	
	var xc = p1[0] + r*Math.cos(t);
	var yc = p1[1] + r*Math.sin(t);
    var pc =[xc,yc];

    return [k,pc];
}

function sign(a){
    return a > 0 ? 1 : a<0 ? -1 : 0;
}

function angle_diff(angle1,angle2){
    return Math.abs((angle1 + Math.PI - angle2)%(2*Math.PI) - Math.PI);
}

function startsmoothing(arg_mission,per_cut){
    if(per_cut===undefined){
        per_cut = 10;
    }
	var smoothed_mission = smooth_loop(clone_mission(arg_mission), per_cut, 0), tempmission;
	for(var i = 2; i<arg_mission.length; i++){
		if(i==20){
			console.log('here');
		}
		tempmission = smooth_loop(clone_mission(arg_mission.slice(i-1,i+1)),per_cut, 1);
		var aux_mission=tempmission.slice(1,tempmission.length);
		for(var j=0; j<aux_mission.length; j++){
			smoothed_mission.push(aux_mission[j]);
		}
	}
	var sego=arg_mission[arg_mission.length-1], segm=smoothed_mission[smoothed_mission.length-1]; //original and modified segments
    segm.value[segm.dictionary.xe] = sego.value[sego.dictionary.xe];
    segm.value[segm.dictionary.ye] = sego.value[sego.dictionary.ye];
    return smoothed_mission;
}

function smooth_loop(arg_mission,len_cut, start_short){
    var last_short=1;
    var newmission = new Array();
    newmission.push(arg_mission[0]);
    if(start_short){
    	var seg=arg_mission[0], th;
        if(seg.type === "line"){ //line
            th = seg.angle();
            k=-1;
        }else{ //arc
            th = seg.angleToCenter()-Math.PI/2;
            k = seg.value[seg.dictionary.dir];
        }
        
        var xi=seg.value[seg.dictionary.xi], yi=seg.value[seg.dictionary.yi];
        xsn0 =  xi - k*len_cut*Math.cos(th);
        ysn0 =  yi - k*len_cut*Math.sin(th);
        var seg = newmission[0];
        seg.value[seg.dictionary.xi]= xsn0;
        seg.value[seg.dictionary.yi]= ysn0;
    }

    wieredflag =0;
    var angleoftransect= new Array(2);
    for(var i= 1; i>=0; i--){
    	var seg=arg_mission[i];
        if(seg.type === "line"){
            angleoftransect[i] = seg.angle();
        }else{
            angleoftransect[i] = seg.angleToCenter()-Math.PI/2;
            k=seg.value[seg.dictionary.dir];
        }
    }
    th2 = angleoftransect[1];
    th1 = angleoftransect[0];
    if(angle_diff(th2,th1)==0){
      if(!arg_mission[0].type === "line" && !arg_mission[1].type === "line"){
          wieredflag =1;
          th = th1+Math.PI/2;
          var seg=arg_mission[1];
          seg.value[seg.dictionary.xi] = seg.value[seg.dictionary.xi] + k*len_cut*Math.cos(th);
          seg.value[seg.dictionary.yi] = seg.value[seg.dictionary.yi] + k*len_cut*Math.sin(th);
          seg.value[seg.dictionary.xc] = seg.value[seg.dictionary.xe] + k*len_cut*Math.cos(th);
          seg.value[seg.dictionary.yc] = seg.value[seg.dictionary.yc] + k*len_cut*Math.sin(th);
          seg.value[seg.dictionary.xe] = seg.value[seg.dictionary.xe] + k*len_cut*Math.cos(th);
          seg.value[seg.dictionary.ye] = seg.value[seg.dictionary.ye] + k*len_cut*Math.sin(th);
          var seg=arg_mission[0];
          var p2x=seg.value[seg.dictionary.xe]+ k*len_cut/2*Math.cos(th);
          var p2y=seg.value[seg.dictionary.ye]+ k*len_cut/2*Math.sin(th);
          p2=[p2x,p2y];
      }
    }

    if(angle_diff(th2,th1)==0 && arg_mission[0].type === "line" === true && arg_mission[1].type === "line" === true){
        newmission[1] = clone(arg_mission[1]);
    }else{
    	var seg=arg_mission[0];
    	var xsn1, ysn1;
        if(seg.type === "line"){
            xsn1 =  seg.value[seg.dictionary.xe] - len_cut*Math.cos(th1);
            ysn1 =  seg.value[seg.dictionary.ye] - len_cut*Math.sin(th1);
        }else{
			xsn1 =  seg.value[seg.dictionary.xe] + k*len_cut*Math.cos(th1);
			ysn1 =  seg.value[seg.dictionary.ye] + k*len_cut*Math.sin(th1);
			var xcn  =  seg.value[seg.dictionary.xc] + k*len_cut*Math.cos(th1);
			var ycn  =  seg.value[seg.dictionary.yc] + k*len_cut*Math.sin(th1);
			newmission[0].value[newmission[0].dictionary.xc] = xcn;
			newmission[0].value[newmission[0].dictionary.yc] = ycn;
        }
        p1 = [xsn1,ysn1];

        var seg=arg_mission[1];
        var xsn2, ysn2;
        if(seg.type === "line"){
            xsn2 =  seg.value[seg.dictionary.xi] + len_cut*Math.cos(th2);
            ysn2 =  seg.value[seg.dictionary.yi] + len_cut*Math.sin(th2);
        }else{
            xsn2 =  seg.value[seg.dictionary.xi] + k*len_cut*Math.cos(th2);
            ysn2 =  seg.value[seg.dictionary.yi] + k*len_cut*Math.sin(th2);             
        }
        
        if(!wieredflag){
            p2 = [seg.value[seg.dictionary.xi], seg.value[seg.dictionary.yi]];
        }
        p3 = [xsn2, ysn2];
        
        var output = fit_arc(p1,p2,p3,0); //start, edge and end points
        var dir=output[0];
        var pc=output[1];
        
        var seg=newmission[0];
        seg.value[seg.dictionary.xe] = p1[0];
        seg.value[seg.dictionary.ye] = p1[1];
        var R = compute_eucl_dist(p1,pc);
        var seg=arg_mission[1];
        var veloc=seg.value[seg.dictionary.veloc];
        var vid=seg.value[seg.dictionary.vid];

        newmission[1] = new Arc([p1[0], p1[1], pc[0], pc[1], p3[0], p3[1], veloc, -dir, R, vid]);
        newmission[2] = arg_mission[1].clone();
        var seg = newmission[2];
        newmission[2].value[seg.dictionary.xi] = p3[0];
        newmission[2].value[seg.dictionary.yi] = p3[1];
        if(arg_mission[1].type != "line"){
        	var seg=arg_mission[1];
            var xcn =  seg.value[seg.dictionary.xc] + k*len_cut*Math.cos(th2);
            var ycn =  seg.value[seg.dictionary.yc] + k*len_cut*Math.sin(th2);
            var seg = newmission[2];
            seg.value[seg.dictionary.xc] = xcn;
            seg.value[seg.dictionary.yc] = ycn;
        }
        if(last_short){
            lastTranMis = newmission[2].clone();
            if(lastTranMis.type === "line"){
                th = lastTranMis.angle();
                k=1;
            }else{
                th = lastTranMis.angleToCenter()-Math.PI/2;
                k = seg.value[seg.dictionary.dir];
            }
            
            xsnE =  lastTranMis.value[lastTranMis.dictionary.xe] - k*len_cut*Math.cos(th);
            ysnE =  lastTranMis.value[lastTranMis.dictionary.ye] - k*len_cut*Math.sin(th);
            var newseg=newmission[2];
            newmission[2].value[newseg.dictionary.xe] = xsnE;
            newmission[2].value[newseg.dictionary.ye] = ysnE;
        }
    }
    return newmission;
}

function circle_mission(angle_rot, num_turns,radius,xCenter,yCenter,vid,default_speed){	
	/*if(mission.Rigid_Formation_Flag){
		ClearMission();
	}*/
	var tempMission = new missionObj();
	tempMission.xrefpoint=xCenter;
	tempMission.yrefpoint=yCenter;

	var temp_mission=new Array();
	var vid;

	// ARC
	console.log("new circle")
	xi = -radius * Math.cos(-angle_rot*Math.PI/180); yi = radius * Math.sin(-angle_rot*Math.PI/180);
	xe = -radius * Math.cos(-angle_rot*Math.PI/180+Math.PI); ye = radius * Math.sin(-angle_rot*Math.PI/180+Math.PI);
	for(var i=0; i<num_turns; i++) {
		// Arc
		p_arc = point_in_arc([xi,yi],[0,0], [xe,ye],radius,1);
		temp_mission.push(new Arc([xi,yi,0,0,xe,ye,default_speed,1,radius,vid, p_arc[0],p_arc[1]]));
		p_arc = point_in_arc([xe,ye],[0,0], [xi,yi],radius,1);
		temp_mission.push(new Arc([xe,ye,0,0,xi,yi,default_speed,1,radius,vid, p_arc[0],p_arc[1]]));
	}
		
	tempMission.mission = temp_mission;
	return tempMission;

	/*merge_mission(vid,temp_mission);
	update_displayed_mission();*/


}
function star_mission(angle_rot,num_edges,radius,xCenter,yCenter,vid,default_speed){
	if( num_edges%2==0){
	    alert('num_edges is even\n');
	    return;
	}
	var tempMission = new missionObj();
	tempMission.xrefpoint=xCenter;
	tempMission.yrefpoint=yCenter;

	// Building star
	var radiansOffset = angle_rot*Math.PI/180;
	var ind=0, angle, xp,yp, xpold=0, ypold=0, xpi, ypi;
	var temp_mission = new Array(), prev_seg;

	for(var i=0; i<num_edges; i++) {
	    ind=(ind+(num_edges-1)/2)%num_edges;
	    angle = radiansOffset + ind* 2*Math.PI/num_edges;
	    xp=xCenter*0 + radius * Math.cos(angle);
	    yp=yCenter*0 + radius * Math.sin(angle);
	    if(i>0){
	    	temp_mission.push( new Line([xpold, ypold, xp, yp, default_speed, vid]));
	    }else if(i==0){
	    	xpi=xp; ypi=yp;
	    }
	    xpold = xp;
	    ypold = yp;
	}
	temp_mission.push( new Line([xpold, ypold, xpi, ypi, default_speed, vid]));


	var midpoint_x, midpoint_y;
	tempMission.utmzone=Scenarios[Scenario-1].utm_zone;
	//Define reference point	
	if(xCenter != undefined && yCenter != undefined)
	{
		midpoint_x=xCenter;
		midpoint_y=yCenter;
	}
	else
	{
		midpoint_x=Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
		midpoint_y=Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
	}

	
	var x_init=y_init=0;
	if(tempMission.xrefpoint===undefined || tempMission.yrefpoint===undefined){
		//If the reference point is not defined, define it as the center of the map (centering the mission also) 
		tempMission.xrefpoint=midpoint_x;
		tempMission.yrefpoint=midpoint_y;
		var centroid=computeCentroid(temp_mission), pts;
/*		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
			temp_mission[i].setPoints(pts);
		} //TODO: create a function to sum point to mission*/
	}else{
		// If the reference point already exists, center the new mission only
		var pts;
		var centroid_old = computeCentroid(temp_mission);

		var temp_full_mission ={};
		temp_full_mission.mission = temp_mission;
		temp_full_mission.xrefpoint = xCenter;
		temp_full_mission.yrefpoint = yCenter;
		var surr_rect = surrounding_rect(temp_full_mission);

/*		var centroid = [surr_rect[0]-temp_full_mission.xrefpoint, surr_rect[1]-temp_full_mission.yrefpoint];
		var x_init=-(mission.xrefpoint-midpoint_x)-centroid[0], y_init=-(mission.yrefpoint-midpoint_y)-centroid[1];
		
		for(var i=0; i<mission_length(temp_mission);i++){
			pts=temp_mission[i].getPoints();
			pts=sumPointToMat(pts,[x_init,y_init]);
			temp_mission[i].setPoints(pts);
		}*/
	}
	tempMission.xrefpoint=xCenter;
	tempMission.yrefpoint=yCenter;
		
	
	tempMission.mission = temp_mission;
	return tempMission;
	/*merge_mission(vid,temp_mission);
	update_displayed_mission();*/

	//return aux_mission;

}

function arc_from_3_points(p1,p2,p3){
	var x1=p1[0], y1=p1[1];
	var x2=p2[0], y2=p2[1];
	var x3=p3[0], y3=p3[1];
	var x21=x2-x1, y21=y2-y1, x31=x3-x1, y31=y3-y1;
	var h21 = Math.pow(x21,2)+Math.pow(y21,2), h31=Math.pow(x31,2)+Math.pow(y31,2);
	var d = 2*(x21*y31-x31*y21);
	var a = x1+(h21*y31-h31*y21)/d;
	var b = y1-(h21*x31-h31*x21)/d;
	var r = Math.sqrt( h21*h31*(Math.pow(x3-x2,2)+Math.pow(y3-y2,2)) )/Math.abs(d);

	var a1=Math.atan2(y1-b,x1-a); // Make needed correction on a3
	var a3=Math.atan2(y3-b,x3-a); // Make plot go from P1 to P3 through P2
	a3 = a3 + (sign(d) - sign(a3-a1))*Math.PI;

	if(a1>a3){
		k=-1; //clockwise
	}else{
		k=1; //anti-clockwise
	}
	return {xc: a, yc: b, R: r, k:k};
}


function angleLine(p1,p2){
	return Math.atan2(p2[1]-p1[1], p2[0]- p1[0]);
}

function pt_matlab_syntax(pt, name){
	return ""+name+"=["+pt.join(",")+"]; ";
}

function wrapTo360(ang)
{
	while (ang>=360) ang-=360;
	while (ang<0) ang+=360;
	return ang;
}

function point_in_arc(pi,pc,pe,R,k){
	var ths = wrapTo360(-Math.atan2(pi[1]-pc[1],pi[0]-pc[0])*180/Math.PI)
	var the = wrapTo360(-Math.atan2(pe[1]-pc[1],pe[0]-pc[0])*180/Math.PI)
	var len = wrapTo360(the-ths);
	if(k==1) len = 360-len;

	thm = ths*Math.PI/180-k*len*Math.PI/180/2;
	//console.log("ths " + (ths).toFixed(2) + " the " + (the).toFixed(2) + " len " + (len).toFixed(2) + " k " + k)
	var xm=pc[0]+Math.cos(thm)*R, ym=pc[1]-Math.sin(thm)*R;

	return [xm,ym];
}

function send_mission(mission_input){
  mission_input = typeof mission_input !== 'undefined' ? mission_input : mission;
  var mission_str = mission_input.toText();
  //split lines by end_line char and remove line starting with # (comments) or empty lines
  var mission_str_array=mission_str.split('\r\n');
  for (var i=mission_str_array.length-1; i>=0; i--) {
    if (mission_str_array[i].replace(/ /g,'').indexOf("#")===0 || mission_str_array[i].replace(/ /g,'').length===0) {
        mission_str_array.splice(i, 1);
    }
  }
  // merge the previous array with EOL as horizontal tab %09. after tests, ended up using %09%09 because it worked
  mission_str=mission_str_array.join('%09%09');
  xmlhttp[VCurr-1].message = '\nError: Sending Mission! Try again!';
  if(VehiclesData[VCurr-1].SystemState){ //ROS
    xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/addons/Mission_String%20std_msgs/String%20{data: \""+mission_str+"\"}",true); 
  }
  var requestTimer = setTimeout(function() {
    xmlhttp[VCurr-1].abort();
    // Handle timeout situation, e.g. Retry or inform user.
  }, 400);
  xmlhttp[VCurr-1].send();
}

function send_mission_toVehicle(mission_input, vehicle_id){
  var mission_str = mission_input.toText();
  console.log("Sending mission to vehicle="+vehicle_id+"\n"+mission_str);
  //split lines by end_line char and remove line starting with # (comments) or empty lines
  var mission_str_array=mission_str.split('\r\n');
  for (var i=mission_str_array.length-1; i>=0; i--) {
    if (mission_str_array[i].replace(/ /g,'').indexOf("#")===0 || mission_str_array[i].replace(/ /g,'').length===0) {
        mission_str_array.splice(i, 1);
    }
  }
  // merge the previous array with EOL as horizontal tab %09. after tests, ended up using %09%09 because it worked
  mission_str=mission_str_array.join('%09%09');
  xmlhttp[VCurr-1].message = '\nError: Sending Mission! Try again!';
  if(VehiclesData[VCurr-1].SystemState){ //ROS
    xmlhttp[VCurr-1].open("GET",VehicleServer+"RSET%20"+VehiclesData[VCurr-1].name+"/addons/Mission_String%20std_msgs/String%20{data: \""+mission_str+"\"}",true); 
  }
  var requestTimer = setTimeout(function() {
    xmlhttp[VCurr-1].abort();
    // Handle timeout situation, e.g. Retry or inform user.
  }, 400);
  xmlhttp[VCurr-1].send();
}
