/**
 * Common filter functions for reports in the on demand activity
 */

/**
 * Creates custom restriction for help requests (activity_log)
 * based on the selected (status,) problem type and date range for date requested
 * and applies it to the request report
 */
function setActLogRestriction() { 
        // get reference to the console form
        var console = View.getControl('', 'request_console');
        
        // get the date range values in ISO format
        var dateRequestedFrom = console.getFieldValue('activity_log.date_requested.from');
        var dateRequestedTo = console.getFieldValue('activity_log.date_requested.to');
        
        // validate the date range 
        if (dateRequestedFrom!='' && dateRequestedTo!='') {
            // the compareLocalizedDates() function expects formatted (displayed) date values
            if (compareLocalizedDates(
                    $('activity_log.date_requested.to').value, 
                    $('activity_log.date_requested.from').value)) {
                // display the error message defined in AXVW as message element
                alert(getMessage('error_date_range'));
                return;
            }
        }	
        
        // prepare the grid report restriction from the console values
        var restriction = new Ab.view.Restriction(console.getFieldValues());
		restriction.removeClause('activity_log.date_requested.from');
		restriction.removeClause('activity_log.date_requested.to');
        try {
	        var status = console.getFieldValue('activity_log.status');
			if (status != undefined){
		        if (status == '--NULL--') {	
		            restriction.removeClause('activity_log.status');
		        }
			}
		} catch(err){}
        if (dateRequestedFrom != '') {
            restriction.addClause('activity_log.date_requested', dateRequestedFrom, '&gt;=');
        }
        if (dateRequestedTo != '') {
            restriction.addClause('activity_log.date_requested',  dateRequestedTo, '&lt;=');
        }
         // refresh the grid report tab page
        var report = View.getControl('', 'request_report');
        report.refresh(restriction)
} 

/**
 * Clears previously created restriction for activity_log
 */
function clearActLogRestriction() { 
    var console = View.getControl('', 'request_console');
    console.setFieldValue("activity_log.prob_type",'');
	console.setFieldValue("activity_log.date_requested.from",'');	
	console.setFieldValue("activity_log.date_requested.to",'');
} 

/**
 * Creates custom restriction based on the selected (status,) date range for date requested
 * and applies it to work request report
 */
function setRestriction(){
        // get reference to the console form
        var console = View.getControl('', 'request_console');
        
        // get the date range values in ISO format
        var dateRequestedFrom = console.getFieldValue('wr.date_requested.from');
        var dateRequestedTo = console.getFieldValue('wr.date_requested.to');
        
        // validate the date range 
        if (dateRequestedFrom!='' && dateRequestedTo!='') {
            // the compareLocalizedDates() function expects formatted (displayed) date values
            if (compareLocalizedDates(
                    $('wr.date_requested.to').value, 
                    $('wr.date_requested.from').value)) {
                // display the error message defined in AXVW as message element
                alert(getMessage('error_date_range'));
                return;
            }
        }	
        
        // prepare the grid report restriction from the console values
        var restriction = new Ab.view.Restriction(console.getFieldValues());
		restriction.removeClause('wr.date_requested.from');
		restriction.removeClause('wr.date_requested.to');
        try {
	        var status = console.getFieldValue('wr.status');
			if (status != undefined){
		        if (status == '--NULL--') {	
		            restriction.removeClause('wr.status');
		        }
			}
		} catch(err){}
        if (dateRequestedFrom != '') {
            restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
        }
        if (dateRequestedTo != '') {
            restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
        }
		window.selectRestriction = restriction;
        // refresh the grid report
        var report = View.getControl('', 'wr_report');
        report.refresh(restriction)
		
} 

/**
 * Clears previously created restriction.
 */
function clearRestriction() { 
    var console = View.getControl('', 'request_console');
	console.setFieldValue("wr.date_requested.from",'');	
	console.setFieldValue("wr.date_requested.to",'');
	console.setFieldValue("wr.prob_type",'');
} 

/**
 * Clears previously created restriction with a status value
 */
function clearRestrictionWithStatus(){
	var console = View.getControl('', 'request_console');
	console.setFieldValue("wr.date_requested.from",'');	
	console.setFieldValue("wr.date_requested.to",'');
	console.setFieldValue("wr.prob_type",'');
	console.setFieldValue("wr.status",'','--NULL--');
}