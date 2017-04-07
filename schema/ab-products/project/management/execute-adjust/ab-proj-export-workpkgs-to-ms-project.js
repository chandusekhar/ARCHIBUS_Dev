var projExportWorkpkgsMsProjectController = View.createController('projExportWorkpkgsMsProject', {
	project_id : '',
	work_pkg_id : '',
	
	projExportWorkpkgsMsProjectGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
	},
	
	projExportWorkpkgsMsProjectGrid_onSelectWorkPkgId : function(row) {
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projExportWorkpkgsMsProjectActionsGrid.refresh(restriction);
		this.projExportWorkpkgsMsProjectActionsGrid.show(true);
		this.projExportWorkpkgsMsProjectActionsGrid.appendTitle(this.work_pkg_id);
	},
	
	projExportWorkpkgsMsProjectActionsGrid_onExportMsProject: function(){
		this.projExportWorkpkgsMsProjectForm.showInWindow({
		    width: 400,
		    height: 300
		});
	},
	
	version: '2010',

	projExportWorkpkgsMsProjectForm_onShow: function(){
		if($('version2007').checked)
			this.version = 2007;
		else if($('version2013').checked)
			this.version = 2013;
		else
			this.version = 2010;

		var restriction = this.projExportWorkpkgsMsProjectActionsGrid.restriction;
		var projectId = restriction.clauses[0].value;
		var parameters = {
				'project_id' : projectId,
				'work_pkg_id' : '',
				'version' : this.version };
		
	
		var panel = View.panels.get('projExportWorkpkgsMsProjectForm');
        try {
        	document.getElementById("exportingMpp").innerHTML = getMessage('exportingMppMsg');
			var result = Workflow.call('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
			if (result.code == 'executed') {
				panel.refresh();
				var fileName = panel.getFieldValue('project.doc_acts_xfer');
				var keys = {'project_id': projectId};
				View.showDocument(keys, 'project', 'doc_acts_xfer', fileName);
				document.getElementById("exportingMpp").innerHTML = "";
			} else{
				View.showMessage(result.message);
			} 
    	} catch (e) {
			View.showMessage(e.message);
		}
	}

});