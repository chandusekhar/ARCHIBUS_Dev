/********************************************
checkin-new-file.js
Yong Shao
2005-01-27

Steven Meyer
2007-01-10
*********************************************/


function user_form_onload() {
	// document values from opener view
	setManagerVarsFromOpener();


	// hidden DOM objects containing server-side values
	var lockedFieldObj = document.getElementById("afm_docs.locked");

	if (lockedFieldObj.value > 0) {
		document.getElementById("locked").checked=1;
		document.getElementById("unlocked").checked=0;
	}
	else {
		document.getElementById("locked").checked=0;
		document.getElementById("unlocked").checked=1;
	}

	document.getElementById("okButton").disabled = 1;

    var fileNameMessageObj = document.getElementById("autoFileName");

	uploadFileMessagePreface = fileNameMessageObj.innerHTML;
}


/**
 * Operation-specific data to be set in form that gets submitted
 *
 */
function gettingRecordsData() {
	return gettingRecordsDataForCheckin();
}

