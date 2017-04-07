/********************************************
 * checkin-new-version.js
 * Yong Shao
 * 2005-01-27
 *
 * updated for Yalta 5 
 * S. Meyer
 * 10-10-2007
 *
 ********************************************/


function user_form_onload() {
	document.getElementById("okButton").disabled = 1;

	// document values from opener view
	setManagerVarsFromOpener();

	// hidden DOM objects containing server-side values
	var lockedFieldObj = document.getElementById("checkinPanel_afm_docs.locked");

	if (lockedFieldObj.value > 0) {
		document.getElementById("locked").checked=1;
		document.getElementById("unlocked").checked=0;
	}
	else {
		document.getElementById("locked").checked=0;
		document.getElementById("unlocked").checked=1;
	}

    var fileNameMessageObj = document.getElementById("autoFileName");
	var translatedStoredNameLabel = getMessage("message_storedname_label");
	fileNameMessageObj.innerHTML = translatedStoredNameLabel;
   	uploadFileMessagePreface = translatedStoredNameLabel;

	// set radio button labels' translated value
	var labelElem = $("lockedLabel");
	var translatedLabel = getMessage("message_locked_label");
	labelElem.innerHTML = translatedLabel;
	labelElem = $("unlockedLabel");
	translatedLabel = getMessage("message_unlocked_label");
	labelElem.innerHTML = translatedLabel;
}


/**
 * Operation-specific data to be set in form that gets submitted
 *
 */
function gettingRecordsData() {
	return gettingRecordsDataForCheckin();
}

