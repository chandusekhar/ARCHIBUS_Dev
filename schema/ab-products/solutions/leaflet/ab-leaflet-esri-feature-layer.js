View.createController('mapController', {
	
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
      configObject.mapCenter = [35, -6]
      configObject.mapZoom = 2
      configObject.mapImplementation = 'Esri';
      configObject.basemap = 'World Light Gray Canvas';

      var mapController = this;
      configObject.onMapLoad = function(){
          mapController.onMapLoad();
      }

      configObject.featureLayerList = [
            // countries
            {
                name: 'ctry',
                url: 'http://services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/ne_countries_110m/FeatureServer/0',
                objectIdField: 'objectid',
                opacity: 0.9,
                index: 75,
                outFields: ['*'],
                zoomToResults: true,
                toolTipField: 'name',
                assetIdField: 'iso_a3'//,
                //assetTypeField: 'ab_asset_type'
            }
        ];   

    	// create map
    	mapController.mapControl = new Ab.leaflet.MapExtensions('mapPanel', 'mapDiv', configObject);
  
      // load the countries layer
      mapController.loadCountryFeatureLayer();

      // create event listeners
      mapController.createEventListeners();
    },

    createEventListeners: function(){
      this.mapControl.mapClass.addEventListener('featureClick', this.onFeatureClick, this);  
      this.mapControl.mapClass.addEventListener('featureMouseOver', this.onFeatureMouseOver, this);  
      this.mapControl.mapClass.addEventListener('featureMouseOut', this.onFeatureMouseOut, this);  
    },

    onMapLoad: function(eventData){
      //console.log('MapController -> onMapLoad...');
      var mapController = View.controllers.get('mapController');
    },


    onFeatureClick: function(assetId, assetType){
      //console.log('MapController -> onFeatureClick -> assetId=' + assetId);
    },

    onFeatureMouseOver: function(assetId, assetType){
      //console.log('MapController -> onFeatureMouseOver -> assetId=' + assetId);
    },

    onFeatureMouseOut: function(assetId, assetType){
      //console.log('MapController -> onFeatureMouseOut...');
    },
	
    switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	var mapController = View.controllers.get('mapController');
      mapController.mapControl.switchBasemapLayer(item);
    },

    loadCountryFeatureLayer: function(){

      var featurePropertiesId = "ctry";
      var dataSource = 'ctryDs';
      var keyField = 'ctry.ctry_id';
      var titleField = 'ctry.name';
      var contentFields = ['ctry.ctry_id', 'ctry.name', 'ctry.geo_region_id'];

      // get all country ids
      var ctryIds = this.mapControl.getDistinctFieldValuesDataSourceForWhereClause('ctry.ctry_id', '1=1'); 

      // create the where clause for the feature layer
      // iso_a3 contains 3 character country codes for the feature layer
      var featureLayerRestriction = "iso_a3 IN (" + ctryIds + ")";

      // create the feature options
      var featureOptions = {
        //optional
        fillColor: '#e41a1c',
        fillOpacity: 0.90,
        stroke: true,
        strokeColor: '#fff',
        strokeWeight: 1.0,
        // required for thematic markers
        renderer: 'thematic-unique-values',
        thematicField: 'ctry.geo_region_id',
        thematicUniqueValues: ['AMER', 'APAC', 'EMEA'],                   
        colorBrewerClass: 'Set1',      
        //thematicUniqueValues: [],
        //colorBrewerClass: 'Paired2',
        whereClause: featureLayerRestriction
      };

      // WC_DATASOURCE
      //var dataSourceType = 'WC_DATASOURCE';
      // this.mapControl.createFeatureProperties( 
      //     featurePropertiesId,
      //     dataSourceType,
      //     dataSource,
      //     keyField,
      //     titleField,
      //     contentFields,
      //     featureOptions
      // );

      // WC_DATARECORDS
      var dataSourceType = 'WC_DATARECORDS';
      var restriction = new Ab.view.Restriction();
      var ds = View.dataSources.get(dataSource);
      var dataRecords = ds.getRecords(restriction);
      this.mapControl.createFeatureProperties( 
          featurePropertiesId,
          dataSourceType,
          dataRecords,
          keyField,
          titleField,
          contentFields,
          featureOptions
      );

      this.mapControl.showFeatures('ctry', 'ctry', '1=1');

    }
    
});

