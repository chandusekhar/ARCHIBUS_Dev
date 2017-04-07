View.createController('mapController', {
	
	//the Ab.leaflet.Map
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
    },
  
  	afterInitialDataFetch: function() {

        var dataSource = 'pr_ds';
        var keyFields = ['property.pr_id'];
        var geometryFields = ['property.lon', 'property.lat'];
        var titleField = 'property.name';
        var contentFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
    
        var markerProperties = {
            radius: 8
        }; 

        this.mapControl.createMarkers(
            dataSource,
            keyFields, 
            geometryFields,
            titleField,
            contentFields,
            markerProperties);
  	},

    pr_list_onShowProperties: function(rows) {   
        
        // get selected rows from grid
    	var selectedRows = this.pr_list.getSelectedRows(rows);  
    	    				
    	// create restriction based on the selected rows
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

  	} 
})

