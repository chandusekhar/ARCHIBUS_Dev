/**
 * Controller.
 */
var requestWizardController = View.createController('requestWizard', {
    
    // Ab.data.Record
    request: null,
    
    /**
     * Called after the view is loaded, before initial data fetch.
     */
    afterViewLoad: function() {
        this.requestForm.setInstructions(getMessage('instructionStep1'));
        this.duplicateRequestsGrid.setInstructions(getMessage('instructionStep2'));
        this.requestReport.setInstructions(getMessage('instructionStep3'));
        this.savedRequestReport.setInstructions(getMessage('instructionStep4'));

        // example of logging to debug console
        View.log('Wizard initialized', 'info', this.id);
    },
    
    // ----------------------- UI update methods --------------------------------------------------
    
    /**
     * Selects specified wizard step.
     * @param {step} Step index, 0..N.
     */
    selectStep: function(step) {
        this.tabs.selectTab(step);

        switch (step) {
            case 1: this.showDuplicateRequests(); break;
            case 2: this.showNewRequest(); break;
            case 3: this.showSavedRequest(); break;
        };
    },

    /**
     * Shows duplicate requests based on the values filled in by the user.
     */
    showDuplicateRequests: function() {
        var requestType = this.request.getValue('activity_log.activity_type');
        var requestLocation = this.request.getValue('activity_log.location');
        
        this.duplicateRequestsGrid.addParameter('requestType', requestType);
        this.duplicateRequestsGrid.addParameter('requestLocation', requestLocation);
        this.duplicateRequestsGrid.refresh();
        
        if (!this.hasDuplicates()) {
            this.selectStep(2);
        }
    },
    
    /**
     * Shows new request.
     */
    showNewRequest: function() {
        this.requestReport.setRecord(this.request);
    },
    
    /**
     * Shows saved request.
     */
    showSavedRequest: function() {
        this.savedRequestReport.setRecord(this.request);
    },
    
    /**
     * 
     */
    hasDuplicates: function() {
        return (this.duplicateRequestsGrid.gridRows.getCount() > 0);
    },
    
    /**
     * Closes this wizard dialog or tab.
     */
    closeWizard: function() {
        // if the wizard is displayed in a dialog, close it
        View.closeThisDialog();
        
        // if the wizard is displayed in a dynamic tab page, close it
        if (View.parentTab) {
            View.parentTab.parentPanel.closeTab(View.parentTab.name);
        }
    },
    
    // ----------------------- event listeners ----------------------------------------------------

    requestForm_onNext: function() {
        if (this.requestForm.canSave()) {
            this.request = this.requestForm.getRecord();
            this.selectStep(1);
        }
    },

    requestForm_onCancel: function() {
        this.closeWizard();
    },
    
    duplicateRequestsGrid_onBack: function() {
        this.selectStep(0);
    },
    
    duplicateRequestsGrid_onNext: function() {
        this.selectStep(2);
    },

    duplicateRequestsGrid_onCancel: function() {
        this.closeWizard();
    },
    
    requestReport_onBack: function() {
        if (this.hasDuplicates()) {
            this.selectStep(1);
        } else {
            this.selectStep(0);
        }
    },
    
    requestReport_onConfirm: function() {
        if (this.createRequest()) {
            this.selectStep(3);
        }
    },

    requestReport_onCancel: function() {
        this.closeWizard();
    },
    
    savedRequestReport_onFinish: function() {
        var mainPanel = View.getOpenerView().panels.get('mainPanel');
        this.closeWizard();
		// refresh the main panel when it is visible to properly locate the miniconsole search palete 
        if (mainPanel) {
            mainPanel.refresh();
        }
    },
    
    // ----------------------- business logic methods ---------------------------------------------
    
    /**
     * Validates required fields.
     */
    requestForm_beforeSave: function() {
        var valid = true;
        
        var request = this.requestForm.getRecord();
        
        var requestType = request.getValue('activity_log.activity_type');
        if (requestType == '') {
            this.requestForm.fields.get('activity_log.activity_type').setInvalid(getMessage('errorRequestType'));
            valid = false;
        }

        var requestSummary = request.getValue('activity_log.action_title');
        if (requestSummary == '') {
            this.requestForm.fields.get('activity_log.action_title').setInvalid(getMessage('errorRequestSummary'));
            valid = false;
        }

        return valid;
    },
    
    /**
     * Creates new request based on values entered by the user in the Request Form.
     */
    createRequest: function() {
        result = true;
        try {
            // set request fields on the client, and use DataSource
            this.request.setValue('activity_log.status', 'REQUESTED');
            this.request.setValue('activity_log.created_by', View.user.name);
            var pkeys = this.requestDataSource.saveRecord(this.request);

            // alternative - use custom WFR that sets the status and requested_by fields
            // request = this.requestDataSource.processOutboundRecord(request);
            // var pkeys = Workflow.call('AbSolutionsWorkflow-helpDeskPlanRequest', request).dataSet;
            
            // save new PK value into the request record
            this.request.setValue('activity_log.activity_log_id', pkeys.getValue('activity_log.activity_log_id'));
            
        } catch (e) {
            var message = getMessage('errorCreateRequest');
            
            // always log errors to the debug console
            View.log(message + ': ' + e.message, 'error', this.id);
            
            // display error message to the user
            View.showMessage('error', message, e.message, e.data);
            
            result = false;
        }
        return result;
    }
});
