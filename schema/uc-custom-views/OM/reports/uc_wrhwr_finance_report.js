
function user_form_onload() {
	
    var grid = Ab.view.View.getControl('', 'detailsPanel');
    
	//alert("Hello");
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

/**
 * Applies custom SQL restriction to the room report.
 */
function applyCustomRestriction() {
    // custom SQL restriction that uses one of the columns from the custom SQL query in AXVW
    var restriction = 'total_area > 0';
    
    // get a reference to the grid panel by its ID (<panel id='reportGridSql_grid'>)
    var reportPanel = Ab.view.View.getControl('', 'detailsPanel');
    
    // apply the restriction and refresh the grid
    reportPanel.refresh(restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('hwr.date_closed.from');
	if (date_from != '') {
		restriction += " AND hwr.date_closed >= "+restLiteral(date_from);
	}

    var reportView = View.panels.get("detailsPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}