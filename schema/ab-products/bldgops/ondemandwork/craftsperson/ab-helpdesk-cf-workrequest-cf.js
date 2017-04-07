var assignCfController = View.createController('assignCf', {
    panel_cf_afterRefresh: function(){
	 	if (this.panel_cf.getFieldValue("wrcf.cf_id") == "") {
	 		setCurrentLocalDateTime();
	 	}
    }
});



/**
 * Called when click the button 'Save'<br />
 */
function saveCf(){
    var panel = View.getControl('', 'panel_cf');
	var record = ABODC_getDataRecord2(panel);
    
    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestCraftsperson", record);
    } 
   	catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code != 'executed') {
        Workflow.handleError(result);
    } else {
        // refresh the list of assignments to reflect the new assignment
        View.getOpenerView().panels.get('requestReportGrid').refresh();
        // close the dialog
        View.closeThisDialog();
    }
}

/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'panel_cf');
    var wr_id = panel.getFieldValue("wrcf.wr_id");
    
	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wrcf.date_assigned", obj.date);
			panel.setInputValue("wrcf.time_assigned", obj.time);
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}