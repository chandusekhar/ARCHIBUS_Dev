/******************************************************************
	ab-common-filter.js
	some javascript API used in
	ab-common-filter.js are defined in
	locale.js, date-time.js, and inputs-validation.js
	Javascript Api to set up filters in Tgrp.
	 strSerializedStartTag, strSerializedCloseTag,
	 strSerializedInsertingDataFirstPart,
	 strSerializedInsertingDataRestPart,
	 and setSerializedInsertingDataVariables(strSerialized); are in common.js
 ******************************************************************/
var iTotalRowsForFilter = 0;
//overwritten by XSLT
var userSelectedDateID = "userSelectedDate";
var userSelectedDate;
//don't change them! those variables will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = afmInputsFormName;
var selectValueInputFieldID      = "";
//in filter form, there is no lookup required
var bSelectValueLookup = false;
//this array contains the enum fields and their enum lists
var arrEnumFieldsAndLists = new Array();
//called in view-definition-form-content-table-filter.xsl
//enumFieldName=rm.prorate
//enumFieldValueList=new Array();
//(enumFieldValueList["value"]="display";)
//enumFieldValueList["NONE"]="NONE";enumFieldValueList["FLOOR"]="FLOOR";
//enumFieldValueList["BUILDING"]="BUILDING";enumFieldValueList["SITE"]="SITE";
function setupArrEnumFieldsAndLists(FieldName,arrValueList)
{
	arrEnumFieldsAndLists[FieldName] = arrValueList;
}

//called in view-definition-form-content-table-filter.xsl
//when enumList select box is shown up to put its selected value into
//values input field in the form
function setupSelectedEunmValue(n)
{
	var objForm		= document.forms[afmInputsFormName];
	var objEnumList = objForm.elements['enumValues'+n];
	if(objEnumList != null)
	{
		var objValue	= objForm.elements['values'+n];
		var strEnumValue = objEnumList.value;
		objValue.value = strEnumValue;
	}
}
//used in view-definition-form-content-table-filter.xsl
//called when html onload
function onInitialLoad()
{
	var objForm	= document.forms[afmInputsFormName];
	var iFlag   = 1;
	var objField = null;
	for(var i = 1; i <= iTotalRowsForFilter; i++)
	{
		objField	= objForm.elements['field'+i];
		if(objField != null && objField.value != '')
		{
			iFlag = i + 1;
			//check if shown field is enum or regular
			checkAndSetupSelectedFieldValueInput(objForm,i);
			//format date and time fields in a localized format
			validationAndConvertionDateAndTime(i, true);
			handleSpecialOperator(i);
		}
	}
	disableElements(iFlag+1);
	//??????????????????????
	var curDate		= new Date();
	var year		= curDate.getFullYear();
	var month		= curDate.getMonth()+ 1;
	var day			= curDate.getDate();
	setupDateInputFieldValue(day, month, year);
	///////////////////////////////////

}
//show or hide value field and select value action button
function handleSpecialOperator(n)
{
	var objForm		= document.forms[afmInputsFormName];
	var objOperator	= objForm.elements['operator'+n];
	var objValue	= document.getElementById('hidden_values'+n);
	var objSelectV  = objForm.elements['selectV'+n];
	//if operator is selected as "IS NULL" or "IS NOT NULL", hide the value input
	if(objOperator.value == "IS NULL" || objOperator.value == "IS NOT NULL" )
	{
		objValue.style.display="none";
		objSelectV.disabled = 1;
		objSelectV.style.display="none";
	}
	else
	{
		objValue.style.display="";
		objSelectV.disabled = 0;
		objSelectV.style.display="";
	}
}
//set up operator
function onSelectOperator(n)
{
	var objForm		= document.forms[afmInputsFormName];
	var objField	= objForm.elements['field'+n];
	var objValue	= document.getElementById('hidden_values'+n);
	var objOperator	= objForm.elements['operator'+n];
	var objSelectV  = objForm.elements['selectV'+n];
	var objConjunction = objForm.elements['conjunction'+n];

	//if operator is selected as "IS NULL" or "IS NOT NULL", hide the value input
	if(objOperator.value == "IS NULL" || objOperator.value == "IS NOT NULL" )
	{
		objValue.style.display="none";
		objSelectV.disabled = 1;
		objSelectV.style.display="none";
	}
	else
	{
		objValue.style.display="";
		objSelectV.disabled = 0;
		objSelectV.style.display="";
		//check if shown field is enum or regular
		checkAndSetupSelectedFieldValueInput(objForm,n);
	}
	//if the conjunction is empty, set up its default one
	if(objConjunction != null && (objConjunction.value == "" ||objConjunction.value == "NONE"))
		objConjunction[0].selected = 1;

	//if the field is empty, set up its default one
	if(objField.value == "")
		objField[0].selected = 1;

	if(objOperator.value == "")
		objOperator[0].selected = 1;

	//enable all elements in the next row
	enableRowElements(n+1);

}
//set up conjunction
function onSelectConjunction(n)
{
	var objForm		= document.forms[afmInputsFormName];
	var objValueDIV	= document.getElementById('hidden_values'+n);
	var objSelectV  = objForm.elements['selectV'+n];
	var objOperator	= objForm.elements['operator'+n];
	var objConjunction = objForm.elements['conjunction'+n];
	var objField	= objForm.elements['field'+n];
	var objValue	= objForm.elements['values'+n];
	//if conjunction is not empty or not equal to "NONE", check if
	//operator or field is empty
	if(objConjunction.value != ""  && objConjunction.value != "NONE" )
	{
		objSelectV.disabled = 0;
		if(objOperator.value == "")
		{
			objOperator[0].selected = 1;
		}
		else
		{
			if(objOperator.value == "IS NULL" || objOperator.value == "IS NOT NULL")
			{
				objValueDIV.style.display = "none";
				objSelectV.disabled  = 1;
			}
			else
			{
				objValueDIV.style.display = "";
				objSelectV.disabled  = 0;
			}
		}
		if(objField.value == "")
			objField[0].selected = 1;
		//enable all elements in the next row
		enableRowElements(n+1);
	}
	else
	{
		objConjunction[objConjunction.length-2].selected = 1;
		objOperator[objOperator.length-1].selected = 1;
		objField[objField.length-1].selected = 1;
		objValueDIV.style.display = "";
		objValue.value= "";
		objSelectV.disabled  = 1;
		disableElements(n+1);
	}
}

//set up field
function onSelectField(n)
{
	var objForm = document.forms[afmInputsFormName];
	var strField = objForm.elements['field'+n].value;
	var objValue = objForm.elements['values'+n];
	onSelectOperator(n);
	//since a field is selected, the value input should be reset up.
	objValue.value = "";
	////////////////////////////////////////////////////////////
	//check if selected field is multiple value or regular
	checkAndSetupSelectedFieldValueInput(objForm,n);
}
//disable
function disableElements(n)
{
	var objForm = document.forms[afmInputsFormName];
	if(n > 1 && objForm.elements['selectV'+(n-1)] != null)
	{
		objForm.elements['selectV'+(n-1)].disabled = 1;
	}

	for(var i = n; i <= iTotalRowsForFilter; i++)
	{
		if(objForm.elements['field'+i] != null)
		{
			objForm.elements['field'+i].disabled = 1;
			objForm.elements['field'+i][objForm.elements['field'+i].length-1].selected = 1;
		}
		if(objForm.elements['operator'+i]!=null)
		{
			objForm.elements['operator'+i].disabled = 1;
			objForm.elements['operator'+i][objForm.elements['operator'+i].length-1].selected = 1;

		}
		if(objForm.elements['values'+i]!=null)
		{
			objForm.elements['values'+i].disabled = 1;
			objForm.elements['values'+i].value = '';
		}
		if(objForm.elements['conjunction'+i] != null)
		{
			objForm.elements['conjunction'+i].disabled = 1;
			objForm.elements['conjunction'+i][objForm.elements['conjunction'+i].length-1].selected = 1;
		}
		if(objForm.elements['selectV'+i] != null)
		{
			objForm.elements['selectV'+i].disabled = 1;
		}
	}

}
//enable
function enableRowElements(n)
{
	var objForm = document.forms[afmInputsFormName];
	if(objForm.elements['field'+n] != null)
		objForm.elements['field'+n].disabled = 0;
	if(objForm.elements['operator'+n] != null)
		objForm.elements['operator'+n].disabled = 0;
	if(objForm.elements['values'+n]!= null)
		objForm.elements['values'+n].disabled = 0;
	if(objForm.elements['conjunction'+n] != null)
		objForm.elements['conjunction'+n].disabled = 0;
}

//used in common.js to send uers's data to server
function gettingRecordsData_Overridden()
{
	var objForm = document.forms[afmInputsFormName];
	var strReturned = '';
	var strValues = '';
	var arrTemp = new Array();
	var strTableDotFieldName = "";
	//doing through all rows
	for(var i = 1; i < iTotalRowsForFilter+1; i++)
	{
		var objOperator		= objForm.elements['operator'+i];
		var objConjunction	= objForm.elements['conjunction'+i]
		var objValues       = objForm.elements['values'+i];
		var objField		= objForm.elements['field'+i];
		var typeUpperCase  = "";
		var formatUpperCase  = "";
		if(objField != null && objField.value != null && objField.value != "")
		{
			typeUpperCase = arrFieldsInformation[objField.value]["type"];
			typeUpperCase = typeUpperCase.toUpperCase();
			formatUpperCase = arrFieldsInformation[objField.value]["format"];
			formatUpperCase = formatUpperCase.toUpperCase();
		}
		if(objOperator != null)
		{
			if(!objOperator.disabled)
			{
				strValues = objValues.value;
			}
			else
			{
				strValues = "";
			}
		}
		if(strValues != "")
		{
			//removing money sign and grouping separator and changing date into ISO format
			strValues = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValues);
			//trim strValues
			strValues = strValues.replace(/^\s+/,'').replace(/\s+$/,'');
			strValues = convert2validXMLValue(strValues);
			//generating clause xml element for restriction
			strReturned = strReturned + "<clause "
			if(objConjunction != null && !objConjunction.disabled && objConjunction.value != "")
				strReturned = strReturned + ' relop="'+objConjunction.value+'" ';

			if(objOperator != null && !objOperator.disabled && objOperator.value != "")
			{
				strReturned = strReturned + 'op="'+objOperator.value+'" ';
				if(objOperator.value == "LIKE" || objOperator.value == "NOT LIKE")
					strValues = strValues + "%";
			}
			strReturned = strReturned + ' value="'+strValues+'" ';
			strReturned = strReturned + ' >';
			if(objField != null && !objField.disabled && objField.value != "")
			{
				strTableDotFieldName = objField.value;
				arrTemp = strTableDotFieldName.split(".");
				strReturned = strReturned + '<field name="'+arrTemp[1]+'" table="'+ arrTemp[0] +'" />';
			}

			strReturned = strReturned + "</clause>"
		}
	}
	//even strReturned is empty, <restrictions></restrictions> is necessary to be passed to server
	strReturned = '<userInputRecordsFlag><restrictions><restriction type="parsed">' + strReturned + '</restriction></restrictions></userInputRecordsFlag>';
	return strReturned;
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
function onSelectV(strSerialized, strField, strBlank)
{
	var strXMLData = "";
	var objForm  = document.forms[afmInputsFormName];
//	var strField = objForm.elements['field'+iCounter].value;
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
/*
			setSerializedInsertingDataVariables(strSerialized);
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
			strData = strData +gettingRecordsDataFromForm(objForm);
			strData = '<userInputRecordsFlag>'+strData+'</userInputRecordsFlag>';
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
			OpenSelectVWindow(strXMLValue);
*/

			setSerializedInsertingDataVariables(strSerialized);
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];
			strData = '<fields><field ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/>'+'</fields>';
			var bl_id = objForm.elements["rm.bl_id"].value;
			bl_id = convert2validXMLValue(bl_id);
			var fl_id = objForm.elements["rm.fl_id"].value;
			fl_id = convert2validXMLValue(fl_id);
			var rm_id = objForm.elements["rm.rm_id"].value;
			rm_id = convert2validXMLValue(rm_id);

			strData = strData +'<record rm.bl_id="'+bl_id+'" rm.fl_id="'+fl_id+'" rm.rm_id="'+rm_id+'"/>';
			strData = '<userInputRecordsFlag>'+strData+'</userInputRecordsFlag>';
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
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

function checkAndSetupSelectedFieldValueInput(objForm,n)
{
	var strField				= objForm.elements['field'+n].value;
	var objEnumValueInput		= objForm.elements['enumValues'+n];
	var objRegularValueInput	= objForm.elements['values'+n];
	var objSelectV				= objForm.elements['selectV'+n];
	var strTempValue			= objRegularValueInput.value;
	var iCounter	= 0;
	var temp_array	= null;
	//using "tableName.fieldName" as index to get its enum list array
	//arrEnumFieldsAndLists[strField]
	temp_array		= arrEnumFieldsAndLists[strField];
	if(temp_array != null)
	{
		//enum
		if(objEnumValueInput != null && objEnumValueInput.length>0)
		{
			//set previous items to null
			for(var i=0;i<objEnumValueInput.length;i++)
			{
				objEnumValueInput[i] = null;
			}
		}
		//using enum storedValue as index to loop throug array
		//and get related displayValue
		for(var strStored in temp_array)
		{
			var strDisplay = temp_array[strStored];
			//new Option(display,value)
			var newObjItem = new Option(strDisplay,strStored);
			if(strStored == strTempValue)
				newObjItem.selected = 1;
			//adding to select list
			objEnumValueInput[iCounter++] = newObjItem;
		}
		//set visiblity
		objEnumValueInput.style.display		=	"";//visible => true
		objRegularValueInput.style.display	=	"none";//visible => false
		objSelectV.style.display			=	"none";//visible => false
		setupSelectedEunmValue(n);
	}
	else
	{
		//regular
		//set visiblity
		objEnumValueInput.style.display		=	"none";
		objRegularValueInput.style.display	=	"";
		objSelectV.style.display			=	"";
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
//			if(!validationDataMaxSize(objValue, maxsize, type, format,decimal))
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
function validationAndConvertionDateAndTime(n, bPagedLoaded)
{
	var objForm = document.forms[afmInputsFormName];
	var strField = objForm.elements['field'+n].value;
	var objValue = objForm.elements['values'+n];
	if(strField != "" && objValue.value != "")
	{
		var type  = arrFieldsInformation[strField]["type"];
		var typeUpperCase = type.toUpperCase();
		var bRequired  = arrFieldsInformation[strField]["required"];
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
			validationAndConvertionDateInput(objValue, strField, dateArrayObj,bRequired, false, true);
		}
		else if(typeUpperCase == "JAVA.SQL.TIME")
		{
			//since initially sever sends time in the format "HH:MM"
			var TimeArrayObj = new Array();
			if(bPagedLoaded && field_value != null && field_value != "")
				TimeArrayObj = field_value.split(":");
			else
				TimeArrayObj = null;
			validationAndConvertionTimeInput(objValue, strField, TimeArrayObj,bRequired, false, true);
		}
	}
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
//getting input data from the edit form
function gettingRecordsDataFromForm(objForm)
{
	var objField = null;
	var objValue = null;
	var strRecords  = "";
	var strFieldName = "";
	var strValue = "";
	for(var i = 1; i <= iTotalRowsForFilter; i++)
	{
		objField	= objForm.elements['field'+i];
		if(objField != null && objField.value != '')
		{
			strFieldName = objField.value;
			objValue = objForm.elements['values'+i];
			strValue = objValue.value;
			strValue = trim(strValue);
			if(strValue != "")
			{
				strValue = convert2validXMLValue(strValue);
				strRecords = strRecords + ' ' + strFieldName + '="' + strValue + '" ';
			}


		}
	}
	if(strRecords!="")
	strRecords = "<record "+strRecords + "/>";
	return strRecords;
}


function restoreSavedValues()
{
	//var objForm = document.forms[afmInputsFormName];

	//if(objForm != null)
	//{
	//	objForm.elements["eq.eq_id"].value         = getStoredCookie("ab_eq_locate_filter_eq_id_cookie");
	//	objForm.elements["eq.eq_std"].value        = getStoredCookie("ab_eq_locate_filter_eq_std_cookie");
	//	objForm.elements["eq.em_id"].value         = getStoredCookie("ab_eq_locate_filter_em_id_cookie");
	//	objForm.elements["rm.bl_id"].value         = getStoredCookie("ab_eq_locate_filter_bl_id_cookie");
	//	objForm.elements["rm.fl_id"].value         = getStoredCookie("ab_eq_locate_filter_fl_id_cookie");
	//	objForm.elements["rm.rm_id"].value         = getStoredCookie("ab_eq_locate_filter_rm_id_cookie");
	//	objForm.elements["eq.tc_area_level"].value = getStoredCookie("ab_eq_locate_filter_tc_area_level_cookie");
	//	objForm.elements["eq.tc_service"].value    = getStoredCookie("ab_eq_locate_filter_tc_service_cookie");
	//}

	var objForm = document.forms[afmInputsFormName];
	//////////////saving info into main toolbar's javascript array
	//main toolbar frame window.top.frames[0]
	var objMainToolbarFrame = window.top;
	if(objMainToolbarFrame!=null)
	{
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;
		if(objMainToolbarFrame.arrReferredByAnotherFrame1!=null)
		{
			var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1["AB_TELECOM_ASSETS_CONSOLE"];
			if(tempArray!=null)
			{
				objForm.elements["eq.eq_id"].value=tempArray["eq.eq_id"];
				objForm.elements["eq.eq_std"].value=tempArray["eq.eq_std"];
				objForm.elements["eq.em_id"].value=tempArray["eq.em_id"];
				objForm.elements["rm.bl_id"].value=tempArray["rm.bl_id"];
				objForm.elements["rm.fl_id"].value=tempArray["rm.fl_id"];
				objForm.elements["rm.rm_id"].value=tempArray["rm.rm_id"];
				objForm.elements["eq.tc_area_level"].value=tempArray["eq.tc_area_level"];
				objForm.elements["eq.tc_service"].value=tempArray["eq.tc_service"];
			}
		}
	}
	onInitialLoad();
}


//used in common.js to send uers's data to server
function gettingRecordsData()
{
	/*
	 (1) validate inputs
	 (2) how to get year, month, day (locale format?)
	 (3) calculate date_end and time_end
	 (4) sybase SQL API?
	 */
	var objForm = document.forms[afmInputsFormName];


	var bl_id, fl_id, rm_id;
	var eq_id, eq_std, em_id;
	var tc_area_level, tc_service;


	bl_id = objForm.elements["rm.bl_id"].value;
	bl_id = convert2validXMLValue(bl_id);
	fl_id = objForm.elements["rm.fl_id"].value;
	fl_id = convert2validXMLValue(fl_id);
	rm_id = objForm.elements["rm.rm_id"].value;
	rm_id = convert2validXMLValue(rm_id);
	eq_id = objForm.elements["eq.eq_id"].value;
	eq_id = convert2validXMLValue(eq_id);
	eq_std = objForm.elements["eq.eq_std"].value;
	eq_std = convert2validXMLValue(eq_std);
	em_id = objForm.elements["eq.em_id"].value;
	em_id = convert2validXMLValue(em_id);
	tc_area_level = objForm.elements["eq.tc_area_level"].value;
	tc_area_level = convert2validXMLValue(tc_area_level);
	tc_service = objForm.elements["eq.tc_service"].value;
	tc_service = convert2validXMLValue(tc_service);

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
			
			newTempArray["eq.eq_id"] = eq_id;
			newTempArray["eq.eq_std"] = eq_std;

			newTempArray["eq.em_id"] = em_id;
			newTempArray["rm.bl_id"] = bl_id;
			
			newTempArray["rm.fl_id"] = fl_id;
			newTempArray["rm.rm_id"] = rm_id;
			newTempArray["eq.tc_area_level"] = tc_area_level;
			newTempArray["eq.tc_service"] = tc_service;

			//assigned newTempArray to tempArray by name
			tempArray["AB_TELECOM_ASSETS_CONSOLE"] = newTempArray;
		}
	}

	//saveToCookie("ab_eq_locate_filter_eq_id_cookies", eq_id);
	//saveToCookie("ab_eq_locate_filter_eq_std_cookies", eq_std);
	//saveToCookie("ab_eq_locate_filter_em_id_cookies", em_id);
	//saveToCookie("ab_eq_locate_filter_bl_id_cookies", bl_id);
	//saveToCookie("ab_eq_locate_filter_fl_id_cookies", fl_id);
	//saveToCookie("ab_eq_locate_filter_rm_id_cookies", rm_id);
	//saveToCookie("ab_eq_locate_filter_tc_area_level_cookies", tc_area_level);
	//saveToCookie("ab_eq_locate_filter_tc_service_cookies", tc_service);

	// If using Oracle or Sybase, || can be used to concatenate strings
	// If using MSSQL Server, + needs to be used
	// #Concat%% is replaced with the correct concatenation string based on server type
//	var strJoin = "||";
//	var strJoin = "+";
	var strJoin = "#Concat%%";

	var strSQLRestriction = "";
	if(eq_id != "")
	{
		strSQLRestriction = strSQLRestriction + 'bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id IN (SELECT bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id FROM eq WHERE eq_id=\''+eq_id+'\')';
	}
	if(eq_std != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id IN (SELECT bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id FROM eq WHERE eq_std=\''+eq_std+'\')';
	}
	if(em_id != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id IN (SELECT bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id FROM eq WHERE em_id=${sql.literal(\''+em_id+'\')})';
	}
	if(bl_id != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'bl_id=\''+bl_id+'\'';
	}
	if(fl_id != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'fl_id=\''+fl_id+'\'';
	}
	if(rm_id != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'rm_id=\''+rm_id+'\'';
	}
	if(tc_area_level != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id IN (SELECT bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id FROM eq WHERE tc_area_level=\''+tc_area_level+'\')';
	}
	if(tc_service != "")
	{
		if(strSQLRestriction != "") strSQLRestriction = strSQLRestriction + ' AND ';
		strSQLRestriction = strSQLRestriction + 'bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id IN (SELECT bl_id'+strJoin+'\'-\''+strJoin+'fl_id'+strJoin+'\'-\''+strJoin+'rm_id FROM eq WHERE tc_service=\''+tc_service+'\')';
	}
	if(strSQLRestriction != "")
		strSQLRestriction = '<restriction type="sql" sql="' + strSQLRestriction + '"><title translatable="true"/></restriction>';
	else
		strSQLRestriction = '<restriction type="parsed"><title translatable="true"/></restriction>';

	saveToCookie("ab_eq_locate_filter_restriction_cookies", strSQLRestriction);

	//restrictions
	strSQLRestriction = '<restrictions><userInputRecordsFlag>' + strSQLRestriction + '</userInputRecordsFlag></restrictions>';
	return strSQLRestriction;
}


function saveToCookie(varName, varValue)
{
  var today = new Date()  ;
  var expires = new Date() ;

  //one day
  expires.setTime(today.getTime() + 1000*60*60*24*1);

  if(varValue!=null)
    setCookie(varName, varValue, expires);
  else
    setCookie(varName, "", expires);
}


function getStoredCookie(varName)
{
  var cookie = getCookie(varName);

  if(varName!=null && cookie != null)
  {
    return cookie;
  }

  return "";
}
