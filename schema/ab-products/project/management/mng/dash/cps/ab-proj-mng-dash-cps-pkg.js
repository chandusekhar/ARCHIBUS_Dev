var projMngDashCpsPkgController = View.createController('projMngDashCpsPkg', {
	
	projMngDashCpsPkgEditWorkPkgForm_onSave : function() {
		this.projMngDashCpsPkgEditWorkPkgForm.clearValidationResult();
		var valid = true;
		var curDate = new Date();
		var date_start = getDateObject(this.projMngDashCpsPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
		var date_end = getDateObject(this.projMngDashCpsPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
		var controller = this;
		if (date_end < date_start) {
			this.projMngDashCpsPkgEditWorkPkgForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
			this.projMngDashCpsPkgEditWorkPkgForm.displayValidationResult();
			valid = false;
		}
		if ((curDate - date_start)/(1000*60*60*24) >= 1){
			View.confirm(getMessage('dateBeforeCurrent'), function(button){
                if (button == 'yes') {
                	
                }
                else {
                    valid = false;
                }
                if (valid) controller.saveWorkPkg();
            });
		}
		else { if (valid) this.saveWorkPkg(); }
	},
	
	saveWorkPkg: function() {
		this.projMngDashCpsPkgEditWorkPkgForm.setFieldValue('work_pkgs.date_act_start', this.projMngDashCpsPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));
		this.projMngDashCpsPkgEditWorkPkgForm.setFieldValue('work_pkgs.date_act_end', this.projMngDashCpsPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
        if (!this.projMngDashCpsPkgEditWorkPkgForm.save()) return;
        View.getOpenerView().panels.get('projMngDashCps_cps').refresh();
        View.getOpenerView().panels.get('projMngDashAlert_msgs').refresh();
        this.projMngDashCpsPkgTabs.selectTab('projMngDashCpsPkgTab2', this.projMngDashCpsPkgEditWorkPkgForm.getFieldRestriction());
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

												