/************************************************
	ab-lookup-password.js
	used by ab-lookup-password.xsl to handle password look up form
 ************************************************/
//this variable is for user's selected project name
var strUserID = "";
if(opener.strUserId != null)
	strUserID = opener.strUserId;

//called when page is loaded into browser
function onPageLoaded()
{
	var objForm = document.afmInputsForm;
	
	if(objForm != null)
	{
		objForm.elements['user_id'].value = strUserID;
	}
}

//called by sendingDataFromHiddenForm() in common.js to send request to
//server
function gettingRecordsData()
{
	var objForm = document.afmInputsForm;
	var strReturned = "";
	if(objForm != null)
	{
		strUserID = objForm.elements['user_id'].value;
		strReturned = "<record";
		strReturned = strReturned + ' user_name="'+strUserID+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}


