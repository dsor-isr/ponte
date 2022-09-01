//if(VCurr!=-1){centerVehicle(VCurr-1); draw(-2,-2,-2,-2);}

var nav_button_Timer;
var section_by_section_button = false;

function nav_buttons_init()
{
  // bind mouse leave to div
  //$("#div_zoom_buttons").mouseleave( function() { nav_button_hide("div_zoom_buttons"); } );
  //$("#div_mission_program_buttons").mouseleave( function() { nav_button_hide("div_mission_program_buttons"); } );
  //$("#ButtonsBar").mouseleave( function() { nav_button_hide("div_zoom_buttons"); } );
  $('#div_zoom_buttons, #zoom_tools').mouseenter(function(){
    nav_update_divs();
    //$("#div_mission_program_buttons").show();
    nav_button_show("div_zoom_buttons");
  }).mouseleave(function(){
    //$("#div_mission_program_buttons").hide();
    nav_button_hide("div_zoom_buttons");
  });

  $('#div_mission_program_buttons, #mission').mouseenter(function(){
    nav_update_divs();
    //$("#div_mission_program_buttons").show();
    nav_button_show("div_mission_program_buttons");
  }).mouseleave(function(){
    //$("#div_mission_program_buttons").hide();
    nav_button_hide("div_mission_program_buttons");
  });

}

function nav_update_divs()
{
  // aling divs
  $("#div_zoom_buttons").css('top', nav_getOffset(document.getElementById("zoom_tools")).bottom);
  $("#div_zoom_buttons").css('left', nav_getOffset(document.getElementById("zoom_tools")).left);
  $("#div_mission_program_buttons").css('top', nav_getOffset(document.getElementById("mission")).bottom);
  $("#div_mission_program_buttons").css('left', nav_getOffset(document.getElementById("mission")).left);
  
  // deactivate follow vehicle zoom button
  if(VCurr<0 && center_on_Vehicle==-1 )
    $("#follow_vehicle").addClass("disabled")
  else
    $("#follow_vehicle").removeClass("disabled")

  // deactivate section by section 
  if(MISSION_DESIGN)
  {
    if(!section_by_section_button)
      $("#nav_mission_program_line_by_line").addClass("disabled");
    else
    {
      $("#nav_mission_program_edit").addClass("disabled");
      $("#nav_mission_program_new").addClass("disabled");
    }
  }
  else
  {
    $("#nav_mission_program_line_by_line").removeClass("disabled");
    $("#nav_mission_program_edit").removeClass("disabled");
    $("#nav_mission_program_new").removeClass("disabled");
  }

  // deactivate mission program edit if no mission is available
  if(missions_to_be_displayed.length==0 || (missions_to_be_displayed.length==1 && missions_to_be_displayed[0].mission.length==0) || section_by_section_button)
    $("#nav_mission_program_edit").addClass("disabled");
  else
    $("#nav_mission_program_edit").removeClass("disabled");

}

function nav_getOffset(el) {
  el = el.getBoundingClientRect();
  return {
    left: el.left + window.scrollX,
    top: el.top + window.scrollY,
    bottom: el.bottom + window.scrollY,
    right: el.right +window.scrollX
  }
}

function nav_button_hide(objid)
{
  $("#"+objid).addClass("buttons_hidden");
}

function nav_button_show(objid)
{
  $("#"+objid).removeClass("buttons_hidden");
}

function nav_button_togglehidden(objid)
{
  if($("#"+objid).hasClass("buttons_hidden"))
    $("#"+objid).removeClass("buttons_hidden")
  else
    $("#"+objid).addClass("buttons_hidden")
}

function nav_button_activate(objid, activate_flag)
{
  if(activate_flag)
    $("#"+objid).addClass("activated")
  else
    $("#"+objid).removeClass("activated")
}

function nav_button_do_operation(obj)
{
  console.log("Long Press"+obj.id);
  switch(obj.id) {
    case "zoom_tools":
      $("#div_zoom_buttons").removeClass("buttons_hidden")
      window.setTimeout(function() { nav_button_hide("div_zoom_buttons"); } ,5000);
      break;
    default:
  }
}

function nav_button_down(obj)
{
  //nav_button_Timer = window.setTimeout(function() { nav_button_do_operation(obj); } ,600);
  return false;
}

function nav_button_up(obj)
{
  //clearTimeout(nav_button_Timer);
  return false;
}


function nav_button_click(obj)
{
  nav_update_divs();
  switch(obj.id) {
    case "zoom_tools":
      nav_button_togglehidden("div_zoom_buttons");
      window.setTimeout(function() { nav_button_hide("div_zoom_buttons"); } ,4000);
      break;
    case "mission":
      nav_button_togglehidden("div_mission_program_buttons");
      break;
    case "measure":
      nav_button_activate("measure", RULER);
      break;
    default: break;
  }
  //clearTimeout(nav_button_Timer);
  return false;
}


function nav_button_follow_vehicle_click(obj)
{
  if(VCurr!=-1 && center_on_Vehicle!= VCurr-1)
  { 
    center_on_Vehicle = VCurr-1;
    $("#"+obj.id).addClass("activated");
  } 
  else 
  {
    center_on_Vehicle=-1;
    $("#"+obj.id).removeClass("activated");
  }
}

function nav_mission_program_edit_click(obj)
{
  if($("#"+obj.id).hasClass("disabled"))
    return;
  mission_design_toggle(true);
}

function nav_mission_program_new_click(obj)
{
  if($("#"+obj.id).hasClass("disabled"))
    return;
  mission_design_toggle(false);
}

function nav_mission_program_line_by_line_click(obj)
{
  if($("#"+obj.id).hasClass("disabled"))
    return;

  if(section_by_section_button)
  {
    MISSION_DESIGN = false;
    section_by_section_button = false;
    nav_button_activate("nav_mission_program_line_by_line", false);
    destroy_mission_planning();
  }
  else
  {
    MISSION_DESIGN = true;
    section_by_section_button = true;
    nav_button_activate("nav_mission_program_line_by_line", true);
    init_mission_planning(false, true);
  }
  nav_update_divs();
}

function mission_design_toggle(edit_status)
{
  nav_button_activate("nav_mission_program_edit", false);
  nav_button_activate("nav_mission_program_new", false);
  nav_button_activate("nav_mission_program_line_by_line", false);
  section_by_section_button = false;
  
  if(MISSION_DESIGN)
  {
    MISSION_DESIGN = false;
    $("#div_mission_programming_menu").addClass("mission_programming_menu_hidden");
    destroy_mission_planning();
  }
  else
  {
    MISSION_DESIGN = true;
    nav_button_activate("nav_mission_program_edit", edit_status);
    nav_button_activate("nav_mission_program_new", !edit_status);
    $("#div_mission_programming_menu").removeClass("mission_programming_menu_hidden");
    init_mission_planning(!edit_status);
  }
  nav_update_divs();
  draw(-2,-2,-2,-2);
}