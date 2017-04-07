/*********************************************************************
 JavaScript File: edit-forms.js

 Author: Yong Shao
 Date:	 03/07/2002

 Functionalities: (Client-side form javascript validation)
		 (1)Intializing the variables and show the date, time,
			 and string fields in their format as HTML is
			 loaded;
		 (2)Making a validation on the edit forms as they are
			 submitted;
		 (3)Making a validation as users input some fields like
			 date, time, strings, numeric, and integer;

 Notes: Regular Expression pattern (RE) is havily used. Netscape(>=4.0)
		and IE(>=4.0), and JavaScript1.2 all support RE.
		validation JS functions are in inputs-validation.js

		 strSerializedStartTag, strSerializedCloseTag,
		 strSerializedInsertingDataFirstPart,
		 strSerializedInsertingDataRestPart,
		 and setSerializedInsertingDataVariables(strSerialized); are in common.js

 *********************************************************************/
//warning_message for empty required fields
var warning_message = "";
//warning for deleting
var delete_warning_message = "";
///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";
//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;
////////////////////////////////////////////////////////////////////////
//handling multiple forms in one html page
var iUsersInputForms  = 0;
var arrAllUsersInputFormNames    = new Array();
function setupArrAllUsersInputFormNames(formName)
{
	arrAllUsersInputFormNames[iUsersInputForms++] = formName;
}
////////////////////////////////////
//arrEditFormRecordsPKs["unqiue_ID_each_editForm"]=new
//Array("pk_value",.....);
var arrEditFormRecordsPKs = new Array();

var arrAfmActionSerializedStringsByID = new Array();
/*a flag to indicate if the value of any control in form is changed*/
var afm_form_values_changed=false;
/*a falg to control if invoking default onload function*/
var enable_default_form_onload = true;
////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)Delete_CurrentRecord
function validationInputs(formName, fieldName, bCheckRequiredFields)
{
	var objForm = document.forms[formName];
	var objValue = objForm.elements[fieldName];
	var bReturned = true;
	if(objValue != null){
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
		if(!bIsEnum){
			//all validation funcrions are in inputs-validation.js
			//check integer
			if(typeUpperCase=="JAVA.LANG.INTEGER"){
				if(!validationIntegerOrSmallint(objValue, true))
					bReturned = false;
			}else if(typeUpperCase=="JAVA.LANG.DOUBLE" || typeUpperCase=="JAVA.LANG.FLOAT"){
				if(!validationNumeric(objValue,decimal, true))
					bReturned = false;
			}

			if(formatUpperCase=="UPPERALPHANUM"){
				objValue.value = (objValue.value).toUpperCase();
				if(!validationUPPERALPHANUMString(objValue))
					bReturned = false;
			}else if(formatUpperCase=="UPPERALPHA"){
				objValue.value = (objValue.value).toUpperCase();
				if(!validationUPPERALPHAString(objValue))
					bReturned = false;
			}else if(formatUpperCase=="UPPER"){
				objValue.value = (objValue.value).toUpperCase();
			}
			//check maxsize(skip date and time fields)
			if(typeUpperCase!= "JAVA.SQL.DATE" && typeUpperCase!= "JAVA.SQL.TIME"){
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

function onSelectV(strSerialized, strField, formName, ascending)
{
	if(typeof ascending == "undefined"){
		ascending = "true";
	}
	var strXMLData = "";
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	if(selectedFieldObj != null){
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
		var enablePrefix = arrFieldsInformation[strField]["enablePrefix"];
		var strData = "";
		var strXMLValue = "";
		if(strSerialized != ""){
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];
			strData = '<fields><field ascending="'+ascending+'" ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			strData = strData + '<userInputRecordsFlag>' + gettingRecordsData(objForm, strField) + '</userInputRecordsFlag>';
			if(enablePrefix=="true"){
				strData = strData +'<prefix ';
				strData = strData + 'value="'+strValue+'"';
				strData = strData + '/>';
			}
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
			//calling OpenSelectVWindow() to open a new window for server
			//to show available values for specified field
			OpenSelectVWindow(strXMLValue);
		}else{
			if(Debug){
				alert("The attribute serialized of afmAction is empty.");
			}
		}
	}
}

//called when the edit form is submitted
function ValidatingForm(formName, strSerialized, strTarget, bData)
{
	var bReturned	= true;
	var strXMLDate	= "";
	var objForm	= document.forms[formName];
	if(bData && objForm != null){
		//setSerializedInsertingDataVariables() in common.js
		if(strSerialized!="")
			setSerializedInsertingDataVariables(strSerialized);
		for(var inputFieldName in arrFieldsInformation){
			var objElem = objForm.elements[inputFieldName];
			if(objElem==null)
				continue;
			var element_type = objElem.type;
			element_type = element_type.toUpperCase();
			var fieldValue = objForm.elements[inputFieldName].value;
			var fieldName = objForm.elements[inputFieldName].name;
			bReturned = validationInputs(formName, fieldName, true);
			if(!bReturned){
				//show warning message to ask users for empty
				//required fields
				showWarningMessage(formName, fieldName);
				return bReturned;
			}else{
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
	if(bReturned){
		if(strXMLDate != ""){
			if(gettingRecordsData(objForm)==null) return false;
			strXMLDate = '<userInputRecordsFlag>'+gettingRecordsData(objForm)+'</userInputRecordsFlag>';
			strXMLDate = strSerializedInsertingDataFirstPart + strXMLDate + strSerializedInsertingDataRestPart;
		}else{
			strXMLDate = strSerialized;
		}
		//sending data to server
		//sending data to server through a hidden form
		if(strSerialized != "")
			sendingDataFromHiddenForm('',strXMLDate, strTarget, '',false,"");
	}
	return bReturned;
}
//when page is loaded, calling InitializingForm to initialize the date
//and time fields in forms, and refresh children frames
window.onload=InitializingForm;
function InitializingForm()
{
	//set up warning_message
	var warning_message_object = document.getElementById("general_warning_message_empty_required_fields");
	if(warning_message_object!=null)
		warning_message = warning_message_object.innerHTML;
	//set up warning_message
	var delete_warning_message_object = document.getElementById("general_delete_warning_message_empty_required_fields");
	if(delete_warning_message_object!=null)
		delete_warning_message = delete_warning_message_object.innerHTML;
	//initializing each forms
	if(enable_default_form_onload){
		for(var i = 0; i < arrAllUsersInputFormNames.length; i++){
			var formName = arrAllUsersInputFormNames[i];
			
			var objForm = document.forms[formName];
			initializingConsoleForm(objForm);
			for(var inputFieldName in arrFieldsInformation){
				// Ext-JS adds a 'remove' function to all arrays, skip since no a form element
				if (typeof arrFieldsInformation[inputFieldName] == 'function') {
					continue;
				}
				if (Debug && typeof objForm.elements[inputFieldName] == "undefined"){
					// TODO: what is the reason for prompting the user to enter the field name?
					// the value entered by the user is ignored...
					// also, forms with custom fields display this message, yet operate correctly
					// see the Citigroup project/Nick S
					//prompt("InitializingForm: This field has no form element!", inputFieldName);
					continue;
				}
				//XXX???
				if(objForm.elements[inputFieldName]==null) continue;

				var fieldValue = objForm.elements[inputFieldName].value;
				var fieldName = objForm.elements[inputFieldName].name;
				fieldName = trim(fieldName);
				if(fieldName!=""){
				validationInputs(formName, fieldName, false);
                
				if (Debug && typeof arrFieldsInformation[fieldName] == "undefined"){
					prompt("InitializingForm: This field has duplicate form elements!", inputFieldName);
					continue;
				}
				var typeUpperCase = arrFieldsInformation[fieldName]["type"];
				typeUpperCase = typeUpperCase.toUpperCase();
				var sRequired = arrFieldsInformation[fieldName]["required"];
				if(typeUpperCase == "JAVA.SQL.DATE"){
					//since initially sever sends date in ISO format
					//"YYY-MM-DD"
					var field_value = objForm.elements[inputFieldName].value;
					var dateArrayObj = new Array();
					if(field_value != null && field_value != ""){
						//since edit-form may come from history.back()
						//isBeingISODateFormat() in date-time.js
						if(isBeingISODateFormat(field_value)){
							dateArrayObj = field_value.split("-");
						}else{
							//gettingYearMonthDayFromDate() in date-time.js
							var temp_date_array = gettingYearMonthDayFromDate(field_value);
							dateArrayObj[0] = temp_date_array["year"];
							dateArrayObj[1] = temp_date_array["month"];
							dateArrayObj[2] = temp_date_array["day"];
						}
						validationAndConvertionDateInput(objForm.elements[inputFieldName], fieldName, dateArrayObj, sRequired, true, true);
					}else{
						validationAndConvertionDateInput(objForm.elements[inputFieldName], fieldName, null, "false", true, false);
					}
				}else if(typeUpperCase == "JAVA.SQL.TIME"){
					//since initially sever sends time in the format
					//"HH:MM"
					var field_value = objForm.elements[inputFieldName].value;
					// some raw time is formatted as HH:MM.SS.000, we need to
					// replace the "." with ":"
					field_value = field_value.replace(/\./g, ":");
					var TimeArrayObj = new Array();
					if(field_value != null && field_value != "")
						TimeArrayObj = field_value.split(":");
					else
						TimeArrayObj = null;
					validationAndConvertionTimeInput(objForm.elements[inputFieldName], fieldName, TimeArrayObj, "false", true, true);
				}
				}
			}
		}
	}
	
	window.setTimeout(callOnloadHandlers, 100);
}

function callOnloadHandlers() {
	if (valueExists(window['dwr'])) {
		// DWR 2.1 makes a service call to obtain the script session ID
		// until this call is complete, it is unsafe to make any WFR requests, so we'll wait here
		if (!valueExists(dwr.engine._scriptSessionId)) {
			window.setTimeout(callOnloadHandlers, 100);
			return;
		}
	}
	
    for (var i = 0; i < system_form_onload_handlers.length; i++) {
        system_form_onload_handlers[i].call();
    }

    //user's onload function (can overwrite default form's onloading)
    user_form_onload();
}

///////
//interface function (do nothing by default)
function user_form_onload(){}

/**
 * Array of system initialization handlers to be called before user_form_onload().
 */
var system_form_onload_handlers = [];

//getting input data from the edit form
function gettingRecordsData(objForm, activeFieldName)
{
	//user's check
	if(!user_form_before_gettingRecordsData())
		return null;
	var strReturned = "";
	if(objForm==null){
		objForm = document.forms[arrAllUsersInputFormNames[0]];
	}
	if(objForm != null && arrFieldsInformation != null){
		for(var inputFieldName in arrFieldsInformation){
			var objElem=objForm.elements[inputFieldName];
			if(objElem==null)continue;
			var fieldValue = objElem.value;
			var fieldName = objElem.name;
			var typeUpperCase = arrFieldsInformation[fieldName]["type"];
			var bContinued = true;
			if(typeof activeFieldName != "undefined" && activeFieldName!=null && activeFieldName == fieldName){
				bContinued = false;
			}
			if(bContinued){
				var typeUpperCase = arrFieldsInformation[fieldName]["type"];
				typeUpperCase = typeUpperCase.toUpperCase();
				var formatUpperCase = arrFieldsInformation[fieldName]["format"];
				formatUpperCase = formatUpperCase.toUpperCase();
				//removing money sign and grouping separator and changing date into ISO format
				fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);
				//trim fieldValue: trim() is defined in common.js
				fieldValue = trim(fieldValue);

				if(formatUpperCase!="MEMO"){
					if(typeUpperCase != "JAVA.SQL.TIME"){
						fieldValue = convert2validXMLValue(fieldValue);
					}else{
						//transform time to 24-hour format(HH:MM)
						//getTimeWith24Format() is defined in date-time.js
						// fieldValue = getTimeWith24Format(fieldValue);
						// 24h time is generated on user input and stored in a hidden field
						fieldValue = objForm.elements["Stored"+inputFieldName].value;
					}
				}else{
					//memo fields
					fieldValue = convertMemo2validateXMLValue(fieldValue);
				}
				strReturned = strReturned + ' '+fieldName+'="'+fieldValue+'" ' ;
			}
		}
	}

	if(strReturned!="")
		strReturned = "<record " + strReturned + "/>";
	return strReturned;
}
///////
//interface function (do nothing by default)
function user_form_before_gettingRecordsData(){return true;}

function showWarningMessage(formName, fieldName)
{
	var objForm = document.forms[formName];
	var objValue = objForm.elements[fieldName];
	var required = arrFieldsInformation[fieldName]["required"];
	if(!validationRequiredField(objValue, required))
		alert(warning_message);
}

//delete action
function onDelete(afmTableGroupID,serialized,taget,bData)
{
	var bReturned = user_form_check_before_delete();
	if(!bReturned)return false;
	//confirmation
	var bSent = confirm(delete_warning_message);
	if(bSent){
		//all information for delete is in serialized
		//send request to server
		sendingDataFromHiddenForm('',serialized, taget, '',false,"");
	}else{
		bReturned = false;
	}

	return bReturned;
}
///////
//interface function (do nothing by default)
function user_form_check_before_delete(){return true;}

//add new action
function onAddNew(afmTableGroupID,serialized,taget,bData)
{
	if(!user_form_check_before_addNew()) return false;

	return ValidatingForm(afmTableGroupID,serialized,taget,bData);
}
///////
//interface function (do nothing by default)
function user_form_check_before_addNew(){return true;}

//save action
function onSave(afmTableGroupID,serialized,taget,bData)
{
	if(!user_form_check_before_save()) return false;
	return ValidatingForm(afmTableGroupID,serialized,taget,bData);
}
///////
//interface function (do nothing by default)
function user_form_check_before_save(){return true;}

//cancel action
function onCancel(afmTableGroupID,serialized,taget,bData)
{
	if(!user_form_check_before_cancel()) return false;
	return ValidatingForm(afmTableGroupID,serialized,taget,bData);
}
///////
//interface function (do nothing by default)
function user_form_check_before_cancel(){return true;}

//Document management:
function onMarkDocumentDeleted(serialized,taget)
{
        var warning = document.getElementById("document_delete_warning_message").innerHTML;
	var bSent = confirm(warning);
	if(bSent){
		//all information for delete is in serialized
		//send request to server
		sendingDataFromHiddenForm('',serialized, taget, '',false,"");
	}else{
		bReturned = false;
	}

}

// Perform save with a custom action embedded
function onSaveWithRuleAction(afmTableGroupID,serialized,strAction,taget,bData)
{
	// Insert our action into the serialized action string
	setSerializedInsertingDataVariables(serialized);
	serialized = strSerializedInsertingDataFirstPart + strAction +  strSerializedInsertingDataRestPart;

	return ValidatingForm(afmTableGroupID,serialized,taget,bData);
}

// Nest a serialized action inside another serialized action and submit
function onSaveWithSerializedRuleAction(formName,serialized,strSerAction,taget,bData)
{
	var objForm = document.forms[formName];
	var strTempAction = '<userInputRecordsFlag>'+gettingRecordsData(objForm) + '</userInputRecordsFlag>';
	setSerializedInsertingDataVariables(strSerAction);
	strTempAction = strSerializedInsertingDataFirstPart + strTempAction + strSerializedInsertingDataRestPart;

	setSerializedInsertingDataVariables(serialized);
	strTempAction = strSerializedInsertingDataFirstPart + strTempAction +  strSerializedInsertingDataRestPart;
	return ValidatingForm(formName,strTempAction,taget,bData);
}


function getValidSqlValueFromFieldInput(inputFieldName, objForm)
{
	var fieldValue = objForm.elements[inputFieldName].value;
	var typeUpperCase = arrFieldsInformation[inputFieldName]["type"];
	typeUpperCase = typeUpperCase.toUpperCase();
	var formatUpperCase = arrFieldsInformation[inputFieldName]["format"];
	formatUpperCase = formatUpperCase.toUpperCase();

	fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);

	fieldValue = trim(fieldValue);

	if(formatUpperCase!="MEMO"){
		if(typeUpperCase != "JAVA.SQL.TIME"){
			fieldValue = convert2validXMLValueAndLiteralizeValue(fieldValue);
		}else{
			fieldValue = objForm.elements["Stored"+inputFieldName].value;
		}
	}else{

		fieldValue = convertMemo2validateXMLValue(fieldValue);
	}
	return fieldValue;

}
/////////////////////////////////////////////////////////////////////////
/*fieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *should be matched with HTML element's IDs
 *dbfieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *will be used to generate server-side request, and they must be kept
 *in the same order and same number of fields as fieldsList.
 *If dbfieldsList is missed or null, fieldsList will by default be used to generate server-side request 
 **/
function generateRestrictionSql(fieldsList, form, dbfieldsList)
{
	var restriction="";
	var objForm = document.forms[arrAllUsersInputFormNames[0]];
	if (typeof form != "undefined" && form!=null)
		objForm = document.forms[form];	
	
	if(fieldsList!=""){
		var dbfieldsArray = null;
		if (typeof dbfieldsList != 'undefined' && dbfieldsList!=null && dbfieldsList!="") {
			dbfieldsArray = dbfieldsList.split(",");
		}
		var fieldsArray = fieldsList.split(",");
		for(var i=0;i<fieldsArray.length;i++){
			var fieldName = fieldsArray[i];
			var fieldValue = getValidSqlValueFromFieldInput(fieldName, objForm);
			var db_fieldFullName = arrFieldsInformation[fieldName]['fullName'];
			if(dbfieldsArray!=null)
				db_fieldFullName = dbfieldsArray[i];
			if(restriction!="")
				restriction = restriction + " AND ";
			//if(fieldValue!="")
				restriction = restriction + " " + db_fieldFullName + "='" + fieldValue+"' ";
			//else
				//restriction = restriction + " " + db_fieldFullName + "='NULL' ";
		}
	}
	if(restriction!=""){
		restriction = '<restriction type="sql" sql="' + restriction + '"/>';
	}

	return restriction;
}
///////////////////////////////////////////////
/*fieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *should be matched with HTML element's IDs
 *dbfieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *will be used to generate server-side request, and they must be kept
 *in the same order and same number of fields as fieldsList.
 *If dbfieldsList is missed or null, fieldsList will by default be used to generate server-side request 
 **/
function generateRestrictionParsed(fieldsList,form, dbfieldsList)
{
	var restriction="";
	var title="";
	var objForm = document.forms[arrAllUsersInputFormNames[0]];
	if (typeof form != "undefined" && form!=null)
		objForm = document.forms[form];
	if(fieldsList!=""){
		var dbfieldsArray = null;
		if (typeof dbfieldsList != 'undefined' && dbfieldsList!=null && dbfieldsList!="") {
			dbfieldsArray = dbfieldsList.split(",");
		}
		//XXX????
		for(var n in arrFieldsInformation){
			if(!validationInputs(objForm.name, n, true)){
				return;
			}
		}
		//////////////////////////////
		var fieldsArray = fieldsList.split(",");
		for(var i=0;i<fieldsArray.length;i++){
			var fieldName = fieldsArray[i];
			if(arrFieldsInformation[fieldName]!=null){
				var operator = arrFieldsInformation[fieldName]['op'];
				if(operator=="")
					operator = "=";
				var db_fieldFullName = arrFieldsInformation[fieldName]['fullName'];
				if(dbfieldsArray!=null)
					db_fieldFullName = dbfieldsArray[i];
				
				var fieldValue = getValidSqlValueFromFieldInput(fieldName, objForm);
				//Fixed pattern!!!
				title = title + fieldName + "=" + fieldValue + "AFM_FLAG::SEPARATOR";
				
				if(fieldValue!=""){
					if(operator == "LIKE" || operator == "NOT LIKE")
						fieldValue = fieldValue + "%";
					restriction = restriction + '<clause relop="AND" op="'+operator+'" value="' + fieldValue + '"><field name="'+db_fieldFullName.split(".")[1]+'" table="'+db_fieldFullName.split(".")[0]+'"/></clause>';
				}
				//else
					//restriction = restriction + '<clause relop="AND" op="IS NULL" value=""><field name="'+db_fieldFullName.split(".")[1]+'" table="'+db_fieldFullName.split(".")[0]+'"/></clause>';

			}
		}
	}
	if(title!=""){
		title = '<title>' + title  +'</title>';
	}
	if(restriction!=""){
		restriction = '<restriction type="parsed">' + restriction + title +'</restriction>';
	}

	return restriction;
}
function getRestrictions(fieldsList, form, dbfieldsList)
{
	var result = generateRestrictionParsed(fieldsList, form, dbfieldsList);
	if(result!="")
		result="<userInputRecordsFlag><restrictions>"+result+"</restrictions></userInputRecordsFlag>";
	return result;

}
///////////////////////////////////////////////////////////
/*fieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *should be matched with HTML element's IDs
 *dbfieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *will be used to generate server-side request, and they must be kept
 *in the same order and same number of fields as fieldsList.
 *If dbfieldsList is missed or null, fieldsList will by default be used to generate server-side request 
 **/
function generateQueryParameters(fieldsList, form, dbfieldsList)
{
	var queryParameters="";
	var objForm = document.forms[arrAllUsersInputFormNames[0]];
	if (typeof form != "undefined" && form!=null)
		objForm = document.forms[form];

	if(fieldsList!=""){
		var dbfieldsArray = null;
		if (typeof dbfieldsList != 'undefined' && dbfieldsList!=null && dbfieldsList!="") {
			dbfieldsArray = dbfieldsList.split(",");
		}
		//XXXX????
		for(var n in arrFieldsInformation){
			if(!validationInputs(objForm.name, n, true)){
				return;
			}
		}
		var fieldsArray = fieldsList.split(",");
		for(var i=0;i<fieldsArray.length;i++){
			var fieldName = fieldsArray[i];
			var fieldValue = getValidSqlValueFromFieldInput(fieldName, objForm);
			var db_fieldFullName = arrFieldsInformation[fieldName]['fullName'];
			if(dbfieldsArray!=null)
				db_fieldFullName = dbfieldsArray[i];
			if(fieldValue!="")
				queryParameters = queryParameters + '<queryParameter name="'+db_fieldFullName.split(".")[1]+'" type="'+arrFieldsInformation[fieldName]["type"]+'" value="' + fieldValue + '"/>';
			//else
				//queryParameters = queryParameters + '<queryParameter name="'+db_fieldFullName.split(".")[1]+'" type="'+arrFieldsInformation[fieldName]["type"]+'" value="NULL"/>';
		}
	}
	if(queryParameters!=""){
		queryParameters = '<queryParameters>' + queryParameters + '</queryParameters>';
	}

	return queryParameters;
}
function getQueryParameters(fieldsList, form, dbfieldsList)
{
	var result = generateQueryParameters(fieldsList, form, dbfieldsList);
	if(result!="")
		result="<userInputRecordsFlag><queryParameters>"+result+"</queryParameters></userInputRecordsFlag>";
	return result;
}
//////////////////////////////////////////////////////////////////////////
function sendSelectValueRequest(targetFieldFullName,tableName, fieldName, restriction, showFieldsList, bPrefix, form, beingSelf, ascending)
{
	if(typeof ascending == "undefined"){
		ascending = "true";
	}
	var xml = arrAfmActionSerializedStringsByID["selectValueAfmAction"]["serialized"];
	var formName = arrAfmActionSerializedStringsByID["selectValueAfmAction"]["form"];
	if(xml != ""){
		selectedValueInputFormName = formName;
		if(targetFieldFullName=="")
			targetFieldFullName= tableName + "." + fieldName;
		selectValueInputFieldID = targetFieldFullName;

		var strData = '<fields><field ascending="'+ascending+'" ';
		if(beingSelf!=null && beingSelf){
			strData = strData + 'role="self" ';
		}
		if(showFieldsList!=null && showFieldsList !=""){
			strData = strData + 'additionalFields="'+showFieldsList+'" ';
		}
		strData = strData + 'table="'+tableName+'" name="'+fieldName+'"/></fields>';
		if(restriction!=null){
			restriction = trim(restriction);
			if(restriction!=""){
				restriction = convert2validXMLValue(restriction);
				strData = strData + '<restriction type="sql" sql="'+restriction+'"/>'
			}
		}
		if(bPrefix!=null  && bPrefix){
			strData = strData + '<prefix value="'+getInputValue(targetFieldFullName, form)+'"/>';
		}
		strData = strData + gettingRecordsData(document.forms[formName], fieldName);
		strData = "<userInputRecordsFlag>" + strData + '</userInputRecordsFlag>';
		xml = insertXML2AfmActionXML(xml,strData);
		OpenSelectVWindow(xml);
	}
}
/////
function sendSelectValueDrawingRequest(viewName, targetFieldFullName, restrictionFieldFullNamesList, form)
{
	var restrictionList="";
	if(restrictionFieldFullNamesList!="")
	{
		if(form==null || form==""){
			form = document.forms[1].name;
		}
		var objForm = document.forms[form];
		var temp_array = restrictionFieldFullNamesList.split(",");
		for(var i=0;i<temp_array.length;i++){
			var fieldFullName = temp_array[i];
			fieldFullName = trim(fieldFullName);
			var fieldValue = objForm.elements[fieldFullName].value;
			fieldValue = trim(fieldValue);
			if(fieldValue!=""){
				restrictionList = restrictionList + "&" + fieldFullName +"="+fieldValue;
			}
		}
	}
	if(viewName!=""){
		selectedValueInputFormName = form;
		selectValueInputFieldID = targetFieldFullName;

		var strLink = viewName + "?handler=com.archibus.config.ActionHandlerDrawing" + restrictionList;
		var selectValueWindowName	= "selectValueWindow";
		var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=500,height=450";
		var selectValueWindow		= window.open("", selectValueWindowName,selectValueWindowSettings);
		selectValueWindow.location.href = strLink;
	}else{
		alert("no drawing view!!!");
	}

}
//////
/**
 * Returns form field value in locale-neutral format.
 * @param {fieldFullName}   Fully-qualified name of the input field, i.e. wr.date_created.
 * @param {form}            HTML form name. If null or empty, the first form is used.
 * @return                  Field value in locale-neutral format. 
 */
function getInputValue(fieldFullName, form)
{
	var returnedValue = "";
	if(fieldFullName!=""){
		if(form==null  || form==""){
			form = document.forms[1].name;
		}
		var objForm = document.forms[form];
		returnedValue = objForm.elements[fieldFullName].value;
		returnedValue = trim(returnedValue);
		var typeUpperCase = arrFieldsInformation[fieldFullName]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[fieldFullName]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		returnedValue=convertFieldValueIntoValidFormat(typeUpperCase,formatUpperCase,returnedValue);
		if(typeUpperCase != "JAVA.SQL.TIME")
			returnedValue = convert2validXMLValue(returnedValue);
		else
			returnedValue = objForm.elements["Stored"+fieldFullName].value;
	}
	return returnedValue;
}
/**
 * Sets form field value in locale-dependent format.
 * @param {fieldName}   Fully-qualified name of the input field, i.e. wr.date_created.
 * @param {formName}    HTML form name. If null or empty, the first form is used.
 * @param {fieldValue}  Value to be set, in locale-neutral format.
 * @return              True if the field has been set, false otherwise.
 */
 
function setInputValue(fieldName, formName, fieldValue)
{
    if(formName==null  || formName==""){
        formName = document.forms[1].name;
    }
    var objForm = document.forms[formName];
    
    var objField = objForm.elements[fieldName];
    if(objField==null) return false;

    var fieldInfo = arrFieldsInformation[fieldName];
    var typeUpperCase = fieldInfo["type"].toUpperCase();
    
    // decode special characters previously encoded by getInputValue()
    // set the field if the field vlaue is empty
    if(fieldValue=="" || (typeUpperCase != "JAVA.SQL.DATE" && typeUpperCase != "JAVA.SQL.TIME")) {
        fieldValue = convertFromXMLValue(fieldValue);
		
		// only assign value if it is not DATE/TIME
	    objField.value = fieldValue;
    }
    
    var fieldName = objField.name;
    validationInputs(formName, fieldName, false);

    if (Debug && typeof fieldInfo == "undefined") return false;
    
    var sRequired = fieldInfo["required"];
    if(typeUpperCase == "JAVA.SQL.DATE"){
        //"YYY-MM-DD"
        var dateArrayObj = new Array();
        if(fieldValue != null && fieldValue != ""){
            //isBeingISODateFormat() in date-time.js
            if(isBeingISODateFormat(fieldValue)){
                dateArrayObj = fieldValue.split("-");
            }else{
                //gettingYearMonthDayFromDate() in date-time.js
                var temp_date_array = gettingYearMonthDayFromDate(fieldValue);
                dateArrayObj[0] = temp_date_array["year"];
                dateArrayObj[1] = temp_date_array["month"];
                dateArrayObj[2] = temp_date_array["day"];
            }
            validationAndConvertionDateInput(objField, fieldName, dateArrayObj, sRequired, true, true);
        }else{
            validationAndConvertionDateInput(objField, fieldName, null, "false", true, false);
        }
    }else if(typeUpperCase == "JAVA.SQL.TIME"){
        //"HH:MM"
        var TimeArrayObj = new Array();
        if(fieldValue != null && fieldValue != "") {
            fieldValue = fieldValue.replace(/\./g, ":");
            TimeArrayObj = fieldValue.split(":");
        }
        else
            TimeArrayObj = null;
        validationAndConvertionTimeInput(objField, fieldName, TimeArrayObj, "false", true, true);
    }
    return true;
}
///////////////////////////////////////////////////////////
/*fieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *should be matched with HTML element's IDs
 *dbfieldsList: "tableName.fieldName1,tableName.fieldName2..." which
 *will be used to generate server-side request, and they must be kept
 *in the same order and same number of fields as fieldsList.
 *If dbfieldsList is missed or null, fieldsList will by default be used to generate server-side request 
 **/
function getListedFieldsAsRecord(fieldsList, form, dbfieldsList)
{
	var returnedRecords = "";
	if(fieldsList!=""){
		var dbfieldsArray = null;
		if (typeof dbfieldsList != 'undefined' && dbfieldsList!=null && dbfieldsList!="") {
			dbfieldsArray = dbfieldsList.split(",");
		}
		if(typeof form == 'undefined' || form==null  || form==""){
			form = document.forms[1].name;
		}
		var temp_array = fieldsList.split(",");
		for(var i=0;i<temp_array.length;i++){
			var fieldFullName = temp_array[i];
			fieldFullName = trim(fieldFullName);
			var fieldValue = getInputValue(fieldFullName, form);
			if(dbfieldsArray!=null)
				fieldFullName = dbfieldsArray[i];
			
			returnedRecords = returnedRecords + ' '+fieldFullName+'="'+fieldValue+'" ';
		}
	}
	if(returnedRecords!=""){
		returnedRecords = "<record "+ returnedRecords + "/>";
	}
	return returnedRecords;
}
///////////////////////////////////////////////
function initializingConsoleForm(objForm)
{
	if(typeof console_form_restriction_title != "undefined"){
		if(console_form_restriction_title!=""){
			var temp_array=console_form_restriction_title.split("AFM_FLAG::SEPARATOR");
			for(var i=0;i<temp_array.length; i++){
				var temp_values = temp_array[i];
				temp_values = trim(temp_values);
				if(temp_values!="")
					if(objForm.elements[temp_values.split("=")[0]])
						objForm.elements[temp_values.split("=")[0]].value=temp_values.split("=")[1];

			}
		}
	}
}
/**
 * Checks whether specified field value is not empty.
 * If the value is empty, sets the focus to the field and displays standard warning message.
 * @param {fieldName} Field HTML element id attribute. 
 */
function checkFieldNotEmpty(fieldName)
{
	var field = $(fieldName);
	if ( field.value == '' )
	{
		field.focus();
		alert(warning_message);
		return false;
	}
	return true;
}

function mapKeyPressToClick(e, element)
{
	if(e.keyCode == 13){
		element.click();
	}
}