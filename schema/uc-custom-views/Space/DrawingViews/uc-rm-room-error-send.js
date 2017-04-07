//Modifications:
//20100811 - JJYCHAN - ISSUE 241: Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca

function eMailError()
{
  var rm_id = getInputValue('rm.rm_id');
  var fl_id = getInputValue('rm.fl_id');
  var bl_id = getInputValue('rm.bl_id');
  

  //get User information
  var em_id = "Anonymous"
  var user_name = "Anonymous"
  var user_email = "Anonymous"
  
  var userResult = Workflow.call('AbCommonResources-getUser',{});
  if (userResult.code == 'executed') {
	var user = userResult.data;
	user_name = user.user_name;
	em_id = user.Employee.em_id;
	user_email = user.email;
  };
	
  
  //get inaccuracy description field - returns array
  var inaccuracy = document.getElementsByName('txtInaccuracy')[0].value;
  var inaccuracyType = document.getElementsByName('selInaccuracyType')[0].value;
  
  //compose email.
  var rmErrorDescription = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id + "\n\n" + 
							"Type: " + inaccuracyType + "\n\n" + 
							"Description: " + inaccuracy + "\n\n" +
							"Reported by: \n" + user_name + "\n" + em_id + "\n" + user_email;
  var rmErrorSubject = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;
  

  
  uc_email('ckranjc@ucalgary.ca',
						 'afm@ucalgary.ca',
						 rmErrorSubject,
						 rmErrorDescription,
						 'standard.template');
  
  
  var parameters = {
  	Subject: rmErrorSubject,
  	SendTo: "afm@ucalgary.ca;jjychan@ucalgary.ca",
  	emailBody: rmErrorDescription
  };
  try {
    result = Workflow.call("AbCommonResources-uc_testEmail", parameters);
  }
  catch (e) {
    Workflow.handleError(e);
  }
  
  alert("Message Sent! Thank you for your assistance.");
  var editPanel = View.getView("rm_sendError");
	editPanel.closeDialog();
}
