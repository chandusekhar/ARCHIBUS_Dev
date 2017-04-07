var cpEditController = View.createController('cpEditController', {

      afterViewLoad: function()
      {
		myController.openBy = 'CP';
         //restrict the projects list
	  this.projectViewGrid.restriction = "uc_pir.review_by like 'CP%' and uc_pir.status in ('I','PP')";
        //show the review_by field in the projects list on the left
	var theCols = this.projectViewGrid.getColumns();
	for (var i = 0; i < theCols.length; i++)
	    if (theCols[i].fullName == "uc_pir.review_by")
	        theCols[i].hidden = false;

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
	   var pmoPanel = View.panels.get("pmoPanel");
	   if (pmoPanel != undefined) {
		  //this means we have a cp panel
		   this.pmoPanel.refresh(theRest);
		}
	   var enPanel = View.panels.get("endorserPanel");
	   if (enPanel != undefined) {
		  //this means we have a cp panel
		   this.endorserPanel.refresh(theRest);
		}
       var caPanel = View.panels.get("campusArchitecturePanel");
       if (caPanel != undefined) {
          //this means we have a ca panel
           this.caPanel.refresh(theRest);
        }
	   
	   var cpGridPanel = View.panels.get("cpGridPanelsDependGrid");
	   if (cpGridPanel != undefined) {
	       var pirId = theRest['uc_pir.pir_id'];
	       if (pirId == null) {
	           pirId = -1;
	       }
           this.cpGridPanelsDependGrid.addParameter("pirId", pirId);
           this.cpGridPanelsDependForm.addParameter("pirId", pirId);
           this.cpGridPanelsRiskGrid.addParameter("pirId", pirId);
           this.cpGridPanelsRiskForm.addParameter("pirId", pirId);
           
           try {

               this.cpGridPanelsDependGrid.refresh();
               this.cpGridPanelsRiskGrid.refresh();

           }
           catch (ex) {
               
           }
	   }
	   
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
	 var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
	 if (status == 'I' || status == 'PP'){
     switch (review_by){
	   case 'CP':{
			 this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("rejectRequestorCP").show(true);
		     this.projectInitiationViewSummaryForm.actions.get("returnToRequestorCP").show(true);
		     this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittocaCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submitToEndorserCP").show(true);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
            try {
                this.projectViewFormPanelen.show(false);
                this.endorserPanel.show(false);
                this.pmoPanel.show(false);
			 } catch(e) {}
		         break;
		     }
	   case 'CPR':{
			 this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("rejectRequestorCP").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("returnToRequestorCP").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(false);
             this.projectInitiationViewSummaryForm.actions.get("submittocaCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submitToEndorserCP").show(true);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
			 try {
			 this.projectViewFormPanelen.show(false);
			 this.endorserPanel.show(false);
			 this.pmoPanel.show(true);
			 } catch(e) {}
			 break;
		   }
		case 'CPE':{
             this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("rejectRequestorCP").show(true);
		     this.projectInitiationViewSummaryForm.actions.get("returnToRequestorCP").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittocaCP").show(true);
			 this.projectInitiationViewSummaryForm.actions.get("submitToEndorserCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
			 try {
			 this.projectViewFormPanelen.show(true);
			 this.endorserPanel.show(true);
			 this.pmoPanel.show(true);
			 }
			 catch(e) {}
			 break;
		   }
		default:{
		     this.projectInitiationViewSummaryForm.actions.get("rejectRequestorCP").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("returnToRequestorCP").show(false);
		     this.projectInitiationViewSummaryForm.actions.get("submitToROMCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittopmCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submittocaCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("submitToEndorserCP").show(false);
			 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
			 try {
			 this.projectViewFormPanelen.show(false);
			 this.endorserPanel.show(false);
			 this.pmoPanel.show(false);
			 } catch(e) {}
			 break;
		}
	   }//end switch
	  }//end if status = I
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