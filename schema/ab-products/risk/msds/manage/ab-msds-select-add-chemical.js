/**
 * @author 
 */

var abRiskMsdsDefChemicalController = View.createController('abRiskMsdsDefChemicalController', {
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // the form should be in the new record mode
        this.abMsdsDefChemicalForm.newRecord = true;
    },
    
    /**
     * This function is called after the initial data fetch.
     */
    afterInitialDataFetch: function() {
        // hide the form
        this.abMsdsDefChemicalForm.show(false, true);
    },
   
    /**
     * Saves new employee standard record, hides the form, and refreshes the grid.
     */
    abMsdsDefChemicalForm_onSave: function() {    	 	
        this.abMsdsDefChemicalForm.save();
        //var chemical_id = this.abMsdsDefChemicalForm.getFieldValue('msds_chemical.chemical_id');

        //if(chemical_id != '' ){  
        	this.abMsdsDefChemicalForm.show(false, true);
        	this.abMsdsDefChemicalGrid.refresh();
        //}
    },
    
    /**
     * Cancels and hides the form.
     */
    abMsdsDefChemicalForm_onCancel: function() {
        this.abMsdsDefChemicalForm.show(false, true);
    },
    
    /**
     * Shows the form.
     */
    abMsdsDefChemicalGrid_onAdd: function() {
        this.abMsdsDefChemicalForm.show(true, true);
    },
    
    /**
     * Event listener for the per-row Select button.
     */
    abMsdsDefChemicalGrid_onSelect: function(row, action) {
        View.parameters.callback(row.getRecord());
        View.closeThisDialog();
    }
});

