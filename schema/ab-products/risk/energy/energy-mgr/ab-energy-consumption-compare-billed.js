
var energyConsumptionCompareController = View.extendController('energyConsumptionCompareController', energyCostBaseController, {
	
	viewPanels: [
	   "energyCost_chart"
	],

	afterViewLoad: function() {
		this.initializeTree(); 
		this.initializeBillUnitsOptions();
		this.showOnLoad(false);		
		
		this.hideConsoleRow(1);  
		this.hideConsoleField("energyCostLoc_locDtlSelect");		
		this.hideConsoleRow(6); 

		this.hideConsoleField("bill_archive.bill_type_ids");  
		// hide the from and presume always 12 months before the end period
		this.hideConsoleField("bill_archive.time_period.from");   
		
		var chart = this.energyCost_chart.chartControl.chart.canvas;
		// adjust the balloon for previous year
		chart.graphs[0].balloonFunction = this.adjustBalloonText; 
		chart.valueAxes[0].title = getMessage("axisTitle");
	}, 
	
	energyTree_onShowSelected: function() {
		if (this.energyConsole.getFieldValue("bill_archive.bill_type_id") == '') { 
			// this.energyConsole.setFieldValue("bill_archive.bill_type_id", "ELECTRIC");			 
			View.showMessage(getMessage('selectRequiredBillType'));
			return;
		}
		// set the previous year in the from field
		this.setPreviousYearFromField();
		
		this.setBillUnitsParameter(); 
		
		this.energyCost_chart.addParameter('finalRestriction', this.getFinalRestriction());
		this.energyCost_chart.addParameter('previousRestriction', this.getPreviousRestriction()); 
		 	
		// force to add legend
		this.energyCost_chart.chartControl.addLegend();
		this.energyCost_chart.chartControl.syncHeight();
		
		//refresh the chart and update the title
		this.energyCost_chart.refresh(); 
		appendChartTitle('energyCost_chart', '');
	}
	
});