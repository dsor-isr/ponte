function displayLogBookEntry(){
	console.log("display logbook div");
	$('#divlogcomment').toggle(); // toggle visibility
	$('#logbook_comment').val('');
	if($.trim($("#logbook_address").val())=='')
		$('#logbook_address').focus();
	else
		$('#logbook_comment').focus();
}

$(document).ready(function() {
	jQuery.fn.highlight = function(intDuration) {
	  	var obj = this;
	    var intervalID=setInterval(function() { 
	    	obj.css({'border': '1px solid red'});
	    	setTimeout(function () { 
	    		obj.css({'border': '1px solid black'});
	    		},intDuration/8); 
		}, intDuration/4);
		setTimeout(function () { clearInterval(intervalID); }, intDuration);
		return this;
	};

	$("#insert_comment").submit(function(event){
		console.log("submit comment");
	});

	function validateEntries(){
		if($.trim($("#logbook_address").val())==''){
				$('#logbook_address').focus();
				$('#logbook_address').highlight(1500);
        }else if($.trim($("#logbook_comment").val())==''){
				$('#logbook_comment').focus();
				$('#logbook_comment').highlight(1500);
        }else{
        	var logbook_url="http://"+$('#logbook_address').val()+"/logbook/insert.php";
        	console.log("submit comment to ["+logbook_url+"]");
        	console.log("comment - " + $("#logbook_comment").val());
        	console.log($.post(logbook_url, {comment_text: $("#logbook_comment").val()}));
        	$('#divlogcomment').hide();
        }
	}

	$('#logbook_address').on('keypress', function (event) {
         if(event.which === 13){

            //Disable textbox to prevent multiple submit
            //$(this).attr("disabled", "disabled");
			validateEntries();
         }
   	});

	$('#logbook_comment').on('keypress', function (event) {
         if(event.which === 13){
			validateEntries();
         }
   	});
});