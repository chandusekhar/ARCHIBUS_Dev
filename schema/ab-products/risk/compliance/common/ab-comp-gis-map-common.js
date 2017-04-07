/**
 * Override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function afterMapLoad_JS(panelId, mapId) {
	mapControl.map.changeExtent(-17080656.88, -8161028.80, 18141525.75, 15320426.29);
	mapControl.map.setMapLevel(2);
}

//KB3037750 - use default separator to make the map work in localized version
function getDecimalSeparator_JS(){
	return '.';
}

function getGroupingSeparator_JS(){
	return ',';
}

var mapController = View.createController('mapCtrl', {

	// Flash map controll
	map : null,

	// Selected building ids
	items : new Array(),

	//Map records
	records : null,

	//Flag of is valid license of gis
	isValidLicense : false,

	//Marker property of the map control
	markerProperty : null,

	//The selected color by option
	colorField : 'option_none',

	//The selected sized by option
	sizeField : 'option_none',
	
	//The selected color by option
	colorMethod : 'option_average_value',
	
	//The selected min threshold option
	minThreshold : '0%',
	
	//The selected loction level option
	location : 'option_site',
	
	//The tree and console restriction
	treeConsoleRestriction: '1=1',
	
	// Html option and datasource field relation map
	optionFieldMap : {},
	
	// Restriction for bl datasource
	blRestriction : '1=1',
	
	//Main table of the dataSource
	mainTableName: '',

	/**
	 * initialize the map after the view load
	 */
	afterViewLoad : function() {
		// Initialize the map control after the view load
		this.initializeMap();

		//Create map panel drop down list
		this.createDropdowList();
		
		//Set the Maximize button click listener
		setMaximizeActionListener.defer(550);
	},

	/**
	 * Create the map panel drop down list.
	 */
	createDropdowList : function() {
		this.createMapSettingOptions('makerSize', this.markerSizeOptions);
		this.createMapSettingOptions('makerColor', this.markerColorOptions);
		this.createMapSettingOptions('makerColorMethod', ['option_average_value', 'option_highest_count', 'option_highest_value', 'option_lowest_value']);
		this.createMapSettingOptions('minThreshold', ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%']);
		this.createMapSettingOptions('location', ['option_country', 'option_region', 'option_state', 'option_city', 'option_county', 'option_site', 'option_property', 'option_building'],5);
		
		//if need locationFor, add it to the drop down list
		var mapSettingPanel = View.getOpenerView().panels.get('abCompDrilldownMapSetting');
		if(this.locationFor){
			mapSettingPanel.showField('locationFor',true);
			this.createMapSettingOptions('locationFor', ['option_programs','option_regulations']);
		}else{
			mapSettingPanel.showField('locationFor',false);
		}
		
		this.changeColorMethod();
	},
	
	createMapSettingOptions : function(id, list, defaultIndex) {
		var mapSettingPanel = View.getOpenerView().panels.get('abCompDrilldownMapSetting');
		var optionField = mapSettingPanel.fields.get(id);
		optionField.clearOptions();

		for ( var i = 0; i < list.length; i++) {
			optionField.addOption( list[i], getMessage(list[i]));
		}
		
		if(defaultIndex){
			optionField.dom.selectedIndex = defaultIndex;
		}
		
		if(id=='makerColorMethod'){
			optionField.dom.onchange = this.changeColorMethod;
		}
		if(id=='location'){
			optionField.dom.onchange = this.changeLocation;
		}
	},
	
	/**
	 * change event handler for color method select options
	 */
	changeLocation : function(e, option) {
		var groupByFieldDef = mapController.dsBuilding.fieldDefs.get(mapController.mainTableName+'.groupField');
		var location = mapController.getOptionValue('location');
	    groupByFieldDef.title = getMessage(location);
	},
	
	/**
	 * change event handler for color method select options
	 */
	changeColorMethod : function(e, option) {
		var mapSettingPanel = View.getOpenerView().panels.get('abCompDrilldownMapSetting');
		var method = mapController.getOptionValue('makerColorMethod');
		if (method=='option_highest_value' || method =='option_lowest_value') {
			mapSettingPanel.enableField('minThreshold',true);
		} else {
			mapSettingPanel.enableField('minThreshold',false);
		}
	},
	
    getOptionValue : function(id){
    	var mapSettingPanel = View.getOpenerView().panels.get('abCompDrilldownMapSetting');
    	return mapSettingPanel.getFieldValue(id);
	},


	/**
	 * initialize map object
	 */
	initializeMap : function() {
		this.mainTableName = this.dsBuilding.mainTableName;
		this.isValidLicense = hasValidArcGisMapLicense();
		if (!this.isValidLicense) {
			this.disableControl();
			return;
		} else if (this.isValidLicense) {
			this.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', 'dsBuilding', true);
			this.map.addMarkerAction(getMessage('labelShowDetails'), onClickMarker);
		}
		
		// basemap layer menu
 	    var basemapLayerMenu = this.htmlMap.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = this.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}
	},
	
	  switchBasemapLayer: function(item) {
	    	//switch the map layer based on the passed in layer name.
		  mapController.map.switchBasemapLayer(item.text);
	    }, 

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	refreshMap : function() {
		if (!this.isValidLicense) {
			return;
		}
		
		this.treeConsoleRestriction = this.getTreeConsoleRestriction();
		
		this.setParametersByOption();

		this.map.dataSourceId = 'dsBuilding';
		this.records = this.getMapData();
		this.map.clear();
		this.createMarkers();
	},
	
	/**
	 * Get tree and console restriction.
	 */
	getTreeConsoleRestriction : function() {
		return '1=1';
	},
	
	/**
	 * Set datasource parameters base on selected options group.
	 */
	setParametersByOption : function() {},
	
	/**
	 * Get map data.
	 */
	getMapData : function() {
		try{
			var result = null;
		 	var parameters = {
		 			recordLimit: 0
		 	};
		
		 	var records = this.dsBuilding.getRecords(null,parameters);
		 	this.afterGetMapData(records);
		 	return records;
		 	
	    } catch(e){
	 	   alert(toJSON(e));
		}
	},
	
	/**
	 * handle data after get map data.
	 */
	afterGetMapData : function(records) {
	},
	
	/**
	 * Get selected options group.
	 */
	getSeletedOptionsGroup : function() {
		this.sizeField = this.getOptionValue('makerSize');
		this.colorField = this.getOptionValue('makerColor');
		this.colorMethod = this.getOptionValue('makerColorMethod');
		this.minThreshold = this.getOptionValue('minThreshold');
		this.location = this.getOptionValue('location');
		if(this.locationFor){
			this.locationFor = this.getOptionValue('locationFor');
		}
	},
	
	getAverageField: function(fieldName, isRound) {
		var averageValuePattern = '';
		if(isRound){
			averageValuePattern = 'ROUND(avg([fieldName]),0) ';
		}else{
			averageValuePattern = ' avg([fieldName]) ';
		}
		
		return averageValuePattern.replaceAll('[fieldName]', fieldName);
	},
	
	getHighestCountFieldValue: function(fieldName) {
		var value = '';
		this.higestCountCalculationDS.addParameter('fieldName',fieldName);
		var record = this.higestCountCalculationDS.getRecord();
		if(record){
			value = record.getValue('regloc.calcField');
		}
		return value;
	},	

	getHighestOrLowestValueField: function(fieldName, isDesc) {
		var value = '';
		this.higestAndLowestValueCalculationDS.addParameter('fieldName',fieldName);
		if(isDesc){
			this.higestAndLowestValueCalculationDS.addParameter('desc','desc');
		}else{
			this.higestAndLowestValueCalculationDS.addParameter('desc','');
		}
		
		this.higestAndLowestValueCalculationDS.addParameter('minThreshold',this.minThreshold.replace('%',''));
		
		var record = this.higestAndLowestValueCalculationDS.getRecord();
		if(record){
			value = record.getValue('regloc.calcField');
		}
		return value;
	},	

	getMatricFieldValue: function(record,field1,field2) {
		
		var value = '';
		var matrix =    [[1,2,3,4,5,6,7,8,9],
	                     [1,2,3,4,5,6,7,8,9],
	                     [3,3,3,4,5,6,7,8,9],
	                     [4,4,4,4,5,6,7,8,9],
	                     [5,5,5,5,5,6,7,8,9],
	                     [6,6,6,6,6,6,7,8,9],
	                     [6,6,7,7,7,7,7,8,9],
	                     [6,6,7,7,8,8,8,8,9],
	                     [6,6,7,7,8,8,9,9,9]];
		
		var value1 =  this.stringToInteger(record.getValue(field1));
		var value2 =  this.stringToInteger(record.getValue(field2));

		if(valueExistsNotEmpty(value1) && valueExistsNotEmpty(value2)){

			if(field2 == 'regviolation.violationSeverity'){
				if(value1-1>-1 && value2-1>-1){
					value = matrix[value1-1][value2-1]
				}
				
			}else{
				if(value1-1>-1){
					value = matrix[value1-1][value2]
				}
			}
		}
		
		return value;
	},
	
	/**
	 * calculate field value by marker color method.
	 */
	calculationFieldValueByColorMethod : function(fieldName) {
		var value = '';
		if(this.colorMethod =='option_highest_count'){
			value = this.getHighestCountFieldValue(fieldName);
		}else if (this.colorMethod =='option_highest_value'){
			value = this.getHighestOrLowestValueField(fieldName, true);
		}else if (this.colorMethod =='option_lowest_value'){
			value = this.getHighestOrLowestValueField(fieldName, false);
		}
		
		return value;
	},
	
	/**
	 * Show markers on map
	 */
	createMarkers : function() {
		var x = null;
		var y = null;
		if (this.map.thematicLegend != null) {
			x = this.map.thematicLegend.x;
			y = this.map.thematicLegend.y;
		}
		
		// create the marker property to specify building markers
		this.markerProperty = this.getMarkerProperty();
		
		if(this.colorField !='option_none'){
			this.map.thematicLegend = null;
			this.map.buildThematicLegend(this.markerProperty);
			if (x != null && y != null) {
				this.map.thematicLegend.setPosition(x, y);
			}
		}else{
			this.map.hideThematicLegend();
		}
		
		this.map.updateDataSourceMarkerPropertyPair(this.map.dataSourceId, this.markerProperty);
		var restriction = this.blRestriction;
		this.map.refresh(restriction);
	},
	
	/**
	 * Set color field title which used to show in the thematic panel
	 */
	seColorFieldTitle : function() {
		var title = getMessage(this.colorField);
		View.dataSources.get('dsBuilding').fieldDefs.get(this.mainTableName+".colorField").title = title;
	},

	/**
	 * Get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		// create marker property
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('dsBuilding', [this.mainTableName+'.lat', this.mainTableName+'.lon'],
				[this.mainTableName+'.groupField'], this.inforWindowField);
		
		//markerProperty.setSymbolType('circle');
		var sizeFieldName = this.mainTableName+'.sizeField';
		var colorFieldName = this.mainTableName+".colorField";
		this.seColorFieldTitle();
		var graduatedBuckets = [];
		// Add size buckets to the property
		if(this.sizeField != 'option_none'){
			var sizeBuckets = this.getBuckets(sizeFieldName);
			graduatedBuckets = [
			        				{limit: sizeBuckets[0], size: 20}, 
			        				{limit: sizeBuckets[1], size: 35}, 
			        				{limit: sizeBuckets[2], size: 45}, 
			        				{limit: sizeBuckets[3], size: 55}, 
			        				{limit: +Infinity,  size: 65}  
			        			];	
		}else{
			graduatedBuckets = [
		        				{limit: 1, size: 20}, 
		        				{limit: 1, size: 20}, 
		        				{limit: 1, size: 20}, 
		        				{limit: 1, size: 20}, 
		        				{limit: 1, size: 20}  
		        			];	
		}
		
		//Bright Red-FF0000, Dark Red-C00000, Orange-FFC000, Yellow-FFFF00, Brown-996633, Purple-7030A0,
		//Light Blue-00B0F0, Blue-0000FF, Green-00FF00 
		//var colors = [[0, 0, 0],
		//              [255, 0, 0],
		//              [192, 0, 0],
		//              [255, 192, 0],
		//              [255, 255, 0],
		//              [153, 102, 51],
		//              [112, 48, 160],
		//             [0, 176, 240],
		//              [0, 0, 255],
		//              [0, 255, 0],
		//              [0, 0, 0]
		//              ];
		
		var colors = this.map.colorbrewer2rgb(colorbrewer.YlOrRd[5])
		var thematicBuckets = [getMessage('LowestRisk'),getMessage('LowRisk'),getMessage('MediumRisk'),getMessage('HighRisk'),getMessage('HighestRisk')];
		
		markerProperty.setThematicGraduated(colorFieldName, thematicBuckets, sizeFieldName, graduatedBuckets);
		markerProperty.symbolColors = colors;
		
		return markerProperty;
	},
	
	
	/**
	 * Convert color field to thematic value
	 * 
	 * @param {field}
	 *            field name
	 */
	convertColorFieldToThematic : function(tableName,record) {
		var colorFieldName = tableName+'.colorField';
		var colorFieldValue = record.getValue(colorFieldName);
		var thematicFieldValue = '';
		if(colorFieldValue == '9'){
			thematicFieldValue = getMessage('LowestRisk');
		}else if(colorFieldValue == '7' || colorFieldValue == '8' ){
			thematicFieldValue = getMessage('LowRisk');
		}else if(colorFieldValue == '5' || colorFieldValue == '6' ){
			thematicFieldValue = getMessage('MediumRisk');
		}else if(colorFieldValue == '2' || colorFieldValue == '3' || colorFieldValue == '4' ){
			thematicFieldValue = getMessage('HighRisk');
		}else if(colorFieldValue == '1'){
			thematicFieldValue = getMessage('HighestRisk');
		}
		
		record.setValue(colorFieldName,thematicFieldValue);
	},

	/**
	 * Get buckets by field
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
					buckets[i] = parseFloat(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseFloat(minVal.toString());
			}
		}
		return buckets;
	},

	/**
	 * Disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('gisMapTab');		
	},

	/**
	 * Hide legend when tab is changed
	 */
	hideLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(false);
		}
	},
	
	/**
	 * Show legend when tab is selected
	 */
	showLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(true);
		}
	},
	
	/**
	 * convert string to integer
	 */
	stringToInteger : function(value) {
		
		if(valueExistsNotEmpty(value)){
			value =  new Number(value).toFixed();
		}
		
		return value;
		
	}
});

/**
 * Extend String object to support replaceAll function
 */
String.prototype.replaceAll = function(search, replacement){
	var i = this.indexOf(search);
	var object = this;
	
	while (i > -1){
		object = object.replace(search, replacement); 
		i = object.indexOf(search);
	}
	return object;
}

/**
 * Overwrite String object to support replaceAll function
 */
Ab.arcgis.ArcGISMap.prototype.getDataSourceRecords =  function() {
	var records = [];
    for (var i = 0; i < mapController.records.length; i++) {
    	//excluding the null group by values
    	if(valueExistsNotEmpty(mapController.records[i].getValue('regloc.groupField')) 
    			|| valueExistsNotEmpty(mapController.records[i].getValue('regviolation.groupField'))){
    		records.push(mapController.records[i]);
    	}
    }
	return records;
}

/**
 * Set maximized action listener
 */
function setMaximizeActionListener(){
	//Get element of the action
	var maximizeActionEl = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog').button.el;
	
	//add attribute isMaximized to show the map panel status
	maximizeActionEl.isMaximized = false;
	
	//Remove all default listeners
	maximizeActionEl.removeAllListeners();
	
	//Register the click event to maximized the map panel
	maximizeActionEl.on('click', maximizeMapPanel, maximizeActionEl);;
}

/**
 * Maximized the map panel
 */
function maximizeMapPanel(){
	//Get element of the action
	var maximizeAction = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog');
	var maximizeActionEl = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog').button.el;
	
	// remove previous tooltip
	var tooltipId =  maximizeActionEl.child('button:first').id;
	Ext.QuickTips.unregister(tooltipId);
	
	//Get the main layout and center layout
	var openerView = View.getOpenerView();
	var mainLayout = openerView.getLayoutManager('main');
	var centerLayout = openerView.getLayoutManager('nextCenter');
	
	//get the value of isMaximized in map panel
	var isMaximized = maximizeActionEl.isMaximized;
	
	if(isMaximized){
		
		//If map panel is maximized then expand the tree layout, otherwise,  collapse the tree layout
		mainLayout.expandRegion('west');
		centerLayout.expandRegion('north');
		
		//reset the tool tips
		Ext.QuickTips.register({
            target: tooltipId,
            text: getMessage('maximizedText')
        });
		
		
		//reset the value of isMaximized
		maximizeActionEl.isMaximized = false;
		
	}else{
		
		//If map panel is maximized then expand the console layout, otherwise,  collapse the console layout
		mainLayout.collapseRegion('west');
		centerLayout.collapseRegion('north');
		
		//reset the tool tips
		Ext.QuickTips.register({
            target: tooltipId,
            text: getMessage('restoreText')
        });
		
		//reset the value of isMaximized
		maximizeActionEl.isMaximized = true;
	}
}