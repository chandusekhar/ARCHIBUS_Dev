/**
 * The controller for the selected Teams.
 */
var spaceSelectedTeamsController = View.createController('spaceSelectedTeamsController', {
	
	/**
	 * Initialize the event listener refresh selected Teams grid.
	 */
	afterCreate: function() {
        this.on('app:space:express:console:refreshSelectedTeamsGrid', this.refreshSelectedTeamsGrid);
    },
	
	afterViewLoad:function() {
		var controller = this;
		this.selectedTeamsGrid.addEventListener('onMultipleSelectionChange', function(row) {
            controller.fireSelectedTeamRow(row);
        });
	},
	
	afterInitialDataFetch: function() {
		jQuery("#selectedTeamsGrid_layoutWrapper").removeClass();
		jQuery("#selectedTeamsGrid_head").removeClass();
		jQuery("#selectedTeamsGrid_title").hide();

		//set as of date restriction
		var restriction = new Ab.view.Restriction();
		//var gridRestriction = View.getOpenerView() this.selectedTeamsGrid.restriction;
		restriction.addClauses(View.getOpenerView().dialogRestriction,null,true);
		var asOfDate = View.getOpenerView().dialogView.parameters.asOfDate;
		restriction.addClause('rm_team.date_start', asOfDate, '&lt;=');
		restriction.addClause('rm_team.date_end', asOfDate, '&gt;=', ')AND(');
		restriction.addClause('rm_team.date_end', asOfDate, 'IS NULL', 'OR');

		this.selectedTeamsGrid.restriction = restriction;
		this.selectedTeamsGrid.refresh();
	},
    
    refreshSelectedTeamsGrid: function() {
    	this.selectedTeamsGrid.refresh();
    },
	
	/**
	 * Handle the event when the checkbox next to the row is checked or unchecked.
	 */
	fireSelectedTeamRow: function(row) {
		var rows = this.selectedTeamsGrid.getSelectedRows();
		if (rows.length > 0) {
			this.trigger('app:space:express:console:refreshSelectedEmployeesGrid');
			this.trigger('app:space:express:console:refreshSelectedRoomsGrid');
		}
		this.trigger('app:space:express:console:onSelectedResourcesChanged', 'team', rows);
	},
	
	/**
	 * Disable the checkbox if the user is not in the SPACE-CONSOLE-ALL-ACCESS GROUP
	 */
	selectedTeamsGrid_afterRefresh: function() {
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
    		jQuery("#selectedTeamsGrid input[type=checkbox]").attr("disabled","true");
    	}
	}
});