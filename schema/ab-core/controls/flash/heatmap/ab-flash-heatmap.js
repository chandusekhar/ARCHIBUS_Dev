Ab.namespace('flash');

var heatMapControl = null;

function getColorEntries_JS(panelId){
	var flashControl = Ab.view.View.getControl('', panelId);
	return toJSON(flashControl.colorEntries);
}

function getHeatMapData_JS(panelId){
	var flashControl = Ab.view.View.getControl('', panelId);
	flashControl.refreshDataFromDataSource();
	var temp = {};
	temp.data = flashControl.data;
	temp.minValue = flashControl.minValue;
	temp.maxValue = flashControl.maxValue;
	return toJSON(temp);
}

function getLocalizedString_heatmap_JS(input){
	try {
		return heatMapControl.getLocalizedString_heatmap(input);
	}
	catch (e) {
		return input;
	}
}

Ab.flash.HeatMap = Ab.flash.FlashControl.extend({
	
	mapType:'world',
	primaryKeyField: "",
	latField: "",
	lonField: "",
	colorValueField: "",
	sizeValueField: "",
	showLegend: false,
	showPins: false,
	colorEntries: [],
	maxValue:-1,
	minValue:0,
	
	// @begin_translatable
    z_MESSAGE_WORLD: 'World',
    z_MESSAGE_NORTHAMERICA:	'North America',
    z_MESSAGE_SOUTHAMERICA: 'South America',
    z_MESSAGE_ASIA: 'Asia',
    z_MESSAGE_EUROPE: 'Europe',
    z_MESSAGE_AFRICA: 'Africa',
    z_MESSAGE_AUSTRALIA: 'Oceania',
    z_MESSAGE_NAVIGATION: 'Navigation',
    z_MESSAGE_LEGEND: 'Legend',    
	// @end_translatable
		
	constructor:function(controlId, mapType, dataSourceId, primaryKeyField, latField, lonField, colorValueField,
		sizeValueField,labelField,showLegend, showPins, colorEntries){
		heatMapControl = this;
		
		var swfParam = '?panelId=' + controlId;
		
		if(mapType != undefined && mapType != null){
    		this.mapType = mapType;
    	}
    	swfParam += '&mapType='+this.mapType;
    	
    	if(showLegend != undefined && showLegend != null){
    		this.showLegend = showLegend;
    	}
    	swfParam += '&showLegend='+this.showLegend;
    	
    	if(showPins != undefined && showPins != null){
    		this.showPins = showPins;
    	}
    	swfParam += '&showPins='+this.showPins;

		this.inherit(controlId, dataSourceId, "heatmap/AbFlashHeatmap", swfParam);
		
		this.latField = latField;
		this.lonField = lonField;
		this.colorValueField = colorValueField;
		this.sizeValueField = sizeValueField;
		this.primaryKeyField = primaryKeyField;	
		this.labelField = labelField.split(";");
		this.colorEntries = colorEntries;
	},
	
	// the function that supports getLocalizedString_heatmap_JS
	getLocalizedString_heatmap: function(input) {
		return View.getLocalizedString(this[input]);
	},
	
	refreshDataFromDataSource:function(){
		var ds = View.dataSources.get(this.dataSourceId);
		if (ds==null) return;
		
		var records = ds.getRecords(this.restriction);
		
		this.data = [];
		for (var i=0; i<records.length; i++) {
			var record = records[i];
			var temp = {};
			temp.primaryKey = record.getValue(this.primaryKeyField).substring(0,3);
			temp.colorValue = record.getValue(this.colorValueField);
			
			temp.sizeValue = record.getValue(this.sizeValueField);
			if(this.maxValue < 0 || temp.sizeValue > this.maxValue){
				this.maxValue = temp.sizeValue;
			}
			if(this.minValue > temp.sizeValue){
				this.minValue = temp.sizeValue;
			}
			temp.lat = record.getValue(this.latField);
			temp.lon = record.getValue(this.lonField);
			if (temp.lat=="" || temp.lon=="") continue;
			temp.label = "";
			for (var k=0; k<this.labelField.length; k++) {
				var field = this.labelField[k]
				var e = record.getValue(field);
				if (e!=null && e!="") {
					if (temp.label!="") temp.label += "; " +e;
					else temp.label = e;
				}
			}
			this.data.push(temp);
		}
	},
	refresh: function(restriction) {
		this.restriction = restriction;
	 	var obj = this.getSWFControl();
	 	if (obj!=null) obj.RefreshData();
	}
});