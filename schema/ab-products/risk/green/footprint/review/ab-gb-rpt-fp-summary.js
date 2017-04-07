var abGbRptFpSummaryCtrl = View. createController('abGbRptFpSummaryCtrl', {
	
	afterViewLoad: function(){
		abGbRptFpSummaryCommonCtrl.filterPanel = this.abGbRptFpSummary_filter;
	},
	
	abGbRptFpSummary_filter_onShow: function(){
		// we must have at least some values
		var console = this.abGbRptFpSummary_filter;
		var siteId = console.getFieldValue("bl.site_id");
		var blId = console.getFieldValue("gb_fp_totals.bl_id");
		if(!valueExistsNotEmpty(siteId) && !valueExistsNotEmpty(blId) ){
			var message = getMessage("err_values_not_set").replace('{0}', console.fields.get("bl.site_id").fieldDef.title).replace('{1}', console.fields.get("gb_fp_totals.bl_id").fieldDef.title);
			View.showMessage(message);
			return;
		}

		var calcYear = console.getFieldValue("gb_fp_totals.vf_calc_year");
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
		var op = (typeof(calcYear) === 'object' && calcYear instanceof Array) ? 'IN' : '=';
		restriction.addClause("gb_fp_totals.calc_year", calcYear, op);
		op = (typeof(scenarioId) === 'object' && scenarioId instanceof Array) ? 'IN' : '=';
		restriction.addClause("gb_fp_totals.scenario_id", scenarioId, op);
		if(valueExistsNotEmpty(siteId)){
			op = (typeof(siteId) === 'object' && siteId instanceof Array) ? 'IN' : '=';
			restriction.addClause("bl.site_id", siteId, op);
		}
		if(valueExistsNotEmpty(blId)){
			op = (typeof(blId) === 'object' && blId instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.bl_id", blId, op);
		}
		
		this.abGbRptFpSummaryCommon_report.refresh(restriction);
		
	}
});