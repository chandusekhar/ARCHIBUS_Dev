/**
 * @author 
 */

var abRiskMsdsDefCompanyController = View.createController('abRiskMsdsDefCompanyController', {
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // the form should be in the new record mode
        this.abMsdsDefCompanyForm.newRecord = true;
    },
    
    /**
     * This function is called after the initial data fetch.
     */
    afterInitialDataFetch: function() {
        // hide the form
        this.abMsdsDefCompanyForm.show(false, true);
    },
   
    /**
     * Saves new employee standard record, hides the form, and refreshes the grid.
     */
    abMsdsDefCompanyForm_onSave: function() {    	 	
        this.abMsdsDefCompanyForm.save();
        //var company = this.abMsdsDefCompanyForm.getFieldValue('company.company');        
        //var alt_phone = this.abMsdsDefCompanyForm.getFieldValue('company.alt_phone');
        
        //if(company != '' && alt_phone != ''){  
        	this.abMsdsDefCompanyForm.show(false, true);
        	this.abMsdsDefCompanyGrid.refresh();
        //}
    },
    
    /**
     * Cancels and hides the form.
     */
    abMsdsDefCompanyForm_onCancel: function() {
        this.abMsdsDefCompanyForm.show(false, true);
    },
    
    /**
     * Shows the form.
     */
    abMsdsDefCompanyGrid_onAdd: function() {
        this.abMsdsDefCompanyForm.show(true, true);
    },
    
    /**
     * Event listener for the per-row Select button.
     */
    abMsdsDefCompanyGrid_onSelect: function(row, action) {
        View.parameters.callback(row.getRecord());
        View.closeThisDialog();
    }
});

