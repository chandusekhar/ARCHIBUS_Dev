var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	
	//used in location tab control
	tabs:new Array(
			['regulationGrid','regulationForm','regloc.location_id','regloc.location_id'],
			['programGrid','programForm','regloc.location_id','regloc.location_id'],
			['requireGrid','requireForm','regloc.location_id','regloc.location_id']
			),		
	
	afterInitialDataFetch : function() {
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsBldgManagementtreeRestriction = ' 1=1 ';
		this.tabsBldgManagement.regulationRes = ' 1=1 ';
		this.tabsBldgManagement.regprogramRes = ' 1=1 ';
		this.tabsBldgManagement.regcomplianceRes = ' 1=1 ';
		this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
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