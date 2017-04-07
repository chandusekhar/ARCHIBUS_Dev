
/**
 * Called when form is loading<br />
 *
 */
var issueSelectController = View.createController('issueSelectController', {
    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('issue');
    },
    
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.issue_wr_sel_wr_console.clear();
            this.issue_wr_sel_wr_report.restriction = null;
            this.issue_wr_sel_wr_report.refresh();
            tabs.disableTab('issue');
        }
    }
});

function issueSelected(){
    var grid = View.getControl('', "issue_wr_sel_wr_report");
    var records = grid.getSelectedRows();
    
	if(records.length < 1){
		View.showMessage(getMessage("noRecordSelected"));
		return;
	}

    var wrRecords = [];
	  
    for (var i = 0; i < records.length; i++) {
		wrRecords[i] = new Object();
        wrRecords[i]['wr.wr_id'] = records[i]["wr.wr_id"];
		wrRecords[i]['wr.wo_id'] = records[i]["wr.wo_id"];
    }
    
	//kb:3024805
	var result = {};
	//Issue work requests that have been approved. file='WorkRequestHandler.java'.
    try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequests', wrRecords);
	} 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
            Workflow.handleError(e); 
        }
        return;
    }
    if (result.code == 'executed') {
        grid.refresh();
    }
    else {
        Workflow.handleError(result);
    }
}

function cancelWrs(){
    var grid = View.getControl('', "issue_wr_sel_wr_report");
    var records = grid.getPrimaryKeysForSelectedRows();
	//KB3020860
	if(records.length==0){
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}

    //kb:3024805
	var result = {};
	//Cancel Work Requests , file='WorkRequestHandler.java'.
    try {
	    result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequests', records);
	} 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
            Workflow.handleError(e); 
        }
        return;
    }
    if (result.code == 'executed') {
        grid.refresh();
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Creates custom restriction based on the selected date range for date to perform and wo_id and bl_id
 * and applies it to select tab
 */
function setRestriction(){
    var console = View.getControl('', "issue_wr_sel_wr_console");
    
    // get the date range values in ISO format
    var datePerformFrom = console.getFieldValue('wr.date_requested.from');
    var datePerformTo = console.getFieldValue('wr.date_requested.to');
    
    // validate the date range 
    if (datePerformFrom != '' && datePerformTo != '') {
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
    
    if ($("issue_wr_sel_wr_console_wr.prob_type").value == "--NULL--") {
        restriction.removeClause('wr.prob_type');
    }
    
    if (datePerformFrom != '') {
        restriction.removeClause('wr.date_requested.from');
        restriction.addClause('wr.date_requested', datePerformFrom, '&gt;=');
    }
    if (datePerformTo != '') {
        restriction.removeClause('wr.date_requested.to');
        restriction.addClause('wr.date_requested', datePerformTo, '&lt;=');
    }
    if (wrFrom != '') {
        restriction.removeClause('wr.wr_id.from');
        restriction.addClause('wr.wr_id', wrFrom, '&gt;=');
    }
    if (wrTo != '') {
        restriction.removeClause('wr.wr_id.to');
        restriction.addClause('wr.wr_id', wrTo, '&lt;=');
    }
    var panel = View.getControl('', 'issue_wr_sel_wr_report');
    panel.refresh(restriction);
    
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "issue_wr_sel_wr_console");
    console.setFieldValue("wr.date_requested.from", "");
    console.setFieldValue("wr.date_requested.to", "");
    console.setFieldValue("wr.wr_id.from", "");
    console.setFieldValue("wr.wr_id.to", "");
    console.setFieldValue("wr.bl_id", "");
    console.setFieldValue("wr.prob_type", "");
}

//Guo added 2009-08-28 to fix KB3023503
function printWO(){
   var records = View.panels.get('issue_wr_sel_wr_report').getSelectedRows();
   if(records.length==0){
   		return;
   }
    var woId = new 	Array();
    var restriction = new Ab.view.Restriction();
  	for (var i = 0; i < records.length; i++) {
    	woId.push(records[i]['wr.wo_id']);
	}
    restriction.addClause('wo.wo_id', woId, 'IN');
   
	View.openDialog("ab-paginated-report-job.axvw?viewName=ab-pm-issue-wo-print.axvw", {'ds_ab-pm-issue-wo-print_paginated_wo': restriction});
}