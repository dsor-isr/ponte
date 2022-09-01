var fast_course_line = false;
function menu_pointCallback()
{
    if($("#fast_menu_point").hasClass("fast_menu_disable"))
        return;
    
    Point=true; 
    canvasClick(mouse_down_obj,mouse_down_event);
}

function menu_gohereCallback()
{
    if($("#fast_menu_gohere").hasClass("fast_menu_disable"))
        return;

    Point=true; 
    WayPoint=true; 
    canvasClick(mouse_down_obj,mouse_down_event);
}

function menu_courselineCallback()
{
    if($("#fast_menu_gohere").hasClass("fast_menu_disable"))
        return;
    fast_course_line = true;
    RULER=true;
    canvasClick(mouse_down_obj,mouse_down_event);
    var pos_pixel = getCanvasPos_pixel([VehiclesData[VCurr-1].GPS_X,VehiclesData[VCurr-1].GPS_Y],true)
    console.log(pos_pixel[0] +" , " + pos_pixel[1])
    mouse_canvas_pos_old=[VehiclesData[VCurr-1].GPS_X-canvas_xtl,VehiclesData[VCurr-1].GPS_Y-canvas_ytl,pos_pixel[0], pos_pixel[1]];//getMousePosCanvas(canvas,event);
}

function menu_clearCallback()
{
    DPoints.length=0; 
    DPoints_green.length=0;
    canvasClick(mouse_down_obj,mouse_down_event);
    btClear(); 
}