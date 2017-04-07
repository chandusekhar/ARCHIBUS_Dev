
var mapController = View.createController('showMap', {
	// Ab.arcgis.ArcGISMap control instance
	// the mapControl is equiv to the mapPanel
	mapControl: null, 
	
	// Ab.arcgis.Geocoder control
	geocodeControl: null,

	// Ab.arcgis.AssetLocator control
	assetLocatorControl: null, 
	
	// asset record
	assetRecord: null,
	assetRowIndex: null,
	
	// asset grid
	selectedAssetRows: [],
	checkBoxAllSelected: false,
	
	// asset map extent
	assetMapExtent: null,
	
	// map click handler handle
	dojoMapZoomHandle: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();

    	// create AbArcGIS map control
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject, mapConfigObject);		
		
  		//create Ab.arcgis.Geocoder
  		this.geocodeControl = new Ab.arcgis.Geocoder();

		// disable controls until selection	
		this.toggleMapPanelControls(false);
				
		// overrides Grid.onChangeMultipleSelection
		this.assetPanel.addEventListener('onMultipleSelectionChange', function(row) {
			var selection = View.panels.get('assetPanel').getSelectedRows();
			if( selection[0] ){
				View.controllers.get('showMap').toggleAssetPanelControls(true);
			}
			else {
				View.controllers.get('showMap').toggleAssetPanelControls(false);
			}
		})

		//add the marker action
		//this.mapControl.addMarkerAction('Create Work Order', this.createWorkOrder);

	},
			
	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");
      	var bodyElem = reportTargetPanel.parentNode;    
      	reportTargetPanel.className = 'claro';		
		
		//disable controls until selection
		this.toggleAssetPanelControls(false);
	},	

	onMapLoaded: function() {
		//console.log('mapController -> onMapLoaded...');
        // abps-arcgis-map.js
        //mapController.mapControl.switchReferenceLayer('Land Base', null, referenceLayerLoadedCallback);
        // ab-arcgis-map.js
        mapController.mapControl.switchReferenceLayer('Land Base');
	},
	
    prepareMarkerData: function(){
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('assetDS', ['eq.lat', 'eq.lon'],'eq.eq_id',['eq.eq_std', 'eq.mfr', 'eq.modelno', 'eq.status']);
    	blMarkerProperty.showLabels = false;
    	blMarkerProperty.symbolSize = 12;
    	blMarkerProperty.symbolType = 'diamond';
    	blMarkerProperty.symbolColors = [	
				[227, 26, 28, 0.9],   //default
				[31, 120, 180, 0.9],
				[255, 127, 0, 0.9],
				[51, 160, 44, 0.9],
				[106, 61, 154, 0.9],
				[251, 154, 153, 0.9],
				[166, 206, 227, 0.9],
				[178, 223, 138, 0.9],
				[253, 191, 111, 0.9],
				[202, 178, 214, 0.9]	
		];
		this.mapControl.updateDataSourceMarkerPropertyPair('assetDS', blMarkerProperty);
    },
	
	/**
	 * Creates a restriction based on selected rows.
	 */
	getRestriction: function(rows) {
    	var selectedRows = this.assetPanel.getSelectedRows(rows);  
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('eq.eq_id', selectedRows[i]['eq.eq_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('eq.eq_id', 'null', "=", "OR");
    	}
    	return restriction;
	},
	
	assetPanel_onShowAssets: function(rows) {   

    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('assetDS');
    	
    	if( blMarkerProperty == null ){
    		this.prepareMarkerData();
    		blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('assetDS');
    	}
    	blMarkerProperty.showLabels = false;
    	var restriction = this.getRestriction(rows);
		blMarkerProperty.setRestriction(restriction);
    	this.mapControl.updateDataSourceMarkerPropertyPair('assetDS', blMarkerProperty);
    	this.mapControl.refresh();
		
	}, 
	
	assetPanel_onGeocodeAssets: function(rows) {

  		var restriction = this.getRestriction(rows);
  		
  		//geocodeControl does geocode work
  		//
  		//parameters:
     	//dataSourceName. The dataSource to get records.
     	//restriction. The restriction needed when get dataRecords from dataSource.
     	//tableName. The tableName in which the records's geometry information will be added.
     	//pkField.  The primary key field for tableName.
     	//geometryFields.  The geometryFields for tableName.
     	//addressFields.  	The fields whose value hold the actual address.
     	//replace.  Boolean.  Whether replace the existing geometry information.
     	
  		mapController.geocodeControl.geocode('assetDS',
		                    restriction,
							'eq', 
							'eq.eq_id', 
							['eq.lat', 'eq.lon'], 
							['eq.eq_std', 'eq.mfr', 'eq.modelno', 'eq.status'], 
							true);
	},

	assetPanel_afterRefresh : function() {
		var grid = this.assetPanel;
		var selectedRows = this.selectedAssetRows;
		for(var i=0; i < selectedRows.length; i++) {
			var index = selectedRows[i].row.getIndex();
			grid.selectRowChecked(index, true);
		}

		if(this.checkAllBoxSelected){
			var checkAllEl = Ext.get('assetPanel_checkAll');
			checkAllEl.dom.checked = true;
		}
		
		// re-select active asset row
		if (this.assetRowIndex) {
			grid.selectRow(assetRowIndex);
		}
		
		this.selectedAssetRows = [];
		this.checkAllBoxSelected = false;
	},
	
	onLocateAsset: function(row) {
		
		if (mapController.assetLocatorControl === null) {
			mapController.assetLocatorControl = new Ab.arcgis.AssetLocator(mapController.mapControl);
		}

		var restriction = new Ab.view.Restriction();
		if (row) {
			restriction.addClause('eq.eq_id', row['eq.eq_id'], "=", "OR");
			// save the record object
			assetRecord = row.row.getRecord();
			assetRowIndex = row.index;
		}
		
		// if there is a ds restriction, a refresh will cause the map to zoom to the extent 
		// of the current restriction... undesireable under most circumstances
		// re-zoom map to location asset  
		var lon = row['eq.lon.raw'] || row['eq.lon'];
		var lat = row['eq.lat.raw'] || row['eq.lat'];
		if (!!lon && !!lat) {
			var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
			var mapLevel = mapController.mapControl.map.getLevel();
			if ( mapLevel > 17 ) {
				//mapController.mapControl.map.centerAt( point );
				mapController.mapControl.setMapCenterAndZoom(lon, lat, mapLevel);
			}
			else {
				//mapController.mapControl.map.centerAndZoom( point, 17 );
				mapController.mapControl.setMapCenterAndZoom(lon, lat, 17);
			}
		}
		else
		{
			// geometry doesnt exist -- just stay where we are and let the user navigate the map
		}
		
		// END traditional marker property approach
		
		// enable/disable various controls
		mapController.toggleMapPanelControls(true);
		mapController.toggleAssetPanelControls(false);
		mapController.toggleCheckBoxControls(true);
		
		// perform location
		//
		// parameters:
		// dataSourceName - the dataSource to get records from
		// restriction - the restriction to apply to the datasource
		// pkField - the primary key field for the table
		// geometry fields - an array of geometry fields for the table
		// infoFields - an array of fields to display in the infoWindow
		// 
		
		mapController.assetLocatorControl.startLocate(
			'assetDS',
			restriction,
			'eq.eq_id',
			['eq.lon', 'eq.lat'],
			['eq.eq_std', 'eq.eq.mfr', 'eq.modelno', 'eq.status']
		);	
	},

	mapPanel_onCancelLocateAsset: function() {
		this.toggleMapPanelControls(false);
		this.toggleCheckBoxControls(false);
		this.assetLocatorControl.cancelLocate();
	},
	
	mapPanel_onFinishLocateAsset: function() {
		
		// get coords and save asset record
		var assetCoords = this.assetLocatorControl.finishLocate();
		var lon = assetCoords[0];
		var lat = assetCoords[1];
		assetRecord.setValue('eq.lon', lon);
		assetRecord.setValue('eq.lat', lat);
		this.assetDS.saveRecord(assetRecord);
		
		this.selectedAssetRows = this.assetPanel.getSelectedRows();
		var checkAllEl = Ext.get('assetPanel_checkAll');
	    this.checkAllBoxSelected = checkAllEl.dom.checked;
		
		this.assetPanel.refresh();
		
		// disable/enable panel actions
		this.toggleMapPanelControls(false);
		this.toggleAssetPanelControls(true);
		this.toggleCheckBoxControls(false);

		// refresh map graphics in case assets are showing
		var restriction = mapController.getRestriction();
		this.mapControl.refresh(restriction);	
		
		// if restriction -- reset map extent
		// should this be in the core ??? 
		dojoMapZoomHandle = dojo.connect(this.mapControl.map, 'onZoomEnd', mapController.zoomToAssetMapExtent);
	},
	
	zoomToAssetMapExtent: function(extent, zoomFactor, anchor, level) {
		// remove map listener
		dojo.disconnect( dojoMapZoomHandle );
		
		if ( mapController.assetMapExtent ) {
			mapController.mapControl.map.setExtent( mapController.assetMapExtent );
			mapController.assetMapExtent = null;		
		}		
	},
	
	toggleAssetPanelControls: function(value) {
		this.assetPanel.actions.get('showAssets').forcedDisabled = false;
		//this.assetPanel.actions.get('geocodeAssets').forcedDisabled = false;
		this.assetPanel.actions.get('showAssets').enable(value);
		//this.assetPanel.actions.get('geocodeAssets').enable(value);
	},
	
	toggleMapPanelControls: function(value) {
		this.mapPanel.actions.get('cancelLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('finishLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('cancelLocateAsset').enable(value);
		this.mapPanel.actions.get('finishLocateAsset').enable(value);
	},
	
	toggleCheckBoxControls: function(value) {
		// get all inputs
		var inputs = Ext.query('input');
		// disable checkboxes only
		for(i=0; i < inputs.length; i++) {
			if (inputs[i].type == 'checkbox') {
				inputs[i].disabled = value;
			}
		}
	},

	createWorkOrder: function(title, attributes) {
		//console.log('mapController -> createWorkOrder...');
    	
    	var eq_id = title;
    		
    	//openDialog: function(url, restriction, newRecord, x, y, width, height) {
  		var restriction = {
          	'eq.eq_id': eq_id
      	};
      
      	var allowCreateRecord = true;
      	var defaultDialogX = 20;
      	var defaultDialogY = 40;
      	var defaultDialogWidth = 800;
      	var defaultDialogHeight = 600; 
    		AFM.view.View.openDialog('ab-bldgops-console-wr-create.axvw', restriction, false, 20, 40, 800, 600);   	

	}

});

function mapLoadedCallback() {
    //console.log('mapLoadedCallback...');
    mapController.onMapLoaded();
}
function referenceLayerLoadedCallback() {
    //console.log('referenceLayerLoadedCallback...');
    //mapController.onReferenceLayerLoaded();
}

function featureLayerInitCallback() {
    //console.log('featureLayerInitCallback...');
    //mapController.onFeatureLayerInit();
}

function featureLayerLoadedCallback() {
    //console.log('featureLayerLoadedCallback...');
    //mapController.onFeatureLayerLoaded();
}

function featureLayerClickCallback(featureType, featureId) {
    //console.log('featureLayerClickCallback...');
    //mapController.onFeatureLayerClick(featureType, featureId);
}
