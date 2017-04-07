/**
 * UI Document field dialog common functions
 *
 */

// database table name for the UIdocument field 
var docmanager_tableName = '';

// database field name for the UI document field 
var docmanager_fieldName = '';

// auto-generated document name for the doc as stored in the dB, with extension
var docmanager_autoNamedFile = '';
// auto-generated document name before prefix is know from file chooser
var docmanager_autoNamedFileSansExt = "";

// 
var docmanager_description = '';

var docmanager_lock_status = '0';

var docmanager_version = '';

// message text shown below file input element
var uploadFileMessagePreface = "";




// Primary key values
//doc or docvers table: one value
var docmanager_pkey_value = "";
//inventory table: could be a list of values
var docmanager_pkeys_values = new Array();

// Collection of file extensions for document types allowed to be associated with a UI document field
// should get these from the preferences
var docmanager_allowedDocTypes = new Array();
	docmanager_allowedDocTypes['doc']='doc';
	docmanager_allowedDocTypes['pdf']='pdf';
    docmanager_allowedDocTypes['xls']='xls';
    docmanager_allowedDocTypes['dwg']='dwg';
    docmanager_allowedDocTypes['dwf']='dwf';
    docmanager_allowedDocTypes['txt']='txt';
    docmanager_allowedDocTypes['jpg']='jpg';
    docmanager_allowedDocTypes['gif']='gif';
    docmanager_allowedDocTypes['bmp']='bmp';
    docmanager_allowedDocTypes['zip']='zip';
    docmanager_allowedDocTypes['xml']='xml';
    docmanager_allowedDocTypes['htm']='htm';

// Collection of file extensions for document types whose display is handled by the OS in its own window rather than in the dialog
// should get these from the preferences
var docmanager_separateWindowDocTypes=new Array();
	docmanager_separateWindowDocTypes['doc']='doc';
	docmanager_separateWindowDocTypes['pdf']='pdf';
    docmanager_separateWindowDocTypes['xls']='xls';
    docmanager_separateWindowDocTypes['dwg']='dwg';
    docmanager_separateWindowDocTypes['dwf']='dwf';
    docmanager_separateWindowDocTypes['zip']='zip';


/**
 * General helper for setting input data from opening view
 * Sets the table & field name that the document should belong to, plus the document name if it exists
 * Set the primary key from the restriction 
 * Uses dialog-specific JS file's gettingRecordsData() to get op-specific data
 *
 */
function setManagerVarsFromOpener() {
	// document values from opener view
	var openingView = this.AFM.view.View.getView('opener');
	// document field's table & field names
	docmanager_tableName = openingView.dialogDocumentParameters.tableName;
	docmanager_fieldName = openingView.dialogDocumentParameters.fieldName;
	// previously set auto-generated name for downloaded document 
	docmanager_autoNamedFile = openingView.dialogDocumentParameters.fieldValue;

	var restriction = this.AFM.view.View.restriction;
	for (var i=0, pkey; pkey = restriction.pkeys[i]; i++) {
		docmanager_pkeys_values[pkey.name.substring(pkey.name.lastIndexOf('.') + 1)] = pkey.value;
		docmanager_pkey_value = pkey.value;
	}
	
	docmanager_autoNamedFileSansExt = docmanager_tableName + '-' + docmanager_pkey_value + '-' + docmanager_fieldName;
	//validation of file name
	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\*/g, "")      // delete *
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\[/g, "")      // delete [
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\]/g, "")      // delete ]
 	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\</g, "")      // delete <
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\>/g, "")      // delete >
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\=/g, "")      // delete =
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\+/g, "")      // delete +
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\'/g, "")      // delete '
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\"/g, "")      // delete "
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\\/g, "")      // delete \
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\//g, "")      // delete /
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\,/g, "")      // delete ,
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\./g, "")      // delete .
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\:/g, "")      // delete :
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\;/g, "")      // delete ;
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/ /g, "")         // delete spaces
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\#/g, "")         // delete #
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\&/g, "")         // delete &
  	docmanager_autoNamedFileSansExt = docmanager_autoNamedFileSansExt.replace(/\|/g, "")         // delete  |
	
}


/**
 * General handler for OK button
 * Sets serialized action plus operation-specific record data in form and submits 
 * Uses dialog-specific JS file's gettingRecordsData() to get op-specific data
 *
 */
function onOK(strSerialized) {
	var objHiddenForm = document.forms["afmDocManagerInputsForm"];
	/*
	if (typeof(strSerialized) == 'undefined' || strSerialized == '') {
		alert('Serialized action is null');
	}
	*/	
	setSerializedInsertingDataVariables(strSerialized);
	//get record-specific data, gettingRecordsData() is defined in corresponding JS file
	var strData = gettingRecordsData();
	//which XSL is calling sendingDataFromHiddenForm
	var strXMLValue = "";
	if (strData != "") {
		strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
	}else {
		strXMLValue = strSerialized;
	}
	//alert(strXMLValue);
	
	objHiddenForm.elements["xml"].value = strXMLValue;
	objHiddenForm.target = "";
	objHiddenForm.action = "login.axvw";
	
	//sending the hidden form to server
	objHiddenForm.submit();			
}





/**
 * Handle the file chooser dialog return
 * Process the filename & produce a message below the file input field
 * If file has acceptable extension show auto-gen filename, else show error message
 * If file has acceptable extension enable OK button, otherwise disable
 *
 */
function processingFileNameMessage(obj) {
	// get the OK button we'll enable or disable
	var okButtonObj = document.getElementById("okButton");
	// get the message element whose text we'll mod to inform user
	var fileNameMessageObj = document.getElementById("autoFileName");
	// get filename user has input
	var fileName = obj.value;
	fileName = convert2validXMLValue(fileName);
	// get filename extension to test
	var docFileExtension  = '';
	if (fileName != '') {
		var pos = fileName.lastIndexOf('.');
		if (pos > 0) {
			docFileExtension = fileName.substring(pos + 1);
		}
	}
	// test, then mod message & OK button
	if (isValidDocumentExtension(docFileExtension)) {
		 docmanager_autoNamedFile = docmanager_autoNamedFileSansExt + "." + docFileExtension; 
		fileNameMessageObj.innerHTML = uploadFileMessagePreface + " " + docmanager_autoNamedFile;		
		fileNameMessageObj.style.display = "";
		okButtonObj.disabled=0;
	}
	else {
		//if the doc type is not valid, then prompt a message then disable OK button
		var warning_message_invalid_filetype = getMessage('message_invalid_filetype');
		//replace the [{0}] with the actual file type for the message
		fileNameMessageObj.innerHTML = warning_message_invalid_filetype.replace("[{0}]", docFileExtension);     
		fileNameMessageObj.style.display = 'block';
		okButtonObj.disabled=1;
		docmanager_autoNamedFile = '';
	}
}


/**
 * Return whether given file extension 
 * is contained the collection of allowed fileName extensions
 *
 */
function isValidDocumentExtension(docFileExtension) {
	// check if the file extension allowed
	var isValidDoc = false;

	for (var name in docmanager_allowedDocTypes) {
		// loop throught the allowed filetype list
		// !!! file type comparison is case-insensitive
		var docLower = docmanager_allowedDocTypes[name].toLowerCase();
		var docExtLower = docFileExtension.toLowerCase();
		if (docLower == docExtLower) {
			isValidDoc = true;
			break;
		}
	}
	return isValidDoc;
}

/**
 * Return whether document type with given file extension 
 * is shown by an OS call to open doc in its own window
 *
 */
function documentOpensInSeparateWindow(docFileExtension) {
	var inNewWindow = false;
	for (var name in docmanager_separateWindowDocTypes) {
		// loop throught the allowed filetype list
		// !!! file type comparison is case-insensitive
		var docLower = docmanager_separateWindowDocTypes[name].toLowerCase();
		var docExtLower = docFileExtension.toLowerCase();
		if (docLower == docExtLower) {
			inNewWindow = true;
			break;
		}
	}
	return inNewWindow;
}



/**
 * Operation-specific data to be set in form that gets submitted
 * Common function used by both checkin-document & checkin-document-new-version
 *
 */
function gettingRecordsDataForCheckin() {
	var objForm = document.forms["afmDocManagerInputsForm"];

	docmanager_lock_status = "0";
	var lockedObj = document.getElementById("locked");
	if (lockedObj.checked)
		docmanager_lock_status = "1";

	var strReturned = "<record";
	strReturned += ' documentName="' + docmanager_autoNamedFile + '" ';
	strReturned += ' tableName="' + docmanager_tableName + '" ';
	strReturned += ' fieldName="' + docmanager_fieldName + '" ';
	strReturned += ' newLockStatus="' + docmanager_lock_status + '" ';

	var descriptionElem = objForm.elements["description"];
	if (typeof(descriptionElem) != 'undefined') {
		var docmanager_description = descriptionElem.value;
		docmanager_description = convertMemo2validateXMLValue(docmanager_description);
		strReturned += ' description="' + docmanager_description + '" ';
	}

	var versionElem = objForm.elements["version"];
	if (typeof(versionElem) != 'undefined') {
		strReturned += ' version="' + versionElem.value + '" ';
	}


	var str_pkeys = "";
	for (var name in docmanager_pkeys_values) {
		str_pkeys += ' ' + name + '="' + convert2validXMLValue(docmanager_pkeys_values[name]) + '" ';
	}
	strReturned += '/><pkeys ' + str_pkeys + '/>';
	strReturned  = "<userInputRecordsFlag>" + strReturned + "</userInputRecordsFlag>";
	return strReturned;
}


