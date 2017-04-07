var updateSelectController = View.createController('updateSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('update');
        tabs.disableTab('updateWrLabor');
        tabs.disableTab('resources');
        tabs.disableTab('updateWr');
        //change to solve KB3020528
        //addEmptyValueToEnumField(this.wo_upd_sel_wo_console, 'wo.wo_type');
        this.wo_upd_sel_wr_report.restriction = 'wr.wr_id = -1';
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.wo_upd_sel_wo_console.clear();
            this.wo_upd_sel_wr_report.clear();
            this.wo_upd_sel_wo_report.restriction = null;
            this.wo_upd_sel_wo_report.refresh();
            tabs.disableTab('update');
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'update') {
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWrLabor') {
            tabs.disableTab('update');
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'resources') {
            tabs.disableTab('update');
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWr') {
            tabs.disableTab('update');
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
        }
    }
});
function setRestriction(){
    var console = View.getControl('', "wo_upd_sel_wo_console");
    
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
    
    if ($("wo_upd_sel_wo_console_wo.wo_type").value == "--NULL--") {
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
    var panelWo = View.getControl('', 'wo_upd_sel_wo_report');
    var panelWr = View.getControl('', 'wo_upd_sel_wr_report');
    panelWo.refresh(restriction);
    panelWr.clear();
    panelWr.restriction = 'wr.wr_id = -1';
}

/**
 * Clears previously created restriction.
 */
function clearRestriction(){
    var console = View.getControl('', "wo_upd_sel_wo_console");
    console.setFieldValue("wo.date_assigned.from", "");
    console.setFieldValue("wo.date_assigned.to", "");
    console.setFieldValue("wo.wo_id.from", "");
    console.setFieldValue("wo.wo_id.to", "");
    console.setFieldValue("wo.bl_id", "");
    console.setFieldValue("wo.wo_type", "");
    var panelWr = View.getControl('', 'wo_upd_sel_wr_report');
    panelWr.clear();
    panelWr.restriction = 'wr.wr_id = -1';
}

function closeWOs(){
    var grid = View.getControl('', "wo_upd_sel_wo_report");
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }
	var result = {};
	//Close work orders by calling closeWorkOrders which belong to  WorkRequestHandler.java
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkOrders', records);
    } 
    catch (e) {
        if (e.code == 'ruleFailed') {
            View.showMessage(e.message);
        }
        else {
            Workflow.handleError(e);
        }
		return;
    }
    if (result.code == 'executed') {
        for (var i = 0; i < records.length; i++) {
            var woId = records[i]['wo.wo_id'];
            var parameter = {
                tableName: 'hwr',
                fieldNames: toJSON(['hwr.wr_id', 'hwr.wo_id']),
                restriction: 'hwr.wo_id = ' + woId
            };
			var hwrResult = {};
            try {
                hwrResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter);
            } 
            catch (e) {
                Workflow.handleError(e);
            }
            if (hwrResult.code == 'executed') {
                for (var i = 0; i < hwrResult.data.records.length; i++) {
                    var wrId = hwrResult.data.records[i]['hwr.wr_id'];
                    updateEquipment(wrId);
                }
            }
            else {
                View.showMessage(hwrResult.message);
            }
        }
        grid.refresh();
        View.getControl('', 'wo_upd_sel_wr_report').clear();
    }
    else{
        Workflow.handleError(result);
    }
}
