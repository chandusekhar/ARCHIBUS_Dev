
var otherCostController = View.createController('otherCostController', {
    wr_othercost_afterRefresh: function(){
		if (this.wr_othercost.getFieldValue("wr_other.other_rs_type") == "") {
	        setCurrentLocalDateTime();
		}
	}
});



/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'wr_othercost');
    var wr_id = panel.getFieldValue("wr_other.wr_id");
    
	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wr_other.date_used", obj.date);
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}

/**
 * Called when click the button 'Save'<br />
 */
function saveOthercost(){
    var panel = View.getControl('', 'wr_othercost');
    var record = ABODC_getDataRecord2(panel);
    
    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveOtherCosts", record);
	 } 
   	catch (e) {
	Workflow.handleError(e);
 	}	
    if (result.code == 'executed') {
        var wrcode = panel.getFieldValue("wr_other.wr_id");
        View.getOpenerView().panels.get('panel_estimation').refresh();
        View.getOpenerView().panels.get('other_report').refresh();
        View.getOpenerView().closeDialog();
   	}
    else {
        Workflow.handleError(result);
    }
}
