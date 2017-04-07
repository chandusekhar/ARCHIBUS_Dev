function clearConsole() 
{
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel) consolePanel.clear();
	if ($('status')) $('status').value = "All";
}

function onShow() {
	var restriction = getConsoleRestriction();
	var selectWorkPkgReport = View.panels.get('selectWorkPkgReport');
	if (selectWorkPkgReport) selectWorkPkgReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectWorkPkgReport' && panel.id != 'viewToolbar')
	    	panel.show(false);
	}); 
}

function projectIdSelval(restriction)
{
	var restriction = buildSelvalRestriction('project.project_type', restriction);
   	
	var title = '';
	if (getMessage('customProjectIdSelvalTitle') != 'customProjectIdSelvalTitle') title = getMessage('customProjectIdSelvalTitle');
	else title = getMessage('projectIdSelvalTitle');
	View.selectValue('consolePanel', title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.project_name','project.project_type','project.status','project.requestor','project.summary'],restriction);
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
   	if (consolePanel.getFieldValue('work_pkgs.status'))	restriction += workPkgsString + "work_pkgs.status = \'" + getValidValue('work_pkgs.status') + "\') AND "; 

   	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += projectString + "project.status IN (\'Approved\',\'Approved-In Design\') AND project.is_template = 0)";
	    } else if (status == 'In Execution') {
	    	restriction += projectString + "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\') AND project.is_template = 0)";
		} else restriction += projectString + "project.is_template = 0)";
	} else restriction += "activity_log.activity_log_id IS NOT NULL";
   	
	restriction = addTimeframeRestriction(restriction);
	return restriction;
}

function addTimeframeRestriction(restriction)
{
	var date_scheduled = View.panels.get('consolePanel').getFieldValue('activity_log.date_scheduled');
	var date_scheduled_end = View.panels.get('consolePanel').getFieldValue('activity_log.date_scheduled_end');
	
	var from_date = date_scheduled;
	var to_date = date_scheduled_end;
	
	if (date_scheduled != "" && date_scheduled_end != "")
		restriction = restriction + " AND ((activity_log.date_scheduled&gt;='"+from_date+"' AND activity_log.date_scheduled&lt;='"+to_date+"') OR " +
		"(activity_log.date_scheduled_end&gt;='"+from_date+"' AND activity_log.date_scheduled_end&lt;='"+to_date+"') OR " +
		"(activity_log.date_scheduled&lt;='"+from_date+"' AND activity_log.date_scheduled_end&gt;='"+to_date+"'))";	
	else if (date_scheduled != "" && date_scheduled_end == "")
		restriction = restriction + " AND (activity_log.date_scheduled&gt;='"+from_date+"' OR " +
		"activity_log.date_scheduled_end&gt;='"+from_date+"')";		
	else if (date_scheduled_end != "" && date_scheduled == "")
		restriction = restriction + " AND (activity_log.date_scheduled&lt;='"+to_date+"' OR " +
		"activity_log.date_scheduled_end&lt;='"+to_date+"')";
	return restriction;
}

function onCalcEndDates(project_id, work_pkg_id)
{
	var ruleName = "AbCommonResources-ActionService-calcActivityLogDateSchedEndForWorkPkg";

	if (work_pkg_id == "") ruleName = "AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject";
	var parameters = {'project_id':project_id, 'work_pkg_id':work_pkg_id};
	var result = Workflow.callMethodWithParameters(ruleName, parameters);
	if (result.code == 'executed') {
		return true;	
	} 
	else 
	{
   		alert(result.code + " :: " + result.message);
   		return false;
	}
}

function setFromToDates()
{
	var num_days = $('num_days').value;
	var curdate = new Date();

	/* dateAddDays() returns date in correct format */
	var from_date = dateAddDays(curdate, 0);
  	var to_date = dateAddDays(curdate, num_days);
	View.panels.get('consolePanel').setFieldValue('activity_log.date_scheduled', from_date);
	View.panels.get('consolePanel').setFieldValue('activity_log.date_scheduled_end', to_date);

	/* force to fire onchange event to change field's inline message */
	$('consolePanel_activity_log.date_scheduled').onchange();
	$('consolePanel_activity_log.date_scheduled_end').onchange();
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('consolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "''");
	return fieldValue;
}

//Adds nxtdays to date_start and returns as a SQL formatted string
function dateAddDays(date_start, nxtdays) 
{
	  date_new = new Date(date_start.getTime() + nxtdays*(24*60*60*1000));
	  var month = date_new.getMonth()+1;
	  if (month<10) month = "0" + month;
	  var day = date_new.getDate();
	  if (day<10) day = "0" + day;
	  return date_new.getFullYear() + '-' + month + '-' + day;
}
