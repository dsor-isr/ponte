/*
 *  Mission_Definition.js
 *  console
 *
 *  Created by Miguel Ribeiro & Jorge Ribeiro on Apr 07, 2014.
 *  Copyright 2014 DSOR/ISR/IST. All rights reserved.
 *
 */

//line_indexes={xi:0, yi:1, xe:2, ye:3, veloc:4, vid:5, gamma:6 };
//arc_indexes={xi:0, yi:1, xc:2, yc:3, xe:4, ye:5, veloc:6, k:7, R:8, vid:9, gamma:10 };

//if(typeof(Line.prototype.strip) === "undefined"){
    //Line.prototype.strip = function() 
    //{
        //return Line(this).replace(/^\s+|\s+$/g, '');
    //};
//}

//TODO: check mission existence
// get Xs and get Ys to plot; arrows; end point
// see how it is when moving just one point from the segment
// ter lista de pts

function sumPoints(pt1, pt2){
	return [pt1[0]+pt2[0],pt1[1]+pt2[1]];
}

function clone_mission(obj){
	var new_mission=[];
	for(var i=0;i<obj.length;i++){
		new_mission.push( obj[i].clone() );
	}
	return new_mission;
}

function full_clone(obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = new obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)){ copy[attr] = obj[attr];}
    }
    return copy;
}

function sumPointToMat(mat,point){
	for(var i=0; i<mat.length; i++){
		mat[i]=sumPoints(mat[i],point);
	}
	return mat;
}

/*
 * function to tare the mission (put the initial point to be the origin)
 */
function tareMission(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	if(mission_length(mission_to_work_on)<=0){
		return undefined;
	}
	pts=mission_to_work_on[0].getPoints(); // get initial point
	pi=pts[0];
	ref=sumPoints([mission.xrefpoint,mission.yrefpoint],pi);
	mission.xrefpoint=ref[0];
	mission.yrefpoint=ref[1];
	
	pi=[-pi[0],-pi[1]];
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		pts=sumPointToMat(pts,pi);
		mission_to_work_on[i].setPoints(pts);
	}
}

function create_test_mission(){ //TODO: remove this
	k=-1;
	width=100;
	height=100;
	mission.mission=new Array();
	mission.mission.push(new Line(0,0,0,height,.3,-1));
	mission.mission.push(new Arc(0,height,width/2,height,width,height,.3,k,width/2,-1));
	mission.mission.push(new Line(width,height,width,0,.3,-1));
	mission.mission.push(new Arc(width,0,width/2,0,0,0,.3,k,width/2,-1));
}

function mission_length(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	if(mission_to_work_on===undefined) return 0;
	return mission_to_work_on.length;
}

function computeCentroid(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	var centroid=new Array(0,0);
	var counter=0;
	
	pts=mission_to_work_on[0].getPoints();
	centroid = sumPoints(centroid, pts[0]);
	counter +=1;
	for(var i=0;i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		if(pts.length>2){
			centroid = sumPoints(centroid, pts[2]);
		}else{
			centroid = sumPoints(centroid, pts[1]);
		}
		counter +=1;
		/*for(var j=0;j<pts.length;j++){
			centroid=sumPoints(centroid,pts[j]);
			counter+=1;
		}*/
	}
	return centroid=[centroid[0]/counter,centroid[1]/counter]; //NaN when mission is not defined on purpose
}

function surrounding_arc(pts){
	var radius_arc = Math.sqrt(Math.pow(pts[0][0]-pts[1][0],2)+Math.pow(pts[0][1]-pts[1][1],2))
	//var arc_init = Math.atan2(pts[1][1]-pts[0][1], pts[1][0]-pts[0][0]);
	//var arc_end = Math.atan2(pts[1][1]-pts[2][1], pts[1][0]-pts[2][0]);
	var angles_to_check = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
	var outpts =[];
	for(var i=0; i<angles_to_check.length; i++){
//		outpts = [cos(angles_to_check[i])*radius_arc, sin(angles_to_check[i])*radius_arc];
		outpts.push([pts[1][0]+Math.cos(angles_to_check[i])*radius_arc, pts[1][1]+Math.sin(angles_to_check[i])*radius_arc]);
	}
	return outpts;
}



// Surrounding rectangle for the mission
// returns center point and dimensions
function surrounding_rect(full_mission){
	var mission_to_work_on = full_mission.mission;
	if(mission_to_work_on == undefined || mission_to_work_on== [] || mission_len(mission_to_work_on)==0) return '#undefined mission';
	
	var centroid=new Array(0,0);
	var limx = new Array(Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY);
	var limy = new Array(Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY);
	var counter=0;
	
	pts=mission_to_work_on[0].getPoints();
	centroid = sumPoints(centroid, pts[0]);
	counter +=1;
	for(var i=0;i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();

		if(mission_to_work_on[i].type == 'line'){
			limx[0] = Math.min(limx[0], pts[0][0], pts[1][0]);
			limy[0] = Math.min(limy[0], pts[0][1], pts[1][1]);
			limx[1] = Math.max(limx[1], pts[0][0], pts[1][0]);
			limy[1] = Math.max(limy[1], pts[0][1], pts[1][1]);

			centroid = sumPoints(centroid, pts[1]);
		}else if(mission_to_work_on[i].type == 'arc'){
			arcpts = surrounding_arc(pts);
			for (var j=0; j<arcpts.length; j++){
				limx[0] = Math.min(limx[0],arcpts[j][0]);
				limy[0] = Math.min(limy[0],arcpts[j][1]);
				limx[1] = Math.max(limx[1],arcpts[j][0]);
				limy[1] = Math.max(limy[1],arcpts[j][1]);
			}
			/*centroid = sumPoints(centroid, pts[2]);
			limx[0] = Math.min(limx[0], pts[2][0]);
			limy[0] = Math.min(limy[0], pts[2][1]);
			limx[1] = Math.max(limx[1], pts[2][0]);
			limy[1] = Math.max(limy[1], pts[2][1]);
			var radius_arc = Math.sqrt(Math.pow(pts[0][0]-pts[1][0],2)+Math.pow(pts[0][1]-pts[1][1],2))
			limx[0] = Math.min(limx[0], pts[1][0]-radius_arc);
			limy[0] = Math.min(limy[0], pts[1][1]-radius_arc);
			limx[1] = Math.max(limx[1], pts[1][0]+radius_arc);
			limy[1] = Math.max(limy[1], pts[1][1]+radius_arc);*/
		}
		counter +=1;
	}
	width = Math.abs(limx[1]-limx[0]);
	height = Math.abs(limy[1]-limy[0]);
	return [full_mission.xrefpoint+limx[0]+width/2, full_mission.yrefpoint+limy[0]+height/2, width, height];
}


function rotateMission(mission_to_work_on,angle, point){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	// Point to rotate
	if (point == undefined)
		centroid=computeCentroid(mission_to_work_on);
	else
		centroid=point;
	var R=rot_matrix_deg(angle);
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
		pts=matrix_multiplication(pts,R);
		pts=sumPointToMat(pts,centroid);
		mission_to_work_on[i].setPoints(pts);
	}
}

// Scale mission
function scaleMission(mission_to_work_on,xscale, yscale, point){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	// Point to rotate
	if (point == undefined)
		centroid=computeCentroid(mission_to_work_on);
	else
		centroid=point;
	var scalematrix=[[xscale,0],[0,yscale]];;
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
		pts=matrix_multiplication(pts,scalematrix);
		pts=sumPointToMat(pts,[centroid[0],centroid[1]]);
		mission_to_work_on[i].setPoints(pts);
	}
}
function center_mission(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	centroid=computeCentroid(mission_to_work_on);
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		pts=sumPointToMat(pts,[-centroid[0],-centroid[1]]);
		mission_to_work_on[i].setPoints(pts);
	}
}

function IncSegmentPoint(index_seg,index_pt,dx,dy,first_time,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	var first_time=typeof first_time=== "undefined" ? true : first_time;
	var seg=mission_changing[index_seg];
	var num_pts=seg.getPoints().length;
	if(index_pt==-1) index_pt=num_pts-1;
	// Inc this segment
	var aux_pts=seg.getPoints();
	aux_pts[index_pt][0]+=dx;
	aux_pts[index_pt][1]+=dy;	
	seg.setPoints(aux_pts);	
	// Inc previous seg pt
	var vehicle = seg.getVehicle();
	if(first_time){
		if(index_pt==0 && index_seg>0 && mission_changing[index_seg-1].getVehicle()==vehicle){
			IncSegmentPoint(index_seg-1,-1,dx,dy,false,mission_changing);
		}
		if(index_pt==(num_pts-1) && index_seg<(mission_length(mission_changing)-1)){
			IncSegmentPoint(index_seg+1,0,dx,dy,false,mission_changing);
		}
	}
}


function SegmentPoint_Global(index_seg,index_pt,x,y,first_time,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	var first_time=typeof first_time=== "undefined" ? true : first_time;
	var seg=mission_changing[index_seg];
	var last_pt = 0;
	if(seg.type == "arc") last_pt = 2;
	if(seg.type == "line") last_pt = 1;
	if(index_pt==-1 ) index_pt=last_pt;
	// Inc this segment
	var aux_pts=seg.getPoints();
	aux_pts[index_pt][0]=x;
	aux_pts[index_pt][1]=y;	
	seg.setPoints(aux_pts);	
	// Inc previous seg pt
	var vehicle = seg.getVehicle();
	if(first_time){
		if(index_pt==0 && index_seg>0 && mission_changing[index_seg-1].getVehicle()==vehicle){
			SegmentPoint_Global(index_seg-1,-1,x,y,false,mission_changing);
		}
		if(index_pt==last_pt && index_seg<(mission_length(mission_changing)-1)){
			SegmentPoint_Global(index_seg+1,0,x,y,false,mission_changing);
		}
	}
}
/* 
 * UpdateCurveParameters
 * 
 * After changing initial point of the segment "index", there's a need to update the curve parameters.
 * This function updates the curve parameters of the segment "index" and the previous segment.
*/
function UpdateCurveParameters(index_seg,first_time,this_mission){
	var mission_changing=typeof this_mission=== "undefined" ? get_mission_mission() : this_mission;
	var first_time=typeof first_time=== "undefined" ? true : first_time;
	var seg=mission_changing[index_seg];
	var num_pts=seg.getPoints().length;
	//if(index_pt==-1) index_pt=num_pts-1;
	
	// Update curve parameters for this segment
/*	if(seg.type=== "arc"){
		var aux_pts=mission_changing[index_seg].getPoints();
		var curve_params=ComputeCurveParams_PI(aux_pts[0],aux_pts[num_pts-1]);

		var tan_ln1, tan_ln2;
		if(mission_changing[index_seg-1].type==="line"){ 
			var pt_line=mission_changing[index_seg-1].getPoints();
			tan_ln1 = Math.atan2(pt_line[1][1]-pt_line[0][1], pt_line[1][0]-pt_line[0][0]);
		}
		if(mission_changing[index_seg+1].type==="line"){ 
			var pt_line=mission_changing[index_seg+1].getPoints();
			tan_ln2 = Math.atan2(pt_line[1][1]-pt_line[0][1], pt_line[1][0]-pt_line[0][0]);
		}*/
		//console.log("tan1 "+ tan_ln1 + "tan2 " + tan_ln2);
		//aux_pts[1]= //redo this
		//mission_changing[index_seg].setPoints(aux_pts);
	if(seg.type=== "arc"){
		var aux_pts=mission_changing[index_seg].getPoints();
		var curve_params=ComputeCurveParams_PI(aux_pts[0],aux_pts[2], aux_pts[3]);
		SetSegmentCurveParams(index_seg,curve_params, mission_changing);
	}
	// Update curve parameters for the previous and next segment
	var vehicle = mission_changing[index_seg].getVehicle();
	if(first_time){
		if(index_seg>0 && mission_changing[index_seg-1].getVehicle()==vehicle){
			UpdateCurveParameters(index_seg-1,false,mission_changing);
		}
		if(index_seg<(mission_length(mission_changing)-1)){
			UpdateCurveParameters(index_seg+1,false,mission_changing);
		}
	}
}

function FORMATION(formation,mission_ref){
	var miss_len=mission_length(mission.mission);
	if(miss_len===0){
		return;
	}
	var mission_all=[], aux_vid, new_vid;
	//TODO: clean only vehicles in formation?
	for(var i=0; i<mission.formation.length; i=i+3){
		new_vid = mission.formation[i];
		xform = mission.formation[i+1];
		yform = mission.formation[i+2];
		for(var index=0;index<miss_len;index++){
			aux_vid=mission_ref[index].getVehicle();
			if(aux_vid!=-1) continue;
			mission_all.push(mission_ref[index].transformWithFormation([xform, yform], new_vid));
		}
	}
	set_mission_mission(get_mission_mission().concat(mission_all));
}

function mission_w_formation(formation,mission_ref){
	var miss_len=mission_length(mission_ref);
	if(miss_len===0){
		return;
	}
	if(formation==undefined || formation.length==0)
		return full_clone(mission_ref);

	var mission_all=[], aux_vid, new_vid;
	//TODO: clean only vehicles in formation?
	for(var i=0; i<formation.length; i=i+3){
		new_vid = formation[i];
		xform = formation[i+1];
		yform = formation[i+2];
		for(var index=0;index<miss_len;index++){
			aux_vid=mission_ref[index].getVehicle();
			if(aux_vid!=-1) continue;
			mission_all.push(mission_ref[index].transformWithFormation([xform, yform], new_vid));
		}
	}
	return mission_all;
}

function Segment(params){
	this.type = undefined;
	this.dictionary={vid:0, veloc:0};
	var num_param=params.length;//Object.keys(this.dictionary).length;
	//TODO put this as private "var value = new Array"
	this.value= new Array(num_param); // TODO: check data;
	var val=0;
	for(var i=0; i<num_param; i++){
		val= parseFloat(params[i]);
		if(i<this.dictionary.gamma && isNaN(val)){
			this.value="not enough parameters";
			break;
		}else{
			if(i==this.dictionary.gamma && isNaN(val)){
				this.value[i]=this.length;
			}else{
				this.value[i]=val;
			}
		}
	}
	this.type='segment';
	this.getVelocity = function(){ return this.value[this.dictionary.veloc];};
	this.getVehicle = function(){ return this.value[this.dictionary.vid];};
	this.getValue = function(){ return this.value;}; // TODO: remove "this." when the variable is private
}

function Line(params){
	Segment.call(this,params); //Call parent constructor
	this.dictionary={xi:0, yi:1, xe:2, ye:3, veloc:4, vid:5, gamma:6 };
	var value=this.getValue();
	this.type='line';
	this.toString = function(){
		text="\r\nLINE ";
		seg=this;//seg=Line(this);
		for(var i=0;i<value.length;i++){
			if(i===this.dictionary.vid){
				text+=value[i].toFixed(0)+' ';
			}else if(i===this.dictionary.gamma && isNaN(value[i])){
				continue;
			}else{
				text+=value[i].toFixed(2)+' ';
			}
		}
		//gamma=seg.length //TODO
        return text;
    };
	this.toStringMorph = function(j, flag_line_prev){
		var text="";
		if(flag_line_prev) j-=1;
		if(!flag_line_prev){
			text+="<data id=\"point_"+(j).pad(3)+"\" expr=\"" + value[this.dictionary.xi].toFixed(2) + ", "  + value[this.dictionary.yi].toFixed(2) +  ", 0.0\" />\r\n";
		}
		text+="<data id=\"point_"+(j+1).pad(3)+"\" expr=\"" + value[this.dictionary.xe].toFixed(2) + ", "  + value[this.dictionary.ye].toFixed(2) +  ", 0.0\" />\r\n";
        return text;
    };
    this.length= function(){
		xi=value[this.dictionary.xi];
		yi=value[this.dictionary.yi];
		xe=value[this.dictionary.xe];
		ye=value[this.dictionary.ye];
        return compute_eucl_dist( [xi,yi] , [xe,ye] );
	};
	
	this.getPoints = function(){
		return [[value[this.dictionary.xi],value[this.dictionary.yi]],[value[this.dictionary.xe],value[this.dictionary.ye]]];
	};
	
	this.setPoints = function(pts){
		value[this.dictionary.xi]=pts[0][0];
		value[this.dictionary.yi]=pts[0][1];
		value[this.dictionary.xe]=pts[1][0];
		value[this.dictionary.ye]=pts[1][1];
	};
	
	this.draw = function(ctx, xref, yref){
		var xi=value[this.dictionary.xi]+xref;
		var yi=value[this.dictionary.yi]+yref;
		var xe=value[this.dictionary.xe]+xref;
		var ye=value[this.dictionary.ye]+yref;
		var aux_pt;
		aux_pt=getCanvasPos_pixel([xi,yi], true);
		//ctx.beginPath();
		ctx.moveTo(aux_pt[0],aux_pt[1]);
		aux_pt=getCanvasPos_pixel([xe,ye], true);
		ctx.lineCap = 'round';
		ctx.lineTo(aux_pt[0],aux_pt[1]);
		//ctx.closePath();
		//ctx.stroke();
	};
	
	this.transformWithFormation = function(formation,vid){
		var xi=value[this.dictionary.xi];
		var yi=value[this.dictionary.yi];
		var xe=value[this.dictionary.xe];
		var ye=value[this.dictionary.ye];
		var veloc = value[this.dictionary.veloc];
		var psi = Math.atan2(ye-yi,xe-xi);
		var xform = formation[0], yform = formation[1];
		xi = xi + xform*Math.cos(psi) -yform*Math.sin(psi);
		yi = yi + xform*Math.sin(psi) +yform*Math.cos(psi);
		xe = xe + xform*Math.cos(psi) -yform*Math.sin(psi);
		ye = ye + xform*Math.sin(psi) +yform*Math.cos(psi);
		return new Line([xi,yi,xe,ye,veloc,vid]);
	};
	
	this.clone = function(){
		return new Line(value.slice());
	};

	this.angle = function(){
		var xi=value[this.dictionary.xi];
		var yi=value[this.dictionary.yi];
		var xe=value[this.dictionary.xe];
		var ye=value[this.dictionary.ye];
		return Math.atan2(ye-yi,xe-xi);
	}
}
//Line.prototype=new Segment();
Line.prototype.constructor=Line;

function Arc(params){
	Segment.call(this,params); //Call parent constructor
	this.dictionary={xi:0, yi:1, xc:2, yc:3, xe:4, ye:5, veloc:6, k:7, R:8, vid:9, xarc:10, yarc: 11, gamma:12};

	var value=this.getValue();
	if(isNaN(value[this.dictionary.xarc]))
	{
		p_arc = point_in_arc([value[this.dictionary.xi],value[this.dictionary.yi]], 
			[value[this.dictionary.xc],value[this.dictionary.yc]], 
			[value[this.dictionary.xe],value[this.dictionary.ye]],
			value[this.dictionary.R],value[this.dictionary.k]);
		value[this.dictionary.xarc] = p_arc[0];
		value[this.dictionary.yarc] = p_arc[1];
	}

	this.type='arc';
	this.toString = function(){
		text="\r\nARC ";
		text+= value[this.dictionary.xi].toFixed(2) + ' ';
		text+= value[this.dictionary.yi].toFixed(2) + ' ';
		text+= value[this.dictionary.xc].toFixed(2) + ' ';
		text+= value[this.dictionary.yc].toFixed(2) + ' ';
		text+= value[this.dictionary.xe].toFixed(2) + ' ';
		text+= value[this.dictionary.ye].toFixed(2) + ' ';
		text+= value[this.dictionary.veloc].toFixed(2) + ' ';
		text+= value[this.dictionary.k].toFixed(0) + ' ';
		text+= value[this.dictionary.R].toFixed(2) + ' ';
		text+= value[this.dictionary.vid].toFixed(0) + ' ';
		//text+= value[this.dictionary.gamma].toFixed(2);
		/*for(var i=0;i<value.length;i++){
			if(i===this.dictionary.vid || i===this.dictionary.k){
				text+= value[i].toFixed(0)+' ';
			}else if(i===this.dictionary.gamma && isNaN(value[i])){
				continue;
			}else{
				text+=value[i].toFixed(2)+' ';
			}
		}*/
		//gamma+=seg.length //TODO
        return text;
    };
	this.toStringMorph = function(i){
		/* xc,yc,R,k */
		var pi=[value[this.dictionary.xi], value[this.dictionary.yi]];
		var pc=[value[this.dictionary.xc], value[this.dictionary.yc]];
		var pe=[value[this.dictionary.xe], value[this.dictionary.ye]];
		var R=value[this.dictionary.R], k=value[this.dictionary.k];
		var pm=point_in_arc(pi,pc,pe,R,k);
        return text="<data id=\"arc_"+i.pad(3)+"\" expr=\"" + pi[0].toFixed(2) + ", " + pi[1].toFixed(2) + ", 0.0, " +pm[0].toFixed(2) + ", " + pm[1].toFixed(2) + ", 0.0, " + pe[0].toFixed(2) +", " + pe[1].toFixed(2) + ", 0.0\" />\r\n";
    };
    this.length= function(){
		var xs=value[this.dictionary.xi];
		var ys=value[this.dictionary.yi];
		var xc=value[this.dictionary.xc];
		var yc=value[this.dictionary.yc];
		var xe=value[this.dictionary.xe];
		var ye=value[this.dictionary.ye];
		var k =value[this.dictionary.k];
		var R = compute_eucl_dist([xs,ys],[xc,yc]);
		var psis = Math.atan2(ys-yc,xs-xc) + k*Math.PI/2;
		var psie = Math.atan2(ye-yc,xe-xc) + k*Math.PI/2;
		var ang=(psis-psie);
		if(ang<0){ // TODO: CHECK THIS
			ang+=Math.PI*2;
		}
		//gamma=gamma+ang*value[this.R];
        return ang*R;
    };
	
	this.getPoints = function(){
		return [[value[this.dictionary.xi],value[this.dictionary.yi]],[value[this.dictionary.xc],value[this.dictionary.yc]],[value[this.dictionary.xe],value[this.dictionary.ye]],[value[this.dictionary.xarc],value[this.dictionary.yarc]]];
	};
	
	this.setPoints = function(pts){
		value[this.dictionary.xi]=pts[0][0];
		value[this.dictionary.yi]=pts[0][1];
		value[this.dictionary.xe]=pts[2][0];
		value[this.dictionary.ye]=pts[2][1];
		value[this.dictionary.xarc]=pts[3][0];
		value[this.dictionary.yarc]=pts[3][1];

		var arc = arc_from_3_points([pts[0][0], pts[0][1]], [pts[3][0], pts[3][1]], [pts[2][0], pts[2][1]]);
		value[this.dictionary.xc]=arc.xc;
		value[this.dictionary.yc]=arc.yc;
		value[this.dictionary.R] = arc.R;
		value[this.dictionary.k] = arc.k;
	};
	
	this.draw = function(ctx, xref, yref){
		var xi=value[this.dictionary.xi]+xref;
		var yi=value[this.dictionary.yi]+yref;
		var xe=value[this.dictionary.xe]+xref;
		var ye=value[this.dictionary.ye]+yref;
		var xc=value[this.dictionary.xc]+xref;
		var yc=value[this.dictionary.yc]+yref;
		var k= value[this.dictionary.k];
		
 		var aux_pt;
		aux_pt=getCanvasPos_pixel([xi,yi], true);
		xi=aux_pt[0], yi=aux_pt[1];
		aux_pt=getCanvasPos_pixel([xc,yc], true);
		xc=aux_pt[0], yc=aux_pt[1];
		aux_pt=getCanvasPos_pixel([xe,ye], true);
		xe=aux_pt[0], ye=aux_pt[1];

		ths = Math.atan2(yi-yc,xi-xc);
		the = Math.atan2(ye-yc,xe-xc);
		ctx.lineCap = 'round';
		//ctx.beginPath();
		ctx.arc(xc,yc, compute_eucl_dist([xc,yc],[xi,yi]),ths,the, k==1);
		ctx.moveTo(xe,ye);
		//ctx.stroke();
		//ctx.closePath();
	};
	
	this.transformWithFormation = function(formation,vid){
		var xi=value[this.dictionary.xi];
		var yi=value[this.dictionary.yi];
		var xe=value[this.dictionary.xe];
		var ye=value[this.dictionary.ye];
		var veloc=value[this.dictionary.veloc];
		var xc=value[this.dictionary.xc];
		var yc=value[this.dictionary.yc];
		var R0 =value[this.dictionary.R];
		var k=value[this.dictionary.k];
		var psis = Math.atan2(yi-yc,xi-xc) + k*Math.PI/2;
		var psie = Math.atan2(ye-yc,xe-xc) + k*Math.PI/2;
		var xform = formation[0], yform = formation[1];
		xi = xi + xform*Math.cos(psis) -yform*Math.sin(psis);
		yi = yi + xform*Math.sin(psis) +yform*Math.cos(psis);
		xe = xe + xform*Math.cos(psie) -yform*Math.sin(psie);
		ye = ye + xform*Math.sin(psie) +yform*Math.cos(psie);
		//R0 = sqrt((xs-xc)^2+(ys-yc)^2);
		veloc = veloc*(1 - k*yform/R0); //normalizing the velocity - the inner vehicle has lower velocity and the outter vehicle has higher velocity
		return new Arc([xi,yi,xc,yc,xe,ye,veloc,k,R0,vid]);
	};
	
	this.clone = function(){
		return new Arc(value.slice());
	};

	this.angleToCenter = function(){
		var xi=value[this.dictionary.xi];
		var yi=value[this.dictionary.yi];
		var xc=value[this.dictionary.xc];
		var yc=value[this.dictionary.yc];
		//return Math.atan2(ye-yi,xe-xi);
		return Math.atan2(yc-yi,xc-xi);
	}
}

function WayPointM(params){
	Segment.call(this,params); 	 	
	this.type = undefined;
	this.dictionary={x:0, y:1, vid:2};
	var num_param=params.length;//Object.keys(this.dictionary).length;
	//TODO put this as private "var value = new Array"
	this.value= new Array(num_param); // TODO: check data;
	this.value[this.dictionary.vid] = -1;
	var val=0;
	for(var i=0; i<num_param; i++){
		val= parseFloat(params[i]);
		this.value[i]=val;
	}
	this.type='waypoint';
	this.getValue = function(){ return this.value;}; // TODO: remove "this." when the variable is private
	this.toString = function(){
		text="\r\nPOINT ";
		/*"# POINT xInit yInit radius velocity heading time <nVehicle> <gamma> <user data>\r\n";*/
		for(var i=0;i<this.value.length;i++){
			text += this.value[i].toFixed(2)+' ';
		}
        return text;
    };

	this.draw = function(ctx, xref, yref){
		var x=this.value[this.dictionary.x]+xref;
		var y=this.value[this.dictionary.y]+yref;
		
 		var aux_pt;
		aux_pt=getCanvasPos_pixel([x,y], false);
		x=aux_pt[0], y=aux_pt[1];
		
		// draw transparent red circle
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI, false);
		ctx.stroke()
		ctx.fill();
		ctx.closePath();
		
	};

	this.getPoints = function(){
		return [[this.value[this.dictionary.x],this.value[this.dictionary.y]]];
	};

	this.setPoints = function(pts){
		this.value[this.dictionary.x]=pts[0][0];
		this.value[this.dictionary.y]=pts[0][1];
	};

	this.clone = function(){
		return new WayPointM(this.value.slice());
	};
    this.length= function(){
        return 0;
	};
}

Number.prototype.pad = function(size){
	if(this%1 !== 0) {
		alert('invalid number to pad');
		return;
	}
	var s = String(this);
	if(typeof(size)!=="number"){ size=2; }
	while(s.length < size){ s="0"+s;}
	return s;
}