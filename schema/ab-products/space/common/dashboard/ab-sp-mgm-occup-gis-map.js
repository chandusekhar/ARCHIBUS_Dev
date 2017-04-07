function mapLoadedCallback(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.lon', '0', "!=", "OR");
	gisController.mapControl.refresh(restriction);
}

var mapConfigObject = {
	"mapLoadedCallback" : mapLoadedCallback
};

var gisController = View.createController('gisController', {

	mapCustomFillColors : ['#2979ad','#6b3c9c','#399e31','#9cc7d6','#add384','#ff7d00','#ff9a9c','#f7ba6b','#c6aece','#f7dd6b'],

	// flash map controll
	map : null,

	// flag of is valid license of gis
	isValidLicense : true,
	resFromShowFunction:'',

  	locMetricDashCtrl:null,

	afterInitialDataFetch: function(){
		initialDashCtrl(this);
	},

	refreshChart:function(){
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;
		var treeRes = this.locMetricDashCtrl.treeCtrl.treeRes;
		this.showSelectedBuildings(treeRes+" AND "+consoleCtrl.blIdRes+" AND "+consoleCtrl.siteIdRes);
	},

	afterViewLoad: function(){		
		this.initializeMap();
		this.addMakers.defer(1000);
	},
	
	hideMapPanel:function(){
		gisController.mapPanel.show(false);
	},
	
	/**
	 * initialize map object
	 */
	initializeMap : function() {
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
		
		// basemap layer menu
		var basemapLayerMenu = gisController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = gisController.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
		blMarkerProperty.showLabels = false;

		var colors = this.map.colorbrewer2rgb(this.mapCustomFillColors);		
		blMarkerProperty.symbolColors = colors;        

		var thematicBuckets = [];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 	

		this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);	
	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	gisController.map.switchBasemapLayer(item.text);
    },

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedBuildings : function(res) {
		gisController.resFromShowFunction='';
		gisController.resFromShowFunction=res;
		gisController.mapPanel.show(true);
		gisController.deferAddMarkers.defer(1000);
	},
	
	/**
	 * For show button defer function to show gis
	 */
	deferAddMarkers:function(){
		gisController.createMarkers(gisController.resFromShowFunction);
	},

	/**
	 * show markers on map
	 */
	createMarkers : function(res) {
		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.name', 'bl.site_id', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
		blMarkerProperty.showLabels = false;

		var colors = this.map.colorbrewer2rgb(this.mapCustomFillColors);		
		blMarkerProperty.symbolColors = colors;        

		var data =  eval("(" + this.locMetricDashCtrl.pieRawData + ")");
		var mapThematicBuckets=[];
		mapThematicBuckets.length = 0;
		for (var i=0; i<data.length;i++) {
		  mapThematicBuckets.push(data[i]['bl.use1']);
		}
		blMarkerProperty.setThematic('bl.use1', mapThematicBuckets); 	

		gisController.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
		gisController.map.refresh(res);
	},

	/**
	 * For maximize defer function
	 */
	addMakers:function(){
		gisController.map.clear();  
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;
		if (this.locMetricDashCtrl.treeCtrl) {
			var treeRes = this.locMetricDashCtrl.treeCtrl.treeRes;
			var res=treeRes+" AND "+consoleCtrl.blIdRes+" AND "+consoleCtrl.siteIdRes;
			gisController.createMarkers(res);
		}
	}
});