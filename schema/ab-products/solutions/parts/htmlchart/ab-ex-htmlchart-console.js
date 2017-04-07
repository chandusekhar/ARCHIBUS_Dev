function onDrillDown (item) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', item.selectedChartData['bl.bl_id']);
	    
	View.openDialog('ab-ex-htmlchart-console-report.axvw',restriction, true, {
		width:400,
		height:450
    });
}


function showRecords(){
	
	var console = View.panels.get("chartConsole_console");

	var restriction = new Ab.view.Restriction();
	var city_id = console.getFieldValue('bl.city_id');
	if (city_id != '') {
		restriction.addClause('bl.city_id', city_id , 'LIKE');
	}
	
	var bl_id = console.getFieldValue('bl.bl_id');
	if (bl_id != '') {
		restriction.addClause('bl.bl_id', bl_id , 'LIKE');
	}
		
	// apply restriction 
	View.panels.get("chartConsole_chart").refresh(restriction);
}



