var ucProjectRenameCtrl = View.createController('ucProjectRenameCtrl', {
	projectSelectPanel_onRenameProject: function() {
		var oldProjectId = projectSelectPanel.getFieldValue("project.project_id");
		var newProjectId = projectSelectPanel.getFieldValue("project.project_id_new");
		
		// Check validity of old project name
		var record = UC.Data.getDataRecord('project', ['project_id'], "project_id='"+oldProjectId.replace(/'/g, "''")+"'");
		if (record == null) {
			View.showMessage('The project id "'+oldProjectId+'" does not exist.');
			return false;
		}
		
				
		// Check validity of new project name
		var record = UC.Data.getDataRecord('project', ['project_id'], "project_id='"+newProjectId.replace(/'/g, "''")+"'");
		if (record != null) {
			View.showMessage('The project id "'+newProjectId+'" already exists.');
			return false;
		}
		
		View.confirm('You are about to rename project "'+oldProjectId+'" to "'+newProjectId+'". Continue with rename?', function(button) {
			if (button == 'yes') {
				var result = {};
				try {
					result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-projectRename', oldProjectId, newProjectId);
					projectSelectPanel.setFieldValue("project.project_id", "");
					projectSelectPanel.setFieldValue("project.project_id_new", "");
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	}
});

function openProjSelVal() {
	View.selectValue('projectSelectPanel', 'Select Project Name',['project.project_id'],'project',['project.project_id'],['project.project_id','project.status','project.summary'],null,
	null,null,null,null,null,null,null,null,"[{fieldName:'project.project_id'}]");

}