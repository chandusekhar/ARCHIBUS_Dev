
/**
 * on load click the show button to automatically kick things off
 */
function user_form_onload() {
	setManagerVarsFromOpener();
	// auto-click the show button to submit the form
	var showButton = document.getElementById("showButton");
	showButton.click();
}

/**
 * action to submit form calling Workflow Rule
 * response is the doc that is rendered in the window
 *
 */
function showDoc(strSerialized) {
	var restriction = this.AFM.view.View.restriction;
	var objHiddenForm = document.forms["afmHiddenForm"];
	
	var strData = gettingRecordsData();
	var strXMLValue = "";
	
	setSerializedInsertingDataVariables(strSerialized);
	strData = gettingRecordsData();
	if(strData != "") {
		strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
	}
	else {
		strXMLValue = strSerialized;
	}

	objHiddenForm.elements["xml"].value = strXMLValue;
	objHiddenForm.target = "";
	objHiddenForm.action = "login.axvw";
	
	//sending the hidden form to server
	objHiddenForm.submit();
/*
	var extension = docmanager_autoNamedFile.substring(docmanager_autoNamedFile.lastIndexOf('.') + 1);
	if (documentOpensInSeparateWindow(extension)) {
		window.top.close();
	}
*/
}


/**
 * get data from restriction
 * inserted record data into serialized action sent to server
 *
 */
function gettingRecordsData() {
	var strReturned = "<record";

	strReturned += ' tableName="' + docmanager_tableName + '" ';
	strReturned += ' fieldName="' + docmanager_fieldName + '" ';
	strReturned += ' documentName="' + docmanager_autoNamedFile + '" ';

	var str_pkeys = "";
	for (var name in docmanager_pkeys_values) {
		str_pkeys += ' ' + name + '="' + docmanager_pkeys_values[name] + '" ';
	}
	strReturned += '/><pkeys ' + str_pkeys + '/>';
	strReturned  = "<userInputRecordsFlag>" + strReturned + "</userInputRecordsFlag>";
	return strReturned;
}



