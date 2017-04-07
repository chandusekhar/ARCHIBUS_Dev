var abSpTrendTabCtrl = abSpAllocTrendMetricTabCommCtrl.extend({

	//options of 'Group By' list
	groupByOption:null,

	//options of 'X-Axis Unit' list
	xAxisOptions:null,

	//options of 'Y-Axis Unit' list
	yAxisOptions:null,

	fieldsArraysForRestriction: new Array(
			['bl.site_id',,'bl.site_id'], 
			['afm_metric_trend_values.bl_id',,'afm_metric_trend_values.bl_id'], 
			['afm_metric_trend_values.dv_id',,'afm_metric_trend_values.dv_id'], 
			['afm_metric_trend_values.dp_id',,'afm_metric_trend_values.dp_id']
	),

	/**
	  * This function is called by base control inside event handler afterInitialDataFetch. 
	  */
	initial: function(){
		//specify own properties console and default chart view name 
		this.console = this.abSpTrendTabConsole;
		this.defaultChartViewName = "ab-sp-trend-dv-month-area-chart.axvw";

		//initial dropdown list options
		this.yAxisOptions = {
				'area': getMessage('area')
		}
		
		//fill year list to 'From Year' and 'To Year' dropdown list
		var recs = View.dataSources.get("dsYears").getRecords();
		this.populateYearSelectLists(recs,"year_from");
		this.populateYearSelectLists(recs,"year_to");
	},

	/**
	  * Return the current chart view name which is mapped to the current combined key of selected group options. 
	  */
  	getChartViewName: function(){
		//return constructed chart view name: own prefix("ab-sp-trend-") + combined key + common suffix(¡®-chart.axvw¡¯) .
		return "ab-sp-trend-"+this.combinedGroupKeys+"-chart.axvw"; 
	},
	
	/**
	  * Adjust options in Y-Axis unit list and X-Axis unit list when ¡®Group By¡¯ selection is changed. 
	  */
  	onGroupOptionChange: function(value){
		var groupField = this.abSpTrendTabConsole.fields.get('group_by');
		var yAxisField = this.abSpTrendTabConsole.fields.get('y_axis');

		//adjust options of Y-Axis unit list when Group By list changes
		if('orate'==value){
			yAxisField.clearOptions();
			yAxisField.addOption('pct' , getMessage('pct'));
		}
		else {
			yAxisField.clearOptions();
			yAxisField.addOption('area' , getMessage('area'));
		}
	},

	/**
	  * Store selected value of 'From Year' and 'To Year' to chart Tabs. 
	  */
  	prepareSqlParameterValueFromConsole: function(value){
		this.chartTabs.fromYear = this.abSpTrendTabConsole.getFieldValue('year_from');
		this.chartTabs.toYear = this.abSpTrendTabConsole.getFieldValue('year_to');
	},

	populateYearSelectLists:function(recs, fieldId) {
		var yearField	  = 	this.abSpTrendTabConsole.fields.get(fieldId);
        for (var i = recs.length-1; i >=0; i--) {
            var year = recs[i].values['afm_cal_dates.year']+"";
			yearField.addOption(year, year);
        }
        var optionIndexCurrentYear = this.getOptionIndex($(fieldId), this.getSystemYear());
		$(fieldId).options[optionIndexCurrentYear].setAttribute('selected', true);
		$(fieldId).value = this.getSystemYear();
    },

	getSystemYear:function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

	getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	}

})