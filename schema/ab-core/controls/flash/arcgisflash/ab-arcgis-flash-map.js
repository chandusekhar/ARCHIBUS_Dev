/**
 * This control is used for Flash-based map API.
 */

Ab.namespace('flash');

//this is the ArcGIS Map control itself.
var mapControl = null;

//this is the license type
var license_type = null;

/*
 *  check to see whether user has valid license
 *  removed at Bali3
 */
function hasValidArcGisMapLicense(){
	return true;	
};

// To be called by ActionScript.
function getMapProperties_JS(){
	mapControl.map = mapControl.getSWFControl();
	mapControl.refreshDataFromDataSource();
	var obj = new Object();
  obj.availableMapLayerListItems = mapControl.availableMapLayerList.items;
  obj.defaultLayer = mapControl.defaultLayer;
  obj.availableMapLayerListKeys = mapControl.availableMapLayerList.keys;
  obj.license_type = license_type;
  obj.HYBRID_LAYER = mapControl.HYBRID_LAYER;
  obj.showLabels = mapControl.showLabels;
  obj.labelTextFormatProperties = mapControl.labelTextFormatProperties;
  obj.autoZoomLevelLimit = mapControl.autoZoomLevelLimit;

  if(valueExists(mapControl.thematicColorSizeMapEnabled)){
  	obj.thematicColorSizeMapEnabled = mapControl.thematicColorSizeMapEnabled;
  }
    
  if(mapControl.highlightStructureEnabled && (!mapControl.highlightStructureByDataEnabled)){
  	obj.data = [mapControl.data[0]];
  } else {
  	obj.data = mapControl.data;
  }

  if(mapControl.highlightStructureButtonShown == null){
  	if(mapControl.highlightStructureEnabled){
  		obj.highlightStructureButtonShown = true;
  	}
  } else {
  	obj.highlightStructureButtonShown = mapControl.highlightStructureButtonShown;
  }

  if(valueExists(mapControl.bFillSymbolEnabled)){
  	obj.bFillSymbolEnabled = mapControl.bFillSymbolEnabled;
  }
        
  obj.dataSourceMarkerPairs = mapControl.dataSourceMarkerPairs;
  obj.mouseClickEnabled = mapControl.mouseClickEnabled;
  obj.highlightStructureEnabled = mapControl.highlightStructureEnabled;
  obj.highlightStructureByDataEnabled = mapControl.highlightStructureByDataEnabled;
  obj.queryURL = mapControl.queryURL;
  
  return toJSON(obj);
}

function getDataFromQueryResults_JS(infoWindowTitleField, restriction){
	var newRestriction = mapControl.restriction;
	if(newRestriction == null){
		newRestriction = new Ab.view.Restriction();
	}
		
	var concatValues = restriction.split(",");
	for(var i=0; i<concatValues.length; i++){
		var concatValue = concatValues[i];
		var values = concatValue.split("_");
		var relop = ")OR(";

		for(var j=0; j<infoWindowTitleField.length; j++){
			var name = infoWindowTitleField[j];
			var value = values[j];

			if (j > 0){
				relop = "AND";
			} 
			newRestriction.addClause(name, value, "=", relop);
		}
	}
	
	mapControl.restriction = newRestriction;
	mapControl.refreshDataFromDataSource();
	return mapControl.data;
}

function graphicsMouseClickHandler_JS(title, attributes){
	mapControl.mouseClickHandler(title, attributes);
}	  		

// Get localized string.
function getLocalizedString_map_JS(input) {
	try {
		return mapControl.getLocalizedString_map(input);
	}
	catch (e) {
		return input;
	}
};

function saveGeocodeRecords(tableName, JSONRecord) {
	//call WFR to save record
	var parameters = {
		tableName: tableName,
		fields: JSONRecord
	}
	
	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
	if (result.code != 'executed') {
		Ab.workflow.Workflow.handleError(result);
	}
}

function getDecimalSeparator_JS(){
	return strDecimalSeparator;
}

function getGroupingSeparator_JS(){
	return strGroupingSeparator;
}


Ab.flash.Map = Ab.flash.FlashControl.extend({
	
    // @begin_translatable
    z_MESSAGE_LAYER_NOT_VISIBLE: 'This map layer is not available at this level. You need to zoom out to view this layer.',
    z_MESSAGE_INVALID_LICENSE: 'Please refer to the Enabling GIS Services System Management Help topic for instructions on how to enable this view.',
    z_MESSAGE_TERMS_OF_USE: 'Use of the ESRI ArcGIS Online Services is subject to the Terms of Use available on the ESRI Web site.',
    // @end_translatable
	      
    //the ESRI ArcGIS Map
   	map: null,

    // the panel that holds the div to the map
    panelId: '',
       
    //the div which holds the map
    divId: '',
    
    //the div which holds the map
    dataSourceId: '',
        
    //the width and height of the div which holds the map
    divWidth: null,
    divHeight: null,    
    		
    //the graphic mouse click call back function passed in 
    mouseClickHandler: null,
    mouseClickEnabled: false,    
	
    //Ext.util.MixedCollection
    //it holds all pairs of datasource-ArcGISMarkerProperty
    //key is the dataSource, value is the corresponding ArcGISMarkerProperty
    dataSourceMarkerPairs: null,
    
    //this is the multipoints object which holds all points on the map
    allPoints: null,
    
    //the restriction passed through the refresh function
    restrictionFromRefresh: null,
    
    //Ext.util.MixedCollection
    //It holds all layerName--layerURL pairs available to the map
    availableMapLayerList: null,
    
    HYBRID_LAYER: 'World Imagery and Street Hybrid', 
    
    mapInited: false,	
    
    swfParam: '',
    
    queryURL: null,
    
    defaultLayer: '', 
    
    highlightStructureEnabled: false,
    
    highlightStructureByDataEnabled: false,
    
    highlightStructureButtonShown: null,
    
    showLabels: null,
    
    labelTextFormatProperties: {},
    
    autoZoomLevelLimit: 13,
    
    thematicColorSizeMapEnabled: false,       
    	
	// @begin_translatable
	// @end_translatable

	constructor: function(panelId, divId, dataSourceId, showLabels, labelTextFormatProperties) {
		mapControl = this;		
		this.divId = divId;	
		this.panelId = panelId;
		this.dataSourceId = dataSourceId;

		// this.dataSourceMarkerPairs = new Ext.util.MixedCollection();
		this.dataSourceMarkerPairs = new Object();
	
		this.divWidth = document.getElementById(this.divId).clientWidth;
		this.divHeight = document.getElementById(this.divId).clientHeight;
		this.showLabels = showLabels;
		this.labelTextFormatProperties = labelTextFormatProperties;

		this.swfParam = '?panelId=' + panelId;
		var license_type = 'prod';
		this.swfParam +='&mapId=' + this.divId + '_OE';

		this.swfParam += '&license_type=' + license_type;
		this.swfParam += '&divWidth=' + this.divWidth;
		this.swfParam += '&divHeight=' + this.divHeight;
		this.swfParam += '&showLabels=' + this.showLabels;

		//build the layerList which holds all available layers to the map
		// this.buildAvailableLayerList();
		
		if (hasValidArcGisMapLicense()){
			this.buildAvailableLayerList();
			
			//display terms of use message
			var reportTargetPanel = document.getElementById(this.divId);      	
			var bodyElem = reportTargetPanel.parentNode;
			
			// tos
			var pTag = document.createElement("p");
			pTag.id = "tos";
			pTag.style.fontSize="0.55em";
			pTag.style.color="#999999";
			pTag.innerHTML = View.getLocalizedString(this.z_MESSAGE_TERMS_OF_USE);;
			bodyElem.appendChild(pTag);
			
			var panel = View.panels.get(this.panelId);
			this.region = panel.region;	
			this.inherit(this.divId, this.dataSourceId, "arcgisflash/AbArcgisFlash", this.swfParam);	

		} else {
			var msg = View.getLocalizedString(this.z_MESSAGE_INVALID_LICENSE);
			View.showMessage(msg);
		}
	},
	
	afterLayout: function() {
		var regionPanel = this.getLayoutRegionPanel.defer(100, this);
		if (regionPanel) {
			
			// attach event listeners that update the panel size when the layout region is re-sized
			if (!this.resizeListenerAttached && regionPanel.hasOwnProperty('addListener')) {
				this.resizeListenerAttached = true;
				regionPanel.addListener('resize', this.afterResize, this);
				//regionPanel.addListener('expand', this.afterResize, this);			
			}
			
			// set the initial panel size to match the layout region size
			this.afterResize();
		}		
	},	

	afterResize: function() { 
		this.syncHeight(Ext.get(this.panelId));
	},
		
	syncHeight: function(el) {   
		if (valueExists(el)) {
			el = Ext.get(this.panelId);
			if(this.divHeight == '' || this.divHeight == 0){
				var divEl = Ext.get(this.divId);			
				var height = Ext.get(Ext.get(this.panelId).dom.parentNode.parentNode.parentNode.id).getHeight();
				var titlebar = Ext.get(this.panelId + '_head');
				var titlebarHeight = (titlebar) ? titlebar.getHeight() : 0;
				height -= titlebarHeight;

				var tos = Ext.get('tos');
				height -= (tos) ? tos.getHeight() : 0; 
				
				if (height > 0) {
					el.setHeight(height-2);
					divEl.setHeight(height -2);
					//this.refresh();
				}
			}
		}	
	},
		
	/*
	*  get layer names for all available map layers 
	*/
	getAvailableMapLayerList: function() {
		return this.availableMapLayerList.keys;
	},
		
  /*
	*  get layer names for all available map layers 
	*/
	addLayerToAvailableMapLayerList: function(layerName, type, url) {
		this.availableMapLayerList.add(layerName, {type: type, url: url});
	},
	
	/*
	*  build the layerName-layerURL pairs which are available 
	*/
	buildAvailableLayerList: function() {

		this.availableMapLayerList = new Ext.util.MixedCollection();

		
		//HYBRID_LAYER: 'World Imagery and Street Hybrid'
		//This is the combination of "World Imagery", "World Transportation" and "World Boundaries and Places"
		//create specifically by ArcGISMap control
		this.availableMapLayerList.add(this.HYBRID_LAYER, {type: "tiled", url: "hybrid"});
		
		var appIdCode = "";
		if(license_type=='prod'){
			appIdCode = "?appId=esriAI2010";
		}
		//base maps		
		this.availableMapLayerList.add("World Imagery", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" + appIdCode});
		this.availableMapLayerList.add("World Street Map", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Topographic Maps", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer" + appIdCode});
		this.availableMapLayerList.add("World Physical Map", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer" + appIdCode});
		this.availableMapLayerList.add("World Shaded Relief Imagery", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer" + appIdCode});
	
		//Specialty Maps
		this.availableMapLayerList.add("USA 2000-2008 Population Change", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA 2008 Diversity Index", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Diversity_Index/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA 2008 Median Household Income", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Household_Income/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Average Household Size", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Average_Household_Size/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Population by Sex", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_by_Sex/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Labor Force Participation Rate", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Median Age", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Age/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Median Home Value", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Home_Value/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Median Net Worth", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Net_Worth/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Owner Occupied Housing", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Social Vulnerability Index", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer" + appIdCode});
		this.availableMapLayerList.add("Percentage of U.S. Population Older than Age 64", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer" + appIdCode});
		this.availableMapLayerList.add("Percentage of U.S. Population Aged Younger than 18 Years", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Under_18/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Population Density", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Projected Population Change", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Projected_Population_Change/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Population Change 2000-2010", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Recent_Population_Change/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Retail Spending Potential", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Tapestry Segmentation", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Tapestry/MapServer" + appIdCode});
		this.availableMapLayerList.add("USA Unemployment Percentage Rate", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer" + appIdCode});
		this.availableMapLayerList.add("World Navigation Maps", {type: "tiled", url: "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/World_Navigation_Charts/MapServer" + appIdCode});
	},
	
	getLocalizedString_map:function(input){
		return View.getLocalizedString(input);
	},	
	
	/*
	*  clear the whole map, remove all markers
	*/
	clear: function(){
		this.map.clearGraphics();
		// this.dataSourceMarkerPairs = null;
	},

	/**
	 * Calls the refresh workflow rule to get grid data.
	 */
	getData: function() {
		try{
			var result = null;
			var parameters = {};
			var originalRequestURL = View.originalRequestURL;

     	var parameters = {
     			dataSourceId: this.dataSourceId,
     			recordLimit: 0,
     			viewName: originalRequestURL.substr(originalRequestURL.lastIndexOf("/")+1, originalRequestURL.length -1),
     			restriction: toJSON(this.restriction) 
     	};
    	
     	var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
     	if(result.data == null){
     		return [];
     	} else{
     		var records = result.data.records;
     		return result.data.records;
     	}   		
    } catch(e){
     	alert(toJSON(e));
		}
	},
			
	refreshDataFromDataSource:function(){
		var ds = View.dataSources.get(this.dataSourceId);
		if (ds==null) return;
		if (this.restriction == null){
		} else {
			this.data = this.getData();
		}

		/*
		var ds = View.dataSources.get(this.dataSourceId);
		if (ds==null) return;

 		ds.parameters['recordLimit'] = 0; 	

		var markerProperty = this.getMarkerPropertyByDataSource(this.dataSourceId);
		var infoWindowAttribute = markerProperty['infoWindowAttribute'];
		
		var records = ds.getRecords(this.restriction);
		var newRecords = [];
		for(var i=0; i<records.length; i++){
  		var obj = new Object();
  		var values = new Object();
  		for(var j=0; j<infoWindowAttribute.length; j++){
  			values[infoWindowAttribute[j]] = records[i].getValue(infoWindowAttribute[j]);
  		}
  		obj.values = values;
  		
  		newRecords.push(obj);
  	}

  	this.data = newRecords;
  	*/
	},
	
	refresh:function(restriction){
	 	if (this.map !=null){
	 		this.restriction = restriction;
	 	 // this.refreshDataFromDataSource();
	 		this.map.RefreshData();
		}
	},
	
 /*
	*  add and update the DataSourceMarkerPropertyPair
	*  @param ds. The dataSource name
	*  @param markerProperty. The corresponding ArcGISMarkerProperty
	*/
	updateDataSourceMarkerPropertyPair: function(ds, markerProperty){
		// get titles
		markerProperty['titles'] = this.getTitlesForInfoWindowAttribute(ds, markerProperty);
		//if( this.getMarkerPropertyByDataSource(ds) == null ) {
			// this.dataSourceMarkerPairs.add(ds, markerProperty);
			//this.dataSourceMarkerPairs[ds] = markerProperty;
		//} else {
			this.dataSourceMarkerPairs[ds] = markerProperty;
			// this.dataSourceMarkerPairs.replace(ds, markerProperty);
		//}
	},

    /*
     *  set restriction for dataSource
     *  @param restrictionParam. The restriction.
     */  
    getTitlesForInfoWindowAttribute: function(ds, markerProperty) {
    	var fields = markerProperty.infoWindowAttribute;
    	var titles = new Array();
    	for(var i=0; i<fields.length; i++){
    		var title = this.getFieldTitle(markerProperty.dataSourceName, fields[i]);
    		titles.push(title);
    	}
    	return titles;
    },
    	
	/*
	*  return the markerProperty for given ds
	*  @param ds. The dataSource name
	*/
	getMarkerPropertyByDataSource: function(ds){
		// return this.dataSourceMarkerPairs.get(ds);
		return this.dataSourceMarkerPairs[ds];
  },
  
  /**
  * create thematic legend as an ext.window
  *  @param markerProperty. The ArcGISMarkerProperty associated with thematic markers.
  */
  buildThematicLegend: function(markerProperty) {
  	//create legend if not exist
  	if( this.thematicLegend == null ){
  		
  		// remove legend DOM element if exists
  		var legendDiv = Ext.get('legend_div');
  		if (legendDiv != null) {
  			legendDiv.remove();
  		}
  		
  		// create new legend DIV
  		var htmlDiv = '<div id="legend_div" class="x-hidden"></div>';
  		Ext.DomHelper.insertHtml('afterBegin', document.body, htmlDiv);
  		
  		//create legend
  		//var topY = Ext.fly(this.divId).getTop(false) + 5;
			//var topX = Ext.fly(this.divId).getLeft(false) + 60;
			
			var topY = Ext.fly(this.panelId).getTop(false);
			var topX = Ext.fly(this.panelId).getRight(false)-250;
						
			var title = this.getFieldTitle(markerProperty.dataSourceName,  markerProperty.thematicField);
			var thematicBuckets = markerProperty.getThematicBuckets();
			var thematicColors = markerProperty.getThematicColors();
			var thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;	
												
			//define the width and height for the legend
			var height = 160;
			var bucketsHeight = 40 * thematicColors.length;
			
			if(!thematicFieldIsNumber){
				// height = 130;
				bucketsHeight = 20 * thematicColors.length + 15;
				height = bucketsHeight;
			}
			
			if(bucketsHeight < height ) {
				height = bucketsHeight;
			}
			var width = 250;
			
			//build a html table based on the thematicBuckets and the thematicColors
			//var htmlBody = "<table width = " + tableWidth + "; border=1 style='font-size:11; font-weight:bold; color:blue; font-family: Verdana, Arial, Helvetica, sans-serif'>";
			var htmlBody = "<table style='font-size:11; font-weight:bold; color:blue; font-family: Verdana, Arial, Helvetica, sans-serif'>";
		 
		  if(thematicFieldIsNumber){
		  	for (var i=0; i<thematicBuckets.length+1; i++) {
		  		//convert RGB color to hex color
		  		var RGBColor = thematicColors[i];
		  		var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
		  		htmlBody += "<tr><td style='filter:alpha(opacity=60); opacity: 0.60; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
					if (i==0) {
						htmlBody += "&nbsp;x&nbsp;&lt;" + insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
						htmlBody += "<tr height=3></tr>";
					}
					else if (i==thematicBuckets.length) {
						htmlBody += "&nbsp;" + insertGroupingSeparator(thematicBuckets[i-1]+"", true, true) + "&le;&nbsp;x</td></tr>";
					} else {
						htmlBody += "&nbsp;" + insertGroupingSeparator(thematicBuckets[i-1]+"", true, true) + "&le;&nbsp;x&nbsp;&lt;" + insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
						htmlBody += "<tr height=3></tr>";
					}
				}			
			}else{ 
				for (var i=0; i<thematicBuckets.length; i++) {
		  		//convert RGB color to hex color
		  		var RGBColor = thematicColors[i];
		  		var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
		  		htmlBody += "<tr><td style='filter:alpha(opacity=60); opacity: 0.60; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
		  		htmlBody += insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
		  		if(i < thematicBuckets.length-1){
						htmlBody += "<tr height=3></tr>";
					}
				} 
			}
			htmlBody += "</table>";
			
			//create the legend as ext.window 
			this.thematicLegend = new Ext.Window({
				el: 'legend_div',
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
				
				this.thematicLegend.show();
			}
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
   	 * 	get data records
   	 *  @param dataSourceName. The dataSourceName.
     *  @param restriction. The Restriction.
     *  @return. The dataRecords.
   	 */
   	getDataSourceRecords: function(dataSourceName, restriction){
   	 	var ds = View.dataSources.get(dataSourceName);
   	 	return ds.getRecords(restriction);
   	},
   	
   	/*
     *  define the graphic mouse click event call back function
     *  @param {handler} Required.  The call back function name.
     *  	
     */
   	addMouseClickEventHandler: function(handler) {
   		this.mouseClickHandler = handler;
   		this.mouseClickEnabled = true;
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

   	/*
     *  return the auto zoom lod limit
     *  @return this.autoZoomLevelLimit
     */
   	getAutoZoomLevelLimit: function(){
   		return this.autoZoomLevelLimit;
   	},

   	/*
     *  set the auto zoom lod limit 
     *  @param autoZoomLevelLimit Required.   	
     */   	   	
   	setAutoZoomLevelLimit: function( autoZoomLevelLimit ){
   		this.autoZoomLevelLimit =  autoZoomLevelLimit;
   	}
});



/*
 *   This class define common properties for a group of markers 
 */ 
Ab.flash.ArcGISMarkerProperty = Base.extend({  	

	//the predefined symbol type
	SYMBOLTYPE_CIRCLE: 'circle', // default
	SYMBOLTYPE_CROSS: 'cross', 
	SYMBOLTYPE_DIAMOND: 'diamond', 
	SYMBOLTYPE_SQUARE: 'square', 
	SYMBOLTYPE_X: 'x', 
	
	//the symbol type of the markers
	symbolType: null, 
	
	//the predefined sybmol color
	colors: [ 	[255,0,0,0.75],  //default
					[165,42,42,0.75],
					[191,62,255,0.75],
					[30,144,255,0.75],
					[69,139,116,0.75],
					[0,0,255,0.75],
					[205,127,50,0.75],
					[255,127,36,0.75],
					[124,252,0,0.75],
					[255,140,0,0.75]	],
					
	//the available number of colors
	colorNumber: null,

	//the dataSource associated with markers
	dataSourceName: null,
	
	//fields defined in dataSource
	infoWindowTitleField: [],
	infoWindowAttribute: null,
	geometryFields:null,
	
	//thematic marker properties
	showThematicSymbol: false,
	thematicField: null,
	thematicBuckets: null,
	thematicColors: null,
  thematicFieldIsNumber: null,
  symbolSize: 15,
  symbolAlpha: 1, 
  symbolXOffset: 0, 
  symbolYOffset: 0, 
  symbolAngle: 0,
  color: null,
	
	//the restriction set for dataSource
	restriction: null,

	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     *  @param infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     */
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam) {
    	
    	this.dataSourceName = dataSourceNameParam;
    	this.geometryFields = geometryFieldsParam;
    	this.infoWindowTitleField = infoWindowTitleFieldParam;
    	this.infoWindowAttribute = infoWindowAttributeParam;
    	
    	this.colorNumber = this.colors.length;
    	
    	this.symbolType = this.SYMBOLTYPE_CIRCLE;   	
    },
    
    setRestriction: function(restrictionParam) {
    	this.restriction = restrictionParam;
    },    

    /*
     *  get symbol type for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolType: function() {
    	return this.symbolType;
    },
    
    /*
     *  set symbol type for the marker.  Both for simple and for thematic symbol.
     *	@param symbolTypeParam. Required.  Options are "circle", "square", "diamond", "cross", and "x"
     */
    setSymbolType: function(symbolTypeParam) {
    	this.symbolType = symbolTypeParam;
    },

    /*
     *  get symbol's size property for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolSize: function() {
    	return this.symbolSize;
    },
    
    /*
     *  set symbol's size property for the marker.  Both for simple and for thematic symbol.
     *	@param symbolSizeParam. Required.  
     */
    setSymbolSize: function(symbolSizeParam) {
    	this.symbolSize = symbolSizeParam;
    },

    /*
     *  get symbol's alpha property for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolAlpha: function() {
    	return this.symbolAlpha;
    },
    
    /*
     *  set symbol's alpha property for the marker.  Both for simple and for thematic symbol.
     *	@param symbolAlphaParam. Required.  
     */
    setSymbolAlpha: function(symbolAlphaParam) {
    	this.symbolAlpha = symbolAlphaParam;
    }, 
    
    /*
     *  get symbol's xoffset property for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolXOffset: function() {
    	return this.symbolXOffset;
    },
    
    /*
     *  set symbol's xoffset property for the marker.  Both for simple and for thematic symbol.
     *	@param symbolXOffsetParam. Required.  
     */
    setSymbolXOffset: function(symbolXOffsetParam) {
    	this.symbolXOffset = symbolXOffsetParam;
    },
    
    /*
     *  get symbol's yoffset property  for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolYOffset: function() {
    	return this.symbolYOffset;
    },
    
    /*
     *  set symbol's yoffset property for the marker.  Both for simple and for thematic symbol.
     *	@param symbolYOffsetParam. Required.  
     */
    setSymbolYOffset: function(symbolYOffsetParam) {
    	this.symbolYOffset = symbolYOffsetParam;
    }, 

    /*
     *  get symbol for the marker.  Both for simple and for thematic symbol.
     */
    getSymbolAngle: function() {
    	return this.symbolAngle;
    },
    
    /*
     *  set symbol's angle property for the marker.  Both for simple and for thematic symbol.
     *	@param symbolAngleParam. Required.
     */
    setSymbolAngle: function(symbolAngleParam) {
    	this.symbolAngle = symbolAngleParam;
    },          
 
     /*
     *  get simple symbol color for the marker.  Only for simple symbol.
     */
    getSimpleColor: function() {
    	return this.color;
    },
    
       
    /*
     *  set simple symbol's color property for the marker.  Only for simple symbol.
     *	@param symbolColorParam. Required.
     */
    setSimpleColor: function(symbolColorParam) {
    	this.color = symbolColorParam;
    },  
    
    /*
     *  set thematic property for the marker.  
     *	@param thematicFieldParam. The value in whice decides which thematic bucket the marker belongs to.
     *  @param thematicBucketsParam.  The arrary which holds the thematic buckets values.  
     *          e.g [10, 20, 30], if the value is 11, then it belongs to the buckets between 10 and 20.
     */
    setThematic: function(thematicFieldParam, thematicBucketsParam) {
    	this.showThematicSymbol = true;
    	this.thematicField = thematicFieldParam;
    	var ds = View.dataSources.get(this.dataSourceName);
    	this.thematicFieldIsNumber = ds.fieldDefs.get(this.thematicField).isNumber();
    	this.thematicBuckets = thematicBucketsParam;

   		if(!this.thematicFieldIsNumber){
   			// get count
   			this.thematicBuckets = this.getDistinctFieldValues(this.thematicField);	
   		}
   		
   		// if there are more buckets than colors, generate more colors
			if (this.colors.length < this.thematicBuckets.length){
				// generate more colors
				var colorsNeeded = this.thematicBuckets.length-this.colors.length;
				for (var x=0; x<colorsNeeded; x++){
					this.colors.push(this.generateRandomColor());					
				}
				this.colorNumber = this.colors.length;
			}
   		this.thematicColors = new Array();
   		//defince color for each individual thematic bucket
   		for (var i = 0; i <= this.thematicBuckets.length; i++) {
   			//for thematic marker, we use the predefined colors rotately for thematic bucket
   			this.thematicColors[i] = this.colors[i%this.colorNumber];	
      }
    },
    
    /*
     *
     *  get functions
     *
     */ 
    getThematicField: function() {
    	return this.thematicField;
    },
    
    getThematicBuckets: function() {
    	return this.thematicBuckets;
    },
    
    getThematicColors: function() {
    	return this.thematicColors;
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
    }
});


Ab.flash.ThematicColorSizeMap = Ab.flash.Map.extend({
	thematicColorSizeMapEnabled: true,
	showLegend: false,
	
	constructor: function(panelId, divId, dataSourceId, showLabels, labelTextFormatProperties) {
		this.thematicColorSizeMap = true;		
		this.inherit(panelId, divId, dataSourceId, showLabels, labelTextFormatProperties);	
	}	
});	


Ab.flash.ArcGISThematicColorSizeMarkerProperty = Ab.flash.ArcGISMarkerProperty.extend({	
	// heat map specific properties	
	sizeField: "",
	sizeMultiplier: 1,							// optional
	bApplySizeLimits: false,				// optional
	maxSizeValueLimit:-1,								// optional
	minSizeValueLimit:0,								// optional
	
	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     *  @param infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     *  @param thematicFieldParam. 			The thematic field whose value determines the symbol color
     *  @param thematicBucketsParam.		The thematic color buckets
     *  @param sizeFieldParam.					The field whose value determines the symbol size
     *  @param sizeMultiplierParam.			Multiplier that is applied to size field values as a means of scaling the symbol sizes.  Default is 1.			
     *  @param bApplySizeLimitsParam		Whether or not to apply a min value limit on the size
     *  @param maxValueLimitParam				Maximum size value limit
     *  @param minValueLimitParam				Minimum size value limit
     */
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam, thematicFieldParam, thematicBucketsParam, sizeFieldParam, sizeMultiplierParam, bApplySizeLimitsParam, minSizeValueLimitParam, maxSizeValueLimitParam) {
		this.thematicField = thematicFieldParam;
		this.thematicBuckets = thematicBucketsParam;
		this.sizeField = sizeFieldParam;
		if(sizeMultiplierParam){
			this.sizeMultiplier = sizeMultiplierParam;
		}
		if(bApplySizeLimitsParam){
			this.bApplySizeLimits = bApplySizeLimitsParam;
			if(maxSizeValueLimitParam){
				this.maxSizeValueLimit = maxSizeValueLimitParam;
			}
			if(minSizeValueLimitParam){
				this.minSizeValueLimit = minSizeValueLimitParam;
			}
		}
		this.inherit(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam);
	}
});	

Ab.flash.ArcGISThematicColorSizeBucketMarkerProperty = Ab.flash.ArcGISMarkerProperty.extend({	
	// heat map specific properties	
	sizeField: "",
	sizeBuckets: [],
	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     *  @param infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     *  @param thematicFieldParam. 			The thematic field whose value determines the symbol color
     *  @param thematicBucketsParam.		The thematic color buckets
     *  @param sizeFieldParam.					The field whose value determines the symbol size
     *  @param sizeBucketsParam.			Size buckets		
     */
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam, thematicFieldParam, thematicBucketsParam, sizeFieldParam, sizeBucketsParam) {
		this.thematicField = thematicFieldParam;
		this.thematicBuckets = thematicBucketsParam;
		this.sizeField = sizeFieldParam;
		this.sizeBuckets = sizeBucketsParam;

		this.inherit(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam);
	}
});	