// example JavaScript for loading miniConsole from tabFrame objects


/**
 * user_form_onload is called after all system_form_onload finction
 * retreive data from registry and load it into UI control
 *
 */
function user_form_onload() {
	var columns = null;
	var rowsFromJSON = new Array();

	// find the tabFrame where the data is stored
	var tabs = getFrameObject(parent, "tabsFrame"); 
	if (tabs != null) {
		// we need to know the columns even when not used for header labels
		columns = tabs.gridColumnObjects;
		// cycle through array of row records held in JSON format in tabFrame's gridRowsAsJSON array
		var rowObject;
		for (var i = 0, JSONRow; JSONRow = tabs.gridRowsAsJSON[i]; i++)	{
			// use eval to turn JSON text into an object
			rowObject = eval('(' + JSONRow + ')');
			// add object to array of objects
			rowsFromJSON.push(rowObject);
		}
	}
	// find the viewFrame with the control registry
	var viewFrame = getFrameObject(parent, "viewFrame"); 
	if (viewFrame != null) {
		// find the control to be modified
        var grid = AFM.view.View.getControl(window, 'rm_report_2');
		if (grid == null) {
			alert("User form loaded but miniconsole not found");
			return;
		}
		if (columns != null && rowsFromJSON != null) {
			reloadRows(grid, columns, rowsFromJSON);
		}
	}
	else {
		alert("User form loaded but viewFrame not found");
		return;
	}
}


/**
 * modify miniConsole to show the given rows
 * column ids must match row fields, 
 * but column names are not used to rewrite UI control headers
 * call functions in ab-miniconsole.js to fill in grid
 */
function reloadRows (grid, columns, records) {
	// set the columns
	grid.columns = columns;
	// initialize and add the row records
	grid.rows = new Array();
	grid.addRows(records);
	// clear any existing rows from the DOM on the page
	var tbody = grid.getTableBodyElement();
	grid.removeRowsFromTBody();
		
	// reload old header row(s)
	for (var i=0; i < grid.headerRows.length; i++) {
		tbody.appendChild(grid.headerRows[i]);
	}
	// create grid data rows
	grid.createDataRows(tbody, grid.columns);
}

