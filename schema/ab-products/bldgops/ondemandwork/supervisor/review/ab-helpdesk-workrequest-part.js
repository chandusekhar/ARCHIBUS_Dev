
var assignPartController = View.createController('assignPartController', {
    wr_part_afterRefresh: function(){
		if (this.wr_part.getFieldValue("wrpt.part_id") == "") {
			setCurrentLocalDateTime();
		}
		
		//KB3042777 - disable part code when edit the part assignment
		this.wr_part.enableField('wrpt.part_id',this.wr_part.newRecord);
	}
});



/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'wr_part');
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

/**
 * Called when click the button 'Save'<br />
 */
function savePart(){
    var panel = View.getControl('', 'wr_part');
    var record = ABODC_getDataRecord2(panel);
    
    //KB3037535 - the save action cause the part inventory not calculate correctly, it should be use canSave() to replace save()
    if (!panel.canSave()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPart", record);
	 } 
   	catch (e) {
	Workflow.handleError(e);
 	}	
    if (result.code == 'executed') {
        var wrcode = panel.getFieldValue("wrpt.wr_id");
        View.getOpenerView().panels.get('panel_estimation').refresh();
        View.getOpenerView().panels.get('pt_report').refresh();
        View.getOpenerView().closeDialog();
    }else{
		Workflow.handleError(result);
	}
}
