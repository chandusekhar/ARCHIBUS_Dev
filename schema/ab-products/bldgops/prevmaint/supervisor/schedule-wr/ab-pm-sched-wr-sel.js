/**
 * Called when form is loading<br />
 * Disable review,  and schedule tabs
 */
var scheduleWrSelectController = View.createController('scheduleWrSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('review');
        tabs.disableTab('schedule');
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.sched_wr_sel_console.clear();
            this.sched_wr_sel_wr_report.restriction = null;
            this.sched_wr_sel_wr_report.refresh();
            tabs.disableTab('review');
            tabs.disableTab('schedule');
        }
        if (newTabName == 'review') {
            tabs.disableTab('schedule');
        }
        if (newTabName == 'schedule') {
            tabs.disableTab('review');
        }
    }
});

/**
 * Creates custom restriction based on the selected (status,) date range for date requested
 * and applies it to work request report
 */
function setRestriction(){
    // get reference to the console form
    var console = View.getControl('', 'sched_wr_sel_console');
    
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
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction();
    
    if (dateRequestedFrom != '') {
        restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
    }
    if (dateRequestedTo != '') {
        restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
    }
    // refresh the grid report
    var report = View.getControl('', 'sched_wr_sel_wr_report');
    report.refresh(restriction)
    
}


/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', 'sched_wr_sel_console');
    console.setFieldValue("wr.date_requested.from", '');
    console.setFieldValue("wr.date_requested.to", '');
}
