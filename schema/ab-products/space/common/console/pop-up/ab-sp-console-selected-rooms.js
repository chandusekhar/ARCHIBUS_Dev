/**
 * The controller for the selected rooms.
 */
var spaceSelectedRmsController = View.createController('spaceSelectedRmsController', {
	
	/**
	 * Initialize the event listener refresh selected rooms grid.
	 */
	afterCreate: function() {
        this.on('app:space:express:console:refreshSelectedRoomsGrid', this.refreshSelectedRoomsGrid);
    },
	
	afterViewLoad:function() {
		var controller = this;
		this.selectedRoomsGrid.addEventListener('onMultipleSelectionChange', function(row) {
            controller.fireSelectedRoomRow(row);
        });
	},
	
	afterInitialDataFetch: function() {
		jQuery("#selectedRoomsGrid_layoutWrapper").removeClass();
		jQuery("#selectedRoomsGrid_head").removeClass();
		jQuery("#selectedRoomsGrid_title").hide();
    },
    
    refreshSelectedRoomsGrid: function() {
    	this.selectedRoomsGrid.refresh();
    },
	
	/**
	 * Handle the event when the checkbox next to the row is checked or unchecked.
	 */
	fireSelectedRoomRow: function(row) {
		var rows = this.selectedRoomsGrid.getSelectedRows();
		if (rows.length > 0) {
			this.trigger('app:space:express:console:refreshSelectedEmployeesGrid');
			this.trigger('app:space:express:console:refreshSelectedTeamsGrid');
		}
		this.trigger('app:space:express:console:onSelectedResourcesChanged', 'room', rows);
	},
	
	/**
	 * Disable the checkbox if the user is not in the SPACE-CONSOLE-ALL-ACCESS GROUP
	 */
	selectedRoomsGrid_afterRefresh: function() {
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
    		jQuery("#selectedRoomsGrid input[type=checkbox]").attr("disabled","true");
    	}
	}
});