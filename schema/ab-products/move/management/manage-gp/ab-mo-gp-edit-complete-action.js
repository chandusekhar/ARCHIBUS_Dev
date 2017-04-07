var controllerAbMoGroupEditAction = View.createController('abMoGroupEditAction_Controller', {
	 
	 afterInitialDataFetch: function(){

		var generateWorkRequest = document.getElementById("generateWorkRequest");
		var autocreate_wr = this.form_abMoGroupEditCompleteAction.getFieldValue("activity_log.autocreate_wr");    
        if (autocreate_wr == "0") {
            generateWorkRequest.checked = 0;
        }
        else {
            generateWorkRequest.checked = 1;
        }
    }
});

// genServiceRequest - Called when the Checkbox is clicked

function genServiceRequest(){
    if (document.getElementById("generateWorkRequest").checked == 1) {
        controllerAbMoGroupEditAction.form_abMoGroupEditCompleteAction.setFieldValue("activity_log.autocreate_wr","1");
    }
    else {
        controllerAbMoGroupEditAction.form_abMoGroupEditCompleteAction.setFieldValue("activity_log.autocreate_wr","0");
    }
}


//onSave action -  if genServiceRequest is checked call WFR genWorkRequest
function genServReq(){
	var projectId;
	/*
	 * KB 3031186 IOAN tabs don't use frames we must get project edit form 
	 * from View.openerView not from View.getOpenerView().getOpenerView()
	 */
	if(valueExists(View.getOpenerView().panels.get(0).fields.get('project.project_id'))){
		projectId = View.getOpenerView().panels.get(0).getFieldValue('project.project_id');
	}else if(valueExists(View.getOpenerView().getOpenerView().panels.get(0).fields.get('project.project_id'))){
		projectId = View.getOpenerView().getOpenerView().panels.get(0).getFieldValue('project.project_id');
	}
	
    if (document.getElementById("generateWorkRequest").checked == 1) {
		Workflow.callMethod('AbMoveManagement-MoveService-genWorkRequest', controllerAbMoGroupEditAction.form_abMoGroupEditCompleteAction.getFieldValue('activity_log.activity_log_id'), projectId ,null);
    }
}

/**
 * afterRefresh event for "form_abMoGroupEditCompleteAction" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function form_abMoGroupEditCompleteAction_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditIssue_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}