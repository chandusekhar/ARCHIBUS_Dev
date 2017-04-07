/********************************************
 * show-lock-status.js
 * Yong Shao
 * 2005-02-7
 *
 * updated for Yalta 5
 * S. Meyer
 * 10-10-2007
 *
 ********************************************/

var docmanager_currentUser;
var lockOwnerObj;

var enableBreakExistingLock = "true";
var breakExistingLock  = "";

/**
 * KB 3029786: do not use user_form_onload() - wait until the form panel fetches the data.
 * IE does not like multiple WFRs executing at the same time.
 */
View.createController('lockDocument', {
	afterInitialDataFetch: function() {
		setManagerVarsFromOpener();
		setLockedStatus();
    }
});

/**
 * Sets the value of UI fields that depend on the lock status.
 */
function setLockedStatus() {
    var lockedObj = $("locked");
    var unlockedObj = $("unlocked");
    var lockedByObj = $("lockedBy");
    var lockedDateObj = $("lockedDate");
    // var lockedTimeObj = $("lockedTime");

	// call WFR to get lock info from server & set view fields
    try {
        var parameters = {
            tableName:'afm_docs',
            fieldNames:toJSON(['afm_docs.table_name','afm_docs.field_name','afm_docs.pkey_value','afm_docs.locked','afm_docs.locked_by','afm_docs.lock_date'])
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);

        var rows = result.data.records;
        for (var i=0,row; row = rows[i]; i++) {
            if (row['afm_docs.table_name'] == docmanager_tableName && row['afm_docs.field_name'] == docmanager_fieldName &&  row['afm_docs.pkey_value'] == docmanager_pkey_value) {
                lockedObj.value = (row['afm_docs.locked'] == 'No') ? '0' : '1';
                lockedByObj.value = row['afm_docs.locked_by'];
                lockedDateObj.value = row['afm_docs.lock_date'];
//              lockedTimeObj.value = row['afm_docs.lock_time'];
                docmanager_lock_status = lockedObj.value;
                break;
            }
        }
    } catch (e) {
        Workflow.handleError(e);
    }

	// set DOM displayed values that depend on lock status
	if (docmanager_lock_status > 0) {
		lockedObj.checked = 1;
		unlockedObj.checked = 0;
		// currently locked by
		lockOwnerObj = $("lockPanel_afm_docs.locked_by");
		if (lockOwnerObj.value != '' && View.user.name != lockOwnerObj.value ) {
		    Ext.get("existingLockMessageArea").show();
		}
	} else {
		lockedObj.checked = 0;
		unlockedObj.checked = 1;		
	}

	var labelElem = $("lockedByLabel");
	var translatedLabel = getMessage("message_lockedby_label");
	labelElem.innerHTML = translatedLabel;

	labelElem = $("lockedOnLabel");
	translatedLabel = getMessage("message_lockedon_label");
	labelElem.innerHTML = translatedLabel;

	labelElem = $("lockedDateLabel");
	translatedLabel = getMessage("message_lockeddate_label");
	labelElem.innerHTML = translatedLabel;

	labelElem = $("lockedLabel");
	translatedLabel = getMessage("message_locked_label");
	labelElem.innerHTML = translatedLabel;

	labelElem = $("unlockedLabel");
	translatedLabel = getMessage("message_unlocked_label");
	labelElem.innerHTML = translatedLabel;

	labelElem = $("breakLockLabel");
	translatedLabel = getMessage("message_breaklock_label");
	labelElem.innerHTML = translatedLabel;
}


/**
 * if lock control changed to unlock and lock owned by other
 * display break existing lock control
 */
function handleUnlocked() {
	if (lockOwnerObj.value != '' && View.user.name != lockOwnerObj.value ) {
	    Ext.get("breakExistingLockArea").show();
	}
}

function handleLocked() {
    Ext.get("breakExistingLockArea").hide();
}
