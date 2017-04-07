var updateSelectController = View.createController('updateSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('updateWrLabor');
        tabs.disableTab('resources');
        tabs.disableTab('updateWr');
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.wr_upd_sel_wr_console.clear();
            this.wr_upd_sel_wr_report.restriction = null;
            this.wr_upd_sel_wr_report.refresh();
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWrLabor') {
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'resources') {
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWr') {
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
        }
    }
    
});
/**
 * Creates custom restriction based on the selected date range for date to perform and wo_id and bl_id
 * and applies it to select tab
 */
function setRestriction(){
    var console = View.getControl('', "wr_upd_sel_wr_console");
    
    // get the date range values in ISO format
    var dateRequestedFrom = console.getFieldValue('wr.date_requested.from');
    var dateRequestedTo = console.getFieldValue('wr.date_requested.to');
    
    // validate the date range 
    if (dateRequestedFrom != '' && dateRequestedTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (compareLocalizedDates($('wr.date_requested.to').value, $('wr.date_requested.from').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    var wrFrom = console.getFieldValue('wr.wr_id.from');
    var wrTo = console.getFieldValue('wr.wr_id.to');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    if ($("wr_upd_sel_wr_console_wr.prob_type").value == "--NULL--") {
        restriction.removeClause('wr.prob_type');
    }
    
    
    if (dateRequestedFrom != '') {
        restriction.removeClause('wr.date_requested.from');
        restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
    }
    if (dateRequestedTo != '') {
        restriction.removeClause('wr.date_requested.to');
        restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
    }
    if (wrFrom != '') {
        restriction.removeClause('wr.wr_id.from');
        restriction.addClause('wr.wr_id', wrFrom, '&gt;=');
    }
    if (wrTo != '') {
        restriction.removeClause('wr.wr_id.to');
        restriction.addClause('wr.wr_id', wrTo, '&lt;=');
    }
    var panel = View.getControl('', 'wr_upd_sel_wr_report');
    panel.refresh(restriction);
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "wr_upd_sel_wr_console");
    console.setFieldValue("wr.date_requested.from", "");
    console.setFieldValue("wr.date_requested.to", "");
    console.setFieldValue("wr.wr_id.from", "");
    console.setFieldValue("wr.wr_id.to", "");
    console.setFieldValue("wr.prob_type", "");
    console.setFieldValue("wr.bl_id", "");
}

function closeWRs(){
    var grid = View.getControl('', "wr_upd_sel_wr_report");
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }

    //kb:3024805
	var result = {};
	//Close all requested work request by calling method closeWorkRequests which belong to WorkRequestHandler.java
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkRequests', records);
    } 
    catch (e) {
        if (e.code == 'ruleFailed') {
            View.showMessage(e.message);
        }
        else {
            Workflow.handleError(e);
        }
		return;
    }
    if (result.code == 'executed') {
        for (var i = 0; i < records.length; i++) {
            var wrId = records[i]['wr.wr_id'];
            updateEquipment(wrId);
        }
        grid.refresh();
    }
    else{
        Workflow.handleError(result);
    }
}
