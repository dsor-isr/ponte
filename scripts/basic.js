function getVehicleURL(ind){
    if(VehiclesData[ind].ip.indexOf(":")==-1)
        port_txt=":7080/";
    else
        port_txt="/";
    return 'http://'+VehiclesData[ind].ip+port_txt;
}