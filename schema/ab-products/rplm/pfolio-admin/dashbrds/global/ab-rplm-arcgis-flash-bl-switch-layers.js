function afterMapLoad_JS(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.lon', '0', "!=", "OR");
	
	mapControl.refresh(restriction);
}

View.createController('showMap', {
	map: null,
	
	layerMenu: null,
	
	afterViewLoad: function(){   	
		//create map
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
		
		
		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
		var thematicBuckets = ['bl.use1'];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 		
		this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);		

		//layer menu
		var menuObj = Ext.get('layersMenu'); 
		menuObj.on('mouseup', this.showLayerMenu, this, null);   
		
		this.map.addMarkerAction(getMessage("labelShowDetails"), this.showBuildingDetails); 

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
		View.controllers.get('showMap').map.switchBasemapLayer(item.text);
	},
	
	mapPanel_onShowMap: function(str, level) {
		
		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
				
		if( blMarkerProperty == null ){
			blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
			this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
		}

		var thematicBuckets = ['bl.use1'];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 	
		
		if(level > 1){
			this.map.showLabels=true;
		}
		if(level > 2){
			this.map.showLabels=true;
			this.map.labelTextFormatProperties={'color' : '0xfffeee', 'size': 14}
		}
		
		this.map.refresh('1=1 ' + str);

	},
	// show pop up details
	  showBuildingDetails: function(title,attributes) {  
			var bl_id = title;
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bl.bl_id', bl_id, "=", "OR");
			//Ab.view.View.openDialog('ab-arcgis-flash-bl-details-dialog.axvw', restriction, false, 20, 40, 500, 400);   
			
			View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw',null, true, {
				width:1280,
				height:600, 
				closeButton:true,
					afterInitialDataFetch:function(dialogView){
						var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
						dialogController.bl_id = bl_id;
						dialogController.initializeView();
					}
			});
			
		} 
});

