var nb_node_name = new Array();
var nb_messages = new Array();
function organizeDivs(){
	var previous_divs_ = document.getElementsByClassName('tn-box');

	// use the last div for shifting
	for(var i=0; i<previous_divs_.length;i++){
		if(i==0)
			previous_divs_[i].style.bottom = '20px';
		else{
			previous_divs_[i].style.bottom = parseFloat((parseFloat(previous_divs_[i-1].getBoundingClientRect().height)+parseFloat(previous_divs_[i-1].style.bottom)+10))+'px'; //((n_divs-1)*100+20)+'px';
		}
	}
}

function close_notification() {
	parent_div_name = 'duplicater0';
	child_div_name = this.id;
	var original = document.getElementById('duplicater0');
	var copy_clone = document.getElementById(this.id);
	var previous_divs_ = document.getElementsByClassName('tn-box');

	//console.log('Closed DIV message');

	if(!original)
		return;

	if(!copy_clone)
		return;

	nb_node_name.splice(nb_messages.indexOf(copy_clone.getElementsByTagName("p")[1].innerHTML),1);
	nb_messages.splice(nb_messages.indexOf(copy_clone.getElementsByTagName("p")[1].innerHTML),1);

	//copy_clone.getElementsByTagName('audio')[0].pause();
		
	// Shift DIVs place
	var found =false;
	for(var i=0; i<previous_divs_.length;i++){
		if(previous_divs_[i].id == child_div_name){
			found = true;
			break;
		}
	}

	original.parentNode.removeChild(copy_clone); // Remove Cloned Box
	organizeDivs();

	var non_project_divs = false;
	for(var i=0; i<previous_divs_.length;i++){
		if(previous_divs_[i].className.indexOf("activated") !=-1 && previous_divs_[i].getElementsByTagName("p")[0].innerHTML.indexOf("wimust")==-1){
			/*console.log("there is at least one non project notification")
			console.log(previous_divs_[i])*/
			non_project_divs = true;
			break;
		}
	}
	if(!non_project_divs)
		//document.getElementsByTagName('audio')[0].pause();
		document.getElementById("error_notification_beep").pause();	

}

function new_notification(div_name, process_name, msg_text) {

	// Verify if there is an active message
	if(nb_node_name.indexOf(process_name)!=-1 && nb_messages.indexOf(msg_text)!=-1){
		return;
	}
	
	// Add message 
	nb_node_name.push(process_name);
	nb_messages.push(msg_text);
	
	var original = document.getElementById(div_name);
	var clone = original.cloneNode(true); // DIV Clone
	
	clone.id = "duplicater" + (new Date()).getTime(); // unique ID
	clone.getElementsByTagName("p")[0].innerHTML = process_name +':'; // Change process name text
	clone.getElementsByTagName("p")[1].innerHTML = msg_text; // Change message text
	
	original.parentNode.appendChild(clone);

	var previous_divs_ = document.getElementsByClassName('tn-box');

	organizeDivs();
	//document.getElementsByTagName('audio')[0].volume = 0.15;
	document.getElementById("error_notification_beep").volume = 0.15;	
	if(process_name.indexOf("caddy")==-1 && process_name.indexOf("wimust")==-1)
			document.getElementById("error_notification_beep").play();
			//document.getElementsByTagName('audio')[0].play();
	

	clone.addEventListener('webkitAnimationEnd', close_notification, false );
	clone.addEventListener('click',  close_notification, false);
	
	clone.className =  "tn-box activated";
}
