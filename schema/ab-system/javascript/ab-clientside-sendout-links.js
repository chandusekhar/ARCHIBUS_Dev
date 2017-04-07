/************************************************
	ab-clientside-sendout-links.js
	used by ab-clientside-sendout-links.xsl to handle
	send a view url link out by client-side method
 ************************************************/
//overwritten by the value in ab-clientside-sendout-links.xsl
var messageLinkTo = "Link To:";

//called when page is loaded into browser
function onPageLoaded(strLinkTo)
{
	//localized value for messageLinkTo
	messageLinkTo = strLinkTo;
	//put url link for specified axvew into form's body area
	if(opener != null && opener.afmActionViewName != null && opener.afmAbsoluteAppPath != null)
	{
		//viewName : "/archibus/schema/wr-editform.axvw" => must be "wr-editform.axvw"
		var viewName = opener.afmActionViewName;
		//remove "/archibus/schema/"
		viewName = getViewName(viewName, "/");
		//or remove "\archibus\schema\"
		viewName = getViewName(viewName, "\\");
		//path : "http://localhost:8080/archibus"
		var path = opener.afmAbsoluteAppPath;
		var objDataForm = document.afmInputsForm;
		var strURL = path + "/" + viewName;
		if(Debug)
		{
			alert("View's URL Link: "+strURL);
		}
		if(objDataForm != null && path != "" && viewName != "")
		{
			objDataForm.elements['body'].value = strURL;
			if(opener.afmViewTitle != null && opener.afmViewTitle != "")
				objDataForm.elements['subject'].value = messageLinkTo + " " + opener.afmViewTitle;
		}
	}
}
//called in ab-clientside-sendout-links.xsl
function sendMail()
{
	var objDataForm = document.afmInputsForm;
	var objHiddenForm = document.forms["hiddenEmailForm"];
	var bReturned	= false;
	var strMailto	= "";
	var strCC		= "";
	var strSubject	= "";
	var strBody		="";
	if(objDataForm != null)
	{
		//forming the content
		strMailto = objDataForm.elements['to'].value;
		strMailto = strMailto;
		strCC = objDataForm.elements['cc'].value;
		if(strCC != "")
			strCC = "?cc=" + strCC;
		strSubject = objDataForm.elements['subject'].value;
		if(strSubject != "")
			strSubject = "&subject=" + strSubject;
		strBody = objDataForm.elements['body'].value;

		strBody = "&body=" + strBody;


		
		if(strMailto=="")
		{
			bReturned = false;
			objDataForm.elements['to'].focus();
		}
		else
			bReturned = true;
	}
	if(bReturned && objHiddenForm !=  null)
	{
		var strAction = "MAILTO:"+strMailto+strCC+strSubject+strBody;
		objHiddenForm.action = strAction;
		if(Debug)
		{
			alert("action : "+ strAction);
		}
		objHiddenForm.submit();
		bReturned = true;
	}
		
	return bReturned;
}
//remove all removedCharacter like "/" from input string
//if input string is like "/archibus/schema/wr-editform.axvw"
//output string will be like "wr-editform.axvw"
function getViewName(strName, removedCharacter)
{
	var pos = -1;
	var strTemp =strName;
	pos = strTemp.indexOf(removedCharacter);
	while(pos >= 0)
	{
		strTemp = strTemp.substring(pos+1);
		pos = strTemp.indexOf(removedCharacter);
	}
	return strTemp;
}