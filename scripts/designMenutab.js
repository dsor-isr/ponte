function missionMenuTab_disp() {
   var page_url  = "pages/design_mission_menu.html";
   
   if(document.getElementById("missionMenu_sidetab")!=null){
      document.getElementById("includeDesignMenu_sidebar").style.width = "17%";
      document.getElementById("missionMenu_sidetab").style.display = "block";
		return;
   }
   
   // create tab and append to page
   var page = document.createElement("iframe");
   page.setAttribute("id","missionMenu_sidetab");
   page.setAttribute("src",page_url);
   //page.setAttribute("style","border-radius: 10px; border-style: solid; border-width: 1px");
   //img.src = this.getAttribute("data-larger");
   page.setAttribute("allowTransparency",false);
   page.setAttribute("frameborder","0");
   page.setAttribute("class","missionMenu_sidetab");

   document.getElementById("includeDesignMenu_sidebar").appendChild(page);

   document.getElementById("includeDesignMenu_sidebar").style.width = "17%";
}

function missionMenuTab_close() {
   document.getElementById("includeDesignMenu_sidebar").style.width = "0px";
   document.getElementById("missionMenu_sidetab").style.display = "none";
}

