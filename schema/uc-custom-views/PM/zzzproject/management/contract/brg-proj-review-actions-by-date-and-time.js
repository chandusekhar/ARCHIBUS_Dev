function clearFilter()
{
	clearConsole();
	if ($('num_days')) $('num_days').value = 0;
}

function projSelvalWithRestriction()
{
	var restriction = "project.is_template = 0 AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id "+
		"AND activity_log.work_pkg_id IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
		"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
		//"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+$('user_email_field').value+"')))";
		"))";
	projSelval(restriction);
}

function workPkgSelvalWithRestriction()
{
	var restriction = "EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = work_pkgs.project_id "+
		"AND activity_log.work_pkg_id = work_pkgs.work_pkg_id) AND work_pkgs.work_pkg_id "+
		"IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
		"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
		//"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+$('user_email_field').value+"'))";
		")";
	workPkgIdSelval(restriction);
}

function openDetails()
{
	if (trim($('project.project_id').value) == "") 
	{
		var messageElement = $('general_warning_message_empty_required_fields');
		if (messageElement) alert(messageElement.innerHTML);
		return;
	}
	if (!onCalcEndDates()) return;
	var restriction = getConsoleRestrictionForActions();
	if (trim($('activity_log.activity_type').value)) restriction += " AND activity_log.activity_type = \'" + getValidValue('activity_log.activity_type') + "\'";
	restriction = addTimeframeRestriction(restriction);
	var detailsFrame = getFrameObject(parent,'detailsFrame').name;
	
	var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-review-actions-by-date-and-time-details.axvw" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, detailsFrame, '',false,'');	
}

function onCalcEndDates()
{
	var project_id = "";
	var work_pkg_id = "";
	var ruleName = "AbProjectManagement-calcActivityLogDateSchedEndForProject";
	
	project_id = $('project.project_id').value;
	work_pkg_id = trim($('work_pkgs.work_pkg_id').value);
	ruleName = (work_pkg_id == "")?ruleName:"AbProjectManagement-calcActivityLogDateSchedEndForWorkPkg";	
	var parameters = {'project_id':project_id, 'work_pkg_id':work_pkg_id};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult(ruleName, parameters);
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
	// dateAddDays() returns date in correct format
	var from_date = dateAddDays(curdate, 0);
  	var to_date = dateAddDays(curdate, num_days);
	$('activity_log.date_scheduled').value = from_date;
	$('activity_log.date_scheduled_end').value = to_date;
	// force to fire onchange event to change field's inline message
	$('activity_log.date_scheduled').onchange();
	$('activity_log.date_scheduled_end').onchange();
}

function addTimeframeRestriction(restriction)
{
	var date_scheduled = trim($('activity_log.date_scheduled').value);
	var date_scheduled_end = trim($('activity_log.date_scheduled_end').value);
	date_scheduled = getDateWithISOFormat(date_scheduled);
	date_scheduled_end = getDateWithISOFormat(date_scheduled_end);
	
	var from_date = '#Date%'+date_scheduled+'%';
	var to_date = '#Date%'+date_scheduled_end+'%';
	
	if (date_scheduled != "" && date_scheduled_end != "")
		restriction = restriction + " AND ((activity_log.date_scheduled&gt;="+from_date+" AND activity_log.date_scheduled&lt;="+to_date+") OR " +
		"(activity_log.date_scheduled_end&gt;="+from_date+" AND activity_log.date_scheduled_end&lt;="+to_date+") OR " +
		"(activity_log.date_scheduled&lt;="+from_date+" AND activity_log.date_scheduled_end&gt;="+to_date+"))";	
	else if (date_scheduled != "" && date_scheduled_end == "")
		restriction = restriction + " AND (activity_log.date_scheduled&gt;="+from_date+" OR " +
		"activity_log.date_scheduled_end&gt;="+from_date+")";		
	else if (date_scheduled_end != "" && date_scheduled == "")
		restriction = restriction + " AND (activity_log.date_scheduled&lt;="+to_date+" OR " +
		"activity_log.date_scheduled_end&lt;="+to_date+")";
	return restriction;
}
