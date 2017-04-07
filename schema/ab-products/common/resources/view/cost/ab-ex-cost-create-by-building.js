
/**
 * Unless the Java Script code is trivial (i.e. a couple of simple functions), the recommended 
 * practice is to use the Controller object pattern, as shown in this example.
 * 
 * The Controller is a Java Script object and can have properties (variables) and event handlers (functions).
 * There must be a comma after each property and each event handle r- except the last one.
 */
View.createController('costCreateByBuilding', {
    
    // ----------------------- properties ---------------------------------------------------------
	
    /**
     * string: bl_id of the building selected by the user in the Buildings grid.
     */
	selectedBuildingId: null,
	
	/**
	 * Ab.data.DataRecord: cost record selected by the user in the Scheduled Costs grid.  
	 */
	selectedCostRecord: null,
	
	// ----------------------- event handlers -----------------------------------------------------
	
	/**
	 * This event handler is called by the view after the view loading and initial data fetch 
	 * for all panels is complete. 
	 */
	afterInitialDataFetch: function() {
        // disable the Create Scheduled Cost button until the user selects the Building
		this.scheduledCostGrid.enableAction('createCost', false);
	},
	
	/**
	 * This event handler is called by the Buildings grid when the user selects a row.
     * @param {row} Ab.grid.Row object for selected grid row.
	 */
	buildingGrid_onSelectBuilding: function(row) {
	    // enable the Create Scheduled Cost button
        this.scheduledCostGrid.enableAction('createCost', true);

        // get and store the selected building ID
		this.selectedBuildingId = row.getRecord().getValue('bl.bl_id');
		
		// show scheduled costs for the selected building
        var restriction = new Ab.view.Restriction();
        restriction.addClause('cost_tran_sched.bl_id', this.selectedBuildingId);
        this.scheduledCostGrid.refresh(restriction);

        // show actual costs for the selected building
		restriction = new Ab.view.Restriction();
		restriction.addClause('cost_tran.bl_id', this.selectedBuildingId);
		this.actualCostGrid.refresh(restriction);
	},
	
	/**
	 * This event handler is called by the Create Scheduled Cost button.
	 */
	scheduledCostGrid_onCreateCost: function() {
	    // load the default "new" record into the [hidden] Scheduled Cost form panel
	    // pre-set the selected building ID on the form
        var restriction = new Ab.view.Restriction();
        restriction.addClause('cost_tran_sched.bl_id', this.selectedBuildingId);
		this.createCostForm.refresh(restriction, true);
		
		// display the Scheduled Cost form in a dialog window
		this.createCostForm.showInWindow({
            width: 500,
            height: 350,
            closeButton: false
        });
	},
	
	/**
	 * This event handler is called by the Create button of the Create Scheduled Cost form.
	 */
	createCostForm_onCreateCostConfirm: function() {
	    // try to save the form record
		if (this.createCostForm.save()) {
		    // close the dialog
			this.createCostForm.closeWindow();
			// refresh the list of scheduled costs to show the new cost
			this.scheduledCostGrid.refresh();
		}
    },
	
    /**
     * This event handler is called by the Close button on the Create Scheduled Cost form.
     */
    createCostForm_onCreateCostCancel: function() {
        // close the dialog
        this.createCostForm.closeWindow();
    },
    
    /**
     * This event handler is called by the Approve row buttons of the Scheduled Costs grid panel.
     * @param {row} Ab.grid.Row object for selected grid row.
     * @param {action} Ab.view.Action object for the row button.
     */
	scheduledCostGrid_onApproveCost: function(row, action) {
        // get and store the cost record for the selected row
		this.selectedCostRecord = row.getRecord();

		// load the selected cost record into the [hidden] Approve Cost form panel
		var costId = this.selectedCostRecord.getValue('cost_tran_sched.cost_tran_sched_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('cost_tran_sched.cost_tran_sched_id', costId);
        this.approveCostForm.refresh(restriction);
        
        // display the Approve Cost form panel in a dialog window
        this.approveCostForm.showInWindow({
			width: 500,
			height: 350,
            closeButton: false
		});
	},
	
    /**
     * This event handler is called by the Approve button of the Approve Cost form.
     */
	approveCostForm_onApproveCostConfirm: function() {
		try {
		    // get the cost record with values updated by the user from the Approve Cost form
			var costRecord = this.approveCostForm.getRecord();

			// process the record, converting locale-specific values such as dates, times, and numbers
			// into locale-neutral values that can be sent to a workflow rule
            var costRecord = this.scheduledCostDS.processOutboundRecord(costRecord);
			
            // call the custom workflow rule to approve the cost,
            // pass the Cost ID and the Date Paid as rule parameters
			var costId = costRecord.getValue('cost_tran_sched.cost_tran_sched_id');
			var datePaid = costRecord.getValue('cost_tran_sched.date_paid');
			Workflow.callMethod('AbCommonResources-CostService-approveScheduledCost', costId, datePaid);
			
	        // close the dialog
		    this.approveCostForm.closeWindow();
		    
            // refresh the list of scheduled costs so that it does not show the approved cost
            this.scheduledCostGrid.refresh();
            
            // refresh the list of actual costs to show the approved cost
            this.actualCostGrid.refresh();
		} catch (e) {
			Workflow.handleError(e);
		}
	},
    
    /**
     * This event handler is called by the Cancel button of the Scheduled Cost form.
     */
    approveCostForm_onApproveCostCancel: function() {
        // close the dialog
        this.approveCostForm.closeWindow();
    }
	
	/**
	 * Note: there is no comma after the last method. 
	 */
});
