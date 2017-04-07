/******************************************************************
	ab-rm-reserve-review-console.js
	some javascript API used in
	ab-common-filter.js are defined in
	locale.js, date-time.js, and inputs-validation.js
	Javascript Api to set up filters in Tgrp.
	 strSerializedStartTag, strSerializedCloseTag,
	 strSerializedInsertingDataFirstPart,
	 strSerializedInsertingDataRestPart,
	 and setSerializedInsertingDataVariables(strSerialized); are in common.js
 ******************************************************************/
//don't change them! those variables will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = afmInputsFormName;
var selectValueInputFieldID      = "";
//in filter form, there is no lookup required
var bSelectValueLookup = false;
function addTime(date, daystoadd)
{
  var d, s, t;
  var MinMilli = 1000 * 60;
  var HrMilli = MinMilli * 60;
  var DyMilli = HrMilli * 24;
  t = Date.parse(date);
  s = Math.round(Math.abs(daystoadd * DyMilli)+Math.abs(t));
  d = new Date(s);
  return(d);
}
function settingView(strSerialized)
{
var objForm = document.forms[afmInputsFormName];

	var objForm = document.forms[afmInputsFormName];
	var project_id = "";
	var work_pkg_id= "";
	var activity_type = "";
	var date_approved = "";
	var date_accepted = "";

	project_id = objForm.elements["project.project_id"].value;
	project_id = trim(project_id);

	work_pkg_id = objForm.elements["work_pkgs.work_pkg_id"].value;
	work_pkg_id = trim(work_pkg_id);

	activity_type = objForm.elements["activitytype.activity_type"].value;
	activity_type = trim(activity_type);

	date_approved = objForm.elements["project.date_approved"].value;
	date_approved = trim(date_approved);

	date_accepted = objForm.elements["project.date_accepted"].value;
	date_accepted = trim(date_accepted);

	var display	= objForm.elements["Display"].selectedIndex+1;
	var view	= objForm.elements["View"].selectedIndex+1;

	//////////////saving info into main toolbar's javascript array
	//main toolbar frame window.top.frames[0]
	var objMainToolbarFrame = window.top;

	if(objMainToolbarFrame!=null)
	{
		//saving information into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;

		if(tempArray!=null)
		{
			var newTempArray = new Array();
			newTempArray["project.project_id"] = project_id;
			newTempArray["work_pkgs.work_pkg_id"] = work_pkg_id;
			newTempArray["activitytype.activity_type"] = activity_type;
			newTempArray["project.date_approved"] = date_approved;
			newTempArray["project.date_accepted"] = date_accepted;
			newTempArray["display"] = display;
			newTempArray["view"] = view;
			//assigned newTempArray to tempArray by name
			//"WR_REVIEW_INFO", which will be used to retreat info
			tempArray["GANTT_INFO"] = newTempArray;
		}
	}
	var sDisplay = display;
	var sActivityType = view;

	var sFilename = "";

	// Project
	if (sDisplay == "1" && sActivityType =="1") {
		sFilename = "ab-proj-adjust-timeline.axvw"
	}
	else if(sDisplay == "1" && sActivityType =="2")
	{
		sFilename = "ab-proj-projects-gantt-proj-week.axvw"
	}

	// Work Packages
	if (sDisplay == "2" && sActivityType =="1") {
		sFilename = "ab-proj-projects-gantt-work-pkgs-day.axvw"
	}
	else if(sDisplay == "2" && sActivityType =="2")
	{
		sFilename = "ab-proj-projects-gantt-work-pkgs-week.axvw"
	}

	// Actions or Activities

	strSerialized = insertRenderedAXVWFile2AfmAction(strSerialized,sFilename);

	sendingAfmActionRequestWithClientDataXMLString2Server("_parent", strSerialized, "");

}

//used in common.js to send uers's data to server
function gettingRecordsData(strSerialized)
{
	var objForm = document.forms[afmInputsFormName];
	var project_id = "";
	var work_pkg_id= "";
	var activity_type = "";
	var date_approved = "";
	var date_accepted = "";

	project_id = objForm.elements["project.project_id"].value;
	project_id = trim(project_id);

	work_pkg_id = objForm.elements["work_pkgs.work_pkg_id"].value;
	work_pkg_id = trim(work_pkg_id);

	activity_type = objForm.elements["activitytype.activity_type"].value;
	activity_type = trim(activity_type);

	date_approved = objForm.elements["project.date_approved"].value;
	date_approved = trim(date_approved);

	date_accepted = objForm.elements["project.date_accepted"].value;
	date_accepted = trim(date_accepted);

	var display	= objForm.elements["Display"].selectedIndex+1;
	var view	= objForm.elements["View"].selectedIndex+1;

	//////////////saving info into main toolbar's javascript array
	//main toolbar frame window.top.frames[0]
	var objMainToolbarFrame = window.top;
	if(objMainToolbarFrame!=null)
	{
		//saving information into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;

		if(tempArray!=null)
		{
			var newTempArray = new Array();
			newTempArray["project.project_id"] = project_id;
			newTempArray["work_pkgs.work_pkg_id"] = work_pkg_id;
			newTempArray["activitytype.activity_type"] = activity_type;
			newTempArray["project.date_approved"] = date_approved;
			newTempArray["project.date_accepted"] = date_accepted;
			newTempArray["display"] = display;
			newTempArray["view"] = view;
			//assigned newTempArray to tempArray by name
			//"WR_REVIEW_INFO", which will be used to retreat info
			tempArray["GANTT_INFO"] = newTempArray;
		}
	}
	if(date_accepted != "")
	{
		//ISO format
		date_accepted = getDateWithISOFormat(date_accepted);
	}

	if(date_approved != "")
	{
		//ISO format
		date_approved = getDateWithISOFormat(date_approved);
	}

	var strReturned = '';
	var strDateRangeStatement = "";
	var isEmpty=true;
	if(project_id != ""){
		strReturned += "<queryParameter name='projectid' type='java.lang.String' value='"+project_id+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='projectid' type='java.lang.String' value='%' />";

	if(work_pkg_id != ""  ){
		strReturned += "<queryParameter name='workpkgid' type='java.lang.String' value='"+work_pkg_id+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='workpkgid' type='java.lang.String' value='%' />";

	if(activity_type != ""){
		strReturned += "<queryParameter name='activitytype' type='java.lang.String' value='"+activity_type+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='activitytype' type='java.lang.String' value='%' />";

	if(date_approved != ""){
		strReturned += "<queryParameter name='datescheduled' type='java.lang.String' value='"+date_approved+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='datescheduled' type='java.lang.String' value='1990-01-01' />";

	if(date_accepted != ""){
		strReturned += "<queryParameter name='datescheduledend' type='java.lang.String' value='"+date_accepted+"' />";
		isEmpty=false;
	}else
		strReturned += "<queryParameter name='datescheduledend' type='java.lang.String' value='2990-01-01' />";

	//if (isEmpty==true){
	//	var goAhead = window.confirm("All the parameters are empty; this action could take long time\n Click OK to continue. Click Cancel to stop.");
	//	if (!goAhead)
	//	return;
	//}
	var erroroccured=false;

	if (project_id==""){
		alert(document.getElementById("alert_select_project").innerHTML);
		erroroccured=true;
	} //else if (date_approved=="" || date_accepted==""){
		//alert("Please Enter a date range!");
		//erroroccured=true;
	//}

	if (!erroroccured){
			strReturned = '<queryParameters>' + strReturned + '</queryParameters>';
			var strXMLCancelChange = "";
			var sDisplay = display;
			var sActivityType = view;
			var sFilename = "";

			// Project
			if (sDisplay == "1" && sActivityType =="1") {
				sFilename = "ab-proj-adjust-timeline.axvw"
			}
			else if(sDisplay == "1" && sActivityType =="2")
			{
				sFilename = "ab-proj-projects-gantt-proj-week.axvw"
			}

			// Work Packages
			if (sDisplay == "2" && sActivityType =="1") {
				sFilename = "ab-proj-projects-gantt-work-pkgs-day.axvw"
			}
			else if(sDisplay == "2" && sActivityType =="2")
			{
				sFilename = "ab-proj-projects-gantt-work-pkgs-week.axvw"
			}


			strXMLCancelChange = '<afmAction type="applyParameters1" state="'+sFilename+'" response="true">';
			//<restrictions>
			strXMLCancelChange = strXMLCancelChange + strReturned + '</afmAction>';
			strXMLCancelChange = '<userInputRecordsFlag>' + strXMLCancelChange + '</userInputRecordsFlag>';
//			alert(strXMLCancelChange);
			sendingAfmActionRequestWithClientDataXMLString2Server("_parent", strSerialized, strXMLCancelChange);
	}
}

function onPageLoad()
{
	var objForm = document.forms[afmInputsFormName];
	//////////////saving info into main toolbar's javascript array
	//main toolbar frame window.top.frames[0]
	var objMainToolbarFrame = window.top;
	if(objMainToolbarFrame!=null)
	{
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;
		if(objMainToolbarFrame.arrReferredByAnotherFrame1!=null)
		{
			var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1["GANTT_INFO"];

			if(tempArray!=null)
			{

				objForm.elements["project.project_id"].value = tempArray["project.project_id"];
				objForm.elements["work_pkgs.work_pkg_id"].value = tempArray["work_pkgs.work_pkg_id"];
				objForm.elements["activitytype.activity_type"].value = tempArray["activitytype.activity_type"];
				objForm.elements["project.date_approved"].value = tempArray["project.date_approved"];
				objForm.elements["project.date_accepted"].value = tempArray["project.date_accepted"];
				objForm.elements["Display"].value =	tempArray["display"];
				objForm.elements["View"].value = tempArray["view"];

			var auxDate = new Date();
				if(tempArray["project.date_approved"] != "")
				{
					auxDate = tempArray["project.date_approved"];
					objForm.elements["project.date_approved"].value = tempArray["project.date_approved"];
				} else {
					var date_approved = new Date();
					objForm.elements["project.date_approved"].value = FormattingDate(date_approved.getDate(),(date_approved.getMonth()+1),date_approved.getFullYear(),strDateShortPattern);
				}
				if(tempArray["project.date_accepted"] != "")
				{
					objForm.elements["project.date_accepted"].value = tempArray["project.date_accepted"];
				} else {
					var date_accepted = new Date(addTime(auxDate,90));
					objForm.elements["project.date_accepted"].value = FormattingDate(date_accepted.getDate(),(date_accepted.getMonth()+1),date_accepted.getFullYear(),strDateShortPattern);
				}

				if(tempArray["display"] == "1")
				{

					document.getElementById("workpkgTD").style.display="none";
					document.getElementById("projectTD").style.display="block";
					document.getElementById("projectTD").colspan="3";
				} else {
					document.getElementById("projectTD").style.display="none";
					document.getElementById("workpkgTD").style.display="block";
					document.getElementById("workpkgTD").colspan="3";
				}

			}else{
					var date_approved = new Date();
					objForm.elements["project.date_approved"].value = FormattingDate(date_approved.getDate(),(date_approved.getMonth()+1),date_approved.getFullYear(),strDateShortPattern);
					var date_accepted = new Date(addTime(date_approved,90));
					objForm.elements["project.date_accepted"].value = FormattingDate(date_accepted.getDate(),(date_accepted.getMonth()+1),date_accepted.getFullYear(),strDateShortPattern);

			}
		}
	}
}

//called in view-definition-form-content-table-filter.xsl
/*
strSerializedStartTag, strSerializedCloseTag,
strSerializedInsertingDataFirstPart,
strSerializedInsertingDataRestPart,
and setSerializedInsertingDataVariables(strSerialized);
convert2validXMLValue()
in common.js
*/
function onSelectV(strSerialized, strField, strTemp)
{
	var strXMLData = "";
	var objForm  = document.forms[afmInputsFormName];
	if(strField != "")
	{
		var typeUpperCase = arrFieldsInformation[strField]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[strField]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		var strValue = objForm.elements[strField].value;
		//removing money sign and grouping separator and changing date into ISO format
		strValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValue);
		//trim strValues
		strValue = strValue.replace(/^\s+/,'').replace(/\s+$/,'');
		if(typeUpperCase != "JAVA.SQL.TIME")
			strValue = convert2validXMLValue(strValue);
		var strData = "";
		var strXMLValue = "";
		if(strSerialized != "")
		{
			//calling setSerializedInsertingDataVariables() in
			//common.js to set up related js variables in common.js
			//strSerializedStartTag, strSerializedCloseTag,
			//strSerializedInsertingDataFirstPart,strSerializedInsertingDataRestPart
			setSerializedInsertingDataVariables(strSerialized);
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];
			<!-- adding role="self" in field will disable Java to show the values in its referred table if it is a foreign key -->
			<!-- not adding role="" or adding role="" with any string rather than "self" will enable Java to show the values in its referred table-->
			strData = '<fields><field role="self" table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			//strData = strData +gettingRecordsData();
			//strData = strData +strStartTag+ 'prefix ';
			//strData = strData + 'value="'+strValue+'"';
			//strData = strData + '/'+strCloseTag;
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
			//calling OpenSelectVWindow() to open a new window for server
			//to show available values for specified field
			OpenSelectVWindow(strXMLValue);
		}
		else
		{
			if(Debug)
			{
				alert("The attribute serialized of afmAction is empty.");
			}
		}
	}
}


//what this function is doing is not only validating the inputs, but
//also converting the inputs into correct localized date or time format
//(onBlur event: when mouse is leaving is focus for current date/time
//input field)
//validationAndConvertionDateInput() and
//validationAndConvertionTimeInput //are defined in date-time.js
function validationAndConvertionDateAndTime(fieldName, bPagedLoaded)
{
	var objForm = document.forms[afmInputsFormName];
	//var strField = objForm.elements[fieldName].value;
	var objValue = objForm.elements[fieldName];
	if(objValue.value != "")
	{
		var type  = arrFieldsInformation[fieldName]["type"];
		var typeUpperCase = type.toUpperCase();
		var bRequired  = arrFieldsInformation[fieldName]["required"];
		var field_value = objValue.value;
		if(typeUpperCase == "JAVA.SQL.DATE")
		{
			//since initially sever sends date in ISO format
			//"YYY-MM-DD"
			var dateArrayObj = new Array();
			if(bPagedLoaded && field_value != null && field_value != "")
				dateArrayObj = field_value.split("-");
			else
				dateArrayObj = null;
			validationAndConvertionDateInput(objValue, fieldName, dateArrayObj,bRequired, false, true);
		}
		else if(typeUpperCase == "JAVA.SQL.TIME")
		{
			//since initially sever sends time in the format "HH:MM"
			var TimeArrayObj = new Array();
			if(bPagedLoaded && field_value != null && field_value != "")
				TimeArrayObj = field_value.split(":");
			else
				TimeArrayObj = null;
			validationAndConvertionTimeInput(objValue, fieldName, TimeArrayObj,bRequired, false, true);
		}
	}
}
////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)
function validationInputs(strField)
{
	var objForm = document.forms[afmInputsFormName];
	var objValue = objForm.elements[strField];
	var bReturned = true;

	if(strField == "")
	{
		//set values input to empty
		objValue.value = "";
	}
	else if(objValue.value != "")
	{
		//validation
		var maxsize = arrFieldsInformation[strField]["size"];
		maxsize = parseInt(maxsize);
		var format  = arrFieldsInformation[strField]["format"];
		var formatUpperCase = format.toUpperCase();
		var type  = arrFieldsInformation[strField]["type"];
		var typeUpperCase = type.toUpperCase();
		var decimal = arrFieldsInformation[strField]["decimal"];

		//check integer
		if(typeUpperCase=="JAVA.LANG.INTEGER")
		{
			if(!validationIntegerOrSmallint(objValue, true))
				bReturned = false;
		}
		//check numeric
		else if(typeUpperCase=="JAVA.LANG.DOUBLE" || typeUpperCase=="JAVA.LANG.FLOAT")
		{
			if(!validationNumeric(objValue,decimal, true))
				bReturned = false;
		}

		//check UPPERALPHANUM
		if(formatUpperCase=="UPPERALPHANUM")
		{
			objValue.value = (objValue.value).toUpperCase();
			if(!validationUPPERALPHANUMString(objValue))
				bReturned = false;
		}
		//check UPPERALPHA
		else if(formatUpperCase=="UPPERALPHA")
		{
			objValue.value = (objValue.value).toUpperCase();
			if(!validationUPPERALPHAString(objValue))
				bReturned = false;
		}
		else if(formatUpperCase=="UPPER")
		{
			objValue.value = (objValue.value).toUpperCase();
		}

		//check maxsize(skip date and time fields)
		if(typeUpperCase!= "JAVA.SQL.DATE" && typeUpperCase!= "JAVA.SQL.TIME")
		{
			if(!validationDataMaxSize(objValue, arrFieldsInformation[strField]))
				bReturned = false;
		}
	}
	return bReturned;
}
function onCalcEndDates()
{

	var objForm = document.forms[afmInputsFormName];
	var project_id = "";
	var work_pkg_id= "";
	var display	= objForm.elements["Display"].selectedIndex+1;

	project_id = objForm.elements["project.project_id"].value;
	project_id = trim(project_id);

	work_pkg_id = objForm.elements["work_pkgs.work_pkg_id"].value;
	work_pkg_id = trim(work_pkg_id);
	if (work_pkg_id == "" & display==2)
	{
		alert(document.getElementById("alert_select_workpackage").innerHTML);
		return false;
	}else if (work_pkg_id == "" ) {
		work_pkg_id= "1";
	}
	if (project_id == "")
	{
		alert(document.getElementById("alert_select_project").innerHTML);
		return false;
	}


  var axvwFile    = "ab-proj-gantt-recalc-proj-sched-onload.axvw";
  if (display==2) {
  	axvwFile    = "ab-proj-gantt-recalc-wkpkg-sched-onload.axvw";
  }

  var targetFrame = "hidden_iframe";
  var strXMLSQLTransaction = '<afmAction type="render" state="' + axvwFile + '" response="true">';

  strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions><userInputRecordsFlag><restriction type="sql" sql="project_id=\''+project_id+'\'">';
  strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
  strXMLSQLTransaction = strXMLSQLTransaction + '</userInputRecordsFlag></restrictions>';
  strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
  sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrame, '',false,'');

}
