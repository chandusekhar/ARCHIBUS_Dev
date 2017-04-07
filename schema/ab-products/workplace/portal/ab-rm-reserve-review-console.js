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

//used in common.js to send uers's data to server
function gettingRecordsData()
{
	var objForm = document.forms[afmInputsFormName];
	var bl_id = "";
	var fl_id = "";
	var date_start = "";
	var date_end = "";

	bl_id = objForm.elements["rm_reserve.bl_id"].value;
	bl_id = trim(bl_id);

	fl_id = objForm.elements["rm_reserve.fl_id"].value;
	fl_id = trim(fl_id);

	date_start = objForm.elements["rm_reserve.date_start"].value;
	date_start = trim(date_start);

	date_end = objForm.elements["rm_reserve.date_end"].value;
	date_end = trim(date_end);

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
			newTempArray["rm_reserve.bl_id"] = bl_id;
			newTempArray["rm_reserve.fl_id"] = fl_id;
			newTempArray["rm_reserve.date_start"] = date_start;
			newTempArray["rm_reserve.date_end"] = date_end;
			//assigned newTempArray to tempArray by name
			//"WR_REVIEW_INFO", which will be used to retreat info
			tempArray["RM_RESERVE_REVIEW_INFO"] = newTempArray;
		}
	}
	if(date_start != "")
	{
		//ISO format
		date_start = getDateWithISOFormat(date_start);
	}
	if(date_end != "")
	{
		//ISO format
		date_end = getDateWithISOFormat(date_end);
	}
	var strSQLRestriction = "";
	var strDateRangeStatement = "";
	if(bl_id != "")
		strSQLRestriction = '<clause relop="AND" op="LIKE" value="'+bl_id+'%"><field name="bl_id" table="rm_reserve"/></clause>';
	if(fl_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+fl_id+'%"><field name="fl_id" table="rm_reserve"/></clause>';

	if(strSQLRestriction != "")
		strSQLRestriction = '<restriction type="parsed">' + strSQLRestriction + '</restriction>';
	if(date_start != "")
		strDateRangeStatement = 'rm_reserve.date_start &gt;=#Date%'+date_start+'%';
	if(date_end != "")
	{
		if(strDateRangeStatement != "")
			strDateRangeStatement = strDateRangeStatement + ' AND rm_reserve.date_end &lt;=#Date%'+date_end+'%';
		else
			strDateRangeStatement = 'rm_reserve.date_end &lt;=#Date%'+date_end+'%';
	}
	if(strDateRangeStatement != "")
		strSQLRestriction = strSQLRestriction + '<restriction type="sql" sql="'+strDateRangeStatement+'"><title translatable="true"></title><field table="rm_reserve"/></restriction>';
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
			var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1["RM_RESERVE_REVIEW_INFO"];
			if(tempArray!=null)
			{
				objForm.elements["rm_reserve.bl_id"].value=tempArray["rm_reserve.bl_id"];
				objForm.elements["rm_reserve.fl_id"].value=tempArray["rm_reserve.fl_id"];
				objForm.elements["rm_reserve.date_start"].value=tempArray["rm_reserve.date_start"];
				objForm.elements["rm_reserve.date_end"].value=tempArray["rm_reserve.date_end"];
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
