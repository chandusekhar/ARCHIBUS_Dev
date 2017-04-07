var custEditController = View.createController('custEditController', {
    
    afterViewLoad: function()
    {
		myController.openBy = 'C';
        //show only this user's projects
		var theRequestor = "";
		try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
        this.projectViewGrid.restriction = "uc_pir.requestor = '"+theRequestor+"'";
    },
	
	onProjectSelection: function(row)
	{
	
		var theRest = row.getRestriction();
		//show Panels for requestor
	   this.projectInitiationViewSummaryForm.refresh(theRest);
	   this.projectInitiationSummaryPanel.refresh(theRest);
	   this.fundingPanel.refresh(theRest);
	  // var docPanelRestriction = new Ab.view.Restriction();
	  // docPanelRestriction.addClause("uc_docs_extension.pkey",theRest["uc_pir.pir_id"],"=");
	  // docPanelRestriction.addClause('uc_docs_extension.table_name','uc_pir');
	  // this.projectInitiationDocsPanel.refresh(docPanelRestriction);
	   
	   
	   //set the title
	   var theTitle = ""
		if (this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") != ""){
			theTitle = "Project Approved [" + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") + "]"
		} else {
		   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
		   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
		   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
		   var status_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
		   if (status_byValue == 'Returned') {
				theTitle = status_byValue + " To: " + review_byValue;
		   } else {
				theTitle = status_byValue + " By: " + review_byValue;
		   }
		}
		this.projectInitiationViewSummaryForm.setTitle (theTitle); //use the long name from enum list
		/*
	   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	   var rejected_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.rejected_by");
	   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
	   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
	   var statusLong = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
	   var theTitle = "In Review By: " + review_byValue;
	   switch (status) 
	   {
	   
	      case 'Can': 
		    {
			  theTitle = statusLong + " By " + review_byValue+ " (" + rejected_by + ")"; 
			  break;
			}
		  case 'NED':
		    {
			theTitle = statusLong;
			break;
			}
		    
	      case 'Rej':
		     {
			   theTitle = statusLong + " By " + review_byValue+ " (" + rejected_by + ")";
			   break;
			 }
		  
		  case 'Ret':
		     {
  		      theTitle = statusLong;
			  break;
			 }
		   
		   case 'PP':
		     {
			  theTitle = "Postponed ";
			  break;
			 }
	       
		   case 'AP':
		     {
			 theTitle = "Approved - Project: " + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id");
			 break;
			 }		   
			 
	   }//end switch
	   

	   this.projectInitiationViewSummaryForm.setTitle (theTitle); 
	   
	   */

		if (review_by != 'C' )
		{
		    //hide from to years
		    //this.hideYearFields();
		    this.projectInitiationViewSummaryForm.actions.get("submitForApprovalCustomer").show(false);
		    this.projectInitiationViewSummaryForm.actions.get("save").show(false);
		    this.projectInitiationViewSummaryForm.actions.get("cancelRequestCustomer").show(false);
		}
		else
		{
		    //this.showYearFields();
		    //show Submit For Approval only if the review_by is C and is not Cancelled
			if (status != 'Can')
			{
		      this.projectInitiationViewSummaryForm.actions.get("submitForApprovalCustomer").show(true);
		      this.projectInitiationViewSummaryForm.actions.get("save").show(true);
		      if (status.toLowerCase() != 'rej')
		         this.projectInitiationViewSummaryForm.actions.get("cancelRequestCustomer").show(true);
			 }
			else
			{
			  this.projectInitiationViewSummaryForm.actions.get("submitForApprovalCustomer").show(false);
		      this.projectInitiationViewSummaryForm.actions.get("save").show(false);
	          this.projectInitiationViewSummaryForm.actions.get("cancelRequestCustomer").show(false);
			}
		 }
        }/*,
	
	hideYearFields: function()
	{
		 document.getElementById("fundingPanel_primary_labelCell").style.display = "none";
		 document.getElementById("from_primary").style.display = "none";
		 document.getElementById("fundingLabel").style.display = "none";
		 document.getElementById("from_secondary").style.display = "none";
		 document.getElementById("from_tertiary").style.display = "none";
		 document.getElementById("to_primary").style.display = "none";
		 document.getElementById("to_secondary").style.display = "none";
		 document.getElementById("to_tertiary").style.display = "none";
		 document.getElementById("fromp").style.display = "none";
		 document.getElementById("froms").style.display = "none";
		 document.getElementById("fromt").style.display = "none";
		 document.getElementById("top").style.display = "none";
		 document.getElementById("tos").style.display = "none";
		 document.getElementById("tot").style.display = "none";
	},
	
       showYearFields: function()
	{
		 document.getElementById("fundingPanel_primary_labelCell").style.display = "inline";
		 document.getElementById("from_primary").style.display = "inline";
		 document.getElementById("fundingLabel").style.display = "inline";
		 document.getElementById("from_secondary").style.display = "inline";
		 document.getElementById("from_tertiary").style.display = "inline";
		 document.getElementById("to_primary").style.display = "inline";
		 document.getElementById("to_secondary").style.display = "inline";
		 document.getElementById("to_tertiary").style.display = "inline";
		 document.getElementById("fromp").style.display = "inline";
		 document.getElementById("froms").style.display = "inline";
		 document.getElementById("fromt").style.display = "inline";
		 document.getElementById("top").style.display = "inline";
		 document.getElementById("tos").style.display = "inline";
		 document.getElementById("tot").style.display = "inline";
	}
*/
    });
    
   function onProjectSelect(row)
   {
        custEditController.onProjectSelection(row);
   }