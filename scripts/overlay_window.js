var Scenarios = new Array();
function Scenario(name,path,path_thumb,latlong_ref, refpoint_bottom_left_x,refpoint_bottom_left_y,ws,hs, zone){
	this.name=name;
   this.path=path;
	this.path_thumb=path_thumb;
	this.refpoint=[refpoint_bottom_left_x, refpoint_bottom_left_y];
	this.width=ws;
	this.height=hs;
	this.latlong_ref = latlong_ref;
	this.utm_zone=zone;
}

Scenarios.push(new Scenario("EXPO Doca dos Olivais", "Mission_scenarios/expo_normal.jpg", "Mission_scenarios/expo_normal_thumb.jpg",false, 491750.282220,4290739.0586,297.94647,208.14441,"29S"));
Scenarios.push(new Scenario("EXPO Bathymetry", "Mission_scenarios/expo_bathy.jpg", "Mission_scenarios/expo_bathy_thumb.jpg", false, 491750.282220,4290739.0586, 297.946470000024, 208.144410999492 ,"29S"));
Scenarios.push(new Scenario("EXPO no water", "Mission_scenarios/map_expo_color.jpg", "Mission_scenarios/map_expo_color_thumb.jpg",false, 491750.282220,4290739.0586,297.94647,208.14441,"29S"));
Scenarios.push(new Scenario("EXPO Full Dock", "Mission_scenarios/expo_big.jpg", "Mission_scenarios/expo_big_thumb.jpg",false, 491696.78669,4290405.1656,345.63455,560.6245,"29S"));
Scenarios.push(new Scenario("EXPO Deploy Zoom", "Mission_scenarios/weaver_zoom.png", "Mission_scenarios/weaver_zoom_thumb.png",false, 491869.376,4290798.663,119.185,118.94,"29S"));
Scenarios.push(new Scenario("Azores Porto Pim", "Mission_scenarios/azores_porto_pim.bmp", "Mission_scenarios/azores_porto_pim_thumb.bmp",false,357631.09, 4264802.59, 733.1,821.87,"26S"));
Scenarios.push(new Scenario("Azores Porto Pim Big", "Mission_scenarios/Porto_Pim_map2.png", "Mission_scenarios/Porto_Pim_map2_thumb.png",false,357575.46, 4265042.12, 786.62,463.12,"26S"));
Scenarios.push(new Scenario("Azores Porto Pim - Bing", "Mission_scenarios/Porto_Pim_BIG_bing.png", "Mission_scenarios/Porto_Pim_BIG_bing_thumb.bmp",false, 356568.4935, 4264189.43, 2009.88, 1466.94,"26S"));
Scenarios.push(new Scenario("Azores Porto Novo", "Mission_scenarios/Novo_Porto_acores.png", "Mission_scenarios/Novo_Porto_acores_thumb.png",false,358139.54, 4266463.20, 1453.11,928.31,"26S"));
Scenarios.push(new Scenario("Azores Porto Novo LTP", "Mission_scenarios/Novo_Porto_acores.png", "Mission_scenarios/Novo_Porto_acores_thumb.png",false,169.191569668, 1163.8884, 1436.659,954.0624,"26S"));
Scenarios.push(new Scenario("Azores Espalamaca", "Mission_scenarios/espalamaca.png", "Mission_scenarios/espalamaca.png",false,357891.68, 4265990.59, 4837.32,2777.19,"26S"));
Scenarios.push(new Scenario("Sesimbra High Resolution", "Mission_scenarios/sesimbra_small_18.jpg", "Mission_scenarios/sesimbra_small_18_thumb.jpg" ,false, 490125.0,4254358.347,958.044,597.853,"29S"));
Scenarios.push(new Scenario("Sesimbra", "Mission_scenarios/sesimbra.jpg", "Mission_scenarios/sesimbra_thumb.jpg",false, 490304.1173,4254448.754,569.72,387.234,"29S"));
Scenarios.push(new Scenario("Sesimbra Bathymetry", "Mission_scenarios/sesimbra_navionics.png", "Mission_scenarios/sesimbra_navionics.png",false, 489826.36,4251982.01,4395.02,3263.35,"29S"));
Scenarios.push(new Scenario("Oeiras Pool", "Mission_scenarios/my_map_oeiras_final.jpg", "Mission_scenarios/my_map_oeiras_final_thumb.jpg",false, 472208.9,4280915.162, 89.352, 59.838,"29S"));
Scenarios.push(new Scenario("IST", "Mission_scenarios/my_map_ist.jpg", "Mission_scenarios/my_map_ist_thumb.jpg",false, 487897.608,4287505.645, 178.717, 208.288,"29S"));
Scenarios.push(new Scenario("SINES - Port", "Mission_scenarios/sines_port.jpg", "Mission_scenarios/sines_port_thumb.jpg",false, 510694.00, 4197106.88, 5064.08, 2772.25,"29S"));
Scenarios.push(new Scenario("Toulon - France", "Mission_scenarios/toulon_map.jpg", "Mission_scenarios/toulon_map_thumb.jpg",false, 734376.231568,4776407.941301,  516.298930999939, 372.422953999601 ,"31S"));
Scenarios.push(new Scenario("Toulon Zoom - France", "Mission_scenarios/toulon_map_zoom.jpg", "Mission_scenarios/toulon_map_zoom_thumb.jpg",false, 734547.686241,4776461.693617,  287.048647999996,213.086490999907,"31S"));
Scenarios.push(new Scenario("Porto Brandao", "Mission_scenarios/porto_brandao.jpg", "Mission_scenarios/porto_brandao_thumb.jpg",false, 480016.51, 4280766.07,  3025.020,2699.96,"29S"));
Scenarios.push(new Scenario("Sant Feliu Guixols - Spain", "Mission_scenarios/sant_feliu_Girona.jpg", "Mission_scenarios/sant_feliu_Girona_thumb.jpg",false, 502449.852, 4624926.544, 741.994,426.085,"31T"));
Scenarios.push(new Scenario("Sant Feliu Guixols - Spain, Bathymetry", "Mission_scenarios/sant_feliu_Girona_bathy.png", "Mission_scenarios/sant_feliu_Girona_bathy_thumb.png",false, 502449.852, 4624926.544, 741.994,426.085,"31T"));
Scenarios.push(new Scenario("Sant Feliu Guixols - Spain, Aerial Photo", "Mission_scenarios/sant_feliu_Girona_foto_georef.jpg", "Mission_scenarios/sant_feliu_Girona_thumb.jpg",false, 502449.852, 4624926.544, 741.994,426.085,"31T"));
//Scenarios.push(new Scenario("Biogra Na Moru - Croatia", "Mission_scenarios/Biograd_na_moru.png", "Mission_scenarios/Biograd_na_moru.png",false, 535363.37, 4864419.78, 497.49,271.94,"33T"));
Scenarios.push(new Scenario("Biogra Na Moru - Croatia", "Mission_scenarios/Biograd_na_moru.png", "Mission_scenarios/Biograd_na_moru.png",false, 535365.77, 4864412.86, 497.49,271.94,"33T"));
Scenarios.push(new Scenario("EMEPC Pool", "Mission_scenarios/EMEPC_Pool.png", "Mission_scenarios/EMEPC_Pool.png",false,-4, -3, 8,6,"29S"));
Scenarios.push(new Scenario("Portugal", "Mission_scenarios/portugal_transparent.png", "Mission_scenarios/portugal_transparent.png",false,363666.96,4175718.82,245357.08,182691.22,"29S"));
Scenarios.push(new Scenario("Jardim Cabeco Rolas", "Mission_scenarios/jardim_cabeco_rolas.jpg", "Mission_scenarios/jardim_cabeco_rolas.jpg",false,491361.427023711,4290086.36880354,119.444646541728,118.700751457363,"29S"));
//Scenarios.push(new Scenario("Estoril", "Mission_scenarios/estoril.jpg", "Mission_scenarios/estoril.jpg",false, 474875.738701391, 4283820.80760396 ,11976.63, 7568.16, "29S"));
Scenarios.push(new Scenario("Estoril", "Mission_scenarios/estoril.png", "Mission_scenarios/estoril.png",false, 466393.94, 4281394.26, 2813.96, 1772.88, "29S"));
Scenarios.push(new Scenario("Expo98_mag", "Mission_scenarios/Expo98_mag.png", "Mission_scenarios/Expo98_mag.png", false, 491584.14, 4290411.60 , 596.68, 593.03, "29S"));
Scenarios.push(new Scenario("Nortesport", "Mission_scenarios/Nortesport.png", "Mission_scenarios/Nortesport.png", false, 454652.60, 4529452.64 , 581.27, 572.00, "30S"));
Scenarios.push(new Scenario("Nortesport_zoom", "Mission_scenarios/Nortesport_zoom.png", "Mission_scenarios/Nortesport_zoom.png", false, 454754.78, 4529585.70 , 290.64, 286.00, "30S"));
Scenarios.push(new Scenario("Nortesport_hyper_zoom", "Mission_scenarios/Nortesport_hyper_zoom.png", "Mission_scenarios/Nortesport_hyper_zoom.png", false, 454827.50, 4529657.25 , 145.32, 143.00, "30S"));
Scenarios.push(new Scenario("teste_zoom", "Mission_scenarios/teste_zoom.png", "Mission_scenarios/teste_zoom.png", false, 409951.47, 4487035.53 , 2351.73, 2287.48, "30S"));
Scenarios.push(new Scenario("GranCanaria_Taliarte", "Mission_scenarios/canarias.png", "Mission_scenarios/canarias.png", false, 461805.82, 3093447.54, 3150.83, 3067.45, "28R"));
Scenarios.push(new Scenario("GranCanaria_LasPalmas", "Mission_scenarios/canarias_laspalmas.png", "Mission_scenarios/canarias_laspalmas.png", false, 457803.08, 3105031.08, 6958.36, 8655.14, "28R"));
Scenarios.push(new Scenario("GranCanaria_LasPalmas_Zoom", "Mission_scenarios/canarias_laspalmas_zoom.png", "Mission_scenarios/canarias_laspalmas_zoom.png", false, 457821.11, 3110139.18, 2576.43, 3560.73, "28R"));
Scenarios.push(new Scenario("Tagus_river_belem", "Mission_scenarios/tagus_river_belem.png", "Mission_scenarios/tagus_river_belem.png", false, 478043.37, 4280479.82, 6805.98, 2974.85, "29S"));
Scenarios.push(new Scenario("Castelo_de_Bode", "Mission_scenarios/castelo_de_bode.png", "Mission_scenarios/castelo_de_bode.png", false, 564823.22, 4397570.81, 1894.83, 1126.18, "29S"));
Scenarios.push(new Scenario("Kolumbo Crater", "Mission_scenarios/kolumbo_crater_hires.jpg", "Mission_scenarios/kolumbo_crater_hires.jpg", false, 360744.39, 4039219.72, 8394.4, 8967.68, "35S"));
Scenarios.push(new Scenario("Kolumbo Zoom Vents", "Mission_scenarios/kolumbo_zoom_vents.PNG", "Mission_scenarios/kolumbo_zoom_vents.PNG", false, 364412.34, 4043343.31, 180.9, 188.37, "35S"));
Scenarios.push(new Scenario("Exo Gialos Zoom 1", "Mission_scenarios/exo_gialos_bathymetry_zoom1.PNG", "Mission_scenarios/exo_gialos_bathymetry_zoom1.PNG", false, 360211.44, 4031094.76, 4488.3, 3382.52, "35S"));
Scenarios.push(new Scenario("Exo Gialos Zoom 2", "Mission_scenarios/exo_gialos_bathymetry_zoom2.PNG", "Mission_scenarios/exo_gialos_bathymetry_zoom2.PNG", false, 361497.51, 4032303.49, 1431.83, 916.28, "35S"));

/*var ScenNames = new Array("./Mission_scenarios/my_map_expo2.jpg","./Mission_scenarios/map_expo_color.jpg","./Mission_scenarios/weaver_zoom.png", "./Mission_scenarios/my_map_expo.jpg","./Mission_scenarios/sesimbra_small_18_quart.jpg","./Mission_scenarios/sesimbra.jpg", "./Mission_scenarios/my_map_oeiras_final.jpg", "./Mission_scenarios/my_map_ist.jpg", "./Mission_scenarios/expo_bathy.jpg", "./Mission_scenarios/toulon_map.jpg", "./Mission_scenarios/toulon_map_zoom.jpg", "./Mission_scenarios/porto_brandao.jpg", 
"./Mission_scenarios/sant_feliu_Girona.jpg", "./Mission_scenarios/EMEPC_Pool.png");
//Pelo Google Earth
var RefPointTLE = new Array(491750.282220, 491750.282220, 491869.376, 491696.78669, 490125.0,490304.1173,472208.9,487897.608, 491750.282220,734376.231568,734547.686241,480016.51, 502449.852, -4); //TLE TLN BRE BRN
var RefPointTLN = new Array(4290947.203011, 4290947.203011, 4290917.603, 4290965.7901, 4254956.2,4254835.988,4280975.0,4287713.933, 4290947.203011, 4776780.364255, 4776674.780108,4283466.03, 4625352.629, 3);
var RefPointBRE = new Array(492048.22869, 492048.22869, 491988.561, 492042.42124, 491083.044, 490873.8462,472298.252,488076.325, 492048.22869 ,734892.530499, 734834.734889,483041.53, 503191.846, 4);
var RefPointBRN = new Array(4290739.0586, 4290739.0586, 4290798.663, 4290405.1656, 4254358.347,4254448.754,4280915.162,4287505.645, 4290739.0586, 4776407.941301, 4776461.693617,4280766.07, 4624926.544, -3);
// refpBx = 491750.282220, 491750.282220, 491869.376, 491696.78669, 490125.0,490304.1173,472208.9,487897.608, 491750.282220,734376.231568,734547.686241,480016.51, 502449.852, -4
// refpBy = 4290739.0586, 4290739.0586, 4290798.663, 4290405.1656, 4254358.347,4254448.754,4280915.162,4287505.645, 4290739.0586, 4776407.941301,4776461.693617,4280766.07, 4624926.544, -3
// ws =   297.946470000024 297.946470000024 119.184999999998 345.634550000017 958.043999999994 569.728900000046 89.3519999999553  178.717000000004 297.946470000024 516.298930999939 287.048647999996 3025.02000000002 741.994000000006 8
// hs =   208.144410999492 208.144410999492 118.94000000041  560.624499999918  597.853000000119 387.234000000171 59.8380000004545  208.288000000641 208.144410999492 372.422953999601 213.086490999907 2699.95999999996 426.084999999963 6

var UTMzones = new Array("29S","29S","29S","29S","29S","29S","29S","29S","29S","31S","31S","29S", "29S");
*/

// restore page to normal
function restore_select() {

 document.body.removeChild(document.getElementById("overlay"));
 document.body.removeChild( document.getElementById("overlay_page"));
// console.log('scenario_selection.js Scenario='+Scenario);
 //imgLoaded = false;
 //imgScen.src = Scenarios[Scenario-1].path;
 //draw(0,0,1,1);
}

function disp_overlay(option) {
   var page_url;
   if(option==='vehicle_configs'){
      localStorage['VehiclesData']=JSON.stringify(VehiclesData);
      page_url="pages/vehicle_configs_new.html";
   }else if(option === 'scenario_select'){
      page_url="pages/scenario_selection.html";   
   }else if(option === 'mission_design_configs'){
      page_url="pages/mission_design_configs.html";
   }else if(option === 'vehicle_actions'){
      page_url="pages/vehicle_actions.html";
   }else{
      console.log('error!!!!! invalid command');
      return;
   }
   
   if(document.getElementById("idoverlay_page")!=null)
		return;
   // create overlay and append to page
   var overlay = document.createElement("div");
   overlay.setAttribute("id","overlay");
   overlay.setAttribute("class", "idoverlay_page");
   document.body.appendChild(overlay);

   // create image and append to page
   var page = document.createElement("iframe");
   page.setAttribute("id","overlay_page");
   page.setAttribute("src",page_url);
   page.setAttribute("style","border-radius: 10px;");
   //img.src = this.getAttribute("data-larger");
   page.setAttribute("allowTransparency",false);
   page.setAttribute("frameborder","0");
   page.setAttribute("class","idoverlayimg_page");

   // click to restore page
   overlay.onclick=restore_select;

   document.body.appendChild(page);
}
