/**
 * Prepares custom console restriction and applies it to the report.
 * Added because custom status list requires IN operator which is not allowed in standard restrictionClause object
 */
function console_applyRestriction(viewName, frameName, needRest) {
	var hasRest = !needRest;
	var restriction = "1=1";
	var restriction2 = "";

	if (trim($('brg_project_view.project_id').value)) {
		restriction += " AND brg_project_view.project_id = '" + replaceQuotes($('brg_project_view.project_id').value) + "'";
		hasRest = true;
	}
	
	if (trim($('brg_project_view.int_num').value)) {
		restriction += " AND brg_project_view.int_num = '" + replaceQuotes($('brg_project_view.int_num').value) + "'";
		hasRest = true;
	}

	if (!hasRest) {
		alert("A Project Id or the Internal Number must be provided for this report.");
		return;
	}

	var fullRest = "";
	if (restriction != "1=1") {
		fullRest += '<restriction type="sql" sql="'+restriction+'"><field table="brg_project_view" /></restriction>';
	}
	
	renderView(viewName, frameName, fullRest);
	renderView('brg-proj-report-goa-details-costs.axvw', 'detailsCostFrame', fullRest);
}

function console_clear() {
	var console = AFM.view.View.getControl('consoleFrame', 'console_panel');
	
	console.setFieldValue('brg_project_view.project_id', "");
	console.setFieldValue('brg_project_view.int_num', "");
}

/**
 * Renders the report.
 */
function renderView(viewName, frameName, restriction)
{
	var targetFrameName = getFrameObject(parent, frameName).name;	
	var strXMLSQLTransaction = '<afmAction type="render" state="'+viewName+'" response="true">';
	strXMLSQLTransaction += '<userInputRecordsFlag><restrictions>'+restriction;
	strXMLSQLTransaction += '</restrictions></userInputRecordsFlag>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');	
}

/**
 * Replaces single quotes with double single quotes (SQL escape)
 */
function replaceQuotes(value)
{
	return value.replace(/'/g, "''");
}

function projSelval(restriction)
{
	restriction = buildSelvalRestriction('brg_project_view.project_type', restriction);
	restriction = buildSelvalRestriction('brg_project_view.program_id', restriction);
	restriction = buildSelvalRestriction('brg_project_view.proj_mgr', restriction);
	restriction = buildSelvalRestriction('brg_project_view.bl_id', restriction);
	restriction = buildSelvalRestriction('brg_project_view.site_id', restriction);
	restriction = buildSelvalRestriction('brg_project_view.dp_id', restriction);
	restriction = buildSelvalRestriction('brg_project_view.dv_id', restriction);
	restriction = buildSelvalRestriction('brg_project_view.apprv_mgr1', restriction);// in Project Calendar console
	
	if ($('bl.state_id') && trim($('bl.state_id').value)) 
	{
		if (restriction) restriction += " AND ";
		restriction += " (" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction += " " + siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\'))";
	}
	if ($('bl.city_id') && trim($('bl.city_id').value))	
   	{
   		if (restriction) restriction += " AND ";
   		restriction += " (" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction += " " + siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\'))";
   	} 
   	
	var title = "Select Project Name";
	AFM.view.View.selectValue('consolePanel',title,['brg_project_view.project_id'],'brg_project_view',['brg_project_view.project_id'],['brg_project_view.project_id','brg_project_view.int_num','brg_project_view.status','brg_project_view.description'],restriction);
}

function buildSelvalRestriction(fieldName, restriction)
{
	if ($(fieldName) && trim($(fieldName).value))
	{
		if (restriction) restriction += " AND ";
		restriction += fieldName+" LIKE \'%"+getValidValue(fieldName)+"%\'";
	}	
	return restriction;
}

function export_docx()
{

	var restriction = "";
	if (trim($('brg_project_view.project_id').value)) {
		restriction += " &brg_project_view.project_id="+$('brg_project_view.project_id').value;
	}
	if (trim($('brg_project_view.int_num').value)) {
		restriction += " &brg_project_view.int_num="+$('brg_project_view.int_num').value;
	}

	AFM.view.View.openDialog('ab-paginated-report-job.axvw?viewName=brg-proj-report-goa-docx.axvw&newtab=true&showresult=true'+restriction, null, false);
}