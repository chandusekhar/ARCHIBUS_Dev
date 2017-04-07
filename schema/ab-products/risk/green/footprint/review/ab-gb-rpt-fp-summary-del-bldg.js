var abGbRptFpSummaryDelBldgCtrl = View. createController('abGbRptFpSummaryDelBldgCtrl', {
	
	afterViewLoad: function(){
		abGbRptFpSummaryCommonCtrl.filterPanel = this.abGbRptFpSummaryDelBldg_filter;
		abGbRptFpSummaryCommonCtrl.isDeletedBldgs = true;
	},
	
	abGbRptFpSummaryDelBldg_filter_onShow: function(){
		// we must have at least some values
		var console = this.abGbRptFpSummaryDelBldg_filter;
		
		var blId = console.getFieldValue("gb_fp_totals.bl_id");
		if(!valueExistsNotEmpty(blId) ){
			var message = getMessage("err_value_not_set").replace('{0}', console.fields.get("gb_fp_totals.bl_id").fieldDef.title);
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
		if(valueExistsNotEmpty(blId)){
			op = (typeof(blId) === 'object' && blId instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.bl_id", blId, op);
		}
		
		this.abGbRptFpSummaryCommon_report.refresh(restriction);
	}
});