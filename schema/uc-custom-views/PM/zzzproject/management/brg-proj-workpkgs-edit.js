function beforeSaveForm()
{
	var form = AFM.view.View.getControl('detailsFrame','detailsPanel'); 
	var date_est_start = getDateObject(form.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
	var date_est_end = getDateObject(form.getFieldValue('work_pkgs.date_est_end'));
	var date_act_start = getDateObject(form.getFieldValue('work_pkgs.date_act_start'));
	var date_act_end = getDateObject(form.getFieldValue('work_pkgs.date_act_end'));
	if (date_est_end < date_est_start) {
		form.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
		return false;
	}
	if (date_act_end < date_act_start) {
		form.addInvalidField('work_pkgs.date_act_end', getMessage('endBeforeStart'));
		return false;
	}
	
	// fill in the int_num from the project_id
	var intNumRecord = BRG.Common.getDataValues('project', ['int_num'], 'project_id = '+BRG.Common.literalOrNull(form.getFieldValue('work_pkgs.project_id')));
	if (intNumRecord != undefined && intNumRecord != null) {
		form.setFieldValue('work_pkgs.int_num', intNumRecord['project.int_num']);
	}
	
    return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}