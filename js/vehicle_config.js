function chVehicle(id){
  var path;
  if(VehiclesData[id].img_path.indexOf('data:')===0){
    path=VehiclesData[id].img_path;
  }else{
    if(VehiclesData[id].img_path.indexOf('file:///')===-1 && VehiclesData[id].img_path.indexOf('../')===-1){
      path="../"+VehiclesData[id].img_path;
    }else{
      path=VehiclesData[id].img_path;
      console.log("error changing vehicle");
    }
  }
  document.getElementById('vehicle_image').src=path;
  document.getElementById('toggleActive').checked=VehiclesData[id].active;
  document.getElementById('vehicle_name').value=VehiclesData[id].name;
  document.getElementById('txtIP').value=VehiclesData[id].ip;
  document.getElementById('XJ').value=VehiclesData[id].wp1[0];
  document.getElementById('YJ').value=VehiclesData[id].wp1[1];
  document.getElementById('XK').value=VehiclesData[id].wp2[0];
  document.getElementById('YK').value=VehiclesData[id].wp2[1];
  document.getElementById('Postopic').innerHTML=VehiclesData[id].state_topic_name;
  document.getElementById('pathcolor').value=VehiclesData[id].color;
  document.getElementById('vehiclesource').selectedIndex=VehiclesData[id].state_topic_source;
  document.getElementById('Vehicle'+id).checked=true;
  document.getElementById('toggleTrailType').checked = VehiclesData[id].trail_points;
  document.getElementById('toggleIcon').checked = VehiclesData[id].disable_icon;
  document.getElementById('toggleDisplay').checked = VehiclesData[id].display_all;
  if(!VehiclesData[id].mds_panel) VehiclesData[id].mds_panel = false; // new stuff has to be added for the cache
  document.getElementById('toggleMDSPanel').checked = VehiclesData[id].mds_panel;
  VehiclesID=id;
  onChangeValues(null);
}

function LoadValues(scratch){
  if(scratch){
    if(window.localStorage.ROS_VARS)
      ROS_VARS = JSON.parse(window.localStorage.ROS_VARS);
    if(window.localStorage.ROS_SPARE_VARS)
      ROS_SPARE_VARS = JSON.parse(window.localStorage.ROS_SPARE_VARS);
    if(window.localStorage.VehiclesData)
      VehiclesData = JSON.parse(window.localStorage.VehiclesData);
      console.log(VehiclesData[0].ip);
  }
  
  var $vehicle_select = $('#vehicle_select');
  $vehicle_select.empty();
  var vehiclesource = document.getElementById('vehiclesource');
  var $vehiclesource=$('#vehiclesource');
  console.log('vehicles_configs.html Loading current values');
  
  // Delete all options
  $vehiclesource.empty();


  // Load settings
  for(var i=0; i<VehiclesData.length; i++){
    var $input = jQuery('<input/>', {
      onclick: 'chVehicle('+i+');',
      value: VehiclesData[i].name,
      name: 'vehicle',
      type: 'radio',
      id: 'Vehicle'+i,
      class: 'col l2'
    }).appendTo($vehicle_select);
    var $label = jQuery('<label/>', {
      html: VehiclesData[i].name,
      for: 'Vehicle'+i
    }).appendTo($vehicle_select);
    
    var option_child = document.createElement('option');
    vehiclesource.appendChild(option_child);
    option_child.setAttribute('value',VehiclesData[i].name);
    option_child.setAttribute('onchange','onChangeValues(this);');
    option_child.innerHTML =VehiclesData[i].name;
  }
  
  // Delete all options
  var varstoask = document.getElementById('varstoask');
  while (varstoask.firstChild) {
    varstoask.removeChild(varstoask.firstChild);
  }
  for(var i=0;i<ROS_VARS.length;i++){
    var option_child = document.createElement('option');
    varstoask.appendChild(option_child);
    option_child.setAttribute('value',ROS_VARS[i]);
    option_child.innerHTML = ROS_VARS[i];
  }
  
  // Delete all options
  var morevars = document.getElementById('morevars');
  while (morevars.firstChild) {
    morevars.removeChild(morevars.firstChild);
  }
  for(var i=0;i<ROS_SPARE_VARS.length;i++){
    var option_child = document.createElement('option');
    morevars.appendChild(option_child);
    option_child.setAttribute('value',ROS_SPARE_VARS[i]);
    option_child.innerHTML = ROS_SPARE_VARS[i];
  }

  if (window.localStorage.display_flags) {
    display_flags = JSON.parse(window.localStorage.display_flags);
  }else{
    display_flags = {IMU: false, Thrusters: false, Battery: false, GPS: false, Pressure: false, RAW: false, MATLAB: false, Modems: false};
  }
  for(var key in display_flags){
    var togglebutton = document.getElementById('toggle'+key);
    if(!togglebutton) continue;
    togglebutton.checked=display_flags[key];
  }
  
  chVehicle(0);
}

function openFile (textToEncode, contentType) {
  // For window.btoa (base64) polyfills, see 
  // https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills
  var encodedText = window.btoa(textToEncode);
  var dataURL = 'data:' + contentType + ';base64,' + encodedText;
  return dataURL; // To open in a new tab/window
}

function export_Configs(){
  A=document.createElement('a');
  str = JSON.stringify(window.localStorage)
  txt = openFile(str, 'text/plain');
  A.href = txt;
  filename = prompt("Configurations file name", "console_conf");
  if(filename==null)
    return;
  A.download =filename+".conf";
  A.click();
}

function SelectList(){
  var varstoaskElement=document.getElementById('varstoask');
  var postopicElement=document.getElementById('Postopic');
  var selec = 0; var topic="";
  for(var x=varstoaskElement.length-1;x>=0;x--){
    if(varstoaskElement.children[x].selected){
      selec++;
      topic = varstoaskElement.children[x].innerHTML;
    }
  }
  if(selec==1){
    postopicElement.innerHTML = topic;
    valueschanged = true;
    onChangeValues(null);
  }else{
    alert('Select only 1 from the list above');
  }
}

function CloseWindow(apply){
    window.top.postMessage('CHVCONF='+apply, '*');
}

function onChangeValues(obj){
  //console.log('vehicles_configs.html Changed values');
  VehiclesData[VehiclesID].img_path = document.getElementById('vehicle_image').src;
  VehiclesData[VehiclesID].active = document.getElementById('toggleActive').checked;
  VehiclesData[VehiclesID].name = document.getElementById('vehicle_name').value;
  VehiclesData[VehiclesID].ip = document.getElementById('txtIP').value;
  VehiclesData[VehiclesID].wp1[0] = document.getElementById('XJ').value;
  VehiclesData[VehiclesID].wp1[1] = document.getElementById('YJ').value;
  VehiclesData[VehiclesID].wp2[0] =document.getElementById('XK').value;
  VehiclesData[VehiclesID].wp2[1] = document.getElementById('YK').value;
  VehiclesData[VehiclesID].state_topic_name = document.getElementById('Postopic').innerHTML;
  VehiclesData[VehiclesID].color = document.getElementById('pathcolor').value;
  VehiclesData[VehiclesID].state_topic_source=document.getElementById('vehiclesource').selectedIndex;
  VehiclesData[VehiclesID].trail_points = document.getElementById('toggleTrailType').checked;
  VehiclesData[VehiclesID].disable_icon = document.getElementById('toggleIcon').checked;
  VehiclesData[VehiclesID].mds_panel = document.getElementById('toggleMDSPanel').checked;
  VehiclesData[VehiclesID].display_all = document.getElementById('toggleDisplay').checked;
  valueschanged = true;
}

function addforaskvars(){
  var morevarsElement=document.getElementById('morevars');
  var varstoaskElement=document.getElementById('varstoask');

  for(var x=morevarsElement.length-1;x>=0;x--){
    //console.log('Not selected ' + morevarsElement.children[x].innerHTML);
    if(morevarsElement.children[x].selected){
      varstoaskElement.appendChild(morevarsElement.children[x]);
      //console.log('Selected ' + morevarsElement.children[x].innerHTML);
      valueschanged = true;
    }
  }
}

function delfromaskvars(){
 var morevarsElement=document.getElementById('morevars');
 var varstoaskElement=document.getElementById('varstoask');
 
 for(var x=varstoaskElement.length-1;x>=0;x--){
  //console.log('Not selected ' + morevarsElement.children[x].innerHTML);
  if(varstoaskElement.children[x].selected){
    morevarsElement.appendChild(varstoaskElement.children[x]);
    //console.log('Selected ' + morevarsElement.children[x].innerHTML);
    valueschanged = true;
  }
 }
}

function addNewVar(){
  var topicElement=document.getElementById('newtopic');
  var varstoaskElement=document.getElementById('varstoask');
  var child = document.createElement("option");

  for(var x=varstoaskElement.length-1;x>=0;x--){
    if(varstoaskElement.children[x].innerHTML == topicElement.value){
      alert('variable is already being asked');
      return;
    }
  }
  child.innerHTML = topicElement.value;
  child.selected =true;
  varstoaskElement.appendChild(child);
  valueschanged = true;
}

function DetailedInfo(name, obj){
  display_flags[name]=obj.checked;
}

function SaveValues(){
  if(valueschanged){
    var varstoaskElement=document.getElementById('varstoask');
    ROS_VARS=[];
    for(var x=0;x<varstoaskElement.length;x++){
      ROS_VARS.push(varstoaskElement.children[x].innerHTML);
    }
    
    var morevarsElement=document.getElementById('morevars');
    ROS_SPARE_VARS=[];
    for(var x=0;x<morevarsElement.length;x++){
      ROS_SPARE_VARS.push(morevarsElement.children[x].innerHTML);
    }
    window.localStorage['ROS_VARS']=JSON.stringify(ROS_VARS);
    window.localStorage['ROS_SPARE_VARS']=JSON.stringify(ROS_SPARE_VARS);
    window.localStorage['VehiclesData']=JSON.stringify(VehiclesData);
    window.localStorage['display_flags']=JSON.stringify(display_flags);
    console.log('PIRUÇAS');
    console.log(VehiclesData[0].ip);
    onChangeValues(null);
  }
}

String.prototype.strip = function() 
{
    return String(this).replace(/^\s+|\s+$/g, '');
};

function readFile(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    var file = input.files[0];
    
    if(file.name.endsWith('dxf'))
    {
      reader.onloadend = function (e) {
        console.log("Points to return " + parseDXFpts(e.target.result));
      }
      reader.readAsBinaryString(file);
    }
    else
    {
      reader.onload = function (e) {
        document.getElementById('vehicle_image').setAttribute('src' ,e.target.result);
        onChangeValues(null);
      }
     reader.readAsDataURL(input.files[0]);
    }

  }
}

function starts_with(str, prefix){
  if(str.slice(0, prefix.length) === prefix){
    return true;
  }
  return false;
}

function parseDXFpts(inTxt){
  var lines = inTxt.split("\n");
  var PointsToReturn = [];
  var swap_xy = false;
  var entities_init = false;
  var inVertex = false, inArc = false,  line_old='', old_seg_dict=-1, seg_dict;
  var xs, ys, xe, ye, aux_section;
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
    }
    else
    {
      inArc = false;
      var inHeader = true;
      seg_dict = {'10': -1, '20': -1, '30': -1, '42': -1};
      while(line != '0' || inHeader)
      {
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
        xe = parseFloat(seg_dict[0]);
        ye = parseFloat(seg_dict[1]);
        if(!swap_xy)
        {
          PointsToReturn.x.push(xe);
          PointsToReturn.y.push(ye);
        }
        else
        {
          PointsToReturn.y.push(xe);
          PointsToReturn.x.push(ye);
        }
      }
      old_seg_dict = clone(seg_dict);
      inVertex = false;
    }
    line_old = line;
  }
  return PointsToReturn;
};

function vectorFile(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      console.log("Points to return " + parseDXFpts(e.target.result));
    }

    reader.readAsDataURL(input.files[0]);
  }
}


function AddVehicle(){
  VehiclesData.push(new Vehicle_Config('newVehicle'+VehiclesData.length, '../style/images/ASV_delfim.png', '#FFA500', false, 'newVehicle'+VehiclesData.length, [-1,-1], [-1,-1], 'State', VehiclesData.length));
  addVehicle(VehiclesData.length-1);
  LoadValues(false);
}

function DeleteVehicle(){
  VehiclesData.splice(VehiclesID,1);
  for(var i=0;i<VehiclesData.length;i++){
    if(VehiclesData[i].state_topic_source==VehiclesID){
      VehiclesData[i].state_topic_source = i;
    }else if(VehiclesData[i].state_topic_source>VehiclesID){
      VehiclesData[i].state_topic_source = VehiclesData[i].state_topic_source-1;
    }
  }
  LoadValues(false);
}

function import_Configs(inTxt){
  var A=JSON.parse(inTxt);
  for(var i in A){
    window.localStorage[i]=A[i];
  }
  location.reload();
  //window.opener.location.reload();
  //parent.location.reload();
  //window.parent.location.href = window.parent.location.href;
  //alert("The configurations file was loaded, reboot console to apply changes!");
}

// Callback for a new File
function readBlob(evt) {
  var file =evt.target.files[0];
  if (!file) {
    return;
  } else if (!file.type.match('text/plain') && !file.type.match('text/xml') && !file.type.match('')) {
    alert(file.name + " is not a valid text file.");
  } else {
    var reader = new FileReader();
    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(ev) {
      if (ev.target.readyState == FileReader.DONE) { // DONE == 2
        import_Configs(ev.target.result);
      }
    };
    reader.readAsBinaryString(file);
  }
}

/*var $sections = $('section');  // all content sections
var $navs = $('nav > ul > li');  // all nav sections

var topsArray = $sections.map(function() {
    return $(this).position().top - 300;  // make array of the tops of content
}).get();                                 //   sections, with some padding to
                                          //   change the class a little sooner
var len = topsArray.length;  // quantity of total sections
var currentIndex = 0;        // current section selected

var getCurrent = function( top ) {   // take the current top position, and see which
    for( var i = 0; i < len; i++ ) {   // index should be displayed
        if( top > topsArray[i] && topsArray[i+1] && top < topsArray[i+1] ) {
            return i;
        }
    }
};

   // on scroll,  call the getCurrent() function above, and see if we are in the
   //    current displayed section. If not, add the "selected" class to the
   //    current nav, and remove it from the previous "selected" nav
$(document).scroll(function(e) {
    var scrollTop = $(this).scrollTop();
    var checkIndex = getCurrent( scrollTop );
    if( checkIndex !== currentIndex ) {
        currentIndex = checkIndex;
        $navs.eq( currentIndex ).addClass("active").siblings(".active").removeClass("active");
    }
});*/