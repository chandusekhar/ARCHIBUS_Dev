/**********************************************
   Yong Shao
   4-4-2005
***********************************************/
var objForm;
function refresh(strXML)
{
	if(objErrorMsgWindow == null || objErrorMsgWindow.closed){
		sendingDataFromHiddenForm('',strXML, '_self', '', false, '');
	}
}

function stopJobs(strXML, formName, stopMessage)
{
	objForm = document.forms[formName];
	var bSelected = false;
	if(objForm!=null)
	{
		var objBSelectCheckbox = objForm.elements["stop"];
		if(objBSelectCheckbox != null){
			if(objBSelectCheckbox.length != null)
			{
				//existing multiple rows?
				for(var i = 0; i < objBSelectCheckbox.length; i++)
				{
					if( objBSelectCheckbox[i].checked)
					{
						bSelected = true;
						break;
					}
				}
			}
			else
			{
				//existing only one row? it seems objBSelectCheckbox.length
				//is not working in this case(bug in IE or Javascript
				//engine?).
				if(objBSelectCheckbox.checked)
					bSelected = true;
			}
		}
	}
	if(bSelected)
	{
		var bstop=confirm(stopMessage);
		if(bstop)
			sendingDataFromHiddenForm("", strXML, "_self", "" ,true, "");
	}
}

function gettingRecordsData()
{
	var strReturned = '';
	if(objForm!=null)
	{
		var objBSelectCheckbox = objForm.elements["stop"];
		var selectedJobId = "";
		if(objBSelectCheckbox != null){
			if(objBSelectCheckbox.length != null)
			{
				//existing multiple rows?
				for(var i = 0; i < objBSelectCheckbox.length; i++)
				{
					if( objBSelectCheckbox[i].checked)
					{
						selectedJobId = selectedJobId + objBSelectCheckbox[i].value + ";";
					}
				}
			}
			else
			{
				//existing only one row? it seems objBSelectCheckbox.length
				//is not working in this case(bug in IE or Javascript
				//engine?).
				if(objBSelectCheckbox.checked)
					selectedJobId = selectedJobId + objBSelectCheckbox.value;
			}
		}
	}

	
	if(selectedJobId != "")
	{
		strReturned = "<record";
		strReturned = strReturned + ' ruleKeys="'+selectedJobId+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;

}
