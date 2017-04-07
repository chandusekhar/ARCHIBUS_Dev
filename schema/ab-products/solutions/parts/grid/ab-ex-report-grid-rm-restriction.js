/**
 * Reloads the report data from the server.
 */
function onReload() {
	// get a handle on the grid - from the controlRegistry - by the panel's ID
    var grid = Ab.view.View.getControl(window, 'reportGridRmRestriction_grid');
	if (grid == null) {
		alert(getMessage("errNotFound"));
		return;
	}
	// call the reportGrid's API to load data
	grid.refresh();
}

/**
 * Hides or shows the report grid.
 */
function onHideRoomData() {
    // get the hide/show status variable (it is undefined during the first call)
	var gridShown = window.top.reportGridRmRestriction_grid_shown;
	
	if (gridShown == undefined || gridShown == null || gridShown == true) {
		// hide the report grid (but not the panel title bar)
		$('reportGridRmRestriction_grid').style.display = 'none';
		window.top.reportGridRmRestriction_grid_shown = false;
	}
	else {
		// show the report grid
		$('reportGridRmRestriction_grid').style.display = 'block';
		window.top.reportGridRmRestriction_grid_shown = true;
	}
}
