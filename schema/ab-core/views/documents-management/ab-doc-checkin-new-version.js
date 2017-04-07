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

var controller = View.createController('checkInNewVersion', {

    afterViewLoad: function() {
        this.inherit();
        
        //var okAction = this.checkinPanel.actions.get('okButton');
        //okAction.enable(false);
    
    	setManagerVarsFromOpener();
    
    	var lockedObj = $("locked");
    	var unlockedObj = $("unlocked");
    	if(docmanager_lock_status == "1") {
    		lockedObj.checked=1;
    		unlockedObj.checked=0;
    	}
    	else {
    		lockedObj.checked=0;
    		unlockedObj.checked=1;
    	}
    
        var fileNameMessageObj = $("autoFileName");
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

		var fileInputElemObj = $("chooser");
		fileInputElemObj.disabled = false;
    },


	afterInitialDataFetch: function() {
        var okAction = this.checkinPanel.actions.get('okButton');
        okAction.enable(false);
	}
});



/**
 * Operation-specific data to be set in form that gets submitted
 *
 *
function gettingRecordsData() {
	return gettingRecordsDataForCheckin();
}
*/

