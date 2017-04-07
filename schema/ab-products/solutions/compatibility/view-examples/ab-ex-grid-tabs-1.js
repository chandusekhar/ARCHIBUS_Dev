// example JavaScript for loading miniConsole from JSON object

// load data from grid in page1 into tabsFrame

/**
 * user_form_onload is called after all system_form_onload functions
 * store the columns and rows in the tabsFrame
 */
function user_form_onload() {
	var cols;
	var rows;
	var viewFrame = getFrameObject(parent, "viewFrame"); 
	if (viewFrame != null) {
        var grid = AFM.view.View.getControl(window, 'rm_report');
			if (grid == null) {
				alert("User form loaded but miniconsole not found");
				return;
			}

		cols = grid.columns;
		rows = grid.rows;
		//alert("User form loaded with " + rows.length + " rows");

	}
	else {
		alert("User form loaded but viewFrame not found");
		return;
	}
	var gridRowArray = new Array();
	// remove these sub-objects from the row, cause they get messy converting to JSON
	var t = "temp"
	for (var j=0, singleRow; singleRow = rows[j]; j++)	{
		// simplify data for simplicity
		singleRow.grid = t;
		singleRow.index = singleRow.index.toString();;
		// convert the data object to JSON text so that it can be saved easily
		var rowObject = toJSON(singleRow);
		gridRowArray.push(rowObject);
	}

	var tabs = getFrameObject(parent, "tabsFrame"); 
	if (tabs != null) {
		tabs.gridColumnObjects = cols;
		// stor the JSON text array in the tab for retrieval by the other page
		tabs.gridRowsAsJSON = gridRowArray;
		//tabs.gridRowObjects = rows;
	}
}


