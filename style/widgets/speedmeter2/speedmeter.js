var speed = 0.00, speed_ref=0.0;
function speedmeter_update(speed_in, speed_ref_in){
    if(speed_in==undefined){
      speed += 0.01; 
      speed_ref += 0.02;
      if(speed>1){ speed=0; }
      if(speed_ref>1){ speed_ref=0; }
    }else{
      speed = speed_in;
      speed_ref = speed_ref_in;
    }
    console
    var speedmeter_pointer = document.getElementById("speedmeter_pointer");
    var speedmeter_pointer_ref = document.getElementById("speedmeter_pointer_ref");
    speedmeter_pointer.style['bottom'] =(speed*100).toFixed(0)+'%';
    speedmeter_pointer_ref.style['bottom'] =(speed_ref*100).toFixed(0)+'%';

    document.getElementById("speedmeter_value").innerHTML = "speed "+speed.toFixed(1)+"m/s";
    document.getElementById("speedmeter_value_ref").innerHTML = "ref "+speed_ref.toFixed(1  )+"m/s";
}
