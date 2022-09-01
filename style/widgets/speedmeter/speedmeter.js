var speed = 0, speed_ref= 2; //41-342
function speedmeter_update(speed_in, speed_in_ref){
    // Limits 48deg to 342
    var meter_to_knot = 0.514444;
    if(speed_in==undefined){
      speed += 0.1; 
      speed_ref += 0.1; 
    }else{
      speed =speed_in;
      speed_ref =speed_in_ref;
    }
    
    var knotspeed = speed*meter_to_knot;
    var knotspeed_ref = speed_ref*meter_to_knot;
    
    if(knotspeed>=5) knotspeed =5;
    if(knotspeed_ref>=5) knotspeed_ref =5;
    
    var pointer = document.getElementById("speedmeter_pointer");
    var angle_pointer =(knotspeed*(342-41)/5+41)*Math.PI/180;
    //console.log("knot_speed "+knotspeed+" angle_pointer "+angle_pointer*180/Math.PI);
    var cosd = Math.round(Math.cos(angle_pointer)*100)/100; sind=Math.round(Math.sin(angle_pointer)*100)/100;
    xval = -17*sind*1.0;
    yval = 17*cosd*1.0;
    //cosd = Math.round(Math.cos(knotspeed+Math.PI)*100)/100; sind=Math.round(Math.sin(knotspeed+Math.PI)*100)/100;
    pointer.style['-webkit-transform']      ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style.MozTransform               ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['OTransform']          ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['msTransform']         ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer.style['transform']                ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')'; 


    var pointer_ref = document.getElementById("speedmeter_pointer_ref");
    angle_pointer =(knotspeed_ref*(342-41)/5+41)*Math.PI/180;
    //console.log("angle_pointer "+angle_pointer);
    var cosd = Math.round(Math.cos(angle_pointer)*100)/100; sind=Math.round(Math.sin(angle_pointer)*100)/100;
    xval = -17*sind*1.0;
    yval = 17*cosd*1.0;
    //cosd = Math.round(Math.cos(knotspeed_ref+Math.PI)*100)/100; sind=Math.round(Math.sin(knotspeed_ref+Math.PI)*100)/100;
    pointer_ref.style['-webkit-transform']      ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style.MozTransform               ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['OTransform']          ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['msTransform']         ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';
    pointer_ref.style['transform']                ='matrix('+cosd+','+sind+','+(-sind)+','+cosd+','+xval+','+yval+')';

    document.getElementById("speedmeter_value").innerHTML = (knotspeed).toFixed(1);
    document.getElementById("speedmeter_value_ref").innerHTML = (knotspeed_ref).toFixed(1);
}