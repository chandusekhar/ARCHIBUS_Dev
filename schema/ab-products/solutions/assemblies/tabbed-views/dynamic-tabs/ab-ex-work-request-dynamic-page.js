/**
 * Called after the work request form is refreshed.
 */
function exWorkRequestDynamicPage_wrForm_afterRefresh(form) {
    // set view (and tab page) title based on the work request ID
    if (form.newRecord) {
        form.setTitle(getMessage('text_newWorkRequest'));
        Ab.view.View.setTitle(getMessage('text_newWorkRequest'));
    } else {
        form.setTitle(getMessage('text_editWorkRequest'));
        Ab.view.View.setTitle(form.getFieldValue('wr.wr_id'));
    }

    // copy values entered as a search criteria to the edit form when new record is edited
    if (form.newRecord) {
        var console = Ab.view.View.getControl('','exWorkRequestDynamicTabs_wrConsole');
        if (console != null) {
            var phone = console.getFieldValue('wr.phone');
            if (phone != '') {
                 form.setFieldValue('wr.phone', phone );
            }
        }
    }

    // set values of custom controls based on raw field values
    var priority = form.getFieldValue('wr.priority');
    if (!valueExists(priority) || priority == '') {
        priority = 0;
    }
    
    if (priority == 0) {
        $('exWorkRequestDynamicPage_wr.priority.eventually').checked = true;
    } else if (priority <= 25) {
        $('exWorkRequestDynamicPage_wr.priority.oneMonth').checked = true;
    } else if (priority <= 50) {
        $('exWorkRequestDynamicPage_wr.priority.oneWeek').checked = true;
    } else if (priority <= 75) {
        $('exWorkRequestDynamicPage_wr.priority.oneDay').checked = true;
    } else {
        $('exWorkRequestDynamicPage_wr.priority.emergency').checked = true;
    }
    
    // get email preferences from the server
    try {
        var preferenceEmailTo = '//preferences/mail/addresses/address[@name="maintmgrEMail"]/@value';
        var preferenceEmailCc = '//preferences/mail/addresses/address[@name="wrCCEmail"]/@value';
        
        var result = Workflow.callMethod(
            'AbSystemAdministration-ConfigHandlers-getPreferences', [preferenceEmailTo, preferenceEmailCc]);
        
        var preferences = result.data;
        $('exWorkRequestDynamicPage_emailTo').value = preferences[preferenceEmailTo];
        $('exWorkRequestDynamicPage_emailCc').value = preferences[preferenceEmailCc];
        
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Called before the work request form is saved.
 */
function exWorkRequestDynamicPage_wrForm_beforeSave(form) {
    var priority = 0;    
    if ($('exWorkRequestDynamicPage_wr.priority.oneMonth').checked) {
        priority = 25;
    } else if ($('exWorkRequestDynamicPage_wr.priority.oneWeek').checked) {
        priority = 50;
    } else if ($('exWorkRequestDynamicPage_wr.priority.oneDay').checked) {
        priority = 75;
    } else if ($('exWorkRequestDynamicPage_wr.priority.emergency').checked) {
        priority = 99;
    }
    form.setFieldValue('wr.priority', priority);
    
    // custom field validation
    if (form.getFieldValue('wr.rm_id') == '') {
        form.addInvalidField('wr.rm_id', getMessage('error_rm_id'));
        return false;
    }
}

/**
 * Called when the user clicks on the Send Email checkbox.
 */
function exWorkRequestDynamicPage_wrForm_checkEmail() {
    var form = Ab.view.View.getControl('','exWorkRequestDynamicPage_wrForm');
    var sendEmail = $('exWorkRequestDynamicPage_sendEmail').checked;
    $('exWorkRequestDynamicPage_emailTo').disabled = !sendEmail;
    $('exWorkRequestDynamicPage_emailCc').disabled = !sendEmail;
}

/**
 * Called after the work request is saved to generate an email notification.
 */
function exWorkRequestDynamicPage_wrForm_sendEmail() {
    // TODO: 
    // implement on the client (ab-products/workplace/portal/ab-wr-request-response.js)
    // or on the server (ab-products/workplace/reservations/.../ReservationsCommonHandler.java)
}

/**
 * Called after the work request is saved to refresh the work request report.
 */
function exWorkRequestDynamicPage_wrForm_refreshReport() {
    var report = Ab.view.View.getControl('','exWorkRequestDynamicTabs_wrReport');
    if (report != null) {
        report.refresh();
    }
}

/**
 * Opens a drawing dialog window that allows the user to select the room.
 */
function exWorkRequestDynamicPage_wrForm_selectRoomFromDrawing() {
    var form = View.panels.get('exWorkRequestDynamicPage_wrForm');
	var buildingId = form.getFieldValue('wr.bl_id');
	if (buildingId == '') {
		alert(getMessage('error_bl_id'));
		return;
	}
    var floorId = form.getFieldValue('wr.fl_id');
    if (floorId == '') {
    	alert(getMessage('error_fl_id'));
    	return;
    }

	var roomId = form.getFieldValue('wr.rm_id');
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('rm.bl_id', buildingId);
	restriction.addClause('rm.fl_id', floorId);
	restriction.addClause('rm.rm_id', roomId);
	
	View.openDialog('ab-ex-select-room.axvw', restriction, false, {
	    callback: function(res) {
	        var clause = res.clauses[2];
	        var value = clause.value;
	        View.panels.get('exWorkRequestDynamicPage_wrForm').setFieldValue('wr.rm_id', value);
	    }
	});
}