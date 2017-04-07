
var abOdmdReqDispatchSlktControllert = View.createController("abHelpdeskWorkorderManageSelectControllert", {

    /**when the tab was selected the first panel is refresh ,but other panels need be refreshed manually 
     * ,the follow code for it
     */
    workOrderPanel_afterRefresh: function(){
        document.getElementById("priority").value = this.workOrderPanel.getFieldValue("wo.priority");
        var woid = this.workOrderPanel.getFieldValue('wo.wo_id');
        if (woid != '') {
        
            var restriction = new Ab.view.Restriction();
            restriction.addClause("wr.wo_id", woid, "=");
            this.requestReportGrid.refresh(restriction, true);
        }
        else {
            this.requestReportGrid.clear();
        }
        
    }
});

/**
 * Saves workorder<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#saveWorkorder(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-saveWorkorder</a><br />
 * Called by 'Save Work Order' button<br />
 * Reloads details tab page
 * @param {String} formName current form
 */
/**
 add the new record in the next tab
 */
function addWorkRequest(){

    var woid = View.panels.get('workOrderPanel').getFieldValue('wo.wo_id')
    View.WRrecords = woid;
    
    var rest = {
        "wr.wo_id": woid
    };
    
    View.parentTab.parentPanel.selectTab('editWorkrequest', rest, true, true, true);
    
    
}

/**get the multi select records
 *
 *
 */
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

//delete the records through the deleteRecords workflow
function deleteItems(panelId, tableName){
    var grid = View.panels.get(panelId);
    var records = grid.getPrimaryKeysForSelectedRows();
    
    if (records.length < 1) {
        View.showMessage(getMessage('noRecordSelected'));
        return true;
    }
	var result = {};
    try {
		 result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', records,tableName);
	 } 
   	catch (e) {
		Workflow.handleError(e);
 	}	
    var results = eval("(" + result.jsonExpression + ")");
    
    if (result.code == 'executed') {
    
        grid.refresh();
    }
    else {
        Workflow.handleError(result);
    }
}


function setPriorityValue(panelId) {
	var selectedEL = document.getElementById("priority");
	var priorityValue = selectedEL.options[selectedEL.selectedIndex].value
	var panel = View.panels.get(panelId);
	panel.setFieldValue("wo.priority", priorityValue);
}

