function selvalWithRestriction() {
	var restriction = "project.status NOT IN ('Requested-Rejected','Closed')";
	View.selectValue('detailsPanel','',['work_pkgs.project_id'],'project',['project.project_id'],['project.project_id','project.status','project.summary'],restriction);
}

function beforeSaveForm()
{
	var form = View.panels.get('detailsPanel'); 
	var curDate = new Date();
	var date_start = getDateObject(form.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
	var date_end = getDateObject(form.getFieldValue('work_pkgs.date_est_end'));
	if (date_end < date_start) {
		form.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
		return false;
	}
	if ((curDate - date_start)/(1000*60*60*24) >= 1){
    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
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

function closeDialogAndRefreshOpener()
{
	var targetPanel = View.getOpenerView().panels.get('projCreateWorkPackages_westPanel');
	targetPanel.refresh(null);
	targetPanel.show(true);
	View.getOpenerView().closeDialog();
}