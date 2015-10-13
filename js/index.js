$(function(){
	$("#chat-box-input").click(function(){
		if ($('#keyboard-face').is(':visible')) {
			$('#keyboard-face').hide();
		}
		if ($('#keyboard-color').is(':visible')) {
			$('#keyboard-color').hide();
		}
	});
	$("#color-btn").click(function(){
		if ($('#keyboard-face').is(':visible')) {
			$('#keyboard-face').hide();
		}
		$("#keyboard-color").fadeToggle("fast");
	});
	$("#face-btn").click(function(){
		if ($('#keyboard-color').is(':visible')) {
			$('#keyboard-color').hide();
		}
		$("#keyboard-face").fadeToggle("fast");
	});



	$("#keyboard-face span").click(function(){
		var text = $(this).text();
		var chatInput = $("#chat-box-input").val();
		console.log(chatInput);
		$("#chat-box-input").val(chatInput+text);
		$('#keyboard-face').hide();
	});
	
//	styleBtn.onclick = function(){
//	  changeStyle('color1');
//	  setCookie('userStyle','color1',365);
//	};
	
	$("#keyboard-color span").click(function(){
		colorStyle = $(this).attr("class");
		console.log(colorStyle);
		changeStyle(colorStyle);
		setCookie('userStyle', colorStyle, 365);
		$('#keyboard-color').hide();
	});

	$("#send-btn").click(function(){
  		if (firstFlag) {
	      	main();
	    } else {
	      	sendMsg();
	      	$.scrollTo('#dialog-list', printWall.scrollHeight);
	    }
	});
});

$(document).keydown(function (event) {
    if (event.keyCode == 13) {
        if (firstFlag) {
	      	main();
	    } else {
	      	sendMsg();

	    }
    };
});