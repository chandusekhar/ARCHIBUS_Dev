
var assignNewotherController = View.createController('assignNewotherController', {
   
	afterInitialDataFetch: function(){
	    setCurrentLocalDateTime();
        
    }
});


/**
 * Called when click the button 'Save'<br />
 */
function saveOther(){

    var panel = View.getControl('', 'otherResourcePanel');
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
	var panel = View.getControl('', 'otherResourcePanel');
	var wr_id = panel.getFieldValue("wr_other.wr_id");
	
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr', 'wr_id', wr_id);
		if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wr_other.date_used", obj.date);
			// panel.setInputValue("wr_other.time_assigned", obj.time);
		} else {
			Workflow.handleError(e);
		}
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}