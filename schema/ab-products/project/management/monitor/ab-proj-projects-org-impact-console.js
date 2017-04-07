function onClearWithParameters() 
{	
	clearConsole();
	clearParameters('projProjectsOrgImpactCrossTable');
	clearParameters('projProjectsOrgImpactGrid');
}
	
function clearParameters(panelId) {	
	var report = View.panels.get(panelId);
	report.addParameter('bl_id', '%%');
	report.addParameter('dv_id', '%%');
	report.addParameter('dp_id', '%%');
	report.addParameter('date_start', '0001-01-01');
	report.addParameter('date_end', '9999-12-31');
	report.addParameter('consoleRestriction', '1=1');
	report.restriction = null;
	report.refresh();
}

function onShowWithParameters() {
	addParameters('projProjectsOrgImpactCrossTable');
	addParameters('projProjectsOrgImpactGrid');
}

function addParameters(panelId)
{
	var report = View.panels.get(panelId);
	var consolePanel = View.panels.get('consolePanel');
	report.addParameter('bl_id', '%' + consolePanel.getFieldValue('project.bl_id') + '%');
	report.addParameter('dv_id', '%' + consolePanel.getFieldValue('project.dv_id') + '%');
	report.addParameter('dp_id', '%' + consolePanel.getFieldValue('project.dp_id') + '%');
	report.addParameter('consoleRestriction', getOrgImpactConsoleRestrictionForActions());
	
	var date_start, date_end;
	if ($('timeframe_type_years').checked)
	{
	  	var from_year = $('from_year').value;
	   	var to_year = $('to_year').value;
	   	date_start = from_year + "-" + "01-01";
	    date_end = to_year + "-12-31";
	} else if ($('timeframe_type_days').checked)
	{
	   	var num_days = $('num_days').value;
	   	var curdate = new Date();
	  	date_start = dateAddDays(curdate, 0);
	  	date_end = dateAddDays(curdate, num_days); 	  	
	} 
	else if ($('timeframe_type_all').checked) {
		date_start = '0001-01-01';
		date_end = '9999-12-31';
	}
    report.addParameter('date_start', date_start);
    report.addParameter('date_end', date_end);
	report.restriction = null;
	report.refresh();
}

function getOrgImpactConsoleRestrictionForActions() 
{
	var projectString = "EXISTS (SELECT 1 FROM project WHERE activity_log.project_id = project.project_id AND ";
	var blString = "EXISTS (SELECT 1 FROM project, bl WHERE activity_log.project_id = project.project_id AND bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM project, site WHERE activity_log.project_id = project.project_id AND site.site_id = project.site_id AND ";
	var programString = "EXISTS (SELECT 1 FROM project, program WHERE activity_log.project_id = project.project_id AND project.program_id = program.program_id AND ";
 
    var restriction = "";
	if (trim($('bl.state_id').value)) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	//if (trim($('project.dv_id').value))	restriction += projectString + "project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\') AND ";
   	if (trim($('project.project_type').value))	restriction += projectString + "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\') AND "; 
   	if (trim($('bl.city_id').value))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	//if (trim($('project.dp_id').value))	restriction += projectString + "project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\') AND "; 
   	if (trim($('project.project_id').value)) restriction += projectString + "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\') AND "; 
   	if (trim($('project.site_id').value))	restriction += projectString + "project.site_id LIKE \'%" + getValidValue('project.site_id') + "%\') AND "; 
   	if (trim($('program.program_type').value))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (trim($('project.proj_mgr').value))	restriction += projectString + "project.proj_mgr LIKE \'%" + getValidValue('project.proj_mgr') + "%\') AND "; 
   	if (trim($('project.bl_id').value))	restriction += projectString + "project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\') AND "; 
   	if (trim($('project.program_id').value))	restriction += projectString + "project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\') AND ";

    var status = $('status').value;
    if (status == 'In Planning') {
    	restriction += projectString + "project.status IN (\'Approved\',\'Approved-In Design\') AND project.is_template = 0)";
    } else if (status == 'In Execution') {
    	restriction += projectString + "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\') AND project.is_template = 0)";
	} else restriction += projectString + "project.is_template = 0)";

	return restriction;
}
