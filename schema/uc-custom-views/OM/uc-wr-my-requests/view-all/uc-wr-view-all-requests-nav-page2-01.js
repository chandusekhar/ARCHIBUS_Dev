// CHANGE LOG
// 18-07-2016 - MSHUSSAI - Implemented Change to fix broken Hyperlinks


// refresh timer variables
//var refreshInterval = 300000;		// refresh interval in ms.
var refreshInterval = 300000;		// refresh interval in ms. (2 minutes)
var refreshTimeoutID = null;

var wrManagerNav2Controller = View.createController('wrManagerNav2Controller', {
	afterViewLoad: function() {
		this.inherit();
		
		refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
	
		if (View.restriction == null) {
			// not restriction, no search/refresh was done. (restiction always null at this stage...)
			// we will load all the active requests (restrict out Clo, Can, Rej)
			// this.nav_search.refresh("status NOT IN ('Clo', 'Can', 'Rej')");
		}
	}
});

function openWRDetails(row) {
	var navform = View.getControl('', 'nav_search');
	//var restriction = navform.getFieldRestriction();
	
	var form = View.getControl('', 'nav_details_info');
	
	var wr_id = row['wrhwr.wr_id'];
	var status = row['wrhwr.status.raw'];
	
	var detailsPanel = View.getControl('','wr_details_frame');
	var detailsAxvw;

	detailsAxvw = "uc-wr-view-all-requests-wrhwr-details.axvw?wrId="+wr_id;	
	detailsPanel.frame.dom.contentWindow.location.href = detailsAxvw;
}

// Function that will automatically repeat itself to refresh the search
// results panel.
function autoRefreshNav()
{
	refreshSearch();
	refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);
}

function refreshSearch() {
    // old selected row.
    var grid = View.panels.get("nav_search");
    var wr_id = null;

    if (grid.rows[grid.selectedRowIndex] != undefined) {
        wr_id = grid.rows[grid.selectedRowIndex]["wrhwr.wr_id"];
    }
    View.panels.get("nav_search").refresh();

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