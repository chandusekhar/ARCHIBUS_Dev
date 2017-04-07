var cpEditController = View.createController('cpEditController', {
    
      afterViewLoad: function()
      {
         //restrict the projects list
	  this.projectViewGrid.restriction = "uc_pir.review_by like 'PM' and uc_pir.project_id is null and uc_pir.status in ('AP')";
       },
	  
	onProjectSelection: function(row)
	{
		myController.openBy = 'PM';
	    var theRest = row.getRestriction();
	   //show Panels for requestor
	   this.projectInitiationViewSummaryForm.refresh(theRest);
	   this.projectInitiationSummaryPanel.refresh(theRest);
	   this.fundingPanel.refresh(theRest);
	   //var docPanelRestriction = new Ab.view.Restriction();
	   //	   docPanelRestriction.addClause("uc_docs_extension.pkey",theRest["uc_pir.pir_id"],"=");
	   //docPanelRestriction.addClause('uc_docs_extension.table_name','uc_pir');
	   //this.projectInitiationDocsPanel.refresh(docPanelRestriction);
	   this.campusPlanningPanel.refresh(theRest);
	   this.pmoPanel.refresh(theRest);
	   
	   var enPanel = View.panels.get("endorserPanel");
	   if (enPanel != undefined) 
		  //this means we have a cp panel
		   enPanel.refresh(theRest);
	   
	   var campusArchitecturePanel = View.panels.get("campusArchitecturePanel");
	   if (campusArchitecturePanel != undefined) { 
	       campusArchitecturePanel.refresh(theRest);
	   }

	   
       var pagPanel = View.panels.get("pagPanel");
       if (pagPanel != undefined)  {
           this.pagPanel.refresh(theRest);
       }
	   
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
	  
	  //show buttons
     this.projectInitiationViewSummaryForm.actions.get("postponedPM").show(true);
     this.projectInitiationViewSummaryForm.actions.get("returnPM").show(true);
	 this.projectInitiationViewSummaryForm.actions.get("createprojectPM").show(true);
	 this.projectInitiationViewSummaryForm.actions.get("save").show(true);
   }

    });
    
   function onProjectSelect(row)
   {
        cpEditController.onProjectSelection(row);
   }