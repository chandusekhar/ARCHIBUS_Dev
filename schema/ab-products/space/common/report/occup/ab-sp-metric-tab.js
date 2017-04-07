var abSpMetricTabCtrl = abSpAllocTrendMetricTabCommCtrl.extend({

	//options of 'Group By' list
	groupByOption:null,

	//options of 'X-Axis Unit' list
	xAxisOptions:null,

	//options of 'Y-Axis Unit' list
	yAxisOptions:null,

	fieldsArraysForRestriction: new Array(
			['bl.site_id',,'bl.site_id'], 
			['rm.bl_id',,'rm.bl_id'], 
			['rm.fl_id',,'rm.fl_id'], 
			['rm.dv_id',,'rm.dv_id'], 
			['rm.dp_id',,'rm.dp_id'], 
			['rm.rm_cat',,'rm.rm_cat']
	),

	/**
	  * This function is called by base control inside event handler afterInitialDataFetch. 
	  */
	initial: function(){
		//specify own properties console and default chart view name 
		this.console = this.abSpMetricTabConsole;
		this.defaultChartViewName = "ab-sp-metric-dp-area-fl-chart.axvw";

		//initial dropdown list options
		this.yAxisOptions = {
				'area': getMessage('area'),
				'count': getMessage('rcount')
		}
	},

	/**
	  * Return the current chart view name which is mapped to the current combined key of selected group options. 
	  */
  	getChartViewName: function(){
		//return constructed chart view name: own prefix("ab-sp-alloc-") + combined key + common suffix(¡®-chart.axvw¡¯) . 
		this.combinedGroupKeys = this.groupByOption +'-'+this.yAxisOption +'-'+this.xAxisOption;
		return "ab-sp-metric-"+this.combinedGroupKeys+"-chart.axvw"; 
	},
	
	/**
	  * Adjust options in Y-Axis unit list and X-Axis unit list when ¡®Group By¡¯ selection is changed. 
	  */
  	onGroupOptionChange: function(value){
		var groupField = this.abSpMetricTabConsole.fields.get('group_by');
		var xAxisField = this.abSpMetricTabConsole.fields.get('x_axis');
		var yAxisField = this.abSpMetricTabConsole.fields.get('y_axis');

		//adjust options of X-Axis unit list when Group By list changes
		if('orate'==value){
			yAxisField.clearOptions();
			yAxisField.addOption('pct' , getMessage('pct'));
		}
		else if("hc"==value){
			yAxisField.clearOptions();
			yAxisField.addOption('count' , getMessage('count'));
		}
		else if("avp"==value || "avs"==value || "avc"==value){
			yAxisField.clearOptions();
			yAxisField.addOption('area' , getMessage('area'));
		}
		else {
			yAxisField.clearOptions();
			yAxisField.addOption('area' , getMessage('area'));
			yAxisField.addOption('count' , getMessage('rcount'));
		}

		//adjust options of X-Axis unit list when Group By list changes
		if('cat'==value || 'avc'==value){
			xAxisField.clearOptions();
			xAxisField.addOption('fl' , getMessage('fl'));
			xAxisField.addOption('bl' , getMessage('bl'));
			xAxisField.addOption('site' , getMessage('site'));
			xAxisField.addOption('dp' , getMessage('dp'));
		}
		else {
			xAxisField.clearOptions();
			xAxisField.addOption('fl' , getMessage('fl'));
			xAxisField.addOption('bl' , getMessage('bl'));
			xAxisField.addOption('site' , getMessage('site'));
			xAxisField.addOption('dp' , getMessage('dp'));
			xAxisField.addOption('cat' , getMessage('cat'));
		}
	}
})