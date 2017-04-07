var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	afterInitialDataFetch : function() {
		// this.isValidGisLicense = hasValidArcGisMapLicense();
		//this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
		this.tabsBldgManagement.disableTab('msdsTab');
	}
})
