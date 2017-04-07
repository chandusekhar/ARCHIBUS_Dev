// overwrite chart control getParameters function
Ab.chart.ChartControl.prototype.getParameters = function(restriction){
	var controlType = View.controllers.get('abCbRptTotByYear').chartType;
	
	if(controlType === 'line'){
		this.chartType = "lineChart";
	}else if(controlType === 'stacked'){
		this.chartType = "stackedBarChart";
	}
	
	var viewName = this.configObj.getConfigParameter('viewDef');
	var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
	var dataAxis = this.configObj.getConfigParameter('dataAxis');
	
	var  parameters = {
	           version: '2',
	           viewName: viewName,
	           groupingAxis: toJSON(groupingAxis),
	           dataAxis: toJSON(dataAxis),
	           type: 'chart'
	 };
	 
	 var secondaryGroupingAxis = this.configObj.getConfigParameter('secondaryGroupingAxis');
	 if (valueExists(secondaryGroupingAxis)) {
         parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
     }
     
     if (valueExists(restriction)) {
         parameters.restriction = toJSON(restriction);
     }
     
	 Ext.apply(parameters, this.parameters);
     this.setSwfPath();
	 
     // we must load the new data into flash control
	 this.loadChartSWFIntoFlash();
	 
	 return parameters;
}


var abCbRptTotByYearCtrl = View.createController('abCbRptTotByYear', {
	
	selectionLabel: null,
	
	chartType: null,
	
	printableRestriction: [],
	
	afterViewLoad: function(){
		$('label_chartType_line').innerHTML = getMessage("label_line_chart");
		$('label_chartType_stacked').innerHTML = getMessage("label_stacked_chart");
	},
	
	/**
	 * Event listener for 'Show' button from filter panel
	 */
	abCbRptTotByYear_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptTotByYear_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptTotByYear_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		if(document.getElementById('rad_chartType_line').checked){
			this.chartType = "line";
		}else if(document.getElementById('rad_chartType_stacked').checked){
			this.chartType = "stacked";
		}
		
		this.selectionLabel = getFilterSelectionAsLabel(this.abCbRptTotByYear_filter);
		
		var restrictions = getFilterRestriction(this.abCbRptTotByYear_filter);
		var restriction = restrictions.restriction;
		this.printableRestriction = restrictions.printableRestriction;
		
		this.abCbRptTotByYear_totalChart.addParameter('none_param_value', getMessage('noneParam'));
		this.abCbRptTotByYear_totalChart.addParameter('filterRestriction', restriction);
		this.abCbRptTotByYear_totalChart.refresh(restriction);
		
		
		
	},
	
	abCbRptTotByYear_totalChart_afterRefresh: function(){
		this.abCbRptTotByYear_totalChart.setInstructions(this.selectionLabel);
		this.abCbRptTotByYear_totalChart.enableAction("exportDOCX", true);
		
	}
});
