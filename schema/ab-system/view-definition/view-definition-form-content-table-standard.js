/******************************************************************
	Javascript Api to select standard table in Tgrp.
 ******************************************************************/
var strSelectedStandardName = "";

function setSelectedStandardName(strFormName, strElemName, objElem)
{
	//if(count > 0)
	{
		var objForm = null;
		var objTables = null;
		if(objElem != null)
		{
			strSelectedStandardName = objElem.value;
		}
		else
		{
			objForm = document.forms[strFormName];
			objTables = objForm.elements[strElemName];
			strSelectedStandardName = objTables.value;
		}
	}
}

function gettingRecordsData()
{
	var strReturned = '';

	//if(strSelectedStandardName != "")
	{
		strReturned = "<record";
		strReturned = strReturned + ' table="'+strSelectedStandardName+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}

