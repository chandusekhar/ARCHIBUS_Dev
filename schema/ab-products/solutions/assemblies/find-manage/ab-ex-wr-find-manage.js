
// --------------------------- work request console functions --------------------------------------


/**
 * Called when the user changes the selection in the Requested combo box.
 * Enables or disables From and To date fields depending on the selection.
 */
function exWrFindManage_wrConsole_checkDateRange() {
    // 'exWrFindManage_requested' is a custom HTML element, use $() function to access it
    var requested = $('exWrFindManage_requested').value;
    var enabled = (requested == 'Date Range');
    
    var console = View.panels.get('exWrFindManage_wrConsole');
    console.enableField('wr.date_requested.from', enabled);
    console.enableField('wr.date_requested.to', enabled);
}

/**
 * Prepares custom console restriction and applies it to the work request report.
 */
function exWrFindManage_wrConsole_applyRestriction() {
    var console = View.panels.get('exWrFindManage_wrConsole');
    var restriction = console.getFieldRestriction();
    
    // map Urgency list selection to the wr.priority value range
    var urgency = $('exWrFindManage_urgency').value;
    if (urgency == 'emergency') {
        restriction.addClause('wr.priority', '75', '>');
    } else if (urgency == 'oneDay') {
        restriction.addClause('wr.priority', '75', '<=');
        restriction.addClause('wr.priority', '50', '>');
    } else if (urgency == 'oneWeek') {
        restriction.addClause('wr.priority', '50', '<=');
        restriction.addClause('wr.priority', '25', '>');
    } else if (urgency == 'oneMonth') {
        restriction.addClause('wr.priority', '25', '<=');
        restriction.addClause('wr.priority', '0', '>');
    } else if (urgency == 'eventually') {
        restriction.addClause('wr.priority', '0')
    }
    
    // map Requested list selection to the wr.date_requested value range
	var today = new Date();
	var day	  = today.getDate();
	var month = today.getMonth()+ 1;
	var year  = today.getFullYear();

    restriction.removeClause('wr.date_requested');
        
    var requested = $('exWrFindManage_requested').value;
    if (requested == 'Date Range') {
        var dateRequestedFrom = console.getFieldValue('wr.date_requested.from');
        if (dateRequestedFrom != '') {
            restriction.addClause('wr.date_requested', dateRequestedFrom, '>=');
        }
        var dateRequestedTo = console.getFieldValue('wr.date_requested.to');
        if (dateRequestedTo != '') {
            restriction.addClause('wr.date_requested', dateRequestedTo, '<=');
        }
        
    } else if (requested =='Today') {
        restriction.addClause('wr.date_requested', console.formatDate(day, month, year));
        
    } else if (requested =='This Week') {
		var thisWeekStartDate = new Date(today.getTime() - 24*60*60*1000 * today.getDay());
		var thisWeekEndDate = new Date(today.getTime() + 24*60*60*1000 * (6 - today.getDay()));
        restriction.addClause('wr.date_requested', console.formatDate(thisWeekStartDate.getDate(), thisWeekStartDate.getMonth()+1, thisWeekStartDate.getFullYear()), '>=');
        restriction.addClause('wr.date_requested', console.formatDate(thisWeekEndDate.getDate(), thisWeekEndDate.getMonth()+1, thisWeekEndDate.getFullYear()), '<=');
        
    } else if (requested =='This Month') {
        var daysInThisMonth = GetMonthMaxDays(month, year);
        restriction.addClause('wr.date_requested', console.formatDate(1, month, year), '>=');
        restriction.addClause('wr.date_requested', console.formatDate(daysInThisMonth, month, year), '<=');
        
    } else if (requested =='This Year') {
        restriction.addClause('wr.date_requested', console.formatDate(1, 1, year), '>=');
        restriction.addClause('wr.date_requested', console.formatDate(31, 12, year), '<=');
    }
    
    // apply restriction to the report
    var report = View.panels.get('exWrFindManage_wrReport');
    report.refresh(restriction);
    
    // show the report
    report.show(true);
}

// --------------------------- work request edit form functions ------------------------------------

/**
 * Called after the work request form is refreshed.
 */
function exWrFindManage_wrForm_afterRefresh(form) {
    if (form.newRecord) {
        form.setTitle(getMessage('formTitleAddNew'));
    } else {
        form.setTitle(getMessage('formTitleReview'));
    }

    var priority = form.getFieldValue('wr.priority');
    
    if (!valueExists(priority) || priority == '') {
        priority = 0;
    }
    
    if (priority == 0) {
        $('exWrFindManage_wr.priority.eventually').checked = true;
    } else if (priority <= 25) {
        $('exWrFindManage_wr.priority.oneMonth').checked = true;
    } else if (priority <= 50) {
        $('exWrFindManage_wr.priority.oneWeek').checked = true;
    } else if (priority <= 75) {
        $('exWrFindManage_wr.priority.oneDay').checked = true;
    } else {
        $('exWrFindManage_wr.priority.emergency').checked = true;
    }
    
    // get email preferences from the server
    try {
        var preferenceEmailTo = '//preferences/mail/addresses/address[@name="maintmgrEMail"]/@value';
        var preferenceEmailCc = '//preferences/mail/addresses/address[@name="wrCCEmail"]/@value';
        
        var result = Workflow.callMethod(
            'AbSystemAdministration-ConfigHandlers-getPreferences', [preferenceEmailTo, preferenceEmailCc]);
        
        var preferences = result.data;
        $('exWrFindManage_emailTo').value = preferences[preferenceEmailTo];
        $('exWrFindManage_emailCc').value = preferences[preferenceEmailCc];
        
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Called before the work request form is saved.
 */
function exWrFindManage_wrForm_beforeSave(form) {
    var priority = 0;    
    if ($('exWrFindManage_wr.priority.oneMonth').checked) {
        priority = 25;
    } else if ($('exWrFindManage_wr.priority.oneWeek').checked) {
        priority = 50;
    } else if ($('exWrFindManage_wr.priority.oneDay').checked) {
        priority = 75;
    } else if ($('exWrFindManage_wr.priority.emergency').checked) {
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
 * Opens a drawing dialog window that allows the user to select the room.
 */
function exWrFindManage_wrForm_selectRoomFromDrawing() {
    var form = View.panels.get('exWrFindManage_wrForm');
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
            View.panels.get('exWrFindManage_wrForm').setFieldValue('wr.rm_id', value);
        }
    });
}

/**
 * Called when the user clicks on the Send Email checkbox.
 */
function exWrFindManage_wrForm_checkEmail() {
    var form = View.panels.get('exWrFindManage_wrForm');
    var sendEmail = $('exWrFindManage_sendEmail').checked;
    $('exWrFindManage_emailTo').disabled = !sendEmail;
    $('exWrFindManage_emailCc').disabled = !sendEmail;
}

/**
 * Called after the work request is saved to generate an email notification.
 */
function exWrFindManage_wrForm_sendEmail() {
    // TODO: 
    // implement on the client (ab-products/workplace/portal/ab-wr-request-response.js)
    // or on the server (ab-products/workplace/reservations/.../ReservationsCommonHandler.java)
}

/**
 * Called after the work request is saved to refresh the work request report.
 */
function exWrFindManage_wrForm_refreshReport() {
    var form = View.panels.get('exWrFindManage_wrForm');
    var report = View.panels.get('exWrFindManage_wrReport');
    
    // when new work request is created, the report may not be displayed, so we don't want to refresh it
    if (!form.newRecord) {
        report.refresh();
    }
}

/**
 * Copies values entered as a search criteria to the edit form when new record is edited.
 */
function wr_copy_console_values() {
    var wrConsole = View.panels.get('exWrFindManage_wrConsole');
    var wrForm = View.panels.get('exWrFindManage_wrForm');

	var wrPhone = wrConsole.getFieldValue('wr.phone');
    if (wrPhone != '') {
         wrForm.setFieldValue('wr.phone', wrPhone );
    }
}
