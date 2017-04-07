
var controller = View.createController('ex', {
    afterInitialDataFetch: function() {
        this.reportGridMultiselectButtons_grid.enableSelectAll(false);
    }
});

/**
 * Displays primary key values for all records selected by the user.
 */
function showSelectedRecords() {
    var grid = Ab.view.View.getControl('', 'reportGridMultiselectButtons_grid');
    var rows = grid.getPrimaryKeysForSelectedRows();

    var message = 'Primary Keys of Selected Rows:\n\n';    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        message = message + toJSON(row) + '\n';
    }
    alert(message);
    
    // you can also get the complete content of selected data rows,
    // including visible fields and PK values
    var dataRows = grid.getSelectedRows();
    
    message = 'Data of Selected Rows:\n\n';    
    for (var i = 0; i < dataRows.length; i++) {
        var dataRow = dataRows[i];
        
        // data row objects contain a reference to the parent grid control
        // because of this, you should never pass data row objects to toJSON() method
        
        // if you need to serialize data rows to JSON format, create new objects:
        var dataRowCopy = new Object();
        dataRowCopy['project.project_id'] = dataRow['project.project_id'];
        dataRowCopy['project.status'] = dataRow['project.status'];
        message = message + toJSON(dataRowCopy) + '\n';
    }
    alert(message);
}


/**
 *
 * Set all rows as selected, setting each checkbox to true
 */
function selectAllRecords() {
    var grid = Ab.view.View.getControl('', 'reportGridMultiselectButtons_grid');
	var selectedRows = grid.setAllRowsSelected();
	//alert('Selected ' + selectedRows.length + ' rows from the grid.');
}

/**
 * Set all rows as unselected, setting each checkbox to false
 */
function unselectAllRecords() {
    var grid = Ab.view.View.getControl('', 'reportGridMultiselectButtons_grid');
	var selectedRows = grid.setAllRowsSelected(false);
	//alert('De-Selected ' + selectedRows.length + ' rows from the grid.');
}

