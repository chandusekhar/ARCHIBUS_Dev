
var mapConfigObject = {

	// map loaded callback function
	"mapLoadedCallback" : mapLoadedCallback,
	//
	"mapInitExtent" : [729129, 2910346, 796976, 2965971],
	"mapInitExtentWKID" : 2249,	
	
	// basemap layers	
	"basemapLayerList" : [
		//basemap
		{ 	
			name: 'Boston Streets',
			url: 'http://140.241.251.197/ArcGIS/rest/services/maps/Planimetrics_Base_tiled/MapServer',
			opacity: 1.0
		},
		{ 	
			name: 'Boston Terrain',
			url: 'http://140.241.251.197/ArcGIS/rest/services/maps/Terrain_Base_tiled/MapServer',
			opacity: 1.0
		}
	],

	// reference layers
	"referenceLayerList" : [
		{
			name: 'None'
		},
		{
			name: 'Building Use',
			url: 'http://140.241.251.197/ArcGIS/rest/services/maps/Buildings_by_Use_tiled/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'Building Solar Potential',
			url: 'http://140.241.251.197/ArcGIS/rest/services/maps/Rooftop_Isolation_tiled/MapServer',
			opacity: 0.75,
			index: 90
		}
	]

};
