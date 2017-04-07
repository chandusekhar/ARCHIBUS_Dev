var projWorkpkgsEditController = View.createController('projWorkpkgsEdit', {

	projWorkpkgsEditForm_beforeSave : function() {
		return this.validateDateFields();
	},

	validateDateFields : function() {
		var date_est_start = getDateObject(this.projWorkpkgsEditForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
		var date_est_end = getDateObject(this.projWorkpkgsEditForm.getFieldValue('work_pkgs.date_est_end'));
		var date_act_start = getDateObject(this.projWorkpkgsEditForm.getFieldValue('work_pkgs.date_act_start'));
		var date_act_end = getDateObject(this.projWorkpkgsEditForm.getFieldValue('work_pkgs.date_act_end'));
		if (date_est_end < date_est_start) {
			this.projWorkpkgsEditForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
			return false;
		}
		if (date_act_end < date_act_start) {
			this.projWorkpkgsEditForm.addInvalidField('work_pkgs.date_act_end', getMessage('endBeforeStart'));
			return false;
		}
	    return true;
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}