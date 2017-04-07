/***********************************************
 * ab-docs-templates-revisions-details.js
 * 
 * @author KE
 * @version 1.0
 */

var docmanager_tableName='';
var docmanager_fieldName='';
var docmanager_fileName='';
var docmanager_fileVersion='';
var docmanager_templateId='';

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

//	alert(strXMLValue);

	objHiddenForm.elements["xml"].value = strXMLValue;
	objHiddenForm.target = "_blank";
	objHiddenForm.action = "login.axvw";

	//sending the hidden form to server
	objHiddenForm.submit();
}

function gettingRecordsData()
{
	var strReturned = "";
	var str_pkeys = "";
	var objForm = document.forms["afmDocManagerInputsForm"];

	strReturned = "<record";
	strReturned += ' documentName="'+convert2validXMLValue(docmanager_fileName)+'" ';
	strReturned += ' tableName="'+docmanager_tableName+'" ';
	strReturned += ' fieldName="'+docmanager_fieldName+'" ';
	strReturned += ' version="'+docmanager_fileVersion+'" ';
	strReturned += '/><pkeys template_id="'+docmanager_templateId+'"/>';
	
//	alert(strReturned);
	return strReturned;
	 
}

