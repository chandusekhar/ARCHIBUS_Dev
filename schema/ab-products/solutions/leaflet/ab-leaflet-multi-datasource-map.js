var mapController = View.createController('mapController', {
	
  // the Ab.leaflet.Map
	mapControl: null,
	
  afterViewLoad: function(){
      var configObject = new Ab.view.ConfigObject();
      this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
    },
  
  	afterInitialDataFetch: function() {
        // create property markers
        var prDataSource = 'pr_ds';
        var prKeyFields = ['property.pr_id'];
        var prGeometryFields = ['property.lon', 'property.lat'];
        var prTitleField = 'property.name';
        var prContentFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
    
        var prMarkerProperties = {
            radius: 12
        }; 

        this.mapControl.createMarkers(
            prDataSource, 
            prKeyFields,
            prGeometryFields,
            prTitleField,
            prContentFields,
            prMarkerProperties
        );

        // create building markers
        var blDataSource = 'bl_ds';
        var blKeyFields = ['bl.bl_id'];
        var blGeometryFields = ['bl.lon', 'bl.lat'];
        var blTitleField = 'bl.name';
        var blContentFields = ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id'];
        
        var blMarkerProperties = {
            radius: 8,
             fillColor: '#377eb8'
        }; 

        this.mapControl.createMarkers(
            blDataSource, 
            blKeyFields,
            blGeometryFields,
            blTitleField,
            blContentFields,
            blMarkerProperties
        );
    },
     
    /*
     * set drawing settings for properties	
     * the marker colors for different datasources are pre-defined 
     */
    pr_list_onShowProperties: function(rows) {   
    
      // get selected rows from grid
    	var selectedRows = this.pr_list.getSelectedRows(rows);  	
    	
      // create restriction based on selected rows		
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('property.pr_id', 'null', "=", "OR");
    	}

      //show the markers on the map
      this.mapControl.showMarkers('pr_ds', restriction);     

  	}, 
  	
  	/*
     * set drawing settings for buildings	
     * the marker colors for different datasources are pre-defined 
     */
  	bl_list_onShowBuildings: function(rows) {   
      
      // get selected rows from grid
    	var selectedRows = this.bl_list.getSelectedRows(rows);  
    	
      // create restriction bases on selected rows
      var restriction = new Ab.view.Restriction();	
   		if(selectedRows.length !== 0 ) {
   			for (var i = 0; i < selectedRows.length; i++) {
   				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
   			}
   		}
   		else{
   			restriction.addClause('bl.bl_id', 'null', "=", "OR");
   		}

      //show the markers on the map
      this.mapControl.showMarkers('bl_ds', restriction);

  	} 
});


