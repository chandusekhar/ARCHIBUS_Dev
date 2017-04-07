
View.createController('exReportGrid', {
	afterInitialdataFetch: function() {
	    var grid = Ab.view.View.getControl('', 'reportGridSql_grid');
	    
		grid.buildPreFooterRows = function(parentElement) {
		    var message = grid.rows.length > 0 ? grid.rows.length + ' records' : 'No records to display';
		    
	    	var rowElement = document.createElement('tr');
	    	var cellElement = document.createElement('td');
	    	cellElement.className = 'message';
	    	cellElement.colSpan = this.getNumberOfColumns();
	        cellElement.appendChild(document.createTextNode(message));
	        rowElement.appendChild(cellElement);
	    	parentElement.appendChild(rowElement);
	    }
	    
		grid.reloadGrid();
	}
});

/**
 * Applies custom SQL restriction to the room report.
 */
function applyCustomRestriction() {
    // get a reference to the grid panel by its ID (<panel id='reportGridSql_grid'>)
    var reportPanel = View.getControl('', 'reportGridSql_grid');

	// set the nonEmptyFloorsOnly parameter to true to enable the custom restriction defined in the AXVW file
	reportPanel.addParameter('nonEmptyFloorsOnly', true);
    
    // refresh the grid
    reportPanel.refresh();
}

/**
 * Clears custom SQL restriction.
 */
function clearCustomRestriction() {
	// get a reference to the grid panel by its ID (<panel id='reportGridSql_grid'>)
	var reportPanel = View.getControl('', 'reportGridSql_grid');

	// set the nonEmptyFloorsOnly parameter to false to disable the custom restriction defined in the AXVW file
	reportPanel.addParameter('nonEmptyFloorsOnly', false);

	// refresh the grid
	reportPanel.refresh();
}

/**
 * Called when the user clicks on the Details button.
 */
function showDetails() {
    // 'this' is the row data object
    var s1 = ('Total room area: ' + this['rm.total_area'] + ' sq.ft.');
    
    // 'this.grid' is the parent grid/mini-console control instance
    var s2 = ('Parent control ID: ' + this.grid.parentElementId);
    
    // you can call mini-console methods
    var s3 = ('Row primary keys: ' + toJSON(this.grid.getPrimaryKeysForRow(this)));
    
    alert(s1 + '\n' + s2 + '\n' + s3);
}

/**
 * You can use a controller to attach event handlers to actions.
 */
View.createController('SQLGrid', {
	
	/**
	 * Handles links in the "rm.rooms" custom grid field.
	 */
	reportGridSql_grid_onRm_rooms: function(row, action) {
        View.alert(toJSON(row.getRecord()));
    }
});

