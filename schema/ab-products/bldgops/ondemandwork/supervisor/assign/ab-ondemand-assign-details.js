var lastStepCode;
var lastStepLogId;
var lastStepType;

var abHelpdeskRequestViewController = View.createController("abHelpdeskRequestViewController", {
	locArray:[],
    request_panel_beforeRefresh: function(){
        this.panel_documents.show(false);

    },

    request_panel_afterRefresh:function(){
        //this.refreshPanel();
        var record = this.request_panel.getRecord();
        this.panel_work_location.setRecord(record);
        this.panel_equipment.setRecord(record);
        this.panel_problem.setRecord(record);
        this.panel_documents.setRecord(record);
        //	this.enableTab();
        this.panel_work_location.show(true);
        this.panel_equipment.show(true);
        this.panel_problem.show(true);
        //	this.panel_documents.show(true);
        var wrid = this.request_panel.getFieldValue('wr.wr_id');
        restriction = new Ab.view.Restriction();
        restriction.addClause("wrtr.wr_id", wrid, "=");
        View.panels.get('tr_report').refresh(restriction);
        View.panels.get('cf_report').refresh(restriction);
        
        ABODC_hideEmptyDocumentPanel("wr", this.panel_documents, '');
        ABODC_getStepInformation("wr", "wr_id", wrid, this.panel_history, "history", true);  
        
    },

    refreshPanel: function(){
        var record = this.request_panel.getRecord();
        this.panel_work_location.setRecord(record);
        this.panel_equipment.setRecord(record);
        this.panel_problem.setRecord(record);
        //this.panel_documents.setRecord(record);
        
        this.panel_work_location.show(true);
        this.panel_equipment.show(true);
        this.panel_problem.show(true);
        //	this.panel_documents.show(true);
        var wrid = this.request_panel.getFieldValue('wr.wr_id');
        restriction = new Ab.view.Restriction();
        restriction.addClause("wrtr.wr_id", wrid, "=");
        View.panels.get('tr_report').refresh(restriction);
        View.panels.get('cf_report').refresh(restriction);
        
    },
	
	panel_history_afterRefresh: function(){
		ABODC_reloadHistoryPanel(this.panel_history);
    }
});

/**
 * Opens new dialog for satisfaction survey for current request<br />
 * Called by button 'Satisfaction Survey' which is only shown when the request status is 'Completed'
 */
function createWorkOrder(){
    var wrid = View.panels.get("request_panel").getFieldValue('wr.wr_id');
    
    View.WRrecords = [{
        'wr.wr_id': wrid
    }];
    View.openDialog("ab-helpdesk-request-create-workorder.axvw", {}, true, 100, 100, 900, 400);
}

/**
 * Open dialog to select work order to assign this work request to<br />
 * Called by 'Assign to Work Order' button
 */
function attachToWorkOrder(){

    var wrid = View.panels.get("request_panel").getFieldValue('wr.wr_id');
    
    View.WRrecords = [{
        'wr.wr_id': wrid
    }];
    
    View.openDialog("ab-helpdesk-request-select-workorder.axvw", {}, false);
}


