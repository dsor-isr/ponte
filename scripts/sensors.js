var bathy_min_value = 0;
var bathy_max_value = 0;

function parseBathyFile(inTxt, sensor_array){
	var lines = inTxt.split("\n");
	var point;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
	var found = false;
	console.log("[Importing File] "+lines.length+" of lines to process")
	//for (var index=0; index<(lines.length-10); index++){
    //var increment_display = parseInt(lines.length/50);
	var increment_display = parseInt(lines.length/50);

	if(sensor_array==undefined) 
		sensor_array = new Array();

    bathy_min_value = 999999999;
    bathy_max_value = 0;
	for (var index=0; index<lines.length; index++){
		point = lines[index].split("\t");
		if((index%increment_display)==0)
			console.log(((index/lines.length)*100).toFixed(0) + "\% processed");
		/*var utmzone=temp_utmzone(parseFloat(point[0]), parseFloat(point[1]))+"S";
		var utm_aux = "+proj=utm +zone="+utmzone;
		var point_utm = proj4(wgs84, utm_aux, parseFloat(point[1]), parseFloat(point[0]));*/

		//sensor_array.push({'x': point_utm[0], 'y': point_utm[1], 'z': parseFloat(point[2])});
		
		// If the file is not well written
		if(point.length<3)
			continue;

        // Discard points higher than surface
        //if(-parseFloat(point[2])<0)
        //    continue;

	    //newObject= {'x': Math.round(parseFloat(point[0])), 'y': Math.round(parseFloat(point[1])), 'z': parseFloat(point[2])}
	    newObject= {'x': Math.round(parseFloat(point[0])/bathy_grid_size)*bathy_grid_size, 'y': Math.round(parseFloat(point[1])/bathy_grid_size)*bathy_grid_size, 'z': parseFloat(point[2])}

        bathy_min_value = Math.min(bathy_min_value, newObject.z);
        bathy_max_value = Math.max(bathy_max_value, newObject.z);

	    // Find if exists already
	    for(var i=sensor_array.length-1; i>0;i--){
	        // Check if exists already
	        if(newObject.x == sensor_array[i].x && newObject.y == sensor_array[i].y){
	            sensor_array[i].z = newObject.z;
	            found = true;
	            break;
	        }
	    }
	    if(found) {found=false; continue;}
	    sensor_array.push(newObject);
	}
	console.log("Bathymetry file loaded" + sensor_array.length + "points");
	return sensor_array;
}

// Convert points to Text
function pointsToTxt(sensor_array){
	var utm = "+proj=utm +zone="+Scenarios[Scenario-1].utm_zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
	var text = "";
	for (var index=0; index<sensor_array.length; index++){
		//var point_latlon = proj4(utm, wgs84, [sensor_array[index].x, sensor_array[index].y]);
        //text +=  point_latlon[1] + "," +point_latlon[0]  +","+ sensor_array[index].z + "\n";
		text +=  sensor_array[index].x + "," +sensor_array[index].y  +","+ sensor_array[index].z + "\n";
	}

	return text;
}

// Fill with zeros
function padStrD(i) {
   return (i < 10) ? "0" + i : "" + i;
}

// Convert points to Text
function downloadPoints(sensor_array){
  A=document.createElement('a');
  str = pointsToTxt(sensor_array);
  txt = openFile(str, 'text/plain');
  A.href = txt;
  var temp = new Date();
  var dateStr = padStrD(temp.getFullYear()) +
                 padStrD(1 + temp.getMonth()) +
                 padStrD(temp.getDate()) + "_" +
                 padStrD(temp.getHours()) +
                 padStrD(temp.getMinutes())

  A.download =dateStr+"_Points.csv";
  A.click();
}



// Create Link for file upload
function createlink(){
	var A=document.createElement('input');
	A.setAttribute("id", "sensor_file_up"); 
	A.setAttribute("type", "file"); 
	A.addEventListener('change', readSensorFile, false);
	document.body.appendChild(A);
	A.click();
}

// Callback for a new Bathy File
var BathyFile_points = undefined;
function readSensorFile(evt) {
	var file =evt.target.files[0];
	if (!file) {
		//alert("Failed to load file");
		;
	} else if (!file.type.match('text/plain') && !file.type.match('text/xml') && !file.type.match('')) {
		alert(file.name + " is not a valid text file.\nOnly .txt files.");
	} else {
		var reader = new FileReader();
		// If we use onloadend, we need to check the readyState.
		reader.onloadend = function(ev) {
		  if (ev.target.readyState == FileReader.DONE) { // DONE == 2
		  	BathyFile_points = undefined;
		  	BathyFile_points = parseBathyFile(ev.target.result, BathyFile_points); // Process Bathy File
	  		// Redraw everything
			draw(-2,-2,-2,-2);
		  }
		};
		
		reader.readAsBinaryString(file);
	}
}

// Draw Bathy Points
function  drawBathy(sensor_array, canvas_id){
	var canvas = document.getElementById(canvas_id);
	var ctf = canvas.getContext('2d');

    
    ctf.lineWidth = 1;
    ctf.setLineDash([0]);
    ctf.lineDashOffset=Math.round(0);

    for(var p=0; p<sensor_array.length;p++){
/*        if((sensor_array[p].z)==50) // Max range
            continue*/
        value = (sensor_array[p].z - bathy_min_value)/(bathy_max_value-bathy_min_value); // between 0 and 1
        //value = p/sensor_array.length;
        // Saturating hue to 2/3 -> Blue
        rectangles(sensor_array[p].x,sensor_array[p].y,hsvToRgb(value*2/3,1,1), true, hsvToRgb(value*2/3,1,1), canvas_id, bathy_grid_size/canvas_pixelstometer*10);
    }

    // Horizontal
    var legend_size=200;
    var offset_h = 30, offset_w=110;
    var grd=ctf.createLinearGradient(canvas.width-legend_size-offset_w, 0,canvas.width-offset_w, 0);
    var linelength =5;
    for(var p=1; p>0;p-=0.1){
        grd.addColorStop(1-p,hsvToRgb(p*2/3,1,1));
    }
    ctf.fillStyle=grd;
    ctf.strokeStyle = color_palette['white'];
    ctf.lineWidth = 2;
    ctf.fillRect(canvas.width-legend_size-offset_w, canvas.height-offset_h,legend_size, 20);
    ctf.strokeRect(canvas.width-legend_size-offset_w, canvas.height-offset_h,legend_size, 20);
    
    // Scale
    ctf.fillStyle=color_palette['white'];
    for(var j = 0; j<=1; j+=1/3)
    {
        ctf.strokeStyle = color_palette['white'];
        ctf.beginPath();
        ctf.moveTo(canvas.width-legend_size-offset_w+j*legend_size, canvas.height-offset_h);
        ctf.lineTo(canvas.width-legend_size-offset_w+j*legend_size, canvas.height-offset_h-linelength);
        ctf.lineWidth = 2;
        /*if(j % (2*gap) == 0) {
        }else if(j % gap == 0) {
            ctf.lineTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h-linelength);
            ctf.lineWidth = 1;
            ctf.font = "8pt Calibri,Geneva,Arial";
            ctf.textAlign = 'center';
            ctf.strokeText((gap*2)+"m", j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h+10);
        } else {
            ctf.lineTo(j*gridPixelSize+canvas.width-(2*Math.round(gap*gridPixelSize))-offset_w, canvas.height-offset_h-linelength);
            ctf.lineWidth = 0.5;
        }*/
        ctf.closePath();
        ctf.stroke();
        ctf.textAlign = 'center';
        ctf.lineWidth = 2;
        ctf.font = "10pt Calibri,Geneva,Arial";
        ctf.strokeStyle = color_palette['black'];
        ctf.strokeText(((1-j)*(bathy_max_value-bathy_min_value)+bathy_min_value).toFixed(1), canvas.width-legend_size-offset_w+j*legend_size, canvas.height-offset_h-linelength*2);
        ctf.lineWidth = 1;
        ctf.fillText(((1-j)*(bathy_max_value-bathy_min_value)+bathy_min_value).toFixed(1), canvas.width-legend_size-offset_w+j*legend_size, canvas.height-offset_h-linelength*2);

    }

}