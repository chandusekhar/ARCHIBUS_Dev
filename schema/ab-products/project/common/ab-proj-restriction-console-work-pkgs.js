
function clearConsole()
{
	var consolePanel = View.panels.get('consolePanel');
	consolePanel.clear();
	if (getMessage('console_work_pkg_status') != 'console_work_pkg_status') {
		consolePanel.setFieldValue('work_pkgs.status', getMessage('console_work_pkg_status'));
		consolePanel.enableField('work_pkgs.status', false);
	}
	if ($('status')) $('status').value = "All";
}

function onClearParameter() {
	clearConsole();
}

function onShow() {
	var restriction = getConsoleRestriction();
	var selectWorkPkgReport = View.panels.get('selectWorkPkgReport');
	if (selectWorkPkgReport) selectWorkPkgReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectWorkPkgReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowActions() {
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel)
	{
		if (consolePanel.getFieldValue('project.project_id') == '') {
			View.showMessage(getMessage('empty_field'));
			return;
		}
		if (consolePanel.getFieldValue('work_pkgs.work_pkg_id') == '') {
			View.showMessage(getMessage('empty_field'));
			return;
		}
	}
	var restriction = getConsoleRestrictionForActions();
	var selectWorkPkgReport = View.panels.get('selectWorkPkgReport');
	if (selectWorkPkgReport) selectWorkPkgReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectWorkPkgReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowActionsParameter() {
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel)
	{
		if (consolePanel.getFieldValue('project.project_id') == '') {
			View.showMessage(getMessage('empty_field'));
			return;
		}
		if (consolePanel.getFieldValue('work_pkgs.work_pkg_id') == '') {
			View.showMessage(getMessage('empty_field'));
			return;
		}
	}
	var actionRestriction = getConsoleRestrictionForActions();
	var selectWorkPkgReport = View.panels.get('selectWorkPkgReport');
	if (selectWorkPkgReport)
	{
		selectWorkPkgReport.addParameter('actionRestriction', actionRestriction);
		selectWorkPkgReport.refresh();
	}
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectWorkPkgReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function projectIdSelval(restriction)
{
	restriction = buildSelvalRestriction('project.project_type', restriction);
	var title = '';
	if (getMessage('customProjectIdSelvalTitle') != 'customProjectIdSelvalTitle') title = getMessage('customProjectIdSelvalTitle');
	else title = getMessage('projectIdSelvalTitle');
	View.selectValue('consolePanel',title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.project_name','project.project_type','project.status','project.requestor','project.summary'],restriction);
}

function buildSelvalRestriction(fieldName, restriction)
{
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel.getFieldValue(fieldName)) 
	{
		if (restriction) restriction += " AND ";
		restriction += fieldName+" LIKE \'%"+getValidValue(fieldName)+"%\'";
	}	
	return restriction;
}

function workPkgIdSelval(restriction)
{
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel.getFieldValue('project.project_id')) 
	{
		if (restriction) restriction += " AND ";
		restriction += "work_pkgs.project_id LIKE \'%"+getValidValue('project.project_id')+"%\'";
	}
	restriction = buildSelvalRestriction('work_pkgs.proj_phase',restriction);
	var title = '';
	if (getMessage('customWorkPkgIdSelvalTitle') != 'customWorkPkgIdSelvalTitle') title = getMessage('customWorkPkgIdSelvalTitle');
	else title = getMessage('workPkgIdSelvalTitle');
	View.selectValue('consolePanel',title,['project.project_id', 'work_pkgs.work_pkg_id'],'work_pkgs',['work_pkgs.project_id', 'work_pkgs.work_pkg_id'],['work_pkgs.project_id','work_pkgs.work_pkg_id','work_pkgs.status','work_pkgs.summary'],restriction);
}

function getConsoleRestriction()
{
	var consolePanel = View.panels.get('consolePanel');	
	var projectString = "EXISTS (SELECT 1 FROM project WHERE project.project_id = work_pkgs.project_id AND ";
    var restriction = "";
	if (consolePanel.getFieldValue('project.project_type')) restriction += projectString + "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\') AND ";
   	if (consolePanel.getFieldValue('project.project_id'))	restriction += projectString + "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\') AND ";
   	if (consolePanel.getFieldValue('work_pkgs.proj_phase'))	restriction += "work_pkgs.proj_phase LIKE \'%" + getValidValue('work_pkgs.proj_phase') + "%\' AND "; 
   	if (consolePanel.getFieldValue('work_pkgs.work_pkg_id')) restriction += "work_pkgs.work_pkg_id LIKE \'%" + getValidValue('work_pkgs.work_pkg_id') + "%\' AND ";
   	if (consolePanel.getFieldValue('work_pkgs.status'))	restriction += "work_pkgs.status = \'" + getValidValue('work_pkgs.status') + "\' AND "; 

	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += projectString + "project.status IN (\'Approved\',\'Approved-In Design\'))";
	    } else if (status == 'In Execution') {
	    	restriction += projectString + "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\'))";
		} else restriction += projectString + "project.status LIKE \'%\')";
	} else restriction += "work_pkgs.work_pkg_id IS NOT NULL";
	
	return restriction;	
}

function getConsoleRestrictionForActions() 
{
	var consolePanel = View.panels.get('consolePanel');	
	var projectString = "EXISTS (SELECT 1 FROM project WHERE activity_log.project_id = project.project_id AND ";
	var workPkgsString = "EXISTS (SELECT 1 FROM work_pkgs WHERE activity_log.project_id = work_pkgs.project_id AND activity_log.work_pkg_id = work_pkgs.work_pkg_id AND ";
    var restriction = "";
	if (consolePanel.getFieldValue('project.project_type')) restriction += projectString + "project.project_type = \'" + getValidValue('project.project_type') + "\') AND "; 
   	if (consolePanel.getFieldValue('project.project_id'))	restriction += projectString + "project.project_id = \'" + getValidValue('project.project_id') + "\') AND ";
   	if (consolePanel.getFieldValue('work_pkgs.proj_phase'))	restriction += workPkgsString + "work_pkgs.proj_phase = \'" + getValidValue('work_pkgs.proj_phase') + "\') AND "; 
   	if (consolePanel.getFieldValue('work_pkgs.work_pkg_id'))	restriction += workPkgsString + "work_pkgs.work_pkg_id = \'" + getValidValue('work_pkgs.work_pkg_id') + "\') AND ";
   	restriction += projectString + "project.is_template = 0)";

	return restriction;
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('consolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "''");
	return fieldValue;
}

// Adds nxtdays to date_start and returns as a SQL formatted string
function dateAddDays(date_start, nxtdays) 
{
	  date_new = new Date(date_start.getTime() + nxtdays*(24*60*60*1000));
	  var month = date_new.getMonth()+1;
	  if (month<10) month = "0" + month;
	  var day = date_new.getDate();
	  if (day<10) day = "0" + day;
	  return date_new.getFullYear() + '-' + month + '-' + day;
}

