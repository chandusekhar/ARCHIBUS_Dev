function runWorkFlowRule(panelId,ruleId,isDialog,parentRefreshPanelId){

	var panel = View.panels.get(panelId);
    if (!panel.canSave()) {
    	return;
    }

	var fields = panel.getFieldValues();
	var result = {};
	try {
		 result = Workflow.callMethod(ruleId, fields);
	}catch(e){
		Workflow.handleError(result);
	}
	if(result.code == 'executed'){
		var refreshPanel = null;
		if(isDialog == true){
			refreshPanel = View.getOpenerView().panels.get(parentRefreshPanelId);
		}else{
			refreshPanel = View.panels.get(parentRefreshPanelId);
		}
		refreshPanel.refresh();
		if(isDialog == true){
			View.closeThisDialog();
		}
	} else {
		Workflow.handleError(result);
	}
}	