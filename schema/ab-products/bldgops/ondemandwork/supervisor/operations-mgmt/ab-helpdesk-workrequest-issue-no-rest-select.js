
function issueSelected(){
	var panel = View.panels.get("wo_report");
	var records = panel.getPrimaryKeysForSelectedRows();
	
	if(records.length < 1){
		View.showMessage("No items are selected");
		return;
	}
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-workRequestService-issueWorkOrders',records);
	}catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		    Workflow.handleError(e);
		}
		return;
 	}
	if (result.code == 'executed'){
		panel.refresh();
	} else {
		Workflow.handleError(result);
	}
}