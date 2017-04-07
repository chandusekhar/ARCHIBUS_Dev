
/**
 * Called when the user selects any tree node. Applies the selected node restriction to the chart.
 */
function selectLocation() {
	var treePanel = View.panels.get('locationTree');
	var selectedNode = treePanel.lastNodeClicked;
	var selectedLevel = selectedNode.level.levelIndex;
	
	var locationField, locationValue;

	// create the SQL restriction for the selected location
	switch (selectedLevel) {
	case 0:
	    locationField = 'ctry_id'; 
	    locationValue = selectedNode.data['ctry.ctry_id'];
		break;
	case 1:
	    locationField = 'regn_id'; 
	    locationValue = selectedNode.data['regn.regn_id'];
		break;
	case 2:
	    locationField = 'state_id'; 
	    locationValue = selectedNode.data['state.state_id'];
		break;
	case 3:
	    locationField = 'city_id'; 
	    locationValue = selectedNode.data['city.city_id'];
		break;
	case 4:
	    locationField = 'site_id'; 
	    locationValue = selectedNode.data['site.site_id'];
		break;
	case 5:
	    locationField = 'bl_id'; 
	    locationValue = selectedNode.data['bl.bl_id'];
		break;
	}
	
	// add optional console restriction
	var console = View.panels.get('consolePanel');
	var consoleRestriction = new Ab.view.Restriction();
    var dateRequestedFrom = console.getFieldValue('wr.date_requested.from');
    if (dateRequestedFrom != '') {
    	consoleRestriction.addClause('wr.date_requested', dateRequestedFrom, '>=');
    }
    var dateRequestedTo = console.getFieldValue('wr.date_requested.to');
    if (dateRequestedTo != '') {
    	consoleRestriction.addClause('wr.date_requested', dateRequestedTo, '<=');
    }
    
	// refresh the chart using the selected location restriction
	var chartPanel = View.panels.get('dataChart');
	chartPanel.addParameter('locationField', locationField);
	chartPanel.addParameter('locationValue', locationValue);
	chartPanel.refresh(consoleRestriction);
	
	// display the selected location in the chart title
	chartPanel.appendTitle(locationValue);
}