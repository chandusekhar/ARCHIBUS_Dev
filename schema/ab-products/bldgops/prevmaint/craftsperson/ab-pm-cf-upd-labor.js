/**
 * Creates custom restriction based on the selected date range for date start and wr_id
 * and applies it to select tab
 */
function setRestriction(){
    var console = View.getControl('', "cf_upd_labor_wrcf_console");
    
    // get the date range values in ISO format
    var dateStartFrom = console.getFieldValue('wrcf.date_start.from');
    var dateStartTo = console.getFieldValue('wrcf.date_start.to');
    
    // validate the date range 
    if (dateStartFrom != '' && dateStartTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (compareLocalizedDates($('wrcf.date_start.to').value, $('wrcf.date_start.from').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    if (dateStartFrom != '') {
        restriction.removeClause('wrcf.date_start.from');
        restriction.addClause('wrcf.date_start', dateStartFrom, '&gt;=');
    }
    if (dateStartTo != '') {
        restriction.removeClause('wrcf.date_start.to');
        restriction.addClause('wrcf.date_start', dateStartTo, '&lt;=');
    }
    var panel = View.getControl('', 'cf_upd_labor_wrcf_report');
    panel.refresh(restriction);
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "cf_upd_labor_wrcf_console");
    console.setFieldValue("wrcf.date_start.from", "");
    console.setFieldValue("wrcf.date_start.to", "");
    console.setFieldValue("wrcf.wr_id", "");
}

/**
 * Update costs for a craftsperson<br />
 * Called when wrcf panel is saved<br />
 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#updateCraftspersonCosts(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-updateCraftspersonCosts</a><br />
 */
function updateCf(){
    var form = View.getControl('', 'cf_upd_labor_wrcf_form')
    form.save();
    
    var fields = form.getFieldValues();
    
  	//kb:3024805
	var result = {};
    try {
		//Update Craftsperson costs , file='WorkRequestHandler.java'
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateCraftspersonCosts', fields);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (result.code == 'executed') {
        var panel = View.getControl('', 'cf_upd_labor_wrcf_report');
        panel.refresh(null);
    }
    else {
        Workflow.handleError(result);
    }
}

function selectWrId(){
    var restriction = "wr.status='I' AND wr.wr_id IN (SELECT wrcf.wr_id FROM wrcf WHERE wrcf.cf_id IN(SELECT cf.cf_id FROM cf WHERE cf.email='" + View.user.email + "'))";
    View.selectValue("cf_upd_labor_wrcf_console", getMessage('wrTableName'), ["wrcf.wr_id"], "wr", ["wr.wr_id"], ["wr.wr_id", "wr.prob_type", "wr.status", "wr.description"], restriction);
}
