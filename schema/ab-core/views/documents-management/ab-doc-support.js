/**
 * UI Document field dialog common functions
 *
 */

var docmanager_targetPanel = null;

// database table name for the UIdocument field 
var docmanager_tableName = '';
// database field name for the UI document field 
var docmanager_fieldName = '';
// database field full name for the UI document field
var docmanager_fieldFullName = '';

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

var isAutoNameFile = false;


/**
 * General helper for setting input data from opening view
 * Sets the table & field name that the document should belong to, plus the document name if it exists
 * Sets the primary key from the restriction 
 *	docmanager_tableName is the table containing the doc field, part of the primary key in afm_docs
 *	docmanager_fieldName is the doc field in docmanager_tableName, part of the primary key in afm_docs
 *  docmanager_pkey_value is the (single) primary key field in docmanager_tableName, part of the primary key in afm_docs
 *  docmanager_pkeys_values contain the primary key field(s) and value(s) for the record in docmanager_tableName to which the doc is attached
 *	docmanager_autoNamedFile auto-generated name for downloaded document
 *
 */
function setManagerVarsFromOpener() {
	// do not reset once loaded, inefficient & munges restriction
	if (docmanager_autoNamedFileSansExt != '') {
		return;
	}

	// document values from opener view
	var openingView = View.getOpenerWindow().View;
	
	// target panel to refresh after the operation
	docmanager_targetPanel = openingView.dialogDocumentParameters.panel;
	
	// document field's table & field names
	docmanager_tableName = openingView.dialogDocumentParameters.tableName;
	docmanager_fieldName = openingView.dialogDocumentParameters.fieldName;
	docmanager_fieldFullName = docmanager_tableName + '.' + docmanager_fieldName;
	docmanager_autoNamedFile = openingView.dialogDocumentParameters.fieldValue;

	// use main table primary key fields in canonical field order from config
	var primaryKeyFieldNames = openingView.dialogDocumentParameters.primaryKeyFields;
	docmanager_pkeys_values = {};
	for (var k=0, pkFieldName; pkFieldName = primaryKeyFieldNames[k]; k++) {
		var fld = pkFieldName.split('.')[1];
		docmanager_pkeys_values[fld] = '';
	}


	// Convert the opening view restriction to an afm_docs restriction.  Is original View.restriction ever useful?
	var restriction = View.restriction;
	if (View.restriction == null  || (View.restriction != null && View.restriction.clauses != null && View.restriction.clauses.length == 0)) {
		if (openingView.dialogDocumentParameters.panel.restriction) {
			restriction = openingView.dialogDocumentParameters.panel.restriction;
		}
		else if (openingView.restriction) {
			restriction = openingView.restriction;
		}
		else if (openingView.parentTab) {
			restriction = openingView.parentTab.restriction;
		}
		else if (openingView.dialogDocumentParameters.panel.record) {
			var openerPKeys = openingView.dialogDocumentParameters.panel.getPrimaryKeyFieldValues();
			restriction = new Ab.view.Restriction();
			for (name in openerPKeys) {
				restriction.addClause(name, openerPKeys[name], '=');
			}
		}
	}
	View.log(restriction);

	// KB 3030858 on refresh of form, the restriction is a string transform it into a simple object
	if (typeof restriction=="string") {
		restriction = formRestrictionObjectFromString(restriction);
	}

	// TODO use ext error dialog if no restriction
	if (valueExists(restriction)) {
		// restriction is an Ab.view.restriction
		if (restriction.clauses != null && restriction.clauses.length > 0) {
			for (var i=0, clause; clause = restriction.clauses[i]; i++) {
				var fld = clause.name.split('.')[1];
				if (fld != docmanager_fieldName) {					
					docmanager_pkey_value = clause.value;
					docmanager_pkeys_values[fld] = clause.value;
				}
			}
		}
		// restriction is a simple object
		else {
		    for (var name in restriction) {
				var value = restriction[name];
				if (typeof value == 'function') {
					continue;
				}
				var fld = name.split('.')[1];
				if (fld != docmanager_fieldName) {
					docmanager_pkey_value = value;
					docmanager_pkeys_values[fld] = value;
				}
		    }
		}

		if (primaryKeyFieldNames.length > 1) {
			docmanager_pkey_value = formPKStringFromPKValues(docmanager_pkeys_values);
		}

		var restr = new Ab.view.Restriction();
		restr.addClause('afm_docs.table_name', docmanager_tableName, '=');
		restr.addClause('afm_docs.field_name', docmanager_fieldName, '=');
		restr.addClause('afm_docs.pkey_value', docmanager_pkey_value, '=');
		View.restriction = restr;
		
		
		DocumentService.isAutoNameFile(docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, {
            callback: function(isAutoNameFile_server) {
				isAutoNameFile = isAutoNameFile_server;
            },
            errorHandler: function(m, e) {
				Ab.view.View.showException(e);
            }
        });
		
		docmanager_autoNamedFileSansExt = docmanager_tableName + '-' + docmanager_pkey_value + '-' + docmanager_fieldName;
		
	} else {
		View.showMessage('error', "Missing primary key field from opener");
	}

}

/**
 * Construct an afm_docs.pkey_value string from the set of values in docmanager_pkeys_values
 *
 */
function formPKStringFromPKValues() {
	var primaryKeyString = "";
	for (name in docmanager_pkeys_values) {
		if (primaryKeyString.length > 0) {
			primaryKeyString += '|';
		}
		primaryKeyString += docmanager_pkeys_values[name];
	}
	return primaryKeyString;
}

/**
 * Transform a restriction in the form of a string 	(i.e., tbl.fld = val AND tbl.fld = val AND ...)
 * into a simple object of fieldName - fieldValue members
 *
 */
function formRestrictionObjectFromString(restrictionString) {
	var restrict = {};
	
	var strClauses = restrictionString.split('and');	
	for (var i=0, strClause; strClause = strClauses[i]; i++) {
		var fldAndValue = strClause.split('=');
		var field = fldAndValue[0].trim();
		var value = fldAndValue[1].replace(/\'/g, ' ').trim();
		restrict[field] = value
	}
	return restrict;
}


//------------------ interfaces to DWR calls, one per dialog to handle the OK/SHOW button's action -------------------------------


/**
 * Check in a document when no document is currently associated with the field
 *
 */
function checkinNewDocument() {
	// disable buttons to prevent multiple checkin(s)
	var checkinController = View.controllers.get('checkIn');
	checkinController.checkinPanel.actions.get('okButton').enable(false);
	checkinController.checkinPanel.actions.get('cancelButton').enable(false);
	

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
			// call user-defined callback function
			callDocumentFieldListenerIfExists(Ab.form.Form.DOC_EVENT_CHECKIN);

			refreshOpener(docmanager_fieldFullName, docmanager_autoNamedFile);
            displayMessageCloseDialog(getMessage('message_OK'), 'message');
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
            displayFileNameMessage('', 'block', 'Black');
			checkinController.checkinPanel.actions.get('okButton').enable(true);
			checkinController.checkinPanel.actions.get('cancelButton').enable(true);
        }
    });
}


/**
 * Check in a document when a document is currently associated with the field
 *
 */
function checkinNewVersion() {
	// disable buttons to prevent multiple checkin(s)
	var checkinController = View.controllers.get('checkInNewVersion');
	checkinController.checkinPanel.actions.get('okButton').enable(false);
	checkinController.checkinPanel.actions.get('cancelButton').enable(false);

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
			// call user-defined callback function
			callDocumentFieldListenerIfExists(Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION);

		    refreshOpener(docmanager_fieldFullName, docmanager_autoNamedFile);
            displayMessageCloseDialog(getMessage('message_OK'), 'message');
			//okAction.enable(true);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
            displayFileNameMessage('', 'block', 'Black');
			checkinController.checkinPanel.actions.get('cancelButton').enable(true);
			checkinController.checkinPanel.actions.get('okButton').enable(true);
        }
    });
}

/**
 * Update the existing document record's lock status to the value of the locked/unlocked control
 *
 */
function changeLockStatus() {
	// disable buttons to prevent multiple clicks
	var controller = View.controllers.get('lockDocController');
	controller.lockPanel.actions.get('okButton').enable(false);
	controller.lockPanel.actions.get('cancelButton').enable(false);

	var lockedField = document.getElementById('locked');
	var newLockStatus = lockedField.checked ? '1' : '0';
	// get the 'force break lock' req from the form
	var breakLockCheckedField = document.getElementById('breakLockChecked');
	var breakExistingLock = true;
	breakExistingLock = breakLockCheckedField.checked;
	displayMessage(getMessage('message_processing'), 'message');

	DocumentService.changeLockStatus(docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, newLockStatus, breakExistingLock, {
        callback: function() {
			// call user-defined callback function
			callDocumentFieldListenerIfExists(Ab.form.Form.DOC_EVENT_CHANGE_LOCK_STATUS);

            displayMessageCloseDialog(getMessage('message_OK'), 'message');
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
 			controller.lockPanel.actions.get('cancelButton').enable(true);
			controller.lockPanel.actions.get('okButton').enable(true);
       }
    });
}

/**
 * Update the existing document record to deleted
 * old version remains in dB
 */
function markDocumentDeleted() {
	// disable buttons to prevent multiple clicks
	var controller = View.controllers.get('deleteController');
	controller.markDeletedPanel.actions.get('delete').enable(false);
	controller.markDeletedPanel.actions.get('cancel').enable(false);

	var canDelete = true;
	var confirmObj = document.getElementById('confirm');
	displayMessage(getMessage('message_processing'), 'message');

	if (canDelete) {
		DocumentService.markDeleted(docmanager_pkeys_values, docmanager_tableName, docmanager_fieldName, {
			callback: function() {
				// call user-defined callback function
				callDocumentFieldListenerIfExists(Ab.form.Form.DOC_EVENT_DELETE);

				refreshOpener(docmanager_fieldFullName, '');
				displayMessageCloseDialog(getMessage('message_OK'), 'message');
			},
			errorHandler: function(m, e) {
				Ab.view.View.showException(e);
				controller.markDeletedPanel.actions.get('cancel').enable(true);
				controller.markDeletedPanel.actions.get('delete').enable(true);
			}
		});
	}
}


/**
 * 
 *  not implemented
 */
function checkOutDocument() {
	// disable buttons to prevent multiple clicks
	var checkoutDocController = View.controllers.get('checkoutDocController');
	checkoutDocController.checkoutPanel.actions.get('okButton').enable(false);
	checkoutDocController.checkoutPanel.actions.get('cancelButton').enable(false);

	var keys = docmanager_pkeys_values;
	var tableName = docmanager_tableName;
	var fieldName = docmanager_fieldName;
	var fileName = docmanager_autoNamedFile;  
	var version = document.getElementById('version').value;
	var newLockStatus = document.getElementById('locked').checked ? '1' : '0';
	var breakExistingLock = false;

	// there is no 'breakLockChecked' field in view
	//var breakLockCheckedField = document.getElementById('breakLockChecked');
	//breakExistingLock = breakLockCheckedField.checked;

	//displayMessage(getMessage('message_processing'), 'message');

	DocumentService.checkOut(keys, tableName, fieldName, newLockStatus, breakExistingLock, fileName, version, {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
			// call user-defined callback function
			callDocumentFieldListenerIfExists(Ab.form.Form.DOC_EVENT_CHECKOUT);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
	checkoutDocController.checkoutPanel.actions.get('cancelButton').enable(true);
	checkoutDocController.checkoutPanel.actions.get('okButton').enable(true);
}


/**
 * Not used. The showDocument command does the job.
 *
function showDocument() {
	var keys = docmanager_pkeys_values;
	var tableName = docmanager_tableName;
	var fieldName = docmanager_fieldName;
	var fileName = docmanager_autoNamedFile;
	DocumentService.show(keys, tableName, fieldName, fileName, '', true, 'showDocument', {
        rpcType: 'dwr.engine.IFrame',
        httpMethod: 'GET',
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}
*/


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
    var okAction = View.panels.get('checkinPanel').actions.get('okButton');

	// assign fileName input element to global for later use
	docmanager_fileNameElement = obj;

	// get filename user has input
	var fileName = obj.value;

	// remove IE-supplied directories
	var separatorPos = fileName.lastIndexOf('\\');
	if (separatorPos >= 0) {
		fileName = fileName.substring(separatorPos + 1);
	}
	else {
		separatorPos = fileName.lastIndexOf('/');
		if (separatorPos >= 0) {
			fileName = fileName.substring(separatorPos + 1);
		}
	}
	fileName = convertToSQLSafeValue(fileName);

	// get filename extension to test
	var docFileExtension  = '';
	if (fileName != '') {
		var pos = fileName.lastIndexOf('.');
		if (pos > 0) {
			docFileExtension = fileName.substring(pos + 1);
		}
	}
	
	if (isAutoNameFile){
		docmanager_autoNamedFile = docmanager_autoNamedFileSansExt + "." + docFileExtension;
	}else{
		docmanager_autoNamedFile = fileName;
	}
			
	displayFileNameMessage(uploadFileMessagePreface + " " + docmanager_autoNamedFile, 'block', 'Black');
	docmanager_sourceFileName = fileName;
	okAction.enable(true);
}

/**
 * Return a string with any SQL-conflicting characters removed.
 * KB 3037977
 */
function convertToSQLSafeValue(text) {
	return text.replace(/\'/g, '').trim();
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
	var messageCell = Ext.fly(Ext.query('.formTopSpace', this.parentElement)[0]);
	if (!valueExists(messageCell)) {
		messageCell = Ext.get('instructions');
	} 
	return messageCell;
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

function refreshOpener(docFieldFullName, docFieldValue) {
    if (valueExists(docmanager_targetPanel)) {
        if(docmanager_targetPanel.type == 'form'){
            //XXX: just refresh targeted doc field UI control 
	        docmanager_targetPanel.setFieldValue(docFieldFullName, docFieldValue);
	        docmanager_targetPanel.updateDocumentButtons();
        }else{
            docmanager_targetPanel.refresh();
        }
    } else {
	    var openingView = View.getOpenerWindow().View;
	    openingView.refresh();
    }
}


/**
 * Close the dialog now
 */
function closeDialog() {
	var openingView = View.getOpenerWindow().View;
	openingView.closeDialog() ;
}


/**
 * Find the user-defined document field listener defined in the parent form, if one exists.
 * Call the listener, passing a standard set of parameters w/ info about the doc
 *
 */
function callDocumentFieldListenerIfExists(listenerName) {
	// field in parent form that is the actual document field
	var documentField = docmanager_targetPanel.fields.get(docmanager_fieldFullName);
	// call user-defined callback function
	var listener = documentField.getDocumentFieldEventListener(listenerName);
	if (listener) {

		// document info for use by listener
		var params = {};
		if (valueExists(docmanager_fileNameElement)) {
			params.fileName = docmanager_fileNameElement.value;
		}
		else {
			params.fileName = documentField.dom.value;
		}
		
		var descriptionField = document.getElementById('description');
		if (valueExists(descriptionField)) {
			params.description = descriptionField.value;
		}
		
		var lockedField = document.getElementById('locked');
		if (valueExists(lockedField)) {
			params.locked = lockedField.checked ? true : false;
		}

		// call listener
		listener(docmanager_targetPanel, docmanager_fieldFullName, params);
	}
}


