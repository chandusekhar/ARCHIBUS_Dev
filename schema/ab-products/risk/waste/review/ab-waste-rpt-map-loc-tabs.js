var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	
	getMapController: function(){
		var mapTab  = this.tabsBldgManagement.findTab('tabsBldgManagement_0');
		if (mapTab.useFrame) {
			return mapTab.getContentFrame().View.controllers.get('mapCtrl');
		}else {
			return View.controllers.get('mapCtrl');
		}
	}
})

