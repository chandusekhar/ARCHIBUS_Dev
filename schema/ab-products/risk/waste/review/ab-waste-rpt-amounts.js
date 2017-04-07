/**
 * @author Song
 */
var abWasteRptAmountsController = View.createController('abWasteRptAmountsController', {
	/**
	 *  console restriction
	 */
	restriction: null,
	/**
	 *  console original restriction 
	 */
	originalRes: null,
	/**
	 * timeLine setting mapped to chart panel
	 */
	timeLineChart: {"Year": null, "Month": null},
    /**
	 * afterInitialDataFetch
	 * call abWasteRptAmountsConsole_onShow to show related Pie and Line Chart with datas according console default parameters
	 */
	afterInitialDataFetch: function(){
		resetStatusOption('abWasteRptAmountsConsole');
        
        var timeLine = document.getElementsByName('abWasteRptAmountsConsole_timeLine');
        timeLine[0].checked = true;
	    this.timeLineChart['Year'] = this.abWasteRptAmountsYearRightChart;
        this.timeLineChart['Month'] =  this.abWasteRptAmountsMonthRightChart;
        
        this.abWasteRptAmountsMonthRightChart.show(false);
		this.setDataSourceParameters();
		  
//		  Kb 3031472
//		  this.abWasteRptAmountsConsole_onShow();
	},
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_profiles.waste_category',,'waste_profiles.waste_category'], 
			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_out.waste_disposition',,'waste_out.waste_disposition'], 
			['waste_dispositions.disposition_type',,'waste_dispositions.disposition_type'], 
			['waste_out.status',,'waste_out.status']
	),
	/**
	 * Show grid by console restriction
	 */
	abWasteRptAmountsConsole_onShow: function(){
        
		var res = addDispositionTypeRestriction(this.getOriginalConsoleRestriction(), 'abWasteRptAmountsConsole');
		this.originalRes = this.getOriginalConsoleRestriction();
		this.restriction = res;
		var timeLine = this.abWasteRptAmountsConsole.getFieldValue('timeLine');
		var groupBy = this.abWasteRptAmountsConsole.getFieldValue('groupBy');
		if (timeLine&&groupBy) {
            var rightChart = this.timeLineChart[timeLine];
            var otherChart = (timeLine == 'Year') ? 'Month' : 'Year';
            this.timeLineChart[otherChart].show(false);
            this.reSetPanel(this.abWasteRptAmountsChart,rightChart,res, groupBy);
		}
		
	},
	/**
	 * private method
	 */
	reSetPanel: function(leftChart,rightChart,res,groupByFld){
        leftChart.addParameter("groupByField", groupByFld);
		leftChart.refresh(res);

        rightChart.addParameter("groupByField", groupByFld);                                
		rightChart.addParameter('consoleRestriction',res);
        rightChart.show(true);
		rightChart.refresh(res);
	},
	/**
	 * original restriction
	 */
	getOriginalConsoleRestriction: function(){
		var console = this.abWasteRptAmountsConsole;
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var dateFrom=console.getFieldValue("date_start.from");
		var dateTo=console.getFieldValue("date_start.to");

		if(valueExistsNotEmpty(dateFrom)){
			restriction+=" AND waste_out.date_start >=${sql.date(\'" + dateFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateTo)){
			restriction+=" AND waste_out.date_start <=${sql.date(\'" + dateTo + "\')}";
		}
		if (document.getElementById("is_recyclable").checked) {
			restriction+=" AND waste_profiles.is_recyclable = 1 ";
		} else {
			//uncheck means all the condition contain
			//restriction+=" AND waste_profiles.is_recyclable = 0 ";
		}
		Ext.select('input[name="radioUnits"]:checked').each(function(val){
			var val = val.dom.value;
			if (valueExistsNotEmpty(val)) {
				restriction+=" AND waste_out.units_type = '"+val+"'";
			}
		});
		return restriction;
	},
	setDataSourceParameters: function(){		
		var yearRestriction = "(case when waste_out.date_start is null then '" + getMessage('noDate') + "' else ${sql.yearOf('waste_out.date_start')} end) = ${parameters['summaryValueForThisGroup']} and ${parameters['consoleRestriction']}";
		this.abWasteRptAmountsYearRightChart.addParameter('composedRestriction',yearRestriction);
		this.abWasteRptAmountsYearRightChart.addParameter('noDate',getMessage('noDate'));
		
		var monthRestriction = "(case when waste_out.date_start is null then '" + getMessage('noDate') + "' else ${sql.yearMonthOf('waste_out.date_start')} end) = ${parameters['summaryValueForThisGroup']} and ${parameters['consoleRestriction']}";
		this.abWasteRptAmountsMonthRightChart.addParameter('composedRestriction',monthRestriction);
		this.abWasteRptAmountsMonthRightChart.addParameter('noDate',getMessage('noDate'));
	}
});
/**
 * This function is called when  user clicks on the chart
 */
function displayChartSelectedItem(chartItem) {
	
	//replace waste_out.vf_waste_out_group_by_field with waste_out.site_id or waste_out.bl_id or waste_out.waste_profile or waste_out.waste_type
	var groupByFieldId = chartItem.chart.parameters["groupByField"];
	groupByFieldId = groupByFieldId.replace("wo.", "waste_out.").replace("wp.", "waste_out.");
	
	
    var ctrl = View.controllers.get('abWasteRptAmountsController');
    var res = "1=1";
    
	var clause = chartItem.restriction.clauses[0];
	if (clause) {
        if(clause.name == "waste_out.vf_waste_out_group_by_field"){
            clause.name = groupByFieldId;
        }
		var date_end="";
		if (clause.name=='waste_out.year') {
			date_end = "${sql.yearOf('waste_out.date_start')}";
			res = getPartRes(ctrl,chartItem,clause,date_end);
		}else if(clause.name=='waste_out.month') {
			date_end = "${sql.yearMonthOf('waste_out.date_start')}";
			res = getPartRes(ctrl,chartItem,clause,date_end);
		}else {
			if (clause.value=="") {
				   res = clause.name + " is null";
			} else {
				 if(clause.name=='waste_profiles.waste_type') {
						res = clause.name +" = '" + getWasteType(clause.value) + "'";
				 }else {
					 res = clause.name +" = '" + clause.value + "'";
				}
		   }
		}
	}
    
	View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', res + " and " + ctrl.restriction);
}
/**
 * private method
 */
function getPartRes(ctrl,chartItem,clause,date_end){
	if(valueExistsNotEmpty(chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'])){
		var groupByFieldId = chartItem.chart.parameters["groupByField"];
		groupByFieldId = groupByFieldId.replace("wo.", "waste_out.").replace("wp.", "waste_out.");
		chartItem.selectedChartData[groupByFieldId] = chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'];
		delete chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'];
	}	
	
	var nullVal = "N/A";
    var res = "1=1";
    var groupFieldVal = chartItem.selectedChartData[groupByFieldId];

    if (groupFieldVal==nullVal) {
        res = " " + date_end + " = '" + clause.value + "' and " + groupByFieldId + " is null";
    } else {
        res = " " + date_end + " = '" + clause.value + "' and " + groupByFieldId + " = '" + groupFieldVal + "'";
    }
    
    return res;
}
/**
 * private method 
 * get waste type from obj
 * wasteType string name
 * @returns
 */
function getWasteType(wasteType){
	var typeObj = {'Hazardous':'H','Residual/Non-Hazardous':'R','Municipal':'M'};
	return typeObj[wasteType];	
}
