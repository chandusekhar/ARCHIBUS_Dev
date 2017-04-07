/********************************************
show-lock-status.js
Yong Shao
2005-02-7
*********************************************/
//initialized by show-lock-status.xsl
var docmanager_tableName='';
var docmanager_fieldName='';
var docmanager_autoNamedFile='';
var docmanager_locked='false';
var docmanager_pkeys_values=new Array();
var docmanager_fileName='';
var enableBreakExistingLock = "true";

//////
var breakExistingLock  = "";


function setUpForm()
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
	
	var breakExistingLockMessageAreaObj = document.getElementById("breakExistingLockMessageArea");
	var breakExistingLockAreaObj = document.getElementById("breakExistingLockArea");
	
	if(enableBreakExistingLock=='true')
	{
		breakExistingLockMessageAreaObj.style.display="";
		breakExistingLockAreaObj.style.display="";
	}
}

function onOK(strSerialized)
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
	var objForm = document.forms["afmDocManagerInputsForm"];
	var str_pkeys = "";
	
	var docmanager_lock_status = "0";
	var lockedObj = document.getElementById("locked");
	if(lockedObj.checked)
		docmanager_lock_status = "1";
	
	
	if(objForm.elements["break"].checked)
		breakExistingLock = "1";
	else
		breakExistingLock = "0";
	
	var strReturned = '';
	
	strReturned = "<record";

	strReturned = strReturned + ' documentName="'+convert2validXMLValue(docmanager_fileName)+'" ';
	strReturned = strReturned + ' tableName="'+docmanager_tableName+'" ';
	strReturned = strReturned + ' fieldName="'+docmanager_fieldName+'" ';
	strReturned = strReturned + ' newLockStatus="'+docmanager_lock_status+'" ';
	strReturned = strReturned + ' breakExistingLock="'+breakExistingLock+'" ';
	
	for(var name in docmanager_pkeys_values)
	{
		str_pkeys = str_pkeys + ' ' + name + '="' +docmanager_pkeys_values[name] + '" ';
	}
	strReturned = strReturned + '/><pkeys '+str_pkeys+'/>';
	
	return strReturned;
}