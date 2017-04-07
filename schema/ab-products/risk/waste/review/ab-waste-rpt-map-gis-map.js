var isLoaded = false;

var mapConfigObject = {
	//"mapInitExtent" : [-17080656.88, -8161028.80, 18141525.75, 15320426.29],
	//"mapInitExtentWKID" : 102100
	"mapLoadedCallback" : mapLoadedCallback
};

function mapLoadedCallback() {

	// resize the map info window (call esri map class)
	mapController.map.map.infoWindow.resize(370,350);
	
	// switch the basemap to the world gray canvas
	mapController.map.switchBasemapLayer.defer(100, mapController.map, ['World Gray Canvas with Labels']);

}

var mapController = View.createController('mapCtrl', {

	// Ab.arcgis.ArcGISMap map control
	map : null,

	// selected building ids
	items : new Array(),

	// building records
	records : null,

	// flag of is valid license of gis
	// deprecated at v21.2
	isValidLicense : true,

	// maker property of the map control
	markerProperty : null,

	// html option and datasource field relation
	highlightColumns : {
		'option_solid_waste_generated' : 'total_solid_generated',
		'option_liquid_waste_generated' : 'total_liquid_generated',
		'option_gas_waste_generate' : 'total_gas_generated',
		'option_solid_waste_accumulated' : 'total_solid_accumulated',
		'option_liquid_waste_accumulated' : 'total_liquid_accumulated',
		'option_gas_waste_accumulated' : 'total_gas_accumulated',
		'option_solid_mass_waste_stored' : 'total_solid_stored',
		'option_liquid_volume_waste_stored' : 'total_liquid_stored',
		'option_gas_volume_waste_stored' : 'total_gas_stored',
		'option_solid_mass_waste_disposed' : 'total_solid_disposed',
		'option_liquid_volume_waste_disposed' : 'total_liquid_disposed',
		'option_gas_volume_waste_disposed' : 'total_gas_disposed',
		'option_stored_status': 'hazardous_waste_storage_level'
	},

	// the selected color by option
	colorSelected : 'option_none',

	// the selected sized by option
	sizeSelected : 'option_none',

	// restriction for bl datasource
	blRestricition : '1=1',

	// restriction for storageLocation datasource
	storageLocationRestricition : '1=1',

	// the marker datasource id
	dataSourceId : null,

	afterViewLoad : function() {
		// initialize the map control after the view load
		this.initializeMap();
		
		this.createDropdowList();

		// basemap layer menu
 	    var basemapLayerMenu = mapController.htmlMap.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

	},

    switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.map.switchBasemapLayer(item.text);
    }, 
	
	afterInitialDataFetch: function(){
		removeShowAsDialogButton();
		var reportTargetPanel = document.getElementById("htmlMap");            
		reportTargetPanel.className = 'claro';

		var siteFieldDefs = this.dsBuilding.fieldDefs;
		var storageLocaitonFieldDefs = this.dsStorageLocation.fieldDefs;
		var unitDS = this.unitDS;
		var units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS MASS'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('solid')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('solid')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
		}
		
		units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS VOLUME-LIQUID'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('liquid')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('liquid')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
		}
		
		units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS VOLUME-GAS'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('gas')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('gas')!=-1){
					fieldDef.title = fieldDef.title + ' ('+unit+')';
				}
			});
		}
		
	},
	
	createDropdowList : function() {
		// incude border highlight option to the drawing panel
		var mapPanelTitleNode = document.getElementById('htmlMap_title').parentNode.parentNode;
		var cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerSize'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('makerSize') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerSize_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'makerSize_options'
		}, true);

		options.dom.options[0] = new Option('', 'option_none');
		options.dom.options[1] = new Option(getMessage('option_solid_waste_generated'), 'option_solid_waste_generated');
		options.dom.options[2] = new Option(getMessage('option_liquid_waste_generated'), 'option_liquid_waste_generated');
		options.dom.options[3] = new Option(getMessage('option_gas_waste_generate'), 'option_gas_waste_generate');
		options.dom.options[4] = new Option(getMessage('option_solid_waste_accumulated'), 'option_solid_waste_accumulated');
		options.dom.options[5] = new Option(getMessage('option_liquid_waste_accumulated'), 'option_liquid_waste_accumulated');
		options.dom.options[6] = new Option(getMessage('option_gas_waste_accumulated'), 'option_gas_waste_accumulated');
		options.dom.options[7] = new Option(getMessage('option_solid_mass_waste_stored'), 'option_solid_mass_waste_stored');
		options.dom.options[8] = new Option(getMessage('option_liquid_volume_waste_stored'), 'option_liquid_volume_waste_stored');
		options.dom.options[9] = new Option(getMessage('option_gas_volume_waste_stored'), 'option_gas_volume_waste_stored');
		options.dom.options[10] = new Option(getMessage('option_solid_mass_waste_disposed'), 'option_solid_mass_waste_disposed');
		options.dom.options[11] = new Option(getMessage('option_liquid_volume_waste_disposed'), 'option_liquid_volume_waste_disposed');
		options.dom.options[12] = new Option(getMessage('option_gas_volume_waste_disposed'), 'option_gas_volume_waste_disposed');
		options.on('change', this.applyMarkerSize, this, {
			delay : 100,
			single : false
		});

		var cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerColor'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('makerColor') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerColor_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'makerColor_options'
		}, true);
		
		options.dom.options[0] = new Option(getMessage(''), 'option_none');
		options.dom.options[1] = new Option(getMessage('option_solid_waste_generated'), 'option_solid_waste_generated');
		options.dom.options[2] = new Option(getMessage('option_liquid_waste_generated'), 'option_liquid_waste_generated');
		options.dom.options[3] = new Option(getMessage('option_gas_waste_generate'), 'option_gas_waste_generate');
		options.dom.options[4] = new Option(getMessage('option_solid_waste_accumulated'), 'option_solid_waste_accumulated');
		options.dom.options[5] = new Option(getMessage('option_liquid_waste_accumulated'), 'option_liquid_waste_accumulated');
		options.dom.options[6] = new Option(getMessage('option_gas_waste_accumulated'), 'option_gas_waste_accumulated');
		options.dom.options[7] = new Option(getMessage('option_solid_mass_waste_stored'), 'option_solid_mass_waste_stored');
		options.dom.options[8] = new Option(getMessage('option_liquid_volume_waste_stored'), 'option_liquid_volume_waste_stored');
		options.dom.options[9] = new Option(getMessage('option_gas_volume_waste_stored'), 'option_gas_volume_waste_stored');
		options.dom.options[10] = new Option(getMessage('option_solid_mass_waste_disposed'), 'option_solid_mass_waste_disposed');
		options.dom.options[11] = new Option(getMessage('option_liquid_volume_waste_disposed'), 'option_liquid_volume_waste_disposed');
		options.dom.options[12] = new Option(getMessage('option_gas_volume_waste_disposed'), 'option_gas_volume_waste_disposed');
		options.dom.options[13] = new Option(getMessage('option_stored_status'), 'option_stored_status');
		
		options.on('change', this.applyMarkerColor, this, {
			delay : 100,
			single : false
		});
	},


	/**
	 * initialize map object
	 */
	initializeMap : function() {
		// create the map control
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);	

		// add marker action
		this.map.addMarkerAction(getMessage('labelShowDetails'), onClickMarker);

	},

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedBuildings : function(items, withMessage, consoleRestriction) {
		this.items = items;
		if (items.length > 0) {
			this.blRestricition = 'site.site_id IN (' + items.toString() + ')' ;
			//this.blRestricition = new Ab.view.Restriction();
			//this.blRestricition.addClause('site.site_id', this.items, 'IN');
		} else {
			this.map.clear();
			return;
		}

		this.dataSourceId = 'dsBuilding';
		this.dsBuilding.addParameter('consoleRestriction', consoleRestriction);
		this.records = this.dsBuilding.getRecords(this.blRestricition);
		this.map.removeDataSourceMarkerPropertyPair('dsStorageLocation');
		this.createMarkers();
	},

	/**
	 * Show selected storage location on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedStorageLocation : function(items, withMessage, consoleRestriction) {
		this.items = items;
		if (items.length > 0) {
			this.storageLocationRestricition = 'waste_areas.storage_location IN (' + items.toString() + ') ' ;
		} else {
			this.map.clear();
			return;
		}

		this.dataSourceId = 'dsStorageLocation';
		this.dsStorageLocation.addParameter('consoleRestriction', consoleRestriction);
		this.records = this.dsStorageLocation.getRecords(this.storageLocationRestricition);
		this.map.removeDataSourceMarkerPropertyPair('dsBuilding');
		this.createMarkers();
	},
	
	/**
	 * apply marker size option.
	 */
	applyMarkerSize : function(e, option) {
		this.sizeSelected = option.value;
		if (mapController.items.length > 0) {
			this.createMarkers();
		} else {
			View.showMessage(getMessage('error_noselection'));
		}
	},

	/**
	 * apply marker color option.
	 */
	applyMarkerColor : function(e, option) {
		this.colorSelected = option.value;
		if (mapController.items.length > 0) {
			this.createMarkers();
		} else {
			View.showMessage(getMessage('error_noselection'));
		}
	},

	/**
	 * show markers on map
	 */
	createMarkers : function() {
		// remove (and destroy) the thematic marker legend
		this.map.removeThematicLegend();

		// create the marker property to specify building markers
		this.markerProperty = this.getMarkerProperty();
		this.map.updateDataSourceMarkerPropertyPair(this.dataSourceId, this.markerProperty);
		if (this.colorSelected != 'option_none' ) {		
			// build (and display) the thematic marker legend
			this.map.buildThematicLegend(this.markerProperty);
		}
		var restriction = this.blRestricition;
		if (this.dataSourceId != 'dsBuilding') {
			restriction = this.storageLocationRestricition;
		}
		this.map.refresh(restriction);
	},

	/**
	 * get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		var tableName = 'site';
		
		// create default marker property 
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', 
			['site.lat', 'site.lon'], 
			['site.site_id'], 
			['site.name','site.total_solid_generated', 'site.total_liquid_generated',
			'site.total_gas_generated', 'site.total_solid_accumulated', 'site.total_liquid_accumulated',
			'site.total_gas_accumulated', 'site.total_solid_stored', 'site.total_liquid_stored', 
			'site.total_gas_stored', 'site.total_solid_disposed', 'site.total_liquid_disposed', 
			'site.total_gas_disposed']);

		if (this.dataSourceId != 'dsBuilding') {
			tableName = 'waste_areas';
			// create the thematic proportional marker
			markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsStorageLocation', 
				['waste_areas.lat', 'waste_areas.lon'], 
				['waste_areas.storage_location'], 
				['waste_areas.site_id','waste_areas.total_solid_generated', 'waste_areas.total_liquid_generated', 
				'waste_areas.total_gas_generated', 'waste_areas.total_solid_accumulated', 
				'waste_areas.total_liquid_accumulated', 'waste_areas.total_gas_accumulated',
				'waste_areas.total_solid_stored', 'waste_areas.total_liquid_stored',
				'waste_areas.total_gas_stored', 'waste_areas.total_solid_disposed', 
				'waste_areas.total_liquid_disposed', 'waste_areas.total_gas_disposed']);
		}

		// set marker size
		markerProperty.symbolSize = 15;
		
		// marker type is thematic (class breaks)
		if (this.colorSelected != 'option_none' && this.sizeSelected == 'option_none') {
			// set color options (class breaks)						
//			var colors = [
//				[0, 255, 67, 1], 
//				[113, 210, 67, 1], 
//				[255, 247, 0, 1], 
//				[255, 122, 17, 0], 
//				[255, 0, 0, 0.75]
//			];
			var colors = this.map.colorbrewer2rgb(colorbrewer.RdYlGn[5]);
			colors = colors.reverse();
			var colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
			var colorBuckets = this.getBuckets(colorField);;
			
			// set color options (unique values)
			if (this.colorSelected == 'option_stored_status') {
				colors = [
					[255, 0, 0, 1], 
					[255, 255, 0, 1], 
					[0, 255, 0, 1],
					[221, 221, 221, 1]
				];
				// although we are using the unique value renderer, we must specify the values
				// here because the values are from the datasource and not from the database 
				colorBuckets = ['Exceeds Limit', 'Nearing Limit', 'Within Limit', 'No Status'];
			}
			
			// set marker symbol colors
			markerProperty.symbolColors = colors;

			// set thematic properties for marker
			markerProperty.setThematic(colorField, colorBuckets);

		} 
		// marker type is graduated
		else if (this.colorSelected == 'option_none' && this.sizeSelected != 'option_none') {
			// set size options
			var sizeField = tableName + '.' + this.highlightColumns[this.sizeSelected];
			var buckets = this.getBuckets(sizeField);
	     	var sizeBuckets = [
	     			{limit: buckets[0], size: 10},
	     			{limit: buckets[1], size: 20},
	     			{limit: buckets[2], size: 30},
	     			{limit: buckets[3], size: 40},
	     			{limit: +Infinity,  size: 50}
	     	];

     		markerProperty.setGraduated(sizeField, sizeBuckets);

		} 
		// marker type is 'thematic-graduated'
		else if (this.colorSelected != 'option_none' && this.sizeSelected != 'option_none') {
			// set color options (class breaks)	
//			var colors = [
//				[0, 255, 67, 1], 
//				[113, 210, 67, 1], 
//				[255, 247, 0, 1], 
//				[255, 122, 17, 0], 
//				[255, 0, 0, 0.75]
//			];
			var colors = this.map.colorbrewer2rgb(colorbrewer.RdYlGn[5]);
			colors = colors.reverse();
			var colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
			var colorBuckets = this.getBuckets(colorField);;
			
			// set color options (unique values)
			if (this.colorSelected == 'option_stored_status') {
				colors = [
					[255, 0, 0, 1], 
					[255, 255, 0, 1], 
					[0, 255, 0, 1],
					[221, 221, 221, 1]
				];
				// although we are using the unique value renderer, we must specify the values
				// here because the values are from the datasource and not from the database 
				colorBuckets = ['Exceeds Limit', 'Nearing Limit', 'Within Limit', 'No Status'];
			}	

			// set size options
			var sizeField = tableName + '.' + this.highlightColumns[this.sizeSelected];
			var buckets = this.getBuckets(sizeField);
	     	var sizeBuckets = [
	     			{limit: buckets[0], size: 10},
	     			{limit: buckets[1], size: 20},
	     			{limit: buckets[2], size: 30},
	     			{limit: buckets[3], size: 40},
	     			{limit: +Infinity,  size: 50}
	     	];
			// set marker symbol colors
			markerProperty.symbolColors = colors;

     		markerProperty.setThematicGraduated(colorField, colorBuckets, sizeField, sizeBuckets);
		}

		markerProperty.showLabels = false;

		return markerProperty;
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
		if(records && records.length>0){
			var minVal = Number.MAX_VALUE;
			var maxVal = (-1) * Number.MAX_VALUE;
			for ( var i = 0; i < records.length; i++) {
				var record = records[i];
				var value = parseFloat(record.getValue(field));
				minVal = Math.min(minVal, value);
				maxVal = Math.max(maxVal, value);
			}
			var buckets = new Array();
			if (minVal != maxVal) {
				for ( var i = 0; i < 4; i++) {
					var val = new Number(minVal + ((maxVal - minVal) / 5) * (i + 1));
					buckets[i] = parseFloat(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseFloat(minVal.toString());
			}
		}
		return buckets;
	},

	/**
	 * disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('tabsBldgManagement_0');
	},

	/**
	 * hide legend when tab is changed
	 */
	hideLegend : function() {
		this.map.hideThematicLegend();
	},
	/**
	 * show legend when tab is selected
	 */
	showLegend : function() {
		this.map.showThematicLegend();
	}
});

function removeShowAsDialogButton(){
	if(mapController.htmlMap.actions.get('htmlMap_showAsDialog')){
		mapController.htmlMap.actions.get('htmlMap_showAsDialog').show(false);
	}
}

/**
 * onClickMarker open a report for selected item
 */
function onClickMarker(title, attributes) {
	var selected_item = title;
	View.openDialog('ab-waste-rpt-map-bl-loc-details.axvw', null, true, {
		width : 1280,
		height : 600,
		bl_id:"",
		site_id:"",
		closeButton : true,
		afterInitialDataFetch : function(dialogView) {
			var dialogController = dialogView.controllers.get('blDetail');
			if (dialogView.getOpenerView().controllers.get('mapCtrl').dataSourceId != 'dsBuilding') {
				dialogController.site_id = '';
				dialogController.storage_location = selected_item;
			}else{
				dialogController.site_id = selected_item;
				dialogController.storage_location = '';
			}
		}
	});
}
