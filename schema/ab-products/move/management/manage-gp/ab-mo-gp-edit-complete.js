// On Closing a Group Move

function onCloseGroupMove(){
    var form = View.panels.items[0];
    var project_id = form.getFieldValue('project.project_id');
    
    try {
        Workflow.callMethod('AbMoveManagement-MoveService-closeGroupMove', project_id);
        
        // we hide the Close button and change the project status to
        // Closed
        form.enableButton('closeButton', false);
		/*
		 * 04/15/2010 IOAN KB 3027046
		 */
		setStatusAddingOption(form, form.fields.get('project.status'), "Closed");
		
		
		/*
		 * KB 3031210 - refresh grid panels in order to appear the updated status
		 */
		
		View.panels.get('grid_abMoGroupListCompleteEm_pr').refresh();
		View.panels.get('grid_abMoGroupListCompleteHire_mo').refresh();
		View.panels.get('grid_abMoGroupListCompleteLeaving_mo').refresh();
		View.panels.get('grid_abMoGroupListCompleteEq_mo').refresh();
		View.panels.get('grid_abMoGroupListCompleteAsset_mo').refresh();
		View.panels.get('grid_abMoGroupListCompleteRm_mo').refresh();
		View.panels.get('grid_abMoGroupListCompleteAction_ac').refresh();
		
    } 
    catch (e) {
        View.showMessage(e.message);
    }
}

