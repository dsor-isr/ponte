var value = 0.00, charging=false;
function battery_update(value_in, charging_in){
    if(value_in==undefined){
      value += 0.03;
    }else{
      value = value_in;
      charging = charging_in;
    }
    
/*    if(value>1){
      value =0;
      if(!charging)
        charging = true;
      else
        charging = false;
    } */
    var battery_progress = document.getElementById("battery_progress");
    //battery_progress.innerHTML =(value*100).toFixed(0);
    battery_progress.style['height'] =(value*100).toFixed(0)+'%';
    //battery_progress.style['line-height'] =((1-value)*80*2-12).toFixed(0)+'px';
    
    var battery_icon = document.getElementById("battery_icon");
    if(charging){
      battery_icon.src = "style/widgets/battery/battery_icon_plugged.png";
    }else{
      battery_icon.src = "style/widgets/battery/battery_icon.png";
    }
}