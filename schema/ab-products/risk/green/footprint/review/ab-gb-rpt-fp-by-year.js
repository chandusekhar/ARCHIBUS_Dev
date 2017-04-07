var abGbRptFpByYearCtrl = View.createController('abGbRptFpByYearCtrl', {
	
	afterInitialDataFetch: function(){
		this.abGbRptFpByYear_chart.setDataAxisTitle(getMessage('dataAxisTitle'));
	},
	
	abGbRptFpByYear_filter_onShow: function(){
		// we must have at least some values
		var console = this.abGbRptFpByYear_filter;
		var siteId = console.getFieldValue("bl.site_id");
		var blId = console.getFieldValue("gb_fp_totals.bl_id");
		if(!valueExistsNotEmpty(siteId) && !valueExistsNotEmpty(blId) ){
			var message = getMessage("err_values_not_set").replace('{0}', console.fields.get("bl.site_id").fieldDef.title).replace('{1}', console.fields.get("gb_fp_totals.bl_id").fieldDef.title);
			View.showMessage(message);
			return;
		}
		var scenarioId = console.getFieldValue("gb_fp_totals.scenario_id");
		if(!valueExistsNotEmpty(scenarioId)){
			var message = getMessage("err_value_not_set").replace('{0}', console.fields.get("gb_fp_totals.scenario_id").fieldDef.title);
			View.showMessage(message);
			return;
		}
		
		var areDatesValid = validateDates(this.abGbRptFpByYear_filter, "gb_fp_totals.vf_from_year", "gb_fp_totals.vf_to_year");
		if(!areDatesValid){
			return;
		}
		
		var fromYear;
		fromYear = console.getFieldValue("gb_fp_totals.vf_from_year");
		
		var toYear;
		toYear = console.getFieldValue("gb_fp_totals.vf_to_year");
		
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(fromYear)){
			restriction.addClause("gb_fp_totals.calc_year", fromYear, '>=');
		}
		if(valueExistsNotEmpty(toYear)){
			restriction.addClause("gb_fp_totals.calc_year", toYear, '<=');
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
		
		this.abGbRptFpByYear_chart.refresh(restriction);
		this.abGbRptFpByYear_chart.enableAction("exportDOCX", true);
		this.abGbRptFpByYear_data.refresh(restriction);
	},
	
	abGbRptFpByYear_chart_afterRefresh: function(){
		var selectionLabel =  getFilterSelectionAsLabel(this.abGbRptFpByYear_filter); 
		this.abGbRptFpByYear_chart.setInstructions(selectionLabel);
	}
});