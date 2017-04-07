var projMngPkgActMsProjExpController = View.createController('projMngPkgActMsProjExp', {
	
	version: '2010',

	projMngPkgActMsProjExpForm_onShow: function(){
		if($('version2007').checked)
			this.version = 2007;
		else if($('version2013').checked)
			this.version = 2013;
		else
			this.version = 2010;

		var restriction = View.getOpenerView().dialogRestriction;
		var projectId = restriction.clauses[0].value;
		var workPkgId = restriction.clauses[1].value;
		
		var parameters = {
				'project_id' : projectId,
				'work_pkg_id' : workPkgId,
				'version' : this.version };
		
	
		var panel = View.panels.get('projMngPkgActMsProjExpForm');
        try {
        	document.getElementById("exportingMpp").innerHTML = getMessage('exportingMppMsg');
        	
			var result = Workflow.call('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
			if (result.code == 'executed') {
				panel.refresh();
				var fileName = panel.getFieldValue('work_pkgs.doc_acts_xfer');
				var keys = {'project_id': projectId, 'work_pkg_id': workPkgId};
				View.showDocument(keys, 'work_pkgs', 'doc_acts_xfer', fileName);
				document.getElementById("exportingMpp").innerHTML = "";
			} else {
				View.showMessage(result.message);
			}
    	} catch (e) {
			View.showMessage(e.message);
		}
	}

});
