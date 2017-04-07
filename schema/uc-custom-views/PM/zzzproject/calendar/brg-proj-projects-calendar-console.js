/******************************************************************
	ab-proj-projects-calendar-console.js
 ******************************************************************/

var mssql = "";  // MSSQL version of the calendar views overwrites this with -mssql for view suffixes
var systemYear, systemMonth;
var project_id = "";
var display = "";
var isMovesCalendar = false;

function user_form_onload()
{
	if ($('year'))
	{
		onCalcEndDates();
		calcYearMonth();
		if (getMessage('isMovesCalendar') == 'true') isMovesCalendar = true;
		clearFilter();
		
		var dialect = "";
		var parameters = {'member_id':'', 'member_id_table':''};
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-getContactInfo', parameters);
		if (result.code == 'executed') {
			var contactInfo = eval("(" + result.jsonExpression + ")");
			dialect = contactInfo.dialect;
		}
		if (dialect == 'sqlserver') mssql = "-mssql";
	}
}

function clearFilter()
{
	clearConsole();
	$('view').selectedIndex = "1";
	$('Display').selectedIndex = "0";
	$('year').value = systemYear;
	$('month').selectedIndex = systemMonth;
	if (isMovesCalendar) $('project.project_type').value = 'Move';
}

function calcYearMonth()
{
	var systemDate = new Date();
	systemMonth = systemDate.getMonth();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	var optionData;
	
	var consolePanel = AFM.view.View.getControl('consoleFrame', 'consolePanel');
	if (consolePanel)
	{
		if ($('year')) 
		{
			for (var i = 0 ; i < 21; i++)
			{
				optionData = new Option(systemYear-10+i, systemYear-10+i);
				$('year').options[i] = optionData;
			}
			$('year').value = systemYear;
		}
	}
}

function openDetails()
{
	//mssql = getMessage('mssql');
	display = $('Display').selectedIndex + 1;
	var view = $('view').selectedIndex + 1;
	var year = $('year').value;
	var month = $('month').value;
	var state_id = trim($('bl.state_id').value);
	var site_id = trim($('project.site_id').value); 
	var city_id = trim($('bl.city_id').value); 
	var bl_id = trim($('project.bl_id').value); 
	var dv_id = trim($('project.dv_id').value);
	var dp_id = trim($('project.dp_id').value); 
	var program_id = trim($('project.program_id').value);
	var apprv_mgr1 = trim($('project.apprv_mgr1').value); 
	var project_type = trim($('project.project_type').value); 
	var activity_type = trim($('project.project_num').value); 
	project_id = trim($('project.project_id').value);

	if ((display == 2 || display == 3) && !project_id) 
	{
		alert(getMessage('enterProjectId'));
		return;
	}
	
	var strSQLRestriction = "";
	var strDateRangeStatement = "";

	
	if(state_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="stateid" type="java.lang.String" value="'+state_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="stateid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+state_id+'"><field name="state_id" table="bl"/></clause>';		
	if(site_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="siteid" type="java.lang.String" value="'+site_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="siteid" type="java.lang.String" value="%" />'		
	}		
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+site_id+'"><field name="site_id" table="bl"/></clause>';		
	if(city_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="cityid" type="java.lang.String" value="'+city_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="cityid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+city_id+'"><field name="city_id" table="bl"/></clause>';		
	if(bl_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="blid" type="java.lang.String" value="'+bl_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="blid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+bl_id+'"><field name="bl_id" table="activity_log"/></clause>';		
	if(dv_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="dvid" type="java.lang.String" value="'+dv_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="dvid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+dv_id+'"><field name="dv_id" table="project"/></clause>';		
	if(dp_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="dpid" type="java.lang.String" value="'+dp_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="dpid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+dp_id+'"><field name="dp_id" table="project"/></clause>';		
	if(program_id != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="programid" type="java.lang.String" value="'+program_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="programid" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+program_id+'"><field name="program_id" table="project"/></clause>';		
	if(activity_type != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="activitytype" type="java.lang.String" value="'+activity_type+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="activitytype" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+activity_type+'"><field name="activity_type" table="activity_log"/></clause>';		
	if(apprv_mgr1 != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="apprvmgr1" type="java.lang.String" value="'+apprv_mgr1+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="apprvmgr1" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+apprv_mgr1+'"><field name="apprv_mgr1" table="project"/></clause>';						
	
	if(project_type != "")
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="projecttype" type="java.lang.String" value="'+project_type+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="projecttype" type="java.lang.String" value="%" />'		
	}			
		//strSQLRestriction = strSQLRestriction + strSQLRestriction + '<clause relop="and" op="LIKE" value="'+project_type+'"><field name="project_type" table="project"/></clause>';	

	if(project_id != "")							
 	{
		strSQLRestriction = strSQLRestriction + '<queryParameter name="projectid" type="java.lang.String" value="'+project_id+'" />'
	} else {
		strSQLRestriction = strSQLRestriction + '<queryParameter name="projectid" type="java.lang.String" value="%" />'		
	}		
	
	var sRestmonth=parseInt(month) + 1
	var sRestyear= year;
	
	strSQLRestriction = strSQLRestriction + '<queryParameter name="sRestyear" type="java.lang.String" value="'+sRestyear+'" />'	
	strSQLRestriction = strSQLRestriction + '<queryParameter name="sRestmonth" type="java.lang.String" value="'+sRestmonth+'" />'

	if(strSQLRestriction != "")
			strSQLRestriction = '<queryParameters>' + strSQLRestriction + '</queryParameters>';
//		strSQLRestriction = '<userInputRecordsFlag><queryParameters>' + strSQLRestriction + '</queryParameters></userInputRecordsFlag>';

	//render if transaction is OK.

	var strXMLCancelChange = "";

	// Determine which axvw to go to.

	var sDisplay = display;
	var sActivityType = view;

	var sFilename = "";
	if (isMovesCalendar) sFilename = "ab-proj-projects-moves-calendar-";
	else sFilename = "brg-proj-projects-calendar-";

	// Project
	if (sDisplay == "1" && sActivityType =="1") {
		sFilename += "project-mnthyear"
	}
	else if(sDisplay == "1" && sActivityType =="2")
	{		
		sFilename += "project-daysmnth"
	}
	else if(sDisplay == "1" && sActivityType =="3")
	{
		sFilename += "project-daysweek"
	}
	
	// Work Packages
	else if (sDisplay == "3" && sActivityType =="1") {
		sFilename += "wrkpkg-mnthyear"
	}
	else if(sDisplay == "3" && sActivityType =="2")
	{
		sFilename += "wrkpkg-daysmnth"
	}
	else if(sDisplay == "3" && sActivityType =="3")
	{
		sFilename += "wrkpkg-daysweek"
	}

	// Actions or Activities
	else if (sDisplay == "2" && sActivityType =="1") {
		sFilename += "actvty-mnthyear"
	}
	else if(sDisplay == "2" && sActivityType =="2")
	{
		sFilename += "actvty-daysmnth"
	}
	else if(sDisplay == "2" && sActivityType =="3")
	{
		sFilename += "actvty-daysweek"
	}

	if (sFilename != "")
	{
		// Append the DB view suffix
		sFilename += mssql + ".axvw";
	}	
	
	if (sFilename != ""){
	
		strXMLCancelChange = '<afmAction type="render" state="' + sFilename +'" response="true">';
		strXMLCancelChange = strXMLCancelChange + strSQLRestriction + '</afmAction>'; 
		//strXMLCancelChange = '<userInputRecordsFlag>' + strXMLCancelChange + '</userInputRecordsFlag>';
	
		//send request to server
		//alert(strXMLCancelChange);
		var targetFrameName = getFrameObject(parent, 'detailsFrame').name;	
		sendingDataFromHiddenForm('',strXMLCancelChange, targetFrameName, '',false,'');	
	}
}
