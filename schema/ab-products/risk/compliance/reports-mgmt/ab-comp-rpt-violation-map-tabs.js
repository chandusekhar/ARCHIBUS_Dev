var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	afterInitialDataFetch : function() {
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
		this.tabsBldgManagement.regulationRes = ' 1=1 ';
		this.tabsBldgManagement.regprogramRes = ' 1=1 ';
		this.tabsBldgManagement.regcomplianceRes = ' 1=1 ';
		this.tabsBldgManagement.regviolationRes = ' 1=1 ';
	},
	
	afterViewLoad : function() {
		//set Selected Violation Locations tab report mode
		View.getOpenerView().mode = 'report';
	},
	
	refreshTabs: function(restriction) {
		var tabs = this.tabsBldgManagement;
		var restriction = tabs.treeRestriction 
			+ " and " + tabs.regulationRes
			+ " and " + tabs.regprogramRes
			+ " and " + tabs.regcomplianceRes
			+ " and " + tabs.regviolationRes
		    + " and " + tabs.markerRestriction;
		this.abCompViolationGrid.refresh(restriction);
	}
	
})

function afterTabChange(tabPanel, selectedTabName) {
	if (abBldgMangementTabCtrl.isValidGisLicense) {
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'gisMapTab') {
			mapController.showLegend();
		} else if (selectedTabName == 'locTab') {
			mapController.hideLegend();
		}
	}
}