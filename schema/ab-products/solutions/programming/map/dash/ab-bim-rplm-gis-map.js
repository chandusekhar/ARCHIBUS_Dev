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
	markerProperty: null,
	isIE8: false,
	
	afterViewLoad: function(){
		this.isIE8 = checkBrowserVersion("msie 8");
	},
	
	afterInitialDataFetch: function(){
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.gmap.Map('htmlMap', 'mapContainer', configObject);
		this.map.addMouseClickEventHandler(onClickMarker);
		this.map.switchMapLayer(google.maps.MapTypeId.HYBRID);
		this.loadMenu();
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
		this.menuParent = Ext.get('reports');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	   
	/**
	 * Show selected buildings on map.
	 * @param {Array} items - selected building id's
	 */
	showSelectedBuildings: function(items, withMessage) {
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
		this.items = items;
		this.type = 'BUILDING';
		
		this.records = this.dsBuilding.getRecords('bl.bl_id IN ('+ items.toString() +')');		
		var pkeyIDs = ['bl.bl_id'];
		var latitudeID = 'bl.lat';
		var longitudeID = 'bl.lon';
		var infoFlds = ['bl.bl_id', 'bl.pr_id', 'bl.name', 'bl.address', 'bl.total_suite_manual_area', 'bl.total_suite_usable_area', 'bl.manual_area_used_by_others', 'bl.usable_area_used_by_others', 'bl.leases_number', 'bl.purchasing_cost'];
		var titles = this.getFieldTitles('dsBuilding', infoFlds);
	
		this.map.showMarkers(this.records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID);	 
    this.htmlMap.actions.get('reports').enable(true);
	},
	
	/**
	 * Show selected lands on map.
	 * @param {Array} items - selected land id's
	 */
	showSelectedLands: function(items, withMessage) {
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
		this.items = items;
		this.type = 'LAND';
		
		this.records = this.dsProperty.getRecords('property.pr_id IN ('+ items.toString() +')');		
		var pkeyIDs = ['property.pr_id'];
		var latitudeID = 'property.lat';
		var longitudeID = 'property.lon';
		var infoFlds = ['property.pr_id', 'property.name', 'property.address', 'property.lat', 'property.lon', 'property.area_manual', 'property.area_cad', 'property.leases_number', 'property.purchasing_cost', 'property.value_book', 'property.value_market', 'property.city_id', 'property.ctry_id', 'property.regn_id', 'property.state_id'];
		var titles = this.getFieldTitles('dsProperty', infoFlds);
	
		this.map.showMarkers(this.records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID);	 
		this.htmlMap.actions.get('reports').enable(true);
	},
	
	/**
	 * Show selected lands on map.
	 * @param {Array} items - selected structures id's
	 */
	showSelectedStructures: function(items, withMessage){		
		if(withMessage){
			View.showMessage(getMessage('not_geocoded'));
		}
        this.items = items;
        this.type = 'STRUCTURE';

		this.records = this.dsProperty.getRecords('property.pr_id IN ('+ items.toString() +')');
		var pkeyIDs = ['property.pr_id'];
		var latitudeID = 'property.lat';
		var longitudeID = 'property.lon';
		var infoFlds = ['property.pr_id', 'property.name', 'property.address', 'property.lat', 'property.lon', 'property.area_manual', 'property.area_cad', 'property.leases_number', 'property.purchasing_cost', 'property.value_book', 'property.value_market', 'property.city_id', 'property.ctry_id', 'property.regn_id', 'property.state_id'];
		var titles = this.getFieldTitles('dsProperty', infoFlds);
	
		this.map.showMarkers(this.records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID);	 
		this.htmlMap.actions.get('reports').enable(true);
	},
	
	showSelectedLease: function(items, leaseId, markerType, withMessage){
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
		this.map.disableInfoWindow();

		var pkeyIDs = ['ls.ls_id'];
		var latitudeID = 'ls.lat';
		var longitudeID = 'ls.lon';
		var infoFlds = ['ls.ls_id', 'ls.landlord_tenant', 'ls.status', 'ls.lat', 'ls.lon', 'ls.landlord_tenant'];
		var titles = this.getFieldTitles('dsLease', infoFlds);		
		this.map.showMarkers(this.records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID);
	},
	
  getFieldTitles: function(dataSourceName, fieldNames) {
  	var ds = View.dataSources.get(dataSourceName);
  	var items = ds.fieldDefs.items;
  	var titles = [];
  	
  	for(var j=0; j<fieldNames.length; j++){		
  		for(var i = 0; i < items.length; i++) {
  			var item = items[i];
  			var id = item.id;
  			if( fieldNames[j] == id ) {
  				titles.push(item.title);
  				break;
  			}
  		}
  	}
  	return titles;
  }	
})

var doNext = false;
var arrPrIds = new Array();

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
	if(View.panels.get('tabsBldgManagement') != undefined){
		View.panels.get('tabsBldgManagement').selectTab('tabsBldgManagement_1');
		View.panels.get('tabsBldgManagement').hideTab('tabsBldgManagement_0');
	}else if(View.panels.get('tabsLandManagement') != undefined){
		View.panels.get('tabsLandManagement').selectTab('tabsLandManagement_1');
		View.panels.get('tabsLandManagement').hideTab('tabsLandManagement_0');
	}else if (View.panels.get('tabsStructuresManagement') != undefined){
		View.panels.get('tabsStructuresManagement').selectTab('tabsStructuresManagement_1');
		View.panels.get('tabsStructuresManagement').hideTab('tabsStructuresManagement_0');
	}else if(View.panels.get('tabsLeaseAdminMngByLocation') != undefined){
		View.panels.get('tabsLeaseAdminMngByLocation').hideTab('tabsLeaseAdminMngByLocation_0');
	}
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

function getRecordValuesFromIDs(ids, record, delimiter, titles, bShowHeading){
	var str = "";
	for(var i=0; i<ids.length; i++){
		if(bShowHeading == true){
			str += '<i>' + titles[i] + ':&nbsp;&nbsp;&nbsp;&nbsp;</i>';
		}
		str += record[ids[i]] + delimiter;
	} 
	str = str.substring(0, str.length-1); 
	return str;
}
