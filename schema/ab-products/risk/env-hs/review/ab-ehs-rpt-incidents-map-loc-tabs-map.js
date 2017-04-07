/**
 * override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function mapLoadedCallback() {

	// resize the map info window
	abEhsRptIncidentsMapLocTabsMapCtrl.map.map.infoWindow.resize(300,150);

	// switch to the gray canvas basemap
	abEhsRptIncidentsMapLocTabsMapCtrl.map.switchBasemapLayer.defer(500, abEhsRptIncidentsMapLocTabsMapCtrl.map, ['World Gray Canvas with Labels']);

}

var abEhsRptIncidentsMapLocTabsMapCtrl = View.createController('abEhsRptIncidentsMapLocTabsMapCtrl', {

	// the map object itself
	map: null,

	// building records
	records : null,

	// marker property of the map control
	markerProperty : null,
	
	//selected tree items
	nodes : null,
	
	// selected locations
	locations: null,
	
	// current restriction
	restriction : null,
	
	afterViewLoad : function() {
		// initialize the map control after the view load
		this.initializeMap();

		if (this.mapPanel.actions.get('mapPanel_showAsDialog')) {
			this.mapPanel.actions.get('mapPanel_showAsDialog').show(false);
		}
		
		// basemap layer menu
 	    var basemapLayerMenu = this.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = abEhsRptIncidentsMapLocTabsMapCtrl.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}
		
	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
		abEhsRptIncidentsMapLocTabsMapCtrl.map.switchBasemapLayer(item.text);
    },

  	afterInitialDataFetch: function() {

      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},

	/**
	 * initialize map object
	 */
	initializeMap : function() {
		this.isValidLicense = hasValidArcGisMapLicense();
		if (!this.isValidLicense) {
			this.disableControl();
			return;
		} else if (this.isValidLicense) {
			var configObject = new Ab.view.ConfigObject();
			this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
			this.map.addMarkerAction(getMessage("labelOpenDetails"), this.onClickMarker);			
		}
		
		// switch to the gray canvas basemap
		abEhsRptIncidentsMapLocTabsMapCtrl.map.switchBasemapLayer.defer(500, abEhsRptIncidentsMapLocTabsMapCtrl.map, ['World Gray Canvas with Labels']);

	},
	
	/**
	 * disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.getOpenerView().panels.get('abEhsRptIncidentsMapLocTabs_tabs');
		tabs.hideTab('abEhsRptIncidentsMapLocTabs_tabMap');
	},

	/**
	 * Show selected buildings on map.
	 * 
	 * @param nodes array with tree selected buildings
	 * @param locations array with incident locations
 	 */
	showSelectedBuildings : function(nodes, locations) {
		if (!this.isValidLicense) {
			return;
		}
		this.nodes = nodes;
		this.locations = locations;
		
		this.refreshMap();
	},
	
	refreshMap: function(){
		if ((valueExists(this.nodes) && this.nodes.length > 0) 
				|| (valueExists(this.locations) && this.locations.length > 0)) {
			var consoleController = View.getOpenerView().getOpenerView().controllers.get('abEhsRptIncidentsMapConsoleCtrl');
			if (!consoleController.validateFilter()) {
				return false;
			}
			
			this.restriction = consoleController.getConsoleRestriction().consoleRestriction;

			if (valueExists(this.nodes) && this.nodes.length > 0) {
				this.restriction.addClause('bl.bl_id', this.nodes, 'IN');
			}
			if (valueExists(this.locations) && this.locations.length > 0) {
				this.restriction.addClause('bl.bl_id', this.locations, 'IN');
			}
			this.map.dataSourceId = 'abEhsRptIncidentsMapLocTabsMap_dsBuilding';

			this.records = this.abEhsRptIncidentsMapLocTabsMap_dsBuilding.getRecords(this.restriction);
			this.createMarkers();
		}else {
			this.map.clear();
			return false;
		}
	},
	
	/**
	 * show markers on map
	 */
	createMarkers : function() {
		this.map.thematicLegend = null;
		// remove legend DOM element if exists
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.remove();
		}
		this.markerProperty = this.getIncidentMarkerProperty();
		
		this.map.buildThematicLegend(this.markerProperty);
		
		this.map.updateDataSourceMarkerPropertyPair(this.map.dataSourceId, this.markerProperty);
		// let the map be created, THEN refresh it
		//this.map.refresh.defer(999, this.map, [this.restriction]);
		this.map.refresh(this.restriction);
		
		
	},
	
	getIncidentMarkerProperty: function(){
		var markerProperty = this.map.getMarkerPropertyByDataSource(this.abEhsRptIncidentsMapLocTabsMap_dsBuilding);
		
		if(markerProperty == null) {
			var infoWindowFields = ['bl.site_id', 'bl.bl_id', 'bl.name', 'ehs_incidents.vf_incidents_num'];
			markerProperty = new Ab.arcgis.ArcGISMarkerProperty('abEhsRptIncidentsMapLocTabsMap_dsBuilding',['bl.lat', 'bl.lon'],'bl.bl_id',infoWindowFields);
			markerProperty.setSymbolType('diamond');
			markerProperty.symbolSize = 24;
			markerProperty.thematicNoDataClass = false;
		}
		
		var buckets = this.getBuckets('ehs_incidents.vf_incidents_num');
		
		markerProperty.sizeBuckets = [{
			limit : buckets[0],
			symbolSize : 20
		}, {
			limit : buckets[1],
			symbolSize : 35
		}, {
			limit : buckets[2],
			symbolSize : 45
		}, {
			limit : buckets[3],
			symbolSize : 55
		}];
		
		var colorsBuckets;
		//var colors;
		// add color thematic in the property
		/*var colors =   [   [140, 140, 140, 0.9],
				[255,255,178,0.9],
				[254,204,92,0.9],
				[253,141,60,0.9],
				[240,59,32,0.9],
				[189,0,38,0.9]    
			];*/
		colorsBuckets = this.getBuckets('ehs_incidents.vf_incidents_num');
		
		//KB3045501 - Map legend colors are not correct according to MSDS Geographic Drill-Down
		markerProperty.symbolColors = this.map.colorbrewer2rgb(colorbrewer.YlOrRd[5]);
		
		markerProperty.setThematic('ehs_incidents.vf_incidents_num', colorsBuckets);
		//markerProperty.setSize('ehs_incidents.vf_incidents_num', colorsBuckets);
		
		return  markerProperty;
	},
	
	/**
	 * get buckets by field
	 * 
	 * @param {field}
	 *            field name
	 */
	getBuckets : function(field) {
		var buckets = [0];
		var records = this.records;
		if (records && records.length > 0) {
			var minVal = Number.MAX_VALUE;
			var maxVal = (-1) * Number.MAX_VALUE;
			for ( var i = 0; i < records.length; i++) {
				var record = records[i];
				var value = parseInt(record.getValue(field));
				minVal = Math.min(minVal, value);
				maxVal = Math.max(maxVal, value);
			}
			var buckets = new Array();
			if (minVal != maxVal) {
				var bucketCount = 0;
				for ( var i = 0; i < 4; i++) {
					var val = new Number(minVal + ((maxVal - minVal) / 5) * (i + 1));
					var bucket = parseInt(val.toFixed(0).toString());
					if(i>0){
						if(buckets[bucketCount-1] != bucket){
							buckets[bucketCount++] = bucket;
						}
					} else {
						buckets[bucketCount++] = bucket;
					}
				}
			} else {
				buckets[0] = parseInt(minVal.toString());
			}
		}
		return buckets;
	},
	/**
	 * hide legend when tab is changed
	 */
	hideLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(false);
		}
	},
	/**
	 * show legend when tab is selected
	 */
	showLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(true);
		}
	},
	/**
	 * onClickMarker open a report for selected item
	 */
	onClickMarker : function(title, attributes) {
		//var attributes = eval("(" + attributes + ")");
		var blId = attributes['bl.bl_id'];
		var tabsController = View.getOpenerView().controllers.get('abEhsRptIncidentsMapLocTabsCtrl');
		tabsController.showBuildingDetails(blId);
	}
});

