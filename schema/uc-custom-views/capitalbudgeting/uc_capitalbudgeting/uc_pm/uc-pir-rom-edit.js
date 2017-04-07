var cpEditController = View.createController('cpEditController', {
    
      afterViewLoad: function()
      {
         //restrict the projects list
	     this.projectViewGrid.restriction = "uc_pir.review_by like 'ROM'";  
       },
	  
	onProjectSelection: function(row)
	{
		myController.openBy = 'ROM';
	    var theRest = row.getRestriction();
	   //show Panels for requestor
	   this.projectInitiationViewSummaryForm.refresh(theRest);
	   this.projectInitiationSummaryPanel.refresh(theRest);
	   this.fundingPanel.refresh(theRest);
	   //var docPanelRestriction = new Ab.view.Restriction();
	  // docPanelRestriction.addClause("uc_docs_extension.pkey",theRest["uc_pir.pir_id"],"=");
	  // docPanelRestriction.addClause('uc_docs_extension.table_name','uc_pir');
	   //this.projectInitiationDocsPanel.refresh(docPanelRestriction);
	   this.campusPlanningPanel.refresh(theRest);
	   this.campusArchitecturePanel.refresh(theRest);
	   this.pmoPanel.refresh(theRest);
       var cpGridPanel = View.panels.get("cpGridPanelsRaciGrid");
       if (cpGridPanel != undefined) {
           var pirId = theRest['uc_pir.pir_id'];
           if (pirId == null) {
               pirId = -1;
           }
           this.cpGridPanelsRaciGrid.addParameter("pirId", pirId);
           this.cpGridPanelsRaciForm.addParameter("pirId", pirId);
           this.cpGridPanelsDependGrid.addParameter("pirId", pirId);
           this.cpGridPanelsDependForm.addParameter("pirId", pirId);
           this.cpGridPanelsStakeholderGrid.addParameter("pirId", pirId);
           this.cpGridPanelsStakeholderForm.addParameter("pirId", pirId);
           this.cpGridPanelsSuccessCritGrid.addParameter("pirId", pirId);
           this.cpGridPanelsSuccessCritForm.addParameter("pirId", pirId);
           this.cpGridPanelsRiskGrid.addParameter("pirId", pirId);
           this.cpGridPanelsRiskForm.addParameter("pirId", pirId);
           
           try {
               this.cpGridPanelsRaciGrid.refresh();
               this.cpGridPanelsDependGrid.refresh();
               this.cpGridPanelsStakeholderGrid.refresh();
               this.cpGridPanelsSuccessCritGrid.refresh();
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
	   this.projectInitiationViewSummaryForm.actions.get("submitROM").show(true);
	    this.projectInitiationViewSummaryForm.actions.get("save").show(true);
	}

    });
    
   function onProjectSelect(row)
   {
        cpEditController.onProjectSelection(row);
   }