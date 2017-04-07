var abFltMgmtDOReport_controller = View.createController('abFltMgmtDOReport_controller', {

	afterInitialDataFetch: function() {
		this.showMiniConsole();
	},

	showMiniConsole: function() {
		this.panel_doreport.isCollapsed = false;
		this.panel_doreport.showIndexAndFilter();
	}
});

function filterData() {

        var panel_dofilter = View.panels.get("panel_dofilter");
        var panel_doreport = View.panels.get("panel_doreport");
        var restriction    = new AFM.view.Restriction(panel_dofilter.getFieldValues());
        panel_doreport.refresh(restriction);
}
