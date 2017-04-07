/*********************************************************************
 JavaScript File: ab-visitor-authorize-editform.js

 Author: Yong Shao
 Date:	 05/26/2005

*********************************************************************/
//called when the edit form is submitted
function ValidatingForm(formName, strSerialized, strTarget, bData)
{
	var bReturned		= true;
	var strXMLDate		= "";
	var objForm	= document.forms[formName];

	if(bData && objForm != null)
	{
		//setSerializedInsertingDataVariables() in common.js
		if(strSerialized!="")
			setSerializedInsertingDataVariables(strSerialized);
		for(var inputFieldName in arrFieldsInformation)
		{
			var element_type = objForm.elements[inputFieldName].type;
			element_type = element_type.toUpperCase();
			var fieldValue = objForm.elements[inputFieldName].value;
			var fieldName = objForm.elements[inputFieldName].name;
			bReturned = validationInputs(formName, fieldName, true);
			if(!bReturned)
			{
				//show warning message to ask users for empty
				//required fields
				showWarningMessage(formName, fieldName);
				return bReturned;
			}
			else
			{
				var typeUpperCase = arrFieldsInformation[fieldName]["type"];
				typeUpperCase = typeUpperCase.toUpperCase();

				// time values are stored in 24H form in hidden field
				if(typeUpperCase == "JAVA.SQL.TIME")
					fieldValue = objForm.elements["Stored" + inputFieldName].value;

				var formatUpperCase = arrFieldsInformation[fieldName]["format"];
				formatUpperCase = formatUpperCase.toUpperCase();
				//removing money sign and grouping separator and changing date into ISO format
				fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);
				//trim fieldValue
				fieldValue = trim(fieldValue);
				//changing some special characters into valid
				//characters in xml,
				if(typeUpperCase != "JAVA.SQL.TIME")
					fieldValue = convert2validXMLValue(fieldValue);
				//record data
				strXMLDate = strXMLDate + ' '+fieldName+'="'+fieldValue+'" ';
			}
		}
	}
	{
		//checking dates
		//visitors.date_end, visitors.date_start
		var visitors_date_end_obj = objForm.elements['visitors.date_end'];
		var visitors_date_start_obj = objForm.elements['visitors.date_start'];
		if(visitors_date_end_obj!=null && visitors_date_start_obj!=null)
		{
			var visitors_date_end = visitors_date_end_obj.value;
			var visitors_date_start = visitors_date_start_obj.value;
			visitors_date_start = getDateWithISOFormat(visitors_date_start);
			visitors_date_end = getDateWithISOFormat(visitors_date_end);
			if(visitors_date_start > visitors_date_end)
			{
				var ab_visitor_authorize_editformwarning_message = "";
				var ab_visitor_authorize_editformwarning_message_obj = document.getElementById("message_ab_visitor_authorize_editformwarning_message");
				if(ab_visitor_authorize_editformwarning_message_obj!=null)
					ab_visitor_authorize_editformwarning_message = ab_visitor_authorize_editformwarning_message_obj.innerHTML;
				
				alert(ab_visitor_authorize_editformwarning_message);
				visitors_date_end_obj.focus();
				bReturned = false;
			}

		}

	}

	if(bReturned)
	{
		if(strXMLDate != "")
		{
			strXMLDate = gettingRecordsData(objForm);
			strXMLDate = strSerializedInsertingDataFirstPart + strXMLDate + strSerializedInsertingDataRestPart;
		}
		else
			strXMLDate = strSerialized;
		//sending data to server
		//sending data to server through a hidden form
		if(strSerialized != "")
			sendingDataFromHiddenForm('',strXMLDate, strTarget, '',false,"");
	}
	return bReturned;
}
