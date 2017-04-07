
var controller = View.createController('ex', {
    afterViewLoad: function() {
    	this.reportGridMultiselectButtons_grid.selectionAcrossPagesEnabled=true;
    	//add actionBar to the panel named by reportGridMultiselectButtons_grid
    	 new Ab.view.Actionbar('reportGridMultiselectButtons_grid', this.reportGridMultiselectButtons_grid);
    }
});

/**
 * Displays primary key values for all records selected by the user.
 */
function showSelectedRecords() {
    var grid = Ab.view.View.getControl('', 'reportGridMultiselectButtons_grid');
    var rows = grid.getPrimaryKeysForAllSelectedRows();

    var message = 'Primary Keys of Selected Rows ('+rows.length+'):\n\n';    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        message = message + toJSON(row) + '\n';
    }
    alert(message);
    
}
/**
 * Clears all selected row over multiple pages.
 */
function unselectAllRecords(){
	  var grid = Ab.view.View.getControl('', 'reportGridMultiselectButtons_grid');
	  grid.clearAllSelected();
}



