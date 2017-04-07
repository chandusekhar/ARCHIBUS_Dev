/**
 * JS controller for the business logic cookbook examples.
 * 
 * See LogicExampleHandlers.java for business logic implementation details.
 */
View.createController('logicCookbook', {

	/**
	 * Primary key of the new work order created by business logic on the server.
	 */
    newWorkOrderId: null,

    /**
     * The view calls this event listener after the view is completely loaded and the view panels display their initial data.
     */
    afterInitialDataFetch: function() {
        this.prepareForTest();
    },
    
    /**
     * Call a workflow rule that (intentionally) throws an exception, and display the error message.
     */
    cookbookWorkOrderConsole_onThrowException: function() {
    	// use this try/catch block every time you call a workflow rule
        try {
            var woId = this.cookbookWorkOrderConsole.getFieldValue('wo.wo_id');
            Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-logProgressAndThrowException', woId);
            // put the code that handles normal business logic results here - it will be executed if there is no exception
        } catch (e) {
        	// put the code that handles the exception here
            Workflow.handleError(e);
        }
    },

    /**
     * Call a long-running job and display the pop-up progress indicator.
     */
    cookbookWorkOrderConsole_onStartCounter: function() {
    	// use this try/catch block every time you call a job
        try {
            var size = parseInt($('size').value);
            // start the job; the Workflow.startJob() method returns the new job ID;
            var jobId = Workflow.startJob('AbSolutionsLogicAddIns-JobExamples-runSimpleCounter', size);
            
            // while the job is running on the server, display the pop-up progress indicator - it will track the job progress using the job ID
            View.openJobProgressBar('Counting', jobId);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Call a rule that returns a single record: work order.
     */
    cookbookWorkOrderConsole_onGetWorkOrderByPrimaryKey: function() {
        this.prepareForTest();
        try {
        	this.newWorkOrderId = parseInt(this.cookbookWorkOrderConsole.getFieldValue('wo.wo_id'));

        	// pass the work order ID as a parameter
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordByPrimaryKey', this.newWorkOrderId);
            // if the Java method returns the DataRecord Java object, the result.dataSet JS property contains the Ab.data.DataRecord JS object
            var woRecord = result.dataSet;
            if (woRecord) {
            	// display the record in the form panel
            	this.cookbookWorkOrderForm.setRecord(woRecord);
                this.cookbookWorkOrderForm.show(true);
                
                this.cookbookWorkOrderConsole.enableAction('updateWorkOrder', true);
                this.cookbookWorkOrderConsole.enableAction('saveWorkOrder', true);
            } else {
            	// no exception thrown, but there is no such record in the database
                View.alert('Record not found');
            }
        } catch (e) {
        	// exception thrown
            Workflow.handleError(e);
        }
    },
    
    /**
     * Creates a new record (work order) with default values, displays it in the form panel.
     */
    cookbookWorkOrderConsole_onCreateWorkOrder: function() {
        this.prepareForTest();
        try {
        	// call a rule to create the new record
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-createNewRecord');
            
            // the rule returns the work order ID value
            this.newWorkOrderId = result.value;
            
            // display the new record in the form panel.
            this.cookbookWorkOrderForm.refresh('wo.wo_id = ' + this.newWorkOrderId);
            this.cookbookWorkOrderForm.show(true);
            
            this.cookbookWorkOrderConsole.enableAction('updateWorkOrder', true);
            this.cookbookWorkOrderConsole.enableAction('saveWorkOrder', true);
            
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Update the work order: set the ID to hard-coded value (99).
     */
    cookbookWorkOrderConsole_onUpdateWorkOrder: function() {
        this.prepareForTest();
        try {
        	// pass the new ID to the rule
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-updateRecord', this.newWorkOrderId, 99);
            
            // display the updated record in the form panel
            this.cookbookWorkOrderForm.refresh('wo.wo_id = ' + this.newWorkOrderId);
            this.cookbookWorkOrderForm.show(true);
            
            this.cookbookWorkOrderConsole.enableAction('updateWorkOrder', true);
            this.cookbookWorkOrderConsole.enableAction('saveWorkOrder', true);
            
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Update the work order: save values entered by the user in the form panel.
     */
    cookbookWorkOrderConsole_onSaveWorkOrder: function() {
        this.prepareForTest();
        try {
        	// get the new ID from the form (we will use it to refresh the form panel)
            var woId = this.cookbookWorkOrderForm.getFieldValue('wo.wo_id');
            
            // get the record with new values from the form (with values encoded suing the ARCHIBUS neutral format)
            var record = this.cookbookWorkOrderForm.getOutboundRecord();
            
            // pass the record to the rule
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-saveRecord', record);
            
            // re-display the record in the form panel
            this.cookbookWorkOrderForm.refresh('wo.wo_id = ' + woId);
            this.cookbookWorkOrderForm.show(true);
            
            this.cookbookWorkOrderConsole.enableAction('updateWorkOrder', true);
            this.cookbookWorkOrderConsole.enableAction('saveWorkOrder', true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Get records from the rule using the date restriction.
     */
    cookbookWorkOrdersConsole_onGetWorkOrdersUsingDateRestriction: function() {
        this.prepareForTest();
        try {
        	// get the date value entered by the user in the console panel
            var dateAssigned = this.cookbookWorkOrderConsole.getFieldValue('wo.date_assigned');
            
            // pass the date value to the rule (it will use the date to create a parsed restriction in Java)
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsUsingDateRestriction', dateAssigned);
            
            // display the records returns by the rule
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Get records from the rule using the SQL restriction formatted on the server.
     */
    cookbookWorkOrdersConsole_onGetWorkOrdersUsingSqlRestriction: function() {
        this.prepareForTest();
        try {
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsUsingSqlRestriction');
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Get records from the rule using the SQL restriction formatted on the server using a parameter passed from the client.
     */
    cookbookWorkOrdersConsole_onGetWorkOrdersUsingSqlRestrictionWithParameters: function() {
        this.prepareForTest();
        try {
        	// get the date from the console
            var dateAssigned = this.cookbookWorkOrderConsole.getFieldValue('wo.date_assigned');
            
            // pass the date as a parameter to the rule (it will insert the parameter into an SQL restriction in Java)
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsUsingSqlRestrictionWithParameters', dateAssigned);
            
            // display the records returned by the rule
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Call the rule that calculates an aggregated value, and display the returned value.
     */
    cookbookWorkOrdersConsole_onGetWorkOrderStatistics: function() {
        this.prepareForTest();
        try {
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getStatistics');
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Call the rule that runs an expensive data query, and display the returned query result.
     */
    cookbookWorkOrdersConsole_onQueryWorkOrders: function() {
        this.prepareForTest();
        try {
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-queryRecords');
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Update records selected by the user in the grid using a rule.
     */
    cookbookWorkOrderGrid_onUpdateSelectedWorkOrders: function() {
        this.prepareForTest();
        try {
        	// get selected records from the grid
        	var records = [];
        	var dataSource = this.cookbookWorkOrderDS;
        	this.cookbookWorkOrderGrid.gridRows.each(function(row) {
        		if (row.isSelected()) {
	        		// get Ab.data.Record object for selected grid row 
	        		var record = row.getRecord();
	        		// convert record values into ARCHIBUS neutral format
	        		record = dataSource.processOutboundRecord(record);
	        		records.push(record);
        		}
        	});
            
            // update records
            for (var i = 0; i < records.length; i++) {
            	var record = records[i];
            	
            	// update the description field (copy previous value into the oldValues)
            	var description = record.getValue('wo.description');
            	record.setOldValue('wo.description', description);
            	record.setValue('wo.description', 'Updated -- ' + description);
            	
            	// copy PK values into the oldValues - otherwise the record will not be saved
            	record.setOldValue('wo.wo_id', record.getValue('wo.wo_id'));
            }
            
            // save updated records
            var dataSet = new Ab.data.DataSetList();
            dataSet.addRecords(records);
            Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-updateRecords', dataSet);
            
            // display updated records
            this.cookbookWorkOrderGrid.setRecords(records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Display records returned by the rule that uses default VPA restrictions.
     */
    cookbookVpaConsole_onGetWorkOrdersWithVPA: function() {
        this.prepareForTest();
        try {
            var dateAssigned = this.cookbookWorkOrdersConsole.getFieldValue('wo.date_assigned');
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsWithVpa', dateAssigned);
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Display records returned by the rule that uses no VPA restrictions.
     */
    cookbookVpaConsole_onGetWorkOrdersWithoutVPA: function() {
        this.prepareForTest();
        try {
            var dateAssigned = this.cookbookWorkOrdersConsole.getFieldValue('wo.date_assigned');
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsWithoutVpa', dateAssigned);
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Display records returned by the rule that uses custom VPA restrictions.
     */
    cookbookVpaConsole_onGetWorkOrdersWithCustomVPA: function() {
        this.prepareForTest();
        try {
            var dateAssigned = this.cookbookWorkOrdersConsole.getFieldValue('wo.date_assigned');
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getRecordsWithCustomVpa', dateAssigned);
            this.cookbookWorkOrderGrid.setRecords(result.dataSet.records);
            this.cookbookWorkOrderGrid.show(true);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
   
    /**
     * Helper method that sets view properties before each business logic method invocation.
     */
    prepareForTest: function() {
        this.cookbookWorkOrderForm.show(false);
        this.cookbookWorkOrderGrid.show(false);
        
        this.cookbookWorkOrderConsole.enableAction('updateWorkOrder', false);
        this.cookbookWorkOrderConsole.enableAction('saveWorkOrder', false);
    }
});