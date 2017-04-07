Ab.namespace('flash');

var treeMapControl = null;

Ab.flash.TreeMap = Ab.flash.FlashControl.extend({

	labelThreshold: 0,
	topMarginProportion: '0',
	borderColor: '0xFF0000',
	colorScheme: 'sequential',
	levels: [],	
	viewName: "",
	recordLimit: 0,

	constructor:function(controlId,dataSourceId,viewName,labelThreshold,topMarginProportion,borderColor,colorScheme){
		var swfParam = '?panelId=' + controlId;
		this.viewName = viewName;
		if(labelThreshold != undefined && labelThreshold != null){
    		this.labelThreshold = labelThreshold;
    	}
    	swfParam += '&labelThreshold='+this.labelThreshold;
    	
    	if(topMarginProportion != undefined && topMarginProportion != null){
    		this.topMarginProportion = topMarginProportion;
    	}
    	swfParam += '&topMarginProportion='+this.topMarginProportion;
    	
    	if(borderColor != undefined && borderColor != null){
    		this.borderColor = borderColor;
    	}
    	swfParam += '&borderColor='+this.borderColor;
    	
    	if(colorScheme != undefined && colorScheme != null){
    		this.colorScheme = colorScheme;
    	}
    	swfParam += '&colorScheme='+this.colorScheme;
    	
    	this.inherit(controlId, dataSourceId, "treemap/AbFlashTreemap", swfParam);
	},
	
	addLevelOfData:function(hierarchyLevel,dataSourceId,labelIdField,areaField,colorField,restrictionFieldForChildren,
		restrictionFieldFromParent,restrictionFromConsole){
		var temp = {};
		temp.hierarchyLevel = hierarchyLevel;
		temp.dataSourceId = dataSourceId;
		temp.labelIdField =  labelIdField;
		temp.areaField = areaField;
		temp.colorField = colorField;
		temp.restrictionFieldForChildren = restrictionFieldForChildren;
		temp.restrictionFieldFromParent = restrictionFieldFromParent;
		if(valueExistsNotEmpty(restrictionFromConsole)){
			temp.restrictionFromConsole = restrictionFromConsole;
		} else {
			temp.restrictionFromConsole = "0=0";
		}
		this.levels.push(temp);
	},
	showData: function(){
		try {
			var result = Workflow.callMethod("AbCommonResources-TreeMapService-queryTreeMapJSONData", this.viewName, this.levels, this.recordLimit);
			var data = result.message;
			var obj = this.getSWFControl();
			if(obj != null){
			 	obj.showData(data);
			 }
		} catch (e){
			this.handleError(e);
		}
	},
	setRecordLimit:function(limit){
		this.recordLimit=limit;
	}
});