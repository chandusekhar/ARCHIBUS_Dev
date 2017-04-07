
var energyCostByYearController = View.extendController('energyCostByYearController', energyCostBaseController, {
	
	afterViewLoad: function() {
		this.initializeTree();
		this.hideConsoleRow(1); 
		//this.hideConsoleField("bill_archive.time_period.from");
		this.hideConsoleField("energyCostLoc_locDtlSelect");
		this.hideConsoleField("bill_archive.bill_type_id");  
		this.hideConsoleField("select_bill_units");  
		// hide the from and presume always 12 months before the end period
		this.hideConsoleField("bill_archive.time_period.from");  
		this.hideConsoleRow(6); 
		
		var chart = this.energyCost_chart.chartControl.chart.canvas;
		// adjust the balloon for previous year
		chart.graphs[0].balloonFunction = this.adjustBalloonText; 	 
		chart.valueAxes[0].title = getMessage("axisTitle");
		this.showOnLoad = false;
	},
	
	initializeDefaults: function() {
		var record = this.lastBillArchivePeriodDs.getRecord();
		if (record != null) {
			this.energyConsole.setFieldValue("bill_archive.time_period.to", record.getValue("bill_archive.time_period"));
		}
	},
	
	energyTree_onShowSelected: function() {
		// check the required bill type
		if (this.energyConsole.getFieldValue("bill_archive.bill_type_ids") == '') {
			View.showMessage(getMessage("selectRequiredBillType"));
			return;
		}		
		
		// set the previous year in the from field
		if (this.setPreviousYearFromField()) {

			this.energyCost_chart.addParameter('finalRestriction', this.getFinalRestriction());
			this.energyCost_chart.addParameter('previousRestriction', this.getPreviousRestriction()); 
			
			// force to add legend
			this.energyCost_chart.chartControl.addLegend();
			this.energyCost_chart.chartControl.syncHeight();
			
			//refresh the chart and update the title
			this.energyCost_chart.refresh();
		} 
	} 
	
});