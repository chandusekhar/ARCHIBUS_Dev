View.createController('mapController', {
	
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
    },
  
  	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},
    
   	consolePanel_onFilter: function(){	
    	this.resetBuildings();
    },
    
    resetBuildings: function(){
    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('bl_ds');
    	blMarkerProperty.showLabels = false;
		if( blMarkerProperty != null ){
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause('bl.bl_id', 'null', "=", "OR");
    		blMarkerProperty.setRestriction(restriction);
    		this.mapControl.refresh();
    	}
    },
    
    consolePanel_onClear: function(){
    	this.resetBuildings();
    },
    
    /*
     * set drawing settings for properties	
     * the marker colors for different datasources are pre-defined 
     */
    pr_list_onShowProperties: function(rows) {   
    
    	var selectedRows = this.pr_list.getSelectedRows(rows);  	
    	var prMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('pr_ds');
    	
    	if( prMarkerProperty == null ){
    		var infoWindowFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
    		prMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('pr_ds', ['property.lat', 'property.lon'],'property.pr_id',infoWindowFields);
    		prMarkerProperty.setSymbolType('diamond');
        prMarkerProperty.symbolColors = [[55,126,184]];
    		this.mapControl.updateDataSourceMarkerPropertyPair('pr_ds', prMarkerProperty);
    	}
    	
		prMarkerProperty.showLabels = false;
		
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('property.pr_id', 'null', "=", "OR");
    	}
    	prMarkerProperty.setRestriction(restriction);
    	this.mapControl.refresh();
  	}, 
  	
  	/*
     * set drawing settings for buildings	
     * the marker colors for different datasources are pre-defined 
     */
  	bl_list_onShowBuildings: function(rows) {   
    
    	var selectedRows = this.bl_list.getSelectedRows(rows);  
    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('bl_ds');
    	if( blMarkerProperty == null ){
    		var infoWindowFields = ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id'];
    		blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',infoWindowFields);
    		blMarkerProperty.setSymbolType('circle');
    		this.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	}
    	
		blMarkerProperty.showLabels = false;
		
    	var restriction = new Ab.view.Restriction();	
 		if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
 			}
 		}
 		else{
 			restriction.addClause('bl.bl_id', 'null', "=", "OR");
 		}
    	blMarkerProperty.setRestriction(restriction);
    	this.mapControl.refresh();
  	} 
});


