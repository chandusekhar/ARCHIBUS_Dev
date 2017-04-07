/******************************************************************
	Javascript Api to set up filters in Tgrp.
 ******************************************************************/
//added table's name
var strSelectedTableName = "";

function setSelectedTableName(strFormName, strElemName, objElem)
{
	if(objElem != null)
	{
		strSelectedTableName = objElem.value;
	}
	else
	{
		var obForm = document.forms[strFormName];
		var temp_objElem = obForm.elements[strElemName];
		strSelectedTableName = temp_objElem.value;
	}
}
//called by sendingDataFromHiddenForm() in common.js to send request to
//server
function gettingRecordsData()
{
	var strReturned = '';
	if(strSelectedTableName != "")
	{
		strReturned = "<record";
		strReturned = strReturned + ' table="'+strSelectedTableName+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}

