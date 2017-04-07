/**
 * This function is called from the Flash Map control after it is loaded. 
 * In this example, it applies a restriction to the map to display buildings located in the state of Pennsylvania, US.  
 * 
 * @param {panelId} The ID of the parent HTML panel defined in the AXVW file.
 * @param {mapId}   The ID of the EMBED element that hosts the map control SWF file. 
 */
function afterMapLoad_JS(panelId, mapId) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.state_id', 'PA', "=", "OR");
	mapControl.refresh(restriction);
}

View.createController('showMap', {
	// Ab.flash.Map control instance
	map: null,
	
	// Ext.menu.Menu to display the map layer names
	layerMenu: null,
	
	afterViewLoad: function(){   	
        // initialize the Flash Map control
		this.map = new Ab.flash.Map(
			'mapPanel', 
			'map',
			'bl_ds',
			true					
		);
		
		var markerProperty = new Ab.flash.ArcGISMarkerProperty(
			'bl_ds', 
			['bl.lat', 'bl.lon'], 
			['bl.bl_id'], 
			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
		this.map.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);
		
		// attach a mouse-over event handler to the Select Map Layer button
		var menuObj = Ext.get('layersMenu'); 
		menuObj.on('mouseover', this.showLayerMenu, this, null);   
	},

	/**
	 * Displays the menu.
	 */
	showLayerMenu: function(e, item) {
		// create the menu, if not created yet
		if (this.layerMenu == null) {
			var menuItems = [];
			var handler = this.switchMapLayer.createDelegate(this);
			
			var availableLayers = this.map.getAvailableMapLayerList();
			for (var i = 0; i < availableLayers.length; i++) {
				menuItems.push({
					text: availableLayers[i],
					handler: handler
				})     
			}
			
			this.layerMenu = new Ext.menu.Menu({items: menuItems});
		}
		
		// display the menu at the mouse position
		this.layerMenu.showAt(e.getXY());
	},
	
	/**
	 * Called from the layer menu to select a layer.
	 */
	switchMapLayer: function(item) {
		this.map.map.switchMapLayer(item.text);
	},
	
	/**
	 * Called when the user clicks on the Show Buildings button.
	 */
	mapPanel_onShowBuildings: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.state_id', 'PA', "=", "OR");
		this.map.refresh(restriction);
	}
});

