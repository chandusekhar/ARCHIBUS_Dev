// CHANGE LOG


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

	if (status == 'Clo' || status == 'Rej' || status == 'Can') {
		// These requests can already be archived.  Check if they are in the hwr table.
		var hwrId = UC.Data.getDataValue('hwr', 'wr_id', "wr_id="+wr_id);
		if (hwrId != null) {
			detailsAxvw = "uc-wr-view-all-requests-fin-details-hwr.axvw?wrId="+wr_id;
		}	
		else {
			detailsAxvw = "uc-wr-view-all-requests-fin-details.axvw?wrId="+wr_id;
		}

	}
	else {
		detailsAxvw = "uc-wr-view-all-requests-fin-details.axvw?wrId="+wr_id;
	}
	detailsPanel.frame.dom.contentWindow.location.href = detailsAxvw;
}

// Function that will automatically repeat itself to refresh the search
// results panel.
function autoRefreshNav()
{
	View.panels.get("nav_search").refresh();
	refreshTimeoutID = setTimeout("autoRefreshNav()", refreshInterval);
}