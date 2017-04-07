/********************************************
checkin-new-file.js
Yong Shao
2005-01-27

Steven Meyer
2007-01-10
*********************************************/


function user_form_onload() {
	setManagerVarsFromOpener();

	var lockedObj = document.getElementById("locked");
	var unlockedObj = document.getElementById("unlocked");

	if(docmanager_lock_status == "1") {
		lockedObj.checked=1;
		unlockedObj.checked=0;
	}
	else {
		lockedObj.checked=0;
		unlockedObj.checked=1;
	}


	var okButtonObj = document.getElementById("okButton");
	okButtonObj.disabled = 1;
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

