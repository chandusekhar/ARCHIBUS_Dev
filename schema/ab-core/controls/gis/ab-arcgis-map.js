/**
 * This control is used for JavaScript-based map API.
 */
Ab.namespace('arcgis');

/*
 *   The ArcGIS Map Control     
 */

/*
 *  check to see whether user has valid license
 *  removed licensing at 21.2 ML
 */
function hasValidArcGisMapLicense(){
	return true;	
}

// TODO hold this for KB 
// the dojo configuration options
var dojoConfig = {
	async: 0,
	afterPageLoad: true,
	parseOnLoad: true
};

Ab.arcgis.ArcGISMap = Ab.view.Component.extend({
    // @begin_translatable
    z_MESSAGE_ESRI_API_NOT_LOADED: 'The map cannot be loaded. The ArcGIS API for Javascript could not be loaded from ArcGIS.com. There may be a problem with your internet connection.',
    z_MESSAGE_LAYER_NOT_VISIBLE_MAX: 'This map layer is not available at this map scale. Zoom out to view this layer.',
    z_MESSAGE_LAYER_NOT_VISIBLE_MIN: 'This map layer is not available at this map scale. Zoom in to view this layer.',
	z_MESSAGE_INVALID_LICENSE: 'Please refer to the Enabling GIS Services System Management Help topic for instructions on how to enable this view.',
	z_MESSAGE_TERMS_OF_SERVICE: 'Use of the ESRI ArcGIS Online Services is subject to the Terms of Use available on the ESRI Web site.',
	z_MESSAGE_NO_REFERENCE_LAYER: 'None',
	z_MESSAGE_WORLD_IMAGERY_WITH_LABELS: 'World Imagery with Labels',
	z_MESSAGE_WORLD_GRAY_CANVAS_WITH_LABELS: 'World Gray Canvas with Labels',
    z_MESSAGE_NATGEO_WORLD_MAP: 'National Geographic World Map',
	z_MESSAGE_OCEAN_BASEMAP: 'Oceans Basemap',	
	z_MESSAGE_USA_TOPOGRAPHIC_MAPS: 'USA Topographic Maps', 
	z_MESSAGE_WORLD_IMAGERY: 'World Imagery', 
	z_MESSAGE_WORLD_PHYSICAL_MAP: 'World Physical Map', 	
	z_MESSAGE_WORLD_STREET_MAP: 'World Street Map', 	
	z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY: 'World Shaded Relief Imagery', 		
	z_MESSAGE_WORLD_TERRAIN_BASE: 'World Terrain Base',
	z_MESSAGE_WORLD_TOPOGRAPHIC_MAP: 'World Topographic Map',
	z_MESSAGE_WORLD_LIGHT_GRAY_BASE: 'World Light Gray Canvas',	
	z_MESSAGE_USA_HOUSEHOLD_SIZE: 'USA Average Household Size',
	z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX: 'USA Social Vulnerability Index',
	z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE: 'USA Labor Force Participation Rate',
	z_MESSAGE_USA_MEDIAN_AGE: 'USA Median Age',
	z_MESSAGE_USA_MEDIAN_HOME_VALUE: 'USA Median Home Value',
	z_MESSAGE_USA_MEDIAN_NET_WORTH: 'USA Median Net Worth',
	z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING: 'USA Owner Occupied Housing',
	z_MESSAGE_USA_POPULATION_BY_SEX: 'USA Population by Sex',
	z_MESSAGE_USA_PERCENT_OVER_64: 'Percentage of U.S. Population Older than Age 64',
	z_MESSAGE_USA_PERCENT_UNDER_18: 'Percentage of U.S. Population Aged Younger than 18 Years',
	z_MESSAGE_USA_POPULATION_DENSITY: 'USA Population Density',
	z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE: 'USA Projected Population Change',
	z_MESSAGE_USA_RECENT_POPULATION_CHANGE: 'USA Population Change 2000-2010',
	z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL: 'USA Retail Spending Potential',
	z_MESSAGE_USA_TAPESTRY: 'USA Tapestry Segmentation',
	z_MESSAGE_USA_UNEMPLOYMENT_RATE: 'USA Unemployment Percentage Rate',
    // @end_translatable    


    // the esri arcgis map
   	map: null,
    // the map configuration parameters
	mapConfigObject: {},
    // map has been initialized
    mapInited: false,
	
	// the access token for the ArcGIS.com services
	accessToken: null,

    //the div which holds the map
    //the div and panel which hold the map
    divId: '',
    panelId: '',
    
    //the width and height of the div which holds the map
    divWidth: null,
    divHeight: null, 
    
    // the callback marker action
    markerActionTitle: null,
    markerActionCallback: null,
   
    //the font style and color of the text symbol
    textSymbolFont: 'BOLDER',
    textSymbolColor: [255,215,0,1],
	
    //Ext.util.MixedCollection
    //it holds all pairs of datasource-ArcGISMarkerProperty
    //key is the dataSource, value is the corresponding ArcGISMarkerProperty
    dataSourceMarkerPairs: null,
    
    //this is the multipoints object which holds all points on the map
    allPoints: null,
    
    //limit the level of detail for automatic zoom by the application, helps prevent "no map data available" message in some locations with some map services
    autoZoomLevelLimit: 13,
    
    //the restriction passed through the refresh function
    restrictionFromRefresh: null,
    
    //Ext.util.MixedCollection
    // holds BASEMAP layerName--layerURL pairs available to the map
    basemapLayerList: null,

	// holds REFERENCE layerName--layerURL pairs available to the map
	referenceLayerList: null,
	
	// thematic marker legend
	thematicLegend: null,

	// ersi legend 
	legendDijit: null,
	legendLayers: [],
	
	// map graphics layers
	markerGraphicsLayer: null,
	markerLabelGraphicsLayer: null,
	
	// map graphics renderer
	markerGraphicsRenderer: null,

	// tooltip element
	markerTooltip: null,
	markerTooltipContent: null,

    // will be replaced by localized string 
    WORLD_IMAGERY_WITH_LABELS: '',

    // will be replaces by localized string
    WORLD_GRAY_CANVAS_WITH_LABELS: '',
    
     /*
     *  constructor
     *  @param panelIdParam. The panel which holds the div.
     *  @param divIdParam. The div which holds the map.
     *  @param configObject. The configObject for the panel.
     */
    constructor: function(panelIdParam, divIdParam, configObject) {
		//console.log('MapControl -> constructor...');

	    // set the panel and div ids
	    this.divId = divIdParam;
	    this.panelId = panelIdParam;

	    this._createMapDomElement();

	    var hasDojo = this._hasDojo();
		// check for dojo
		if (hasDojo) {
			// if dojo was found, load the dependencies
			this._loadDojoLibrary();
		} else {
			// otherwise, wait a bit and try again
			this._waitForDojo.defer(2000, this);
		}

		// set the local mapConfigObject
        if ( typeof mapConfigObject !== 'undefined' ) { 
			this.mapConfigObject = mapConfigObject;
		} 

    	// initialize marker pairs
    	this.dataSourceMarkerPairs = new Ext.util.MixedCollection();
		    	
    	// build the basemap layer list
    	this._buildBasemapLayerList();

		// build the reference layer list
		this._buildReferenceLayerList();

 	    // add panel event handlers   	
    	this._addMapPanelEventHandlers();
    },

   	_createMapDomElement: function(){
	    // if map div doesnt exist, create it
	    var mapDiv = document.getElementById(this.divId);
	    if (mapDiv == null) {
	    	var mapPanel = document.getElementById( this.panelId );
	    	mapDiv = document.createElement("div");
			mapDiv.id = this.divId;
			mapPanel.appendChild( mapDiv );
	    }
   	},

    _hasDojo: function() {
    	hasDojo = false;
    	if (typeof dojo !== "undefined") {
    		hasDojo = true;
    	}
    	return hasDojo;
    },

    _waitForDojo: function() {
		// check for dojo again
		var hasDojo = this._hasDojo();
		if (hasDojo) {
			this._loadDojoLibrary();
		} else {
			// notify the user that the api cannot be loaded
			var msg = this.z_MESSAGE_ESRI_API_NOT_LOADED;
			View.alert(msg);
		}
    },

    _loadDojoLibrary: function() {
	    // load the required resources
	    dojo.require("esri.map");
	    dojo.require("esri.InfoTemplate");    	
	    dojo.require("esri.geometry.webMercatorUtils");
	    dojo.require("esri.tasks.locator");
	    dojo.require("esri.dijit.InfoWindow");
	    dojo.require("esri.dijit.Legend"); 
		dojo.require("dojo.dnd.Moveable");
		dojo.require("dojo.dom-construct");	
		dojo.require("dojo.io.script"); 
		dojo.require("dojo.query");
		dojo.require("dojo.on");
		dojo.require("dojo.ready");

        // when dojo is ready proceed with map initialization 
        var _mapControl = this;	    		
        dojo.ready( function() {
			//console.log('MapControl -> dojo.ready...');
			_mapControl._initMap();
		});
    },

   	_addMapPanelEventHandlers: function(){

   		var mapPanel = View.panels.get(this.panelId);
   		var mapControl = this;

   		mapPanel.afterResize = function(){
	   		var mapPanel = View.panels.get(mapControl.panelId);
	   		var mapDiv = Ext.get(mapControl.divId);

	   		var height = mapPanel.determineHeight();

	   		// make adjustments for tabs and instructions
		   	var adjHeight = 0;
	   		if (this.singleVisibleTabPanel()){
	   			adjHeight = adjHeight + this.getTitlebarHeight(); //31
	   		}
    		adjHeight = adjHeight + this.getInstructionsHeight(); //25

			height = height - adjHeight; //56	
            mapDiv.setHeight(height);
            mapDiv.parent().setHeight(height);                

	   		if (mapControl.map !== null) {
	   			mapControl.map.resize();
	   		}
		};

   		mapPanel.syncHeight = function(){
   			mapPanel.afterResize();
   		};

   		mapPanel.afterLayout = function() {
   			var regionPanel = this.getLayoutRegionPanel();
   			if (regionPanel){
   				if(!mapPanel.resizeListenerAttached){
   					mapPanel.resizeListenerAttached = true;

   					regionPanel.addListener('resize', function(){
   						mapPanel.afterResize();
   					});
   					regionPanel.addListener('expand', function() {
		                mapPanel.afterResize();
		            });
   				}
   			}
   		};

   		mapPanel.isScrollInLayout = function() {
   			return false;
   		};

   		mapPanel.afterLayout();
   		//mapPanel.afterResize();
   	},

    // initialize the map
   	_initMap: function() {
		//console.log('MapControl -> initMap...');

		// create map extent
		var mapExtent = this._createDefaultMapExtent();

		//create map 
   		this.map = new esri.Map(this.divId, {
   			wrapAround180: true,
   			sliderStyle: 'small',       
			extent: mapExtent,
			fitExtent: true
		});

		// wire up load event
		var _mapControl = this;
		dojo.connect(this.map, 'onLoad', function(){
			_mapControl._onMapLoad();
		});
   		
     	// load basemap layer
     	this._loadDefaultBasemapLayer();

		// create legend display elements
		this._createLegendDomElements();

		// create tooltip display elements
		this._createTooltipDomElements();

   	},
 
   	// create the default map extent 
   	_createDefaultMapExtent: function(){	
		var _mapExtent = new esri.geometry.Extent(-14676000, 1718000, -6849000, 7589000, 
				new esri.SpatialReference({"wkid":102100}));
		if (this.mapConfigObject.hasOwnProperty('mapInitExtent') && this.mapConfigObject.hasOwnProperty('mapInitExtentWKID')) { 
			_mapExtent = new esri.geometry.Extent( 
				this.mapConfigObject.mapInitExtent[0],
				this.mapConfigObject.mapInitExtent[1],
				this.mapConfigObject.mapInitExtent[2],
				this.mapConfigObject.mapInitExtent[3],
				new esri.SpatialReference({"wkid":this.mapConfigObject.mapInitExtentWKID})
			);
		} 
		return _mapExtent;
   	},

   	// load the deault basemap layer
   	_loadDefaultBasemapLayer: function() {
		if (this.mapConfigObject.hasOwnProperty('basemapLayerList')) {
			var layerName = this.basemapLayerList.keys[0];                         
			this.switchBasemapLayer( layerName );
		} else {
			this.switchBasemapLayer(this.WORLD_IMAGERY_WITH_LABELS);
       	}
   	},

   	// callback for map.load event
   	_onMapLoad: function(){
   		//console.log('MapControl -> onMapLoad...');

   		// create the default graphics layers
   		this._createGraphicsLayers();

   		// create graphics layer listeners
   		this._createGraphicsLayersListeners();

   		// TODO -- this doesnt seem necessary
		if( this.map != null && this.markerGraphicsLayer != null ){
   			this.markerGraphicsLayer.clear();
			if (this.markerLabelGraphicsLayer != null){
				this.markerLabelGraphicsLayer.clear();
			}
			// TODO -- this doesnt seem necessary
			// this.refresh(this.restrictionFromRefresh);
   		}

   		//create legend dijit
   		this._createLegendDijit();

   		//create marker action
   		this._createMarkerAction();

   		// resize the map div
   		this._resizeMap();

   		// set initialized to true
   		this.mapInited = true;

   		// call mapConfigObject mapLoadedCallback if it exists 
   		if (this.mapConfigObject.hasOwnProperty('mapLoadedCallback')) {
   			if (typeof this.mapConfigObject.mapLoadedCallback === 'function') {
				var callback = this.mapConfigObject.mapLoadedCallback;
				this.mapConfigObject.mapLoadedCallback = null;
				callback();
			}
   		}

   	},

   	_resizeMap: function(){
   		//console.log('MapControl --> resizeMap...');

   		var mapPanel = View.panels.get(this.panelId);
   		var mapDiv = Ext.get(this.divId);

   		mapPanel.syncHeight();
   		var height = mapPanel.determineHeight();
   		mapDiv.setHeight(height);
   		mapDiv.parent().setHeight(height);

   		if (this.map !== null) {
   			this.map.resize();
   		}
   	},

   	// create the default graphics layers
   	_createGraphicsLayers: function(){
		//create the marker graphics layer
		this.markerGraphicsLayer = new esri.layers.GraphicsLayer({
			id: 'markerGraphics',
			index: 20
		});
		this.map.addLayer( this.markerGraphicsLayer );
		
		// create the marker graphics label layer
		this.markerLabelGraphicsLayer = new esri.layers.GraphicsLayer({
			id: 'markerLabelGraphics',
			index: 25
		});
		this.markerLabelGraphicsLayer.disableMouseEvents(); 
		this.map.addLayer( this.markerLabelGraphicsLayer );
		// reorder graphics layers
		this.map.reorderLayer( this.markerGraphicsLayer, 20 );
		this.map.reorderLayer( this.markerLabelGraphicsLayer, 25 );

		this.markerLabelGraphicsLayer.disableMouseEvents(); 		
   	},

	_createGraphicsLayersListeners: function() {
		//console.log('MapControl -> createMapGraphicsListeners...');

		var mapControl = this;

		// make sure mouse events are enabled for the marker layer
		this.markerGraphicsLayer.enableMouseEvents();

		// wite up the mouse events for the marker graphics
		dojo.connect( this.markerGraphicsLayer, 'onMouseOver', function(evt) {
			mapControl._graphicsMouseOverHandler(evt);
		});

		dojo.connect( this.markerGraphicsLayer, "onMouseMove", function(evt) {
			mapControl._graphicsMouseMoveHandler(evt);
        });

		dojo.connect( this.markerGraphicsLayer, "onMouseOut", function(evt) {
			mapControl._graphicsMouseOutHandler(evt);
		});	
	},

	// show the markerTooltip on mouse over
	_graphicsMouseOverHandler: function(evt){
		var graphic = evt.graphic;
		var toolTipValue = graphic.getTitle();
		if ( toolTipValue == ' ') {
			toolTipValue = 'NO DATA';
		}
		var node = dojo.byId('markerTooltip');
		node.innerHTML = toolTipValue;	

		// TODO -- if time permits, add highlight graphics here
	},

	// move the markerTooltip on mouse move
	_graphicsMouseMoveHandler: function(evt){
        var px, py;        
        if (evt.clientX || evt.pageY) {
          px = evt.clientX;
          py = evt.clientY;
        } else {
          px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
          py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
        }
        dojo.style( this.markerTooltip, "display", "none");
        dojo.style( this.markerTooltip, { left: (px + 15) + "px", top: (py) + "px" });
        dojo.style( this.markerTooltip, "display", "");		
	},

	// hide the markerTooltip on mouse out
	_graphicsMouseOutHandler: function(evt){
		this.markerTooltip.style.display = "none";
	},

   	// create legend dom elements
   	_createLegendDomElements: function(){
		// add legend display elements
		var esriLegendContainer = document.createElement("div");
		esriLegendContainer.id = 'esriLegendContainer';
		var esriLegendCloseButton = document.createElement("div");
		esriLegendCloseButton.id = 'esriLegendCloseButton'; 
		esriLegendContainer.appendChild( esriLegendCloseButton );
		var esriLegend = document.createElement("div");
		esriLegend.id = 'esriLegend';
		esriLegendContainer.appendChild( esriLegend );
		var mapPanel = document.getElementById( this.panelId );
		mapPanel.appendChild( esriLegendContainer );
		dojo.style('esriLegendContainer', { 'display': 'none' });

		// make the legend moveable
		var esriMoveable = dojo.dnd.Moveable(dojo.byId('esriLegendContainer'));

		// wire up close event to close button
		var _mapControl = this;
		dojo.connect(dojo.byId('esriLegendCloseButton'), 'click', function() {
			_mapControl.hideEsriLegend();
		});
   	},

   	// create esri legend dijit
   	_createLegendDijit: function(){
		this.legendDijit = new esri.dijit.Legend({
			map: this.map,
			layerInfos: this.legendLayers
		}, 'esriLegend' );
		this.legendDijit.startup();  

		// refresh legend when new layers are added
		var _mapControl = this;
		dojo.connect( this.map, 'onLayersAddResult', function(results){
			_mapControl.legendDijit.refresh( _mapControl.legendLayers );
		}); 		
   	},

   	// create tooltip dom elements
   	_createTooltipDomElements: function() {
		this.markerTooltipContent = "";
		this.markerTooltip = dojo.create('div', { 'id':'markerTooltip', 'class': 'markerTooltip', 'innerHTML':"" }, this.map.container);
		dojo.style( this.markerTooltip, 'position', 'fixed' );
		dojo.style( this.markerTooltip, "display", "none");   		
   	},

   	// add action to marker popup
   	_createMarkerAction: function(){
   		if ( this.markerActionTitle && this.markerActionCallback ){
	   		var link = dojo.create('a',{
	   			'class': 'action',
	   			'id': 'actionLink',
	   			'innerHTML': this.markerActionTitle,
	   			'href': 'javascript: void(0);'
	   		}, dojo.query('.actionList', this.map.infoWindow.domNode)[0]);

	   		var mapControl = this;
	   		dojo.connect(link, 'onclick', function(){
	   			var graphic = mapControl.map.infoWindow.getSelectedFeature();
	   			mapControl._markerActionClickHandler(graphic);
	   		});   			
   		}
   	},

   	_markerActionClickHandler: function(graphic) {
	  	//var graphic = evt.graphic;
	  	var point = new esri.geometry.Point(graphic.geometry.x, graphic.geometry.y);
	  	var title = graphic.getTitle();
	  	var attributes = graphic.attributes;
	  	
	  	//pass this info to the markerAction callback
	  	this.markerActionCallback(title, attributes);
   	},

    /**
     *  Calls the WFR to get an ArcGIS.com access token
     */
	_requestAccessToken: function(){
		var result = Ab.workflow.Workflow.call('AbCommonResources-ArcgisService-requestArcgisOnlineAccessToken');

		if (result.code != 'executed') {
			Ab.workflow.Workflow.handleError(result);
		} else {
			this.accessToken = result.message;
		}
	},

	/*
     *  get layer names for all available map layers 
	 *  deprecated at 21.1 -- use getBasemapLayerList instead
     */
	getAvailableMapLayerList: function() {
        this.getBasemapLayerList();
	},

	/*
     *  get layer names for all available BASEMAP layers 
     */	
	getBasemapLayerList: function() { 
		return this.basemapLayerList.keys;
	},

	/*
     *  get layer names for all available REFERENCE layers 
     */
	getReferenceLayerList: function() {
        return this.referenceLayerList.keys;
	},	

	// build the layerName-layerURL pairs for BASEMAP layers
	_buildBasemapLayerList: function() {
		//console.log('MapControl -> buildBasemapLayerList...');

		this.basemapLayerList = new Ext.util.MixedCollection();
		
		// if mapConfigObject includes basemapLayerList use it
		if (this.mapConfigObject.hasOwnProperty('basemapLayerList')) {
			var _basemapLayerList = this.mapConfigObject.basemapLayerList;

			for (var i=0; i<_basemapLayerList.length; i++) {
				this.basemapLayerList.add( _basemapLayerList[i].name, {
					url: _basemapLayerList[i].url, 
					opacity: _basemapLayerList[i].opacity
				});
			}
		// otherwise build the default basemap layer list	
		} else {
			//HYBRID_LAYER: 'World Imagery and Street Hybrid'
			//This is the combination of "World Imagery" and "World Boundaries and Places"
			this.HYBRID_LAYER = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY_AND_STREET_HYBRID);
			//this.basemapLayerList.add(this.HYBRID_LAYER, "hybrid");
			//
			// World Imagery with Place Labels
			this.WORLD_IMAGERY_WITH_LABELS = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY_WITH_LABELS);
			this.basemapLayerList.add(this.WORLD_IMAGERY_WITH_LABELS, "imagery_hybrid");
			// World Gray Canvas with Place Labels
			this.WORLD_GRAY_CANVAS_WITH_LABELS = View.getLocalizedString(this.z_MESSAGE_WORLD_GRAY_CANVAS_WITH_LABELS);
			this.basemapLayerList.add(this.WORLD_GRAY_CANVAS_WITH_LABELS, "canvas_hybrid");
			
			//base maps
	    	var  msg = View.getLocalizedString(this.z_MESSAGE_NATGEO_WORLD_MAP);
			this.basemapLayerList.add(msg, {url: "https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_OCEAN_BASEMAP);
			this.basemapLayerList.add(msg, {url: "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_TOPOGRAPHIC_MAPS);
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer"});		
	     	msg = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY);
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_PHYSICAL_MAP);	
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer"});	
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_STREET_MAP);
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY);
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer"});		
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TERRAIN_BASE);
			this.basemapLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TOPOGRAPHIC_MAP);
			this.basemapLayerList.add(msg, {url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"});
			// basemaps -- specialty
			msg = View.getLocalizedString(this.z_MESSAGE_WORLD_LIGHT_GRAY_BASE);
			this.basemapLayerList.add(msg, {url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"});
		}
	},

	//build the layerName-layerURL pairs which for REFERENCE layers
	_buildReferenceLayerList: function() {
		//console.log('MapControl -> buildReferenceLayerList...');

		this.referenceLayerList = new Ext.util.MixedCollection();
		
		// if mapConfigObject includes referenceLayerList use it

		if (this.mapConfigObject.hasOwnProperty('referenceLayerList')) {	
			var _referenceLayerList = this.mapConfigObject.referenceLayerList;

			for (var i=0; i<_referenceLayerList.length; i++) {
				this.referenceLayerList.add(_referenceLayerList[i].name, {
					url: _referenceLayerList[i].url,
					opacity: _referenceLayerList[i].opacity
				});
			}
		// otherwise build the default reference layer list
		} else {
			//reference layers
			//these layers should be used in conjunction with a basemap and not independently
	     	//var msg = View.getLocalizedString(this.z_MESSAGE_NO_REFERENCE_LAYER);
			//this.referenceLayerList.add(msg, "");
			//msg = View.getLocalizedString(this.z_MESSAGE_USA_SOIL_SURVEY);
			//this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer"});
			//msg = View.getLocalizedString(this.z_MESSAGE_WORLD_REFERENCE_OVERLAY);
			//this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer"});
			//msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TRANSPORTATION);
			//this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer"});
			//msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TRAFFIC_SERVICE); // PREMIUM
			//this.referenceLayerList.add(msg, {url: "https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer", useToken: true});		

			/** REFERENCE 21.1 LEGACY **/
	     	var msg = View.getLocalizedString(this.z_MESSAGE_NO_REFERENCE_LAYER);
			this.referenceLayerList.add(msg, "");
			msg = View.getLocalizedString(this.z_MESSAGE_USA_HOUSEHOLD_SIZE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Average_Household_Size/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_AGE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Age/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOME_VALUE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Home_Value/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_NET_WORTH);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Net_Worth/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_BY_SEX);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_by_Sex/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_OVER_64);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_UNDER_18);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Under_18/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_DENSITY);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Projected_Population_Change/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_RECENT_POPULATION_CHANGE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Recent_Population_Change/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_TAPESTRY);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Tapestry/MapServer"});
			msg = View.getLocalizedString(this.z_MESSAGE_USA_UNEMPLOYMENT_RATE);
			this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer"});
		}

	},	

	/*
     *  switch the map layer
     *  @param layerName 	Required 	The new layer name
	 *  deprecated at 21.1 -- use switchBasemapLayer instead
     */
	switchMapLayer: function(layerName) {
		this.switchBasemapLayer(layerName);		
	},
	
	/*
     *  switch the BASEMAP layer
     *  @param layerName 	Required 	The new layer name
     */   	
	switchBasemapLayer: function(layerName, callbackParam) {
		//console.log('MapControl -> switchBasemapLayer...');
		
		if( this.map.loaded){
			var baseLayer = this.map.getLayer("baseLayer");
			if (valueExistsNotEmpty( baseLayer )) {
				this.map.removeLayer( baseLayer );
			}	
			var baseLabelLayer = this.map.getLayer("baseLabelLayer");
			if (valueExistsNotEmpty( baseLabelLayer )) {
				this.map.removeLayer( baseLabelLayer );
			}	
		}
		
		//if HYBRID_LAYER: 'World Imagery and Place Labels'	
		if( layerName == this.HYBRID_LAYER ) {
			var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {id: "baseLayer", index: 0});
	     	this.map.addLayer( baseLayer );
			this.map.reorderLayer( baseLayer, 0 );
			this._addLayerLoadEventHandler(baseLayer);
			var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {id: "baseLabelLayer", index: 1});
			this.map.addLayer( baseLabelLayer ); 
			this.map.reorderLayer( baseLabelLayer, 1 );
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.reorderLayer( referenceLayer, 2 );
			}	
		} else if (layerName == this.WORLD_IMAGERY_WITH_LABELS) {
			var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {id: "baseLayer", index: 0});
	     	this.map.addLayer( baseLayer );
			this.map.reorderLayer( baseLayer, 0 );
			this._addLayerLoadEventHandler(baseLayer);
			var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {id: "baseLabelLayer", index: 1});
			this.map.addLayer( baseLabelLayer ); 
			this.map.reorderLayer( baseLabelLayer, 1 );
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.reorderLayer( referenceLayer, 2 );
			}	
		} else if (layerName == this.WORLD_GRAY_CANVAS_WITH_LABELS) {
			var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {id: "baseLayer", index: 0});
	     	this._addLayerLoadEventHandler(baseLayer);
	     	this.map.addLayer( baseLayer );
			this.map.reorderLayer( baseLayer, 0 );
			var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {id: "baseLabelLayer", index: 1});
			this.map.addLayer( baseLabelLayer ); 
			this.map.reorderLayer( baseLabelLayer, 1 );
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.reorderLayer( referenceLayer, 2 );
			}	
		} else {
			// create basemap layer options
			var layerOptions = new Object();
			layerOptions.id = 'baseLayer';
			layerOptions.index = 0;			
			var layerOpacity = this.basemapLayerList.get(layerName).opacity;
			if (layerOpacity !== undefined){
				layerOptions.opacity = layerOpacity;
			}
			//create basemap layer
			var layerURL = this.basemapLayerList.get(layerName).url; 
			var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, 
				layerOptions );

			this._addLayerLoadEventHandler(baseLayer);

			// check for callback param
			if (callbackParam && typeof callbackParam === 'function'){
				//dojo.connect(baseLayer, "onLoad", function(){
				//	var callback = callbackParam;
				//	callback();			
				//});
				var dojoHandle = dojo.on(baseLayer, 'load', function(){
					var callback = callbackParam;
					callback();
					dojoHandle.remove();
				});

			};

			// add the layer
     		this.map.addLayer( baseLayer );
     		this.map.reorderLayer( baseLayer, 0 );

     		// check for basemap anno
     		//var annoLayerUrl;
     		//if (this.basemapAnnoLayerList.get(layerName) !== undefined){
     		//	annoLayerUrl = this.basemapAnnoLayerList.get(layerName).url;
     		//}	
     		//if (annoLayerUrl) {
     		//	// create basemap anno layer options
     		//	var annoLayerOptions = new Object();
     		//	annoLayerOptions.id = 'baseLabelLayer';
     		//	annoLayerOptions.index = 1;
     		//	var annoLayerOpacity = this.basemapAnnoLayerList.get(layerName).opacity;
     		//	if (annoLayerOpacity !== undefined){
     		//		annoLayerOptions.opacity = annoLayerOpacity;
     		//	}
     			// create basemap anno layer
     		//	var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer(annoLayerUrl,
     		//		annoLayerOptions );
     		//	this.map.addLayer( baseLabelLayer );
     		//	this.map.reorderLayer( baseLabelLayer, 1 );
     		//}

		}
	},

	_addLayerLoadEventHandler: function(layer){
		// when the layer is loaded, call this.afterLayerLoad function
		var _mapControl = this;
 		//dojo.connect(layer, "onLoad", function(layer){
 		//	_mapControl._afterLayerLoad(layer);
 		//});
 		var layerHandle = dojo.on(layer, 'load', function(layer){
 			_mapControl._afterLayerLoad(layer, layerHandle);
 		})
	},

	/*
     *  switch the REFERENCE layer
     *  @param layerName 	Required 	The new layer name
     */
	switchReferenceLayer: function( layerName, callbackParam ) {
		//console.log("MapControl -> switchReferenceLayer...");

		// remove existing reference layer
		this.removeReferenceLayer();
		
		// get the layer url
		var layerURL = this.referenceLayerList.get(layerName).url;
		
		if ( valueExistsNotEmpty(layerURL) ) {
			var layerOpacity = 0.75;
			if (valueExistsNotEmpty( this.referenceLayerList.get(layerName).opacity )) {
				layerOpacity = this.referenceLayerList.get(layerName).opacity;
			}
			
			var layerIndex = 10;
			if (valueExistsNotEmpty( this.referenceLayerList.get(layerName).index )) {
				layerIndex = this.referenceLayerList.get(layerName).index;
			}			

			var useToken = false;
			if (valueExistsNotEmpty( this.referenceLayerList.get(layerName).useToken )) {
				useToken = this.referenceLayerList.get(layerName).useToken;
			}

			// set layer options 
			var layerOptions = {
				id: 'referenceLayer', 
				index: layerIndex,
				opacity: layerOpacity 
			};

			// parse the url for the hostname 
			// var parser = document.createElement('a');
			// parser.href = layerURL;
	 		// var hostname = parser.hostname;
			// get token if we are using arcgisonline.com or arcgis.com resources 
	 		//if (hostname.indexOf('arcgis.com') !== -1 || hostname.indexOf('arcgisonline.com') !== -1) {
			//	if (this.accessToken === null) {
			//		this.requestAccessToken();
			//	}
			//	layerURL = layerURL + '?token=' + this.accessToken;
	 		//}
	 		if (useToken) {
	 			if (this.accessToken === null) {
	 				this._requestAccessToken();
	 			}
	 			layerURL = layerURL + '?token=' + this.accessToken;
	 		}

			// check layerURL for layer type 
			// use layerURL + '?f=json' to retrieve info about map service as a JSON object
			// use '?f=pjson' for pretty JSON -- debugging only!
			// use &callback=methodName to reference a callback function in the URL
			var _mapControl = this;
			dojo.io.script.get({
				url: layerURL,
				callbackParamName: "callback",
				content: {
					f: 'json'	
				},
				load: function(results) {
					var isTiledMapCache = results.singleFusedMapCache;
					_mapControl._loadReferenceLayer(layerName, layerURL, layerOptions, isTiledMapCache, callbackParam);
				},
				error: function(error){
					View.alert("Error loading reference layer: " + layerName);
					//console.log("Error loading reference layer: " + error.message);			
				}
			});
		}
	},	

	// load the reference layer  
	_loadReferenceLayer: function( layerName, layerURL, layerOptions, isTiledMapCache, callbackParam ){
		//console.log('MapControl --> loadReferenceLayer...');
		
		var refLayer = '';

		// create the layer for the map
		if ( layerURL != '' && isTiledMapCache == true ) {
			refLayer = new esri.layers.ArcGISTiledMapServiceLayer( layerURL, layerOptions );
		} else if (  layerURL != '' && isTiledMapCache == false)  {
			refLayer = new esri.layers.ArcGISDynamicMapServiceLayer( layerURL, layerOptions );		
		}

		// add the layer loaded handler		
		this._addLayerLoadEventHandler(refLayer);

		// check for callback param
		if (callbackParam && typeof callbackParam === 'function'){
			//dojo.connect(refLayer, "onLoad", function(){
			//	var callback = callbackParam;
			//	callback();			
			//});
			var dojoHandle = dojo.on(refLayer, 'load', function(){
				var callback = callbackParam;
				callback();
				dojoHandle.remove();
			});
		};

		// add the layer to the map and update the legend
		if (refLayer != '') {
			this.legendLayers = [];
			this.legendLayers.push({layer:refLayer, title:layerName});
			this.map.addLayers( [refLayer] );
			this.map.reorderLayer( refLayer, layerOptions.index );
		}
		else {
			this.legendLayers = [];
			this.removeReferenceLayer();
		}


	},

	refreshReferenceLayer: function() {
		//console.log('MapControl -> refreshReferenceLayer...');
		if (this.map.loaded){
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				referenceLayer.refresh();
			}	
		}		
	},

	/*
     *  remove the REFERENCE layer
     *  @param layerName 	Required 	The layer name to be removed
     */	
	removeReferenceLayer: function() {
		if (this.map.loaded){
			// remove the layer from the map
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.removeLayer( referenceLayer );
			}
			// clear the legend layers
			this.legendLayers = [];
			this.legendDijit.refresh([]);	
		}		
	},

   	// callback for layer-load 
   	_afterLayerLoad: function( layer, layerHandle ) {
		//console.log( 'MapControl -> afterLayerLoad...' );
		
   		var currentMapScale = this.map.getScale(); // v3.1+ only
   		//var currentMapScale = this.map.__LOD.scale;
		//console.log('...Current map scale : ' + currentMapScale );
		
		var layerScales;
   		//the maximum scale under which the layer is visible
		if (valueExistsNotEmpty( layer )){
			// layerMaxScale = layer.maxScale(); // v3.1+ only
			layerScales = layer.scales;
		}
   		
		if (layerScales){
			// if we are zoomed in beyond the maxScale, the layer will not be visible
			//console.log('...Max layer scale : ' + layerScales[layerScales.length-1] );
			if( currentMapScale < layerScales[layerScales.length-1] ) {
   				var msg = View.getLocalizedString(this.z_MESSAGE_LAYER_NOT_VISIBLE_MAX);
   				View.showMessage(msg);
   			}
   			//console.log('...Min layer scale : ' + layerScales[0]);
			// if we are zoomed out beyond the minScale, the layer will not be visible
   			if ( currentMapScale > layerScales[0]) {
   				var msg = View.getLocalizedString(this.z_MESSAGE_LAYER_NOT_VISIBLE_MIN);
   				View.showMessage(msg);
   			}
		}

		if (layerHandle) {
			layerHandle.remove();
		}


   	},

	showEsriLegend: function() {
		dojo.style('esriLegendContainer', { 'display': 'block' });
		this.legendDijit.refresh( this.legendLayers );
	},
	
	hideEsriLegend: function() {
		dojo.style('esriLegendContainer', { 'display': 'none' });
	},

	removeEsriLegend: function() {
		// destroy the legend dijit
		this.legendDijit.destroy();

		// remove the dom elements
		//var mapPanel = document.getElementById(this.panelId);
		var legendContainer = document.getElementById('esriLegendContainer');
		var esriLegendCloseButton = document.getElementById('esriLegendCloseButton');
		legendContainer.removeChild(esriLegendCloseButton);
		legendContainer.parentNode.removeChild(legendContainer);
	},
   	
   	/*
     *  set map extent
     *  @param xmin 	Required 	Bottom-left X-coordinate of an extent envelope.
     *  @param ymin 	Required 	Bottom-left Y-coordinate of an extent envelope.
     *  @param xmax 	Required 	Top-right X-coordinate of an extent envelope.
     *  @param ymax 	Required 	Top-right Y-coordinate of an extent envelope.
     */
   	setMapExtent: function(xmin, ymin, xmax, ymax){
   		
   		//this runner is needed to IE.  Firefox works fine without it.
   		// var runner = new Ext.util.TaskRunner();
     //    var task = {
     //        run: function(){
     //            if (this.mapInited) {
     //                runner.stop(task);
                    this.map.setExtent(new esri.geometry.Extent(xmin, ymin, xmax, ymax, new esri.SpatialReference({wkid: 102100})));
        //         }
        //     },
        //     interval: 100
        // }
        // runner.start(task);  
   	},
   	
   	setMapLevel: function(level){
   		if (this.mapInited){
   			this.map.setLevel(level);
   		}
   	},

   	setMapCenterAndZoom: function( lon, lat, mapLevel ) {

   		this.map.centerAndZoom([ lon, lat ], mapLevel );

   	},


    setMapCenter: function( lon, lat ) {

        this.map.centerAt([ lon, lat ]);

    },

   	/*
     *  add and update the DataSourceMarkerPropertyPair
     *  @param ds. The dataSource name
     *  @param markerProperty. The corresponding ArcGISMarkerProperty
     */
   	updateDataSourceMarkerPropertyPair: function(ds, markerProperty){
   		if( this.getMarkerPropertyByDataSource(ds) == null ) {
	   		this.dataSourceMarkerPairs.add(ds, markerProperty);
   		}
   		else {
   			this.dataSourceMarkerPairs.replace(ds, markerProperty);
   		}
   	},
   	
   	/*
     *  remove one pair in DataSourceMarkerPropertyPair
     *  @param ds. The dataSource name
     */
   	removeDataSourceMarkerPropertyPair: function(ds){
   		this.dataSourceMarkerPairs.removeKey(ds);
   	},
   	
   	/*
     *  return the markerProperty for given ds
     *  @param ds. The dataSource name
     */
   	getMarkerPropertyByDataSource: function(ds){
   		return this.dataSourceMarkerPairs.get(ds);
   	},
   	
   	/*
     *  clear the whole map, remove all markers
     */
   	clear: function(){
		if( this.markerGraphicsLayer != null ){
			this.markerGraphicsLayer.clear();
		}
		if( this.markerLabelGraphicsLayer != null ){
			this.markerLabelGraphicsLayer.clear();
		}
		this.map.infoWindow.hide();
   		this.dataSourceMarkerPairs.clear();
   	},

   	/*
   	*	remove/destroy the map control
   	*/
   	remove: function() {
   		// remove the tooltip dom element
   		var markerTooltip = Ext.get('markerTooltip');
   		if (markerTooltip != null){
   			markerTooltip.remove();
   		}
   		// remove the esri legend
   		this.removeEsriLegend();
   		// destroy the map
   		this.map.destroy();
   		// remove the map panel listeners
   		var mapPanel = View.panels.get(this.panelId);
   		mapPanel.afterResize = function(){};
   		mapPanel.syncHeight = function(){};
   		mapPanel.afterLayout = function(){};
   		// clear control
   		this.map = null;
   		this.mapInited = false;
   	},

   	// alias for clear
   	clearMarkers: function() {
   		this.clear();
   	},
   	
   	/*
     *  the callback funtion for map's onload event
     *  @param {map} The map itself.
     */
   	_afterMapLoad: function(map){
		// TODO  
		// this should only fire once, after the initial map is loaded. 
		// and not on a refresh.
		if( map != null && this.markerGraphicsLayer != null ){
   			this.markerGraphicsLayer.clear();
			if (this.markerLabelGraphicsLayer != null){
				this.markerLabelGraphicsLayer.clear();
			}
			this.refresh(this.restrictionFromRefresh);
   		}   		
   	},
   	
   	/*
     *  refresh the map and the markers
     *  @param {restriction} Ab.view.Restriction. Optional.
     *  	This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
     */
   	refresh: function(restriction){
   		//var mapControl = this;
   		//this runner is needed to IE.  Firefox works fine without it.
        //var runner = new Ext.util.TaskRunner();
        //var task = {
        //    run: function(){      
        //        if (mapControl.mapInited) {
        //            runner.stop(task);
        //            mapControl._doRefresh(restriction);
        //        }
        //    },
        //    interval: 100
        //}
        //runner.start(task);   

        this._doRefresh(restriction);

 	},
 	
 	_doRefresh: function(restriction){
        var mapControl = this;
   		this.restrictionFromRefresh = restriction;   			

   		if(this.dataSourceMarkerPairs.getCount() != 0 && this.map != null && this.markerGraphicsLayer == null ){
   			//When add a map to a page, cannot use it until the first layer has been added to it. 
       		//Adding a layer to the map initializes the graphics and fires the onLoad event of the map. 
       		//At this point, user can interact with the map.
 			//Need to call refresh inside the afterMapLoad function for the map's onLoad event, 
 			//because when the map is just created
 			//and if the .axvw file calls the refresh() before the onLoad happens, the map has no graphics
 			//yet to show markers.  For this situation, we need to call refresh here again.

			//TODO 
			// this doesnt seem appropriate or necessary
   			//dojo.connect(this.map, "onLoad", function(){
   			//	mapControl._afterMapLoad;
   			//});
   		}
   		if( this.map != null && this.markerGraphicsLayer != null ){

   			// clear the maker graphics layers
   			this.markerGraphicsLayer.clear();
			this.markerLabelGraphicsLayer.clear();
  
   			//show all markers defined in the dataSourceMarkerPairs
   			this._showAllMarkers(restriction);
   		}
   	},
   	
   	addMarkerAction: function(title, callback){
   		this.markerActionTitle = title;
   		this.markerActionCallback = callback; 
   	},

   	/*
   	 * iterate over all dataSourceMarkerPairs to show all markers
   	 *  @param {restriction} Ab.view.Restriction. Optional.
     *  	This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
   	 */
   	_showAllMarkers: function(restriction){
   		
   		var length = this.dataSourceMarkerPairs.getCount();
   		
   		if( length != 0 ){
   			
   			//this multipoint will hold all markers's point
	   		this.allPoints =  new esri.geometry.Multipoint(this.map.spatialReference);
	   	
	   		for (var i = 0; i < length; i++ ){
	   			var markerProperty = this.dataSourceMarkerPairs.get(i);
	   			
	   			//This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
	   			if( i == 0 ){
	   				this._showDSMarker(markerProperty, i, restriction);
	   			}
	   			else{
	   				this._showDSMarker(markerProperty, i);
	   			}
	   		}
	   		this.setMapExtentByMultiPoints();
	   	}
   	},
   	
   	/*
   	 * show markers for a certain dataSourceMarkerPair
   	 *  @param markerProperty. The markerProperty.
     *  @param index. The position in dataSourceMarkerPairs
     *  @param restriction. 
     * 		This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
     *      And it is carried over from refresh(restriction)
   	 */
   	_showDSMarker: function(markerProperty, index, restrictionFromRefresh){
         //console.log('MapControl -> showDSMarker... ');

		//get all the parameter from markerProperty   		
   		var dataSourceName = markerProperty.dataSourceName;
   		var restriction = markerProperty.restriction;
   		var geometryFields = markerProperty.geometryFields;
		
		//get infoWindow title and content fields
    	var infoWindowTitleField = markerProperty.infoWindowTitleField;
     	var infoWindowContentFields = markerProperty.infoWindowContentFields;
     	
     	// get symbol type and renderer
     	var symbolType = markerProperty.symbolType;
     	var symbolRendererType = markerProperty.symbolRendererType;

     	// thematic marker properties
     	var showThematicSymbol = markerProperty.showThematicSymbol;     	
     	var thematicSymbols; 
     	var thematicField;
		var thematicFieldIsNumber;
    	var thematicFieldType; 
		var thematicBuckets = markerProperty.getThematicBuckets();
    	var thematicColors;
		
		// graduated marker properties
		var showGraduatedSymbol = markerProperty.showGraduatedSymbol;
		var graduatedField = markerProperty.getGraduatedField();
		var graduatedBuckets = markerProperty.getGraduatedBuckets();

		// thematic-graduated marker properties
		var showThematicGraduatedSymbol = markerProperty.showThematicGraduatedSymbol;

		// proportional marker properties
		var showProportionalSymbol = markerProperty.showProportionalSymbol;
		var proportionalField;
		var proportionalValueUnit;
		var proportionalValueRepresentation;

		// thematic proportional marker properties
		var showThematicProportionalSymbol = markerProperty.showThematicProportionalSymbol;

		// marker labels properties
		var showLabels = markerProperty.showLabels; 
		
		// marker datasource
    	var dataSource = View.dataSources.get(dataSourceName);
		
		//the property for each marker
		var lon;  //X
		var lat;  //Y
		var point;
		var attributes;
		var content;
		var infoTemplate;
		var title;
		var symbol;
		var textSymbol;

		// set up default marker for renderer
		var defaultSymbol = new esri.symbol.SimpleMarkerSymbol();
		defaultSymbol.setStyle(this.getSymbolStyle(markerProperty, symbolType));
		var color = markerProperty.symbolColors[0]; 
		defaultSymbol.setColor(new dojo.Color(color));	
		defaultSymbol.setSize(markerProperty.symbolSize);
		defaultLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1);

		//set symbol for simple marker
		if( symbolRendererType == 'simple' ) {

        	//console.log('...symbolRendererType -> simple');   	
        	
        	// set up renderer
        	this.renderer = new esri.renderer.SimpleRenderer(defaultSymbol);
        	this.markerGraphicsLayer.setRenderer(this.renderer);
        } 
        //get thematic marker properties 
        //else if (symbolRendererType == 'thematic' || symbolRendererType == 'graduated-thematic') {
        else if (showThematicSymbol == true) {
			thematicField = markerProperty.getThematicField();
        	thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			thematicFieldType = markerProperty.thematicFieldType;
			thematicBuckets = markerProperty.getThematicBuckets();
        	thematicColors = markerProperty.getThematicColors();
  			thematicSymbols = new Array();
 		}
 		//get graduated marker properties
 		else if (showGraduatedSymbol == true) {
 			graduatedField = markerProperty.getGraduatedField();
 			graduatedBuckets = markerProperty.getGraduatedBuckets();
 		}
 		// set thematic-graduated marker properties
 		else if (showThematicGraduatedSymbol == true){
			thematicField = markerProperty.getThematicField();
        	thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			thematicFieldType = markerProperty.thematicFieldType;
			thematicBuckets = markerProperty.getThematicBuckets();
        	thematicColors = markerProperty.getThematicColors();
  			thematicSymbols = new Array();

 			graduatedField = markerProperty.getGraduatedField();
 			graduatedBuckets = markerProperty.getGraduatedBuckets(); 			
 		}
 		// set proportional marker properties
 		else if (showProportionalSymbol == true) {
 			proportionalField = markerProperty.getProportionalField();
 			proportionalValueUnit = markerProperty.getProportionalValueUnit();
 			proportionalValueRepresentation = markerProperty.getProportionalValueRepresentation();
 		}
 		else if (showThematicProportionalSymbol == true){
			thematicField = markerProperty.getThematicField();
        	thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			thematicFieldType = markerProperty.thematicFieldType;
			thematicBuckets = markerProperty.getThematicBuckets();
        	thematicColors = markerProperty.getThematicColors();
  			thematicSymbols = new Array();

 			proportionalField = markerProperty.getProportionalField();
 			proportionalValueUnit = markerProperty.getProportionalValueUnit();
 			proportionalValueRepresentation = markerProperty.getProportionalValueRepresentation(); 			
 		}

 		//use unique value renderer for string values and/or coded numeric values
 		if (symbolRendererType == 'thematic-unique-values') { 
        	//console.log('...symbolRendererType -> thematic-unique-values');	
  			
  			// set up renderer
  			this.mapGraphicsRenderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, thematicField);
  			this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);
  			
  			// if thematic buckets length is zero add distinct field values to renderer
        	var thematicValues = thematicBuckets;
        	if (thematicValues.length == 0) {
        		thematicValues = markerProperty.getDistinctFieldValues(thematicField);
        	}
        		
        	var colorValues = markerProperty.symbolColors; //TODO: this.getColorBrewerColors(schemeName, dataClasses);
 
        	if (colorValues.length > 0) {
	        	for (i=0; i < thematicValues.length; i++){					
					//(style,size,outline,color)
					/*renderer.addValue('1:10', new esri.symbol.SimpleMarkerSymbol(
						esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,				//style
						10,															//size
						simpleLineSymbol,											//outline
						new dojo.Color([227, 26, 28, 0.9]							//color
					)));*/
	        		this.mapGraphicsRenderer.addValue(thematicValues[i], new esri.symbol.SimpleMarkerSymbol(
	        			this.getSymbolStyle(markerProperty, symbolType),
	        			markerProperty.symbolSize,
	        			defaultLineSymbol, //TODO: move to marker property
	        			new dojo.Color(colorValues[i])
	        		));
	        		////console.log(thematicValues[i] + " | " + colorValues[i]);
    	    	}
        	}
        }
        //use class breaks renderer for numeric values
        else if (symbolRendererType == 'thematic-class-breaks') {
        	//console.log('...symbolRendererType -> thematic-class-breaks');   	
        	
        	// set up renderer
        	this.mapGraphicsRenderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, thematicField);
        	this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);

        	var colorValues = markerProperty.symbolColors;

        	if (colorValues.length > 0) {
        		for (i=0; i < thematicBuckets.length+1; i++){
        			/*renderer.addBreak({
  						minValue: 2,
  						maxValue: 5,
  						symbol: symbol,
  						label: "Low Density"
					});*/
					if(i==0){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = '< ' + thematicBuckets[i];

						this.mapGraphicsRenderer.addBreak({
							minValue: -Infinity,
							maxValue: thematicBuckets[i],
							symbol: sms,
							label: lbl
						});
					}
					else if (i == thematicBuckets.length){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = '> ' + thematicBuckets[i];

						this.mapGraphicsRenderer.addBreak({
							minValue: thematicBuckets[i-1],
							maxValue: +Infinity,
							symbol: sms,
							label: lbl
						});	
					}
					else {
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = thematicBuckets[i] + ' - ' + thematicBuckets[i+1];

						this.mapGraphicsRenderer.addBreak({
							minValue: thematicBuckets[i-1],
							maxValue: thematicBuckets[i],
							symbol: sms,
							label: lbl
						});	
					}
        		}
        	}
        }
        // use class breaks renderer for simple graduated symbols
        else if (symbolRendererType == 'graduated-class-breaks') {
        	//console.log('...symbolRendererType -> thematic-graduated-class-breaks');

        	// set up renderer	
        	this.mapGraphicsRenderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, graduatedField);
        	this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);

        		for (i=0; i < graduatedBuckets.length; i++){
        			/*renderer.addBreak({
  						minValue: 2,
  						maxValue: 5,
  						symbol: symbol,
  						label: "Low Density"
					});*/
					if(i==0){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							graduatedBuckets[i].size,
							defaultLineSymbol,
							new dojo.Color(color)
						);
						var lbl = '< ' + graduatedBuckets[i].limit;

						this.mapGraphicsRenderer.addBreak({
							minValue: -Infinity,
							maxValue: graduatedBuckets[i].limit,
							symbol: sms,
							label: lbl
						});
					}
					else if (i == graduatedBuckets.length-1){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							graduatedBuckets[i].size,
							defaultLineSymbol,
							new dojo.Color(color)
						);
						var lbl = '> ' + graduatedBuckets[i-1].limit;

						this.mapGraphicsRenderer.addBreak({
							minValue: graduatedBuckets[i-1].limit,
							maxValue: +Infinity,
							symbol: sms,
							label: lbl
						});	
					}
					else {
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							graduatedBuckets[i].size,
							defaultLineSymbol,
							new dojo.Color(color)
						);
						var lbl = graduatedBuckets[i-1].limit + ' - ' + graduatedBuckets[i].limit;

						this.mapGraphicsRenderer.addBreak({
							minValue: graduatedBuckets[i-1].limit,
							maxValue: graduatedBuckets[i].limit,
							symbol: sms,
							label: lbl
						});	
					}
        		}
		} 
		else if (symbolRendererType == 'thematic-graduated-unique-values') {
        	//console.log('...symbolRendererType -> thematic-graduated-unique-values');

			// set up renderer
			this.mapGraphicsRenderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, 'colorValue', 'sizeValue', '', '|');
			this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);

			// colorValues | thematicBuckets   | i
			// sizeValues  | graduatedBuckets | j

			// color
	        for (i=0; i < thematicBuckets.length; i++){ 
				// size
				for (j=0; j<graduatedBuckets.length; j++){ 
					//(style,size,outline,color)
					/*renderer.addValue('1:10', new esri.symbol.SimpleMarkerSymbol(
						esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,				//style
						10,															//size
						simpleLineSymbol,											//outline
						new dojo.Color([227, 26, 28, 0.9]							//color
					)));*/
					var rendererValue = i + '|' + j;
					var dataValue = thematicBuckets[i] + '|' + graduatedBuckets[j].size;
	        		////console.log('renderer-color|size : ' + rendererValue + ' --- data-color|size : ' + dataValue);
	        		this.mapGraphicsRenderer.addValue(rendererValue, new esri.symbol.SimpleMarkerSymbol(
	        			this.getSymbolStyle(markerProperty, symbolType),
	        			graduatedBuckets[j].size,
	        			defaultLineSymbol, 
	        			new dojo.Color(thematicColors[i])
	        		));
	        		//console.log('rendererValue : ' + rendererValue + ' --- dataValue : ' + dataValue);
	        	}
    	    }
		}
		else if (symbolRendererType == 'thematic-graduated-class-breaks'){
        	//console.log('...symbolRendererType -> thematic-graduated-class-breaks');

			// set up renderer
			this.mapGraphicsRenderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, 'colorValue', 'sizeValue', '', '|');
			this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);

			// colorValues | thematicBuckets   | i
			// sizeValues  | graduatedBuckets | j

			// color
	        for (i=0; i < thematicBuckets.length+1; i++){ // we need one extra thematic bucket
				// size
				for (j=0; j<graduatedBuckets.length; j++){ 
					//(style,size,outline,color)
					/*renderer.addValue('1:10', new esri.symbol.SimpleMarkerSymbol(
						esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,				//style
						10,															//size
						simpleLineSymbol,											//outline
						new dojo.Color([227, 26, 28, 0.9]							//color
					)));*/
					var rendererValue = i + '|' + j;
					var dataValue = thematicBuckets[i] + '|' + graduatedBuckets[j].size;
	        		////console.log('renderer-color|size : ' + rendererValue + ' --- data-color|size : ' + dataValue);
	        		this.mapGraphicsRenderer.addValue(rendererValue, new esri.symbol.SimpleMarkerSymbol(
	        			this.getSymbolStyle(markerProperty, symbolType),
	        			graduatedBuckets[j].size,
	        			defaultLineSymbol, 
	        			new dojo.Color(thematicColors[i])
	        		));
	        		//console.log('rendererValue : ' + rendererValue + ' --- dataValue : ' + dataValue);
	        	}
    	    }
		} 
		else if (symbolRendererType == 'proportional') {
        	//console.log('...symbolRendererType -> proportional');

        	// set proportional symbol info
        	var proportionalSymbolInfo = {
        		field: proportionalField,
        		valueUnit: proportionalValueUnit,
        		valueRepresentation: proportionalValueUnit
        	};
        	
        	// set up renderer
        	this.renderer = new esri.renderer.SimpleRenderer(defaultSymbol);
        	this.markerGraphicsLayer.setRenderer(this.renderer);
        	this.markerGraphicsLayer.renderer.setProportionalSymbolInfo(proportionalSymbolInfo);
		}
		else if (symbolRendererType == 'thematic-proportional-unique-values') {
        	//console.log('...symbolRendererType -> thematic-proportional-unique-values');
  			
  			// set up renderer
  			this.mapGraphicsRenderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, thematicField);
  			this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);
  			
  			// if thematic buckets is null add distinct field values to renderer
         	var thematicValues = thematicBuckets;
        	if (thematicValues.length == 0) {
        		thematicValues = markerProperty.getDistinctFieldValues(thematicField);
        	}       	

        	var colorValues = markerProperty.symbolColors; 
        	if (colorValues.length > 0) {
	        	for (i=0; i < thematicValues.length; i++){					
					//(style,size,outline,color)
					/*renderer.addValue('1:10', new esri.symbol.SimpleMarkerSymbol(
						esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,				//style
						10,															//size
						simpleLineSymbol,											//outline
						new dojo.Color([227, 26, 28, 0.9]							//color
					)));*/
	        		this.mapGraphicsRenderer.addValue(thematicValues[i], new esri.symbol.SimpleMarkerSymbol(
	        			this.getSymbolStyle(markerProperty, symbolType),
	        			markerProperty.symbolSize,
	        			defaultLineSymbol, //TODO: move to marker property
	        			new dojo.Color(colorValues[i])
	        		));
	        		////console.log(thematicValues[i] + " | " + colorValues[i]);
    	    	}
        	}

        	// set proportional symbol info
        	var proportionalSymbolInfo = {
        		field: proportionalField,
        		valueUnit: proportionalValueUnit,
        		valueRepresentation: proportionalValueUnit
        	};
        	
        	// set up renderer
        	this.markerGraphicsLayer.renderer.setProportionalSymbolInfo(proportionalSymbolInfo);

		}
		else if (symbolRendererType == 'thematic-proportional-class-breaks') {
        	//console.log('...symbolRendererType -> thematic-proportional-class-breaks');

        	// set up renderer
        	this.mapGraphicsRenderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, thematicField);
        	this.markerGraphicsLayer.setRenderer(this.mapGraphicsRenderer);

        	var colorValues = markerProperty.symbolColors;

        	if (colorValues.length > 0) {
        		for (i=0; i < thematicBuckets.length+1; i++){
        			/*renderer.addBreak({
  						minValue: 2,
  						maxValue: 5,
  						symbol: symbol,
  						label: "Low Density"
					});*/
					if(i==0){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = '< ' + thematicBuckets[i];

						this.mapGraphicsRenderer.addBreak({
							minValue: -Infinity,
							maxValue: thematicBuckets[i],
							symbol: sms,
							label: lbl
						});
					}
					else if (i == thematicBuckets.length){
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = '> ' + thematicBuckets[i];

						this.mapGraphicsRenderer.addBreak({
							minValue: thematicBuckets[i-1],
							maxValue: +Infinity,
							symbol: sms,
							label: lbl
						});	
					}
					else {
						var sms = new esri.symbol.SimpleMarkerSymbol(
							this.getSymbolStyle(markerProperty, symbolType),
							markerProperty.symbolSize,
							defaultLineSymbol,
							new dojo.Color(colorValues[i])
						);
						var lbl = thematicBuckets[i] + ' - ' + thematicBuckets[i+1];

						this.mapGraphicsRenderer.addBreak({
							minValue: thematicBuckets[i-1],
							maxValue: thematicBuckets[i],
							symbol: sms,
							label: lbl
						});	
					}
        		}
        	}

        	// set proportional symbol info
        	var proportionalSymbolInfo = {
        		field: proportionalField,
        		valueUnit: proportionalValueUnit,
        		valueRepresentation: proportionalValueUnit
        	};
        	
        	// set up renderer
        	this.markerGraphicsLayer.renderer.setProportionalSymbolInfo(proportionalSymbolInfo);			
		}

		//set restriction
		var finalRestriction;
		if(restrictionFromRefresh != null) {
			finalRestriction = restrictionFromRefresh;
		}
		else{
			finalRestriction = restriction;
		}
		
		//get records from dataSource
		var records = this.getDataSourceRecords(dataSourceName, finalRestriction);
			
		//set markers, tooltip
     	for (var i = 0; i < records.length; i++) {
     	
     		// TODO : Can we always assume lon (x) will be the SECOND geometry field???
          	lat = records[i].getValue(geometryFields[0]); 
          	lon = records[i].getValue(geometryFields[1]); 
          	
          	//create marker only if the geometry field is not null
          	if( lat != null && lon != null && lat.length != 0 && lon.length != 0) {
          	
          		attributes = new Object();
          		
          		//create infoTemplate for each marker
          		infoTemplate = new esri.InfoTemplate();
          		content = "";

          		//set info template, tooltip
          	 	for(var j = 0; j < infoWindowContentFields.length; j++) {
          	 		var fieldId = infoWindowContentFields[j];
          	 		var fieldTitle = this.getFieldTitle(dataSourceName, fieldId);
          	 		
          	 		var value = records[i].getValue(fieldId);
          	 		var localizedValue = dataSource.formatValue(fieldId, value, true);
          			attributes[fieldId] = localizedValue; //value; 	
          			
          			var localizedValue = dataSource.formatValue(fieldId, value, true);
             			
          			content += "<b>" + fieldTitle + ":</b> " + localizedValue;
          			if( j != infoWindowContentFields.length - 1 ) {
          				content += "<br />";
          			}
          		}

          		// if thematic, add thematic field to attributes for renderer
          		var thematicValue = '';
          		if (showThematicSymbol == true){
          			var fieldId = markerProperty.thematicField;
          			var fieldTitle = this.getFieldTitle(dataSourceName, fieldId);
          			var value = records[i].getValue(fieldId);
          			var localizedValue = dataSource.formatValue(fieldId, value, true);
          			attributes[fieldId] = localizedValue; //value;
          			thematicValue = localizedValue; //value; 
          		}

          		// if graduated, add graduated field to attributes for renderer
          		var graduatedValue = '';
          		if (showGraduatedSymbol == true){
          			var fieldId = markerProperty.graduatedField;
          			var fieldTitle = this.getFieldTitle(dataSourceName, fieldId);
          			var value = records[i].getValue(fieldId);
          			var localizedValue = dataSource.formatValue(fieldId, value, true);
          			attributes[fieldId] = localizedValue; //value; 
          			rendererValue = localizedValue; //value;
          		}          		
          		//var rendererValue = thematicValue + "|" + graduatedValue;
          		////console.log(rendererValue);
          		//attributes.rendererValue = rendererValue;

          		// if thematic-graduated add colorValue and sizeValue attributes for renderer		
          		if (showThematicGraduatedSymbol == true){
          			var thematicFieldId = markerProperty.thematicField;
            		var thematicFieldValue = records[i].getValue(thematicFieldId);
            		var localizedThematicFieldValue = dataSource.formatValue(thematicFieldId, thematicFieldValue, true);
          			var graduatedFieldId = markerProperty.graduatedField;
          			var graduatedFieldValue = records[i].getValue(graduatedFieldId);

          			//add thematic value for color renderer
		   			var colorValue = null;
          			
          			// if marker property thematic field type is not numeric
          			if (!markerProperty.thematicFieldIsNumber) {
          				for (j=0; j<thematicBuckets.length; j++){
          					if (localizedThematicFieldValue == thematicBuckets[j]){
          						colorValue = j;
          					}
          				}
          			} 

          			// if marker property thematic field type is numeric
          			if (markerProperty.thematicFieldIsNumber){
	          			for (j=0; j<thematicBuckets.length; j++) {
							if (thematicFieldValue < thematicBuckets[0]){
								colorValue = 0;
								break;
							} else if (thematicFieldValue >= thematicBuckets[thematicBuckets.length-1]) {
								colorValue = thematicBuckets.length;
								break;
							} else {
								if ( thematicFieldValue >= thematicBuckets[j] &&  thematicFieldValue < thematicBuckets[j+1]) {
									colorValue = j+1;
									break;
								}
							}
	          			}
          			}
          			attributes.colorValue = colorValue;
          			
          			//add graduated value for size renderer
          			var sizeValue = null;
          			for (k=0; k<graduatedBuckets.length; k++){
          				if (graduatedFieldValue < graduatedBuckets[0].limit){
          					sizeValue = 0;
          					break;
          				}
          				else if (graduatedFieldValue >= graduatedBuckets[graduatedBuckets.length-2].limit) {
          					sizeValue = graduatedBuckets.length-1;
          					break;
          				}
          				else {
          					if (graduatedFieldValue >= graduatedBuckets[k].limit && graduatedFieldValue < graduatedBuckets[k+1].limit){
          						sizeValue = k+1;
          						break;
          					}
          				}          				

          			}
          			attributes.sizeValue = sizeValue;
          		}  		
          		////console.log(colorValue + '|' + sizeValue);

          		title = records[i].getValue(infoWindowTitleField);
          		infoTemplate.setTitle(title);
          		infoTemplate.setContent(content);
          		
          		//add marker itself to map
          	 	point = new esri.geometry.Point(lon, lat, new esri.SpatialReference({ wkid: 4326 })); 
          	 	// convert geometry from lat/lon to Web Mercator         	  
            	point = esri.geometry.geographicToWebMercator(point);
          	 	
          	 	this.allPoints.addPoint(point);

          	 	symbol = defaultSymbol;

          	 	//add point to markerGraphics layer
          	 	if( symbolRendererType == 'simple' ) {
          	 		this.markerGraphicsLayer.add(new esri.Graphic(point, symbol, attributes, infoTemplate));
          	 	}
				else { 
					// set the symbol to null to let the layer renderer take control 
					this.markerGraphicsLayer.add(new esri.Graphic(point, null, attributes, infoTemplate));
				}
				
            	//add corresponding text graphic
            	if ( showLabels == true ) { 
					textSymbol = new esri.symbol.TextSymbol(title, new esri.symbol.Font().setWeight(this.textSymbolFont), new dojo.Color(this.textSymbolColor)); 
					//this.map.graphics.add(new esri.Graphic(point, textSymbol.setOffset(0, 8)));
					this.markerLabelGraphicsLayer.add(new esri.Graphic(point, textSymbol.setOffset(0, 8)));
				}
            }//end if( lat != null && lon != null & lat.length != 0 && lon.length != 0) 
   		}//end for (var i = 0; i < records.length; i++)
	},
  	
   	/**
   	 * 	get the actual field title 
   	 *  @param dataSourceName. The data source.
     *  @param fieldName. bl.bl_id
   	 */
   	getFieldTitle: function(dataSourceName, fieldName) {
   		var ds = View.dataSources.get(dataSourceName);
   		var items = ds.fieldDefs.items;
   		
   		for(var i = 0; i < items.length; i++) {
   			var item = items[i];
   			var id = item.id;
   			if( fieldName == id ) {
   				return item.title;
   			}
   		} 		
   		return "";
   	},
   	
   	/**
   	 * 	get ESRI ArcGIS marker symbol
   	 *  @param markerProperty. The markerProperty.
     *  @param style. The marker style definend in markerProperty.
     *  @return. ESRI ArcGIS marker symbol
   	 */
   	getSymbolStyle: function(markerProperty, style){
   	
   		switch (style)
		{
			case markerProperty.SYMBOL_TYPE_CIRCLE:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
  			break;
			case markerProperty.SYMBOL_TYPE_CROSS:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CROSS;
  			break;
  			case markerProperty.SYMBOL_TYPE_DIAMOND:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND;
  			break;
  			case markerProperty.SYMBOL_TYPE_SQUARE:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE;
  			break;
  			case markerProperty.SYMBOL_TYPE_X:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_X;
  			break;
			default:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
		}
   	},   	
   	
   	/*
   	 * set the map extent based on the extent of all markers
   	 */
   	setMapExtentByMultiPoints: function(){
   		if( this.allPoints.points.length > 1 ) {
   			var pointsExtent = this.allPoints.getExtent();
   			var mapExtent;
   			mapExtent = pointsExtent.expand(1.05);
   			this.map.setExtent(mapExtent, true);
   		}
   		else if (this.allPoints.points.length == 1 ){
   			var onePoint = new esri.geometry.Point( this.allPoints.points[0][0], this.allPoints.points[0][1], this.map.spatialReference );
   			this.map.centerAndZoom( onePoint, this.autoZoomLevelLimit );
   		}
   	},
   	   	
   	/**
   	 * 	get data records
   	 *  @param dataSourceName. The dataSourceName.
     *  @param restriction. The Restriction.
     *  @return. The dataRecords.
   	 */
	getDataSourceRecords: function(dataSourceName, restriction){
   		var ds = View.dataSources.get(dataSourceName);
   		return ds.getRecords(restriction);
   	},
	
	/**
	 *  remove thematic legend
	 */
	removeThematicLegend: function(){
		if( this.thematicLegend != null ){
   			// remove legend DOM element if exists
	        var legendDiv = Ext.get('mapLegend');
	        if (legendDiv != null) {
	            legendDiv.remove();
	        }
			this.thematicLegend = null;
		}
	},
 	
   	/**
   	 * 	create thematic legend as an ext.window
   	 *  @param markerProperty. The ArcGISMarkerProperty associated with thematic markers.
   	 */
   	buildThematicLegend: function(markerProperty) {
        //console.log('Ab.arcgis.ArcGISMap -> buildThematicLegend...');
        
        //create legend if not exist
        if( this.thematicLegend == null ){
   		
   			// remove legend DOM element if exists
	        var legendDiv = Ext.get('mapLegend');
	        if (legendDiv != null) {
	            legendDiv.remove();
	        }
	        
	        // create new mapLegend DIV
	        var htmlDiv = '<div id="mapLegend" class="mapLegend x-hidden"></div>';
	        Ext.DomHelper.insertHtml('afterBegin', document.body, htmlDiv);
   		
   			//
   			//create legend
   			//
			var topY = Ext.fly(this.panelId).getTop(false); 
			var topX = Ext.fly(this.panelId).getRight(false)-225;
			
			var title = this.getFieldTitle(markerProperty.dataSourceName,  markerProperty.thematicField);
			
			// adjust for long (multi-line) legend titles
			var titleLength = title.length;
			var titleHeight = 0;
			if (titleLength > 20) {
				titleHeight = 45;
			} else if (titleLength > 40) {
				titleHeight = 90;
			}

			var thematicBuckets = markerProperty.getThematicBuckets();
			var thematicColors = markerProperty.getThematicColors();
			var thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			var thematicFieldType = markerProperty.thematicFieldType;
			var symbolRendererType = markerProperty.symbolRendererType;

	    	//define the width and height for the legend
	    	var height = 125;
	    	var width = 225;
	    	
			// more precise height
			if (symbolRendererType == 'thematic-unique-values'){
				height = 25 * thematicBuckets.length + 50 + titleHeight;	
			}
			else {
				height = 25 * (thematicBuckets.length+1) + 50 + titleHeight;
			}
				

	    	//build a html table based on the thematicBuckets and the thematicColors
	        var htmlBody = "<table>";
            // check legend labels
            var overrideLegendLabels = false;
            var legendLabels = markerProperty.legendLabels;
            if (legendLabels.length === thematicBuckets.length+1 ) {
                //console.log('Overriding default legend labels...');
                overrideLegendLabels = true;
            }

	        // class break renderer // || symbolRendererType == 'thematic-proportional-class-breaks'
			if (symbolRendererType == 'thematic-class-breaks' || symbolRendererType == 'thematic-graduated-class-breaks' || symbolRendererType == 'thematic-proportional-class-breaks') { 
				// class break renderer needs one additional thematic bucket
				for (var i=0; i<thematicBuckets.length+1; i++) {
					//convert RGB color to hex color
					var RGBColor = thematicColors[i];
					var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
					if (i === 0) {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						if (overrideLegendLabels === true) {
                            htmlBody += legendLabels[i] + "</td></tr>";
                        } else {
                            htmlBody += "&nbsp;&lt;&nbsp;" + insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
                        }
						
                        htmlBody += "<tr height=3></tr>";
					}
					else if (i === thematicBuckets.length) {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						if (overrideLegendLabels === true) {
                            htmlBody += legendLabels[i] + "</td></tr>";
                        } else {
                            htmlBody += "&nbsp;&gt;&nbsp" + insertGroupingSeparator(thematicBuckets[i-1]+"", true, true) + "</td></tr>";
                        }
					}
					else {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						if (overrideLegendLabels === true) {
                            htmlBody += legendLabels[i]+ "</td></tr>";
                        } else {
                            htmlBody += "&nbsp;" + insertGroupingSeparator(thematicBuckets[i-1]+"", true, true) + "&nbsp;-&nbsp;" + insertGroupingSeparator((thematicBuckets[i])+"", true, true) + "</td></tr>";
                        }
						
                        htmlBody += "<tr height=3></tr>";
					}
				}
			} 
			// unique value renderer 
			else {
				
				for (var i=0; i<thematicBuckets.length; i++) {
					//convert RGB color to hex color
					var RGBColor = thematicColors[i];
					var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
					
					htmlBody += "<tr><td style='filter:alpha(opacity=90); opacity: 0.90; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
					htmlBody += thematicBuckets[i]+ "</td></tr>";
					
					//console.log(thematicBuckets[i]);
					//console.log(insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>");

					if(i < thematicBuckets.length){
						htmlBody += "<tr height=3></tr>";
					}
				} 			
			}
			htmlBody += "</table>";
	        
	        //create the legend as ext.window 
	        this.thematicLegend = new Ext.Window({
	        	el: 'mapLegend',
	        	layout: 'fit',
				x: topX,
				y: topY,
	            height: height,
	            width: width,
	            modal: false,
	            shadow: false,
	            autoScroll: true,
	            closable: true,
	            html: htmlBody,
	            title: title,
	            collapsible: true
	        });
	        
	        this.thematicLegend.className = 'mapLegend';
	        this.thematicLegend.show();
        }
    },

    showThematicLegend: function(){
    	if (this.thematicLegend != null){
    		this.thematicLegend.show();    		
    	}
    },

    hideThematicLegend: function() {
    	if (this.thematicLegend != null){
    		this.thematicLegend.hide();    		
    	}
    },
	
	/*
	* Converts a colorbrewer class from hex to RGB
	* e.g. for colorbrewer.Paired[3] = ["#a6cee3","#1f78b4","#b2df8a"]
	* returns [[],[],[]]
	*/
    colorbrewerToRGB: function(colorbrewerHex) {
    	var colorbrewerRGB = [];
    	if (colorbrewerHex && colorbrewer) {
			for (i=0; i<colorbrewerHex.length; i++){
				colorbrewerRGB.push(this.hex2rgba(colorbrewerHex[i]));
			}
    	}
    	return colorbrewerRGB;
    },

	RGBtoHex: function(R,G,B) {
		return this.toHex(R) + this.toHex(G) + this.toHex(B)
	},
	
	toHex: function(N) {
 		if (N==null) return "00";
 		N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 		N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 		return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
	},

	hex2rgba: function(hex, alphaParam) {
  		if (!alphaParam >= 0 && !alphaParam <=1) alphaParam = 1.0;	
  		if (hex[0]=="#") hex=hex.substr(1);
  		if (hex.length==3) {
    		var temp=hex; hex='';
    		temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
    		for (var i=0;i<3;i++) hex+=temp[i]+temp[i];
  		}
  		var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
  		return [
    		parseInt(triplets[0],16),
   			parseInt(triplets[1],16),
    		parseInt(triplets[2],16),
    		alphaParam
  		]
	},

	/*
	*  converts colorbrewer color array from hex to rgb.
	*  @param colorbrewerHexColorsParam. array of colorbrewer hex colors.
	*/
	colorbrewer2rgb: function(colorbrewerHexColorsParam){
		var colorbrewerHexColors = colorbrewerHexColorsParam;
		var colorbrewerRgbColors = new Array(); 

		if (colorbrewerHexColors.length > 0){
			for(i=0; i<colorbrewerHexColors.length; i++){
				colorbrewerRgbColors.push(this.hex2rgba(colorbrewerHexColors[i])); 
			}
		}
		return colorbrewerRgbColors;
	}
});

/**
*  This is an alias for Ab.arcgis.ArcGISMap
*  with a class name that is more consistent.
*  e.g. Map, MapExtensions, WebMap, WebMapExtensions
*/
Ab.arcgis.Map = Ab.arcgis.ArcGISMap.extend({

	constructor: function(panelIdParam, divIdParam, configObject){
		this.inherit(panelIdParam, divIdParam, configObject);
	}

});	

/*
 *   This class define common properties for a group of markers 
 */ 

Ab.arcgis.ArcGISMarkerProperty = Base.extend({  	

	//the predefined symbol type
	SYMBOL_TYPE_CIRCLE: 'circle', // default
	SYMBOL_TYPE_CROSS: 'cross', 
	SYMBOL_TYPE_DIAMOND: 'diamond', 
	SYMBOL_TYPE_SQUARE: 'square', 
	SYMBOL_TYPE_X: 'x', 

	//the predefined renderer type
	SYMBOL_RENDERER_SIMPLE: 'simple',
	SYMBOL_RENDERER_THEMATIC_UNIQUE_VALUES: 'thematic-unique-values',
	SYMBOL_RENDERER_THEMATIC_CLASS_BREAKS: 'thematic-class-breaks',
	SYMBOL_RENDERER_GRADUATED: 'graduated-class-breaks',
	SYMBOL_RENDERER_THEMATIC_GRADUATED_UNIQUE_VALUES: 'thematic-graduated-unique-values',
	SYMBOL_RENDERER_THEMATIC_GRADUATED_CLASS_BREAKS: 'thematic-graduated-class-breaks',
	SYMBOL_RENDERER_PROPORTIONAL: 'proportional',
	SYMBOL_RENDERER_THEMATIC_PROPORTIONAL_UNIQUE_VALUES: 'thematic-proportional-unique-values',
	SYMBOL_RENDERER_THEMATIC_PROPORTIONAL_CLASS_BREAKS: 'thematic-proportional-class-breaks',

	//the default symbol type of the markers
	symbolType: 'circle', 
	//the default symbol size of the markers
	symbolSize: 15,
	// the default renderer type of the markers 
	symbolRendererType: 'simple',

	// the predefined symbol colors
	// symbol colors ( colorbrewer.Set1[10] )
	symbolColors: [	
				[227, 26, 28, 0.9],   //default
				[31, 120, 180, 0.9],
				[51, 160, 44, 0.9],
				[255, 127, 0, 0.9],
				[106, 61, 154, 0.9],
				[251, 154, 153, 0.9],
				[166, 206, 227, 0.9],
				[178, 223, 138, 0.9],
				[253, 191, 111, 0.9],
				[202, 178, 214, 0.9]	
	],

	//the dataSource associated with markers
	dataSourceName: null,
	
	//fields defined in dataSource
	infoWindowTitleField: null,
	infoWindowContentFields: null,
	geometryFields:null,

	//text label properties 
	showLabels: true,
	
	//thematic marker properties
	showThematicSymbol: false,
	thematicField: null,
	thematicFieldIsNumber: null,
	thematicFieldType: null,
	thematicBuckets: null,
	thematicColors: null,
	
	// graduated marker properties
	showGraduatedSymbol: false,
	graduatedField: null,
	graduatedBuckets: null,
	
	//thematic-graduated marker properties
	showThematicGraduatedSymbol: false,

	// proportional marker properties
	showProportionalSymbol: false,
	proportionalField: null,
	proportionalValueUnit: null,
	proportionalValueRepresentation: null,

	// thematic proportional maker properties
	showThematicProportionalSymbol: false,

    // override default legend labels
    legendLabels: null,

	//the restriction set for dataSource
	restriction: null,

	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines the infoWindow Title.
     *  @param infoWindowContentParam.  The data fields which define the infoWindow Content.
     */
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowContentFieldParam) {

    	this.dataSourceName = dataSourceNameParam;
    	this.geometryFields = geometryFieldsParam;
    	this.infoWindowTitleField = infoWindowTitleFieldParam;
    	this.infoWindowContentFields = infoWindowContentFieldParam;
    	
    	this.symbolColorsCount = this.symbolColors.length;

        this.legendLabels = [];
    },
    
    /*
     *  set restriction for dataSource
     *  @param restrictionParam. The restriction.
     */  
    setRestriction: function(restrictionParam) {
    	this.restriction = restrictionParam;
    },
    
    /*
     *  set symbol for the marker.  Both for simple and for thematic symbol.
     *	@param symbolTypeParam. Required.  Options are "circle", "square", "diamond", "cross", and "x"
     */
    setSymbolType: function(symbolTypeParam) {
    	this.symbolType = symbolTypeParam;
    },
    
    /*
     *  set thematic property for the marker.  
     *	@param thematicFieldParam. The value in whice decides which thematic bucket the marker belongs to.
     *  @param thematicBucketsParam.  The arrary which holds the thematic buckets values.  
     *          e.g [10, 20, 30], if the value is 11, then it belongs to the buckets between 10 and 20.
     */
    setThematic: function(thematicFieldParam, thematicBucketsParam) { 
    	this.showThematicSymbol = true;
		
		var ds = View.dataSources.get(this.dataSourceName);
		this.thematicField = thematicFieldParam;
		this.thematicFieldIsNumber = ds.fieldDefs.get(this.thematicField).isNumber();	
		this.thematicFieldType = ds.fieldDefs.get(this.thematicField).type;
		this.thematicBuckets = thematicBucketsParam;

		// use unique value renderer if no thematic buckets provided
    	if (this.thematicBuckets.length == 0) {
			this.symbolRendererType = 'thematic-unique-values';
			// get distinct values for renderer
			this.thematicBuckets = this.getDistinctFieldValues(this.thematicField);
    	} else if (this.thematicBuckets.length > 0 && this.thematicFieldIsNumber == false) {
    		this.symbolRendererType = 'thematic-unique-values';
    	}
    	// otherwise use class break renderer
    	else {
    		this.symbolRendererType = 'thematic-class-breaks';
    	}
		
		// if there are more buckets than colors, generate more colors	
		if (this.symbolColors.length < this.thematicBuckets.length){
			// generate more colors
			var colorsNeeded = this.thematicBuckets.length-this.symbolColors.length;
			for (var x=0; x<colorsNeeded; x++){
                //this.symbolColors.push(this.generateRandomColor());
                var newColor = this.symbolColors[x];
                newColor[3] = newColor[3] * 0.66;
                this.symbolColors.push(newColor);
			}
			this.symbolColorsCount = this.symbolColors.length;
		}  
		
    	this.thematicColors = new Array();
    	//define color for each individual thematic bucket
		for (var i = 0; i <= this.thematicBuckets.length+2; i++) { 
        	//for thematic marker, we use the predefined colors rotately for thematic bucket
        	this.thematicColors[i] = this.symbolColors[i%this.symbolColorsCount];	
        }

    },

	/*
     *  set graduated property for the marker.  
     *	@param graduatedFieldParam. The value which decides which graduated bucket the marker belongs to.
     *  @param graduatedBucketsParam.  The arrary which holds the graduated buckets values.  
     *          e.g 
     */
    setGraduated: function(graduatedFieldParam, graduatedBucketsParam) {
    	this.showGraduatedSymbol = true;
		this.symbolRendererType = 'graduated-class-breaks';
		this.graduatedField = graduatedFieldParam;
		this.graduatedBuckets = graduatedBucketsParam;
    },
    /*
     *  set thematic-graduated property for the marker.  
     *	@param thematicFieldParam. The value in whice decides which thematic bucket the marker belongs to.
     *  @param thematicBucketsParam.  The arrary which holds the thematic buckets values.  
     *          e.g [10, 20, 30], if the value is 11, then it belongs to the buckets between 10 and 20.
       *  set graduated property for the marker.  
     *	@param graduatedFieldParam. The value which decides which graduated bucket the marker belongs to.
     *  @param graduatedBucketsParam.  The arrary which holds the graduated buckets values.  
     *          e.g    
     */
    setThematicGraduated: function(thematicFieldParam, thematicBucketsParam, graduatedFieldParam, graduatedBucketsParam){
    	this.showThematicGraduatedSymbol = true;

    	// set thematic marker properties
    	var ds = View.dataSources.get(this.dataSourceName);
		this.thematicField = thematicFieldParam;
		this.thematicFieldIsNumber = ds.fieldDefs.get(this.thematicField).isNumber();	
		this.thematicFieldType = ds.fieldDefs.get(this.thematicField).type;
		this.thematicBuckets = thematicBucketsParam;

		// use unique value renderer if no thematic buckets provided
    	if (this.thematicBuckets.length == 0) {
			this.symbolRendererType = 'thematic-graduated-unique-values';
			// get distinct values for renderer
			this.thematicBuckets = this.getDistinctFieldValues(this.thematicField);
    	} 
    	else if (this.thematicBuckets.length > 0 && !this.thematicFieldIsNumber) {
    		this.symbolRendererType = 'thematic-graduated-unique-values';
    	}
    	// otherwise use class break renderer
    	else {
    		this.symbolRendererType = 'thematic-graduated-class-breaks';
    	}

        // if there are more buckets than colors, generate more colors  
        if (this.symbolColors.length < this.thematicBuckets.length){
            // generate more colors
            var colorsNeeded = this.thematicBuckets.length-this.symbolColors.length;
            for (var x=0; x<colorsNeeded; x++){
                //this.symbolColors.push(this.generateRandomColor());
                var newColor = this.symbolColors[x];
                newColor[3] = newColor[3] * 0.66;
                this.symbolColors.push(newColor);
            }
            this.symbolColorsCount = this.symbolColors.length;
        }  

    	// set graduated marker properties
		this.graduatedField = graduatedFieldParam;
		this.graduatedBuckets = graduatedBucketsParam;

    },
	/*
     *  set proportional property for the marker.  
     *	@param proportionalFieldParam. The datasource field that contains the proportional data value.
     *  @param proportionalValueUnitParam.  The unit of measurement that the data value.  
     *          Valid values are 'inches', 'feet', 'yards', 'miles', 'nautical-miles',
     *          'millimeters', 'centimeters', 'decimeters', meters', 'kilometers', 'decimal-degrees'
     *  @param proportionalValueRepresentationParam.  What the data value represents in the real world.
     *          Valid values are 'radius', 'diameter', 'area', 'width', 'distance'
     */
    setProportional: function(proportionalFieldParam, proportionalValueUnitParam, proportionalValueRepresentationParam){
    	this.showProportionalSymbol = true;
    	this.symbolRendererType = 'proportional';

    	// set proportional marker properties
    	this.proportionalField = proportionalFieldParam;
    	this.proportionalValueUnit = proportionalValueUnitParam;
    	this.proportionalValueRepresentation = proportionalValueRepresentationParam;

    },

    setThematicProportional: function(thematicFieldParam, thematicBucketsParam, proportionalFieldParam, proportionalValueUnitParam, proportionalValueRepresentationParam) {
    	this.showThematicProportionalSymbol = true;

    	// set thematic marker properties
    	var ds = View.dataSources.get(this.dataSourceName);
		this.thematicField = thematicFieldParam;
		this.thematicFieldIsNumber = ds.fieldDefs.get(this.thematicField).isNumber();	
		this.thematicFieldType = ds.fieldDefs.get(this.thematicField).type;
		this.thematicBuckets = thematicBucketsParam;
		
		// use unique value renderer if no thematic buckets provided
    	if (this.thematicBuckets.length == 0) {
			this.symbolRendererType = 'thematic-proportional-unique-values';
			// get distinct values for renderer
			this.thematicBuckets = this.getDistinctFieldValues(this.thematicField);
    	} else if (this.thematicBuckets.length > 0 && !this.thematicFieldIsNumber) {
    		this.symbolRendererType = 'thematic-proportional-unique-values';
    	}

    	// otherwise use class break renderer
    	else {
    		this.symbolRendererType = 'thematic-proportional-class-breaks';
    	}

        // if there are more buckets than colors, generate more colors  
        if (this.symbolColors.length < this.thematicBuckets.length){
            // generate more colors
            var colorsNeeded = this.thematicBuckets.length-this.symbolColors.length;
            for (var x=0; x<colorsNeeded; x++){
                //this.symbolColors.push(this.generateRandomColor());
                var newColor = this.symbolColors[x];
                newColor[3] = newColor[3] * 0.66;
                this.symbolColors.push(newColor);
            }
            this.symbolColorsCount = this.symbolColors.length;
        }  

    	// set proportional marker properties
    	this.proportionalField = proportionalFieldParam;
    	this.proportionalValueUnit = proportionalValueUnitParam;
    	this.proportionalValueRepresentation = proportionalValueRepresentationParam;    	

    },

    setLegendLabels: function(legendLabels) {
        this.legendLabels = legendLabels;
    },

	/*
     *
     *  get functions
     *
     */ 
    getSymbolSize: function() {
    	return this.symbolSize;
    },

    getThematicField: function() {
    	return this.thematicField;
    },
    
    getThematicBuckets: function() {
    	return this.thematicBuckets;
    },
    
    getThematicColors: function() {
    	return  this.symbolColors; 
    },
	
    getGraduatedField: function() {
		return this.graduatedField;
	},

	getGraduatedBuckets: function() {
		return this.graduatedBuckets;
	},

	getProportionalField: function() {
		return this.proportionalField;
	},

	getProportionalValueUnit: function() {
		return this.proportionalValueUnit;
	},

	getProportionalValueRepresentation: function(){
		return this.proportionalValueRepresentation;
	},

	getDistinctFieldValues: function(field){
    	var values = [];
    	try {
    		var temp = field.split(".");
    		var table = temp[0];
    		var parameters = {
    			tableName: table,
    			fieldNames: toJSON([field]),
     			sortValues: toJSON([{'fieldName': field, 'sortOrder':1}]), 
     			recordLimit: 0,  		
    			isDistinct: true
    		};
  
    		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    		var rows = result.data.records;
    		for(var i=0; i<rows.length; i++){
    			values.push(rows[i][field]);
    		}
    		return values;
    	} catch (e) {
    		Workflow.handleError(e);
    	}
    	return values;
    }, 
    
    generateRandomColor: function(){
    	return [this.generateRandomNumber(255), this.generateRandomNumber(255), this.generateRandomNumber(255), 0, 75];   	   	
    },
    
    generateRandomNumber: function(n){
    	return (Math.floor (Math.random() * n) );
    },

    getColorBrewerClasses: function( scaleParam, numberParam ){
    	var colorBrewerHexClasses = [];
    	var colorBrewerRgbClasses = [];
    	
    	//if colorbrewer namespace exits, get the colorbrewer hex classes
    	if (colorbrewer){
    		//colorBrewerHexClasses = colorbrewer[colorSchemeParam][numberOfDataClassesParam];
    		colorBrewerHexClasses = colorbrewer[scaleParam][numberParam];
    	}
    	
    	// convert colorBrewerClasses from hex to RGB
    	if (colorBrewerHexClasses.length > 0) {
    		for (var i=0; i<colorBrewerHexClasses.length; i++){
    			color = dojo.colorFromHex(colorBrewerHexClasses[i]);
    			color.a = (0.9);
    			colorBrewerRgbClasses.push(color);
    		}
    	}

    	return colorBrewerRgbClasses;
    }
	
});