/*********************************************************************
 JavaScript File:ab-wr-cf-update-edit.js


 *********************************************************************/
///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";
//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;
var str_to_bl_id = "";
var str_to_fl_id = "";

var wrcf_wr_id;

function prepareLoad(formName,status)
{
	if(status!='')
	{
		//changing the value of show fields for date and time fields
		var objForm = document.forms[formName];
		var objdate_requested = objForm.elements["wr.date_requested"]
		if (objdate_requested != null)
		{
			var str_date_requested = objForm.elements["wr.date_requested"].value;
			var year, month, day;

			if(str_date_requested!="")
			{
				//str_date_requested: yyyy-mm-dd
				year = str_date_requested.split("-")[0];
				month = str_date_requested.split("-")[1];
				day = str_date_requested.split("-")[2];
				//FormattingDate() in date-time.js and strDateLongPattern in
				//locale.js
				var show_obj_date_requested = document.getElementById("show_wr.date_requested");

				if(show_obj_date_requested!=null)
					show_obj_date_requested.innerHTML = FormattingDate(day, month, year,  strDateLongPattern);
			}
		}

		var objdate_assigned = objForm.elements["wrcf.date_assigned"];
		if (objdate_assigned!=null)
		{
			var str_date_assigned = objdate_assigned.value;
			if(str_date_assigned =="")
			{
			//current date
				var curDate = new Date();
				var month = curDate.getMonth()+ 1;
				var day	  = curDate.getDate();
				var year  = curDate.getFullYear();
				var selectedDate = FormattingDate(day, month, year, strDateShortPattern);
				userSelectedDate = selectedDate;
				objForm.elements["wrcf.date_assigned"].value = userSelectedDate;
			}
		}
		//formatting localized numers
		var hours_straight_obj = objForm.elements["wrcf.hours_straight"];
		if(hours_straight_obj!=null)
		{
			var hours_straight = hours_straight_obj.value;
			hours_straight = "" + hours_straight;
			hours_straight = insertGroupingSeparator(hours_straight);
			hours_straight = hours_straight.replace(sNeutralDecimalSeparator, strDecimalSeparator);
			hours_straight_obj.value = hours_straight;
		}

		var hours_over_obj = objForm.elements["wrcf.hours_over"];
		if(hours_over_obj!=null)
		{
			var hours_over = hours_over_obj.value;
			hours_over = "" + hours_over;
			hours_over = insertGroupingSeparator(hours_over);
			hours_over = hours_over.replace(sNeutralDecimalSeparator, strDecimalSeparator);
			hours_over_obj.value = hours_over;
		}
	}
}

////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)
function validationInputs(formName, fieldName)
{
	var objForm = document.forms[formName];
	var objValue = objForm.elements[fieldName];
	var bReturned = true;
	if(objValue != null)
	{
		//arrFieldsInformation is in inputs-validation.js and
		//initialized by inputs-validation.xsl
		var maxsize = arrFieldsInformation[fieldName]["size"];
		maxsize = parseInt(maxsize);
		var format  = arrFieldsInformation[fieldName]["format"];
		var formatUpperCase = format.toUpperCase();
		var type  = arrFieldsInformation[fieldName]["type"];
		var typeUpperCase = type.toUpperCase();
		var decimal = arrFieldsInformation[fieldName]["decimal"];
		var bIsEnum = arrFieldsInformation[fieldName]["isEnum"];
		var required = arrFieldsInformation[fieldName]["required"];
		//don't work on any enumeration fields
		if(!bIsEnum)
		{
			//all validation funcrions are in inputs-validation.js
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
				if(!validationDataMaxSize(objValue, arrFieldsInformation[fieldName]))
					bReturned = false;
			}
			//check required fields
			if(!validationRequiredField(objValue, required))
				bReturned = false;
		}
	}
	return bReturned;
}

//and called in view-definition-form-content-table-filter.xsl
function onSelectV(strSerialized, strField, formName)
{
	var strXMLData = "";
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	if(selectedFieldObj != null)
	{
		//setSerializedInsertingDataVariables() in common.js
		setSerializedInsertingDataVariables(strSerialized);
		var typeUpperCase = arrFieldsInformation[strField]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[strField]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		var strValue = selectedFieldObj.value;
		//removing money sign and grouping separator and changing date into ISO format
		strValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValue);
		//trim strValue
		strValue = trim(strValue);
		//changing some special characters into valid characters in xml
		//convert2validXMLValue() in common.js
		strValue = convert2validXMLValue(strValue);
		var strData = "";
		var strXMLValue = "";
		if(strSerialized != "")
		{
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];

			strData = '<fields><field ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			strData = strData + '<userInputRecordsFlag><record ' + gettingRecordsData(objForm) + '/></userInputRecordsFlag>';
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

function onCancel(strSerialized, form_name)
{
	var objForm = document.forms[form_name];
	var wr_id, cf_id, work_type, status;
	var hours_over, hours_straight, comments;
	var date_assigned = "";
	var time_assigned = "";

	// date and time are already in ISO format

	date_assigned = objForm.elements["wrcf.hdate_assigned"].value;

	time_assigned = objForm.elements["wrcf.htime_assigned"].value;

	wr_id = objForm.elements["wrcf.wr_id"].value;

	cf_id = objForm.elements["wrcf.cf_id"].value;
	cf_id = trim(cf_id);
	cf_id = convert2validXMLValue(cf_id);

	var strXMLCancelChange = "";

	//render if transaction is OK.
	strXMLCancelChange = strXMLCancelChange + '<afmAction type="render" state="ab-wr-cf-assign-edit.axvw" response="true">';

	//<restrictions>
	strXMLCancelChange = strXMLCancelChange + '<restrictions>';
	strXMLCancelChange = strXMLCancelChange + '<restriction type="sql" sql="wrcf.wr_id='+wr_id+' AND cf_id=\''+cf_id+'\' AND wrcf.date_assigned=#Date%'+date_assigned+'% AND wrcf.time_assigned=#Time%'+time_assigned+'%">';
	strXMLCancelChange = strXMLCancelChange + '<title translatable="true">SQL Restriction</title>';
	strXMLCancelChange = strXMLCancelChange + '<field table="wrcf"/>';
	strXMLCancelChange = strXMLCancelChange + '</restriction>';
	strXMLCancelChange = strXMLCancelChange + '</restrictions>';
	strXMLCancelChange = strXMLCancelChange + '</afmAction>';

	strXMLCancelChange = '<userInputRecordsFlag>' + strXMLCancelChange + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLCancelChange);
}

function onClickSetAssignForm(strSerialized, form_name)
{
	var objForm = document.forms[form_name];
	var wr_id
	wr_id = objForm.elements["wrcf.wr_id"].value;

	// Assign wr_id to a variable
	wrcf_wr_id = wr_id;

	var strURLLink = "ab-wr-cf-assign-popup.axvw";
	var newWindow = openNewContent(strURLLink, "");
	if (newWindow) newWindow.focus();
}

function setUpPopupWithWorkRequestNumber(formName)
{
	var objForm	= document.forms[formName];
	if(objForm!=null)
	{
		if(opener!=null)
		{
			if(opener.wrcf_wr_id!=null)
			{
				objForm.elements["wrcf.wr_id"].value=opener.wrcf_wr_id;

				var objdate_assigned = objForm.elements["wrcf.date_assigned"];
				if (objdate_assigned!=null)
				{
					var str_date_assigned = objdate_assigned.value;
					if(str_date_assigned =="")
					{
			//current date
						var curDate = new Date();
						var month = curDate.getMonth()+ 1;
						var day	  = curDate.getDate();
						var year  = curDate.getFullYear();
						var selectedDate = FormattingDate(day, month, year, strDateShortPattern);
						userSelectedDate = selectedDate;
						objForm.elements["wrcf.date_assigned"].value = userSelectedDate;
					}
				}

			}
		}
	}
}

// save the craftsperson updates
function onSaveCraftspersonUpdate(strSerialized, form_name)
{
	var objForm = document.forms[form_name];

	var wr_id, cf_id, work_type, status;
	var hours_over, hours_straight, comments;

	var date_assigned = "";
	var time_assigned = "";
	var type, format;

	// date and time are already in ISO format

	date_assigned = objForm.elements["wrcf.hdate_assigned"].value;

	time_assigned = objForm.elements["wrcf.htime_assigned"].value;

	wr_id = objForm.elements["wrcf.wr_id"].value;

	cf_id = objForm.elements["wrcf.cf_id"].value;
	cf_id = trim(cf_id);
	cf_id = convert2validXMLValue(cf_id);

	comments = objForm.elements["wrcf.comments"].value;
	comments = trim(comments);
	comments = convert2validXMLValue(comments);

	work_type = objForm.elements["wrcf.work_type"].value;
	work_type = trim(work_type);
	work_type = convert2validXMLValue(work_type);

	status = objForm.elements["wr.status"].value;
	status = trim(status);
	status = convert2validXMLValue(status);

	//converting localized-formatting numbrers into neutral format
	hours_straight = objForm.elements["wrcf.hours_straight"].value;
	format  = arrFieldsInformation["wrcf.hours_straight"]["format"].toUpperCase();
	type  = arrFieldsInformation["wrcf.hours_straight"]["type"].toUpperCase();
	hours_straight = convertFieldValueIntoValidFormat(type, format, hours_straight);

	hours_over = objForm.elements["wrcf.hours_over"].value;
	format  = arrFieldsInformation["wrcf.hours_over"]["format"].toUpperCase();
	type  = arrFieldsInformation["wrcf.hours_over"]["type"].toUpperCase();
	hours_over = convertFieldValueIntoValidFormat(type, format, hours_over);


	var strXML  = "";

	var strXMLCraftspersonUpdate = "";

	//render if transaction is OK.
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<afmAction type="render" state="ab-wr-cf-assign-edit.axvw" response="true">';

	//<restrictions>
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<restrictions>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<restriction type="sql" sql="wrcf.wr_id='+wr_id+' AND cf_id=\''+cf_id+'\' AND wrcf.date_assigned=#Date%'+date_assigned+'% AND wrcf.time_assigned=#Time%'+time_assigned+'%">';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<title translatable="true">SQL Restriction</title>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<field table="wrcf"/>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</restriction>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</restrictions>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</afmAction>';

	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<transaction>';

	//update wrcf
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<command type="update">';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<record wrcf.work_type="'+work_type+'" ';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + 'wrcf.comments="'+comments+'" ';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + 'wrcf.hours_straight="'+hours_straight+'" ';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + 'wrcf.hours_over="'+hours_over+'" ';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '/>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<restriction type="sql" sql="wr_id='+wr_id+' AND cf_id=\''+cf_id+'\' AND date_assigned=#Date%'+date_assigned+'% AND time_assigned=#Time%'+time_assigned+'%">';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<title translatable="true">SQL Restriction</title>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<field table="wrcf"/>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</restriction>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</command>';

	//update wr
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<command type="update">';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<record  wr.status="'+status+'" ';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '/>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<restriction type="sql" sql="wr_id='+wr_id+'">';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<title translatable="true">SQL Restriction</title>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '<field table="wr"/>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</restriction>';
	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</command>';

	strXMLCraftspersonUpdate = strXMLCraftspersonUpdate + '</transaction>'
	strXMLCraftspersonUpdate = '<userInputRecordsFlag>' + strXMLCraftspersonUpdate + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLCraftspersonUpdate);
}

// Assign New Craftsperson without rendering
function onSaveCraftspersonAssign(strSerialized, form_name)
{
	var objForm = document.forms[form_name];

	var wr_id, cf_id, work_type, status;
	var hours_over, hours_straight, comments;

	wr_id = objForm.elements["wrcf.wr_id"].value;

	cf_id = objForm.elements["wrcf.cf_id"].value;
	cf_id = trim(cf_id);
	cf_id = convert2validXMLValue(cf_id);

	var date_assigned = objForm.elements["wrcf.date_assigned"].value;

	if(date_assigned!="")
	{
		date_assigned=getDateWithISOFormat(date_assigned);
	}
	else
	{
		date_assigned=getCurrentDateInISOFormat();
	}

	var time_assigned = "";
	var time_assigned = getCurrentTimeIn24HourFormat();

	var strXML  = "";

	var strXMLCraftspersonAssign = "";

	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<transaction>';

	//insert wrcf
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<command type="insert">';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<record wrcf.wr_id="'+wr_id+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.cf_id="'+cf_id+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.date_assigned="'+date_assigned+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.time_assigned="'+time_assigned+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '/>';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</command>';

	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</transaction>'
	strXMLCraftspersonAssign = '<userInputRecordsFlag>' + strXMLCraftspersonAssign + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLCraftspersonAssign);
}

// Assign New Craftsperson with rendering
function onSaveCraftspersonAssignRender(strSerialized, form_name)
{
	var target_name = "";

	if(opener!=null)
	{
		target_name = opener.name;
	}

	var objForm = document.forms[form_name];

	var wr_id, cf_id, work_type, status;
	var hours_over, hours_straight, comments;

	wr_id = objForm.elements["wrcf.wr_id"].value;

	cf_id = objForm.elements["wrcf.cf_id"].value;
	cf_id = trim(cf_id);
	cf_id = convert2validXMLValue(cf_id);

	var date_assigned = objForm.elements["wrcf.date_assigned"].value;

	if(date_assigned!="")
	{
		date_assigned=getDateWithISOFormat(date_assigned);
	}
	else
	{
		date_assigned=getCurrentDateInISOFormat();
	}

	var time_assigned = getCurrentTimeIn24HourFormat();

	var strXML  = "";

	var strXMLCraftspersonAssign = "";

	//render if transaction is OK.
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<afmAction type="render" state="ab-wr-cf-assign-dump.axvw" response="true">';

	//<restrictions>
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<restrictions>';
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<restriction type="sql" sql="wrcf.wr_id='+wr_id+' AND cf_id=\''+cf_id+'\' AND wrcf.date_assigned=#Date%'+date_assigned+'% AND wrcf.time_assigned=#Time%'+time_assigned+'%">';
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<title translatable="true">SQL Restriction</title>';
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<field table="wrcf"/>';
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</restriction>';
	//strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</restrictions>';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</afmAction>';

	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<transaction>';

	//insert wrcf
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<command type="insert">';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '<record wrcf.wr_id="'+wr_id+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.cf_id="'+cf_id+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.date_assigned="'+date_assigned+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + 'wrcf.time_assigned="'+time_assigned+'" ';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '/>';
	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</command>';

	strXMLCraftspersonAssign = strXMLCraftspersonAssign + '</transaction>';
	strXMLCraftspersonAssign = '<userInputRecordsFlag>' + strXMLCraftspersonAssign + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server("_self", strSerialized, strXMLCraftspersonAssign);
	//window.close();
}

function onCancelPopup(strSerialized, form_name)
{
	window.close();
}


//getting input data from the edit form
function gettingRecordsData(objForm)
{
	var strReturned = "";

	return strReturned;
}
