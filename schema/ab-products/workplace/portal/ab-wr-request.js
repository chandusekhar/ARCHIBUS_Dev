/*********************************************************************
 JavaScript File:ab-wr-request.js


 *********************************************************************/
///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";
////////////////////////////////////////////////////////////////////
//currently there are two refer tables em and eq,they are allowed to
//have extra fields in select value window(which extra fields are
//included in select value will be set up in afm-config.xml);
//but they can be controlled in each specified edit forms:
//var bShowExtraFields = false; in edit form page's js file will
//disable extra fields;
//following array will controll which extra fields in em or eq will be
//excluded.
var showExtraFieldsArray = new Array();
//only phone in em will be shown up in edit form
showExtraFieldsArray["em"] = new Array("phone");
//showExtraFieldsArray["eq"] = new Array("bl_id","fl_id"); which means
//that extra bl_id, fl_id for refer eq will be shown in edit form
//without rm_id.
//////////////////////////////////////////////////////////////////////////
//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;
/////////////////////////////////////////////////////////////////////////
var str_to_bl_id = "";
var str_to_fl_id = "";


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
	var objForm  = document.forms[formName];
	//setSerializedInsertingDataVariables() in common.js
	setSerializedInsertingDataVariables(strSerialized);
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
		strXMLValue = '<fields><field ';
		strXMLValue = strXMLValue + 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
		
		strXMLValue = strXMLValue + '<userInputRecordsFlag>' + gettingRecordsData(objForm) + '</userInputRecordsFlag>';
		
		strXMLValue = strSerializedInsertingDataFirstPart + strXMLValue +  strSerializedInsertingDataRestPart;
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


//list rooms
function showHighlightRooms(form_name,bl_id_input_field_name, fl_id_input_field_name )
{
	
  
	var obj_bl_id_field = document.forms[form_name].elements[bl_id_input_field_name];
	var obj_fl_id_field = document.forms[form_name].elements[fl_id_input_field_name];
	str_to_bl_id = obj_bl_id_field.value;
	str_to_fl_id = obj_fl_id_field.value;
	

		
		
	if (str_to_bl_id != "" && str_to_fl_id != "") {
		window.drawingRestriction = new Object();
		window.drawingRestriction.blId = str_to_bl_id;
		window.drawingRestriction.flId = str_to_fl_id;

		var selectValueWindowName = "selectValueWindow";
		var selectValueWindowSettings = "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=500,height=450";
		var selectValueWindow = window.open("", selectValueWindowName, selectValueWindowSettings);
		selectValueWindow.location.href = "ab-wr-request-select-value-from-highlight-rooms.axvw";
	}
	else {
		//focus on bl_id or fl_id field
		if (str_to_bl_id == "") 
			obj_bl_id_field.focus();
		else 
			obj_fl_id_field.focus();
	}

}
//convert2validXMLValue() in common.js
function onSubmitWorkRequest(form_name, strSerialized, warning_message, constraintViolation_message)
{
	var objForm = document.forms[form_name];
	var requestor, phone, prob_type;
	var eq_id, bl_id, fl_id, rm_id, location;
	var description, priority;
	var date_requested = getCurrentDateInISOFormat();
	var time_requested = getCurrentTimeIn24HourFormat();

	var bSendEmail = false;

	//check if three required fields are entered?
	requestor = objForm.elements["wr.requestor"].value;
	var requestor_for_sql = convert2validXMLValueAndLiteralizeValue(requestor );
	requestor = convert2validXMLValue(requestor);

	phone = objForm.elements["wr.phone"].value;
	phone = convert2validXMLValue(phone);

	prob_type = objForm.elements["wr.prob_type"].value;
	prob_type = convert2validXMLValue(prob_type);

	eq_id = objForm.elements["wr.eq_id"].value;
	eq_id = convert2validXMLValue(eq_id);

	bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = convert2validXMLValue(bl_id);

	fl_id = objForm.elements["wr.fl_id"].value;
	fl_id = convert2validXMLValue(fl_id);

	rm_id = objForm.elements["wr.rm_id"].value;
	rm_id = convert2validXMLValue(rm_id);

	location = objForm.elements["wr.location"].value;
	location = convert2validXMLValue(location);

	description = objForm.elements["wr.description"].value;
	description = convertMemo2validateXMLValue(description);

	var obj_priority = objForm.elements["wr.priority"];
	for(var i=0; i<obj_priority.length; i++)
	{
		if(obj_priority[i].checked)
		{
			priority = obj_priority[i].value;
			break;
		}

	}

	if(requestor == "" || phone == "" || prob_type == "" ||(eq_id=="" && bl_id==""))
	{
		alert(warning_message);

		//mouse focus
		if(requestor == "")
			objForm.elements["wr.requestor"].focus();
		else if(phone == "")
			objForm.elements["wr.phone"].focus();
		else if(prob_type=="")
			objForm.elements["wr.prob_type"].focus();
		else
			objForm.elements["wr.bl_id"].focus();
		//stop
		return;
	}
	else
	{
		var bConstraintCheck = checkConstraintViolation(bl_id, fl_id, rm_id);
		if(!bConstraintCheck)
		{
			alert(constraintViolation_message);
			if(bl_id=="")
				objForm.elements["wr.bl_id"].focus();
			else if(fl_id=="")
				objForm.elements["wr.fl_id"].focus();
			else if(rm_id=="")
				objForm.elements["wr.rm_id"].focus();
			return;
		}
		else
		{
			bSendEmail = objForm.elements["bSendEmail"].checked;

			var strXML  = "";
			var strXMLSQLTransaction = "";
			//render ab-wr-request-response.axvw if transaction is OK.
			strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-wr-request-response.axvw" response="true">';
			//<restrictions>
			strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
			strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="wr_id=(SELECT MAX(wr_id) FROM wr WHERE requestor=\''+requestor_for_sql +'\')">';
			strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction: last work request created by the requestor (supplied by the action)</title>';
			strXMLSQLTransaction = strXMLSQLTransaction + '<field table="wr"/>';
			strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
			strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
			strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
			//transaction
			strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="insert">';
			strXMLSQLTransaction = strXMLSQLTransaction + '<record  wr.requestor="'+requestor+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.description="'+description+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.bl_id="'+bl_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.fl_id="'+fl_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.rm_id="'+rm_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.phone="'+phone+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.prob_type="'+prob_type+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.eq_id="'+eq_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.location="'+location+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.priority="'+priority+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.date_requested="'+date_requested+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'wr.time_requested="'+time_requested+'" ';

			strXMLSQLTransaction = strXMLSQLTransaction + '/></command></transaction>';
			strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';

			//send request to server
			sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLSQLTransaction);
		}
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

//getting input data from the edit form
function gettingRecordsData(objForm)
{
	var strReturned = "";
	var bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = convert2validXMLValue(bl_id);
	var fl_id = objForm.elements["wr.fl_id"].value;
	fl_id = convert2validXMLValue(fl_id);
	var rm_id = objForm.elements["wr.rm_id"].value;
	rm_id = convert2validXMLValue(rm_id);
	strReturned = '<record wr.bl_id="'+bl_id+'" wr.fl_id="'+fl_id+'" wr.rm_id="'+rm_id+'"/>';
	return strReturned;
}
//Integrity constraint violation! The combination of building code , floor code and room code  is not valid.
function checkConstraintViolation(str_bl_id, str_fl_id, str_rm_id)
{
	return !((str_bl_id=="" && (str_fl_id!="" || str_rm_id!=""))
			 ||(str_bl_id=="" && str_fl_id=="" && str_rm_id!="")
			 ||(str_bl_id!="" && str_fl_id=="" && str_rm_id!="")
			)
}
