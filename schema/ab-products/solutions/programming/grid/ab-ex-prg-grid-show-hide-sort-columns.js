
/**
 * Example controller.
 */
View.createController('gridShowHideSortColumns', {
	
	/**
	 * Whether columns 2 through 6 are hidden.
	 */
	columnsHidden: true,

	/**
	 * Shows or hides columns 2 through 6.
	 */
	gridShowHideSortColumns_grid_onShowHideColumns: function() {
        this.columnsHidden = !this.columnsHidden;
	    this.gridShowHideSortColumns_grid.showColumn('afm_flds.afm_type', !this.columnsHidden);
	    this.gridShowHideSortColumns_grid.showColumn('afm_flds.data_type', !this.columnsHidden);
	    this.gridShowHideSortColumns_grid.showColumn('afm_flds.afm_size', !this.columnsHidden);
	    this.gridShowHideSortColumns_grid.showColumn('afm_flds.decimals', !this.columnsHidden);
	    this.gridShowHideSortColumns_grid.showColumn('afm_flds.dflt_val', !this.columnsHidden);
	    this.gridShowHideSortColumns_grid.update();
    },

    /**
     * Sorts columns 2..6 by column title, alphabetically.
     */
    gridShowHideSortColumns_grid_onSortColumns: function() {
        this.gridShowHideSortColumns_grid.sortColumns(2, 7);
	    this.gridShowHideSortColumns_grid.update();
    },

    /**
     * Move the Field Name column to the first position.
     */
    gridShowHideSortColumns_grid_onFieldNameFirst: function() {
        this.gridShowHideSortColumns_grid.setColumnDisplayOrder('afm_flds.field_name', 0);
	    this.gridShowHideSortColumns_grid.update();
    },

    /**
     * Move the Field Name column to the last position.
     */
    gridShowHideSortColumns_grid_onFieldNameLast: function() {
        this.gridShowHideSortColumns_grid.setColumnDisplayOrder('afm_flds.field_name', 8);
	    this.gridShowHideSortColumns_grid.update();
    },

    /**
     * Displays the list of columns.
     */
    gridShowHideSortColumns_grid_onGetColumns: function() {
	    var columns = this.gridShowHideSortColumns_grid.getColumns();
	    var message = '';
	    for (var i = 0; i < columns.length; i++) {
	    	message += columns[i].name;
	    	message += ': ';
	    	message += (columns[i].hidden ? 'hidden' : 'visible');
	    	message += '<br/>';
	    }
	    View.showMessage('message', message);
    }
});