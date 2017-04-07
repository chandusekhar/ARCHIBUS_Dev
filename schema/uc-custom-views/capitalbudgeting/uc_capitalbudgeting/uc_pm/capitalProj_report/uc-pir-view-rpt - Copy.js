var cpEditController = View.createController('cpEditController', {
    
      afterViewLoad: function()
      {
		
		//myController.openBy = 'V';
         //restrict the projects list
		//no restriction - see all readonly this.projectViewGrid.restriction = "uc_pir.review_by like 'PM'";
	 	 this.processPanels();  //make all panels readOnly
		
       },
	   afterInitialDataFetch:function(){
		
			if (!this.projectViewGrid && View.restriction != null){this.onProjectSelection(View.restriction)}
	   },
	  
	onProjectSelection: function(theRest)
	{
	    //var theRest = row.getRestriction();
	   //show Panels for requestor
	   this.projectInitiationViewSummaryForm.refresh(theRest);
	   //this.projectInitiationSummaryPanel.refresh(theRest);
	   //this.fundingPanel.refresh(theRest);
	  // var docPanelRestriction = new Ab.view.Restriction();
	   //docPanelRestriction.addClause("uc_docs_extension.pkey",theRest["uc_pir.pir_id"],"=");
	  // docPanelRestriction.addClause('uc_docs_extension.table_name','uc_pir');
	   
	  // this.projectInitiationDocsPanel.refresh(docPanelRestriction);
	   //this.campusPlanningPanel.refresh(theRest);
	   var enPanel = View.panels.get("endorserPanel");
	   if (enPanel != undefined) 
		  //this means we have a cp panel
		   enPanel.refresh(theRest);
	   var pmPanel = View.panels.get("ptaGrid");

	   if (pmPanel != undefined) 
	   {
	      //first hide zone column
	      for (var i = 0; i < pmPanel.columns.length; i ++)
	      {
		  if (pmPanel.columns[i].id == 'theZones')
		    pmPanel.removeColumn(i);
          }
		  //this means we have a cp panel
		   pmPanel.refresh(theRest);
	   }

   	   //set the title
	   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	   var rejected_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.rejected_by");
	   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
	   //var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
/* 	   var statusLong = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
	   var theTitle = "In Review By: " + review_byValue;
	   if (status == 'Rej') 
	       theTitle = statusLong + " By: " + review_byValue+ " (" + rejected_by + ")"; 
	   if (review_by == 'C' && status == 'I')
	       theTitle = "Returned to Customer ";
	   if (status == 'PP')
	       theTitle = "Postponed ";
	   if (status == 'AP')
	       theTitle = "Approved - Project: " + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id");
       this.projectInitiationViewSummaryForm.setTitle (theTitle); */ //use the long name from enum list
	   
	      
	   
	  //show buttons
	 this.projectInitiationViewSummaryForm.actions.get("rejectPM").show(false);
	 this.projectInitiationViewSummaryForm.actions.get("postponedPM").show(false);
	 this.projectInitiationViewSummaryForm.actions.get("createprojectPM").show(false);
	 this.projectInitiationViewSummaryForm.actions.get("save").show(false);
	// this.projectInitiationDocsPanel.actions.get("add").show(false);
     this.processPanels();
   },
   
   readOnlyPanelFields: function(panel)
   {
     //get all panel fields
	 var panelFields = panel.fields.items;
	 for (var i =0 ; i< panelFields.length; i++)
	     panelFields[i].config.readOnly = true;
     
   },
   
   processPanels: function ()
   {
     var allPanels = this.view.panels.items;
	 var currType = null;
	 var currPanel = null;
	 var allColumns = null;
	 var theButton = null;
     for (var i = 0; i < allPanels.length; i ++)
     {
	    currType = allPanels[i].type;
		currPanel = this.view.panels.get(allPanels[i].id);
		if (currType == 'form') //then make it readonly
		    	 this.readOnlyPanelFields (currPanel);
		if (allPanels[i].id == 'ptaGrid') //hide columns that are button and checkbox type in the pta grid
		  {
		    allColumns = currPanel.columns;
			theButton = currPanel.actions.get ("request_comments");
            for (var j = 0 ; j < allColumns.length ; j++)
			  {
			     if (allColumns[j].type == 'checkbox' || allColumns[j].type == 'button')
				 {
                          allColumns[j].hidden = true;			
                          if (theButton) {theButton.hidden = true;}
				  }						  
			  }//for
   			if (theButton) {theButton.show(false);}
		  }//if
	 }	 
	 
	// this.hideYearFields();
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
	}
*/
    });
    
   function onProjectSelect(row)
   {
		var test = 1;
        cpEditController.onProjectSelection(row.getRestriction());
   }