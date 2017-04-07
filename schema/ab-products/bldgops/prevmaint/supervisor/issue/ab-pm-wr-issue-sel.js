
/**
 * Called when form is loading<br />
 *
 */
var issueSelectController = View.createController('issueSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('issue');
        tabs.disableTab('schedule');
        //change to solve KB3020528
        //addEmptyValueToEnumField(this.wo_issue_sel_console, 'wo.wo_type');
    },
    
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.wo_issue_sel_console.clear();
            this.wo_issue_sel_report.restriction = null;
            this.wo_issue_sel_report.refresh();
            tabs.disableTab('issue');
            tabs.disableTab('schedule');
        }
        if (newTabName == 'issue') {
            tabs.disableTab('schedule');
        }
        if (newTabName == 'schedule') {
            tabs.disableTab('issue');
        }
    }
});

function issueSelected(){
    var grid = View.getControl('', "wo_issue_sel_report");
    var records = grid.getPrimaryKeysForSelectedRows();
	//KB3020860
	if(records.length==0){
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}
	var result = {};
	//Issue work orders,file='WorkRequestHandler.java'
    try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkOrders', records);
	}catch (e) {
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
    var console = View.getControl('', "wo_issue_sel_console");
    
    // get the date range values in ISO format
    var datePerformFrom = console.getFieldValue('wo.date_assigned.from');
    var datePerformTo = console.getFieldValue('wo.date_assigned.to');
    
    // validate the date range 
    if (datePerformFrom != '' && datePerformTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (compareLocalizedDates($('wo.date_assigned.to').value, $('wo.date_assigned.from').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    var woFrom = console.getFieldValue('wo.wo_id.from');
    var woTo = console.getFieldValue('wo.wo_id.to');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    if ($("wo_issue_sel_console_wo.wo_type").value == "--NULL--") {
        restriction.removeClause('wo.wo_type');
    }
    
    if (datePerformFrom != '') {
        restriction.removeClause('wo.date_assigned.from');
        restriction.addClause('wo.date_assigned', datePerformFrom, '&gt;=');
    }
    if (datePerformTo != '') {
        restriction.removeClause('wo.date_assigned.to');
        restriction.addClause('wo.date_assigned', datePerformTo, '&lt;=');
    }
    if (woFrom != '') {
        restriction.removeClause('wo.wo_id.from');
        restriction.addClause('wo.wo_id', woFrom, '&gt;=');
    }
    if (woTo != '') {
        restriction.removeClause('wo.wo_id.to');
        restriction.addClause('wo.wo_id', woTo, '&lt;=');
    }
    var panel = View.getControl('', 'wo_issue_sel_report');
    panel.refresh(restriction);
    
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "wo_issue_sel_console");
    console.setFieldValue("wo.date_assigned.from", "");
    console.setFieldValue("wo.date_assigned.to", "");
    console.setFieldValue("wo.wo_id.from", "");
    console.setFieldValue("wo.wo_id.to", "");
    console.setFieldValue("wo.bl_id", "");
    //change to solve KB3020528
    console.setFieldValue("wo.wo_type", "");
}

function printWO(){
   var records = View.panels.get('wo_issue_sel_report').getSelectedRows();
   if(records.length==0){
   		return;
   }
    var woId = new 	Array();
    var restriction = new Ab.view.Restriction();
  	for (var i = 0; i < records.length; i++) {
    	woId.push(records[i]['wo.wo_id']);
	}
    restriction.addClause('wo.wo_id', woId, 'IN');
   
	View.openDialog("ab-paginated-report-job.axvw?viewName=ab-pm-issue-wo-print.axvw", {'ds_ab-pm-issue-wo-print_paginated_wo': restriction});
}
