var assignNewToolController = View.createController('assignNewToolController', {
    toolPanel_afterRefresh: function(){
        setCurrentLocalDateTime();
        
    }
});

/**
 * Called when click the button 'Save'<br />
 */
function saveNewTool(){
    var panel = View.getControl('', 'toolPanel');
	var record = ABODC_getDataRecord2(panel);
    
    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool", record);
    } 
   	catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code != 'executed') {
        Workflow.handleError(result);
    } else {
    	View.getOpenerView().parentTab.loadView();
    }
}


/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'toolPanel');
    var wr_id = panel.getFieldValue("wrtl.wr_id");
    
	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wrtl.date_assigned", obj.date);
			panel.setInputValue("wrtl.time_assigned", obj.time);
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}