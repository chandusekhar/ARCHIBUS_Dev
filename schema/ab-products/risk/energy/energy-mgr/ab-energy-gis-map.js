/**
 * override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function mapLoadedCallback() {

	// resize the map info window
	mapController.map.map.infoWindow.resize(500,400);

	// switch to the gray canvas basemap
	mapController.map.switchBasemapLayer.defer(500, mapController.map, ['World Gray Canvas with Labels']);

}

var mapConfigObject = {
        "mapLoadedCallback":  mapLoadedCallback
}

var isLoaded = false;
var mapController = View.createController('mapCtrl',{
	map: null,
	layerMenu: null,
	menuParent: null,
	menu: new Array(),
	subMenu: new Array(),
	items:new Array(),
	type:'',
	markerType: '',
	leaseId: '',
	records: null,
	isValidLicense: false,
	markerProperty: null,
	highlightColumns:{
		'option_energy_cost_occup':'total_energy_cost_occup',
		'option_energy_consumption_occup':'total_energy_consumption_occup',
		'option_energy_demand_occup':'total_energy_demand_occup',
		'option_energy_volume_occup':'total_energy_volume_occup',		
		'option_energy_cost_area':'total_energy_cost_area',
		'option_energy_consumption_area':'total_energy_consumption_area',
		'option_energy_demand_area':'total_energy_demand_area',
		'option_energy_volume_area':'total_energy_volume_area',
		'option_energy_cost':'total_energy_cost',
		'option_energy_consumption':'total_energy_consumption',
		'option_energy_demand':'total_energy_demand',
		'option_energy_volume':'total_energy_volume'
	},
	highlightByOptions:new Array(),
	highlightSelected:'',
	units: 'MMBTU',
	unitsMenu: null,
	
	afterViewLoad: function(){
    	var billUnits = abEnergyBillCommonController.unitsConversionFactorSql;
   		billUnits = billUnits.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_dflt);
   		billUnits = billUnits.replace(/\{1\}/g, 'ELECTRIC');
   		this.dsBuilding.addParameter("unitsConversionFactor", billUnits);
	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },
	
	afterInitialDataFetch: function(){
		this.initUnits();
		
		initializeMap();
				
		// basemap layer menu
 	    var basemapLayerMenu = mapController.htmlMap.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}
	},
	
	initUnits: function(){
		this.units = this.abEnergyBillCommon_ds.getRecord().getValue('bill_unit.vf_qty_energy_unit');
		
		this.setUnits();
		this.initUnitsMenu();
	},
	
	setUnits: function(){
		var title = getMessage('option_energy_consumption_occup').replace("MMBTU", this.units);
		this.dsBuilding.fieldDefs.get('bl.total_energy_consumption_occup').title = title;
		
		title = getMessage('option_energy_consumption_area').replace("MMBTU", this.units);
		this.dsBuilding.fieldDefs.get('bl.total_energy_consumption_area').title = title;
		
		title = getMessage('option_energy_consumption').replace("MMBTU", this.units);
		this.dsBuilding.fieldDefs.get('bl.total_energy_consumption').title = title;
	},
	initUnitsMenu: function(){
		this.htmlMap.actions.get("unitsMenu").setTitle(this.units);
		var unitsMenu = Ext.get('unitsMenu');
		unitsMenu.on('click', this.showUnitsMenu, this, null);		
	},
	showUnitsMenu: function(e, item){
		if(mapController.items.length == 0){
			View.showMessage(getMessage('error_noselection'));
			return;
		}
		
		if(this.unitsMenu == null ) {
    		var menuItems = [];
    		var unitsRecords = this.view.dataSources.get("abEnergyBillCommon_ds_allEnergyUnits").getRecords();
        	for (var i = 0; i < unitsRecords.length; i++) {
        		var unitRecord = unitsRecords[i];
    			var unit = unitRecord.getValue("bill_unit.bill_unit_id");
		    	menuItems.push({
		            text: unit,
		            handler: this.switchUnits
		        })     
        	}
	     	this.unitsMenu = new Ext.menu.Menu({items: menuItems});
	  	}
        this.unitsMenu.showAt(e.getXY());
    },
    switchUnits: function(item) {
    	mapController.units = item.text;
    	mapController.htmlMap.actions.get("unitsMenu").setTitle(mapController.units);
    	mapController.setUnits();
    	
    	var billUnits = abEnergyBillCommonController.unitsConversionFactorSql;
    	billUnits = billUnits.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_user);
		billUnits = billUnits.replace(/\{0\}/g, mapController.units);
		billUnits = billUnits.replace(/\{1\}/g, 'ELECTRIC');
   		mapController.dsBuilding.addParameter("unitsConversionFactor", billUnits);
    	
    	mapController.htmlHighlight_onApply();
    },
	showMenu: function(e, item){
		var menuItems = [];
		var type = 0;
		for(var i=0;i<this.menu.length;i++){
			var subMenuItems = [];
			for(var j=0;j<this.subMenu[i].length;j++){
				var subMenuItem = new Ext.menu.Item({
					text: getMessage('submenu_'+this.subMenu[i][j]),
            		handler: reports.createDelegate(this, [type])});
				subMenuItems.push(subMenuItem);
				type = type + 1;
			}
			var menuItem = null;
			if(subMenuItems.length > 0){
				menuItem = new Ext.menu.Item({
					text: getMessage('menu_' + this.menu[i]),
					menu: {items: subMenuItems}
				});
			}else{
				menuItem = new Ext.menu.Item({
					text: getMessage('menu_' + this.menu[i]),
					handler: reports.createDelegate(this, [type])});
				type = type + 1;
			}
			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.show(this.menuParent, 'tl-bl?');
	},
	loadMenu: function(){
		if (this.isValidLicense) {
			this.menuParent = Ext.get('reports');
			this.menuParent.on('click', this.showMenu, this, null);
		}
	},
    showLayerMenu: function(e, item){
    	if( this.layerMenu == null ) {
	    	var menuItems = [];
	    	//var availableLayers = this.map.getAvailableMapLayerList();
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
    	//View.controllers.get('mapCtrl').map.switchMapLayer(item.text);
    	View.controllers.get('mapCtrl').map.switchBasemapLayer(item.text);
    },
	/**
	 * Show selected buildings on map.
	 * @param {Array} items - selected building id's
	 */
	showSelectedBuildings: function(items, withMessage) {
		if(!this.isValidLicense){
			return;
		}
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
        this.items = items;
        this.type = 'BUILDING';
        this.highlightByOptions = ['option_energy_cost_occup', 'option_energy_consumption_occup', 'option_energy_demand_occup', 'option_energy_volume_occup', 'option_energy_cost_area', 'option_energy_consumption_area', 'option_energy_demand_area', 'option_energy_volume_area', 'option_energy_cost', 'option_energy_consumption', 'option_energy_demand', 'option_energy_volume', 'option_none'];
        
        this.highlightSelected = 'option_none';
		this.records = this.dsBuilding.getRecords('bl.bl_id IN ('+ items.toString() +')');
        this.showMarkers();
	},

	showMarkers: function(){
		if(!isLoaded){
			setTimeout('mapController.showMarkers()', 500);
			return;
		}
		{
			this.htmlMap.actions.get('highlight').enable(true);
			//ab-enbthis.htmlMap.actions.get('reports').enable(true);
			createMarkers(this.items, this.type);
		}
	},
	htmlHighlight_onApply: function(){
		var radioObj = document.getElementsByName('radioHighlight');
		for(var i=0; i<radioObj.length; i++){
			var object = radioObj[i];
			if(object.checked){
				this.highlightSelected = object.value;
				break;
			}
		}
		this.htmlHighlight.closeWindow();
		if(this.highlightSelected == 'option_none'){
			this.map.removeThematicLegend();
			this.map.map.infoWindow.hide();
			this.markerProperty = null;
			createMarkers(this.items, this.type);
		}else{
            showHighlight();
		}
	},
	htmlHighlight_onCancel: function(){
		restoreHighlightPanel(this.highlightByOptions, this.highlightSelected);
	},
	/**
	 * hide legend when tab is changed
	 */
	hideLegend: function(){
		this.map.removeThematicLegend();
	},
	/**
	 * show legend when tab is selected
	 */
	showLegend: function(){
		if(this.markerProperty != null){
			this.map.buildThematicLegend(this.markerProperty)
		}
	}

})

/**
 * initialize map object and layer menu
 */
function initializeMap(){
	var browser = navigator.appName;
	var b_version = navigator.appVersion;
	var version = parseFloat(b_version);
	mapController.isValidLicense = hasValidArcGisMapLicense();
	if ((browser.indexOf('Microsoft') > -1) && (b_version.indexOf('MSIE 8.0') > -1)){
		View.showMessage(getMessage('msg_ie_eight'));
	}
	else if (!mapController.isValidLicense) {
		disableControl();
		View.showMessage(getMessage('invalidLic'));
		return;
	}
	else if (mapController.isValidLicense) {
		var configObject = new Ab.view.ConfigObject();
		mapController.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);
		if (!mapController.map.mapInited) {
			setTimeout('configMap()', 500);
			return;
		}
		else {
			configMap();
		}
	}
}
/**
 * disable actions from this view
 */
function disableControl(){
	for( var i = 0; i< mapController.htmlMap.actions.length; i++){
		mapController.htmlMap.actions.items[i].forceDisable(true);
	}
	navigateOut();
}
/**
 * navigate to another tab and disable/hide current tab 
 */
function navigateOut(){
	var tabsCollection = null;
	var isValidLicense = mapController.isValidLicense;
	if(View.panels.get('tabsBldgManagement') != undefined){
		View.controllers.get('abBldgMangementTab').isValidGisLicense = isValidLicense;
		View.panels.get('tabsBldgManagement').selectTab('tabsBldgManagement_1');
		View.panels.get('tabsBldgManagement').hideTab('tabsBldgManagement_0');
	}else if(View.panels.get('tabsLandManagement') != undefined){
		View.controllers.get('abLandMangementTab').isValidGisLicense = isValidLicense;
		View.panels.get('tabsLandManagement').selectTab('tabsLandManagement_1');
		View.panels.get('tabsLandManagement').hideTab('tabsLandManagement_0');
	}else if (View.panels.get('tabsStructuresManagement') != undefined){
		View.controllers.get('abStructureMangementTab').isValidGisLicense = isValidLicense;
		View.panels.get('tabsStructuresManagement').selectTab('tabsStructuresManagement_1');
		View.panels.get('tabsStructuresManagement').hideTab('tabsStructuresManagement_0');
	}else if(View.panels.get('tabsLeaseAdminMngByLocation') != undefined){
		View.panels.get('tabsLeaseAdminMngByLocation').hideTab('tabsLeaseAdminMngByLocation_0');
	}
}

function configMap(){
	mapController.map.graphicsMouseOutHandler = function(){};
	var menuObj = Ext.get('basemapLayerMenu'); 
    menuObj.on('click', mapController.showLayerMenu, mapController, null);
	setHighlightLabel();
	document.getElementById("htmlMap").className = 'claro';
	//htmlMap_showAsDialog
	if(mapController.htmlMap.actions.get('htmlMap_showAsDialog') != null ){
		mapController.htmlMap.actions.get('htmlMap_showAsDialog').forceHidden(true);
	}
	isLoaded = true;
}

/**
 * initialize label for highlight radio buttons
 */
function setHighlightLabel(){
	var radioObj = document.getElementsByName('radioHighlight');
	for(var i=0; i<radioObj.length; i++){
		var object = radioObj[i];
		var value = object.value;
		$('span_'+value).innerHTML = getMessage(value).replace('MMBTU', mapController.units);
	}
}

/**
 * initialize highlight radio buttons 
 * based on user selection
 */
function setHighlightPanel(){
	if(mapController.items.length == 0){
		mapController.htmlHighlight.show(false, true);
		mapController.htmlHighlight.closeWindow();
		View.showMessage(getMessage('error_noselection'));
		return;
	}
	restoreHighlightPanel(mapController.highlightByOptions, mapController.highlightSelected);
}

/**
 * restore last selection for highlight radio buttons
 * @param {Object} options
 * @param {Object} selected
 */
function restoreHighlightPanel(options, selected){
	var radioObj = document.getElementsByName('radioHighlight');
	for(var i=0;i<radioObj.length;i++){
		var object = radioObj[i];
		if(options.indexOf(object.value)==-1){
			object.disabled = true;
		}
		if(object.value == selected){
			object.checked = true;
		}
	}
}


/**
 * show markers on map in highlight mode
 */
function showHighlight(){
	// remove thematic legend and info window is exist
	mapController.map.removeThematicLegend();
	mapController.map.map.infoWindow.hide();
	
	var records = mapController.records;
	var selected = mapController.highlightSelected;
	var type = mapController.type;
	var table = '';
	var dataSource = '';
	var field = mapController.highlightColumns[selected];
	var restriction = '';
	if(type == 'BUILDING'){
		table = 'bl';
		dataSource = 'dsBuilding';
		restriction = 'bl.bl_id IN ('+ mapController.items.toString() +')';
		field = table+'.'+field;
	}
	var minVal = Number.MAX_VALUE;
	var maxVal = (-1)*Number.MAX_VALUE;
	for(var i=0;i<records.length;i++){
		var record = records[i];
		var value = parseFloat(record.getValue(field));
		minVal = Math.min(minVal, value);
		maxVal = Math.max(maxVal, value);
	}
	var interval = new Array();
	if (minVal != maxVal) {
		for(var i = 0; i<4; i++){
			var val = new Number( minVal + ((maxVal - minVal)/5)*(i+1));
			interval[i] = parseFloat(val.toFixed(1).toString());
		}
	}else{
		interval[0] = parseFloat(minVal.toString());
	}
	
	var thematicBuckets = interval;
	var markerProperty = mapController.map.getMarkerPropertyByDataSource(dataSource);
	markerProperty.symbolSize = 24;
	var symbolColors = mapController.map.colorbrewer2rgb(colorbrewer.RdYlGn[5]);
	markerProperty.symbolColors = symbolColors.reverse();
	markerProperty.setThematic(field, thematicBuckets);	
	mapController.markerProperty = markerProperty;
	mapController.map.buildThematicLegend(markerProperty);
	mapController.map.updateDataSourceMarkerPropertyPair(dataSource, markerProperty);
	mapController.map.refresh(restriction);
}

/**
 * show markers on map in standard mode (without highlight)
 */
function createMarkers(markersId, type){
	mapController.map.removeThematicLegend();
	mapController.map.map.infoWindow.hide();
	if(type == 'BUILDING'){
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.bl_id', 'bl.name', 'bl.address', 'bl.area_gross_int', 'bl.count_occup', 'bl.total_energy_cost_occup','bl.total_energy_consumption_occup','bl.total_energy_demand_occup','bl.total_energy_volume_occup', 'bl.total_energy_cost_area','bl.total_energy_consumption_area','bl.total_energy_demand_area','bl.total_energy_volume_area','bl.total_energy_cost','bl.total_energy_consumption','bl.total_energy_demand','bl.total_energy_volume']);
		mapController.map.updateDataSourceMarkerPropertyPair('dsBuilding', markerProperty);
		var restriction = 'bl.bl_id IN ('+ markersId.toString() +')';
		mapController.map.refresh(restriction);
	}
}

