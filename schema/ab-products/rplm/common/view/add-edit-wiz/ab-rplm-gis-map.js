var isLoaded = false;
var mapController = View.createController('mapCtrl',{
	map: null,
	mapControlInit: false,
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
	isIE8: false,
	highlightColumns:{
		'option_suite_manual_area':'total_suite_manual_area',
		'option_suite_usable_area':'total_suite_usable_area',
		'option_others_manual_area':'manual_area_used_by_others',
		'option_others_usable_area':'usable_area_used_by_others',
		'option_purchasing_cost':'purchasing_cost',
		'option_market_value':'value_market',
		'option_book_value':'value_book',
		'option_manual_area':'area_manual',
		'option_cad_area':'area_cad'
	},
	highlightByOptions:new Array(),
	highlightSelected:'',
	afterViewLoad: function(){
		this.isIE8 = checkBrowserVersion("msie 8");
	},
	afterInitialDataFetch: function(){
		//set area titles with UOM
		var uomTitle = "";
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
			uomTitle = " " + View.user.areaUnits.title;
		}
		this.dsBuilding.fieldDefs.get("bl.total_suite_manual_area").title = getMessage("total_suite_manual_area_title") + uomTitle;
		this.dsBuilding.fieldDefs.get("bl.total_suite_usable_area").title = getMessage("total_suite_usable_area_title") + uomTitle;
		this.dsBuilding.fieldDefs.get("bl.manual_area_used_by_others").title = getMessage("manual_area_used_by_others_title") + uomTitle;
		this.dsBuilding.fieldDefs.get("bl.usable_area_used_by_others").title = getMessage("usable_area_used_by_others_title") + uomTitle;
		
		this.dsLease.fieldDefs.get("ls.estimated_area").title = getMessage("estimated_area_title") + uomTitle;
		
		//KB3036049 - show selected items in the maximized view
		if(this.view.parameters){
			if(this.view.parameters.maximize){
				openerView = this.view.getOpenerView();
				if(openerView){
					var treeController = openerView.controllers.get('bldgTree');
					var items = new Array();
					if(treeController){
						items = treeController.selectedItems;
						var showNotGeocodedMessage = treeController.showNotGeocodedMessage;
						if(valueExistsNotEmpty(items)){
							this.showSelectedBuildings(items, showNotGeocodedMessage);
						}
					}else{
						treeController = openerView.controllers.get('structTree');
						if(treeController){
							items = treeController.selectedItems;
							var showNotGeocodedMessage = treeController.showNotGeocodedMessage;
							if(valueExistsNotEmpty(items)){
								this.showSelectedStructures(items, showNotGeocodedMessage);
							}
						}else{
							treeController = openerView.controllers.get('landTree');
							if(treeController){
								items = treeController.selectedItems;
								var showNotGeocodedMessage = treeController.showNotGeocodedMessage;
								if(valueExistsNotEmpty(items)){
									this.showSelectedLands(items, showNotGeocodedMessage);
								}
							}
						}
					}
				}
			}
		}
	},
	showMenu: function(e, item){
		var menuItems = [];
		var type = 0;
		for(var i=0;i<this.menu.length;i++){
			var subMenuItems = [];
			for(var j=0;j<this.subMenu[i].length;j++){
				var subMenuItem = new Ext.menu.Item({
					text: getMessage('submenu_'+this.subMenu[i][j]),
            		handler: reports.createDelegate(this, [type], this.items)});
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
					handler: reports.createDelegate(this, [type], this.items)});
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
    // 20.2 deprecated
	switchMapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	View.controllers.get('mapCtrl').map.switchMapLayer(item.text);
    },
	// 21.1 method
	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.map.switchBasemapLayer(item.text);
    },
    
    showESRILegend: function(){
		mapController.map.showEsriLegend();
	},
	
    switchReferenceLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.map.switchReferenceLayer(item.text);
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
        this.highlightByOptions = ['option_suite_manual_area', 'option_suite_usable_area', 'option_others_manual_area', 'option_others_usable_area', 'option_purchasing_cost', 'option_market_value', 'option_book_value','option_none'];
        this.highlightSelected = 'option_none';
		this.records = this.dsBuilding.getRecords('bl.bl_id IN ('+ items.toString() +')');
        this.showMarkers();
	},
	/**
	 * Show selected lands on map.
	 * @param {Array} items - selected land id's
	 */
	showSelectedLands: function(items, withMessage) {
		if(!this.isValidLicense){
			return;
		}
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
        this.items = items;
        this.type = 'LAND';
        this.highlightByOptions = ['option_manual_area', 'option_cad_area', 'option_purchasing_cost', 'option_market_value', 'option_book_value','option_none'];
        this.highlightSelected = 'option_none';
		this.records = this.dsProperty.getRecords('property.pr_id IN ('+ items.toString() +')');
        this.showMarkers();
	},
	/**
	 * Show selected lands on map.
	 * @param {Array} items - selected structures id's
	 */
	showSelectedStructures: function(items, withMessage){
		if(!this.isValidLicense){
			return;
		}
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
        this.items = items;
        this.type = 'STRUCTURE';
        this.highlightByOptions = ['option_manual_area', 'option_cad_area', 'option_purchasing_cost', 'option_market_value', 'option_book_value','option_none'];
        this.highlightSelected = 'option_none';
		this.records = this.dsProperty.getRecords('property.pr_id IN ('+ items.toString() +')');
        this.showMarkers();
	},
	
	showSelectedLease: function(items, leaseId, markerType, withMessage){
		if(!this.isValidLicense){
			return;
		}
 		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
        this.items = items;
        this.type = 'LEASE';
		this.leaseId = leaseId;
		this.markerType = markerType;
		this.dsLease.addParameter('item', leaseId);
		this.dsLease.addParameter('parent', items[0]);
		this.dsLease.addParameter('status_owned', getMessage('status_owned'));
		this.dsLease.addParameter('status_leased', getMessage('status_leased'));
		this.dsLease.addParameter('status_neither', getMessage('status_neither'));
		this.dsLease.addParameter('status_active', getMessage('status_active'));
		this.dsLease.addParameter('status_inactive', getMessage('status_inactive'));
		this.records = this.dsLease.getRecords();
		this.showMarkers();
	},
	init: function(){
		initializeMap();
	},
	showMarkers: function(){
		if(!isLoaded){
			setTimeout('mapController.showMarkers()', 500);
			return;
		}
		if(this.type == 'LEASE'){
			if(this.map.map.infoWindow != null){
				this.map.map.infoWindow.hide();
			}
			this.map.clear();
			createMarkers(this.items, this.type);
		}else{
			this.htmlMap.actions.get('highlight').enable(true);
			this.htmlMap.actions.get('reports').enable(true);
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
	htmlMap_onGeocode: function(){
		var arrBuildings = new Array();
		var arrProperties = new Array();
		var parentController = null;
		var type = '';
		if(this.view.getOpenerView().controllers.get('bldgTree') != undefined){
			parentController = this.view.getOpenerView().controllers.get('bldgTree');
			type = 'BUILDING';
			arrBuildings = parentController.notGeocodedItems;
		}else if(this.view.getOpenerView().controllers.get('landTree') != undefined){
			parentController = this.view.getOpenerView().controllers.get('landTree');
			type = 'LAND';
			arrProperties = parentController.notGeocodedItems;
		}else if(this.view.getOpenerView().controllers.get('structTree') != undefined){
			parentController = this.view.getOpenerView().controllers.get('structTree');
			type = 'STRUCTURE';
			arrProperties = parentController.notGeocodedItems;
		}else if(this.view.getOpenerView().panels.get('panel_row2col1').contentView.controllers.get('treeLeaseAdmin') != undefined){
			parentController = this.view.getOpenerView().panels.get('panel_row2col1').contentView.controllers.get('treeLeaseAdmin');
			type = 'LEASE';
			arrProperties = parentController.notGeocodedProperties;
			arrBuildings = parentController.notGeocodedBuildings;
			if(arrBuildings.length > 0 && arrProperties.length > 0){
				doNext = true;
				arrPrIds = arrProperties;
			}
		}
		
		var geoCodeTool = new Ab.arcgis.Geocoder(this.map);
		geoCodeTool.callbackMethod = doAfterGeocode;
		
		afterGeocodeController = parentController;
		afterGeocodeType = type;
		if (doNext){
			objGeoCodeTool = geoCodeTool;
		}
		
		if (arrBuildings.length > 0) {
			var restriction = 'bl.bl_id IN (' + arrBuildings.toString() + ')';
			geoCodeTool.geoCode('dsGeoBuilding', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		}else if (arrProperties.length > 0) {
			var restriction = 'property.pr_id IN (' + arrProperties.toString() + ')';
			geoCodeTool.geoCode('dsGeoProperty', restriction, 'property', 'property.pr_id', ['property.lat', 'property.lon'], ['property.address1', 'property.city_id', 'property.state_id', 'property.zip', 'property.ctry_id'], true);
		}
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
var afterGeocodeController = null;
var afterGeocodeType = null;
var doNext = false;
var arrPrIds = new Array();
var objGeoCodeTool = null;

function doAfterGeocode(){
	if (doNext) {
		var restriction = 'property.pr_id IN (' + arrPrIds.toString() + ')';
		doNext = false;
		objGeoCodeTool.callbackMethod = doAfterGeocode;
		objGeoCodeTool.geoCode('dsGeoProperty', restriction, 'property', 'property.pr_id', ['property.lat', 'property.lon'], ['property.address1', 'property.city_id', 'property.state_id', 'property.zip'], true);
	}
	else {
		if (afterGeocodeType == 'LEASE') {
			afterGeocodeController.treeCtry.refresh();
		}
		else {
			afterGeocodeController.refreshTree();
		}
	}
}

/**
 * initialize map object and layer menu
 */
function initializeMap(){
	mapController.isValidLicense = hasValidArcGisMapLicense();
	if (!mapController.isValidLicense) {
		disableControl();
		return;
	}
	else if (mapController.isValidLicense && !mapController.mapControlInit) {	
		var configObject = new Ab.view.ConfigObject();
		mapController.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);	
		mapController.mapControlInit = true;
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
	mapController.map.addMarkerAction(getMessage("labelOpenDetails"), onClickMarker);
	
    var basemapLayerMenu = mapController.htmlMap.actions.get('basemapLayerMenu');
	basemapLayerMenu.clear();
	var basemapLayers = mapController.map.getBasemapLayerList();
	for (var i=0; i<basemapLayers.length; i++){
		basemapLayerMenu.addAction(i, basemapLayers[i], mapController.switchBasemapLayer);
	}
	
	// reference layer menu
    var referenceLayerMenu = mapController.htmlMap.actions.get('referenceLayerMenu');
	referenceLayerMenu.clear();
	var referenceLayers = mapController.map.getReferenceLayerList();
	for (var i=0; i<referenceLayers.length; i++){
		referenceLayerMenu.addAction(i, referenceLayers[i], mapController.switchReferenceLayer);
	}

	// legend menu
	var legendObj = Ext.get('showESRILegend'); 
    legendObj.on('click', mapController.showESRILegend, mapController, null); 
    
	setHighlightLabel();
	document.getElementById("htmlMap").className = 'claro';
	//htmlMap_showAsDialog
	if(mapController.htmlMap.actions.get('htmlMap_showAsDialog') != null ){
		mapController.htmlMap.actions.get('htmlMap_showAsDialog').forceHidden(true);
	}
	mapController.loadMenu();
	if(mapController.isIE8){
		mapController.htmlMap.setInstructions(getMessage("msg_ie_eight"));
	}else{
		mapController.htmlMap.toggleInstructions();
		document.getElementById('htmlMap_instructions').style.display = 'none';
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
		$('span_'+value).innerHTML = getMessage(value);
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
 * show markers on map in higlight mode
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
	}else{
		table = 'property';
		dataSource = 'dsProperty';
		restriction = 'property.pr_id IN ('+mapController.items.toString() +')';
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
	markerProperty.setSymbolType('diamond');
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
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.bl_id', 'bl.pr_id', 'bl.name', 'bl.address','bl.total_suite_manual_area','bl.total_suite_usable_area','bl.manual_area_used_by_others','bl.usable_area_used_by_others','bl.leases_number','bl.purchasing_cost','bl.value_book','bl.value_market']);
		mapController.map.updateDataSourceMarkerPropertyPair('dsBuilding', markerProperty);
		var restriction = 'bl.bl_id IN ('+ markersId.toString() +')';
		mapController.map.refresh(restriction);
	}else if(type == 'LAND' || type == 'STRUCTURE'){
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsProperty', ['property.lat', 'property.lon'],'property.pr_id',['property.pr_id', 'property.name', 'property.address','property.area_manual','property.area_cad','property.leases_number','property.purchasing_cost','property.value_book','property.value_market']);
		mapController.map.updateDataSourceMarkerPropertyPair('dsProperty', markerProperty);
		var restriction = 'property.pr_id IN ('+ markersId.toString() +')';
		mapController.map.refresh(restriction);
	}else if(type = 'LEASE'){
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsLease', ['ls.lat', 'ls.lon'],'ls.ls_id',['ls.ls_id','ls.estimated_area', 'ls.landlord_tenant', 'ls.item_status', 'ls.status']);
		mapController.map.updateDataSourceMarkerPropertyPair('dsLease', markerProperty);
		mapController.dsLease.addParameter('item', mapController.leaseId);
		mapController.dsLease.addParameter('parent', mapController.items[0]);
		mapController.dsLease.addParameter('status_owned', getMessage('status_owned'));
		mapController.dsLease.addParameter('status_leased', getMessage('status_leased'));
		mapController.dsLease.addParameter('status_neither', getMessage('status_neither'));
		mapController.dsLease.addParameter('status_active', getMessage('status_active'));
		mapController.dsLease.addParameter('status_inactive', getMessage('status_inactive'));
		mapController.map.refresh();
	}
	var zoomHandle = dojo.connect(mapController.map.map, 'onZoomEnd', function() {
		var mapLevel = mapController.map.map.getLevel();
		mapController.map.map.setLevel( mapLevel-1 );
		dojo.disconnect( zoomHandle );
	});
}

/**
 * onClickMarker
 * open a report for selected item
 */
function onClickMarker(title, attributes){
	var selected_item = title;
	if(mapController.type == 'BUILDING'){
		View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
					dialogController.bl_id = selected_item;
					dialogController.initializeView();
				}
		});
	}else if(mapController.type == 'LAND'){
		View.openDialog('ab-rplm-pfadmin-leases-by-land-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseByLandBase');
					dialogController.pr_id = selected_item;
					dialogController.initializeView();
				}
		});
	}else if(mapController.type == 'STRUCTURE'){
		View.openDialog('ab-rplm-pfadmin-leases-by-structure-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseByStructureBase');
					dialogController.pr_id = selected_item;
					dialogController.initializeView();
				}
		});
	}
}

function checkBrowserVersion(version){
	var ua = navigator.userAgent.toLowerCase();
	return (ua.indexOf(version) > -1);
}
