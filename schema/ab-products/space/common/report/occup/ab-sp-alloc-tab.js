var abSpAllocTabCtrl = abSpAllocTrendMetricTabCommCtrl.extend({

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
		this.console = this.abSpAllocTabConsole;
		this.defaultChartViewName = "ab-sp-alloc-dp-area-fl-chart.axvw";

		//initial dropdown list options
		this.xAxisOptions = {
				'area': getMessage('area'),
				'count': getMessage('rcount')
		}
	},

	/**
	  * Return the current chart view name which is mapped to the current combined key of selected group options. 
	  */
  	getChartViewName: function(){
		//for group by 'All Area Types', when X-axis is 'Area', Y-axis is site, bl or fl, return specified chart name due to specifical calculation of Remaining Area. 
		if ( this.groupByOption=='all' && this.xAxisOption=='area' ) {
			if ( this.yAxisOption=='site' && this.restrictSiteOnly() )	
				return "ab-sp-alloc-all-area-site-remain-chart.axvw"; 
			else if ( this.yAxisOption=='bl' && this.restrictBuildingOnly() )
				return "ab-sp-alloc-all-area-bl-remain-chart.axvw"; 
			else if ( this.yAxisOption=='fl' && this.restrictFloorOnly())
				return "ab-sp-alloc-all-area-fl-remain-chart.axvw"; 
		}
		//return constructed chart view name: own prefix("ab-sp-alloc-") + combined key + common suffix(¡®-chart.axvw¡¯) . 
		return "ab-sp-alloc-"+this.combinedGroupKeys+"-chart.axvw"; 
	},
	
	/**
	  * Determine if there are other input values in console except for the 'Site'. 
	  */
  	restrictSiteOnly: function(){ 
		for (var i = 0; i < this.fieldsArraysForRestriction.length; i++) {
			var consoleField = this.fieldsArraysForRestriction[i];
			if ( 'bl.site_id'!=consoleField[0] && this.console.getFieldValue(consoleField[0]) ) 
				return false;
		}
		return true;
	},

	/**
	  * Determine if there are other input values in console except for the 'Site' and 'Building'. 
	  */
  	restrictBuildingOnly: function(){ 
		for (var i = 0; i < this.fieldsArraysForRestriction.length; i++) {
			var consoleField = this.fieldsArraysForRestriction[i];
			if ( 'rm.bl_id'!=consoleField[0] && 'bl.site_id'!=consoleField[0] && this.console.getFieldValue(consoleField[0]) ) 
				return false;
		}
		return true;
	},

	/**
	  * Determine if there are other input values in console except for the 'Site' and 'Building'. 
	  */
  	restrictFloorOnly: function(){ 
		for (var i = 0; i < this.fieldsArraysForRestriction.length; i++) {
			var consoleField = this.fieldsArraysForRestriction[i];
			if ( 'rm.fl_id'!=consoleField[0] &&  'rm.bl_id'!=consoleField[0] && 'bl.site_id'!=consoleField[0] && this.console.getFieldValue(consoleField[0]) ) 
				return false;
		}
		return true;
	},

	/**
	  * Adjust options in Y-Axis unit list and X-Axis unit list when ¡®Group By¡¯ selection is changed. 
	  */
  	onGroupOptionChange: function(value){
		var groupField = this.abSpAllocTabConsole.fields.get('group_by');
		var xAxisField = this.abSpAllocTabConsole.fields.get('x_axis');
		var yAxisField = this.abSpAllocTabConsole.fields.get('y_axis');

		//adjust options of X-Axis unit list when Group By list changes
		if('orate'==value){
			xAxisField.clearOptions();
			xAxisField.addOption('pct' , getMessage('pct'));
		}
		else if("op"==value){
			xAxisField.clearOptions();
			xAxisField.addOption('count' , getMessage('count'));
		}
		else {
			xAxisField.clearOptions();
			xAxisField.addOption('area' , getMessage('area'));
			xAxisField.addOption('count' , getMessage('rcount'));
		}

		//adjust options of Y-Axis unit list when Group By list changes
		if('cat'==value){
			yAxisField.clearOptions();
			yAxisField.addOption('fl' , getMessage('fl'));
			yAxisField.addOption('bl' , getMessage('bl'));
			yAxisField.addOption('site' , getMessage('site'));
		}
		else {
			yAxisField.clearOptions();
			yAxisField.addOption('fl' , getMessage('fl'));
			yAxisField.addOption('bl' , getMessage('bl'));
			yAxisField.addOption('site' , getMessage('site'));
			yAxisField.addOption('cat' , getMessage('cat'));
		}
	}
})