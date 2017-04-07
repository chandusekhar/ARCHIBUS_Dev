var cpEditController = View.createController('cpEditController', {

      afterViewLoad: function()
      {
		myController.openBy = 'EN';
         //restrict the projects list
		 var theRequestor = "";
		 try { theRequestor = this.view.user.employee.id; } catch(e) {} ;
	     this.projectViewGrid.restriction = "uc_pir.review_by like 'EN' and uc_pir.status = 'I' and uc_pir.endorser ='"+ theRequestor + "'";
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
	   this.campusPlanningPanel.refresh(theRest);
       this.appendicesPanel.refresh(theRest);
	   this.pmoPanel.refresh(theRest);
	   this.endorserPanel.refresh(theRest);
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
		this.projectInitiationViewSummaryForm.setTitle (theTitle)

	 //show return and reject actions
	 var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	 var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
	 switch (status)
	 {
	   case 'I':
	       {
		     this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("endorserdEn").show(true);
		     this.projectInitiationViewSummaryForm.actions.get("notendorserdEn").show(true);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
		     break;
		   }
		default:
		{
		     this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("endorserdEn").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("notendorserdEn").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(false);
			 break;
		}
	  }//end switch
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
        cpEditController.onProjectSelection(row);
   }