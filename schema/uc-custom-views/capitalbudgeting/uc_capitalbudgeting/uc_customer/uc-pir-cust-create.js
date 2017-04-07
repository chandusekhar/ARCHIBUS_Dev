var custCreateController = View.createController('custCreateController', {

      afterInitialDataFetch: function()
      {
       //hide panels
       this.projectInitiationViewSummaryForm.show(true);
       this.projectInitiationSummaryPanel.show(true);
       this.fundingPanel.show(true);
	   this.doc_grid.show(true);
       //this.projectInitiationDocsPanel.show(true);
	   
      },
      
      afterViewLoad: function()
      {
		myController.openBy = 'C';
        this.projectInitiationViewSummaryForm.newRecord = true;
		this.projectInitiationSummaryPanel.newRecord= true;
		//var docPanelRestriction = new Ab.view.Restriction();
	    //docPanelRestriction.addClause("uc_docs_extension.pkey","-1","=");
		//docPanelRestriction.addClause('uc_docs_extension.table_name','uc_pir');
	    //this.projectInitiationDocsPanel.refresh(docPanelRestriction);
		this.fundingPanel.newRecord = true;
		
		//set title and unhide the submit request action
		this.projectInitiationViewSummaryForm.setTitle ("Create Projects Initiative");
		this.projectInitiationViewSummaryForm.actions.get("submitCustomer").show(true);
		this.projectInitiationViewSummaryForm.actions.get("saveCustomer").show(true);
        this.projectInitiationViewSummaryForm.actions.get("newCustomer").show(false);
       }

    });