function eMailError()
{
  var rm_id = getInputValue('rm.rm_id');
  var fl_id = getInputValue('rm.fl_id');
  var bl_id = getInputValue('rm.bl_id');
  
  var rmErrorDescription = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;
  var rmErrorSubject = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;
  
  
  
  var parameters = {
  	Subject: rmErrorSubject,
  	SendTo: "afm.records@ucalgary.ca ",
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
