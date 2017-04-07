/******************************************************************
	Javascript Api to sort fields in Tgrp.
	some extra functions are defined in common-sort-visiblefields.js
 ******************************************************************/
//var arrSortedFieldUnique = new Array();
var arrSortedFieldAscending = new Array();
var selectedSortedFieldName = "";
//following variables will be overwritten by
//view-definition-form-content-table-sort.xsl
var visibleFieldsName   = "VisibleFields";
var fieldProperty_div   = "FieldProperty_div";
//var uniqueName		= "unique";
var ascendingName	= "ascending";

//called by common-sort-visiblefields.js
function setupMovedFieldProperties(bFlag, objTarget)
{
	if(!bFlag || selectedSortedFieldName == "")
		disableSortedFieldProperty_div();

	if(bFlag)
	{
		var strTableDotFieldName = "";
		if(objTarget != null && objTarget.length >0)
		{
			//getting new adding field name in format like "rm.rm_id"
			strTableDotFieldName = 	objTarget[objTarget.length-1].value		
			//setArrSortedFieldUnique(strTableDotFieldName, false);
			setArrSortedFieldAscending(strTableDotFieldName, true);
		}
	}
}
function setArrSortedFieldUnique(name, value)
{
	arrSortedFieldUnique[name] = value;
}
function setArrSortedFieldAscending(name, value)
{
	arrSortedFieldAscending[name] = value;
}

function enableSortedFieldProperty_div(elemObj)
{
	var objTarget = document.getElementById(fieldProperty_div);
	var objForm = document.forms[afmInputsFormName];
	var bUnique  = false;
	var bAscending = true;
	if(objTarget != null && objTarget.disabled)
		objTarget.disabled = 0;
	if(elemObj != null)
	{
		for(var i = 0; i < elemObj.length; i++)
		{
			if(elemObj[i].selected)
			{
				selectedSortedFieldName = elemObj[i].value;
				break;
			}
		
		}
	}
	if(selectedSortedFieldName != "")
	{
		//bUnique = arrSortedFieldUnique[selectedSortedFieldName];
		bAscending = arrSortedFieldAscending[selectedSortedFieldName];
		/*
		if(bUnique)
			objForm.elements[uniqueName].checked = 1;
		else
			objForm.elements[uniqueName].checked = 0;
		*/
		if(bAscending)
			objForm.elements[ascendingName][0].checked = 1;
		else
			objForm.elements[ascendingName][1].checked = 1;
		
	}
	else
	{
		disableSortedFieldProperty_div();
	}
}
/*
function setUnique(elemObj)
{
	if(elemObj != null && selectedSortedFieldName != "")
	{
		if(elemObj.checked)
		{
			arrSortedFieldUnique[selectedSortedFieldName] = true;
		}
		else
		{
			arrSortedFieldUnique[selectedSortedFieldName] = false;
		}
	}
}
*/
function setAscending(index)
{
	if(selectedSortedFieldName != "")
	{
		if(index == 0)
		{
			arrSortedFieldAscending[selectedSortedFieldName] = true;
		}
		else
		{
			arrSortedFieldAscending[selectedSortedFieldName] = false;
		}
	}
}

function disableSortedFieldProperty_div()
{
	var objTarget = document.getElementById(fieldProperty_div);
	var objForm = document.forms[afmInputsFormName];
	if(objTarget != null && !objTarget.disabled)
	{
		objTarget.disabled = 1;
		//objForm.elements[uniqueName].checked = 0;
		for(var i=0; i<objForm.elements[ascendingName].length;i++)
			objForm.elements[ascendingName][i].checked = 0;
	}
	selectedSortedFieldName = "";
}

function checkOnsortedFieldProperty()
{
	var objVisibleFields = document.getElementById(visibleFieldsName);
	var objTarget = document.getElementById(fieldProperty_div);
	var bVisible = false;
	if(objVisibleFields != null)
	{
		for(var i = 0; i < objVisibleFields.length; i++)
		{
			if(objVisibleFields[i].selected)
			{
				bVisible = true;
				break;
			}
		}

	}
	if(bVisible)
	{
		if(objTarget != null && objTarget.disabled)
		{
			objTarget.disabled = 0;
		}
	}		
}

function gettingRecordsData()
{
	var objVisibleFields = document.getElementById(visibleFieldsName);
	var strReturned = "";
	var arrTemp = new Array();
	var strTableDotFieldName = "";
	var strTableName = "";
	var strFieldName = "";
	var bUnique = false;
	var bAscending = true;
	if(objVisibleFields != null)
	{
		for(var i = 0; i < objVisibleFields.length; i++)
		{
			strTableDotFieldName = objVisibleFields[i].value;
			if(strTableDotFieldName != "")
			{
				arrTemp = strTableDotFieldName.split(".");
				strTableName = arrTemp[0];
				strFieldName = arrTemp[1];
				//bUnique = arrSortedFieldUnique[strTableDotFieldName];
				bAscending = arrSortedFieldAscending[strTableDotFieldName];
				strReturned = strReturned + '<field name="'+ strFieldName +'" table="'+strTableName+'" ';
				strReturned = strReturned + ' ascending="'+bAscending+'" />';
			}
			
		}

		
	}
	//if(strReturned != '')
	strReturned = "<order>" + strReturned + "</order>";
	return strReturned;
}