function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1=1 ";

    var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
	    restriction += " AND date_requested >= " + restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
	    restriction += " AND date_requested <= " + restLiteral(date_to);
	}

	var status_old = console.getFieldValue('uc_wr_audit.status_old');
	if (status_old != '') {
	    restriction += " AND status_old = " + restLiteral(status_old);
	}

	var status_new = console.getFieldValue('uc_wr_audit.status_new');
	if (status_new != '') {
	    restriction += " AND status_new = " + restLiteral(status_new);
	}

	var reportView = View.panels.get("reportPanel");
	reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}

var refreshInterval = 600000;		// refresh interval in ms. (2 minutes)
var refreshTimeoutID = null;

function refreshSearch() {
    // old selected row.
    var grid = View.panels.get("reportPanel");
    var wr_id = null;

    if (grid.rows[grid.selectedRowIndex] != undefined) {
        wr_id = grid.rows[grid.selectedRowIndex]["wrhwr.wr_id"];
    }
    View.panels.get("reportPanel").refresh();

    if (wr_id != null) {
        // find a reselect the row.
        var rows = grid.rows;
        var rowsLength = rows.length;
        var selectedRowIndex = null;
        for (var i = 0; i < rowsLength; i++) {
            if (wr_id == rows[i]["wrhwr.wr_id"]) {
                selectedRowIndex = i;
                break;
            }
        }
        if (selectedRowIndex != null) {
            grid.selectRow(selectedRowIndex);
        }
    }
}

// Function that will automatically repeat itself to refresh the search
// results panel.
function autoRefreshNav() {
    refreshSearch();
    refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);

    // select the old row.

}