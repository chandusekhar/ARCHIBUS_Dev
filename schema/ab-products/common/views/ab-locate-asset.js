
var assetTypeParams = new Ext.util.MixedCollection();
assetTypeParams.addAll(
		{id: 'bl', assetDsName: 'assetDS', primaryKey: 'bl.bl_id'},
		{id: 'property', assetDsName: 'propertyDS', primaryKey: 'property.pr_id'},
		{id: 'eq', assetDsName: 'eqDS', primaryKey: 'eq.eq_id'},
		{id: 'ta', assetDsName: 'taDS', primaryKey: 'ta.ta_id'}
	);

var mapController = View.createController('mapController', {
	// Ab.arcgis.ArcGISMap control instance
	// the mapControl is equiv to the mapPanel
	mapControl: null, 
	
	// Ab.arcgis.Geocoder control
	geocodeControl: null,

	// Ab.arcgis.AssetLocator control
	assetLocatorControl: null, 
	
	// asset map extent
	assetMapExtent: null,
	
	// map click handler handle
	dojoMapZoomHandle: null,
	
	// asset type, valid values (same as asset table name): 'bl', 'property', 'eq', 'ta'. Default value is 'bl' to ensure backward compatibility.
	assetType: 'bl',
	
	//asset record
	record: null,
	
	// this property may contain a callback function reference that will be called when this dialog is closed
    onClose: null,
	
	afterViewLoad: function(){
  		this.record = View.parameters.record;
  		this.onClose = View.parameters.callback;
  		
  		if (View.parameters.assetType) {
  			this.assetType = View.parameters.assetType;
  		}
  		
  		var configObject = new Ab.view.ConfigObject();
    	// create AbArcGIS map control
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);		
  		//create Ab.arcgis.Geocoder
  		this.geocodeControl = new Ab.arcgis.Geocoder();

	},
	
	
	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");
      	reportTargetPanel.className = 'claro';	
      	
      	// delay locate event until full map is loaded
      	// locator initialization throw error graphics undefined
      	this.onLocateAsset.defer(1500, this);
	},	
	
    onLocateAsset: function() {
    	
		if(this.record === null){
			return;
		}

		var assetDsName = assetTypeParams.get(this.assetType).assetDsName;
		var primaryKey = assetTypeParams.get(this.assetType).primaryKey;
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause(primaryKey, this.record.getValue(primaryKey), "=", "OR");
		
		// if there is a ds restriction, a refresh will cause the map to zoom to the extent 
		// of the current restriction... undesireable under most circumstances
		// re-zoom map to location asset  
		var tableName = this.assetType;
		var lon = this.record.getValue(tableName + '.lon');
		var lat = this.record.getValue(tableName + '.lat');
		if (!!lon && !!lat) {
			var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
			var mapLevel = this.mapControl.map.getLevel();
			if ( mapLevel > 17 ) {
				this.mapControl.map.centerAt( point );
			}
			else {
				this.mapControl.map.centerAndZoom( point, 17 );
			}
		}
		else
		{
			// geometry doesnt exist -- just stay where we are and let the user navigate the map
		}
		
		// END traditional marker property approach
		
		// enable/disable various controls
		this.toggleMapPanelControls(true);
		
		// perform location
		//
		// parameters:
		// dataSourceName - the dataSource to get records from
		// restriction - the restriction to apply to the datasource
		// pkField - the primary key field for the table
		// geometry fields - an array of geometry fields for the table
		// infoFields - an array of fields to display in the infoWindow
		// 
		if (this.assetLocatorControl === null) {
			this.assetLocatorControl = new Ab.arcgis.AssetLocator(this.mapControl);
		}
		
		this.assetLocatorControl.startLocate(
			assetDsName,
			restriction,
			primaryKey,
			[tableName + '.lon', tableName + '.lat'],
			[tableName + '.address1', tableName + '.city_id', tableName + '.state_id', tableName + '.ctry_id']
		);	
	},
	
	mapPanel_onCancelLocateAsset: function() {
		View.closeThisDialog();		
	},
	
	mapPanel_onFinishLocateAsset: function() {
		
		// get coords and save asset record
		var assetCoords = this.assetLocatorControl.finishLocate();
		var lon = assetCoords[0];
		var lat = assetCoords[1];
		var tableName = this.assetType;
		this.record.setValue(tableName + '.lon', lon);
		this.record.setValue(tableName + '.lat', lat);

		var assetDsName = assetTypeParams.get(this.assetType).assetDsName;
		View.dataSources.get(assetDsName).saveRecord(this.record);
		
		// disable/enable panel actions
		this.toggleMapPanelControls(false);
		
		// call the callback if it is set
        if (this.onClose) {
            this.onClose();
        }

		View.closeThisDialog();
	},
	
	zoomToAssetMapExtent: function(extent, zoomFactor, anchor, level) {
		// remove map listener
		dojo.disconnect( dojoMapZoomHandle );
		
		if ( mapController.assetMapExtent ) {
			mapController.mapControl.map.setExtent( mapController.assetMapExtent );
			mapController.assetMapExtent = null;		
		}		
	},
	
	toggleMapPanelControls: function(value) {
		this.mapPanel.actions.get('cancelLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('finishLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('cancelLocateAsset').enable(value);
		this.mapPanel.actions.get('finishLocateAsset').enable(value);
	}
	
});
