
/**
 * Example JS controller for cross-table panel.
 */
View.createController('budgetByProgram', {

    /**
     * After the panel is created but before the initial data fetch: 
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function() {
        this.budgetByProgCrosstab_table.addEventListener('afterGetData', this.budgetByProgCrosstab_table_afterGetData, this);
    },
    
    /**
     * Now that the afterGetData listener is set, force the cross-table to refresh.
     */
    afterInitialDataFetch: function() {
        this.budgetByProgCrosstab_table.refresh();
    },
    
    /**
     * Custom afterGetData listener, called by the cross-tab panel after it gets the data from 
     * the server, but before the data is used to build the cross-table.
     * 
     * Modifies column titles.
     *  
     * @param {Object} panel   The calling cross-table panel.
     * @param {Object} dataSet The data set received from the server - can be modified here.
     */
    budgetByProgCrosstab_table_afterGetData: function(panel, dataSet) {
        // change all column titles
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnTitle = dataSet.columnValues[c].l + ' CE';
            dataSet.columnValues[c].l = columnTitle;
        }

        // change all row titles
        for (var r = 0; r < dataSet.rowValues.length; r++) {
            var rowTitle = 'P' + r + ': ' + dataSet.rowValues[r].l;
            dataSet.rowValues[r].l = rowTitle;
        }
    },

    /**
     * Example of highlighting cells.
     */
    budgetByProgCrosstab_table_afterRefresh: function() {
    	// get cell for first row, first column, first calculated field
    	var cell = this.budgetByProgCrosstab_table.getCellElement(0, 0, 0);
    	// the element is an <A> tag, we need to set style for its parent <TD> tag
    	cell.parentElement.style.background = '#faa';
    },
    
    /**
     * Apply custom filter to the cross-tab panel.
     */
	budgetByProgCrosstab_table_onFilter: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('prog_budget_items.program_id', 'A%', 'LIKE');
		this.budgetByProgCrosstab_table.refresh(restriction);
	},
	
    /**
     * Clear custom filter and refresh the cross-tab panel.
     */
	budgetByProgCrosstab_table_onClear: function() {
		this.budgetByProgCrosstab_table.restriction = null;
		this.budgetByProgCrosstab_table.refresh();
	}
});

