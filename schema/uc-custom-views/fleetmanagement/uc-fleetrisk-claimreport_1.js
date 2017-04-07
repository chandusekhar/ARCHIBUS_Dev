// CHANGE LOG
// 2015/12/02 - MSHUSSAI - Added code to select two different axvw based on type of request from wr or hwr

var refreshInterval = 600000;		// refresh interval in ms. (2 minutes)
var refreshTimeoutID = null;

var wrManagerNav2Controller = View.createController('wrManagerNav2Controller', {
	afterViewLoad: function() {
		this.inherit();
		refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);
		
		//prevNextafterViewLoad(this.nav_search,"25,50,100,200","50");
	},
	
	nav_search_afterRefresh: function(){
		//prevNext_afterRefresh(this.nav_search);
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
	var navform = View.getControl('', 'abViewdefEditformDrilldown_treePanel');
	//var restriction = navform.getFieldRestriction();

	var form = View.getControl('', 'abViewdefEditformDrilldown_details_info');

	var wr_id = row['wrhwr.wr_id'];
	var status = row['wrhwr.status.raw'];

	var detailsPanel = View.getControl('','details_frame');
	var detailsAxvw;

	if (status == 'Clo' || status == 'Rej' || status == 'Can' || status == 'Exp') {
		// These requests can already be archived.  Check if they are in the hwr table.
		var hwrId = UC.Data.getDataValue('hwr', 'wr_id', "wr_id="+wr_id);
		if (hwrId != null) {
			detailsAxvw = "uc-fleetrisk-details-hwr.axvw?wrId="+wr_id;
		}
		else {
			detailsAxvw = "uc-fleetrisk-details-wr.axvw?wrId="+wr_id;
		}

	}
	else {
		detailsAxvw = "uc-fleetrisk-details-wr.axvw?wrId="+wr_id;
	}

	detailsPanel.frame.dom.contentWindow.location.href = detailsAxvw;
}

// Function that will automatically repeat itself to refresh the search
// results panel.
function autoRefreshNav()
{
	refreshSearch();
	refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);

    // select the old row.

}

function refreshSearch() {
    // old selected row.
    var grid = View.panels.get("abViewdefEditformDrilldown_treePanel");
    var wr_id = null;

    if (grid.rows[grid.selectedRowIndex] != undefined) {
        wr_id = grid.rows[grid.selectedRowIndex]["wrhwr.wr_id"];
    }
    View.panels.get("abViewdefEditformDrilldown_treePanel").refresh();

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
