var mapConfigObject = {
    // the view method to call when the map is loaded
    "mapLoadedCallback" : mapLoadedCallback,
    // initial map extent
    "mapInitExtent" : [-16828542.56,-4093342.02,14166978.15,11306578.94],
    // initial map extent WKID  
    "mapInitExtentWKID" : 102100,
    // basemap layers   
    "basemapLayerList" : [
            //basemap
            {   
                name: 'Basemap',
                //url: 'http://tiles.arcgis.com/tiles/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_countries_basemap/MapServer',
                url: 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer',
                //url: 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer',
                //url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer',
                opacity: 1.0
            }
        ],
    // reference layers
    "referenceLayerList" : [
            // Countries
            {
                name: 'Countries',
                //url: 'http://tiles.arcgis.com/tiles/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_countries_basemap/MapServer',
                url: 'http://tiles.arcgis.com/tiles/lq5SzPW1rLR0h1u9/arcgis/rest/services/hq_countries_white/MapServer',
                opacity: 1.0,
                index: 90
            }
        ],

    // the method to call when the feature layer is loaded
    //"featureLayerLoadedCallback": featureLayerLoadedCallback,

    // feature layer callbacks
    "featureLayerClickCallback": featureLayerClickCallback,
    "featureLayerMouseOverCallback" : featureLayerMouseOverCallback,
    "featureLayerMouseOutCallback" : featureLayerMouseOutCallback,

    // feature layers (archibus assets)
    "featureLayerList" : [
            // countries
            {
                name: 'Countries',
                //url: 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/ne_countries_10m/FeatureServer/0',
                //url: 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/ne_countries_50m/FeatureServer/0',
                url: 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/ne_countries_110m/FeatureServer/0',
                objectIdField: 'objectid',
                opacity: 0.9,
                index: 75,
                outFields: ['*'],
                zoomToResults: false,
                toolTipField: 'name',
                assetIdField: 'iso_a3'//,
                //assetTypeField: 'ab_asset_type'
            }
        ]   

};