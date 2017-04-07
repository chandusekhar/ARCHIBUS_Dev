var mapController = View.createController('showMap', {

	// the Ab.leaflet.Map control
	mapControl: null,

	afterViewLoad: function(){
			var configObject = new Ab.view.ConfigObject();
			configObject.mapImplementation = 'Esri';
			configObject.basemap = View.getLocalizedString('World Light Gray Canvas');
			this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
	},

  	afterInitialDataFetch: function() {
		
		var dataSource = 'bl_ds';
		var keyFields = ['bl.bl_id'];
		var geometryFields = ['bl.lon', 'bl.lat'];
		var titleField = 'bl.name';
		var contentFields = ['bl.bl_id', 'bl.use1', 'bl.count_occup'];
		
		var markerProperties = {
			//optional
			radius: 7,
			fillColor: '#e41a1c',
			fillOpacity: 0.90,
			stroke: true,
			strokeColor: '#fff',
			strokeWeight: 1.0,
			// required for thematic markers
			renderer: 'thematic-unique-values',
			thematicField: 'bl.use1',
   			// uniqueValues: ['DATA CENTER','MANUFACTURING','MEDICAL OFFICE','MIXED USE','OFFICE','SALES OFFICE','UNKNOWN','WAREHOUSE'],                   
			// colorBrewerClass: 'Set1'			
			uniqueValues: [],
			colorBrewerClass: 'Paired2'
		};	

		this.mapControl.createMarkers(
			dataSource,
			keyFields,
			geometryFields,
			titleField,
			contentFields,
			markerProperties
		);

		// legend menu
    	var legendObj = Ext.get('showLegend'); 
	    legendObj.on('click', this.showLegend, this, null);    
  	},	

	bl_list_onShowBuildings: function() {  
		 						
		// create restriction from selected rows
		var restriction = new Ab.view.Restriction();
		var selectedRows = mapController.bl_list.getSelectedRows();  
		if (selectedRows.length !== 0) {	
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
			}
		}
		else{
			restriction.addClause('bl.use1', 'null', '=', "OR");
		}
		
		// show the markers on the map
		this.mapControl.showMarkers('bl_ds', restriction);
  	},

  	showLegend: function(){
		mapController.mapControl.showMarkerLegend();
	} 
})
