function create_list_scenarios(){
  var $scenarios_list = $('#scenarios_list');
  var NUM_COLS=4;
  var row;
  for(var i=0; i<Scenarios.length;i++){
/*    if(i%NUM_COLS==0){
      var row_num=Math.floor(i/NUM_COLS);
      $scenarios_list.append("<div class='row' id='row"+row_num+"'></div>");
      $row = $('#row'+row_num);
    }*/

    var cur_sc=Scenarios[i];

/*    var $div_element = jQuery('<div/>',{
      class: "col s12 m7 l3 center"
    }).appendTo($row);*/

    var $a_element = jQuery('<a/>', {
      class: "valign",
      onclick: 'scenario_img_click('+(i+1)+');$("#modal_scenario").closeModal();',
      title: cur_sc.name,
      style: 'opacity: 0.75; -webkit-transition: all 0.3s linear; -moz-transition: all 0.3s linear; transition: all 0.3s linear;'
    }).appendTo($scenarios_list);

    $a_element.hover(function(){
      $(this).css('opacity',' 1.0');
    },function(){
      $(this).css('opacity',' 0.75');
    });

    var $img_element = jQuery('<img/>',{
      class: 'responsive-img',
      src: cur_sc.path_thumb,
      style: 'border: 6px solid #e1d9ec;',
      width: 150,
      height: 150,
    }).appendTo($a_element);
  }
}

function scenario_img_click(id){     
  //console.log("ID = " +id);
  chScen((id+10).toString(), 1);
  //window.top.postMessage('CHSCEN='+(id+10).toString(), '*');
  //restore_select();
}