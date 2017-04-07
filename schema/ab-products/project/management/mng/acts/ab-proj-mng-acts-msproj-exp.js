var projExportMsProjectController = View.createController('projExportMsProject', {
	
	version: '2010',

	projMngActsMsProjExpForm_onShow: function(){
		if($('version2007').checked)
			this.version = 2007;
		else if($('version2013').checked)
			this.version = 2013;
		else
			this.version = 2010;

		var restriction = View.getOpenerView().dialogRestriction;
		var projectId = restriction.clauses[0].value;
		var parameters = {
				'project_id' : projectId,
				'work_pkg_id' : '',
				'version' : this.version };
		
	
		var panel = View.panels.get('projMngActsMsProjExpForm');
        try {
        	document.getElementById("exportingMpp").innerHTML = getMessage('exportingMppMsg');
			var result = Workflow.call('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
			if (result.code == 'executed') {
				panel.refresh();
				var fileName = panel.getFieldValue('project.doc_acts_xfer');
				var keys = {'project_id': projectId};
				View.showDocument(keys, 'project', 'doc_acts_xfer', fileName);
				document.getElementById("exportingMpp").innerHTML = "";
			} else {
				View.showMessage(result.message);
			}
    	} catch (e) {
			View.showMessage(e.message);
		}
	}

});