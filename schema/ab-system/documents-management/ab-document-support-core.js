/**
 * UI Document field dialog common functions
 *
 */

var docmanager_targetPanel = null;

// database table name for the UIdocument field 
var docmanager_tableName = '';

// database field name for the UI document field 
var docmanager_fieldName = '';

// auto-generated document name for the doc as stored in the dB, with extension
var docmanager_autoNamedFile = '';
// auto-generated document name before prefix is know from file chooser
var docmanager_autoNamedFileSansExt = "";

// DOM element holding path to source document file on client machine
var docmanager_fileNameElement;

// holder for loacked/unlocked UI control value
var docmanager_lock_status = '0';

var docmanager_version = '';

// message text shown below file input element
var uploadFileMessagePreface = "";


// Primary key values
//doc or docvers table: one value
var docmanager_pkey_value = "";

//inventory table: could be a list of values
var docmanager_pkeys_values = {};

// Collection of file extensions for document types allowed to be associated with a UI document field
// should get these from the preferences
var docmanager_allowedDocTypes = new Array('doc','docx','pdf','xls','xlsx','dwg','dwf','txt','jpg','gif','bmp','zip','xml','htm', 'log');

// Collection of file extensions for document types whose display is handled by the OS in its own window rather than in the dialog
// should get these from the preferences
var docmanager_separateWindowDocTypes = new Array('doc','docx','pdf','xls','xlsx','dwg','dwf','zip');


/**
 * General helper for setting input data from opening view
 * Sets the table & field name that the document should belong to, plus the document name if it exists
 * Sets the primary key from the restriction 
 *
 */
function setManagerVarsFromOpener() {
	// document values from opener view
	var openingView = View.getOpenerWindow();
	if (openingView == null || openingView.AFM == null) {
		displayMessage('Error', 'cannot find opener view');
		return;
	}
	else {
		openingView = openingView.AFM.view.View;
	}
	
	// target panel to refresh after the operation
	docmanager_targetPanel = openingView.dialogOpenerPanel;
	
	// document field's table & field names
	docmanager_tableName = openingView.dialogDocumentParameters.tableName;
	docmanager_fieldName = openingView.dialogDocumentParameters.fieldName;
	// previously set auto-generated name for downloaded document 
	docmanager_autoNamedFile = openingView.dialogDocumentParameters.fieldValue;

	var restriction = openingView.dialogRestriction;
	// TODO use ext error dialog
	if (restriction == null || !restriction.pkeys || restriction.pkeys.length == 0)	{
		alert("Missing primary key field from opener");
	}

	for (var i=0, pkey; pkey = restriction.pkeys[i]; i++) {
		docmanager_pkeys_values[pkey.name.substring(pkey.name.lastIndexOf('.') + 1)] = pkey.value;
		if (i > 0) {
			docmanager_pkey_value = pkey.value + '|' + docmanager_pkey_value;
		}
		else {
			docmanager_pkey_value = pkey.value;
		}
	}
	
	docmanager_autoNamedFileSansExt = docmanager_tableName + '-' + docmanager_pkey_value + '-' + docmanager_fieldName;
}




//------------------ interfaces to DWR calls, one per dialog to handle the OK/SHOW button's action -------------------------------


/**
 * Check in a document when no document is currently associated with the field
 *
 */
function checkinNewDocument() {
	// second verification that file is not null & may be checked in since disabled property is unreliable
	var fileField = docmanager_fileNameElement;
	if (fileField == null || fileField.value == null && fileField.value.trim() == '') {
		var warning_message_empty_filename = getMessage('message_empty_filename');
		displayFileNameMessage(warning_message_empty_filename, 'block', 'Red' );
		return;
	}

	var descriptionField = document.getElementById('description');
	var description = descriptionField.value;

	var lockedField = document.getElementById('locked');
	var newLockStatus = lockedField.checked == true ? '1' : '0';
	displayMessage(getMessage('message_processing'), 'message');

	DocumentService.checkinNewFile(docmanager_fileNameElement, docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, docmanager_autoNamedFile, description, newLockStatus, {
        callback: function() {
			refreshOpener();
            displayMessageCloseDialog(getMessage('message_OK'), 'message');
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}



/**
 * Check in a document when a document is currently associated with the field
 *
 */
function checkinNewVersion() {
	// second verification that file is not null & may be checked in since disabled property is unreliable
	var fileField = docmanager_fileNameElement;
	if (fileField == null || fileField.value == null && fileField.value.trim() == '') {
		var warning_message_empty_filename = getMessage('message_empty_filename');
		displayFileNameMessage(warning_message_empty_filename, 'block', 'Red' );
		return;
	}
	var descriptionField = document.getElementById('description');
	var description = descriptionField.value;

	var lockedField = document.getElementById('locked');
	var newLockStatus = lockedField.checked ? '1' : '0';
	displayMessage(getMessage('message_processing'), 'message');

	DocumentService.checkinNewVersion(docmanager_fileNameElement, docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, docmanager_autoNamedFile, description, newLockStatus, {
        callback: function() {
			refreshOpener();
            displayMessageCloseDialog(getMessage('message_OK'), 'message');
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}

/**
 * Update the existing document record's lock status to the value of the locked/unlocked control
 *
 */
function changeLockStatus() {
	var lockedField = document.getElementById('locked');
	var newLockStatus = lockedField.checked ? '1' : '0';

	//TODO does user have the right to break lock?
	var breakExistingLock = false;
	var breakLockCheckedField = document.getElementById('breakLockChecked');
	breakExistingLock = breakLockCheckedField.checked;

	displayMessage(getMessage('message_processing'), 'message');

	DocumentService.changeLockStatus(docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, newLockStatus, breakExistingLock, {
        callback: function() {
            displayMessageCloseDialog(getMessage('message_OK'), 'message');
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}

/**
 * Update the existing document record to deleted
 * old version remains in dB
 */
function markDocumentDeleted() {
	var canDelete = true;
	var confirmObj = document.getElementById('confirm');
	displayMessage(getMessage('message_processing'), 'message');

	if (canDelete) {
		DocumentService.markDeleted(docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, {
			callback: function() {
				refreshOpener();
				displayMessageCloseDialog(getMessage('message_OK'), 'message');
			},
			errorHandler: function(m, e) {
				Ab.view.View.showException(e);
			}
		});
	}
}


/**
 * Not used. The showDocument command does the job.
 */
function showDocument() {
	var keys = docmanager_pkeys_values;
	var tableName = docmanager_tableName;
	var fieldName = docmanager_fieldName;
	var fileName = docmanager_autoNamedFile;
	DocumentService.show(keys, tableName, fieldName, fileName, '', true, 'showDocument', {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}


/**
 * Check Out a specific version of the document
 *  
 */
function checkOutDocument() {
	var keys = docmanager_pkeys_values;
	var tableName = docmanager_tableName;
	var fieldName = docmanager_fieldName;
	var fileName = document.getElementById('docFileName').value;
	var version = document.getElementById('version').value;
	var newLockStatus = document.getElementById('locked').checked ? '1' : '0';
	var breakExistingLock = false;
	displayMessage(getMessage('message_processing'), 'message');

	DocumentService.checkOut(keys, tableName, fieldName, newLockStatus, breakExistingLock, fileName, version, {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}



//----------------------- helper functions ---------------------------

/**
 * Handle the file chooser dialog return
 * Process the filename & produce a message below the file input field
 * If file has acceptable extension show auto-gen filename, else show error message
 * If file has acceptable extension enable OK button, otherwise disable
 *
 */
function processingFileNameMessage(obj) {
	// get the OK button we'll enable or disable
    var okAction = Ab.view.View.panels.get('checkinPanel').actions.get('okButton');

	// assign fileName input element to global for later use
	docmanager_fileNameElement = obj;

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
		displayFileNameMessage(uploadFileMessagePreface + " " + docmanager_autoNamedFile, 'block', 'Black');
		docmanager_sourceFileName = fileName;
		okAction.enable(true);
	}
	else {
		//if the doc type is not valid, then prompt a message then disable OK button
		var warning_message_invalid_filetype = getMessage('message_invalid_filetype');
		//replace the [{0}] with the actual file type for the message
		displayFileNameMessage(warning_message_invalid_filetype.replace("<{0}>", "[" + docFileExtension + "]"), 'block', 'Red');
		docmanager_autoNamedFile = '';
        okAction.enable(false);
	}
}

/**
 * Display a message below the file name text input
 *
 */
function displayFileNameMessage(text, displayStyle, textColor) {
	// get the message element whose text we'll mod to inform user
	var fileNameMessageObj = document.getElementById("autoFileName");
	fileNameMessageObj.innerHTML = text;
	fileNameMessageObj.style.display = displayStyle;
	if (textColor && textColor != '') {
		fileNameMessageObj.style.color = textColor;
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

	//for (var name in docmanager_allowedDocTypes) {
	for (var i=0, name; name = docmanager_allowedDocTypes[i]; i++ ) {
		// loop throught the allowed filetype list
		// !!! file type comparison is case-insensitive
		var docLower = name.toLowerCase();
		var docExtLower = docFileExtension.toLowerCase();
		if (docLower == docExtLower) {
			isValidDoc = true;
			break;
		}
	}
	return isValidDoc;
}


/**
 *  display a message in the message cell
 *  & leave it there
 */
function displayMessage(messageText, messageType) {
	// add message text
    var messageCell = this.getMessageCell();
    var messageElement = null;
    if (valueExists(messageText) && messageText != '') {
		messageElement = Ext.DomHelper.append(messageCell, '<a href="javascript: //">' + messageText + '</a>', true);
	} 
	else {
		messageElement = Ext.DomHelper.append(messageCell, '<p>' + messageText + '</p>', true);
	}
	messageElement.addClass( (messageType && messageType == 'error') ? 'formError' : 'formMessage');
    messageElement.setVisible(true, {duration: 1});
    messageElement.setHeight(20, {duration: 1});
}


/**
 *  display a message in the message cell
 *  fade it after 3 seconds and then close the dialog
 *
 */
function displayMessageCloseDialog(messageText, messageType) {
	// add message text
    var messageCell = this.getMessageCell();
    var messageElement = null;
    if (valueExists(messageText) && messageText != '') {
		messageElement = Ext.DomHelper.overwrite(messageCell, '<a href="javascript: //">' + messageText + '</a>', true);
	} 
	else {
		messageElement = Ext.DomHelper.append(messageCell, '<p>' + messageText + '</p>', true);
	}
	messageElement.addClass( (messageType && messageType == 'error') ? 'formError' : 'formMessage');
    messageElement.setVisible(true, {duration: 1});
    messageElement.setHeight(20, {duration: 1});
            
    // if this is a confirmation message, dismiss it after 3 seconds
    if (!messageType || messageType != 'error') {
		dismissMessageCloseDialog.defer(3000, this, [messageElement]);
	}
}

/**
 * Returns a reference to the DOM element that contains message.
 */
function getMessageCell () {
	return Ext.fly(Ext.query('.formTopSpace', this.parentElement)[0]);
}
    


/**
 * Hides confirmation message.
 */
function dismissMessage (messageElement) {
	messageElement.setHeight(1, {duration: 1});
	messageElement.setVisible(false, {duration: 0.25});	
}

/**
 * Hides confirmation message & then close dialog.
 */
function dismissMessageCloseDialog (messageElement) {
	messageElement.setHeight(1, {duration: 1});
	messageElement.setVisible(false, {duration: 0.25});
	closeDialog();
}


function refreshOpener() {
    if (valueExists(docmanager_targetPanel)) {
        docmanager_targetPanel.refresh();
    } else {
	    var openingView = View.getOpenerWindow().View;
	    openingView.refresh();
    }
}


/**
 * Close the dialog now
 */
function closeDialog() {
	var openingView = View.getOpenerWindow().AFM.view.View;
    if (openingView != null) {
		openingView.closeDialog() ;
	}
}


