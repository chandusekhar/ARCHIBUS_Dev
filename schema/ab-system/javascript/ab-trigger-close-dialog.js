/******************************************************************
	ab-trigger-close-dialog.js
	(stimulating a modal dialog window)
	to close dialog window when user's mouse down event is fired on
	any of frames: one of them is dialog-window's opener
	to close dialog window when "ESC" key is pressed
 ******************************************************************/
/************************************
 check browser's type:
 bNetscape, bIE
************************************/
var agt = navigator.userAgent.toLowerCase();
//Netscape
var bNetscape = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer')==-1)
				 && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera')==-1)
				 && (agt.indexOf('webtv')==-1) && (agt.indexOf('hotjava')==-1));
//IE
var bIE  = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));

if(window.top.opener != null)
{
	//set up user's mouse down event in all frames for closing the current
	//window as soon as user's mouse down event is fired in any of the frames
	closeDialog(window.top.opener.top);
	//when ESC key is pressed, closing dialog window
	//bNetscape, bIE are defined in common.js
	if(bIE) document.onkeyup=eventHandler;
	if(bNetscape)document.captureEvents(Event.KEYDOWN);
}
function closeDialog(parent)
{
	if( parent != null){
		var n = parent.frames.length;
		if(n>0){
			for(var i=0;i<n;i++){
				//trigger closing dialog when mousedown event is fired
				parent.frames[i].window.document.onmousedown = closePopupWindow;
				//go through all frames
				if(parent.frames[i].frames !=null && parent.frames[i].frames.length !=0)
					closeDialog(parent.frames[i]);
			}
		}else{
			parent.document.onmousedown = closePopupWindow;
		}
	}
}
//when ESC key is pressed, closing dialog window
//bNetscape, bIE are defined in common.js
//if(bIE) document.onkeyup=eventHandler;
//if(bNetscape)document.captureEvents(Event.KEYDOWN);
function eventHandler(e)
{
	//key's code for "ESC" is 27
	var ESC_KEYCODE = 27;
	var key;
	if (bNetscape)
		key = e.which;
	if (bIE)
		key = window.event.keyCode;
	//when "ESC" key is pressed, close dialog
	if(key == ESC_KEYCODE){
		//closing dialog window
		closePopupWindow();
	 }
}

function closePopupWindow() 
{
	//close dialog window
	if(window.top!=null)
		window.top.close();
}










