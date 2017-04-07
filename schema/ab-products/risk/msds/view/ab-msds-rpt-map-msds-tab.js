var msdsDetailsController = View.createController("msdsDetailsController", {

	afterInitialDataFetch : function() {
		this.inherit();
		var tabs = View.panels.get("msdsDetailsTabs");
		tabs.addEventListener('afterTabChange', this.onTabsChange);
		this.onTabsChange('', 'identification');
	},

	onTabsChange : function(tabPanel, selectedTabName) {
		var msdsRestriction = View.getOpenerView().msdsRestriction;
		var tabs = View.panels.get("msdsDetailsTabs");
		if (msdsRestriction) {
			tabs.msdsRestriction = msdsRestriction;
		}
		tabs.restriction = tabs.msdsRestriction;
		tabs.refreshTab(selectedTabName);
		if(selectedTabName=='constituents'){
			msdsDetailsController.abRiskMsdsRptMsdsConstGrid.refresh(tabs.restriction);
		}
	}
});