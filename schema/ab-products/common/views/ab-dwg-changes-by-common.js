/**
 * show drawing versions modified by user
 * @param ctx - command context
 */
function showVersionByUser(ctx){
	var restriction = ctx.restriction;
	var userName = restriction["afm_users.user_name"];
	var targetPanel = View.panels.get("bDwgChangesByUserVersion");
	targetPanel.refresh(new Ab.view.Restriction({"afm_dwgvers.performed_by": userName}));
}

/**
 * delete all enterprise graphics
 */
function deleteAllGraphics(){
	var confimMessage = getMessage("confirm_delete_graphics");
	
    View.confirm(confimMessage, function(button){
        if (button == 'yes') {
            try {
            	var jobId = Workflow.startJob('AbCommonResources-GraphicsService-deleteAllEnterpriseGraphics');
        	    View.openJobProgressBar(getMessage('status_deleting_graphics_files'), jobId, '', function(status) {});
            } 
            catch (e) {
            	Workflow.handleError(e);
            }
        }
    });
}

/**
 * delete all unused graphics
 */
function deleteUnusedGraphics(){
	var confimMessage = getMessage("confirm_delete_unused_graphics");
	
    View.confirm(confimMessage, function(button){
        if (button == 'yes') {
            try {
            	var jobId = Workflow.startJob('AbCommonResources-GraphicsService-deleteUnusedEnterpriseGraphics');
        	    View.openJobProgressBar(getMessage('status_deleting_graphics_unused_files'), jobId, '', function(status) {});
            } 
            catch (e) {
            	Workflow.handleError(e);
            }
        }
    });
}