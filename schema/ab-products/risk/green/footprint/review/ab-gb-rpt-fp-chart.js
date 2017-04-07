var abGbRptFpChartCtrl = View.createController('abGbRptFpChartCtrl', {
	
	restriction : null,
	
	selectionLabels: null,
	 
	afterViewLoad: function(){
		this.abGbRptFpChart_chart.show(false, true);
	},
	

	
	abGbRptFpChart_filter_onShow: function(){
		var console = this.abGbRptFpChart_filter;
		var siteId = console.getFieldValue("bl.site_id");
		var blId = console.getFieldValue("gb_fp_totals.bl_id");
		if(!valueExistsNotEmpty(siteId) && !valueExistsNotEmpty(blId) ){
			var message = getMessage("err_values_not_set").replace('{0}', console.fields.get("bl.site_id").fieldDef.title).replace('{1}', console.fields.get("gb_fp_totals.bl_id").fieldDef.title);
			View.showMessage(message);
			return;
		}
		var calcYear;
		if(console.hasFieldMultipleValues("gb_fp_totals.vf_calc_year")){
			calcYear = console.getFieldMultipleValues("gb_fp_totals.vf_calc_year");
		}else{
			calcYear = console.getFieldValue("gb_fp_totals.vf_calc_year");
		}
		if(!valueExistsNotEmpty(calcYear)){
			var message = getMessage("err_value_not_set").replace('{0}', console.fields.get("gb_fp_totals.vf_calc_year").fieldDef.title);
			View.showMessage(message);
			return;
		}

		var scenarioId = console.getFieldValue("gb_fp_totals.scenario_id");
		if(!valueExistsNotEmpty(scenarioId)){
			var message = getMessage("err_value_not_set").replace('{0}', console.fields.get("gb_fp_totals.scenario_id").fieldDef.title);
			View.showMessage(message);
			return;
		}

		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(calcYear)){
			var op = (typeof(calcYear) === 'object' && calcYear instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.calc_year", calcYear, op);
		}
		if(valueExistsNotEmpty(scenarioId)){
			op = (typeof(scenarioId) === 'object' && scenarioId instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.scenario_id", scenarioId, op);
		}
		if(valueExistsNotEmpty(siteId)){
			op = (typeof(siteId) === 'object' && siteId instanceof Array) ? 'IN' : '=';
			restriction.addClause("bl.site_id", siteId, op);
		}
		if(valueExistsNotEmpty(blId)){
			op = (typeof(blId) === 'object' && blId instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.bl_id", blId, op);
		}
		this.abGbRptFpChart_chart.refresh(restriction);
		this.abGbRptFpChart_chart.show(true, true);
//		this.abGbRptFpChart_chart.enableAction("exportDOCX", true);
		this.abGbRptFpChart_site_data.refresh(restriction);
		this.restriction = restriction;
	},
	
	abGbRptFpChart_chart_afterRefresh: function(){
		this.selectionLabel = getFilterSelectionAsLabel(this.abGbRptFpChart_filter); 
		this.abGbRptFpChart_chart.setInstructions(this.selectionLabel);
	}
});


function displayChartDetails(ctx){
	var controller = View.controllers.get("abGbRptFpChartCtrl");
	var restriction = controller.restriction;
	var selectionLabel = controller.selectionLabel;
	View.openDialog("ab-gb-rpt-fp-chart-details.axvw", restriction, false, {
	    width: 1024, 
	    height: 1024, 
	    selectionLabel : selectionLabel
	});
	
}