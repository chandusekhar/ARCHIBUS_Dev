var projFcpmCpsPkgProfEditController = View.createController('projFcpmCpsPkgProfEdit', {
	
	projFcpmCpsPkgProfEditForm_onSave: function() {
		if (!this.projFcpmCpsPkgProfEditForm.save()) return;
		
		var restriction = new Ab.view.Restriction();
		var work_pkg_id = this.projFcpmCpsPkgProfEditForm.getFieldValue('work_pkgs.work_pkg_id');
		var project_id = this.projFcpmCpsPkgProfEditForm.getFieldValue('work_pkgs.project_id');
		restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		restriction.addClause('work_pkgs.project_id', project_id);
		
		var projFcpmCps = View.getOpenerView().getOpenerView().controllers.get('projFcpmCps');
		for (var i = 0; i < projFcpmCps.projFcpmCpsPkgTabs.tabs.length; i++) {
	        var tab = projFcpmCps.projFcpmCpsPkgTabs.tabs[i]; 
	        projFcpmCps.projFcpmCpsPkgTabs.setTabRestriction(tab.name, restriction);
		}
		projFcpmCps.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', work_pkg_id);
		View.getOpenerView().panels.get('projFcpmCpsPkgProf_workpkgForm').refresh(restriction);
		View.closeThisDialog();
	}
});