function user_form_onload()
{
	setConsoleTimeframe();
	if ($('bl.state_id'))
	{
		onCalcEndDates();
		
		var targetFrame = getFrameObject(parent, 'westFrame');
		if (targetFrame) var targetFrameName = targetFrame.name;	
		var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-projects-org-impact-by-room-mdx.axvw" response="true"/>';
		sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');
	}	
}

function filterValues() 
{
	var queryParameters = '';
	var fieldsList = 	'bl.state_id,bl.city_id,project.site_id,project.bl_id,project.dv_id,'+
						'project.dp_id,program.program_type,project.program_id,project.project_type,project.project_id,project.proj_mgr';
	queryParameters += generateQueryParametersFromConsole(fieldsList);
	queryParameters += generateTimeframeQueryParametersFromConsole();

	var targetFrame = getFrameObject(parent, 'westFrame').name;	
	var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-projects-org-impact-by-room-mdx.axvw" response="true">';
	strXMLSQLTransaction += '<userInputRecordsFlag><queryParameters>'+queryParameters;
	strXMLSQLTransaction += '</queryParameters></userInputRecordsFlag>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrame, '',false,'');
}