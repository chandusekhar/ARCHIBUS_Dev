
/**
 * Applies custom SQL restriction to the room report.
 */
function applyCustomRestriction() {
    // custom SQL restriction that uses one of the columns from the custom SQL query in AXVW
    var restriction = 'total_area > 0';
    
    // get a reference to the grid panel by its ID (<panel id='reportGridSqlStats_grid'>)
    var reportPanel = Ab.view.View.getControl('', 'reportGridSqlStats_grid');
    
    // apply the restriction and refresh the grid
    reportPanel.refresh(restriction);
    
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
