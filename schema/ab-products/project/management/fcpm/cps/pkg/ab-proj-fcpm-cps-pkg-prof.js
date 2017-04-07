var projFcpmCpsPkgProfController = View.createController('projFcpmCpsPkgProf', {
	
	projFcpmCpsPkgProf_workpkgForm_afterRefresh:function() {
		var project_id = this.projFcpmCpsPkgProf_workpkgForm.getFieldValue('work_pkgs.project_id');
		var work_pkg_id = this.projFcpmCpsPkgProf_workpkgForm.getFieldValue('work_pkgs.work_pkg_id');
		this.projFcpmCpsPkgProf_workpkgForm.setTitle(project_id + ' - ' + work_pkg_id);
		var status = this.projFcpmCpsPkgProf_workpkgForm.getFieldValue('work_pkgs.status');
		var restriction = this.projFcpmCpsPkgProf_workpkgForm.restriction;	
		var records = this.projFcpmCpsPkgProf_contrDs.getRecords(restriction);
		if (records.length == 0) {
			this.projFcpmCpsPkgProfContrForm.show(false);
		} else {
			this.projFcpmCpsPkgProfContrForm.refresh(restriction);
			this.projFcpmCpsPkgProfContrForm.show(true);
		}
	},

	projFcpmCpsPkgProfForm_beforeSave : function() {
		this.projFcpmCpsPkgProfForm.clearValidationResult();
		this.validateDates();
	},

	validateDates : function() {
		var valid = validateDateFields(this.projFcpmCpsPkgProfForm, 'work_pkgs.date_est_start', 'work_pkgs.date_est_end', false);
		if (valid) valid = validateDateFields(this.projFcpmCpsPkgProfForm, 'work_pkgs.date_act_start', 'work_pkgs.date_act_end', false);
		return valid;
	}
});