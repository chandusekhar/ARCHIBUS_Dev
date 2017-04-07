var abSpOccupAnalTab2Controller = abSpOccupAnalCommonController.extend({

	groupBy: '', 
	groupSql: '', 
	intervalType: '', 
	fromYear: '', 
	toYear: '', 

	groupByValueArray: new Array(
			"dv", "dp", "orate" 
	),
	groupByTextArray: new Array(
	),

	intervalArray: new Array(
			"m", "q",  "y" 
	),
	intervalTextArray: new Array(
	),
	
	dataAxisOptionValue: new Array(
			"area", "pct" 
	),
	dataAxisOptionText: new Array(
	),
			
	fieldsArraysForRestriction: new Array(
			['bl.site_id',,'bl.site_id'], 
			['afm_metric_trend_values.bl_id',,'afm_metric_trend_values.bl_id'], 
			['afm_metric_trend_values.dv_id',,'afm_metric_trend_values.dv_id'], 
			['afm_metric_trend_values.dp_id',,'afm_metric_trend_values.dp_id']
	),

    afterViewLoad: function(){
		var recs = View.dataSources.get("dsYears").getRecords();
		var fromYearSelect = $('fromYear');
		populateYearSelectLists(recs, fromYearSelect);
		var toYearSelect = $('toYear');
		populateYearSelectLists(recs, toYearSelect);
	},

	localizeText: function(){
		this.dataAxisOptionText.push(getMessage("area"));
		this.dataAxisOptionText.push(getMessage("pct"));

		this.groupByTextArray.push(getMessage("dv"));
		this.groupByTextArray.push(getMessage("dp"));
		this.groupByTextArray.push(getMessage("orate"));

		this.intervalTextArray.push(getMessage("M"));
		this.intervalTextArray.push(getMessage("Q"));
		this.intervalTextArray.push(getMessage("Y"));
	},

	afterInitialDataFetch: function(){
		this.localizeText();
		initialDropdownList("groupBy", this.groupByValueArray,this.groupByTextArray);
		initialDropdownList("dataAxis", this.dataAxisOptionValue,this.dataAxisOptionText);
		initialDropdownList("interval",this.intervalArray, this.intervalTextArray);
		removeSelectOption("dataAxis", "pct");
		this.groupChange();
	},

    getRestrictionOfStringFormat: function(){
		this.consoleRes = getRestrictionStrFromConsole(this.abSpOccupAnalTab2Console, this.fieldsArraysForRestriction);
	},
	
	/**
     * event handler when click show
     */
    abSpOccupAnalTab2Console_onShow: function(){
		this.getRestrictionOfStringFormat();
		
		this.groupSql = this.getGroupOption();
		
		var chart = this.customStackedAareaChart;
		if(this.groupBy=="orate"){
			chart = this.customLineChart;
			this.customStackedAareaChart.show(false);
		}
		else{
			chart.addParameter('groupOption',  this.groupSql);
			this.customLineChart.show(false);
		}
		this.intervalType = document.getElementById("interval").value;
		var dataAxisList = document.getElementById("dataAxis");
		chart.addParameter('startYear',  document.getElementById("fromYear").value);
		chart.addParameter('endYear',  document.getElementById("toYear").value);
		chart.addParameter('frequency',  this.intervalType);
		chart.addParameter('calculationType',  dataAxisList.value);
		if("m"==this.intervalType){
			chart.addParameter('groupDateType',  "${sql.yearMonthOf('afm_cal_dates.cal_date')}");
			chart.addParameter('groupMetricDateType',  "${sql.yearMonthOf('afm_metric_trend_values.metric_date')}");
			if("area"==dataAxisList.value){
				chart.addParameter('metricName',  "department_area_x_month");
			}
			else {
				chart.addParameter('metricName',  "occupancy_count_x_bl_x_month");					
			}
		}
		else if ("q"==this.intervalType)	{
			chart.addParameter('groupDateType',  "${sql.yearQuarterOf('afm_cal_dates.cal_date')}");
			chart.addParameter('groupMetricDateType',  "${sql.yearQuarterOf('afm_metric_trend_values.metric_date')}");
			if("area"==dataAxisList.value){
				chart.addParameter('metricName',  "department_area_x_quarter");
			}
			else {
				chart.addParameter('metricName',  "occupancy_count_x_bl_x_quarter");					
			}
		}
		else if("y"==this.intervalType){
			chart.addParameter('groupDateType',  "${sql.yearOf('afm_cal_dates.cal_date')}");
			chart.addParameter('groupMetricDateType',  "${sql.yearOf('afm_metric_trend_values.metric_date')}");
			if("area"==dataAxisList.value){
				chart.addParameter('metricName',  "department_area_x_year");
			}
			else {
				chart.addParameter('metricName',  "occupancy_count_x_bl_x_year");					
			}
		}
		chart.addParameter('consoleRes',  this.consoleRes);					
		chart.addParameter('consoleResForM',  this.consoleRes.replace(/afm_metric_trend_values/g, "m"));					
		var dataAxisTitle = 	dataAxisList.options[dataAxisList.selectedIndex].text;
		chart.setDataAxisTitle(dataAxisTitle);
		chart.refresh();
		chart.show(true);
		chart.setTitle(this.getTitleText());
	},

	getGroupOption: function(){
		var groupBy=document.getElementById("groupBy").value;
		this.groupBy = groupBy;

		switch (groupBy){
			case "dv":
				return "RTRIM(afm_metric_trend_values.dv_id)";
			break;
			case "dp":
				return "RTRIM(afm_metric_trend_values.dv_id)${sql.concat}'-'${sql.concat}RTRIM(afm_metric_trend_values.dp_id)";
			break;
			case "orate":
				return "orate";
			break;
			case "count":
				return "headcount";
			break;
		}
	},

	groupChange: function(){
		var groupBy=document.getElementById("groupBy").value;
		var cValue=document.getElementById("dataAxis").value;
		//Change select options according to pre-set rules in spec
		initialDropdownList("dataAxis", this.dataAxisOptionValue,this.dataAxisOptionText);
		if(groupBy=="orate"){
				removeSelectOption("dataAxis", "area");
		}
		else{
				removeSelectOption("dataAxis", "pct");
		}

		if(groupBy=="dv" ||  groupBy=="dp"){
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.dv_id", true);
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.dp_id", true);
			this.abSpOccupAnalTab2Console.setFieldValue("afm_metric_trend_values.bl_id", "");
			this.abSpOccupAnalTab2Console.setFieldValue("bl.site_id", "");
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.bl_id", false);
			this.abSpOccupAnalTab2Console.enableField("bl.site_id", false);
		}
		else{
			this.abSpOccupAnalTab2Console.setFieldValue("afm_metric_trend_values.dv_id", "");
			this.abSpOccupAnalTab2Console.setFieldValue("afm_metric_trend_values.dp_id", "");
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.dv_id", false);
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.dp_id", false);
			this.abSpOccupAnalTab2Console.enableField("afm_metric_trend_values.bl_id", true);
			this.abSpOccupAnalTab2Console.enableField("bl.site_id", true);
		}
	},

	/**
	 * Return title text based on group by and calculation
	 */
	getTitleText : function() {
		var groupByValue=document.getElementById("groupBy").value;
		var dataValue=document.getElementById("dataAxis").value;
		return getMessage(groupByValue+'_'+dataValue);
	}

})