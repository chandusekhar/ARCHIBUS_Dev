/*********************************************************************
 Javascript file: ab-proj-console.js
 Contains javascript functions used by the Yalta project restriction console

 07/24/2007 KE 
*********************************************************************/

var systemYear = 2025;
var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = brg_project_view.bl_id AND ";
var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = brg_project_view.site_id AND ";
var programString = "EXISTS (SELECT 1 FROM program WHERE brg_project_view.program_id = program.program_id AND ";

/***
 * Clears values from the console and sets status to "All"
*/
function clearConsole() 
{
	var consoleFrame = getFrameObject(parent,'consoleFrame');
	if (consoleFrame)
	{
		var console = AFM.view.View.getControl(consoleFrame, 'consolePanel');
		if (console) console.clear();
		if ($('status')) $('status').value = "All";
	}
}

function projSelval(restriction)
{
	restriction = buildSelvalRestriction('brg_project_view.int_num', restriction);
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
   	
	var title = '';
	if (getMessage('projSelvalTitle') != "") title = getMessage('projSelvalTitle');
	AFM.view.View.selectValue('consolePanel',title,['brg_project_view.project_id'],'brg_project_view',['brg_project_view.project_id'],['brg_project_view.project_id','brg_project_view.status','brg_project_view.summary'],restriction);
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

function programIdSelval()
{
	var restriction = '';
	restriction = buildSelvalRestriction('program.program_type', restriction);
	AFM.view.View.selectValue('consolePanel', getMessage('programName'),['brg_project_view.program_id'],'program',['program.program_id'],['program.program_id','program.program_type'],restriction);
}

function getConsoleRestriction()
{ 
    var restriction = "";
	if ($('bl.state_id') && trim($('bl.state_id').value)) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if ($('brg_project_view.dv_id') && trim($('brg_project_view.dv_id').value))	restriction += "brg_project_view.dv_id LIKE \'%" + getValidValue('brg_project_view.dv_id') + "%\' AND ";
   	if ($('brg_project_view.project_type') && trim($('brg_project_view.project_type').value))	restriction += "brg_project_view.project_type LIKE \'%" + getValidValue('brg_project_view.project_type') + "%\' AND "; 
   	if ($('bl.city_id') && trim($('bl.city_id').value))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if ($('brg_project_view.dp_id') && trim($('brg_project_view.dp_id').value))	restriction += "brg_project_view.dp_id LIKE \'%" + getValidValue('brg_project_view.dp_id') + "%\' AND "; 
   	if ($('brg_project_view.project_id') && trim($('brg_project_view.project_id').value)) restriction += "brg_project_view.project_id LIKE \'%" + getValidValue('brg_project_view.project_id') + "%\' AND "; 
   	if ($('brg_project_view.site_id') && trim($('brg_project_view.site_id').value))	restriction += "brg_project_view.site_id LIKE \'%" + getValidValue('brg_project_view.site_id') + "%\' AND "; 
   	if ($('program.program_type') && trim($('program.program_type').value))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if ($('brg_project_view.proj_mgr') && trim($('brg_project_view.proj_mgr').value))	restriction += "brg_project_view.proj_mgr LIKE \'%" + getValidValue('brg_project_view.proj_mgr') + "%\' AND "; 
   	if ($('brg_project_view.bl_id') && trim($('brg_project_view.bl_id').value))	restriction += "brg_project_view.bl_id LIKE \'%" + getValidValue('brg_project_view.bl_id') + "%\' AND "; 
   	if ($('brg_project_view.program_id') && trim($('brg_project_view.program_id').value))	restriction += "brg_project_view.program_id LIKE \'%" + getValidValue('brg_project_view.program_id') + "%\' AND ";
   	if ($('brg_project_view.int_num') && trim($('brg_project_view.int_num').value))	restriction += "brg_project_view.int_num LIKE \'%" + getValidValue('brg_project_view.int_num') + "%\' AND ";

	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += "brg_project_view.status IN (\'Approved\',\'Approved-In Design\')";
	    } else if (status == 'In Execution') {
	    	restriction += "brg_project_view.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\')";
		} else restriction += "brg_project_view.status LIKE \'%\'";
	} else restriction += "brg_project_view.project_id IS NOT NULL";
	
	return restriction;	
}

function getConsoleRestrictionMDX()
{ 
    var restriction = "";
	if (trim($('bl.state_id').value)) restriction += "state_id LIKE \'%" + getValidValue('bl.state_id') + "%\' AND ";
   	if (trim($('brg_project_view.dv_id').value))	restriction += "dv_id LIKE \'%" + getValidValue('brg_project_view.dv_id') + "%\' AND ";
   	if (trim($('brg_project_view.project_type').value))	restriction += "project_type LIKE \'%" + getValidValue('brg_project_view.project_type') + "%\' AND "; 
   	if (trim($('bl.city_id').value)) restriction += "city_id LIKE \'%" + getValidValue('bl.city_id') + "%\' AND ";
   	if (trim($('brg_project_view.dp_id').value))	restriction += "dp_id LIKE \'%" + getValidValue('brg_project_view.dp_id') + "%\' AND "; 
   	if (trim($('brg_project_view.project_id').value)) restriction += "project_id LIKE \'%" + getValidValue('brg_project_view.project_id') + "%\' AND "; 
   	if (trim($('brg_project_view.site_id').value))	restriction += "site_id LIKE \'%" + getValidValue('brg_project_view.site_id') + "%\' AND "; 
   	if (trim($('program.program_type').value))	restriction += "program_type LIKE \'%" + getValidValue('program.program_type') + "%\' AND "; 
   	if (trim($('brg_project_view.proj_mgr').value))	restriction += "proj_mgr LIKE \'%" + getValidValue('brg_project_view.proj_mgr') + "%\' AND "; 
   	if (trim($('brg_project_view.bl_id').value))	restriction += "bl_id LIKE \'%" + getValidValue('brg_project_view.bl_id') + "%\' AND "; 
   	if (trim($('brg_project_view.program_id').value))	restriction += "program_id LIKE \'%" + getValidValue('brg_project_view.program_id') + "%\' AND ";
   	//if (trim($('brg_project_view.int_num').value))	restriction += "int_num LIKE \'%" + getValidValue('brg_project_view.int_num') + "%\' AND ";

    var status = $('status').value;
    if (status == 'In Planning') {
    	restriction += "status IN (\'Approved\',\'Approved-In Design\') AND is_template = 0";
    } else if (status == 'In Execution') {
    	restriction += "status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\') AND is_template = 0";
	} else restriction += "is_template = 0";

	return restriction;	
}


function getConsoleRestrictionForActions() 
{
	var projectString = "EXISTS (SELECT 1 FROM brg_project_view WHERE activity_log.project_id = brg_project_view.project_id AND ";
	var blString = "EXISTS (SELECT 1 FROM brg_project_view, bl WHERE activity_log.project_id = brg_project_view.project_id AND bl.bl_id = brg_project_view.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM brg_project_view, site WHERE activity_log.project_id = brg_project_view.project_id AND site.site_id = brg_project_view.site_id AND ";
	var programString = "EXISTS (SELECT 1 FROM brg_project_view, program WHERE activity_log.project_id = brg_project_view.project_id AND brg_project_view.program_id = program.program_id AND ";
 
    var restriction = "";
	if (trim($('bl.state_id').value)) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (trim($('brg_project_view.dv_id').value))	restriction += projectString + "brg_project_view.dv_id LIKE \'%" + getValidValue('brg_project_view.dv_id') + "%\') AND ";
   	if (trim($('brg_project_view.project_type').value))	restriction += projectString + "brg_project_view.project_type LIKE \'%" + getValidValue('brg_project_view.project_type') + "%\') AND "; 
   	if (trim($('bl.city_id').value))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if (trim($('brg_project_view.dp_id').value))	restriction += projectString + "brg_project_view.dp_id LIKE \'%" + getValidValue('brg_project_view.dp_id') + "%\') AND "; 
   	if (trim($('brg_project_view.project_id').value)) restriction += projectString + "brg_project_view.project_id LIKE \'%" + getValidValue('brg_project_view.project_id') + "%\') AND "; 
   	if (trim($('brg_project_view.site_id').value))	restriction += projectString + "brg_project_view.site_id LIKE \'%" + getValidValue('brg_project_view.site_id') + "%\') AND "; 
   	if (trim($('program.program_type').value))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (trim($('brg_project_view.proj_mgr').value))	restriction += projectString + "brg_project_view.proj_mgr LIKE \'%" + getValidValue('brg_project_view.proj_mgr') + "%\') AND "; 
   	if (trim($('brg_project_view.bl_id').value))	restriction += projectString + "brg_project_view.bl_id LIKE \'%" + getValidValue('brg_project_view.bl_id') + "%\') AND "; 
   	if (trim($('brg_project_view.program_id').value))	restriction += projectString + "brg_project_view.program_id LIKE \'%" + getValidValue('brg_project_view.program_id') + "%\') AND ";
  	//if (trim($('brg_project_view.int_num').value))	restriction += projectString + "brg_project_view.int_num LIKE \'%" + getValidValue('brg_project_view.int_num') + "%\') AND ";

    var status = $('status').value;
    if (status == 'In Planning') {
    	restriction += projectString + "brg_project_view.status IN (\'Approved\',\'Approved-In Design\') AND brg_project_view.is_template = 0)";
    } else if (status == 'In Execution') {
    	restriction += projectString + "brg_project_view.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\') AND brg_project_view.is_template = 0)";
	} else restriction += projectString + "brg_project_view.is_template = 0)";

	return restriction;
}

function getValidValue(inputFieldName)
{
	var fieldValue = $(inputFieldName).value;
	var typeUpperCase = arrFieldsInformation[inputFieldName]["type"];
	typeUpperCase = typeUpperCase.toUpperCase();
	var formatUpperCase = arrFieldsInformation[inputFieldName]["format"];
	formatUpperCase = formatUpperCase.toUpperCase();
	fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);
	fieldValue = trim(fieldValue);
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
	
	var consolePanel = AFM.view.View.getControl('', 'consolePanel');
	if (consolePanel)
	{
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
}

function clearConsoleTimeframe()
{
	if ($('from_year')) $('from_year').value = systemYear;
	if ($('to_year')) $('to_year').value = systemYear;
	if ($('num_days')) $('num_days').value = '0';
	if ($('timeframe_type_all')) $('timeframe_type_all').checked = true;
}

// taken with modification from ab-proj-restrct-project-std-console.js
// Build and return restriction for activity_log or project start and end dates
// start and end must be in ISO format (yyyy-mm-dd)
function getDateSchedRestriction(start, end, ctype) 
{
  var strDateRangeStatement = " AND (";
  var sTable = "activity_log";
  var sDateField1 = "date_scheduled";
  var sDateField2 = "date_scheduled_end";

  if (ctype=="timeframe2") {
  	sTable = "brg_project_view";
  }

  var dstr1 = '#Date%'+start+'%';
  var dstr2 = '#Date%'+end+'%';
  var conj = " AND ";
  var endp = "";
  if (start == "") conj = "(";  // if no start, just place parens for end
  if (end == "") endp = ")";  // if no end, place paren at start

  if (start!="") strDateRangeStatement += '(' + sTable + '.' + sDateField1 + '&gt;=' + dstr1 + endp;
  if (end!="") strDateRangeStatement += conj + sTable + '.' + sDateField1 + '&lt;=' + dstr2 + ')';

  if (sDateField2 != "") {

    if (start!="") strDateRangeStatement += ' OR (' + sTable + '.' + sDateField2 + '&gt;=' + dstr1 + endp;
    if (end!="") strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&lt;=' + dstr2 + ')';

    if (start!="" && end!="") {
      strDateRangeStatement += ' OR (' + sTable + '.' + sDateField1 + '&lt;=' + dstr1 + endp;
      strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&gt;=' + dstr2 + ')';
    }
  }
  strDateRangeStatement += ')';
  return strDateRangeStatement;
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

function renderView(viewName, frameName, restriction)
{
	if (!valueExists(restriction))
	{
		restriction = getConsoleRestriction();
		restriction += " AND brg_project_view.is_template = 0";
	}
	var targetFrameName = getFrameObject(parent, frameName).name;	
	var strXMLSQLTransaction = '<afmAction type="render" state="'+viewName+'" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');	
}

// Modified from generateQueryParameters() in edit-forms.js 
// to add %% around each console value. 
// Remove <queryParameters></queryParameters> tag
// Add status values
function generateQueryParametersFromConsole(fieldsList)
{
	var queryParameters = '';
	var objForm = document.forms[arrAllUsersInputFormNames[0]];
	if(fieldsList != "")
	{
		for(var n in arrFieldsInformation){
			if(!validationInputs(objForm.name, n, true)){
				return;
			}
		}
		var fieldsArray = fieldsList.split(",");
		for(var i=0;i<fieldsArray.length;i++){
			var fieldName = fieldsArray[i];
			var fieldValue = getValidSqlValueFromFieldInput(fieldName, objForm);
			var db_fieldFullName = arrFieldsInformation[fieldName]['fullName'];
			if(fieldValue!="")
				queryParameters = queryParameters + '<queryParameter name="'+db_fieldFullName.split(".")[1]+'" type="'+arrFieldsInformation[fieldName]["type"]+'" value="%' + fieldValue + '%"/>';
		}
	}
	
	if($('status'))
	{
		var status = $('status').value;
	    if (status == 'In Planning') {
	    	queryParameters += '<queryParameter name="proj_status1" type="java.lang.String" value="Approved"/>';
	    	queryParameters += '<queryParameter name="proj_status2" type="java.lang.String" value="Approved-In Design"/>';
	    } else if (status == 'In Execution') {
	    	queryParameters += '<queryParameter name="proj_status1" type="java.lang.String" value="Issued-In Process"/>';
	    	queryParameters += '<queryParameter name="proj_status2" type="java.lang.String" value="Issued-On Hold"/>';
	    	queryParameters += '<queryParameter name="proj_status3" type="java.lang.String" value="Completed-Pending"/>';
	    	queryParameters += '<queryParameter name="proj_status4" type="java.lang.String" value="Completed-Not Ver"/>';
		}
	}
	return queryParameters;
}

function generateTimeframeQueryParametersFromConsole()
{
	var queryParameters = '';
	if(!$('timeframe_type_all').checked)
	{
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
	    queryParameters += '<queryParameter name="date_start" type="java.sql.Date" value="'+date_start+'"/>';
	    queryParameters += '<queryParameter name="date_end" type="java.sql.Date" value="'+date_end+'"/>';
	}
	return queryParameters;
}

function setDetailsPanelTitle()
{
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	var detailsPanel = AFM.view.View.getControl(detailsFrame,'detailsPanel');
	var project_id = detailsPanel.restriction['brg_project_view.project_id'];
	var panelTitle = getMessage('detailsPanelTitle');
	var titleElement = detailsFrame.$('detailsPanel_head').firstChild.firstChild.firstChild;
	if (titleElement) titleElement.innerHTML = panelTitle + ' - ' + project_id;
}

// used by views which display activity_log.date_scheduled_end, a calculated value
function onCalcEndDates()
{
	var project_id = "";
	if ($('brg_project_view.project_id')) project_id = trim($('brg_project_view.project_id').value);
	var parameters = {'project_id':project_id};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-calcActivityLogDateSchedEndForProject',parameters);
	if (result.code == 'executed') {
		return true;		
	} 
	else 
	{
		alert(result.code + " :: " + result.message);
		return false;
	}	
}
