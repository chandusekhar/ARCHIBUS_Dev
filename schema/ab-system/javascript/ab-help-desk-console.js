/************************************************
	ab-help-desk-console.js
 ************************************************/
function onQuery()
{
	var objForm	  = document.forms[afmInputsFormName];
	var objSorted = objForm.elements["sorted"];
	var objStatus = objForm.elements["status"];
	var objStatus_approve = objForm.elements["status_approve"];
	var objStatus_complete = objForm.elements["status_complete"];
	var objStatus_assigned = objForm.elements["status_assigned"];
	var strSorted = "";
	var strRestriction = "";
	var strResult = "";
	for(var i=0; i < objSorted.length; i++)
	{
		if(objSorted[i].checked)
		{
			strSorted = objSorted[i].value;
			break;
		}
	}
	if(strSorted != "")
	{
		var temp_array = new Array();
		temp_array = strSorted.split(",");
		if(temp_array != null)
		{
			for(var i=0; i<temp_array.length; i++)
			{
				if(temp_array[i] != null && temp_array[i] != "")
				{
					strResult = strResult + '<field name="' + temp_array[i] + '" table="wr" unqiue="true" ascend="true"/>' 
				}
				
			}
		}

	}
	if(strResult != "")
	{
		strResult = '<order>'+ strResult + '</order>'
	}
	for(var i=0;i<objStatus.length; i++)
	{
		if(objStatus[i].checked)
		{
			strStatus = objStatus[i].value;
			strRestriction = strRestriction + '<clause relop="AND" op="=" value="'+strStatus+'" >';
			strRestriction = strRestriction + '<field name="status" table="wr"/></clause>'
			break;
		}
	}
	for(var i=0;i<objStatus_approve.length; i++)
	{
		if(objStatus_approve[i].checked)
		{
			strStatus = objStatus_approve[i].value;
			strRestriction = strRestriction + '<clause relop="AND" op="=" value="'+strStatus+'">';
			strRestriction = strRestriction + '<field name="status_approve" table="wr"/></clause>'
			break;
		}
	}
	for(var i=0;i<objStatus_complete.length; i++)
	{
		if(objStatus_complete[i].checked)
		{
			strStatus = objStatus_complete[i].value;
			strRestriction = strRestriction + '<clause relop="AND" op="=" value="'+strStatus+'">';
			strRestriction = strRestriction + '<field name="status_complete" table="wr" /></clause>'
			break;
		}
	}
	for(var i=0;i<objStatus_assigned.length; i++)
	{
		if(objStatus_assigned[i].checked)
		{
			strStatus = objStatus_assigned[i].value;
			strRestriction = strRestriction + '<clause relop="AND" op="=" value="'+strStatus+'" >';
			strRestriction = strRestriction + '<field name="status_assigned" table="wr"/></clause>'
			break;
		}
	}
	if(strRestriction != "")
	{ 
		strRestriction = '<restriction type="parsed">' + strRestriction + '</restriction>';
		strResult = strResult + strRestriction;
	}
	alert(strResult);

}


function onNew()
{


}