/*********************************************************************
 JavaScript File:ab-em-setup-or-move-edit.js

 *********************************************************************/
///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";
//bShowExtraFields is used by select value form
var bShowExtraFields = false;
//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;
var str_to_bl_id = "";
var str_to_fl_id = "";
var str_mo_id = "";

//when page is loaded to initialize
function onLoadPage(form_name)
{
	var objForm = document.forms[form_name];
	var validatedDateFieldsArray = new Array("mo.date_requested", "mo.date_to_perform", "mo.date_issued");
	for(var i=0; i < validatedDateFieldsArray.length; i++)
	{
		var dateFieldName = validatedDateFieldsArray[i];

		if(objForm.elements[dateFieldName]!=null)
		{
			var dateField_value = objForm.elements[dateFieldName].value;
			var dateArrayObj = new Array();
			//if(dateField_value != null && dateField_value != "")
			{
				if(isBeingISODateFormat(dateField_value))
				{
					dateArrayObj = dateField_value.split("-");
				}
				else
				{
					//gettingYearMonthDayFromDate() in date-time.js
					var temp_date_array = gettingYearMonthDayFromDate(dateField_value);
					dateArrayObj[0] = temp_date_array["year"];
					dateArrayObj[1] = temp_date_array["month"];
					dateArrayObj[2] = temp_date_array["day"];
				}

				validationAndConvertionDateInput(objForm.elements[dateFieldName], dateFieldName, dateArrayObj, false, true, true);
			}
		}
	}
	var validatedTimeFieldsArray = new Array("mo.time_requested", "mo.time_to_perform", "mo.time_issued");
	for(var i=0; i < validatedTimeFieldsArray.length; i++)
	{
		var timeFieldName = validatedTimeFieldsArray[i];
		if(objForm.elements[timeFieldName]!=null)
		{
			var timeField_value = objForm.elements[timeFieldName].value;
			var TimeArrayObj = new Array();
			if(timeField_value != null && timeField_value != "")
			{
				TimeArrayObj = timeField_value.split(":");
			}
			validationAndConvertionTimeInput(objForm.elements[timeFieldName], timeFieldName, TimeArrayObj, false, true, true);
		}
	}

	if(objForm.elements["mo.to_fl_id"]!=null && objForm.elements["mo.to_fl_id"].type!="hidden")
	{
		objForm.elements["mo.to_fl_id"].focus();
		objForm.elements["mo.to_fl_id"].blur();
	}
	if(objForm.elements["mo.mo_id"]!=null)
	{
		str_mo_id = objForm.elements["mo.mo_id"].value;
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
			strData = strData + '<userInputRecordsFlag>' + gettingRecordsData(objForm) + '</userInputRecordsFlag>';
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

//enable or disable Copy to button if Send Email is checked
function EnableCopyTo(form_name)
{
	 var objForm = document.forms[form_name];
	 var obj_CopyTo = objForm.elements["copyEmailAddress"];
	 var bSendEmail;

	 bSendEmail = objForm.elements["bSendEmail"].checked;

	 if(bSendEmail){
		 obj_CopyTo.disabled = 0;
	 }else{
		 obj_CopyTo.disabled = 1;
	 }

}

//list vacant rooms only
function showOnlyVacantRooms(form_name,bl_id_input_field_name, fl_id_input_field_name )
{
	//Guo changed 2009-05-18 to solve KB3021459
	var obj_bl_id_field = document.forms[form_name].elements[bl_id_input_field_name];
	var obj_fl_id_field = document.forms[form_name].elements[fl_id_input_field_name];
	str_to_bl_id = obj_bl_id_field.value;
	str_to_fl_id = obj_fl_id_field.value;
	if(str_to_bl_id != "" && str_to_fl_id != "")
	{
		window.drawingRestriction = new Object();
		window.drawingRestriction.blId = str_to_bl_id;
		window.drawingRestriction.flId = str_to_fl_id;
		var rmFieldElement = $('mo.to_rm_id');
		if(!rmFieldElement){
			rmFieldElement = document.getElementsByName('mo.to_rm_id')[0];
		}
		window.drawingRestriction.rmId = rmFieldElement.value;

		var selectValueWindowName		= "selectValueWindow";
		var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=500,height=450";
		var selectValueWindow			= window.open("", selectValueWindowName,selectValueWindowSettings);
		selectValueWindow.location.href = "ab-em-setup-or-move-dwg-vacant-rooms.axvw";
	}
	else
	{
		//focus on bl_id or fl_id field
		if(str_to_bl_id == "")
			obj_bl_id_field.focus();
		else
			obj_fl_id_field.focus();
	}
}

//convert2validXMLValue() in common.js
//create new mo
function onCreateMoveRequest(form_name, strSerialized, strSerializedAfmActionRender, warning_message)
{
	var objForm = document.forms[form_name];
	var em_id, requestor, mp_id, description;
	var from_bl_id, from_fl_id, from_rm_id;
	var to_bl_id, to_fl_id, to_rm_id;
	var date_to_perform, time_to_perform;
	var date_requested = getCurrentDateInISOFormat();
	var time_requested = getCurrentTimeIn24HourFormat();
	var date_issued = getCurrentDateInISOFormat();
	var time_issued = getCurrentTimeIn24HourFormat();
	var bIssued, bSendEmail;

	//check if three required fields are entered?
	to_bl_id = objForm.elements["mo.to_bl_id"].value;
	to_bl_id = convert2validXMLValue(to_bl_id);
	to_fl_id = objForm.elements["mo.to_fl_id"].value;
	to_fl_id = convert2validXMLValue(to_fl_id);
	to_rm_id = objForm.elements["mo.to_rm_id"].value;
	to_rm_id = convert2validXMLValue(to_rm_id);
	if(to_bl_id == "" || to_fl_id == "" || to_rm_id == "")
	{
		//warning
		alert(warning_message);
		//mouse focus
		if(to_bl_id == "")
			objForm.elements["mo.to_bl_id"].focus();
		else if(to_fl_id == "")
			objForm.elements["mo.to_fl_id"].focus();
		else
			objForm.elements["mo.to_rm_id"].focus();
		//stop
		return;

	}
	else
	{

		//var str_SQL
		em_id = objForm.elements["mo.em_id"].value;
		em_id = convert2validXMLValue(em_id);
		requestor = objForm.elements["mo.requestor"].value;
		requestor = convert2validXMLValue(requestor);
		mp_id = objForm.elements["mo.mp_id"].value;
		mp_id = convert2validXMLValue(mp_id);
		description = objForm.elements["mo.description"].value;
		description = convertMemo2validateXMLValue(description);

		from_bl_id = objForm.elements["mo.from_bl_id"].value;
		from_bl_id = convert2validXMLValue(from_bl_id);
		from_fl_id = objForm.elements["mo.from_fl_id"].value;
		from_fl_id = convert2validXMLValue(from_fl_id);
		from_rm_id = objForm.elements["mo.from_rm_id"].value;
		from_rm_id = convert2validXMLValue(from_rm_id);

		date_to_perform = objForm.elements["mo.date_to_perform"].value;
		time_to_perform = objForm.elements["Storedmo.time_to_perform"].value;

		bIssued = objForm.elements["bIssued"].checked;
		bSendEmail = objForm.elements["bSendEmail"].checked;

		var strXMLSQLTransaction = "";
		//render file ab-em-setup-or-move-create-respone.axvw if transaction is successful
		strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-em-setup-or-move-create-respone.axvw" response="true"/>';
		//transaction
		strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="insert">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<record  mo.em_id=${sql.literal("'+em_id+'")} ';
		if(requestor!="")
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.requestor="'+requestor+'" ';
		if(mp_id!="")
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.mp_id="'+mp_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.description="'+description+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_bl_id="'+from_bl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_fl_id="'+from_fl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_rm_id="'+from_rm_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_bl_id="'+to_bl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_fl_id="'+to_fl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_rm_id="'+to_rm_id+'" ';

		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_requested="'+date_requested+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_requested="'+time_requested+'" ';

		if(bIssued)
		{
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_issued="'+date_issued+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_issued="'+time_issued+'" ';
		}
		if(date_to_perform!="")
		{
			date_to_perform = getDateWithISOFormat(date_to_perform);
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_to_perform="'+date_to_perform+'" ';
		}
		if(time_to_perform!="")
		{
			//var temp_array = new Array();
			//temp_array = gettingHourMinuteFromHHMMFormattedTime(time_to_perform);
			//time_to_perform = FormattingTime(temp_array["HH"], temp_array["MM"], "", "HH:MM");;
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_to_perform="'+time_to_perform+'" ';
		}

		strXMLSQLTransaction = strXMLSQLTransaction + '/></command></transaction>';
		//'<userInputRecordsFlag>'
		strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
		//send request to server
		sendingAfmActionRequestWithClientDataXMLString2Server('_self',strSerialized,strXMLSQLTransaction);
	}
	//check if checkbox for bIssued is selected? mo.date_issued, mo.time_issued
	//SQL command for creating a new move order?
	//check if checkbox for bSendEmail is selected?
	//using array arrReferredByAnotherFrame1 in frame treeFrame to
	//store email info

	//get treeFrame frame object: getFrameObject() in common.js
	var objTreeFrame = getFrameObject(window, "treeFrame");
	if(objTreeFrame!=null)
	{
		var arrReferredByAnotherFrame1 = objTreeFrame.arrReferredByAnotherFrame1;
		if(arrReferredByAnotherFrame1 != null)
		{
			if(bSendEmail){
				arrReferredByAnotherFrame1["toEmailAddress"] = objForm.elements["toEmailAddress"].value;
				arrReferredByAnotherFrame1["fromEmailAddress"] = objForm.elements["fromEmailAddress"].value;
				arrReferredByAnotherFrame1["copyEmailAddress"] = objForm.elements["copyEmailAddress"].value;
			}else{
				arrReferredByAnotherFrame1["toEmailAddress"] = "";
				arrReferredByAnotherFrame1["fromEmailAddress"] = "";
				arrReferredByAnotherFrame1["copyEmailAddress"] = "";
			}
		}
	}
}
//convert2validXMLValue() in common.js
//update existing mo_id
function onUpdateMoveRequest(form_name, strSerialized, strSerializedAfmActionRender, warning_message)
{
	var objForm = document.forms[form_name];
	var mo_id = objForm.elements["mo.mo_id"].value;

	var em_id, requestor, mp_id, description;
	var from_bl_id, from_fl_id, from_rm_id;
	var to_bl_id, to_fl_id, to_rm_id;
	var date_to_perform, time_to_perform;
	var date_requested = getCurrentDateInISOFormat();
	var time_requested = getCurrentTimeIn24HourFormat();
	var date_issued = getCurrentDateInISOFormat();
	var time_issued = getCurrentTimeIn24HourFormat();
	var bIssued, bSendEmail;

	//check if three required fields are entered?
	to_bl_id = objForm.elements["mo.to_bl_id"].value;
	to_bl_id = convert2validXMLValue(to_bl_id);
	to_fl_id = objForm.elements["mo.to_fl_id"].value;
	to_fl_id = convert2validXMLValue(to_fl_id);
	to_rm_id = objForm.elements["mo.to_rm_id"].value;
	to_rm_id = convert2validXMLValue(to_rm_id);
	if(to_bl_id == "" || to_fl_id == "" || to_rm_id == "")
	{
		//warning
		alert(warning_message);
		//mouse focus
		if(to_bl_id == "")
			objForm.elements["mo.to_bl_id"].focus();
		else if(to_fl_id == "")
			objForm.elements["mo.to_fl_id"].focus();
		else
			objForm.elements["mo.to_rm_id"].focus();
		//stop
		return;
	}
	else
	{
		//var str_SQL
		em_id = objForm.elements["mo.em_id"].value;
		em_id = convert2validXMLValue(em_id);
		requestor = objForm.elements["mo.requestor"].value;
		requestor = convert2validXMLValue(requestor);
		mp_id = objForm.elements["mo.mp_id"].value;
		mp_id = convert2validXMLValue(mp_id);
		description = objForm.elements["mo.description"].value;
		description = convertMemo2validateXMLValue(description);
		from_bl_id = objForm.elements["mo.from_bl_id"].value;
		from_bl_id = convert2validXMLValue(from_bl_id);
		from_fl_id = objForm.elements["mo.from_fl_id"].value;
		from_fl_id = convert2validXMLValue(from_fl_id);
		from_rm_id = objForm.elements["mo.from_rm_id"].value;
		from_rm_id = convert2validXMLValue(from_rm_id);

		date_to_perform = objForm.elements["mo.date_to_perform"].value;
		time_to_perform = objForm.elements["Storedmo.time_to_perform"].value;

		bIssued = objForm.elements["bIssued"].checked;
		bSendEmail = objForm.elements["bSendEmail"].checked;

		var strXMLSQLTransaction = "";
		//render file ab-em-setup-or-move-update-respone.axvw if
		//transaction is successful
		strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-em-setup-or-move-update-respone.axvw" response="true">';
		//<restrictions>
		strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="mo_id=\''+str_mo_id+'\'">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction: last work request created by the requestor (supplied by the action)</title>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<field table="mo"/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
		//transaction
		strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<record  mo.em_id=${sql.literal("'+em_id+'")} ';
		if(requestor!="")
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.requestor="'+requestor+'" ';
		if(mp_id!="")
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.mp_id="'+mp_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.description="'+description+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_bl_id="'+from_bl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_fl_id="'+from_fl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.from_rm_id="'+from_rm_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_bl_id="'+to_bl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_fl_id="'+to_fl_id+'" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'mo.to_rm_id="'+to_rm_id+'" ';

		//strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_requested="'+date_requested+'" ';
		//strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_requested="'+time_requested+'" ';

		if(bIssued)
		{
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_issued="'+date_issued+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_issued="'+time_issued+'" ';
		}
		if(date_to_perform!="")
		{
			date_to_perform = getDateWithISOFormat(date_to_perform);
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.date_to_perform="'+date_to_perform+'" ';
		}
		if(time_to_perform!="")
		{
			//var temp_array = new Array();
			//temp_array = gettingHourMinuteFromHHMMFormattedTime(time_to_perform);
			//time_to_perform = FormattingTime(temp_array["HH"], temp_array["MM"], "", "HH:MM");;
			strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_to_perform="'+time_to_perform+'" ';
		}

		strXMLSQLTransaction = strXMLSQLTransaction + '/>';
		//where restriction by mo.mo_id
		strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed"><clause relop="AND" op="=" value="'+mo_id+'"><field table="mo" name="mo_id"/></clause></restriction>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
		//'<userInputRecordsFlag>'
		strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';

		//send request to server
		sendingAfmActionRequestWithClientDataXMLString2Server('_self',strSerialized,strXMLSQLTransaction);

	}
	//check if checkbox for bIssued is selected? mo.date_issued, mo.time_issued
	//SQL command for creating a new move order?
	//check if checkbox for bSendEmail is selected?
	//using array arrReferredByAnotherFrame1 in frame treeFrame to
	//store email info

	//get treeFrame frame object: getFrameObject() in common.js
	var objTreeFrame = getFrameObject(window, "treeFrame");
	if(objTreeFrame!=null)
	{
		var arrReferredByAnotherFrame1 = objTreeFrame.arrReferredByAnotherFrame1;
		if(arrReferredByAnotherFrame1 != null)
		{
			if(bSendEmail){
				arrReferredByAnotherFrame1["toEmailAddress"] = objForm.elements["toEmailAddress"].value;
				arrReferredByAnotherFrame1["fromEmailAddress"] = objForm.elements["fromEmailAddress"].value;
				arrReferredByAnotherFrame1["copyEmailAddress"] = objForm.elements["copyEmailAddress"].value;
			}else{
				arrReferredByAnotherFrame1["toEmailAddress"] = "";
				arrReferredByAnotherFrame1["fromEmailAddress"] = "";
				arrReferredByAnotherFrame1["copyEmailAddress"] = "";
			}
		}
	}
}

////////////
//convert2validXMLValue() in common.js
//close mo
function onCloseMoveRequest(form_name, strSerialized, strSerializedAfmActionRender, warning_message)
{
	var objForm = document.forms[form_name];
	var em_id;
	em_id = objForm.elements["mo.em_id"].value;
	em_id = convert2validXMLValue(em_id);

	var date_completed, time_completed;
	var date_completed = getCurrentDateInISOFormat();
	var time_completed = getCurrentTimeIn24HourFormat();

	var to_bl_id, to_fl_id, to_rm_id;
	//check if three required fields are entered?
	to_bl_id = objForm.elements["mo.to_bl_id"].value;
	to_bl_id = convert2validXMLValue(to_bl_id);
	to_fl_id = objForm.elements["mo.to_fl_id"].value;
	to_fl_id = convert2validXMLValue(to_fl_id);
	to_rm_id = objForm.elements["mo.to_rm_id"].value;
	to_rm_id = convert2validXMLValue(to_rm_id);

	//UPDATE mo SET date_completed = now, time_completed = now WHERE
	//mo_id=str_mo_id
	//UPDATE em SET bl_id = to_bl_id, fl_id = to_fl_id, rm_id=to_rm_id WHERE
	//em_id=em_id

	var strXMLSQLTransaction = "";
	//render file ab-em-setup-or-move-close-respone.axvw if
	//transaction is successful
	strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-em-setup-or-move-close-respone.axvw" response="true">';
		//<restrictions>
	strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="mo_id=\''+str_mo_id+'\'">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction: last work request created by the requestor (supplied by the action)</title>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<field table="mo"/>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
	//transaction
	strXMLSQLTransaction = strXMLSQLTransaction + '<transaction>';
	//update mo
	strXMLSQLTransaction = strXMLSQLTransaction + '<command type="update">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<record  mo.date_completed="'+date_completed+'" ';
	strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_completed="'+time_completed+'"/>';
	//where restriction by mo.mo_id
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed"><clause relop="AND" op="=" value="'+str_mo_id+'"><field table="mo" name="mo_id"/></clause></restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</command>';
	//update em
	strXMLSQLTransaction = strXMLSQLTransaction + '<command type="update">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<record  em.bl_id="'+to_bl_id+'" ';
	strXMLSQLTransaction = strXMLSQLTransaction + 'em.fl_id="'+to_fl_id+'" '
	strXMLSQLTransaction = strXMLSQLTransaction + 'em.rm_id="'+to_rm_id+'"/>'
	//where restriction by em_id
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed"><clause relop="AND" op="=" value="'+em_id+'"><field table="em" name="em_id"/></clause></restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</command>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</transaction>';
	//'<userInputRecordsFlag>'
	strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self',strSerialized,strXMLSQLTransaction);

}
////////////
//convert2validXMLValue() in common.js
//cancel mo
function onCancelMoveRequest(form_name, strSerialized, strSerializedAfmActionRender, warning_message)
{
	var objForm = document.forms[form_name];

	var date_completed, time_completed;
	var date_completed = getCurrentDateInISOFormat();
	var time_completed = getCurrentTimeIn24HourFormat();

	//UPDATE mo SET move_cancelled = 1,date_completed = now, time_completed = now WHERE
	//mo_id=str_mo_id
	var strXMLSQLTransaction = "";
	//render file ab-em-setup-or-move-cancel-respone.axvw if
	//transaction is successful
	strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-em-setup-or-move-cancel-respone.axvw" response="true">';
	//<restrictions>
	strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="mo_id=\''+str_mo_id+'\'">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction: last work request created by the requestor (supplied by the action)</title>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<field table="mo"/>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
	//transaction
	strXMLSQLTransaction = strXMLSQLTransaction + '<transaction>';
	//update mo
	strXMLSQLTransaction = strXMLSQLTransaction + '<command type="update">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<record  mo.date_completed="'+date_completed+'" ';
	strXMLSQLTransaction = strXMLSQLTransaction + 'mo.time_completed="'+time_completed+'" ';
	strXMLSQLTransaction = strXMLSQLTransaction + 'mo.move_cancelled="1"/>';
	//where restriction by mo.mo_id
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed"><clause relop="AND" op="=" value="'+str_mo_id+'"><field table="mo" name="mo_id"/></clause></restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</command>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</transaction>';
	//'<userInputRecordsFlag>'
	strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self',strSerialized,strXMLSQLTransaction);

}

//////////////
function sendMail()
{
	var objDataForm = document.afmInputsForm;
	var objHiddenForm = document.forms["hiddenEmailForm"];
	var bReturned	= false;
	var strMailto	= "";
	var strCC		= "";
	var strSubject	= "";
	var strBody		="";
	if(objDataForm != null)
	{
		//forming the content
		strMailto = objDataForm.elements['to'].value;
		strCC = objDataForm.elements['cc'].value;
		if(strCC != "")
			strCC = "?cc=" + escape(strCC);
		strSubject = objDataForm.elements['subject'].value;
		if(strSubject != "")
			strSubject = "&subject=" + escape(strSubject);
		strBody = objDataForm.elements['body'].value;
		strBody = "&body=" + escape(strBody);
		if(strMailto=="")
		{
			bReturned = false;
			objDataForm.elements['to'].focus();
		}
		else
			bReturned = true;
	}
	if(bReturned && objHiddenForm !=  null)
	{
		var strAction = "MAILTO:"+escape(strMailto)+strCC+strSubject+strBody;
		objHiddenForm.action = strAction;
		if(Debug)
		{
			alert("action : "+ strAction);
		}
		objHiddenForm.submit();
		bReturned = true;
	}

	return bReturned;
}

//getting input data from the edit form
function gettingRecordsData(objForm)
{
	var strReturned = "";
	var bl_id = objForm.elements["mo.to_bl_id"].value;
	bl_id = convert2validXMLValue(bl_id);
	var fl_id = objForm.elements["mo.to_fl_id"].value;
	fl_id = convert2validXMLValue(fl_id);
	var rm_id = objForm.elements["mo.to_rm_id"].value;
	rm_id = convert2validXMLValue(rm_id);
	strReturned = '<record mo.to_bl_id="'+bl_id+'" mo.to_fl_id="'+fl_id+'" mo.to_rm_id="'+rm_id+'"/>';
	return strReturned;
}

function checkVacanyRoomsButton(form_name, bl_fieldName, fl_fieldName, vacanyRoomsButtonName)
{
	var objForm = document.forms[form_name];
	var obj_bl_id = objForm.elements[bl_fieldName];
	var obj_fl_id = objForm.elements[fl_fieldName];
	var obj_vacanyRoomsButton = objForm.elements[vacanyRoomsButtonName];
	var str_bl_id = obj_bl_id.value;
	str_bl_id = trim(str_bl_id);
	var str_fl_id = obj_fl_id.value;
	str_fl_id = trim(str_fl_id);
	if(str_bl_id!="" && str_fl_id!="")
	{
		obj_vacanyRoomsButton.disabled = 0;
	}
	else
	{
		obj_vacanyRoomsButton.disabled = 1;
	}
}
