/*********************************************************************
 JavaScript File:ab-wr-request-response.js
*********************************************************************/
//var arrFieldsInformation = new Array();
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
		var obj_records_value_form = document.forms["records_value_form"];
		var arrReferredByAnotherFrame1 = objTreeFrame.arrReferredByAnotherFrame1;
		if(arrReferredByAnotherFrame1 != null)
		{

			toEmailAddress = arrReferredByAnotherFrame1["toEmailAddress"];
			fromEmailAddress = arrReferredByAnotherFrame1["fromEmailAddress"];
			copyEmailAddress = arrReferredByAnotherFrame1["copyEmailAddress"];
			if(toEmailAddress != null && toEmailAddress != "")
			{
				//generating email message
				strSubject = document.getElementById("Subject").innerHTML +" " + obj_records_value_form.elements['wr.wr_id'].value;
				//sending email
				sendMail(toEmailAddress, copyEmailAddress, strSubject,strBody)
			}
		}
	}
}

function sendMail(strMailto, strCC, strSubject, strBody)
{
    //data body:
    {
        strBody = "";
        strBody = strBody + document.getElementById("wr_id").name + ": " + document.getElementById("wr_id").value + "\n";
        strBody = strBody + document.getElementById("requestor").name + ": " + document.getElementById("requestor").value + "\n";
          strBody = strBody + document.getElementById("phone").name + ": " + document.getElementById("phone").value + "\n";

      strBody = strBody + document.getElementById("prob_type").name + ": " + document.getElementById("prob_type").value + "\n";
          strBody = strBody + document.getElementById("eq_id").name + ": " + document.getElementById("eq_id").value + "\n";
        strBody = strBody + document.getElementById("bl_id").name + ": " + document.getElementById("bl_id").value + "\n";
          strBody = strBody + document.getElementById("fl_id").name + ": " + document.getElementById("fl_id").value + "\n";
        strBody = strBody + document.getElementById("rm_id").name + ": " + document.getElementById("rm_id").value + "\n";
          strBody = strBody + document.getElementById("location").name + ": " + document.getElementById("location").value + "\n";
        strBody = strBody + document.getElementById("priority").name + ": " + document.getElementById("priority").value + "\n";
          strBody = strBody + document.getElementById("date_requested").name + ": " + document.getElementById("date_requested").value + "\n";
        strBody = strBody + document.getElementById("time_requested").name + ": " + document.getElementById("time_requested").value + "\n";

        strBody = strBody + document.getElementById("description").name + ": " + document.getElementById("description").value + "\n";

      }
	var objHiddenForm = document.forms["hiddenEmailForm"];
	if(strCC != "")
		strCC = "?cc=" + escape(strCC);
	if(strSubject != "")
		strSubject = "&subject=" + strSubject;
	strBody = "&body=" + escape(strBody);

	if(strMailto!="")
	{
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



