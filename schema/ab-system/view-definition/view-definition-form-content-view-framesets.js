/******************************************************************
	Javascript Api to set up view's frameset in Tgrp.
 ******************************************************************/
var strSelectedFramesetName = "";

function setUpFramesetImage(strFormName, strElementName, elemObj)
{
	var objForm = null;
	var objElem = null;
	if(elemObj == null)
	{
		objForm = document.forms[strFormName];
		objElem = objForm.elements[strElementName];
	}
	else
	{
		objElem = elemObj;
	}
	var strDivID = "";
	var objDivArea = null;
	for(var i = 0; i < objElem.length; i++)
	{
		strDivID = "div_" + objElem[i].value;
		objDivArea = document.getElementById(strDivID);
		if(objElem[i].selected)
		{
			strSelectedFramesetName = objElem[i].value;
			objDivArea.style.display = "";
		}
		else
		{
			objDivArea.style.display = "none";
		}
	}
}
//used by sendingDataFromHiddenForm() in common.js to send data to
//server
function gettingRecordsData()
{
	var strReturned = '';

	if(strSelectedFramesetName != "")
	{
		strReturned = "<record";
		strReturned = strReturned + ' name="'+strSelectedFramesetName+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}

