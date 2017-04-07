View.createController('mapController', {
	
	//the Ab.arcgis.ArcGISMap
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
    },
  
  	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},

    pr_list_onShowProperties: function(rows) {   
    
    	var selectedRows = this.pr_list.getSelectedRows(rows);  
    	
    	var prMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('pr_ds');
    	
		if( prMarkerProperty == null ){
    		var infoWindowFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
    		prMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('pr_ds', ['property.lat', 'property.lon'],'property.pr_id',infoWindowFields);
    	}
 
		// disable marker labels
		prMarkerProperty.showLabels = false;
			
    	//get the restriction based on the selected rows
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('property.pr_id', 'null', "=", "OR");
    	}
    	
    	//set restriction for prMarkerProperty
    	prMarkerProperty.setRestriction(restriction);
    	
    	//add DataSourceMarkerPropertyPair to map
    	this.mapControl.updateDataSourceMarkerPropertyPair('pr_ds', prMarkerProperty);
    	
    	//draw map
    	this.mapControl.refresh();
  	} 
})

