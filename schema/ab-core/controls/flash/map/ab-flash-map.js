Ab.namespace('flash');

var mapControl = null;

function getMapData_JS(panelId){
	var flashControl = Ab.view.View.getControl('', panelId);
	flashControl.refreshDataFromDataSource();
	return toJSON(flashControl.data);
}

// To be called by ActionScript.
// Get localized string.
function getLocalizedString_map_JS(input) {
	try {
		return mapControl.getLocalizedString_map(input);
	}
	catch (e) {
		return input;
	}
};

Ab.flash.Map = Ab.flash.FlashControl.extend({
	
	showLabels: false,
	labelField: null,
	colorField: null,
	primaryKeyField:null,
	
	// @begin_translatable
    z_MESSAGE_WORLD: 'World',
    z_MESSAGE_NORTHAMERICA:	'North America',
    z_MESSAGE_SOUTHAMERICA: 'South America',
    z_MESSAGE_ASIA: 'Asia',
    z_MESSAGE_EUROPE: 'Europe',
    z_MESSAGE_AFRICA: 'Africa',
    z_MESSAGE_AUSTRALIA: 'Australia',
    z_MESSAGE_CLEARPINS: 'Clear Pins',
	// @end_translatable
	
	constructor:function(controlId, mapType, dataSourceId, primaryKeyField,colorField,labelField,showLabels){
		mapControl = this;
		var swfParam = '?panelId=' + controlId;
		if(mapType != undefined){
			swfParam +='&mapType=' + mapType;
			
			this.inherit(controlId, dataSourceId, "map/AbFlashMap", swfParam);
			
			this.labelField = labelField.split(";");
			this.showLabels = showLabels;
			this.colorField = colorField;
			this.primaryKeyField = primaryKeyField;
		}
	},
	getLocalizedString_map:function(input){
		return View.getLocalizedString(this[input]);
	},	
	clearPins:function(){
		var obj = this.getSWFControl();
	 	if (obj!=null) obj.clearPins();
	},
	addPins:function(dataSourceId,primaryKeyField,latField,lonField,labelField,pinIcon,showLabels){
		var obj = this.getSWFControl();
	 	if (obj!=null) {
	 		var ds = View.dataSources.get(dataSourceId);
	 		var records = ds.getRecords();
	 		var pinData = [];
	 		for (var i=0; i<records.length; i++) {
				var record = records[i];
				var temp = {};
				temp.lat = record.getValue(latField);
				temp.lon = record.getValue(lonField);
				if (temp.lat=="" || temp.lon=="") continue;
				temp.label = "";
				var labels = labelField.split(";");
				for (var k=0; k< labels.length; k++) {
					var e = record.getValue(labels[k]);
					if (e!=null && e!="") {
						if (temp.label!="") temp.label += "; ";
						temp.label += e;
					}
				}
				pinData.push(temp);
			}	
			obj.addPins(toJSON(pinData),pinIcon,showLabels);
	 	}
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
			temp.color = record.getValue(this.colorField);
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
	refresh:function(restriction){
		var obj = this.getSWFControl();
		this.restriction = restriction;
	 	if (obj!=null) obj.RefreshData();
	}
	
});