var projMngPkgActAddController = View.createController('projMngPkgActAdd', {
	
	afterInitialDataFetch: function() {
		var record = this.projMngPkgActAdd_ds1.getRecord(this.projMngPkgActAdd_form0.restriction);
		this.projMngPkgActAdd_form0.setFieldValue('activity_log.wbs_id', record.getValue('work_pkgs.wbs_id'));
		this.projMngPkgActAdd_form0.setFieldValue('activity_log.proj_phase', record.getValue('work_pkgs.proj_phase'));
		this.projMngPkgActAdd_form0.setFieldValue('activity_log.site_id', record.getValue('project.site_id'));
		this.projMngPkgActAdd_form0.setFieldValue('activity_log.bl_id', record.getValue('project.bl_id'));
	},
	
	projMngPkgActAdd_form0_beforeSave: function() {
		if (this.projMngPkgActAdd_form0.getFieldValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
			View.showMessage(getMessage('noChangeOrder'));
			return false;
		}
	}
});

function refreshOpener() {
	if(View.parameters.callback){
		View.parameters.callback();
	}
}