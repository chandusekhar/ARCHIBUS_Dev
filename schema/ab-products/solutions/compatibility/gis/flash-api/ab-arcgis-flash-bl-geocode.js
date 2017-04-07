
var mapController = View.createController('showMap', {
	// Ab.flash.Map control instance
	mapControl: null,
	
	// building record
	buildingRecord: null,
	buildingRowIndex: null,
	
	// building grid
	selectedBuildingRows: [],
	checkBoxAllSelected: false,
	
	afterViewLoad: function(){
        // initialize the Flash Map control
		this.mapControl = new Ab.flash.Map(
			'mapPanel', 
			'map',
			'blDS',
			true					
		);
	},

    afterInitialDataFetch: function() {
		// disable building panel controls until selection	
		mapController.toggleBuildingPanelControls(false);

		// overrides Grid.onChangeMultipleSelection
		this.blPanel.addEventListener('onMultipleSelectionChange', function(row) {
			var selection = View.panels.get('blPanel').getSelectedRows();
			if( selection[0] ){
				View.controllers.get('showMap').toggleBuildingPanelControls(true);
			}
			else {
				View.controllers.get('showMap').toggleBuildingPanelControls(false);
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
	
	
	/**
	 * Creates a restriction based on selected rows.
	 */
	getSelectedBuildingsRestriction: function() {
		var restriction = new Ab.view.Restriction();

		var selectedRows = this.blPanel.getSelectedRows();  
		if (selectedRows.length !== 0) {
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
			}
		}
		
		return restriction;
	},
	
	blPanel_onShowBuildings: function(rows) {   
		// clear the map
		this.mapControl.clear();
		
		// create the marker property to specify building markers for the map
		var markerProperty = this.mapControl.getMarkerPropertyByDataSource('blDS');
		if (markerProperty == null) {
			markerProperty = new Ab.flash.ArcGISMarkerProperty(
				'blDS', 
				['bl.lat', 'bl.lon'],
				['bl.bl_id'],
				['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
			this.mapControl.updateDataSourceMarkerPropertyPair('blDS', markerProperty);
		}

		// set the map restriction and refresh the map
        this.mapControl.refresh(this.getSelectedBuildingsRestriction());
	}, 

	
	// Ab.arcgis.Geocoder implementation
  	blPanel_onGeocodeBuildings: function(rows) {
  	
  		//create Ab.arcgis.GeoCodeTool
  		//parameter is the Ab.arcgis.ArcGISMap
  		var geocoder = new Ab.arcgis.Geocoder(this.mapControl);
  		geocoder.callbackMethod = this.afterGeocodeComplete;
		
  		var restriction = this.getSelectedBuildingsRestriction(rows);
  		
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
     	
  		geocoder.geoCode( 'blDS',
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
	}	

});
