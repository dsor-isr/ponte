var value = 0.90;
function bar_update(value_in){
    if(value_in==undefined){
      value += 0.01;
      ;
    }
    if(value>1) value -=1;
    var bar_progress = document.getElementById("bar_HCM");
    bar_progress.innerHTML =(value*100).toFixed(0);
    bar_progress.style['height'] =((1-value)*100).toFixed(0)+'%';
    bar_progress.style['line-height'] =((1-value)*80*2-12).toFixed(0)+'px';

}