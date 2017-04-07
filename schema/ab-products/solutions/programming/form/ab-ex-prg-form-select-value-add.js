
var formController = View.createController('selectValueController', {
    
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // the form should be in the new record mode
        this.prgFormSelectValueAdd_form.newRecord = true;
    },
    
    /**
     * This function is called after the initial data fetch.
     */
    afterInitialDataFetch: function() {
        // hide the form
        this.prgFormSelectValueAdd_form.show(false, true);
    },
    
    /**
     * Saves new employee standard record, hides the form, and refreshes the grid.
     */
    prgFormSelectValueAdd_form_onSave: function() {
        this.prgFormSelectValueAdd_form.save();
        this.prgFormSelectValueAdd_form.show(false, true);
        this.prgFormSelectValueAdd_grid.refresh();
    },
    
    /**
     * Cancels and hides the form.
     */
    prgFormSelectValueAdd_form_onCancel: function() {
        this.prgFormSelectValueAdd_form.show(false, true);
    },
    
    /**
     * Shows the form.
     */
    prgFormSelectValueAdd_grid_onAdd: function() {
        this.prgFormSelectValueAdd_form.show(true, true);
    },
    
    /**
     * Event listener for the per-row Select button.
     */
    prgFormSelectValueAdd_grid_onSelect: function(row, action) {
        View.parameters.callback(row.getRecord());
        View.closeThisDialog();
    }
});