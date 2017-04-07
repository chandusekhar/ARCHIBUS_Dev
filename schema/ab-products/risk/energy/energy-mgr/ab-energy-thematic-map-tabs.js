var abBldgMangementTabCtrl = View.createController('map',{
	menuParent:null,
	menu: new Array('lease', 'building', 'document', 'contact'),
	subMenu: new Array(new Array(), 
						new Array('country', 'region', 'state', 'city', 'site', 'property'),
						new Array('building', 'lease'),
						new Array('building', 'lease')),
	isValidGisLicense: true,
	afterInitialDataFetch: function(){
		this.map.addEventListener('afterTabChange', afterTabChange);
		var mapController = View.controllers.get('mapCtrl');
		mapController.menu = this.menu;
		mapController.subMenu = this.subMenu;
		mapController.loadMenu();
		afterTabChange("", "map");
		
	}
})

function afterTabChange(tabPanel, selectedTabName){
	if(abBldgMangementTabCtrl.isValidGisLicense){
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'map') {
			mapController.showLegend();
		}else if (selectedTabName == 'tabsBldgManagement_1') {
				mapController.hideLegend();
		}
	}
}
