var assignNewPartController = View.createController('assignNewPartController', {
    partPanel_afterRefresh: function(){
        setCurrentLocalDateTime();
   	}
});



/**
 * Called when click the button 'Save'<br />
 */
function saveNewPart(){
    var panel = View.getControl('', 'partPanel');
	var record = ABODC_getDataRecord2(panel);
    if (!panel.canSave()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPartWithoutPt", record);
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
	var panel = View.getControl('', 'partPanel');
    var wr_id = panel.getFieldValue("wrpt.wr_id");

	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wrpt.date_assigned", obj.date);
			panel.setInputValue("wrpt.time_assigned", obj.time);
			
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}