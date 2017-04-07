function beforeSaveForm()
{
	var form = View.panels.get('projUpdateWorkPkgsForm'); 
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
    return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template=0 AND EXISTS (SELECT 1 FROM work_pkgs WHERE work_pkgs.project_id = project.project_id)");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("");
}
