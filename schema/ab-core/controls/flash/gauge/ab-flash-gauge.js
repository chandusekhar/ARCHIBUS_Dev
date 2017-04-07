Ab.namespace('flash');

var gaugeControl = null;



// To be called by ActionScript
function getData_JS(panelId) {
	var flashControl = Ab.view.View.getControl('', panelId);
	flashControl.refreshDataFromDataSource();
	return flashControl.data;
};


Ab.flash.Gauge = Ab.flash.FlashControl.extend({

	dataSourceId: null,
	valueField: null,
	gaugeType: 'Circular',
	isEditable: false,
	minValue: 0,
	maxValue: 100,
	majTickInterval: 10,
	minTickInterval: 5,
	trackMinimum: 50,
	trackMaximum: 100,
	trackType: 'gyr',

	constructor: function(controlId, //parent panel ID
		gaugeType, // type of gauge to be used (circular, knob, horizontal or vertical)
		dataSourceId, //ID of the datasource defined in the .axvw file
		valueField, // field in the datasource that is used as value field
		isEditable, // whether the use can change the tick or needle value
		minValue, // minimum value for the scale (optional)
		maxValue, // maximum value for the scale (optional)
		majTickInterval, // major tick interval (optional)
		minTickInterval, // minor tick interval (optional)
		trackMinimum, // minimum value of the track (optional)
		trackMaximum,// maximum value of the track (optional)
		trackType, //ordering of the colors of the track (optional, one of gyr, ryg or ygy, default gyr)
		categories){ //categories (|-separated list) required for knob
		
		gaugeControl = this;
		this.dataSourceId = dataSourceId;
		this.valueField = valueField;
		
		var swfParam = '?panelId=' + controlId;

    	if(isEditable != undefined && isEditable != null){
    		this.isEditable = isEditable;
    	}
    	swfParam += '&isEditable='+this.isEditable;
    	
    	if(minValue != undefined && minValue != null){
    		this.minValue = minValue;
    	}
    	swfParam += '&minValue='+this.minValue;
    	
    	if(maxValue != undefined && maxValue != null){
    		this.maxValue = maxValue;
    	}
    	swfParam += '&maxValue='+this.maxValue;
    	
    	if(majTickInterval != undefined && majTickInterval != null){
    		this.majTickInterval = majTickInterval;
    	}
    	swfParam += '&majTickInterval='+this.majTickInterval;
    	
    	if(minTickInterval != undefined && minTickInterval != null){
    		this.minTickInterval = minTickInterval;
    	}
    	swfParam += '&minTickInterval='+this.minTickInterval;
    	
    	if(trackMinimum != undefined && trackMinimum != null){
    		this.trackMinimum = trackMinimum;
    	}
    	swfParam += '&trackMinimum='+this.trackMinimum;
    	
    	if(trackMaximum != undefined && trackMaximum != null){
    		this.trackMaximum = trackMaximum;
    	}
    	swfParam += '&trackMaximum='+this.trackMaximum;
    	
    	if(trackType != undefined && trackType != null){
    		this.trackType = trackType;
    	}
    	swfParam += '&trackType='+this.trackType;
    	
    	if(categories != undefined && categories != null){
    		swfParam += '&categories='+categories;
    	}
    	
    	
    	this.inherit(controlId, dataSourceId, "gauge/AbFlashGauge"+gaugeType, swfParam);
    	
	},
	
	refreshDataFromDataSource:function(){
		var ds = View.dataSources.get(this.dataSourceId);
		if (ds==null) return;
		
		
		var records = ds.getRecords(this.restriction);
		this.data = 0;
		if(records.length > 0){
			var record = records[0];
			this.data = record.getValue(this.valueField);
		}
	},
	
	refresh: function(restriction) {
		this.restriction = restriction;
	 	var obj = this.getSWFControl();
	 	if (obj!=null) obj.RefreshData();
	},
	
	setMinMaxValues: function(minValue,maxValue){
		var obj = this.getSWFControl();
	 	if (obj!=null){
			if(valueExistsNotEmpty(minValue) && valueExistsNotEmpty(maxValue)){
				obj.setMinMaxValues(minValue,maxValue);
			} else if(valueExistsNotEmpty(maxValue)){
				obj.setMinMaxValues(this.minValue,maxValue);
			} else if(valueExistsNotEmpty(minValue)){
				obj.setMinMaxValues(minValue,this.maxValue);
			} else {
				obj.setMinMaxValues(this.minValue,this.maxValue);
			}
		}
	},
	
	setTickIntervals: function(minTick,majTick){
		var obj = this.getSWFControl();
	 	if (obj!=null){
			if(valueExistsNotEmpty(minTick) != null && valueExistsNotEmpty(majTick)){
				obj.setTickIntervals(minTick,majTick);
			} else if(valueExistsNotEmpty(majTick)){
				obj.setTickIntervals(this.minTickInterval,majTick);
			} else if(valueExistsNotEmpty(minTick)){
				obj.setTickIntervals(minTick,this.majTickInterval);
			} else {
				obj.setTickIntervals(this.minTickInterval,this.majTickInterval);
			}
		}
	},
	setMinMaxTrack: function(trackMin,trackMax){	
		var obj = this.getSWFControl();
	 	if (obj!=null){
			if(valueExistsNotEmpty(trackMin) && valueExistsNotEmpty(trackMax)){
				obj.setMinMaxTrack(trackMin,trackMax);
			} else if(valueExistsNotEmpty(trackMax)){
				obj.setMinMaxTrack(this.trackMinimum,trackMax);
			} else if(valueExistsNotEmpty(trackMin)){
				obj.setMinMaxTrack(trackMin,this.trackMaximum);
			} else {
				obj.setMinMaxTrack(this.trackMinimum,this.trackMaximum);
			}
		}
	}
});
