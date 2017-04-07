//Modifications:
// 2010/08/11 - JJYCHAN - ISSUE 241: Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
// 2010/12/22 - EWONG - ISSUE 369: Enabled "Add Assignment" button.

function user_form_onload()
{


}

function eMailError()
{
  var rm_id = getInputValue('rm.rm_id');
  var fl_id = getInputValue('rm.fl_id');
  var bl_id = getInputValue('rm.bl_id');

  var rmErrorDescription = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;
  var rmErrorSubject = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;



  var parameters = {
  	Subject: rmErrorSubject,
  	SendTo: "afm@ucalgary.ca ",
  	emailBody: rmErrorDescription
  };
  try {
    result = Workflow.call("AbCommonResources-uc_testEmail", parameters);
  }
  catch (e) {
    Workflow.handleError(e);
  }

  alert("Message Sent!");
  var editPanel = View.getView("rm_form");
	editPanel.closeDialog();
}


function openEmDetails(row) {
	

}

function deleteAssignment(row) {
	
}

