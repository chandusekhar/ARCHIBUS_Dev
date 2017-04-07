var projRestrictionConsoleController = View.createController('projRestrictionConsole', {
	
	afterInitialDataFetch: function() {
		setConsoleTimeframe();
	}
});

var systemYear = 2025;
var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
var programString = "EXISTS (SELECT 1 FROM program WHERE project.program_id = program.program_id AND ";

/***
 * Clears values from the console and sets status to "All"
*/
function clearConsole() 
{
		var consolePanel = View.panels.get('consolePanel');
		if (consolePanel) consolePanel.clear();
		if ($('status')) $('status').value = "All";		
		clearConsoleTimeframe();
}

function onShow() {
	var restriction = getConsoleRestriction();
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport) selectProjectReport.refresh(restriction);
}

function projectIdSelval(restriction)
{
	var consolePanel = View.panels.get('consolePanel');
	restriction = buildSelvalRestriction('project.project_type', restriction);
	restriction = buildSelvalRestriction('project.program_id', restriction);
	restriction = buildSelvalRestriction('project.proj_mgr', restriction);
	restriction = buildSelvalRestriction('project.bl_id', restriction);
	restriction = buildSelvalRestriction('project.site_id', restriction);
	restriction = buildSelvalRestriction('project.dp_id', restriction);
	restriction = buildSelvalRestriction('project.dv_id', restriction);
	restriction = buildSelvalRestriction('project.apprv_mgr1', restriction);// in Project Calendar console
	
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		if (restriction) restriction += " AND ";
		restriction += " (" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction += " " + siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\'))";
	}
	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		if (restriction) restriction += " AND ";
   		restriction += " (" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction += " " + siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\'))";
   	} 
   	
	var title = '';
	if (getMessage('customProjectIdSelvalTitle') != 'customProjectIdSelvalTitle') title = getMessage('customProjectIdSelvalTitle');
	else title = getMessage('projectIdSelvalTitle');
	View.selectValue('consolePanel', title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.status','project.summary'],restriction);
}

function programIdSelval()
{
	var restriction = '';
	restriction = buildSelvalRestriction('program.program_type', restriction);
	View.selectValue('consolePanel', getMessage('programIdSelvalTitle'),['project.program_id'],'program',['program.program_id'],['program.program_id','program.program_type'],restriction);
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
    var restriction = "";
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (consolePanel.getFieldValue('project.dv_id'))	restriction += "project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' AND ";
   	if (consolePanel.getFieldValue('project.project_type'))	restriction += "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\' AND "; 
   	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if (consolePanel.getFieldValue('project.dp_id'))	restriction += "project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.project_id')) restriction += "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.site_id'))	restriction += "project.site_id LIKE \'%" + getValidValue('project.site_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('program.program_type'))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (consolePanel.getFieldValue('project.proj_mgr'))	restriction += "project.proj_mgr LIKE \'%" + getValidValue('project.proj_mgr') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.bl_id'))	restriction += "project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.program_id'))	restriction += "project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\' AND ";

	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += "project.status IN (\'Approved\',\'Approved-In Design\')";
	    } else if (status == 'In Execution') {
	    	restriction += "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\')";
		} else restriction += "project.status LIKE \'%\'";
	} else restriction += "project.project_id IS NOT NULL";
	
	if ($('timeframe_type_years')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_years').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+to_year+" AND ${sql.yearOf('project.date_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &gt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &lt;= "+to_year + ")";
	    	
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+to_year+" AND ${sql.yearOf('project.date_target_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &gt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	
	if ($('timeframe_type_fiscal_year')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_fiscal_year').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "projfunds.fiscal_year &gt;= "+from_year+" AND projfunds.fiscal_year &lt;= "+to_year;
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	return restriction;	
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('consolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function setConsoleTimeframe()
{
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	var optionData;
	
	if ($('from_year')) 
	{
		for (var i = 0 ; i < 21; i++)
		{
			optionData = new Option(systemYear-10+i, systemYear-10+i);
			$('from_year').options[i] = optionData;
		}
		$('from_year').value = systemYear;
	}
	if ($('to_year')) 
	{
		for (var i = 0 ; i < 21; i++)
		{
			optionData = new Option(systemYear-10+i, systemYear-10+i);
			$('to_year').options[i] = optionData;
		}
		$('to_year').value = systemYear;
	}
}

function clearConsoleTimeframe()
{
	if ($('from_year')) $('from_year').value = systemYear;
	if ($('to_year')) $('to_year').value = systemYear;
	if ($('num_days')) $('num_days').value = '0';
	if ($('timeframe_type_all')) $('timeframe_type_all').checked = true;
}
