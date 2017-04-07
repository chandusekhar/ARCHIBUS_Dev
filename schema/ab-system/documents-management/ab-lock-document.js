/********************************************
show-lock-status.js
Yong Shao
2005-02-7
*********************************************/

var docmanager_currentUser;
var lockOwnerObj;

//////
var enableBreakExistingLock = "true";
var breakExistingLock  = "";

var existingLockMessageAreaObj;
var breakExistingLockAreaObj;


function user_form_onload() {
	setManagerVarsFromOpener();
	setLockedStatus();
}



/**
 * set the value of UI fields that depend on the lock status
 *
 */
function setLockedStatus() {
	var objForm = document.forms["afmDocManagerInputsForm"];
	// WFR to get lock info from server & set view fields
	var parameters = {
		fieldNames:'afm_docs.table_name,afm_docs.field_name,afm_docs.pkey_value,afm_docs.locked,afm_docs.locked_by,afm_docs.lock_date,afm_docs.lock_time'
	};
    //AFM.workflow.Workflow.runRule('AbSolutionsViewExamples-getRecords', parameters, onGetDocsRecords);
	AFM.workflow.Workflow.runRule('AbCommonResources-getDataRecords', parameters, onGetDocsRecords);

	// displayed DOM objects
	var lockedObj = objForm.elements["locked"];
	var unlockedObj =  objForm.elements["unlocked"];
	// DOM elements that get hidden / shown
	existingLockMessageAreaObj = document.getElementById("existingLockMessageArea");
	breakExistingLockAreaObj = document.getElementById("breakExistingLockArea");

	// set DOM displayed values that depend on lock status
	if (docmanager_lock_status > 0) {
		lockedObj.checked = 1;
		unlockedObj.checked = 0;
		// currently locked by
		lockOwnerObj = objForm.elements["afm_docs.locked_by"];

		// get owner of lock
		if (typeof docmanager_currentUser == 'undefined' || docmanager_currentUser == '') {
			// fetch the user information needed
			AFM.workflow.Workflow.runRule("AbCommonResources-getUser", {}, setUser);
		}

		if (lockOwnerObj.value != '' && docmanager_currentUser.user_name != lockOwnerObj.value )	{
			existingLockMessageAreaObj.style.display = "";
		}
	}
	else {
		lockedObj.checked = 0;
		unlockedObj.checked = 1;		
	}
}


/**
 * get record-specific data for WFR XML
 *
 */
function gettingRecordsData() {
	var objForm = document.forms["afmDocManagerInputsForm"];
	
	docmanager_lock_status = "0";
	var lockedObj = document.getElementById("locked");
	if (lockedObj.checked) {
		docmanager_lock_status = "1";
	}
	
	if (objForm.elements["break"].checked) {
		breakExistingLock = "1";
	}
	else {
		breakExistingLock = "0";
	}

	var strReturned = "<record";
	strReturned += ' documentName="' + convert2validXMLValue(docmanager_autoNamedFile) + '" ';
	strReturned += ' tableName="' + docmanager_tableName + '" ';
	strReturned +=  ' fieldName="' + docmanager_fieldName + '" ';
	strReturned +=  ' newLockStatus="' + docmanager_lock_status + '" ';
	strReturned += ' breakExistingLock="' + breakExistingLock + '" ';
	
	var str_pkeys = "";
	for (var name in docmanager_pkeys_values) {
		str_pkeys += ' ' + name + '="' + docmanager_pkeys_values[name] + '" ';
	}
	strReturned += '/><pkeys ' + str_pkeys + '/>';
	
	return strReturned;
}


/**
 * callback from WFR
 *
 */
function setUser(result) {
	if (result.code == 'executed') {
		docmanager_currentUser = result.data;
	}
	else{
		logError(result, 'AbCommonResources-getUser');
	}
}


/**
 * if lock control changed to unlock and lock owned by other
 * display break existing lock control
 */
function handleUnlocked() {
	if (lockOwnerObj.value != '' && docmanager_currentUser.user_name != lockOwnerObj.value )	{
		breakExistingLockAreaObj.style.display = "block";
	}
}
function handleLocked() {
	breakExistingLockAreaObj.style.display = "none";
}

/** 
 * Process doc records to see if the current doc is locked & by whom
 *
 */
function onGetDocsRecords(result) {
	if (result.code == 'executed') {
		var objForm = document.forms["afmDocManagerInputsForm"];
		var rows = eval("(" + result.jsonExpression + ")");
		for (var i=0,row; row = rows[i]; i++) {
			if (row['afm_docs.table_name'] == docmanager_tableName && row['afm_docs.field_name'] == docmanager_fieldName &&  row['afm_docs.pkey_value'] == docmanager_pkey_value) {
				objForm.elements['afm_docs.locked'].value = (row['afm_docs.locked'] == 'No') ? '0' : '1';
				objForm.elements['lockedBy'].value = row['afm_docs.locked_by'];
				objForm.elements['lockedDate'].value = row['afm_docs.lock_date'];
				objForm.elements['lockedTime'].value = row['afm_docs.lock_time'];
				docmanager_lock_status = objForm.elements['afm_docs.locked'].value;
				break;
			}
		}
	} 
	else {
		alert(result, 'AbCommonResources-getDataRecords');
	}
}