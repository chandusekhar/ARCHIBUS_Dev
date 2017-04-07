/*********************************************************************
 JavaScript File:ab-em-setup-or-move-edit-respone.js
*********************************************************************/
var arrFieldsInformation = new Array();
var arrFieldsValues = new Array();

////////var arrRecordsInformation = new Array();

function onPageLoad()
{
	var toEmailAddress = "";
	var fromEmailAddress = "";
	var copyEmailAddress = "";
	var strSubject = "";
	var strBody = "";

	//get treeFrame frame object: getFrameObject() in common.js
	var objTreeFrame = getFrameObject(window, "treeFrame");
	if(objTreeFrame!=null)
	{
		var arrReferredByAnotherFrame1 = objTreeFrame.arrReferredByAnotherFrame1;
		if(arrReferredByAnotherFrame1 != null)
		{

			toEmailAddress = arrReferredByAnotherFrame1["toEmailAddress"];
			fromEmailAddress = arrReferredByAnotherFrame1["fromEmailAddress"];
			copyEmailAddress = arrReferredByAnotherFrame1["copyEmailAddress"];
			if(toEmailAddress != null && toEmailAddress != "")
			{
				//generating email message
				strSubject = 'New Move Request: ' + arrFieldsValues['mo.mo_id'] ;

				//strBody = 'This new Move Request was just
				//created:%0D%0A%0D%0A';
				if(arrFieldsValues['mo.mp_id'] !="")
					strBody = strBody + arrFieldsInformation['mo.mp_id'] + ': ' + arrFieldsValues['mo.mp_id'] +'\n';
				if(arrFieldsValues['mo.mo_id'] !="")
					strBody = strBody + arrFieldsInformation['mo.mo_id'] + ': ' + arrFieldsValues['mo.mo_id'] +'\n';
				if(arrFieldsValues['mo.requestor'] !="")
					strBody = strBody + arrFieldsInformation['mo.requestor'] + ': ' + arrFieldsValues['mo.requestor']  +'\n';
				if( arrFieldsValues['mo.em_id'] !="")
					strBody = strBody + arrFieldsInformation['mo.em_id'] + ': ' + arrFieldsValues['mo.em_id']  +'\n';

				//if(arrRecordsInformation['mo.from_bl_id']!="")
					strBody = strBody + arrFieldsInformation['mo.from_bl_id'] + ': ' + arrFieldsValues['mo.from_bl_id']  +'\n';
				//if(arrRecordsInformation['mo.from_fl_id']!="")
					strBody = strBody + arrFieldsInformation['mo.from_fl_id'] + ': ' + arrFieldsValues['mo.from_fl_id'] +'\n';
				//if(arrRecordsInformation['mo.from_rm_id']!="")
					strBody = strBody + arrFieldsInformation['mo.from_rm_id'] + ': ' + arrFieldsValues['mo.from_rm_id'] +'\n';
				//if(arrRecordsInformation['mo.from_rm_id']!="")
				strBody = strBody + arrFieldsInformation['mo.to_bl_id'] + ': ' + arrFieldsValues['mo.to_bl_id'] +'\n';
				strBody = strBody + arrFieldsInformation['mo.to_fl_id'] + ': ' + arrFieldsValues['mo.to_fl_id'] +'\n';
				strBody = strBody + arrFieldsInformation['mo.to_rm_id'] + ': ' + arrFieldsValues['mo.to_rm_id'] +'\n';
				if(arrFieldsValues['mo.date_to_perform'] !="")
					strBody = strBody + arrFieldsInformation['mo.date_to_perform'] + ': ' + arrFieldsValues['mo.date_to_perform'] +'\n';
				if(arrFieldsValues['mo.time_to_perform'] !="")
					strBody = strBody + arrFieldsInformation['mo.time_to_perform'] + ': ' + arrFieldsValues['mo.time_to_perform'] +'\n';
				if(arrFieldsValues['mo.date_requested'] !="")
					strBody = strBody + arrFieldsInformation['mo.date_requested'] + ': ' + arrFieldsValues['mo.date_requested'] +'\n';
				if(arrFieldsValues['mo.time_requested'] !="")
					strBody = strBody + arrFieldsInformation['mo.time_requested'] + ': ' + arrFieldsValues['mo.time_requested'] +'\n';
				if(arrFieldsValues['mo.date_issued'] !="")
					strBody = strBody + arrFieldsInformation['mo.date_issued'] + ': ' + arrFieldsValues['mo.date_issued'] +'\n';
				if(arrFieldsValues['mo.time_issued'] !="")
					strBody = strBody + arrFieldsInformation['mo.time_issued'] + ': ' + arrFieldsValues['mo.time_issued'] +'\n';
				if(arrFieldsValues['mo.description'] !="")
					strBody = strBody + arrFieldsInformation['mo.description'] + ": " +arrFieldsValues['mo.description'] ;

				//sending email
				sendMail(toEmailAddress, copyEmailAddress, strSubject,strBody)
			}
		}
	}
}

function sendMail(strMailto, strCC, strSubject, strBody)
{
	var objHiddenForm = document.forms["hiddenEmailForm"];
	if(strCC != "")
		strCC = "?cc=" + escape(strCC);
	if(strSubject != "")
		strSubject = "&subject=" + escape(strSubject);
	strBody = "&body=" + escape(strBody);

	if(strMailto!="")
	{
                strMailto = escape(strMailto);
		var strAction = "MAILTO:"+strMailto+strCC+strSubject+strBody;
		objHiddenForm.action = strAction;
		if(Debug)
		{
			alert("action : "+ strAction);
		}
		objHiddenForm.submit();
		//parent.location=strAction;
	}
}



