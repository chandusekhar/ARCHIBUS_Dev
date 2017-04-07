/********************************************
show-check-out.js
Yong Shao
2005-02-7
*********************************************/
//initialized by show-check-out.xsl
var docmanager_tableName='';
var docmanager_fieldName='';
var docmanager_autoNamedFile='';
var docmanager_locked='false';
//doc or docvers table: one value
var docmanager_pkey_value="";
//inventory table: cold be a list of values
var docmanager_pkeys_values=new Array();



////////////////////////////////
var selectValueInputFieldID = "";
var selectedValueInputFormName = "";
var bSelectValueLookup=true;
var bShowExtraFields = true;
var showExtraFieldsArray = new Array();
showExtraFieldsArray["afm_docvers"] = new Array("doc_file", "doc_size");
//XXX
var arrFieldsInformation = new Array();

function setDocUpForm()
{
	var lockedObj = document.getElementById("locked");
	var unlockedObj = document.getElementById("unlocked");

	if(docmanager_locked=="true")
	{
		lockedObj.checked=1;
		unlockedObj.checked=0;
	}else{
		lockedObj.checked=0;
		unlockedObj.checked=1;
	}
}

function onDocOK(strSerialized)
{
	var objHiddenForm = document.forms["afmDocManagerInputsForm"];
	var strData = "";
	var strXMLValue = "";
	//if bData is true, insert client data into xml string

	setSerializedInsertingDataVariables(strSerialized);
	//gettingRecordsData() is defined in corresponding JS file
	//which XSL is calling sendingDataFromHiddenForm
	strData = gettingRecordsData();
	if(strData != "")
		strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
	else
		strXMLValue = strSerialized;

	//alert(strXMLValue);

	objHiddenForm.elements["xml"].value = strXMLValue;
	objHiddenForm.target = "";
	objHiddenForm.action = "login.axvw";

	//sending the hidden form to server
	objHiddenForm.submit();

}

function gettingRecordsData()
{
	var strReturned = "";
	var str_pkeys = "";
	var objForm = document.forms["afmDocManagerInputsForm"];

	var new_version = objForm.elements["afm_docvers.version"].value;

	var finalUploadFileName  = objForm.elements["afm_docvers.doc_file"].value;

	var docmanager_lock_status = "0";
	var lockedObj = document.getElementById("locked");
	if(lockedObj.checked)
		docmanager_lock_status = "1";


	strReturned = "<record";

	strReturned = strReturned + ' documentName="'+convert2validXMLValue(finalUploadFileName)+'" ';
	strReturned = strReturned + ' tableName="'+docmanager_tableName+'" ';
	strReturned = strReturned + ' fieldName="'+docmanager_fieldName+'" ';
	strReturned = strReturned + ' newLockStatus="'+docmanager_lock_status+'" ';
	strReturned = strReturned + ' version="'+new_version+'" ';

	for(var name in docmanager_pkeys_values)
	{
		str_pkeys = str_pkeys + ' ' + name + '="' +docmanager_pkeys_values[name] + '" ';
	}
	strReturned = strReturned + '/><pkeys '+str_pkeys+'/>';

	return strReturned;
}


function onSelectV(strSerialized, strField, formName)
{
	var strXMLData = "";
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	var str_pkeys = "";
	if(selectedFieldObj != null)
	{
		var sqlStat = "afm_docvers.table_name='"+docmanager_tableName+"'";
		sqlStat = sqlStat + "  AND afm_docvers.field_name='"+docmanager_fieldName+"'";
		sqlStat = sqlStat + "  AND afm_docvers.pkey_value='"+docmanager_pkey_value+"'";

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
			strData = '<fields><field role="self" ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/></fields><restriction type="sql" sql="'+sqlStat+'"/>';

			strXMLValue = strSerializedInsertingDataFirstPart + "<userInputRecordsFlag>" + strData + "</userInputRecordsFlag>" +  strSerializedInsertingDataRestPart;

			OpenSelectVWindow(strXMLValue);
		}
	}
}
