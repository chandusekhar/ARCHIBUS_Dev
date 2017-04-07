var abFltMgmtVehicleReport_controller = View.createController('abFltMgmtVehicleReport_controller', {

	afterInitialDataFetch: function() {
		this.showMiniConsole();
	},

	showMiniConsole: function() {
		this.panel_vehiclereport.isCollapsed = false;
		this.panel_vehiclereport.showIndexAndFilter();
	}
});

function filterData() {

        var panel_filter = View.panels.get("panel_vehiclefilter");
        var panel_report = View.panels.get("panel_vehiclereport");
        var restriction    = new AFM.view.Restriction(panel_filter.getFieldValues());
        panel_report.refresh(restriction);
}

function clearFilter() {

	var panel_dofilter = View.panels.get("panel_dofilter");
	panel_dofilter.setFieldValue("vehicle.vehicle_id", "");
	panel_dofilter.setFieldValue("vehicle.status", "");
	panel_dofilter.setFieldValue("vehicle.em_id", "");
	panel_dofilter.setFieldValue("vehicle.dp_id", "");
}
