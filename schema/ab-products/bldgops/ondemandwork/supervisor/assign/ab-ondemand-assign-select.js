var abOdmdReqDispatchSlktControllert = View.createController("abOdmdReqDispatchSlktControllert", {
    loadNew: true,
    probType: '',
    requestDateFrom: '',
    requestDateTo: '',
    isNeedReturn: false,
    
    /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
    
    afterInitialDataFetch: function(){
        this.inherit();
        this.setRequestConsole();
        
    },
    
    requestConsole_beforeRefresh: function(){
        //@lei for  after create a new workorder to refresh the view
        this.requestReportGrid.refresh();
    },
    
    requestConsole_afterRefresh: function(){
        this.setRequestConsole();
        var ifRefresh = '';
        //refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
        ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_dispatch_edit"];
        if (valueExists(ifRefresh) && ifRefresh == true) {
            ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_dispatch_edit"] = false;
            this.requestConsole_onFilter();
        }
        
        
        
    },
    // var tabs = View.getOpenerView().panels.get("tabs");
    //mainTabs.showTab("quest")
    //	tabs.hideTab("quest"); 
    setRequestConsole: function(){
        this.requestConsole.setFieldValue("wr.prob_type", this.probType);
        this.requestConsole.setFieldValue("wr.date_requested.from", this.requestDateFrom);
        this.requestConsole.setFieldValue("wr.date_requested.to", this.requestDateTo);
    },
    //getParamater()
    
    requestConsole_onFilter: function(){
        var restriction = this.getRestriction();
        this.saveRequestConsoleParameters();
        this.requestReportGrid.refresh(restriction);
    },
    
    requestConsole_onClear: function(){
        this.requestConsole.setFieldValue("wr.prob_type", '');
        this.requestConsole.setFieldValue("wr.date_requested.from", '');
        this.requestConsole.setFieldValue("wr.date_requested.to", '');
        
        this.probType = '';
        this.requestDateFrom = '';
        this.requestDateTo = '';
        
        this.requestConsole_onFilter();
    },
    
    saveRequestConsoleParameters: function(){
        //save the current parameters for refresh later.
        var requestDateFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
        var requestDateTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
        
        this.requestDateFrom = requestDateFrom;
        this.requestDateTo = requestDateTo;
        this.probType = this.requestConsole.getFieldValue("wr.prob_type");
    },
    
    getRestriction: function(){
        var dateRequestedFrom = this.requestConsole.getFieldValue("wr.date_requested.from");
        var dateRequestedTo = this.requestConsole.getFieldValue("wr.date_requested.to");
        
        // validate the date range 
        if (dateRequestedFrom != '' && dateRequestedTo != '') {
            if (compareLocalizedDates(this.requestConsole.getFieldElement("wr.date_requested.to").value, this.requestConsole.getFieldElement("wr.date_requested.from").value)) {
                // display the error message defined in AXVW as message element
                return;
            }
        }
        
        
        // prepare the grid report restriction from the console values
        var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
        
        restriction.removeClause('wr.date_requested.from');
        restriction.removeClause('wr.date_requested.to');
        
        if (dateRequestedFrom != '') {
            restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
        }
        if (dateRequestedTo != '') {
            restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
        }
        //alert(toJSON(restriction));
        return restriction;
    },
    requestReportGrid_afterRefresh: function(){
    	highlightWrBySubstitute(this.requestReportGrid,false);
	}
});

/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-ondemand-assign-select.axvw' target='main'>ab-ondemand-assign-select.axvw</a>
 
 function user_form_onload(){
 var tabs = getFrameObject(parent,'tabsFrame');
 if(tabs != null){
 tabs.setTabEnabled('details', false);
 }
 }
 */
/**
 * Open dialog to create a new work order for selected work request(s)<br />
 * Called by 'Create Work Order' button
 */
function createWorkOrder(){

    var grid = View.panels.get('requestReportGrid');
    var records = grid.getPrimaryKeysForSelectedRows(grid);
    if (records.length == 0) {
        alert(getMessage("noRecords"));
        return
    }
    View.WRrecords = records;
    
    View.openDialog("ab-helpdesk-request-create-workorder.axvw", {}, true, 100, 100, 900, 400);
}

/**
 * Open dialog to select work order to assign selected work request(s) to<br />
 * Called by 'Assign to Work Order'
 */
function attachToWorkOrder(){
    var grid = View.panels.get('requestReportGrid');
    var records = grid.getPrimaryKeysForSelectedRows(grid);
    if (records.length == 0) {
        alert(getMessage("noRecords"));
        return
    }
    View.WRrecords = records;
    
    View.openDialog("ab-helpdesk-request-select-workorder.axvw", {}, false);
}

function getPrimaryKeysForSelectedRows(grid){
    var selectedRows = new Array();
    
    var dataRows = grid.getDataRows();
    for (var r = 0; r < dataRows.length; r++) {
        var dataRow = dataRows[r];
        
        var selectionCheckbox = dataRow.firstChild.firstChild;
        if (selectionCheckbox.checked) {
        
            var rowKeys = grid.getPrimaryKeysForRow(grid.rows[r]);
            selectedRows.push(rowKeys);
        }
    }
    
    return selectedRows;
}


function getPrimaryKeysForRow(row){
    var keys = new Object();
    for (var i = 0; i < grid.primaryKeyIds.length; i++) {
        var id = grid.primaryKeyIds[i];
        keys[id] = row[id + ".key"];
    }
    return keys;
}


