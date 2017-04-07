/**
 * @author Eric_Maxfield@archibus.com 
 */

var abBasScopeDefZoneFormController = View.createController('abBasScopeDefZoneFormController', {
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // the form should be in the new record mode
        this.abBasScopeDefZoneForm.newRecord = true;
    },
       
    /**
     * Saves new zone record, hides the form, and refreshes the grid.
     */
    abBasScopeDefZoneForm_onSave: function() {    	 	
        this.abBasScopeDefZoneForm.save();
        this.abBasScopeDefZoneForm.setCollapsed(true);
       	this.abBasScopeDefZoneGrid.refresh();
    },
    
    /**
     * Cancels and hides the form.
     */
    abBasScopeDefZoneForm_onCancel: function() {
    	this.abBasScopeDefZoneForm.setCollapsed(true);
    },
    
    /**
     * Shows the form.
     */
    abBasScopeDefZoneGrid_onAdd: function() {
        this.abBasScopeDefZoneForm.setCollapsed(false);
    },
    
    /**
     * Event listener for the per-row Select button.
     */
    abBasScopeDefZoneGrid_onSelect: function(row, action) {
        View.parameters.callback(row.getRecord());
        View.closeThisDialog();
    }
});

