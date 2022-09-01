var heading = 0, heading_ref= Math.PI/2;
function compass_update(heading_in, heading_ref_in){
    if(heading_in==undefined){
      heading += 4*Math.PI/180; 
      heading_ref += 2*Math.PI/180; 
    }else{
      heading = heading_in;
      heading_ref = heading_ref_in;
    }
    
    if(heading>=2*Math.PI) heading =0;
    if(heading_ref>=2*Math.PI) heading_ref =0;
    var pointer = document.getElementById("compass_pointer");
    var cosd = Math.round(Math.cos(heading)*100)/100; sind=Math.round(Math.sin(heading)*100)/100;
    xval = 50*sind*1.0;
    yval = -50*cosd*1.0;
    cosd = Math.round(Math.cos(heading+Math.PI)*100)/100; sind=Math.round(Math.sin(heading+Math.PI)*100)/100;
    pointer.style['-webkit-transform']      ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style.MozTransform               ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['OTransform']          ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['msTransform']         ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['transform']                ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')'; 


    var pointer_ref = document.getElementById("compass_pointer_ref");
    var cosd = Math.round(Math.cos(heading_ref)*100)/100; sind=Math.round(Math.sin(heading_ref)*100)/100;
    xval = 50*sind*1.0;
    yval = -50*cosd*1.0;
    cosd = Math.round(Math.cos(heading_ref+Math.PI)*100)/100; sind=Math.round(Math.sin(heading_ref+Math.PI)*100)/100;
    pointer_ref.style['-webkit-transform']      ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style.MozTransform               ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['OTransform']          ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['msTransform']         ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['transform']                ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';

    document.getElementById("compass_value").innerHTML = (heading*180/Math.PI).toFixed(0)+"&deg;";
    document.getElementById("compass_value_ref").innerHTML = (heading_ref*180/Math.PI).toFixed(0)+"&deg;";
}
