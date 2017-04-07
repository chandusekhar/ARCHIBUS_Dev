var energyCostLocController = View.extendController('energyCostLoc', energyCostBaseController, {
 	
	afterViewLoad: function() {
		this.initializeTree();
		
		this.hideConsoleRow(1); 
		
		this.hideConsoleField("select_bill_units");		
		this.hideConsoleField("bill_archive.bill_type_id"); 
		this.hideConsoleField("select_bill_units_gas");		
		 
		//In the tree only empty city records can be showed, since bl_id and site_id are mandatory fields in bill_archive table
		this.energyCostLoc_chart.addParameter('noCity', getMessage('msg_no_city_id'));
	}, 
	
	energyTree_onShowSelected: function() {
		
		//Apply to the chart the restrictions from the console and the tree		 
		this.energyCostLoc_chart.addParameter('finalRestriction', this.getFinalRestriction());
		
		//send to the chart the parameter to indicate if must be normalized by area or not
		if ($('energyCostLoc_normAreaCheck').checked) 
			this.energyCostLoc_chart.addParameter('selectedNormByArea', '1');
		else 
			this.energyCostLoc_chart.addParameter('selectedNormByArea', '0');
		
		//send to the chart the parameter indicating the level of detail for location to be showed in the chart
		this.detailOptionSelected = $('energyCostLoc_locDtlSelect').value;
		
		var locDtl = getLocationDetail(this.detailOptionSelected);
		this.energyCostLoc_chart.addParameter('locDtl', locDtl);

		//refresh the chart and update the title
		this.energyCostLoc_chart.refresh();
		appendChartTitle('energyCostLoc_chart', 'energyCostLoc_locDtlSelect', 'energyCostLoc_normAreaCheck');
		
	}
});



 