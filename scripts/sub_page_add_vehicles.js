    var valueschanged = false;
    var VehiclesData = new Array();
    var ROS_VARS = new Array();
    var ROS_SPARE_VARS = new Array();
    var VehiclesID=0;
    var display_flags;
    var VCurr=1;
    var VehicleServer;
 
  /*
    Mission to 
  */
  var disabled_color_class="blue-grey lighten-3";
  function activateVehicle(ind_button, ind_vehicle){
    $.each($('#div_vehicle_selection a'), function( index, value ) {
      if(index==ind_button){
        $(value).removeClass(disabled_color_class);
        $(value).addClass('cyan lighten-1');
        VCurr=parseInt(ind_vehicle)+1;
        newIP();
      }else{
        $(value).addClass(disabled_color_class);
        $(value).removeClass('cyan lighten-1');
      }

    });

  }

  function VehicleActionsInit(scratch){
    if(scratch){
      if(localStorage.ROS_VARS)
        ROS_VARS = JSON.parse(localStorage.ROS_VARS);
      if(localStorage.ROS_SPARE_VARS)
        ROS_SPARE_VARS = JSON.parse(localStorage.ROS_SPARE_VARS);
      if(localStorage.VehiclesData)
        VehiclesData = JSON.parse(localStorage.VehiclesData);
    }
    $('#div_vehicle_selection').empty();
    var flag_first=true;
    var index=0;
    for(var i=0; i<VehiclesData.length; i++){
      if(!VehiclesData[i].active) continue;
      $('#div_vehicle_selection').append('<a class="waves-effect waves-light btn '+disabled_color_class+'" onclick="activateVehicle($(this).attr(\'ind_button\'),$(this).attr(\'ind_vehicle\'));" ind_button="'+index+'" ind_vehicle="'+i+'">'+VehiclesData[i].name+'</a>');
      index++;
    }
    if(scratch){
      $('.dropdown-button').dropdown();
    }
    activateVehicle(0, $($('#div_vehicle_selection').children()[0]).attr('ind_vehicle'));
  }