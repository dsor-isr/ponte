function indicator_update(obj, flag, title){
	if(document.getElementById("indicator_img_imu").src.indexOf("red")!=-1){
		document.getElementById("indicator_img_imu").src = "indicator/indicator_orange.png";
	}else if(document.getElementById("indicator_img_imu").src.indexOf("orange")!=-1){
		document.getElementById("indicator_img_imu").src = "indicator/indicator_green.png";
	}else if (document.getElementById("indicator_img_imu").src.indexOf("green")!=-1){
		document.getElementById("indicator_img_imu").src = "indicator/indicator_red.png";
	}
}
