/**
 * @fileoverview Common functions to collapse, open, close and hide panels
 */

/**
 * Changes cursor style on panel header to pointer and adds onclick to panel header
 * @param {String} id panel (form) id
 */
function setPanelCollapse(id) {
	document.getElementById(id+"_title").style.cursor = 'pointer';
	YAHOO.util.Event.addListener(id+"_title","click",onClickPanelTitle,id);
	document.getElementById(id+"_title").innerHTML = "[-]" + document.getElementById(id+"_title").innerHTML;
}

onClickPanelTitle = function (e,id){
	if(document.getElementById(id+"_body").style.display == 'none'){
		document.getElementById(id+"_body").style.display = '';
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[+]","[-]");
	} else {
		document.getElementById(id+"_body").style.display = 'none';
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[-]","[+]");
	}
}

/**
 * Show panel contents
 * @param {String} id panel id
 */
function openPanel(id) {
	document.getElementById(id+"_body").style.display = '';
	if(document.getElementById(id+"_title").innerHTML.match("[+]")){
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[+]","[-]");
	}
}

function showPanel(id) {
	document.getElementById(id+"_head").style.display = '';
	document.getElementById(id+"_body").style.display = '';
}

/**
 * Hide panel contents
 * @param {String} id panel id
 */
function closePanel(id) {
	document.getElementById(id+"_body").style.display = 'none';
	if(document.getElementById(id+"_title").innerHTML.match("[-]")){
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[-]","[+]");
	}
}

/**
 * Hide complete panel (header + body)
 * @param {String} id panel id
 */
function hidePanel(id) {
	document.getElementById(id+"_head").style.display = 'none';
	document.getElementById(id+"_body").style.display = 'none';
}