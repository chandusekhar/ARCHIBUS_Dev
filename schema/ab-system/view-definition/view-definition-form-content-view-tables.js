/******************************************************************
	Javascript Api to set up view's new table in Tgrp.
 ******************************************************************/
var strSelectedTableName = "";

function setSelectedTable(elemObj)
{
	if(elemObj != null)
	{
		for(var i=0; i < elemObj.length; i++)
		{
			if(elemObj[i].selected)
				strSelectedTableName = elemObj[i].value;
		}
	}
}
//used by sendingDataFromHiddenForm() in common.js to send data to
//server
function gettingRecordsData()
{
	var strReturned = '';
	if(strSelectedTableName != "")
	{
		strReturned = "<record";
		strReturned = strReturned + ' name="'+strSelectedTableName+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}

