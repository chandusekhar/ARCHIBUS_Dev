var updateSelectController = View.createController('updateSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.isCfUpdate = true;
        tabs.disableTab('updateWrLabor');
        tabs.disableTab('resources');
        tabs.disableTab('updateWr');
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.cf_upd_wr_sel_console.clear();
            this.cf_upd_wr_sel_wr_report.restriction = null;
            this.cf_upd_wr_sel_wr_report.refresh();
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
    var console = View.getControl('', "cf_upd_wr_sel_console");
    
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
    
    if ($("cf_upd_wr_sel_console_wr.prob_type").value == "--NULL--") {
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
    var panel = View.getControl('', 'cf_upd_wr_sel_wr_report');
    panel.refresh(restriction);
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "cf_upd_wr_sel_console");
    console.setFieldValue("wr.date_requested.from", "");
    console.setFieldValue("wr.date_requested.to", "");
    console.setFieldValue("wr.wr_id.from", "");
    console.setFieldValue("wr.wr_id.to", "");
    console.setFieldValue("wr.prob_type", "");
}



var PanelId = '', Type = '';
function openDialog(){
    if (Type == "woFrom") {
        View.selectValue(PanelId, getMessage('wrFrom'), ['wr.wr_id.from'], 'wr', ['wr.wr_id'], ['wr.wr_id', 'wr.description'], null, null, null, null, null, 800, 500, null, null, null);
    }
    else 
        if (Type == "woTo") {
            View.selectValue(PanelId, getMessage('wrTo'), ['wr.wr_id.to'], 'wr', ['wr.wr_id'], ['wr.wr_id', 'wr.description'], null, null, null, null, null, 800, 500, null, null, null);
        }
}

function InitialPara(panelid, type){
    PanelId = panelid;
    Type = type;
    
}
