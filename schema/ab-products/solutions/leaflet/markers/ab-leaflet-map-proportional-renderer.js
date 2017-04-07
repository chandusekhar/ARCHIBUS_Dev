var mapController = View.createController('showMap', {

	// the Ab.leaflet.ArcGISMap control
	mapControl: null,

	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
		this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
	},

  	afterInitialDataFetch: function() {
			
		var dataSource = 'bl_ds';	
		var keyFields = ['bl.bl_id'];								
		var geometryFields = ['bl.lon', 'bl.lat'];
		var titleField = 'bl.name';							
		var contentFields = ['bl.bl_id', 'bl.radius_evac']; 	

		var markerProperties = {
			// optional
			radius: 7,
			fillColor: '#e41a1c',
			fillOpacity: 0.70,
			stroke: true,
			strokeColor: '#fff',
			strokeWeight: 2.0,
			opacity: 0.9,
			// required for proportional markers
			renderer: 'proportional',
			proportionalField: 'bl.radius_evac'
		};	

	    // enable proportional markers
	    // parameters:
	    //    proportionalField : the field containing the data value 
	    //    proportionalValueUnit : the unit of measurement of the data values 
	    //    proportionalValueRepresentation: what the data value represents in the real world

	    //markerProperty.setProportional('bl.radius_evac', 'meters', 'radius');

		this.mapControl.createMarkers(
			dataSource,
			keyFields,
			geometryFields,
			titleField,
			contentFields,
			markerProperties
		);

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
			restriction.addClause('bl.radius_evac', 'null', '=', "OR");
		}

		// show the markers on the map
		this.mapControl.showMarkers('bl_ds', restriction);
  }

});



