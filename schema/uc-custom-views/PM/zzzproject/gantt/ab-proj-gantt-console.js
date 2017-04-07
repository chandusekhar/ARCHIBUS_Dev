
function user_form_onload()
{
	if(getMessage('is_mc') == 'is_mc'&& $('activity_log.date_scheduled'))
	{
		// view in management console
		// project_id has been passed in by mc
		getProjectIdFromMC();
	}
	if ($('activity_log.date_scheduled')) setDefaultDateValues();
}

function getProjectIdFromMC()
{
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		var view_project_id = objConsoleFrame.mc_project_id;
		if (view_project_id) {
			var targetPanel = AFM.view.View.getControl('consoleFrame', 'consolePanel');
			if(targetPanel)
			{
				targetPanel.setFieldValue('activity_log.project_id',view_project_id);
			}
		}
	}
}

function workPkgIdSelval()
{
	var restriction = '';
	var project_id = '';
	if ($('activity_log.project_id')) project_id = trim($('activity_log.project_id').value);
	if (project_id)
	{
		restriction += "work_pkgs.project_id LIKE \'%"+getValidValue(project_id)+"%\'";
	}
	AFM.view.View.selectValue('consolePanel','',['activity_log.work_pkg_id'],'work_pkgs',['work_pkgs.work_pkg_id'],['work_pkgs.project_id','work_pkgs.work_pkg_id','work_pkgs.summary'],restriction);
}

function setDefaultDateValues()
{
	var systemDate = new Date();
	var addDays = parseInt(getMessage('default_date_sched_add_days'));
	$('activity_log.date_scheduled').value = dateAddDays(systemDate, 0+addDays);
	$('activity_log.date_scheduled_end').value = dateAddDays(systemDate, 90+addDays);
}

function clearConsole()
{
	var console = AFM.view.View.getControl('consoleFrame','consolePanel');
	console.clear();
	setDefaultDateValues();
	$('Display').value = '1';
	$('View').value = '1';
	if(getMessage('is_mc') == 'is_mc') getProjectIdFromMC();
}

function dateAddDays(date_start, nxtdays)
{
	var date_new = new Date(date_start.getTime() + nxtdays*(24*60*60*1000));
	var month = date_new.getMonth()+1;
	var day = date_new.getDate();
	var year = date_new.getFullYear();
	return FormattingDate(day, month, year, strDateShortPattern);
}

function openDetails()
{
	if (trim($('activity_log.project_id').value) == "" || trim($('activity_log.date_scheduled').value) == "" || trim($('activity_log.date_scheduled_end').value) == "")
	{
		var messageElement = $('general_warning_message_empty_required_fields');
		if (messageElement) alert(messageElement.innerHTML);
		return;
	}

	var project_id = "";
	var work_pkg_id= "";
	var activity_type = "";
	var date_scheduled = "";
	var date_scheduled_end = "";
	var display = "1";
	var view = "1";

	project_id = trim($('activity_log.project_id').value);
	if ($('activity_log.work_pkg_id')) work_pkg_id = trim($('activity_log.work_pkg_id').value);
	activity_type = trim($('activity_log.activity_type').value);
	date_scheduled = trim($('activity_log.date_scheduled').value);
	date_scheduled_end = trim($('activity_log.date_scheduled_end').value);
	if ($('Display')) display = $('Display').value;
	view = $('View').value;

	if (!confirmExceededDateRange(getDateObject(date_scheduled), getDateObject(date_scheduled_end))) return;
	if (!onCalcEndDates()) return;

	var strReturned = '';
	var strDateRangeStatement = "";
	var isEmpty=true;

	if(project_id != ""){
		strReturned += "<queryParameter name='projectid' type='java.lang.String' value='"+getValidValue(project_id)+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='projectid' type='java.lang.String' value='%' />";

	if(work_pkg_id != "" ){
		strReturned += "<queryParameter name='workpkgid' type='java.lang.String' value='"+getValidValue(work_pkg_id)+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='workpkgid' type='java.lang.String' value='%' />";

	if(activity_type != ""){
		strReturned += "<queryParameter name='activitytype' type='java.lang.String' value='"+getValidValue(activity_type)+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='activitytype' type='java.lang.String' value='%' />";

	if(date_scheduled != ""){
		strReturned += "<queryParameter name='datescheduled' type='java.lang.String' value='"+getDateWithISOFormat(date_scheduled)+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='datescheduled' type='java.lang.String' value='1990-01-01' />";

	if(date_scheduled_end != ""){
		strReturned += "<queryParameter name='datescheduledend' type='java.lang.String' value='"+getDateWithISOFormat(date_scheduled_end)+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='datescheduledend' type='java.lang.String' value='2990-01-01' />";

	strReturned = '<queryParameters>' + strReturned + '</queryParameters>';

	var sFilename = "";
	// Project
	if (display == "1" && view =="1") {
		sFilename = getMessage('proj_day_view');
	}
	else if(display == "1" && view =="2")
	{
		sFilename = getMessage('proj_week_view');
	}
	// Work Packages
	if (display == "2" && view =="1") {
		sFilename = getMessage('workpkgs_day_view');
	}
	else if(display == "2" && view =="2")
	{
		sFilename = getMessage('workpkgs_week_view');
	}

	var strXMLSQLTransaction = '<afmAction type="applyParameters1" state="'+sFilename+'" response="true">';
	strXMLSQLTransaction += strReturned + '</afmAction>';
	strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
	var targetFrameName = getFrameObject(parent, 'detailsFrame').name;
	sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');
}

function confirmExceededDateRange(fromDate, toDate)
{
	var dateRangeExceeded = false;
	var confirmResult = true;
	var dateDiff = (toDate - fromDate)/(24*60*60*1000);
	// if date range exceeds 6 months, pops up a js confirm
	if (dateDiff > 180) dateRangeExceeded = true;
	if (dateRangeExceeded) confirmResult = confirm(getMessage('exceeds_rec_date_range'));
	return confirmResult;
}

function getDateObject(locDate)
{
	var arrDate = getDateArray(locDate);
	var y = arrDate['year'];
	var m = arrDate['month'];
	var d = arrDate['day'];
	return new Date(y, m, d);
}


function onCalcEndDates()
{
	var project_id = "";
	var work_pkg_id = "";
	var ruleName = getMessage('proj_wfr_name');

	project_id = $('activity_log.project_id').value;
	if ($('activity_log.work_pkg_id'))
	{
		work_pkg_id = trim($('activity_log.work_pkg_id').value);
		ruleName = (work_pkg_id == "")?ruleName:getMessage('workpkgs_wfr_name');
	}
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

function getValidValue(strValue)
{
	return strValue.replace(/\'/g, "\'\'");
}
