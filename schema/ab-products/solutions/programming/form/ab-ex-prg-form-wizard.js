
/**
 * Example wizard controller class. 
 */
var wizardController = View.createController('formWizard', {
    
    // true if the employee requires parking space
    requiresParking: false,

    /**
     * Controller lifecycle callback function.
     * Called after the view is loaded but before the initial data fetch.
     * Use to set up data variables and event handlers.
     */
    afterViewLoad: function() {
        // add onclick event listener to requiresParking checkbox
        // since the checkbox is a custom HTML field, its event listener is not auto-wired
        Ext.get('requiresParking').on('click', this.requiresParking_onClick, this);
        
        // update the UI based on the initial model state
        this.onModelChange();
    },
    
    /**
     * This function is called when the data model changes, to update parts of UI that depend on it.
     */
    onModelChange: function() {
        this.prgFormWizard_tabs.enableTab('prgFormWizard_parking', this.requiresParking);
        this.prgFormWizard_parkingReport.show(this.requiresParking, true);
    },
    
    /**
     * Event handler for requiresParking checkbox.
     */
    requiresParking_onClick: function() {
        this.requiresParking = Ext.get('requiresParking').dom.checked;
        this.onModelChange();
    },
    
    /**
     * Event handler for Employee form Next button.
     */
    prgFormWizard_employeeForm_onNext: function() {
        if (this.requiresParking) {
            this.prgFormWizard_tabs.selectTab('prgFormWizard_parking');
        } else {
            this.displayForReview();
            this.prgFormWizard_tabs.selectTab('prgFormWizard_review');
        }
    },
    
    /**
     * Event handler for Parking form Next button.
     */
    prgFormWizard_parkingForm_onNext: function() {
        this.displayForReview();
        this.prgFormWizard_tabs.selectTab('prgFormWizard_review');
    },

    /**
     * Event handler for Parking form Back button.
     */
    prgFormWizard_parkingForm_onBack: function() {
        this.prgFormWizard_tabs.selectTab('prgFormWizard_employee');
    },

    /**
     * Saves employee and parking records.
     */
    prgFormWizard_employeeReport_onSave: function() {
        /**
         * 16.3 way: two separate WFR calls, simple to program but not safe:
         * if the 2nd transaction fails, the 1st cannot be rolled back
         * 
        this.prgFormWizard_employeeForm.save();
        if (this.requiresParking) {
            this.prgFormWizard_parkingForm.save();
        }
        */
        
        var employeeRecord = this.prgFormWizard_employeeForm.getOutboundRecord();
        var parkingRecord = this.prgFormWizard_parkingForm.getOutboundRecord();
        
        // save both records using custom WFR
        // TODO: consider upgrading standard saveDataRecord WFR to save multiple records
        try {
            Workflow.callMethod('AbSolutionsLogicAddIns-LogicExamples-saveEmployeeAndParking', 
                employeeRecord, parkingRecord, this.requiresParking);
            
            View.alert(getMessage('messageSave'));
            
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Cancel the editing in all forms and start over.
     */
    prgFormWizard_employeeReport_onBack: function() {
        if (this.requiresParking) {
            this.prgFormWizard_tabs.selectTab('prgFormWizard_parking');
        } else {
            this.prgFormWizard_tabs.selectTab('prgFormWizard_employee');
        }
    },
    
    /**
     * Helper function to display employee and parking records in read-only format.
     */
    displayForReview: function() {
        // copy record from employee form to employee report
        var employeeRecord = this.prgFormWizard_employeeForm.getRecord();
        this.prgFormWizard_employeeReport.setRecord(employeeRecord);
        
        if (this.requiresParking) {
            // copy record from parking form to parking report
            var parkingRecord = this.prgFormWizard_parkingForm.getRecord();
            this.prgFormWizard_parkingReport.setRecord(parkingRecord);
        }
        
        this.prgFormWizard_parkingReport.show(this.requiresParking);
    }
});