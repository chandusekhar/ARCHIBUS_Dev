// On Routing a Group Move for Approval

function onRouteGroupMoveForApproval(cmdContext){
    var form = cmdContext.command.getParentPanel();
    var project_id = form.getFieldValue('project.project_id');
    var apprv_mgr1 = form.getFieldValue('project.apprv_mgr1');
    var apprv_mgr2 = form.getFieldValue('project.apprv_mgr2');
    var apprv_mgr3 = form.getFieldValue('project.apprv_mgr3');
    
    if ((apprv_mgr1 != "" && apprv_mgr2 != "" && apprv_mgr1 == apprv_mgr2) ||
    (apprv_mgr1 != "" && apprv_mgr3 != "" && apprv_mgr1 == apprv_mgr3) ||
    (apprv_mgr2 != "" && apprv_mgr3 != "" && apprv_mgr2 == apprv_mgr3)) {
        View.showMessage(getMessage('same_apprv_mgr'));
        return;
    }
    else {
        try {
            Workflow.callMethod('AbMoveManagement-MoveService-routeGroupMoveForApproval', project_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
            
            // we disable the Route button and change the project status to
            // Requested-Routed
            form.enableButton('routeButton', false);
			/*
			 * 04/15/2010 IOAN KB 3027046
			 */
			setStatusAddingOption(form, form.fields.get('project.status'), "Requested-Routed");
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
}


function form_abMoGroupEditRoute_pr_afterRefresh(form){
	refreshTabs(form);
	replaceNewLinesInDivFields(form, false);
}