/******************************************************************
	ab-wr-approve-or-issue-console.js
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

//used in common.js to send uers's data to server
function gettingRecordsData()
{
	var objForm = document.forms[afmInputsFormName];
	var wr_id, requestor, description, prob_type, bl_id, eq_id;
	var Urgency = objForm.elements["Urgency"].value;
	var DateRange = objForm.elements["DateRange"].value;
	//since selecting date from calendar is up to the name or id in
	//<input>, date_assigned is dump here
	var date_requested1, date_requested2;
	date_requested1 = objForm.elements["wr.date_requested"].value;
	date_requested1 = trim(date_requested1);
	date_requested2 = objForm.elements["wr.date_assigned"].value;
	date_requested2 = trim(date_requested2);

	wr_id = objForm.elements["wr.wr_id"].value;
	wr_id = trim(wr_id);
	requestor = objForm.elements["wr.requestor"].value;
	requestor = trim(requestor);
	description = objForm.elements["wr.description"].value;
	description = trim(description);
	prob_type = objForm.elements["wr.prob_type"].value;
	prob_type = trim(prob_type);
	bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = trim(bl_id);
	eq_id = objForm.elements["wr.eq_id"].value;
	eq_id = trim(eq_id);

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
			newTempArray["wr.wr_id"] = wr_id;
			newTempArray["wr.requestor"] = requestor;
			newTempArray["wr.description"] = description;
			newTempArray["wr.prob_type"] = prob_type;
			newTempArray["wr.bl_id"] = bl_id;
			newTempArray["wr.eq_id"] = eq_id;
			newTempArray["Urgency"] = Urgency;
			newTempArray["DateRange"] = DateRange;
			newTempArray["wr.date_requested"] = date_requested1;
			newTempArray["wr.date_assigned"] = date_requested2;

			//assigned newTempArray to tempArray by name
			//"WR_APPROVE_ISSUE_INFO", which will be used to retreat info
			tempArray["WR_APPROVE_ISSUE_INFO"] = newTempArray;
		}
	}
	//????
	wr_id = convert2validXMLValue(wr_id);
	requestor = convert2validXMLValue(requestor);
	description = convert2validXMLValue(description);
	prob_type = convert2validXMLValue(prob_type);
	bl_id = convert2validXMLValue(bl_id);
	eq_id = convert2validXMLValue(eq_id);
	/////LIKE in SQL STATEMENT
	if(requestor!="")
		requestor = "%"+requestor+"%";
	if(description!="")
		description = "%"+description+"%";
	if(prob_type!="")
		prob_type = "%"+prob_type+"%";
	if(bl_id!="")
		bl_id = "%"+bl_id+"%";
	if(eq_id!="")
		eq_id = "%"+eq_id+"%";


	var strUrStatement = "";
	if(Urgency=="Emergency")
		strUrStatement = 'wr.priority &gt;75 ';
	else if(Urgency=="One Day")
		strUrStatement = 'wr.priority &lt;= 75 AND wr.priority &gt; 50 ';
	else if(Urgency=="One Week")
		strUrStatement = 'wr.priority &lt;= 50 AND wr.priority &gt; 25 ';
	else if(Urgency=="One Month")
		strUrStatement = 'wr.priority &lt;= 25 AND wr.priority &gt; 0 ';
	else if(Urgency=="Eventually")
		strUrStatement = 'wr.priority=0 ';

	//current date
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	var temp_Today = "";
	var temp_Day = "";
	//strDateShortPattern is defined in locale.js  and overwritten by
	//xslt from server
	temp_Today = FormattingDate(day, month, year, strDateShortPattern);
	temp_Today = getDateWithISOFormat(temp_Today);
	var strDateRangeStatement = "";
	if(DateRange=="Today")
	{
		strDateRangeStatement = "wr.date_requested=#Date%"+temp_Today+"%";
	}
	else if(DateRange=="This Week")
	{
		var start_date_this_week_time = curDate.getTime() - ( 24*60*60*1000*(curDate.getDay()));
		var start_date_this_week = new Date(start_date_this_week_time);
		var end_date_this_week = new Date(start_date_this_week_time+24*60*60*1000*6);

		var temp_start_date_this_week = FormattingDate(start_date_this_week.getDate(), start_date_this_week.getMonth()+1, start_date_this_week.getFullYear(), strDateShortPattern);
		temp_start_date_this_week = getDateWithISOFormat(temp_start_date_this_week);
		var temp_end_date_this_week = FormattingDate(end_date_this_week.getDate(), end_date_this_week.getMonth()+1, end_date_this_week.getFullYear(), strDateShortPattern);
		temp_end_date_this_week = getDateWithISOFormat(temp_end_date_this_week);
		strDateRangeStatement = "wr.date_requested &gt;=#Date%"+temp_start_date_this_week+"% AND wr.date_requested &lt;=#Date%"+temp_end_date_this_week+"%";
	}
	else if(DateRange=="This Month")
	{
		var max_days_this_month = GetMonthMaxDays(month, year);
		var temp_start_date_this_month = FormattingDate(1, month, year, strDateShortPattern);
		temp_start_date_this_month = getDateWithISOFormat(temp_start_date_this_month);
		var temp_end_date_this_month = FormattingDate(max_days_this_month, month, year, strDateShortPattern);
		temp_end_date_this_month = getDateWithISOFormat(temp_end_date_this_month);
		strDateRangeStatement = "wr.date_requested &gt;=#Date%"+temp_start_date_this_month+"% AND wr.date_requested &lt;=#Date%"+temp_end_date_this_month+"%";
	}
	else if(DateRange=="This Year")
	{
		var temp_start_Date = FormattingDate(1, 1, year, strDateShortPattern);
		temp_start_Date = getDateWithISOFormat(temp_start_Date);
		var temp_end_Date = FormattingDate(31, 12, year, strDateShortPattern);
		temp_end_Date = getDateWithISOFormat(temp_end_Date);
		strDateRangeStatement = "wr.date_requested &gt;=#Date%"+temp_start_Date+"% AND wr.date_requested &lt;=#Date%"+temp_end_Date+"%";
	}
	else if(DateRange=="Date Range")
	{
		if(date_requested1 != "" && date_requested2 != "")
		{
			date_requested1 = getDateWithISOFormat(date_requested1);
			date_requested2 = getDateWithISOFormat(date_requested2);
			strDateRangeStatement = "wr.date_requested &gt;=#Date%"+date_requested1+"% AND wr.date_requested &lt;=#Date%"+date_requested2+"%";
		}
	}

	var strSQLRestriction = "";
	var strSQLStatement = "";
	//wr.status is "R" or "Rev"
	strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="=" value="R"><field name="status" table="wr"/></clause>';
	strSQLRestriction = strSQLRestriction + '<clause relop="OR" op="=" value="Rev"><field name="status" table="wr"/></clause>';

	//if(strSQLRestriction != "")
	strSQLRestriction = '<restriction type="parsed"><title translatable="true"/>' + strSQLRestriction + '</restriction>';
	if(wr_id != "")
		strSQLRestriction = strSQLRestriction + '<restriction type="parsed"><title translatable="true"/><clause relop="AND" op="=" value="'+wr_id+'"><field name="wr_id" table="wr"/></clause></restriction>';
	//even strReturned is empty, <restrictions></restrictions> is necessary to be passed to server
	//strSQLRestriction = strSQLRestriction + '<userInputRecordsFlag><restriction type="sql" ';
	if(bl_id != "")
		strSQLStatement = strSQLStatement + 'sql="wr.bl_id LIKE \''+bl_id+'\' ';
	if(eq_id != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND wr.eq_id LIKE \''+eq_id+'\' ';
		else
			strSQLStatement = strSQLStatement + 'sql="wr.eq_id LIKE \''+eq_id+'\' ';
	}
	if(prob_type != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND wr.prob_type LIKE \''+prob_type+'\' ';
		else
			strSQLStatement = strSQLStatement + 'sql="wr.prob_type LIKE \''+prob_type+'\' ';
	}
	if(description != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND wr.description LIKE \''+description+'\' ';
		else
			strSQLStatement = strSQLStatement + 'sql="wr.description LIKE \''+description+'\' ';
	}
	if(requestor != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND wr.requestor LIKE \''+requestor+'\' ';
		else
			strSQLStatement = strSQLStatement + 'sql="wr.requestor LIKE \''+requestor+'\' ';
	}
	/////////////{ is a reserved key character for XSLT engine?????????//////////////////////
	/*if(Urgency != "All")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND { fn LOCATE( \'' + Urgency + '\', wr.description ) } &gt;&lt; 0 ';
		else
			strSQLStatement = strSQLStatement + 'sql="{ fn LOCATE( \'' + Urgency + '\', wr.description ) } &gt;&lt; 0 ';
	}*/
	if(strUrStatement != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND '+strUrStatement;
		else
			strSQLStatement = strSQLStatement + 'sql="'+strUrStatement;
	}
	if(strDateRangeStatement != "")
	{
		if(strSQLStatement != "")
			strSQLStatement = strSQLStatement + 'AND '+strDateRangeStatement;
		else
			strSQLStatement = strSQLStatement + 'sql="'+strDateRangeStatement;
	}

	if(strSQLStatement != "")
	{
		strSQLStatement = strSQLStatement + '"';
		strSQLRestriction = strSQLRestriction + '<restriction type="sql" ';
		strSQLRestriction = strSQLRestriction + strSQLStatement + ">";
		strSQLRestriction = strSQLRestriction +	'<title translatable="true"></title><field table="wr"/></restriction>';
	}
	strSQLRestriction = '<userInputRecordsFlag><restrictions>' + strSQLRestriction + '</restrictions></userInputRecordsFlag>';

	return strSQLRestriction;
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
			var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1["WR_APPROVE_ISSUE_INFO"];
			if(tempArray!=null)
			{
				objForm.elements["wr.wr_id"].value=tempArray["wr.wr_id"];
				objForm.elements["wr.requestor"].value=tempArray["wr.requestor"];
				objForm.elements["wr.description"].value=tempArray["wr.description"];
				objForm.elements["wr.bl_id"].value=tempArray["wr.bl_id"];
				objForm.elements["wr.eq_id"].value=tempArray["wr.eq_id"];
				objForm.elements["wr.prob_type"].value=tempArray["wr.prob_type"];
				objForm.elements["Urgency"].value=tempArray["Urgency"];
				objForm.elements["wr.date_requested"].value=tempArray["wr.date_requested"];
				objForm.elements["wr.date_assigned"].value=tempArray["wr.date_assigned"];
				objForm.elements["DateRange"].value=tempArray["DateRange"];
				var objDateRangeArea = document.getElementById("DateRangeArea");
				if(objForm.elements["DateRange"].value=="Date Range")
					objDateRangeArea.style.display="";
				else
					objDateRangeArea.style.display="none";
			}
		}
	}
	{
		//current date
		var curDate = new Date();
		var month = curDate.getMonth()+ 1;
		var day	  = curDate.getDate();
		var year  = curDate.getFullYear();
		var temp_date = FormattingDate(day, month, year, strDateShortPattern);
		if(objForm.elements["wr.date_assigned"].value == "")
			objForm.elements["wr.date_assigned"].value = temp_date;
		if(objForm.elements["wr.date_requested"].value == "")
		{
			temp_date = FormattingDate(1, 1, 1990, strDateShortPattern);
			objForm.elements["wr.date_requested"].value = temp_date;
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

//////
function checkDateRange(dateRangeName, strDateRangeValue, dateRangeAreaName)
{
	var objDateRange = document.getElementById(dateRangeName);
	var objDateRangeArea = document.getElementById(dateRangeAreaName);
	if(objDateRange.value==strDateRangeValue)
		objDateRangeArea.style.display="";
	else
		objDateRangeArea.style.display="none";
}

//////
function onReset(dateRangeName, strDateRangeValue, dateRangeAreaName)
{
}

//????????????????????????????????
function setupDateInputFieldValue(day, month, year)
{
	var selectedDate = FormattingDate(day, month, year, strDateShortPattern);
	userSelectedDate = selectedDate;
	var objSelectedDate	= document.getElementById(userSelectedDateID);
	if(objSelectedDate != null)
		objSelectedDate.innerHTML = selectedDate;
}

function filledUpDate(strElementName)
{
	var objForm = document.forms[afmInputsFormName];
	var objElem = objForm.elements[strElementName];
	//current date
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	if(trim(objElem.value)=="")
	{
		if(strElementName=="wr.date_requested")
			objElem.value = FormattingDate(1, 1, 1990, strDateShortPattern);
		else if(strElementName=="wr.date_assigned")
			objElem.value = FormattingDate(day, month, year, strDateShortPattern);
	}
}
function onSelectV_wr_code(strSerialized, strField, strTemp)
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
			strData = '<fields><field role="self" table="'+temp_table+'" name="'+temp_field+'"/></fields><restriction type="sql" sql="wr.status IN (\'R\',\'Rev\')"/>';
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
function onShow(strUrl, strSerialized, strTarget, subFrameName ,bData, newWindowSettings)
{
	var arrFieldNames = new Array("wr.wr_id");
	if(validationInputs("wr.wr_id"))
		sendingDataFromHiddenForm(strUrl, strSerialized, strTarget, subFrameName ,bData, "");

}
