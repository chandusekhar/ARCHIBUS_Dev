View.createController('showMap', {
	
	//the Ab.arcgis.ArcGISMap
	map: null,
	isValidLicense: false,	
	layerMenu: null,
	
	afterViewLoad: function(){
	
		var isValidLicense = hasValidArcGisMapLicense();
		if (!isValidLicense) {	
			View.alert(getMessage('invalid_license'));
			return;
		}
		else if (isValidLicense) {
			var configObject = new Ab.view.ConfigObject();
			this.map = new Ab.arcgis.ArcGISMap('abExGisGisOperationsManagementMap', 'mapDiv', configObject);
		}
	
		//this.map.graphicsMouseOutHandler = function(){};
    	//layer menu
    	var menuObj = Ext.get('layersMenu'); 
	    menuObj.on('mouseover', this.showLayerMenu, this, null);
	    
    },
  
  	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById('mapDiv');      	
      	var bodyElem = reportTargetPanel.parentNode;
      	bodyElem.className = 'claro';     	
  	},
  	
    showLayerMenu: function(e, item){
    	if( this.layerMenu == null ) {
	    	var menuItems = [];		    	
	    	var availableLayers = this.map.getBasemapLayerList();		    	
	    	for( var i = 0; i < availableLayers.length; i++ ) {
		    	menuItems.push({
		            text: availableLayers[i],
		            handler: this.switchMapLayer
		        })     
		  	}
	     	this.layerMenu = new Ext.menu.Menu({items: menuItems});
    	}
        this.layerMenu.showAt(e.getXY());
    },
    
    switchMapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	//this.map.switchMapLayer(item.text);
    	View.controllers.get('showMap').map.switchBasemapLayer(item.text);
    },
    
    showObjectsOnMap: function(rows) {   
        
    	this.map.clear();  
    	
    	if(rows.length > 1) {
    		var dataSourceID = 'abExGisGisOperationsManagementMapBlDs';
    	}
    	else {
    		var dataSourceID = 'abExGisGisOperationsManagementMapWrDs';
    	}
    	
    	var wrMarkerProperty = this.map.getMarkerPropertyByDataSource(dataSourceID);
    	
    	if( wrMarkerProperty == null ){
    		if(rows.length == 1) {
    			var infoWindowFields = ['bl.bl_id','wr.wr_id', 'wr.prob_type', 'wr.date_assigned', 'wr.priority', 'wr.status'];
    		}
    		else {
    			var infoWindowFields = ['bl.bl_id'];
    		}
    		
    		wrMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty(dataSourceID, ['bl.lat', 'bl.lon'],'wr.wr_id',infoWindowFields);
    		
    		//set symbol type for marker
    		//the avaible types are: 'circle', 'cross', 'diamond', 'square', 'x'
    		//'circle' is the default 
    		wrMarkerProperty.setSymbolType('diamond');
    	}
    	
    	//get the restriction based on the selected rows
    	var restriction = new Ab.view.Restriction();
    	if(rows.length == 1 ) { 			
 			//restriction.addClause('wr.wr_id', rows[0]['wr.wr_id'], "=", "OR");
    		restriction = 'wr.wr_id = ' + rows[0]['wr.wr_id'];
    	}
    	else if(rows.length > 1 ) {
 			for (var i = 0; i < rows.length; i++) {
 				restriction.addClause('bl.bl_id', rows[i]['bl.bl_id'], "=", "OR"); 						
 			}
    	}
    	else{
    		restriction.addClause('wr.wr_id', 'is null', "=", "OR");
    	}
    	
    	//set restriction for prMarkerProperty
    	wrMarkerProperty.setRestriction(restriction);
    	
    	//add DataSourceMarkerPropertyPair to map
    	this.map.updateDataSourceMarkerPropertyPair(dataSourceID, wrMarkerProperty);
    	
    	//draw map
    	this.map.refresh();
    },
    showBuildingsOnMap: function(rows) {   
        
    	this.map.clear();  
    	
    	var dataSourceID = 'abExGisGisOperationsManagementMapBlDs';    	
    	
    	var wrMarkerProperty = this.map.getMarkerPropertyByDataSource(dataSourceID);
    	
    	if( wrMarkerProperty == null ){
    		var infoWindowFields = ['bl.bl_id'];
    		
    		
    		wrMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty(dataSourceID, ['bl.lat', 'bl.lon'],'bl.bl_id',infoWindowFields);
    		
    		//set symbol type for marker
    		//the available types are: 'circle', 'cross', 'diamond', 'square', 'x'
    		//'circle' is the default 
    		wrMarkerProperty.setSymbolType('square');
    	}
    	
    	//get the restriction based on the selected rows
    	var restriction = new Ab.view.Restriction();
    	if(rows.length !== 0 ) { 			
 			for (var i = 0; i < rows.length; i++) {
 				restriction.addClause('bl.bl_id', rows[i]['bl.bl_id'], '=', 'OR');
 			}
    	}
    	else{
    		restriction.addClause('bl.bl_id','','IS NULL', 'OR');
    	}    	
    	
    	//set restriction for prMarkerProperty
    	wrMarkerProperty.setRestriction(restriction);
    	
    	//add DataSourceMarkerPropertyPair to map
    	this.map.updateDataSourceMarkerPropertyPair(dataSourceID, wrMarkerProperty);
    	
    	//draw map
    	this.map.refresh();
    }
});



