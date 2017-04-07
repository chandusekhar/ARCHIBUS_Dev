//florin
var returnRejectController = View.createController('returnRejectController', {
  afterViewLoad:function()
  {
    //hide bars in buttons
    var allButtonSeparators = Ext.DomQuery.select("*[class = ytb-sep]");
	for (var i=0; i< allButtonSeparators.length; i ++ )
	       allButtonSeparators[i].style.display = "none";

	//show / hide buttons
    var whichButton = this.view.parameters.button;

	switch(whichButton)
	{
	  case 'returnToRequestor':
	      {
		   this.returnPanel.actions.get('return').show(true);
		   this.returnPanel.actions.get('reject').show(false);
           this.returnPanel.actions.get('cancel').show(false);
		   this.returnPanel.actions.get('sendEndorser').show(false);
		   this.returnPanel.actions.get('sendNotEndorsed').show(false);
		   try
		   {
			  document.getElementById("returnPanel_uc_pir.endorser").style.display = "none";
			  document.getElementById("action_gen0").style.display = "none";
			  document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "none";
			  document.getElementById("returnPanel.uc_pir.endorser_selectValue").style.display = "none";
			  document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "none";
		   }
		   catch(e) {}
		     this.returnPanel.setTitle("Return Comments");
		   break;
		  }
	  case 'endorserReturn':
	     {
		     document.getElementById("returnPanel_uc_pir.endorser").style.display = "inline";
			 document.getElementById("returnPanel_uc_pir.endorser_labelCell").innerHTML = 'Endorser:<span id="uc_pir..endorser.required_star" name="uc_pir..endorser.required_star" style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>'
			 document.getElementById("action_gen0").style.display = "inline";
		     this.returnPanel.actions.get('return').show(false);
			 this.returnPanel.actions.get('reject').show(false);
             this.returnPanel.actions.get('cancel').show(false);
			 this.returnPanel.actions.get('sendEndorser').show(true);
			 this.returnPanel.actions.get('sendNotEndorsed').show(false);
			 //make endorser a required field and show it
			 //document.getElementById("returnPanel.uc_pir.endorser_selectValue").style.display = "inline";
			 //document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "inline";
			 this.returnPanel.setTitle("Send for Endorsement");
		     break;
		 }
	   case 'notEndorsed':
	    {
		     this.returnPanel.actions.get('return').show(false);
			 this.returnPanel.actions.get('reject').show(false);
             this.returnPanel.actions.get('cancel').show(false);
			 this.returnPanel.actions.get('sendEndorser').show(false);
			 this.returnPanel.actions.get('sendNotEndorsed').show(true);
			 this.returnPanel.setTitle("Reason for Not Endorsing");
			 try
			 {
			 document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "none";
			 
			 document.getElementById("action_gen0").style.display = "none";
			 document.getElementById("returnPanel_uc_pir.endorser").style.display = "none";
			 document.getElementById("returnPanel.uc_pir.endorser_selectValue").style.display = "none";
			 }
			 catch(e) {}
			 //make endorser a required field and show it
			 this.returnPanel.setTitle("Not Endorsed Comments");
			 
		    break;
		}
       case 'cancelPAG':
       {
             this.returnPanel.actions.get('return').show(false);
             this.returnPanel.actions.get('reject').show(true);
             this.returnPanel.actions.get('cancel').show(true);
             this.returnPanel.actions.get('sendEndorser').show(false);
             this.returnPanel.actions.get('sendNotEndorsed').show(false);
             try
             {
             document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "none";
             document.getElementById("action_gen0").style.display = "none";
             document.getElementById("returnPanel_uc_pir.endorser").style.display = "none";
             document.getElementById("returnPanel.uc_pir.endorser_selectValue").style.display = "none";
             }
             catch(e) {}
             this.returnPanel.setTitle("Reason for Declining Request");
             break;
       }
	   default:
	   {
			 this.returnPanel.actions.get('return').show(false);
			 this.returnPanel.actions.get('reject').show(true);
             this.returnPanel.actions.get('cancel').show(false);
			 this.returnPanel.actions.get('sendEndorser').show(false);
			 this.returnPanel.actions.get('sendNotEndorsed').show(false);
			 try
			 {
			 document.getElementById("returnPanel_uc_pir.endorser_labelCell").style.display = "none";
			 document.getElementById("action_gen0").style.display = "none";
			 document.getElementById("returnPanel_uc_pir.endorser").style.display = "none";
			 document.getElementById("returnPanel.uc_pir.endorser_selectValue").style.display = "none";
			 }
			 catch(e) {}
			 this.returnPanel.setTitle("Reason for Declining Request");
			 break;
	   }
	}//end switch
  },

  /*
    Sets the status to “Rej” {Rejected} and rejected_by to logged in em_id,
    saves the dialog refreshes opener page removing the project from the list and details panel.
    An email is sent to the requestor.
    Subject = “Project Rejected”  Body = “Your Project Request: <Project Name>  has been rejected.”
  */
  returnPanel_onReject: function()
  {
        //update status to Rej and rejected_by
	this.returnPanel.setFieldValue("uc_pir.status","Rej");
	var theRequestor = "";
	try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
	this.returnPanel.setFieldValue("uc_pir.rejected_by",theRequestor);

	//set return comments field value
	var theComm = document.getElementById('theComments').value;
	this.returnPanel.setFieldValue("uc_pir.reject_comments",theComm);
    
	//save panel:
	this.returnPanel.save();
    
    //Set WR to 'Rejected'
    var workRequest = this.returnPanel.getFieldValue("uc_pir.req_wr_num");
    if(workRequest != ""){
        var wfResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', {
            tableName: 'wr',
            fieldNames: toJSON(['activity_log_id']),
            restriction: toJSON('wr_id=' + workRequest)
        });
        if(wfResult.code != 'executed')
            return false;
        var activityLogId = wfResult.data.records[0]['wr.activity_log_id'];
        
        Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
            tableName: 'wr',
            fields: toJSON({'wr.wr_id': workRequest, 'wr.status': 'Rej'})});
        Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
            tableName: 'activity_log',
            fields: toJSON({'activity_log.activity_log_id': activityLogId, 'activity_log.status': 'REJECTED'})});
    }
    
	//remove the project from projectlist and details panel
    this.refreshOpenerView();

	//TO DO: email
	this.sendUCEmail("rejectedRequest");

	//close the dialog
	this.view.closeThisDialog();
  },
  
  /*
  sets the review_by = “C” {Customer},
  saves the dialog refreshes opener page removing the project from the list and details panel.
  An email is sent to the requestor.  Subject=”Project Returned for more info”
  Body= “Business Owner” or “Campus Plannining ”  “ has sent your Project Request back for additional information.”
  */
  returnPanel_onReturn: function()
  {
    //update status to Rej and rejected_by
	this.returnPanel.setFieldValue("uc_pir.review_by","C");
	var theComm = document.getElementById('theComments').value;
	this.returnPanel.setFieldValue("uc_pir.return_comments",theComm);
	this.returnPanel.setFieldValue("uc_pir.status","Ret");
	//save panel:
	this.returnPanel.save();
	//remove the project from projectlist and details panel
    this.refreshOpenerView();

	//TO DO: email
   this.sendUCEmail("returnedRequest");

	//close the dialog
	this.view.closeThisDialog();
  },

    /*
   sets the review_by = “En” {Endorser},
   saves the dialog refreshes opener page removing the project from the list and details panel.
   An email is sent to the requestor.  Subject=”Project Requires Endorsement”
   Body= “Project requires Endorsement. Please sign into Archibus and navigate to ...”
  */
  returnPanel_onSendEndorser: function()
  {

    var commentsBlank = false;
    //make endorser required field and update validation
	this.returnPanel.clearValidationResult();
	var theComm = document.getElementById('theComments').value;
	this.returnPanel.setFieldValue("uc_pir.return_comments",theComm);

	var fieldValue = this.returnPanel.getFieldValue("uc_pir.endorser") ;
	var commentsValue = this.returnPanel.getFieldValue("uc_pir.return_comments") ;
	if (fieldValue == "")
	   this.returnPanel.addInvalidField("uc_pir.endorser", "Endorser is a  required field.");
    if (commentsValue == "")
	{
	   commentsBlank = true;
	 //  var t = document.getElementById('theComments');
	   //t.setCustomValidity("Required");
	  // this.returnPanel.addInvalidField("uc_pir.return_comments", "Comments are required.");
	  View.showMessage('Comments are required.');
	  }
	this.returnPanel.validateFields();
	if (!this.returnPanel.validationResult.valid || commentsBlank)
				  return false;
    //set review_by = "EN" and save the record
	this.returnPanel.setFieldValue("uc_pir.review_by","EN");
	//save panel:
	this.returnPanel.save();
    //refreshes opener page
	this.refreshOpenerView();

    //TO DO: send the email - page 25 on tech doc
    this.sendUCEmail("endorser");

    //close the dialog
	this.view.closeThisDialog();

  },

    returnPanel_onSendNotEndorsed: function()
  {

  //  this.returnPanel_onReject();

    //update status to Rej and rejected_by
	this.returnPanel.setFieldValue("uc_pir.status","NED");
	var theRequestor = "";
	try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
	this.returnPanel.setFieldValue("uc_pir.rejected_by",theRequestor);

	//set return comments field value
	var theComm = document.getElementById('theComments').value;
	this.returnPanel.setFieldValue("uc_pir.reject_comments",theComm);
    
	//save panel:
	this.returnPanel.save();
    
    //Set WR to 'Rejected'
    var workRequest = this.returnPanel.getFieldValue("uc_pir.req_wr_num");
    if(workRequest != ""){
        var wfResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', {
            tableName: 'wr',
            fieldNames: toJSON(['activity_log_id']),
            restriction: toJSON('wr_id=' + workRequest)
        });
        if(wfResult.code != 'executed')
            return false;
        var activityLogId = wfResult.data.records[0]['wr.activity_log_id'];
        
        Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
            tableName: 'wr',
            fields: toJSON({'wr.wr_id': workRequest, 'wr.status': 'Rej'})});
        Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', {
            tableName: 'activity_log',
            fields: toJSON({'activity_log.activity_log_id': activityLogId, 'activity_log.status': 'REJECTED'})});
    }
    
	//remove the project from projectlist and details panel
        this.refreshOpenerView();

	//TO DO: email
	this.sendUCEmail("rejectedRequest");

	//close the dialog
	this.view.closeThisDialog();


 // alert ('Ask Bryan what this is supposed to do ');
    /*var commentsBlank = false;
    //make endorser required field and update validation
	this.returnPanel.clearValidationResult();
	var theComm = document.getElementById('theComments').value;
	this.returnPanel.setFieldValue("uc_pir.return_comments",theComm);
	var commentsValue = this.returnPanel.getFieldValue("uc_pir.return_comments") ;
    if (commentsValue == "")
	{
	   commentsBlank = true;
	   var t = document.getElementById('theComments');
	   t.setCustomValidity("Required");
	   this.returnPanel.addInvalidField("uc_pir.return_comments", "Comments are required.");
	  }
	this.returnPanel.validateFields();
	if (!this.returnPanel.validationResult.valid || commentsBlank)
				  return false;
    //set review_by = "EN" and save the record
	this.returnPanel.setFieldValue("uc_pir.review_by","EN");
	//save panel:
	this.returnPanel.save();
    //refreshes opener page
	this.refreshOpenerView();

    //TO DO: send the email - page 25 on tech doc

    //close the dialog
	this.view.closeThisDialog();
	*/
  },

  refreshOpenerView: function()
  {
    var openerView = this.view.getOpenerView();
	var projectsListPanel = openerView.panels.get("projectViewGrid");
	projectsListPanel.refresh(); // refreshing the panel should remove the rejected record
	openerView.panels.get("projectInitiationViewSummaryForm").show(false);
	openerView.panels.get("projectInitiationSummaryPanel").show(false);
	openerView.panels.get("fundingPanel").show(false);
	//openerView.panels.get("projectInitiationDocsPanel").show(false); //original name of the panel - the panel name was changed by somebody else
	try {
	       openerView.panels.get("doc_grid").show(false);
	       openerView.panels.get("a").show(false);
	       openerView.panels.get("appendicesPanel").show(false);
	       openerView.panels.get("cpGridPanelsDependGrid").show(false);
	       openerView.panels.get("cpGridPanelsRiskGrid").show(false);
       } catch (e){};
	openerView.panels.get("campusPlanningPanel").show(false);

	try
	{
	  openerView.panels.get("endorserPanel").show(false);
	  openerView.panels.get("ptaGrid").show(false);
	}
	catch (e) {}
  },

   sendUCEmail: function(emailtype)
	{
	   var theEmId = this.returnPanel.getFieldValue("uc_pir.requestor");
	   var targetEmail = BRG.Common.getDataValue("em","email","em_id='" + theEmId + "'");

	   switch (emailtype)
	   {
	     case 'rejectedRequest' :
		     {
			   try {
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
				   'UC_PIR_REJECTED_EMAIL_BODY','UC_PIR_REJECTED_EMAIL_SUBJECT','uc_pir','pir_id',this.returnPanel.getFieldValue('uc_pir.pir_id'),
				   'uc-view-my-requests.axvw', targetEmail);
				 }
				 catch (ex) {
				    alert ('There was an error when trying to send the Rejected Request email. ' + ex.code + '  ' + ex.message + ' . Email is going to ' + targetEmail);
				 }
			   break;
			 }

		  case 'returnedRequest':
		      {
			   try {
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
				   'UC_PIR_RETURNED_EMAIL','UC_PIR_RETURNED_EMAIL','uc_pir','pir_id',this.returnPanel.getFieldValue('uc_pir.pir_id'),
				   'uc-view-my-requests.axvw', targetEmail);  // Project Returned for more info
				 }
				 catch (ex) {
				    alert ('There was an error when trying to send the Rejected Request email. ' + ex.code + '  ' + ex.message+ ' . Email is going to ' + targetEmail);
				 }
			    break;
			  }

		 case 'endorser':
		      {
			   try {
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbCapitalBudgeting', 'UC_EMAIL_WFR',
				   'UC_PIR_ENDORSER_EMAIL_BODY','UC_PIR_ENDORSER_EMAIL_SUBJECT','uc_pir','pir_id',this.returnPanel.getFieldValue('uc_pir.pir_id'),
				   'uc-view-my-requests.axvw', targetEmail); // Project Requires Endorsement
				 }
				 catch (ex) {
				    alert ('There was an error when trying to send the Endorsement Required email. ' + ex.code + '  ' + ex.message+ ' . Email is going to ' + targetEmail);
				 }
			    break;
			  }

	  }//switch
  }
});
