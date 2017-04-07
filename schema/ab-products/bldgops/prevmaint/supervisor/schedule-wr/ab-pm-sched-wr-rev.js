/**
 * Called when loading the form<br />
 * Show workflow step history<br />
 */
var wrReviewController = View.createController('wrReviewController', {
    sched_wr_rev_wr_basic_afterRefresh: function(){
        var record = this.sched_wr_rev_wr_basic.getRecord();
        this.sched_wr_rev_wr_loc.setRecord(record);
        this.sched_wr_rev_wr_eq.setRecord(record);
        this.sched_wr_rev_wr_desc.setRecord(record);
        this.sched_wr_rev_wr_docs.setRecord(record);
        
        this.sched_wr_rev_wr_loc.show();
        this.sched_wr_rev_wr_eq.show();
        this.sched_wr_rev_wr_desc.show();
        this.sched_wr_rev_wr_docs.show();
        
        //Show workflow step history
        getStepInformation('wr', 'wr_id', record.getValue('wr.wr_id'), true);
    }
    
});

/**
 * This function is called from the button 'List User Requests' in a form showing a request record <br />
 * and opens a dialog with all requests made by the requestor of the current request.
 * @param {String} table request table (activity_log or wr)
 */
function listUserRequests(panel, table){
    //requestor is required
    var req = $(panel + '_' + table + ".requestor").value;
    if (req == "") {
        View.showMessage(getMessage("noRequestor"));
        return;
    }
    //create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause(table + ".requestor", req, '=');
    
    //open dialog
    if (table == 'wr') 
        View.openDialog("ab-pm-sched-wr-hist.axvw", restriction, false);
    if (table == 'activity_log') 
        View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
}

/**
 * This function is called from the button 'List Requests for Location' in a form showing a request record <br />
 * and opens a dialog with all requests with the same location as the current request.
 * @param {String} table request table (activity_log or wr)
 */
function listLocationRequests(panel, table){
    //building code is required
    var bl = $(panel + '_' + table + ".bl_id").value
    if (bl == "") {
        View.showMessage(getMessage("noBuilding"));
        return;
    }
    //create restriction
    var restriction = new Ab.view.Restriction();
    
    restriction.addClause(table + ".bl_id", bl, '=');
    var rm = $(panel + '_' + table + ".rm_id").value;
    if (rm != '') {
        restriction.addClause(table + ".rm_id", rm, '=');
    }
    var fl = $(panel + '_' + table + ".fl_id").value;
    if (fl != '') {
        restriction.addClause(table + ".fl_id", fl, '=');
    }
    
    //open dialog
    if (table == 'wr') 
        View.openDialog("ab-pm-sched-wr-hist.axvw", restriction, false);
    if (table == 'activity_log') 
        View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
}

/**
 * This function is called from the button 'List Requests for Equipment' in a form showing a request record <br />
 * and opens a dialog with all requests with the same equipment as the current request.
 * @param {String} table request table (activity_log or wr)
 */
function listEquipmentRequests(panel, table){
    var fieldName = table + ".eq_id";
    var eq = $(panel + '_' + fieldName).value;
    if (eq == "") {
        View.showMessage(getMessage("noEquipment"));
        return;
    }
    var restriction = new Ab.view.Restriction();
    restriction.addClause(fieldName, eq, '=');
    
    if (table == 'wr') 
        View.openDialog("ab-pm-sched-wr-hist.axvw", restriction, false);
    if (table == 'activity_log') 
        View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
}
