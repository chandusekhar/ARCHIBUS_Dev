var mapConfigObject = {
	// the view method to call when the map is loaded
	"mapLoadedCallback" : mapLoadedCallback,
	// initial map extent
	"mapInitExtent" : [-7935182, 5238879, -7933103, 5240288],
	// initial map extent WKID	
	"mapInitExtentWKID" : 102100,
	// currently not used	
	//"lods" : [],
	// basemap layers	
	"basemapLayerList" : [
			//basemap
			{ 	
				name: 'Basemap',
				//url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
				url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
				opacity: 1.0
			}
		],
	// reference layers
	// TODO	: add separate basemap annotation layers and/or provide for multiple reference layers and/or allow cfg of display order
	"referenceLayerList" : [
			//pu campus basemap annotation
			{
				name: 'Land Base',
				url: 'http://<yourserver>/arcgis/rest/services/gds/gds_land_base/MapServer',
				opacity: 0.75,
				index: 90
			}
		],
	// the method to call when the feature layer is loaded
	"featureLayerLoadedCallback": featureLayerLoadedCallback,

	// the method to call when the feature layer is clicked
	"featureLayerClickCallback": featureLayerClickCallback,

	// feauture layers (archibus assets)
	"featureLayerList" : [
			// buildings
			{
				name: 'Buildings',
				url: 'http://<yourserver>/arcgis/rest/services/gds/gds_buildings/FeatureServer/0',
				opacity: 0.75,
				index: 75,
				outFields: ['*'],
				zoomToResults: true,
				toolTipField: 'name',
				assetIdField: 'bl_id',
				assetTypeField: 'AB_ASSET_TYPE'
			},
			// parcels
			{
				name: 'Parcels',
				url: 'http://<yourserver>/arcgis/rest/services/gds/gds_parcels/FeatureServer/0',
				opacity: 0.75,
				index: 50,
				outFields: ['*'],
				zoomToResults: true,
				toolTipField: 'MAP_PAR_ID',
				assetIdField: 'MAP_PAR_ID',
				assetTypeField: 'AB_ASSET_TYPE'
			}
		]	
};