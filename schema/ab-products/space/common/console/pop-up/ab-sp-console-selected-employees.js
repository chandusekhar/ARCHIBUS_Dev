
/**
 * Controller for the selected employees from the details pop up window.
 */
var selectedRmsEmsController = View.createController('selectedRmsEmsController',{
	
	/**
	 * Initialize the event listener refresh selected rooms grid.
	 */
	afterCreate: function() {
        this.on('app:space:express:console:refreshSelectedEmployeesGrid', this.refreshSelectedEmployeesGrid);
    },
	
	afterInitialDataFetch: function() {
		jQuery("#selectedRmsEmsGrid_layoutWrapper").removeClass();
		jQuery("#selectedRmsEmsGrid_head").removeClass();
		jQuery("#selectedRmsEmsGrid_title").hide();
	},
	
	afterViewLoad:function() {
		var controller = this;
		this.selectedRmsEmsGrid.addEventListener('onMultipleSelectionChange', function(row) {
            controller.fireSelectedEmployeeRow(row);
        });
	},
	
	refreshSelectedEmployeesGrid: function() {
		this.selectedRmsEmsGrid.refresh();
	},
	
	/**
	 * Handle the event when the checkbox next to the row is checked or unchecked.
	 */
	fireSelectedEmployeeRow: function(row) {
		var rows = this.selectedRmsEmsGrid.getSelectedRows();
		if (rows.length > 0) {
			this.trigger('app:space:express:console:refreshSelectedRoomsGrid');
			this.trigger('app:space:express:console:refreshSelectedTeamsGrid');
		}
		this.trigger('app:space:express:console:onSelectedResourcesChanged', 'employee', rows);
	},
	
	/**
	 * Disable the checkbox if the user is not in the SPACE-CONSOLE-ALL-ACCESS GROUP
	 */
	selectedRmsEmsGrid_afterRefresh: function() {
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
    		jQuery("#selectedRmsEmsGrid input[type=checkbox]").attr("disabled","true");
    	}
	}
});