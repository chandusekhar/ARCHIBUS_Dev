/******************************************************************
	Javascript Api to select visible fields in Tgrp.
 ******************************************************************/
var arrVisibleFieldDistinct = new Array();
var arrVisibleFieldRequired = new Array();
var selectedVisibleField = "";
//oerwritten in view-definition-form-content-table-visiblefields.xsl
var visibleFieldsName   = "VisibleFields";
//var bDistinct_div   = "bDistinct_div";
var bRequired_div   = "bRequired_div";
//var bDistinctName   = "bDistinct";
var bRequiredName   = "bRequired";
										  
function setArrVisibleFieldDistinct(name, value)
{
	arrVisibleFieldDistinct[name] = value;
}

function setArrVisibleFieldRequired(name, value)
{
	arrVisibleFieldRequired[name] = value;
}
function setArrVisibleFieldPK(name, value)
{
	arrVisibleFieldPK[name] = value;
}

/*
function setBDistinct(elemObj)
{
	if(elemObj != null && selectedVisibleField != "")
	{
		if(elemObj.checked)
		{
			arrVisibleFieldDistinct[selectedVisibleField] = 'true';
		}
		else
		{
			arrVisibleFieldDistinct[selectedVisibleField] = 'false';
		}
	}

}
*/
function setBRequired(elemObj)
{
	if(elemObj != null && selectedVisibleField != "")
	{
		if(elemObj.checked)
		{
			arrVisibleFieldRequired[selectedVisibleField] = 'true';
		}
		else
		{
			arrVisibleFieldRequired[selectedVisibleField] = 'false';
		}
	}

}

function disableFieldPropertyInputs()
{
	var objForm = document.forms[afmInputsFormName];
	//var ObjDistinct_div = document.getElementById(bDistinct_div);
	//var objBDistinctInput = null;
	var ObjRequired_div = document.getElementById(bRequired_div);
	var objBRequiredInput = null;
	
	/*if(objForm != null && ObjDistinct_div != null)
	{
		objBDistinctInput = objForm.elements[bDistinctName];
		objBDistinctInput.checked = 0;
		ObjDistinct_div.disabled = 1;
	}*/
	if(objForm != null && ObjRequired_div != null)
	{
		objBRequiredInput = objForm.elements[bRequiredName];
		objBRequiredInput.checked = 0;
		ObjRequired_div.disabled = 1;
	}
	selectedVisibleField = "";
}

function checkOnFieldProperties()
{
	var objVisibleFields = document.getElementById(visibleFieldsName);
	//var ObjDistinct_div = document.getElementById(bDistinct_div);
	var ObjRequired_div = document.getElementById(bRequired_div);
	var objForm = document.forms[afmInputsFormName];
	//var objBDistinctInput = null;
	var objBRequiredInput = null;
	var bVisible = false;
	if(objForm != null)
	{
		//objBDistinctInput = objForm.elements[bDistinctName];
		objBRequiredInput = objForm.elements[bRequiredName];
	}
	
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
		/*if(ObjDistinct_div != null && ObjDistinct_div.disabled)
		{
			ObjDistinct_div.disabled = 0;
		}*/
		if(ObjRequired_div != null && ObjRequired_div.disabled)
		{
			ObjRequired_div.disabled = 0;
		}
	}
	else
	{
		//if(objBDistinctInput != null)
			//objBDistinctInput.checked = 0;
		if(objBRequiredInput != null)
			objBRequiredInput.checked = 0;
	}
}

function enableFieldPropertyInputs()
{
	var objTarget = document.getElementById(visibleFieldsName);
	var objForm = document.forms[afmInputsFormName];
	//var ObjDistinct_div = document.getElementById(bDistinct_div);
	//var objBDistinctInput = null;
	//var bDistinct = 'false';
	var ObjRequired_div = document.getElementById(bRequired_div);
	var objBRequiredInput = null;
	var bRequired = 'false';
	var bPK = 'false';
	
	if(objForm != null)
	{
		//objBDistinctInput = objForm.elements[bDistinctName];
		objBRequiredInput = objForm.elements[bRequiredName];
	}
	
	//if(ObjDistinct_div != null && ObjDistinct_div.disabled)
	//	ObjDistinct_div.disabled = 0;
	if(ObjRequired_div != null && ObjRequired_div.disabled)
		ObjRequired_div.disabled = 0;
	
	if(objTarget != null)
	{
		for(var i = 0; i < objTarget.length; i++)
		{
			if(objTarget[i].selected)
			{
				selectedVisibleField = objTarget[i].value;
				break;
			}
		}
	}
	
	if(selectedVisibleField != "")
	{
		/*bDistinct = arrVisibleFieldDistinct[selectedVisibleField];
		if(bDistinct != '' && bDistinct == 'true')
			objBDistinctInput.checked = 1;
		else
			objBDistinctInput.checked = 0;
		*/
		bRequired = arrVisibleFieldRequired[selectedVisibleField];		
		if(bRequired != '' && bRequired == 'true')
			objBRequiredInput.checked = 1;
		else
			objBRequiredInput.checked = 0;
	}
	else
	{
		disableFieldPropertyInputs();
	}
}

//called by common-sort-visiblefields.js
function setupMovedFieldProperties(bFlag, objTarget)
{
	if(!bFlag || selectedVisibleField == "")
	{
		disableFieldPropertyInputs();
	}
	if(bFlag)
	{
		var strTableDotFieldName = "";
		if(objTarget != null && objTarget.length >0)
		{
			//getting new adding field name in format like "rm.rm_id"
			strTableDotFieldName = 	objTarget[objTarget.length-1].value		
			//setArrVisibleFieldDistinct(strTableDotFieldName, 'false');
			setArrVisibleFieldRequired(strTableDotFieldName, 'false');
		}
	}
}
//used by sendingDataFromHiddenForm() in common.js to send data to
//server
function gettingRecordsData()
{
	var objTarget = document.getElementById(visibleFieldsName);
	var strReturned = '';
	var arrTemp = new Array();
	var strTableDotFieldName = "";
	var strFieldName = "";
	var strTableName = "";
	//var bDistinct = 'false';
	var bRequired = 'false';
	var docContentField = '';
	if(objTarget != null)
	{
		for(var i = 0; i < objTarget.length; i++)
		{
			strTableDotFieldName = objTarget[i].value;
			if(strTableDotFieldName != "")
			{	
				arrTemp = strTableDotFieldName.split(".");
				strFieldName = arrTemp[1];
				strTableName = arrTemp[0];
				//bDistinct = arrVisibleFieldDistinct[strTableDotFieldName];
				bRequired = arrVisibleFieldRequired[strTableDotFieldName];
				if(typeof bRequired == "undefined" || bRequired == '')
					bRequired = 'false';
				var strTemp = '<field name="'+ strFieldName +'" table="'+strTableName+'" ';
				strTemp = strTemp + ' required="'+bRequired+'" />';
				//XXX: afm_docvers.file_contents must be the
				//last one among visible fields
				if(strTableName=='afm_docvers' && strFieldName=='file_contents'){
					docContentField = strTemp;
				}else{
					strReturned = strReturned + strTemp;
				}
				
			}

		}
	}
	strReturned = "<visibleFields>" + strReturned + docContentField + "</visibleFields>";
	return strReturned;
}




