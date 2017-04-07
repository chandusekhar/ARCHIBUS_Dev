
/**
 * Map Config object for the stack map control. we customize the ui and change to world steet map when the view is loaded
 */
var mapConfigObject = {

		'mapLoadedCallback': scenarioMapLoadedCallback,

        'mapInitExtent' : [-7934548, 5239708, -7933850, 5240063],

		'mapInitExtentWKID' : 102100,
		
		'basemapLayerList' : [
			{
				name: View.getLocalizedString('World Street Map'), 
				url : '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
			},
			{
				name: View.getLocalizedString('World Imagery'), 
				url : '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
			},
			{
				name: View.getLocalizedString('World Topographic'),
				url: '//services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
			},
			{
				name: View.getLocalizedString('World Light Gray Canvas'), 
				url : '//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer'
			}
		]
};

/**
 * We just switch the layer to World Street Map when the map is loaded.
 */
function scenarioMapLoadedCallback() {
	abAllocWizStackController.afterMapLoaded.defer(2000, abAllocWizStackController);
	//kb#3048666: comment below code line since dynamiclly showing title bar can't work on FireFox, so in axvw directly display the title bar.
	//abAllocWizStackController.displayStackChartTitlebar();
}