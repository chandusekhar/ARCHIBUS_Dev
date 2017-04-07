/******************************************************************
	Javascript Api to set up frames for Tgrps.
 ******************************************************************/
//used by sendingDataFromHiddenForm() in common.js to send data to
//server
function gettingRecordsData()
{
	var objForm = document.forms[afmInputsFormName];
	var strReturned = '';
	//In html form named by afmInputsFormName must have only one kind of
	//elements <select> to hold frames list, otherwise
	//objForm.elements[i] is not working here
	for(var i = 0; i < objForm.elements.length; i++)
	{
		strReturned = strReturned + "<record";
		strReturned = strReturned + ' frame="'+ objForm.elements[i].value+'" ';
		strReturned = strReturned + "/>";
	}
	return strReturned;
}

