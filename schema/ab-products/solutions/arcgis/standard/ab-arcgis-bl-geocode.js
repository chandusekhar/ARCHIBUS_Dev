
var mapConfigObject = {
    'basemapLayerList' : [
        {
            name: 'World Street Map', 
            url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        },
        {
            name: 'World Imagery', 
            url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        },
        {
            name: 'World Topographic',
            url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
        }
    ],
};

var mapController = View.createController('mapController', {
	// the Ab.arcgis.ArcGISMap control 
	mapControl: null,

	// the Ab.arcgis.Geocoder control
	geocodeControl: null,

	// building record
	buildingRecord: null,
	buildingRowIndex: null,
	
	// building grid
	selectedBuildingRows: [],
	checkBoxAllSelected: false,
	
	afterViewLoad: function(){
    	// create map
    	var configObject = new Ab.view.ConfigObject();
    	mapController.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);

  		//create geocoder
  		mapController.geocodeControl = new Ab.arcgis.Geocoder(this.mapControl);
  		mapController.geocodeControl.callbackMethod = mapController.afterGeocodeComplete;

        // basemap layer menu
        var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
        basemapLayerMenu.clear();
        var basemapLayers = mapController.mapControl.getBasemapLayerList();
        for (var i=0; i<basemapLayers.length; i++){
            basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
        }

    },

    afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");
      	var bodyElem = reportTargetPanel.parentNode;    
      	reportTargetPanel.className = 'claro';

		// disable building panel controls until selection	
		mapController.toggleBuildingPanelControls(false);

		// overrides Grid.onChangeMultipleSelection
		this.blPanel.addEventListener('onMultipleSelectionChange', function(row) {
			var selection = View.panels.get('blPanel').getSelectedRows();
			if( selection[0] ){
				View.controllers.get('mapController').toggleBuildingPanelControls(true);
			}
			else {
				View.controllers.get('mapController').toggleBuildingPanelControls(false);
			}
		})		
	},

	blPanel_afterRefresh : function() {
		var grid = this.blPanel;
		var selectedRows = this.selectedBuildingRows;
		for(var i=0; i < selectedRows.length; i++) {
			var index = selectedRows[i].row.getIndex();
			grid.selectRowChecked(index, true);
		}

		if(this.checkAllBoxSelected){
			var checkAllEl = Ext.get('blPanel_checkAll');
			checkAllEl.dom.checked = true;
		}
		
		// re-select active building row
		if (this.buildingRowIndex) {
			grid.selectRow(buildingRowIndex);
		}
		
		this.selectedBuildingRows = [];
		this.checkAllBoxSelected = false;
		this.buildingRowIndex = null;
	},	
	
    prepareData: function(){
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('blDS', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	blMarkerProperty.showLabels = false;
		this.mapControl.updateDataSourceMarkerPropertyPair('blDS', blMarkerProperty);
    },
    
    getRestriction: function(rows) {
    
    	var selectedRows = this.blPanel.getSelectedRows(rows);  
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('bl.bl_id', 'null', "=", "OR");
    	}
    	
    	return restriction;
    },
    
    blPanel_onShowBuildings: function(rows) {   
    
    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('blDS');
    	
    	if( blMarkerProperty == null ){
    		this.prepareData();
    		blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('blDS');
    	}
		blMarkerProperty.showLabels = false;
    	var restriction = this.getRestriction(rows);
    	blMarkerProperty.setRestriction(restriction);
    	this.mapControl.updateDataSourceMarkerPropertyPair('blDS', blMarkerProperty);
    	this.mapControl.refresh();
  	}, 
  	
  	blPanel_onGeocodeBuildings: function(rows) {
		
  		var restriction = this.getRestriction(rows);
  		
  		//geoCodeTool does geoCode work
  		//
  		//parameters:
     	//dataSourceName. The dataSource to get records.
     	//restriction. The restriction needed when get dataRecords from dataSource.
     	//tableName. The tableName in which the records's geometry information will be added.
     	//pkField.  The primary key field for tableName.
     	//geometryFields.  The geometryFields for tableName.
     	//addressFields.  	The fields whose value hold the actual address.
     	//replace.  Boolean.  Whether replace the existing geometry information.
     	
  		mapController.geocodeControl.geocode( 'blDS',
							 restriction,
							 'bl', 
							 'bl.bl_id', 
							 ['bl.lat', 'bl.lon'], 
							 ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], 
							 true );
  	},
	
	afterGeocodeComplete: function() {
		// preserve grid state
		mapController.selectedBuildingRows = mapController.blPanel.getSelectedRows();
		if (mapController.selectedBuildingRows.length == 1) {
			mapController.buildingRowIndex = mapController.selectedBuildingRows[0].row.getIndex();
		}
		var checkAllEl = Ext.get('blPanel_checkAll');
		mapController.checkAllBoxSelected = checkAllEl.dom.checked;
		// refresh the grid
		mapController.blPanel.refresh();
	},
	
	toggleBuildingPanelControls: function(value) {
		this.blPanel.actions.get('showBuildings').forcedDisabled = false;
		this.blPanel.actions.get('geocodeBuildings').forcedDisabled = false;
		this.blPanel.actions.get('showBuildings').enable(value);
		this.blPanel.actions.get('geocodeBuildings').enable(value);
	},

    switchBasemapLayer: function(item) {
        //switch the map layer based on the passed in layer name.
        mapController.mapControl.switchBasemapLayer(item.text);
    } 	
});
