var mapConfigObject = {

		'mapLoadedCallback': mapLoadedCallback,

        'mapInitExtent' : [ -16007153,-9413760,17649599,14733002 ],

		'mapInitExtentWKID' : 102100,
		
		'basemapLayerList' : [
			{
				name: 'World Imagery', 
				url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
			},
			{
				name: 'World Street Map', 
				url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
			},
			{
				name: 'World Topographic',
				url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
			},
			{
				name: 'Light Gray Canvas', 
				url : 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer'
			}
		],
		
		'referenceLayerList' : [
			{
				name : 'ctry', 
				url : 'http://tiles.arcgis.com/tiles/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_geo_regions_countries/MapServer',
				opacity : 0.75
			},
            {
                name : 'gros', 
                url : 'http://tiles.arcgis.com/tiles/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_space_gros/MapServer',
                opacity : 0.75
            }
		],

		// the method to call when the feature layer is clicked
		"featureLayerClickCallback": featureLayerClickCallback,

		// feauture layers (archibus assets)
		'featureLayerList' : [
			{
				name : 'bl', 
				url : 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_buildings/FeatureServer/0',
				opacity: 0.9,
				index: 75,
				outFields : ['*'],
			 	zoomToResults : true,
			 	toolTipField: 'name',
				assetIdField: 'bl_id',
				assetTypeField: 'ab_asset_type'
			},
			{
				name : 'rm', 
				url : 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/ArcGIS/rest/services/hq_space/FeatureServer/0',
				opacity: 0.9,
				index: 75,
				outFields : ['*'],
				zoomToResults : true,
				toolTipField: 'bl_fl_rm_id',
				assetIdField: 'OBJECTID',
				assetTypeField: 'asset_type',
			}	
			
		],		
		
		// map levels of detail (LODs)
		'lods' : [ 
		    {
				"level": 0,
                "resolution": 156543.033928,
                "scale": 591657527.591555
            },
            {
                "level": 1,
                "resolution": 78271.5169639999,
                "scale": 295828763.795777
            },
            {
                "level": 2,
                "resolution": 39135.7584820001,
                "scale": 147914381.897889
            },
            {
                "level": 3,
                "resolution": 19567.8792409999,
                "scale": 73957190.948944
            },
            {
                "level": 4,
                "resolution": 9783.93962049996,
                "scale": 36978595.474472
            },
            {
                "level": 5,
                "resolution": 4891.96981024998,
                "scale": 18489297.737236
            },
            {
                "level": 6,
                "resolution": 2445.98490512499,
                "scale": 9244648.868618
            },
            {
                "level": 7,
                "resolution": 1222.99245256249,
                "scale": 4622324.434309
            },
            {
                "level": 8,
                "resolution": 611.49622628138,
                "scale": 2311162.217155
            },
            {
                "level": 9,
                "resolution": 305.748113140558,
                "scale": 1155581.108577
            },
            {
                "level": 10,
                "resolution": 152.874056570411,
                "scale": 577790.554289
            },
            {
                "level": 11,
                "resolution": 76.4370282850732,
                "scale": 288895.277144
            },
            {
                "level": 12,
                "resolution": 38.2185141425366,
                "scale": 144447.638572
            },
            {
                "level": 13,
                "resolution": 19.1092570712683,
                "scale": 72223.819286
            },
            {
                "level": 14,
                "resolution": 9.55462853563415,
                "scale": 36111.909643
            },
            {
                "level": 15,
                "resolution": 4.77731426794937,
                "scale": 18055.954822
            },
            {
                "level": 16,
                "resolution": 2.38865713397468,
                "scale": 9027.977411
            },
            {
                "level": 17,
                "resolution": 1.19432856685505,
                "scale": 4513.988705
            },
            {
                "level": 18,
                "resolution": 0.597164283559817,
                "scale": 2256.994353
            },
            {
                "level": 19,
                "resolution": 0.298582141647617,
                "scale": 1128.497176
            },
            {
                "level": 20,
                "resolution": 0.1492910708238085,
                "scale": 564.248588
            },
            {
                "level": 21,
                "resolution": 0.0746455354119043,
                "scale": 282.124294
            },
            {
                "level": 22,
                "resolution": 0.0373227677059521,
                "scale": 141.062147
            }
        ]
};