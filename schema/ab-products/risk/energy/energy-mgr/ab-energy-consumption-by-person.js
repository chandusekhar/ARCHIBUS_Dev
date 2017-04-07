
var energyConsumptionByPersonController = View.extendController('energyConsumptionByPersonController', energyCostBaseController, {
	
	viewPanels: [
	   "energyConsumption_chart"
	],
	
	afterViewLoad: function() {
		this.initializeTree(); 
		this.initializeBillUnitsOptions();
		this.showOnLoad(false); 
		appendChartTitle('energyConsumption_chart', 'energyCostLoc_locDtlSelect');
		
		this.hideConsoleRow(6); 
		this.hideConsoleField("bill_archive.bill_type_ids"); 
		this.hideConsoleRow(1);  		
	},
	
	energyTree_onShowSelected: function() {
		if (this.energyConsole.getFieldValue("bill_archive.bill_type_id") == '') { 
			//this.energyConsole.setFieldValue("bill_archive.bill_type_id", "ELECTRIC");		
			View.showMessage(getMessage('selectRequiredBillType'));
			return;
		}
		// the the unit conversion
		this.setBillUnitsParameter(); 
		// add the restriction
		this.energyConsumption_chart.addParameter('finalRestriction', this.getFinalRestriction());
		
		//send to the chart the parameter indicating the level of detail for location to be showed in the chart
		this.detailOptionSelected = $('energyCostLoc_locDtlSelect').value;
		var locDtl = getLocationDetail(this.detailOptionSelected);
		this.energyConsumption_chart.addParameter('locDtl', locDtl);

		//refresh the chart and update the title
		this.energyConsumption_chart.refresh();
		appendChartTitle('energyConsumption_chart', 'energyCostLoc_locDtlSelect');
	} 
	
}); 
 