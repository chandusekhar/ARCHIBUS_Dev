/*********************************************************************
 JavaScript File: edit-forms.js

 Author: Nate Crosswhite
 Date:	 7/18/2005

 Functionalities: Open select value window with a custom restriction

 *********************************************************************/

// function onSelectVRestrict
//   strSerialized: Serialized select value action
//   strField: Field name to select a value for
//   formName: Name of the edit form recieving a value
//   getRestriction: Optional call back function that returns an XML restriction
//     statement to add to the select value action.  getRestriction(strField, formName)
//   strRestriction: Optional XML restriction statement to add to the select value action
//
function onSelectVRestrict(strSerialized, strField, formName, getRestriction, strRestriction)
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
			strData += '<userInputRecordsFlag>';
			strData += gettingRecordsData(objForm);

			if (typeof getRestriction == "function")
			{
				strData += getRestriction(strField, formName);
			}
			if (typeof strRestriction == "string")
			{
				strData += strRestriction;
			}

			strData += '</userInputRecordsFlag>';

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
