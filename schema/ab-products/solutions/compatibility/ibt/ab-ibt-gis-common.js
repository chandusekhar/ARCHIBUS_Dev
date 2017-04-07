var explorer_Map;//global variable used to correct a problem in Internet Explorer. This is needed for "addFlashCallbacks" function.

Dictionary = Base.extend({
	items: new Array(),
	length: 0,
	
	constructor: function()
	{
	},
	
	removeItem: function(key)
	{
		var tmp_value;
		if (typeof(this.items[key]) != 'undefined') {
			this.length--;
			var tmp_value = this.items[key];
			delete this.items[key];
		}
	   
		return tmp_value;
	},

	getItem: function(key) {
		return this.items[key];
	},
	
	addItem: function(key, value)
	{
		if(!this.hasItem(key))
			return this.setItem(key, value);
		return null;
	},

	setItem: function(key, value)
	{
		if (typeof(value) != 'undefined') {
			if (typeof(this.items[key]) == 'undefined') {
				this.length++;
			}

			this.items[key] = value;
		}
	   
		return value;
	},

	hasItem: function(key)
	{
		return typeof(this.items[key]) != 'undefined';
	}
});

Map = Base.extend({	
	parentId: '',
	markerStyleId: 'myMarkerStyleId',
	explorer: null,
	markerArray: new Object(),
	isLoaded: false,
	isRendering: false,
	
	constructor: function(parentId) {		
		this.parentId = parentId;
		
		//if(Map.maps == null){
		//	Map.maps = new Dictionary();
		//}
		
		Map.maps.addItem(this.parentId, this);
		
		var key_value = this.get_key();
		if(key_value !="")
		{	 		
	 		AWUtils.insertMap(this.parentId, key_value, {wmode: "true", jsCreationComplete: "Map.onCreationComplete('" +  this.parentId + "')"});
	 		explorer_Map = document.getElementById('explorer_Map');
		}
		
		//this.createMarkerStyle();
	},
	
	createNewMarker: function(id, lat, lon, label)
	{
		if(this.isRendering){
			return;
		}
		var myMarker = new AWMarker();
		//myMarker.markerStyleId = this.markerStyleId;
		myMarker.id = this.parentId + "____" + id;
		myMarker.latlon = new AWLatLon(lat, lon);
		myMarker.data = {elements: [{type: "text",	text: label}], label : {text: id}};
		this.markerArray[id] = myMarker;
	},
	
	renderMarkers: function(lat, lon)
	{		
		if(this.isRendering){
			return;
		}		
		
		if(!this.isLoaded)
		{
			setTimeout("Map.renderMarkers('" + this.parentId + "')", 1000);
			return;
		}
		
		this.isRendering = true;
		
		this.explorer.removeAllMarkers();
		for(var id in this.markerArray){
			this.explorer.addMarker(this.markerArray[id]);
		}
		
		if(lat == null && lon == null ){
			var latLonExtent = this.getLatLonExtent();
			if (latLonExtent != null)
			{
				this.explorer.setLatLonExtent(latLonExtent);
			}
		}
		else{
			var myLatLon = new AWLatLon(lat, lon);
			this.explorer.centerAndScale(myLatLon, 400000);
		}
		
		this.markerArray = new Object();	//change this, call render from create or delete marker
		this.isRendering = false;	
	},
	
	getLatLonExtent: function()
	{
		var minLat = null;
		var maxLat = null;
		var minLon = null;
		var maxLon = null;
		
		var marker;		
		
		for(var id in this.markerArray)
		{
			marker = this.markerArray[id];
			
			if(minLat == null){
				minLat = parseFloat(marker.latlon.lat);
			}
			else{
				if(parseFloat(marker.latlon.lat) < minLat){
					minLat = parseFloat(marker.latlon.lat);
				}
			}
			
			if(maxLat == null){
				maxLat = parseFloat(marker.latlon.lat);
			}
			else{
				if(marker.latlon.lat > maxLat)
				{
					maxLat = parseFloat(marker.latlon.lat);
				}
			}
			
			if(minLon == null){
				minLon = parseFloat(marker.latlon.lon);
			}
			else{
				if(parseFloat(marker.latlon.lon < minLon)){
					minLon = parseFloat(marker.latlon.lon);
				}
			}
			
			if(maxLon == null){
				maxLon = parseFloat(marker.latlon.lon);
			}
			else{
				if(parseFloat(marker.latlon.lon) > maxLon)
				{
					maxLon = parseFloat(marker.latlon.lon);
				}
			}			
		}
		if(minLat != null && maxLat != null && minLon != null && maxLon != null){
			return new AWLatLonExtent(minLat, minLon, maxLat, maxLon);
		}
		else{
			return null;
		}	
	},	
	
	onMarkerClick: function(event)
	{
		//alert(this.parentId);
		//alert(event.id);
	},
	
	createMarkerStyle: function()
	{
		myMarkerStyle = new AWImgMarkerStyle();
		myMarkerStyle.id = "myMarkerStyleId";
		myMarkerStyle.source = "http://www.arcwebservices.com/awx/images/id-g.png";
		myMarkerStyle.mouseOverSource = "http://www.arcwebservices.com/awx/images/id-r.png";
			  	
		myMarkerStyle.mouseClick = "Map.onMarkerClick";
		return myMarkerStyle;
	},
	
	createNewImageMarker: function(id, lat, lon)
	{
		if(this.isRendering){
			return;
		}
		
		var myMarker = new AWMarker();
        myMarker.id = this.parentId + "____" + id;
        myMarker.latlon = new AWLatLon(lat, lon);
        myMarker.markerStyleId = myMarkerStyle.id;
        myMarker.data = {label:id};
 		
 		this.markerArray[id] = myMarker;
	},
	
	get_key: function()	{
		//read the ArcWebServices key from database
		var param_id = 'ESRIArcWebServicesKey';
		var parameters ={	tableName: 'afm_activity_params',
							fieldNames: toJSON(['afm_activity_params.param_value']),
							restriction: toJSON({'afm_activity_params.param_id':param_id})
						};     
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
		if (result.code == 'executed') 
		{
	    	var record = result.data.records[0];
	      	var key_value = record['afm_activity_params.param_value'];
	      	return key_value;
	   	}
		else 
		{
	  		AFM.workflow.Workflow.handleError(result);
	   	}   	
	},
	
	showNavigation: function()
	{
		this.showHideWidget(AWMap.WIDGET_NAVIGATION);
	},
	
	showFind: function()
	{
		this.showHideWidget(AWMap.WIDGET_FIND);
	},
	
	showDirections: function()
	{
		this.showHideWidget(AWMap.WIDGET_DIRECTIONS);
	},
	
	showMapTypes: function()
	{
		this.showHideWidget(AWMap.WIDGET_MAPTYPES);
	},
	
	showLegend: function()
	{
		this.showHideWidget(AWMap.WIDGET_LEGEND);
	},
    
    showReports: function()
	{
		this.showHideWidget(AWMap.WIDGET_REPORTS);
	},
	
	showHideWidget: function(str)
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		
		if(this.explorer != null)
			this.explorer.showWidget(str);		
	},
	
	showStreets: function()
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){				
			map.explorer.removeAllGroupLayers();
		    map.explorer.addGroupLayer("vectorGroupLayer");
	    }
	    //changeHeader("Streets");
	},

	showHybrid: function()
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){
			map.explorer.removeAllGroupLayers();
		    map.explorer.addGroupLayer("hybridGroupLayer");
	    }
	    //changeHeader("Hybrid");
	},
	
	showSatellite: function()
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){
			map.explorer.removeAllGroupLayers();
		    map.explorer.addGroupLayer("rasterTileGroupLayer");
	    }
	    //changeHeader("Satellite");
	},
	
	showCensus: function()
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){
			map.explorer.removeAllGroupLayers();
		    map.explorer.addGroupLayer("mapImageGroupLayer", "ArcWeb:Census.Density.US");
	    }
	    //changeHeader("Census Density");
	},
	
	showDriveTime: function()
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){
			map.explorer.removeAllGroupLayers();
	    	map.explorer.addGroupLayer("mapImageGroupLayer", "ArcWeb:TA.Streets.NA");
    	}
	    //changeHeader("Drive Time");
	},
	
	showOtherMap: function(groupLayerName, mapName)
	{
		//var mapFrame = getFrameObject(parent, "detailsFrame");
		//myExplorer = mapFrame.myMap;
		if(map.explorer != null){
			if(groupLayerName == "queryGroupLayer")
				map.explorer.removeGroupLayer("queryGroupLayer");
			else
				map.explorer.removeAllGroupLayers();
			if(groupLayerName == "thematicGroupLayer")
			    map.explorer.addGroupLayer(groupLayerName, mapName, {
			          alpha:50,
			          thematicField:"AVGHHINC",
			          numClasses:5,
			          mapLegend:{autoextend:"true", height:10},
			          showLegend:"floating"
			        });
			else
				map.explorer.addGroupLayer(groupLayerName, mapName);
		}
	        	
	    //changeHeader("Others");  	    
	}
	
	
});

Map.isInitialized = false;

Map.initialize = function()
{
	if(!Map.isInitialized)
	{
		//alert(document.path);
		Map.loadJavascriptFile("http://www.arcwebservices.com/awx/awxapi-1.0.js");
		//Map.loadJavascriptFile("#Attribute%//@relativeFileDirectory%/ab-ex-gis-gis_dictionary.js");
		Map.isInitialized = true;
	}
}

Map.loadJavascriptFile = function(file)
{
	var script = document.createElement('script');
	script.language = 'JavaScript';
	script.type = 'text/javascript';
	script.src = file;
	
	var head = document.getElementsByTagName('head').item(0);
	head.appendChild(script);	
}

Map.loadCssFile = function(file)
{
}

Map.initialize();

Map.maps = new Dictionary();

Map.renderMarkers = function(id)
{
	var mapObj = Map.maps.getItem(id);
	mapObj.renderMarkers();
}

Map.onCreationComplete = function(id)
{
	//alert('aici');
	var mapObj = Map.maps.getItem(id);
	mapObj.explorer = new AWMap(mapObj.parentId);
	mapObj.explorer.addMarkerStyle(mapObj.createMarkerStyle());
	
	
	var myLatLon = new AWLatLon(39.954014, -75.143037);
	mapObj.explorer.centerAndScale(myLatLon, 200000);
	mapObj.isLoaded = true;	
	//alert('end');
}

Map.onMarkerClick = function(event)
{
	var arr = event.id.split("____");
	var mapObj = Map.maps.getItem(arr[0]);
	event.id = arr[1];
	mapObj.onMarkerClick(event);
	//alert("click");
}



//end of Map class

GisMenu = Base.extend({
	oMenu: null,
	parentId: '', //the DOM element that the menu's root element should be appended to
	map: null, //the Map object associated with the menu
	
	constructor: function(map, parentId)
	{
		this.map = map;
		this.parentId = parentId;		
		this.createMenu();		
	},
	
	menuItemClick: function(p_sType, p_aArgs, p_oValue)
	{
		p_oValue[2].map.showOtherMap(p_oValue[0], p_oValue[1]);
		p_oValue[2].oMenu.hide();
	},
	
	createMenu: function()
	{
			var aItems = [
	        
	            { text: "Geographic", submenu: { id: "geographic", itemdata: [ 
	            
	                { text: "North American Points of Interest Spatial Query NAVTEQ", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer", "ArcWeb:NT.POI.NA", this] } },
	                { text: "U.S. Thematic Map Report ESRI", onclick: { fn: this.menuItemClick, obj: ["thematicGroupLayer", "ArcWeb:ESRI.ThematicMap.US", this] }  }, //Invalid data source name
	                { text: "U.S. National Elevation Dataset Shaded Relief Map USGS", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:USGS.NED.US", this] } },
	                { text: "U.S. USGS Digital Ortho Map Image Service GlobeXplorer", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.DOQQ.US", this] } },
	                { text: "U.S. Elevation Data Spatial Query USGS", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer", "ArcWeb:USGS.Elevation.US", this] } },
	                { text: "U.S. National Land Cover Dataset Map USGS", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:USGS.NLCD.US", this] }},
	                { text: "U.S. Nautical Charts Maptech", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:MT.NauticalCharts.US", this] }},
	                { text: "U.S. TOPO! Map National Geographic", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:NGS.Topo.US", this] }},
	                { text: "World Earthquakes Spatial Query USGS", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer",  "ArcWeb:USGS.Earthquakes.World", this] } },
	                { text: "World Recent Earthquakes Map USGS", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:USGS.Earthquakes.World", this] } },              
	            
	            ] } },
	
	            { text: "Demographic", submenu: { id: "demographic", itemdata: [
	
	                { text: "U.S. Demographics (Set 1) by ZIP Code Thematic Map ESRI", onclick: { fn: this.menuItemClick, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByZipCode.US", this] } },
	                { text: "U.S. Detailed Business Listings Spatial Query infoUSA", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer", "ArcWeb:INFOUSA.BusinessListingsDetails.US", this] } },//error
	                { text: "U.S. 2000 Population Density Map Census", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:Census.Density.US", this] } },
	                { text: "U.S. Parcel Place Finder Blue Raster", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:BR.Parcels.US", this] } },
	                { text: "U.S. 109th Congressional Districts Thematic Map ESRI", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:ESRI.CongDist109.US", this] } },
	                { text: "U.S. Demographics (Set 1) by Congressional District Thematic Map ESRI", onclick: {fn: this.menuItemClick, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByCongressionalDistrict.US", this]}},
	                { text: "U.S. Demographics (Set 1) by County Subdivision Thematic Map ESRI ", onclick: {fn: this.menuItemClick, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByCountySubdivision.US", this]}},
	                { text: "U.S. Demographics (Set 1) by Populated Place Thematic Map ESRI ", onclick: {fn: this.menuItemClick, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByPopulatedPlace.US", this]}} 
	                           
	            ] } },
	
	            { text: "Satellite", submenu: { id: "satellite", itemdata: [
	            
	                { text: "World EarthSat NaturalVue Imagery GlobeXplorer $", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.EarthSatNaturalVue.World", this] }  },
	                { text: "World Imagery ESRI", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:ESRI.Satellite.World", this] } },
	                { text: "World Premium Imagery GlobeXplorer $$", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.Premium.World", this] } }
	            
	            ] } },
	            
	            {text: "Weather", submenu: { id: "weather", itemdata: [
	            
	            	{ text: "U.S. Flood Hazard Areas Spatial Query FEMA", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer", "ArcWeb:FEMA.Flood.US", this] }  },
	            	{ text: "World Forecasted Airport Delays Map CustomWeather", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:CW.AirportDelays.World", this] }  },
	            	{ text: "North American Current Weather Map Meteorlogix", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:MX.CurrentWeather.NA", this] }  },
	            	{ text: "North American Forecast Weather Map Meteorlogix" , onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:MX.ForecastWeather.NA", this] } },
	            	{ text: "World Current Weather Conditions Map CustomWeather", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:CW.CurrentWeather.World", this] }  },
	            	{ text: "U.S. Flood Risk Zone Map FEMA", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:FEMA.Flood.US", this] }  },
	            	{ text: "U.S. Precipitation Map Meteorlogix", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:MX.Precipitation.US", this] }  }
	            	
	           	] } },
	           	
	           	{text: "Streets", submenu: { id: "streets", itemdata: [
	           		
	           		{ text: "U.S. Street Map Tele Atlas", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:TA.Streets.US", this] }  },
	           		{ text: "U.S. TIGER 2000 Street Map Census", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:Census.Streets.US", this] }  },
	           		{ text: "U.S. Traffic Incident Map TrafficCast", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:TC.Traffic.US", this] }  },
	           		{ text: "World Airport Locations Spatial Query NGA", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer",  "ArcWeb:ESRI.Airports.World", this] }  },
	           		{ text: "U.S. Traffic Spatial Query TrafficCast", onclick: { fn: this.menuItemClick, obj: ["queryGroupLayer",  "ArcWeb:TC.Traffic.US", this] }  },
	           		{ text: "North American Drive Time Utility NAVTEQ", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:NT.Streets.NA", this] }  },
	           		{ text: "North American Drive Time Utility Tele Atlas", onclick: { fn: this.menuItemClick, obj: ["mapImageGroupLayer",  "ArcWeb:TA.Streets.NA", this] }  }
	           		
	       		] } }
	
	        ];                
	
	        /*
	             Instantiate the menu.  The first argument passed to the 
	             constructor is the id of the DOM element to be created for the 
	             menu; the second is an object literal representing a set of 
	             configuration properties for the menu.
	        */
	
	        this.oMenu = new YAHOO.widget.Menu("others_menu", {context: [this.parentId, "tl", "bl"], zindex: 5});
	        
	
	        /*
	            Add items to the menu by passing an array of object literals 
	            (each of which represents a set of YAHOO.widget.MenuItem 
	            configuration properties) to the "addItems" method.
	        */
	        this.oMenu.addItems(aItems);
	
	        this.oMenu.showEvent.subscribe(function () {
	
	            this.focus();
	        
	        });
	
	        /*
	             Since this menu is built completely from script, call the "render" 
	             method passing in the id of the DOM element that the menu's 
	             root element should be appended to.
	        */
	        //alert(this.parentId);
            //alert(document.getElementById(this.parentId).id);
            //var elem = document.getElementById(this.parentId).parentNode;
            //var div = document.createElement("div");
            //div.id = "others_menu_div";
            //div.style.textAlign = "left";
            //div.style.align = "left";
            //elem.appendChild(div);
	        this.oMenu.render(document.getElementById(this.parentId).parentNode); 
            document.getElementById("others_menu").style.textAlign = "center";
            //alert("here4");            
	},
	
	showMenu: function()
	{
		this.oMenu.show();
	}
});//end of GisMenu class

Controller = Base.extend({
    tabsFrameName: '',
    mapTabName: '',
    otherTabNames: null,
    selectedObjects: null,
    
    constructor: function(tabsFrameName, mapTabName, otherTabNames)
    {
        this.tabsFrameName = tabsFrameName;
        this.mapTabName = mapTabName;
        this.otherTabNames = otherTabNames;
        
        this.setOnlyMapTabEnabled();
    },
    
    getMiddleControlPanel: function()
    {
        try
        {
            var controlFrame = getFrameObject(parent, 'middleSelectionFrame');	
            var controlPanel = AFM.view.View.getControl(controlFrame , 'object_list_middle');
            return controlPanel;
        }
        catch(ex)
        {
            return null;
        }
    },
    
    getBottomControlPanel: function()
    {
        try
        {
            var controlFrame = getFrameObject(parent, 'bottomSelectionFrame');	
            var controlPanel = AFM.view.View.getControl(controlFrame , 'object_list_bottom');
            return controlPanel;
        }
        catch(ex)
        {
            return null;
        }
    },

    getMapFrame: function()
    {		
        return getFrameObject(getFrameObject(parent, "viewFrame"), "detailsFrame");
    },

    getTabsFrame: function()
    {
        return getFrameObject(parent, this.tabsFrameName);
    },
    
    showMiddleSelectedObject: function()
    {		
        var rows = this.getMiddleControlPanel().rows;
        var selectedRowIndex = this.getMiddleControlPanel().selectedRowIndex;
        
        this.selectedObjects = new Array();
        this.selectedObjects.push(rows[selectedRowIndex]);
        
        if(this.getTabsFrame().getSelectedTabName() == this.mapTabName)
        {
            try{
                this.getMapFrame().showObjectsOnMap(this.selectedObjects);	
            }
            catch(ex){}
            this.getTabsFrame().setAllTabsEnabled(true);	
        }
        
        this.setRestrictions(rows[selectedRowIndex]);
        
        if(this.getTabsFrame().getSelectedTabName() != this.mapTabName)
            AFM.view.View.selectTabPage(this.getTabsFrame().getSelectedTabName());
            
            
        this.getMiddleControlPanel().setAllRowsSelected(false);
    },

    showMiddleSelectedObjects: function()
    {
        this.setOnlyMapTabEnabled();
        this.getTabsFrame().restriction = '';
        
        this.selectedObjects = new Array();
        this.selectedObjects = this.getMiddleControlPanel().getSelectedRows()
        
        var mapFrame = this.getMapFrame();
        if(mapFrame != null)	
            mapFrame.showObjectsOnMap(this.selectedObjects);
    },
    
    showMiddleSelectedObjectsImages: function()
    {
        this.setOnlyMapTabEnabled();
        this.getTabsFrame().restriction = '';
        
        this.selectedObjects = new Array();
        this.selectedObjects = this.getMiddleControlPanel().getSelectedRows()
        
        var mapFrame = this.getMapFrame();
        if(mapFrame != null)	
            mapFrame.showObjectsImagesOnMap(this.selectedObjects);
    },
    
    ShowAllObjectsForBothPanel: function()
    {
    	this.setOnlyMapTabEnabled();
        this.getTabsFrame().restriction = '';
        
        //for bottom images   
        var bottomRows = this.getBottomControlPanel().rows;
        
        //for middle labels
        this.selectedObjects = new Array();
        this.selectedObjects = this.getMiddleControlPanel().getSelectedRows();
        
        if( this.selectedObjects.length > 1 )
        {
        	alert ("Please select only one Building");
        	return;
        }
        
        var mapFrame = this.getMapFrame();
        if(mapFrame != null)	
            mapFrame.showObjectsForBothPanelOnMap(this.selectedObjects, bottomRows);
    },
    
    
    selectMiddleAllRows: function()
	{
		this.getMiddleControlPanel().setAllRowsSelected(true);
	},
	
	deselectMiddleAllRows: function()
	{
		this.getMiddleControlPanel().setAllRowsSelected(false);
	},
    
    setRestrictions: function(row)
    {
    },
    
    setOnlyMapTabEnabled: function()
    {
        try{
            if(this.getTabsFrame().getSelectedTabName() != this.mapTabName)
                this.getTabsFrame().selectTab(this.mapTabName);
            for (var i = 0; i < this.otherTabNames.length; i++) 
            {
                this.getTabsFrame().setTabEnabled(this.otherTabNames[i], false);
            }            
        }catch(ex){}
    },
    
    enableAllTabs: function()
    {
        this.getTabsFrame().setAllTabsEnabled(true);
    }
});



/**
 * Command that executes specified Java Script function.
 * I rewritten it in order to be able to handle something like "object.function"
 */
AFM.command.callFunction = AFM.command.Command.extend({

    functionName: '',

    /**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        this.functionName = commandData.functionName;
    },

    /**
     * Command handler.
     */
    handle: function(context) {
		this.inherit(context);
		var fn = eval(this.functionName);
		if (fn.call) {
			this.context.restriction = this.getRestriction();
			var result = eval(this.functionName + "(" + toJSON(context) + ")");
			if (valueExists(result)) {
				this.result = result;
			}
		}
    }
});//end of callFunction class


/**
 * I rewritten this funtions to correct some problems.
 */
 
function getInputValue(fieldFullName, form)
{
	var returnedValue = "";
	if(fieldFullName!=""){
		if(form==null  || form==""){
			form = document.forms[1].name;
		}
		var objForm = document.forms[form];
		returnedValue = objForm.elements[fieldFullName].value;
        if(returnedValue == null) returnedValue = '';
		returnedValue = trim(returnedValue);
		var typeUpperCase = arrFieldsInformation[fieldFullName]["type"];
        if(typeUpperCase == null) typeUpperCase = '';
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[fieldFullName]["format"];
        if(formatUpperCase == null) formatUpperCase = '';
		formatUpperCase = formatUpperCase.toUpperCase();
		returnedValue=convertFieldValueIntoValidFormat(typeUpperCase,formatUpperCase,returnedValue);
		if(typeUpperCase != "JAVA.SQL.TIME")
			returnedValue = convert2validXMLValue(returnedValue);
		else
			returnedValue = objForm.elements["Stored"+fieldFullName].value;
	}
	return returnedValue;
}

AFM.form.Form.prototype.clearValidationResult = function() 
{
    this.validationResult = new AFM.form.ValidationResult();
    
    // clear validation message
    var messageElement = this.getMessageElement();
    messageElement.innerHTML = "";
    YAHOO.util.Dom.removeClass(messageElement, "formMessage");
    YAHOO.util.Dom.removeClass(messageElement, "formError");
    
    // clear field highlighting for all fields
    var fieldNames = this.getFieldNames();
    for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        
        try{
	        // clear the input element class
	        var fieldInput = $(fieldName);
	        var fieldInputTd = fieldInput.parentNode;
	        YAHOO.util.Dom.removeClass(fieldInputTd, "formErrorInput");
	        
	        // remove per-field error messages
	        var errorTextElements = YAHOO.util.Dom.getElementsByClassName('formErrorText', '', fieldInputTd);
	        for (var e = 0; e < errorTextElements.length; e++) {
	            fieldInputTd.removeChild(errorTextElements[e]);
	        }
        }catch(ex){}
    }
    
    // both Save and Refresh clear the afm_form_values_changed flag
    afm_form_values_changed = false;
}

Calendar.formatCalendar = function (year, month, day){
	month = month + "";
	month = parseInt(month, 10);
	var obj_MM = $(this.MMID, false);
	if(obj_MM!=null){
		for(var i=0;i<obj_MM.length;i++){
			if(obj_MM[i]!=null && obj_MM[i].value==month){
				obj_MM[i].selected=1;
				break;
			}
		}
	}
	var obj_YYYY = $(this.YYYYID, false);
	if(obj_YYYY!=null)
		obj_YYYY.innerHTML = year;
	var daysOfMonth = 31;
	if(month==4||month==6||month==9||month==11){
		daysOfMonth = 30;
	}else{
		if( month == 2 ){
			daysOfMonth = 28;
			if( ( year % 4 == 0 && year % 100 != 0 ) || ( year % 400 == 0) )
				daysOfMonth = 29;
		}
	}
	var date	= new Date( year, month-1, 1);
	var dayOfFirst	= date.getDay();
	var var_day	= 1;
	var dd;

	var curDate	= new Date();
	var curYear	= curDate.getFullYear();
	var curMonth	= curDate.getMonth()+ 1;
	var curDay	= curDate.getDate();
	if(typeof day == "undefined")
		day = curDay;

	for(var i = 0; i <= 41; i++){
		var objElem = $(this.DateButton+(i+1), false);
		if(objElem!=null){
			if( ( i < dayOfFirst )  ||  ( var_day > daysOfMonth ) ){
				if( document.all ||(!document.all && document.getElementById) )
					if(objElem.style != null)objElem.style.visibility = "hidden";
			}else{
				if( var_day.toString().length < 2 )
					dd = " " + var_day + " ";
				else
					dd = var_day;

				objElem.innerHTML = dd;
				if(objElem.style!=null){
				objElem.style.visibility = "visible";
				if(curYear==year && curMonth==month && dd == day){
					objElem.style.backgroundColor="#FFCC66";
					objElem.style.borderStyle="solid";
					objElem.style.borderColor="#FF9900";
					objElem.style.borderWidth="thin";
				}else{
					objElem.style.backgroundColor="";
					objElem.style.borderStyle="";
					objElem.style.borderColor="";
					objElem.style.borderWidth="";
				}
				var_day = var_day + 1;
				}
			}
		}
	}
};



function createHeader(element)
{
	//var div = document.createElement("div");
	//div.id = "mapHeader";
	//div.className = "panelHeader";
	//div.innerHTML = "Streets";
	//div.style.cssText = "color: #000000; text-align: center;font-size: 12px;font-weight: bold;padding-top: 2px;"
	//element.parentElement.parentNode.insertBefore(div, element.parentElement.parentNode.firstChild);//'<div id="mapHeader" class="panelHeader" width="100%" style="color: #000000; text-align: center;font-size: 12px;font-weight: bold;padding-top: 2px;">Streets</div>',
		//element.parentElement.parentNode.firstChild); 
		
}

function changeHeader(str)
{
	//var div = document.getElementById("mapHeader");
	//div.innerHTML = str;
}