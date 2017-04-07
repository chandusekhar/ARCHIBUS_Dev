/*********************************************************************
 JavaScript File: ab-console-helper.js

 Description: customized version of edit-forms.js for move console
              restrictions

 *********************************************************************/

///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";

var warning_message = "";

//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;

window.onload=onLoadPage;
function onLoadPage()
{
	//set up warning_message
	var warning_message_object = document.getElementById("general_warning_message_empty_required_fields");
	if(warning_message_object!=null)
		warning_message = warning_message_object.innerHTML;

	var objForm = document.forms[afmInputsFormName];

	//initializing each form
	for(var inputFieldName in arrConsoleFieldInfo)
	{
		if (!objForm.elements[inputFieldName])
			continue;

		var fieldValue = objForm.elements[inputFieldName].value;
		var fieldName = objForm.elements[inputFieldName].name;
		validationInputs(afmInputsFormName, fieldName, false);

		var typeUpperCase = arrFieldsInformation[fieldName]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var sRequired = arrFieldsInformation[fieldName]["required"];
		if(typeUpperCase == "JAVA.SQL.DATE")
		{
			//since initially sever sends date in ISO format
			//"YYY-MM-DD"
			var field_value = objForm.elements[inputFieldName].value;
			var dateArrayObj = new Array();
			if(field_value != null && field_value != "")
			{
				//since edit-form may come from history.back()
				//isBeingISODateFormat() in date-time.js
				if(isBeingISODateFormat(field_value))
				{
					dateArrayObj = field_value.split("-");
				}
				else
				{
					//gettingYearMonthDayFromDate() in date-time.js
					var temp_date_array = gettingYearMonthDayFromDate(field_value);
					dateArrayObj[0] = temp_date_array["year"];
					dateArrayObj[1] = temp_date_array["month"];
					dateArrayObj[2] = temp_date_array["day"];
				}
				validationAndConvertionDateInput(objForm.elements[inputFieldName], fieldName, dateArrayObj, sRequired, true, true);
			}
			else
			{
				validationAndConvertionDateInput(objForm.elements[inputFieldName], fieldName, null, "false", true, false);
			}
		}
		else if(typeUpperCase == "JAVA.SQL.TIME")
		{
			//since initially sever sends time in the format
			//"HH:MM"
			var field_value = objForm.elements[inputFieldName].value;
			var TimeArrayObj = new Array();
			if(field_value != null && field_value != "")
				TimeArrayObj = field_value.split(":");
			else
				TimeArrayObj = null;
			validationAndConvertionTimeInput(objForm.elements[inputFieldName], fieldName, TimeArrayObj, "false", true, true);
		}
	}
}

//called when the edit form is submitted
function ValidateAndSubmitForm(strSerialized, strTarget, subFrameName)
{
	var bReturned		= true;
	var strXMLDate		= "";
	var objForm	= document.forms[afmInputsFormName];

	//setSerializedInsertingDataVariables() in common.js
	if(strSerialized!="")
		setSerializedInsertingDataVariables(strSerialized);
	for(var inputFieldName in arrConsoleFieldInfo)
	{
		var element_type = objForm.elements[inputFieldName].type;
		element_type = element_type.toUpperCase();
		var fieldValue = objForm.elements[inputFieldName].value;
		var fieldName = objForm.elements[inputFieldName].name;
		bReturned = validationInputs(afmInputsFormName, fieldName, true);
		if(!bReturned)
		{
			//show warning message to ask users for empty
			//required fields
			showWarningMessage(afmInputsFormName, fieldName);
			return false;
		}
	}

	sendingDataFromHiddenForm("", strSerialized, strTarget, subFrameName, true, "");
}

////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)Delete_CurrentRecord
function validationInputs(formName, fieldName, bCheckRequiredFields)
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
		
		// Required comes from console field list
		var required = arrConsoleFieldInfo[fieldName]["required"];
		
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
			if(bCheckRequiredFields && (!validationRequiredField(objValue, required)))
				bReturned = false;
		}
	}
	return bReturned;
}

function showWarningMessage(formName, fieldName)
{
	var objForm = document.forms[formName];
	var objValue = objForm.elements[fieldName];

	// Required comes from console field list
	var required = arrConsoleFieldInfo[fieldName]["required"];

	if(!validationRequiredField(objValue, required))
		alert(warning_message);
}


//and called in view-definition-form-content-table-filter.xsl
function onSelectV(strSerialized, strField, formName)
{
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	if(selectedFieldObj != null)
	{
		//setSerializedInsertingDataVariables() in common.js
		setSerializedInsertingDataVariables(strSerialized);
		
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
			strData += 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			strData += '<userInputRecordsFlag>';
			strData += gettingRecordsElement(objForm);
			
			// Test if a custom select value restriction is defined
			if (typeof getCustomSelectVRestriction == "function")
				strData += getCustomSelectVRestriction(formName, strField);
			
			strData += '</userInputRecordsFlag>';
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

function formatAndConvertField(objForm,fieldName,fieldValue)
{
	var typeUpperCase = arrFieldsInformation[fieldName]["type"];
	typeUpperCase = typeUpperCase.toUpperCase();
	var formatUpperCase = arrFieldsInformation[fieldName]["format"];
	formatUpperCase = formatUpperCase.toUpperCase();
	//removing money sign and grouping separator and changing date into ISO format
	fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);
	//trim fieldValue: trim() is defined in common.js
	fieldValue = trim(fieldValue);
	if(formatUpperCase!="MEMO")
	{
		if(typeUpperCase != "JAVA.SQL.TIME")
		{
			fieldValue = convert2validXMLValue(fieldValue);
		}
		else
		{
			//transform time to 24-hour format(HH:MM)
			//getTimeWith24Format() is defined in date-time.js
			// fieldValue = getTimeWith24Format(fieldValue);
			// 24h time is generated on user input and stored in a hidden field
			fieldValue = objForm.elements["Stored"+fieldName].value;
		}
	}
	else
	{
		//memo fields
		fieldValue = convertMemo2validateXMLValue(fieldValue);
	}
	return fieldValue;
}

//getting input data from the edit form
function gettingRecordsElement(objForm)
{
	var strReturned = '<record ';

	for(var inputFieldName in arrFieldsInformation)
	{
		if (!objForm.elements[inputFieldName])
			continue;
			
		var fieldName = inputFieldName;
		var fieldValue = objForm.elements[inputFieldName].value;

		fieldValue = formatAndConvertField(objForm,fieldName,fieldValue);
		
		strReturned += ' '+fieldName+'="'+fieldValue+'" ';
	}
	
	strReturned += '/>';
	
	return strReturned;
}


// Get Restriction based on form values
function gettingRecordsData()
{
	var strReturned = "";

	// Called from sendingDataFromHiddenForm() in common.js	
	objForm = document.forms[afmInputsFormName];
	for(var inputFieldName in arrFieldsInformation)
	{
		if (!objForm.elements[inputFieldName])
			continue;
			
		var fieldName = inputFieldName;
		var fieldValue = objForm.elements[inputFieldName].value;
		var fieldType = arrFieldsInformation[inputFieldName]['type'];

		// Empty fields don't become part of our restriction
		fieldValue = trim(fieldValue);
		if (fieldValue == "") continue;
		
		fieldValue = formatAndConvertField(objForm,fieldName,fieldValue);

		var arrTemp = new Array();
		arrTemp = fieldName.split(".");
		
		// Set default op
		var strOp = arrConsoleFieldInfo[fieldName]['op'];
		if (strOp.length == 0)
		{
			if (fieldType == "java.lang.String")
				strOp = 'LIKE';
			else
				strOp = '=';
		}
		
		// Set defalt relational op
		var strRelop = arrConsoleFieldInfo[fieldName]['relop'];
		if (strRelop.length == 0) strRelop = "AND";

		// Construct clause
		strReturned += '<clause relop="' + strRelop + '" ';
		strReturned += ' op="' + strOp + '" ';
		
		if (strOp == 'LIKE')
		{
			strReturned += ' value="' + fieldValue + '%">';
		}
		else
		{
			strReturned += ' value="' + fieldValue + '">';
		}

		strReturned += '<field name="' + arrTemp[1] + '" table="' + arrTemp[0] + '" />';
		strReturned += '</clause>'
	}
	
	// Surround any clauses with a parsed restriction element
	if (strReturned != "")
		strReturned = '<restriction type="parsed">' + strReturned + '</restriction>';

	// the arrPermanentRestrictions variable is defined in XSL
	for (var arrSql in arrPermanentRestrictions)
	{
		strReturned += '<restriction type="sql" sql="' + arrPermanentRestrictions[arrSql]['sql'] + '">';
		var strTable = arrPermanentRestrictions[arrSql]['table'];
		if (strTable.length > 0)
			strReturned += '<field table="' + strTable + '" />';
		strReturned += '<title translatable="false">Permanent</title>';
		strReturned += '</restriction>';
	}

	// Custom restriction consoles can define a callback function getCustomRestriction to add to the restriction
	if (typeof getCustomRestriction == "function")
		strReturned += getCustomRestriction();

	// Add restrictions and userInputRecordsFlag elements
	strReturned = '<userInputRecordsFlag><restrictions>' + strReturned + '</restrictions></userInputRecordsFlag>';

	return strReturned; 
}
