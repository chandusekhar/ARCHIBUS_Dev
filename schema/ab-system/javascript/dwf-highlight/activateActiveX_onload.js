/***************************************************************************
activateActiveX
---------------
Purpose:  Dynamically replace any elements that will be affected by the new security feature in IE6/IE7 that requires a user to click certain types of elements to activate them before use.

Usage:  Include this file in the <head></head> section of your html document using the following...
	<script language="JScript" type="text/jscript" src="activateActiveX_onload.js"></script>

*/

//trap onload event
window.onload = function () {
	//Determine browser, we only need this for Internet Explorer
	if (navigator.appName == "Microsoft Internet Explorer") {
		
		//Array of elements to be replaced
		var arrElements = new Array(3);
		arrElements[0] = "object";
		arrElements[1] = "embed";
		arrElements[2] = "applet";
	
		
		//Loop over element types
		for (n = 0; n < arrElements.length; n++) {
		
			//set object for brevity
			replaceObj = document.getElementsByTagName(arrElements[n]);
			
			//loop over element objects returned
			for (i = 0; i < replaceObj.length; i++ ) {
			
				//set parent object for brevity
				parentObj = replaceObj[i].parentNode;
				
				//grab the html inside of the element before removing it from the DOM
				newHTML = parentObj.innerHTML;
				
				//remove element from the DOM
				parentObj.removeChild(replaceObj[i]);
				
				//stick the element right back in, but as a new object
				parentObj.innerHTML = newHTML;
			
				}
			}
		}
	}
