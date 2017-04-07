/**
 * override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function mapLoadedCallback() {

	// resize the map info window
	mapController.mapControl.map.infoWindow.resize(300,150);

	// switch to the gray canvas basemap
	mapController.mapControl.switchBasemapLayer.defer(500, mapController.mapControl, ['World Gray Canvas with Labels']);

}

var mapController = View.createController('mapControl', {

	// Ab.arcgis.ArcGISMap map control
	mapControl : null,

	// selected building ids
	items : new Array(),

	// building records
	records : null,

	// marker data source id
	dataSourceId : null,

	// maker property of the map control
	markerProperty : null,

	// html option and datasource field relation
	highlightColumns : {
		'option_msds_num' : 'msds_num',
		'option_max_radius' : 'max_radius',
		'option_total_mass' : 'total_mass',
		'option_total_volume' : 'total_volume',
		'option_tierII_hazard_count' : 'tierII_hazard_count',
		//'option_highest_tierII_hazard_present' : 'highest_tierII_hazard_present'
		'option_highest_tierII_hazard_present' : 'highest_tierII_txt'
	},

	// the selected color by option
	colorSelected : 'option_msds_num',

	// the selected sized by option
	sizeSelected : 'option_msds_num',

	// restriction for bl datasource
	blRestriction : '1=1',

	afterViewLoad : function() {
		// initialize the map control after the view load
		this.initializeMap();

		this.createDropdowList();

		if (this.mapPanel.actions.get('mapPanel_showAsDialog')) {
			this.mapPanel.actions.get('mapPanel_showAsDialog').show(false);
		}

    	//add marker action 
      	this.mapControl.addMarkerAction('Show Details', this.showBuildingDetails);
      	
      	// basemap layer menu
 	    var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}
		
	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },
	
  	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},	

	createDropdowList : function() {
		// incude border highlight option to the drawing panel
		// TODO -- I think this approach is messing up the map size.
		var mapPanelTitleNode = document.getElementById('mapPanel_title').parentNode.parentNode;
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

		var unitRecords = this.dsDisplayUnit.getRecords();
		options.dom.options[0] = new Option(getMessage('option_msds_num'), 'option_msds_num');
		options.dom.options[1] = new Option(getMessage('option_max_radius')+' ('+unitRecords[0].getValue('bill_unit.bill_unit_id')+')', 'option_max_radius');
		options.dom.options[2] = new Option(getMessage('option_total_mass')+' ('+unitRecords[1].getValue('bill_unit.bill_unit_id')+')', 'option_total_mass');
		options.dom.options[3] = new Option(getMessage('option_total_volume')+' ('+unitRecords[2].getValue('bill_unit.bill_unit_id')+')', 'option_total_volume');
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

		options.dom.options[0] = new Option(getMessage('option_msds_num'), 'option_msds_num');
		options.dom.options[1] = new Option(getMessage('option_max_radius')+' ('+unitRecords[0].getValue('bill_unit.bill_unit_id')+')', 'option_max_radius');
		options.dom.options[2] = new Option(getMessage('option_total_mass')+' ('+unitRecords[1].getValue('bill_unit.bill_unit_id')+')', 'option_total_mass');
		options.dom.options[3] = new Option(getMessage('option_total_volume')+' ('+unitRecords[2].getValue('bill_unit.bill_unit_id')+')', 'option_total_volume');
		options.dom.options[4] = new Option(getMessage('option_tierII_hazard_count'), 'option_tierII_hazard_count');
		options.dom.options[5] = new Option(getMessage('option_highest_tierII_hazard_present'), 'option_highest_tierII_hazard_present');
		options.on('change', this.applyMarkerColor, this, {
			delay : 100,
			single : false
		});
	},

	/**
	 * initialize map object
	 */
	initializeMap : function() {
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
	},

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedBuildings : function(items) {
		this.items = items;
		if (items.length > 0) {
			this.blRestriction = new Ab.view.Restriction();
			this.blRestriction.addClause("bl.bl_id", this.items, "IN");
		} else {
			// remove all markers from the map
			this.mapControl.clear();
			return;
		}
		//NOT IN API : this.mapControl.dataSourceId = 'dsBuilding';
		this.dataSourceId = 'dsBuilding';
		this.records = this.dsBuilding.getRecords(this.blRestriction);
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
 		// remove legend
        this.removeLegend();
		// create the marker property to specify building markers
		this.markerProperty = this.getMarkerProperty();
		//if (this.colorSelected != 'option_highest_tierII_hazard_present') {
		//TODO why are we not doing a thematic legend in this case?
		this.mapControl.buildThematicLegend(this.markerProperty);
		//}
		this.mapControl.updateDataSourceMarkerPropertyPair(this.dataSourceId, this.markerProperty);
		var restriction = this.blRestriction;
		this.mapControl.refresh(restriction);
	},

	/**
	 * get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		var tableName = 'bl';
		var markerProperty;

		// create marker property		
		if (this.sizeSelected == 'option_max_radius') {
			// create thematic proportional marker
			markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', 
				['bl.lat', 'bl.lon'], 
				['bl.bl_id'], 
				['bl.site_id', 'bl.bl_id', 'bl.name', 'bl.msds_num','bl.highest_tierII_txt', 'bl.max_radius_txt']
			);

			// set color (thematic) options
			var colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
			var colorBuckets;
			var thematicBuckets;
			if (this.colorSelected == 'option_highest_tierII_hazard_present') {
				colorBuckets = [100, 200, 300]; 
				thematicBuckets = ['Unknown','Not Listed', 'Hazardous', 'Extremely Hazardous'];
			}
			else {
				colorBuckets = this.getBuckets(colorField);
				thematicBuckets = [
					colorBuckets[0],
					colorBuckets[1],
					colorBuckets[2],
					colorBuckets[3]
				];
			}
			markerProperty.setThematicProportional(colorField, thematicBuckets, 'bl.max_radius_txt', 'meters', 'radius');
			
		} else {
			// create thematic graduated marker
			markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', 
				['bl.lat', 'bl.lon'], 
				['bl.bl_id'], 
				['bl.site_id', 'bl.bl_id', 'bl.name', 'bl.msds_num','bl.highest_tierII_txt', 'bl.max_radius']
			);
			
			// set size (graduated) options
			var sizeField = tableName + '.' + this.highlightColumns[this.sizeSelected];
			var sizeBuckets = this.getBuckets(sizeField);
			var graduatedBuckets = [
				{limit: sizeBuckets[0], size: 15}, 
				{limit: sizeBuckets[1], size: 25}, 
				{limit: sizeBuckets[2], size: 35}, 
				{limit: sizeBuckets[3], size: 45}, 
				{limit: +Infinity,  size: 55}  
			];			
			
			// set color (thematic) options
			var colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
			var colorBuckets;
			var thematicBuckets;
			if (this.colorSelected == 'option_highest_tierII_hazard_present') {
				colorBuckets = [100, 200, 300]; //['Unknown','Not Listed', 'Hazardous', 'Extremely Hazardous'];
				thematicBuckets = ['Unknown','Not Listed', 'Hazardous', 'Extremely Hazardous'];
			}
			else {
				colorBuckets = this.getBuckets(colorField);
				thematicBuckets = [
					colorBuckets[0],
					colorBuckets[1],
					colorBuckets[2],
					colorBuckets[3]
				];
			}
				
			// set thematic graduated marker properties for marker
			markerProperty.setThematicGraduated(colorField, thematicBuckets, sizeField, graduatedBuckets);

		}

		markerProperty.showLabels = false;
		markerProperty.symbolColors = this.getMarkerColors();

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
		if (records && records.length > 0) {
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
					buckets[i] = parseInt(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseInt(minVal.toString());
			}
		}
		return buckets;
	},

	getMarkerColors: function(){
		var markerColors;
		switch(this.colorSelected) {
		case 'option_highest_tierII_hazard_present':
		    markerColors = this.mapControl.colorbrewer2rgb(colorbrewer.RdYlGn[4]);
		    markerColors.reverse();
		    break;
		default:
		    markerColors = this.mapControl.colorbrewer2rgb(colorbrewer.YlOrRd[5]);
		}
		return markerColors;
	},

	/**
	 * disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('gisMapTab');
	},

	/**
	 * hide legend when tab is changed
	 */
	hideLegend : function() {
		this.mapControl.hideThematicLegend();
	},
	/**
	 * show legend when tab is selected
	 */
	showLegend : function() {
		this.mapControl.showThematicLegend();
	},

	removeLegend : function() {
		this.mapControl.removeThematicLegend();
	},

	showBuildingDetails: function(title, attributes){
		//var attributes = eval("(" + attributes + ")");
		View.getOpenerView().siteId = attributes['bl.site_id'];
		View.getOpenerView().blId = title
		View.getOpenerView().openDialog('ab-msds-rpt-drawing.axvw', null, false, null, null, 1200, 600);
	}
});

/**
 * onClickMarker open a report for selected item
 */
function onClickMarker(title, attributes) {
	var attributes = eval("(" + attributes + ")");
	View.getOpenerView().siteId = attributes.values['bl.site_id'];
	View.getOpenerView().blId = title
	View.getOpenerView().openDialog('ab-msds-rpt-drawing.axvw', null, false, null, null, 1200, 600);
}
