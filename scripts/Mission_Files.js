function missionObj(){
	this.formation = [];
	this.mission = [];
	this.mission_id = "default";
	this.standard_mission_flag = false;
	this.standard_mission_text = "";
	this.utmzone = "";
}
missionObj.prototype.constructor=missionObj;

var mission=new missionObj();
var missions_to_be_displayed = new Array();
//missions_to_be_displayed.push(mission); // first element will always point to mission
//mission = new Object();
//mission.formation=[];

var LTP_origin;
var end_line='\r\n';
var default_speed = 0.3;
missionObj.prototype.parseSection = function(inTxt, vehicle){
	var var_elements = inTxt.getElementsByTagName("VAR");
	var xs, ys,xc,yc,xe,ye,dir,radius;
	for(var j=0;j<var_elements.length;j++){
		var fieldname = var_elements[j].getElementsByTagName("KEY")[0].textContent;
		var fieldvalue = var_elements[j].getElementsByTagName("DOUBLE")[0].textContent;
		if(fieldname == "seq") seq = parseFloat(fieldvalue);
		if(fieldname == "xrefpoint") this.xrefpoint = parseFloat(fieldvalue);
		if(fieldname == "yrefpoint") this.yrefpoint = parseFloat(fieldvalue);
		if(fieldname == "xs") xs = parseFloat(fieldvalue);
		if(fieldname == "ys") ys = parseFloat(fieldvalue);
		if(fieldname == "xc") xc = parseFloat(fieldvalue);
		if(fieldname == "yc") yc = parseFloat(fieldvalue);
		if(fieldname == "xe") xe = parseFloat(fieldvalue);
		if(fieldname == "ye") ye = parseFloat(fieldvalue);
		if(fieldname == "direction") dir = parseFloat(fieldvalue);
		if(fieldname == "R0") radius = parseFloat(fieldvalue);
	}
	
	// Different from previous section?
	if(!this.seq_old || this.seq_old!=seq){
		if(	this.mission == undefined) this.mission = [];
		clear_mission_vehicle(vehicle+1);
		this.version = 5;	
		this.utmzone =  "29S";
		this.seq_old = seq;
		var aux_section;
		if(xc!=-1 || yc!=-1)
			aux_section =new Arc([xs,ys,xc,yc,xe,ye,default_speed,dir, radius, vehicle+1]);
		else
			aux_section =new Line([xs,ys,xe,ye,default_speed,vehicle+1]);
		this.mission.push(aux_section);
		return true;
	}
	return false;
}
// Parse Mission File
missionObj.prototype.parseTxt = function(inTxt){
	var lines = inTxt.split("\n");
	this.mission = [];
	flag_ref=false;
	this.version = 0;
	var refpoints = false;
	for ( var index=0; index<lines.length; index++){

		if(lines[index].charAt(0)=='#' || lines[index].strip().length===0){  //Discard Commented Lines
			continue;
		}
		lines[index] = lines[index].strip();
		if(this.version==0){ //See if the version is compatible
			if((parseInt(lines[index])==3)){	
				this.version = parseInt(lines[index]);
				this.mission = [];
				this.formation = [];
			}else if((parseInt(lines[index])==5)){	//CADDY
				this.version = parseInt(lines[index]);
				this.mission = [];
				this.formation = [];
				latlon_origin_parsed =false;
			}else{
				alert("Version "+ parseInt(lines[index]) + " not supported\n");
				return "";
			}
		}else{
			if(!refpoints){ //Read Reference Points
				// Caddy mission
				if(this.version==5 && !latlon_origin_parsed){
					// getting latlon origin
					var lat_lon = lines[index].split(" ").map(parseFloat);
					utmzone=temp_utmzone(lat_lon[0], lat_lon[1])+"S";
					var utm_aux = "+proj=utm +zone="+utmzone;
					var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
					var aux = proj4(wgs84, utm_aux, [lat_lon[1], lat_lon[0]]);
					LTP_origin={latlon: lat_lon, utm: [aux[0], aux[1], utmzone]};
					latlon_origin_parsed = true;
					continue;
				}else if(this.version==5){
					// getting translation point
					this.xrefpoint = LTP_origin.utm[0] + parseFloat(lines[index].split(" ")[0]);
					this.yrefpoint = LTP_origin.utm[1] + parseFloat(lines[index].split(" ")[1]);
					this.utmzone =  LTP_origin.utm[2];
					refpoints = true;
					continue;
				}

				this.xrefpoint = parseFloat(lines[index].split(" ")[0]);
				this.yrefpoint = parseFloat(lines[index].split(" ")[1]);
				this.utmzone =  lines[index].split(" ")[2];
				refpoints = true;
			}else{
				if(lines[index].split(" ")[0] == "FORMATION"){
					this.formation = lines[index].split(" ").slice(1);
					if(this.formation[this.formation.length-1].length==0) this.formation.pop();
					// Convert from String to float
					for(d in this.formation)
						this.formation[d] = parseFloat(this.formation[d]);
					if(this.formation.length % 3 != 0){
						alert("Error in the Formation specification [id1 x1 y1 id2 x2 y2...]\n");
						return "";
					}
				}else if(lines[index].split(" ")[0] == "LINE"){
					var props=lines[index].split(" ").slice(1);
					if(props[props.length-1].length==0) props.pop();
					if (props.length<6) props.push(-1); // default vid is -1
					this.mission.push( new Line(props));
				}else if(lines[index].split(" ")[0] == "ARC"){
					var props=lines[index].split(" ").slice(1);
					if(props[props.length-1].length==0) props.pop();
					if (props.length<10) props.push(-1); // default vid is -1
					this.mission.push( new Arc(props));
				}else if(lines[index].split(" ")[0] == "POINT"){
					var props=lines[index].split(" ").slice(1);
					if(props[props.length-1].length==0) props.pop();
					if (props.length<7) props.push(-1); // default vid is -1
					this.mission.push( new WayPointM(props));
				}
			}
		}
	}
};

// Print the Mission Variable to Text
missionObj.prototype.toText = function(){
	if(this.mission == undefined || this.mission== [] || mission_len(this.mission)==0) return '#undefined mission';
	tareMission(mission.mission);
	if(this.version === undefined){
		this.version=3;
	}
	if(mission_length(this.mission) === undefined) return '#undefined mission';
	if(this.xrefpoint === undefined || this.yrefpoint === undefined) return '#undefined refpoint';
	var text = "";
	if(this.version==5){
		text = "#Version" + end_line + this.version + end_line 
		text += "# Origin point" + end_line + LTP_origin.latlon[0].toFixed(5)+' '+LTP_origin.latlon[1].toFixed(5) + end_line;
		text += "# Translation point" + end_line + "0.0 0.0" + end_line;
		tareMissionMorph(this.mission);
	}else
		text = "#Version" + end_line + this.version + end_line + "#Xrefpoint Yrefpoint UTM Zone" + end_line +
		+ this.xrefpoint.toFixed(3) + ' ' + this.yrefpoint.toFixed(3) + ' '+this.utmzone+end_line;
	if(this.formation != undefined && this.formation.length!=0 ){
		text+=end_line+"FORMATION ";
		text+=this.formation.join(' ');
		// for(var i=0;i<this.formation_coord.length;i++){
			// if(!isNaN(this.formation_coord[i][0]*this.formation_coord[i][1]) ){
				// text+=' '+(i+1).toString()+' '+this.formation_coord[i].join(' ');
				// update_list(formation_vehicles,i+1);
			// }
		// }
	}
	text+=end_line+"# LINE xInit yInit xEnd yEnd velocity <nVehicle> <gamma> <user data>"+end_line;
	text+="# ARC xInit yInit xCenter yCenter xEnd yEnd velocity adirection radius <nVehicle> <gamma> <user data>"+end_line;
	text+="# POINT xInit yInit radius velocity heading time <nVehicle> <gamma> <user data>"+end_line;
	text+="# DEPTH depth time <nVehicle> <gamma> <user data>"+end_line;
	text+="# ALT altitude time <nVehicle> <gamma> <user data>";
	
	var vehicle=0, vehicle_old=0, seg;
	for(var i=0; i<mission_length(this.mission);i++){
		seg=this.mission[i];
		vehicle=seg.getVehicle();
		//if(vehicle==-1 || (vehicle != -1 && !mission.Rigid_Formation_Flag) ){
		if( this.formation.length==0 || vehicle==-1 || (vehicle != -1 && !mission.Rigid_Formation_Flag) ){
			if(vehicle!=vehicle_old){
				text+=end_line+end_line+"# Mission from vehicle "+vehicle;
			}
			text+=seg.toString();
		}
		vehicle_old=vehicle;
		
	}
	return text;
};

function norm_line(mission_line){
	return compute_eucl_dist( [mission_line[0],mission_line[1]] , [mission_line[2],mission_line[3]] );
}

function valid_mission_type(file){
	var valid_file_types=['text/plain', 'text/xml', 'image/vnd.dxf'];
	var known_extensions=['txt', 'scxml', 'dxf', 'kml'];
	var ok_extension = false;
	for (var i=0; i< known_extensions.length; i++){
		if(file.name.endsWith(known_extensions[i])) ok_extension = true;
	}
	var valid = valid_file_types.indexOf(file.type) > -1 || ok_extension;
	if(!valid){
		alert(file.name + " is not a valid text file.\nOnly filetypes: " + valid_file_types.join(', ') +"; or extensions: " + known_extensions.join(', ') +". Instead type is ["+file.type+"]");
	}
	return valid;
}

function parsePoints_to_display(inTxt)
{	
    console.log("Loading points to console");
	var lines = inTxt.split("\n");
	for (var index=0; index<lines.length; index++)
	{
        //Discard Commented Lines
        if(lines[index].charAt(0)=='#' || lines[index].strip().length===0)
            continue;
        var fields = lines[index].split(" ");
        if(fields[0] == "POINT")
            DPoints_green.push({'x': parseFloat(fields[1]),'y': parseFloat(fields[2]), 'color':color_palette['red900']});
	}
    draw(-1,-1,-1,-1);

}


// Callback for a new File
function readBlob(evt) {
	var file =evt.target.files[0];
	if (!file) {
		alert('cannot open file');
		return;
	} else if (!valid_mission_type(file)) {
		return;
	}

	var reader = new FileReader();
	// If we use onloadend, we need to check the readyState.
	reader.onloadend = function(ev) {
	  if (ev.target.readyState == FileReader.DONE) { // DONE == 2
	  	var inTxt = ev.target.result;
		if(MISSION_DESIGN){
			destroy_mission_planning();
	    }
		if(file.name.endsWith('.kml')){
			var tNode = document.createTextNode(inTxt);
			var xml_obj = new DOMParser().parseFromString(tNode.nodeValue, "text/xml");
			parseKML(xml_obj);
		} else if(file.name.endsWith('.scxml')){
			var tNode = document.createTextNode(inTxt);
			var xml_obj = new DOMParser().parseFromString(tNode.nodeValue, "text/xml");
			parseTxtMorph(xml_obj);
		} else if(file.name.endsWith('.txt')){
			var mission_loaded=new missionObj();
			mission_loaded.parseTxt(inTxt);
			mission_loaded.mission_id = Date.now()+file.name;
			missions_to_be_displayed.push(mission_loaded);
		} else if(file.name.endsWith('.ptxt')){
			parsePoints_to_display(inTxt);
		} else if(file.name.endsWith('.dxf')){
			var mission_loaded=new missionObj();
			mission_loaded.parseDXF(inTxt);
			mission_loaded.mission_id = Date.now()+file.name;
			missions_to_be_displayed.push(mission_loaded);
		}
		Plot_Mission();
		draw(-2,-2,-2,-2);
		if(MISSION_DESIGN){
		    init_mission_planning();
		}
		// To load the same filename
		var mission_input_id = document.getElementById("Mission_File_UP");
		var parent_input = mission_input_id.parentElement;
		parent_input.removeChild(mission_input_id);
		var new_mission_input = document.createElement("input");
		new_mission_input.setAttribute("id", "Mission_File_UP"); 
		new_mission_input.setAttribute("type", "file"); 
		new_mission_input.addEventListener('change', readBlob, false);
		parent_input.appendChild(new_mission_input);
		console.log("destroy_element");
		//return true;
	  }
	};
	reader.readAsBinaryString(file);
}


function openFile (textToEncode, contentType) {
    // For window.btoa (base64) polyfills, see 
    // https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills
    var encodedText = window.btoa(textToEncode);
    var dataURL = 'data:' + contentType + ';base64,' + encodedText;
    return dataURL; // To open in a new tab/window
}
// Fill with zeros
function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

function setHREF(){
	//saveData(mission.toText(), "mission.txt");
	A=document.getElementById('save_mission_link');
	str = mission.toText();
	txt = openFile(str, 'text/plain');
	A.href = txt;

	var temp = new Date()
	var dateStr = padStr(temp.getFullYear()) +
                  padStr(1 + temp.getMonth()) +
                  padStr(temp.getDate()) + "_" +
                  padStr(temp.getHours()) +
                  padStr(temp.getMinutes())

	A.download =dateStr+".txt";
	//a.click()
}

function setHREF_morph(){
	A=document.getElementById('save_mission_link_morph');
	str = mission.toTextMorph();
	txt = openFile(str, 'text/plain');
	A.href = txt;

	var temp = new Date()
	var dateStr = padStr(temp.getFullYear()) +
                  padStr(1 + temp.getMonth()) +
                  padStr(temp.getDate()) + "_" +
                  padStr(temp.getHours()) +
                  padStr(temp.getMinutes())

	A.download =dateStr+"_morph.txt";
}

missionObj.prototype.toTextMorph = function(){
	if(this.mission == undefined || this.mission== [] || mission_len(this.mission)==0){
		return '<!--undefined mission-->';
	}
	
	// TODO: improve this
	if(!LTP_origin){
		//LTP_origin = btnToGeographic_OnClick(this.xrefpoint, this.yrefpoint, this.utmzone.slice(0,2), true); /*this.utmzone[2]=='S'*/ //TODO solve this hemisphere thing
		/*
    
    var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    console.log(proj4(utm,wgs84,[539884, 4942158]));
		proj4(utm,wgs84,[539884, 4942158])
		 */
		var utm = "+proj=utm +zone="+this.utmzone.slice(0,2);
    	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
		var aux = proj4(utm, wgs84, [this.xrefpoint, this.yrefpoint]);
		LTP_origin={latlon: [aux[1], aux[0]], utm: [this.xrefpoint, this.yrefpoint, this.utmzone]};
	}
	tareMissionMorph(this.mission);
	var utm = "+proj=utm +zone="+this.utmzone.slice(0,2);
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
	var aux = proj4(utm, wgs84, [this.xrefpoint, this.yrefpoint]);
	LTP_origin={latlon: [aux[1], aux[0]], utm: [this.xrefpoint, this.yrefpoint, this.utmzone]};
	var seg, j=0;
	var text="<data id=\"origin\" expr=\""+LTP_origin.latlon[0].toFixed(7)+','+LTP_origin.latlon[1].toFixed(7)+"\"/>"+end_line;

	var flag_line_prev = false;
	for(var i=0; i<mission_length(this.mission); i++){
		seg=this.mission[i];
		text+=seg.toStringMorph(j,flag_line_prev);
		if(seg.type === "line"){
			if(!flag_line_prev){
				j+=1;
			}
			flag_line_prev = true;
		}else{
			flag_line_prev = false;
		}
		j+=1;
	}
	return text;
};

function parseMorphLine(line){
	return line.split("expr=\"")[1].split("\"/>")[0].split(",").map(function(item) { return parseFloat(item)});
}

function parseMorphLineXML(elem){
/*	try{
		elem.split(",").map(function(item) { return parseFloat(item)});
	}catch(e) {
		console.log("ninja");
	}*/
	return elem.getAttribute("expr").split(",").map(function(item) { return parseFloat(item)});
}

function mean_pt(p1,p2){
	return [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
}

function starts_with(str, prefix){
	if(str.slice(0, prefix.length) === prefix){
		return true;
	}
	return false;
}

/**
 * Function added temporaly to compute UTM zone 
 * @param  {double} Lat  latitude
 * @param  {double} Long longitude
 * @return {double}      UTM zone number
 */
function temp_utmzone(Lat,Long){
  var ZoneNumber;
  // (int)
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;

  //Make sure the longitude 180.00 is in Zone 60
  if (Long === 180) {
    ZoneNumber = 60;
  }

  // Special zone for Norway
  if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
    ZoneNumber = 32;
  }

  // Special zones for Svalbard
  if (Lat >= 72.0 && Lat < 84.0) {
    if (Long >= 0.0 && Long < 9.0) {
      ZoneNumber = 31;
    }
    else if (Long >= 9.0 && Long < 21.0) {
      ZoneNumber = 33;
    }
    else if (Long >= 21.0 && Long < 33.0) {
      ZoneNumber = 35;
    }
    else if (Long >= 33.0 && Long < 42.0) {
      ZoneNumber = 37;
    }
  }
  return ZoneNumber;
}

function parseTxtMorph(xml_obj){
	temp_mission=[];
	var utmzone;
	var elems=xml_obj.getElementsByTagName("scxml")[0].getElementsByTagName("datamodel")[0].getElementsByTagName("data");
	for(var i=0; i<elems.length; i++){
		var elem=elems[i];
		if(elem.attributes.getNamedItem("id").value === "origin"){
			var lat_lon=elem.getAttribute("expr").split(",").map(function(item) { return parseFloat(item)});
			utmzone=temp_utmzone(lat_lon[0], lat_lon[1])+"S";
			console.log("TODO: CHECK THIS parseTxtMorph utmzone");
			var utm_aux = "+proj=utm +zone="+utmzone;
			var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
			var aux = proj4(wgs84, utm_aux, [lat_lon[1], lat_lon[0]]);
			LTP_origin={latlon: lat_lon, utm: [aux[0], aux[1], utmzone]};
			break;
		}
	}
	var mp_travel= xml_obj.getElementById("mp_travel_03");
	var mission_elems=mp_travel.children[0].children;
	var flag_prev_point=false;
	for(var i=0; i<mission_elems.length-1; i++){
		if(starts_with(mission_elems[i].getAttribute("id"), "point") && flag_prev_point){
			var row = parseMorphLineXML(mission_elems[i-1]);
			var row_next = parseMorphLineXML(mission_elems[i]);
			temp_mission.push(new Line([row[0], row[1], row_next[0], row_next[1], default_speed, -1]));
			flag_prev_point = true;
		}else{
			if(starts_with(mission_elems[i].getAttribute("id"), "point")){
				flag_prev_point = true;
				continue;
			}else{
				flag_prev_point = false;
			}
		}
		if(starts_with(mission_elems[i].getAttribute("id"), "arc") ){
			var row= parseMorphLineXML(mission_elems[i]);
			var pi=[row[0],row[1]];
			var pe=[row[6],row[7]];
			var pm=[row[3],row[4]];
			var out=arc_from_3_points(pi,pm,pe);
			temp_mission.push(new Arc([pi[0],pi[1],out.xc,out.yc,pe[0],pe[1],default_speed,out.k,out.R,-1]));
			flag_prev_point = false;
		}
	}
	mission.mission=temp_mission;
	// LTP Origin
	mission.xrefpoint=LTP_origin.utm[0];
	mission.yrefpoint=LTP_origin.utm[1];
	mission.utmzone=LTP_origin.utm[2];
	mission.version=3;
	return;
}

/*
 * function to tare the mission (put the initial point to be the origin)
 */
function tareMissionMorph(mission_to_work_on){
	mission_to_work_on=typeof mission_to_work_on=== "undefined" ? get_mission_mission() : mission_to_work_on;
	if(mission_length(mission_to_work_on)<=0){
		return undefined;
	}
	var pts=mission_to_work_on[0].getPoints(); // get initial point
	/*var ref=sumPoints([mission.xrefpoint,mission.yrefpoint],pi);*/
	/*var ref=[LTP_origin.utm[0]-mission.xrefpoint-pts[0][0],LTP_origin.utm[1]-mission.yrefpoint-pts[0][1]];*/
	var ref=[mission.xrefpoint-LTP_origin.utm[0],mission.yrefpoint-LTP_origin.utm[1]];

	//pi=[-pi[0],-pi[1]];
	for(var i=0; i<mission_length(mission_to_work_on);i++){
		pts=mission_to_work_on[i].getPoints();
		pts=sumPointToMat(pts,ref);
		mission_to_work_on[i].setPoints(pts);
	}
	mission.xrefpoint=LTP_origin.utm[0];
	mission.yrefpoint=LTP_origin.utm[1];
}

function parseKML(xml_obj){
	var coordinates=xml_obj.getElementsByTagName('LineString')[0].getElementsByTagName('coordinates')[0];
	var pts = coordinates.innerHTML.split(' ').map(function(item) { return item.split(',').map(function(item){return parseFloat(item);}) });
	var pts_utm = [], temp_mission = [];
	for(var i=0; i<pts.length; i++){
		console.log("TODO: CHECK THIS parseKML utmzone");
		var lat_lon = [pts[i][1], pts[i][0], pts[i][2]]; // KML specs are longitude, latitude, altitude
		var utmzone=temp_utmzone(lat_lon[0], lat_lon[1])+"S";
		var utm_aux = "+proj=utm +zone="+utmzone;
		var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
		var aux = proj4(wgs84, utm_aux, [lat_lon[1], lat_lon[0]]);
		pts_utm.push([aux[0], aux[1]]);
		if(i!=0){
			temp_mission.push(new Line([pts_utm[i-1][0], pts_utm[i-1][1], pts_utm[i][0], pts_utm[i][1], default_speed, -1]));
		}
	}
	mission.mission=temp_mission;
	// LTP Origin
	mission.xrefpoint=0;
	mission.yrefpoint=0;
	mission.utmzone=utmzone;
	mission.version=3;
}

function CenterFor2Points(pi, pe, ang){
    var aperture = Math.atan(ang)*4;
    var d = compute_eucl_dist(pi,pe);
    var r = Math.abs(d/(2*Math.sin(aperture/2)));
    var m = [(pi[0] + pe[0]) /2, (pi[1] + pe[1]) /2];
    var k, sign_center;
    if(aperture<0){
        k=-1;
        if(Math.abs(aperture)<Math.PI){
            sign_center = 1;
        }else{
            sign_center = -1;
        }
    }else{
        k=1;
        if(Math.abs(aperture)>Math.PI){
            sign_center = 1;
        }else{
            sign_center = -1;
        }
    }
    var xc = m[0] - sign_center*Math.sqrt(r*r-(d/2)*(d/2))*(pi[1]-pe[1])/d;
    var yc = m[1] - sign_center*Math.sqrt(r*r-(d/2)*(d/2))*(pe[0]-pi[0])/d;
    return [xc, yc, k, r];
}
missionObj.prototype.parseDXF = function (inTxt){
	var lines = inTxt.split("\n");
	this.mission = [];
	var swap_xy = false;
	var entities_init = false;
	var inVertex = false, inArc = false, inArcPrev = false, line_old='', old_seg_dict=-1, seg_dict;
    var xs, ys, xe, ye, aux_section;
    if(this.xrefpoint === undefined){
		this.xrefpoint = Scenarios[Scenario-1].refpoint[0]+Scenarios[Scenario-1].width/2;
		this.yrefpoint = Scenarios[Scenario-1].refpoint[1]+Scenarios[Scenario-1].height/2;
		this.utmzone=Scenarios[Scenario-1].utm_zone;
		this.version = 3;
	}
	for ( var index=0; index<lines.length; index++){
		var line = lines[index].strip();
		if(!entities_init){
			if(starts_with(line,'ENTITIES')) entities_init = true;
			continue;
		}
		if(starts_with(line, 'ENDSEC')){
			break;
		}
		if(!inVertex){
			if(starts_with(line,'VERTEX')){
				inVertex = true;
			}
		}else{
			inArc = false;
			var inHeader = true;
			seg_dict = {'10': -1, '20': -1, '30': -1, '42': -1};
            while(line != '0' || inHeader){
                if(inHeader && line =='0'){
                    inHeader = false;
                }
                if(!inHeader){
                    if(line in seg_dict){
                    	line_old = line;
                    	index++; line = lines[index].strip();
                        seg_dict[line_old] = line;
                    }
                    if(starts_with(line_old, '42') ){
                        inArc = true;
                    }
                }
                line_old = line;
				index++; line = lines[index].strip();
			}
			seg_dict = [ seg_dict['10'], seg_dict['20'], seg_dict['30'], seg_dict['42'] ];
			if(old_seg_dict !=-1){
                xs = parseFloat(old_seg_dict[0]);
                ys = parseFloat(old_seg_dict[1]);
                xe = parseFloat(seg_dict[0]);
                ye = parseFloat(seg_dict[1]);
                if(!inArcPrev){
                	if(!swap_xy){
                		aux_section = new Line([xs,ys,xe,ye,default_speed,-1]);
                	}else{
                		aux_section = new Line([ys,xs,ye,xe,default_speed,-1]);
                	}
                }else{
                	var output = CenterFor2Points([xs, ys], [xe, ye], parseFloat(old_seg_dict[3]));
                	var xc = output[0]; yc= output[1]; k=output[2]; r=output[3];
                	if(!swap_xy){
                		aux_section = new Arc([xs,ys,xc,yc,xe,ye,default_speed, k, r, -1]);
                	}else{
                		k=-k;
                		aux_section = new Arc([ys,xs,yc,xc,ye,xe,default_speed, k, r, -1]);
                	}
                }
                this.mission.push(aux_section);
			}
			old_seg_dict = clone(seg_dict);
            inVertex = false;
            inArcPrev = inArc;
		}
		line_old = line;
	}
};