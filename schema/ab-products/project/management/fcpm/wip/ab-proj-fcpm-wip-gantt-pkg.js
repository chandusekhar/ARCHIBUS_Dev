var projFcpmWipGanttPkgController = View.createController('projFcpmWipGanttPkg', {
	
	afterInitialDataFetch:function() {
		var project_id = this.projFcpmWipGanttPkg_workpkgForm.getFieldValue('work_pkgs.project_id');
		var work_pkg_id = this.projFcpmWipGanttPkg_workpkgForm.getFieldValue('work_pkgs.work_pkg_id');
		this.projFcpmWipGanttPkg_workpkgForm.appendTitle(project_id + ' - ' + work_pkg_id);
		var status = this.projFcpmWipGanttPkg_workpkgForm.getFieldValue('work_pkgs.status');
		var restriction = this.projFcpmWipGanttPkg_workpkgForm.restriction;	
		var records = this.projFcpmWipGanttPkg_contrDs.getRecords(restriction);
		if (records.length == 0) {
			this.projFcpmWipGanttPkgContrForm.show(false);
		} else {
			this.projFcpmWipGanttPkgContrForm.refresh(restriction);
			this.projFcpmWipGanttPkgContrForm.show(true);
		}
	}
});