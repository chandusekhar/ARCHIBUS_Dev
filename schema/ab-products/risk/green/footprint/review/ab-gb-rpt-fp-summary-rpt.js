var abGbRptFpSummaryRptCtrl = View.createController('abGbRptFpSummaryRptCtrl', {
	groupByParameter: null,
	groupingValue: null,
	itemId: null,
	calcYear: null,
	isGroupPerArea: null,
	scenarioCode: null,
	
	afterViewLoad: function(){
		
		this.isGroupPerArea = this.view.parameters['isGroupPerArea'];
		this.setLabels();
		this.groupingValue = this.view.parameters['groupingValue'];
		this.groupByParameter = this.view.parameters['groupByParameter'];
		this.itemId = this.view.parameters['itemId'];
		this.calcYear = this.view.parameters['calcYear'];
		this.scenarioCode = this.view.parameters['scenarioCode'];
		
	},
	
	afterInitialDataFetch: function(){
		var separator = ' - ';
		var calcYear = this.groupingValue.slice(this.groupingValue.lastIndexOf(separator) + separator.length, this.groupingValue.length);
		var itemId = this.groupingValue.slice(0, this.groupingValue.lastIndexOf(separator));
		var restriction = new Ab.view.Restriction();
		if(this.groupByParameter == 'site'){
			restriction.addClause('bl.site_id', itemId, '=');
		}else{
			restriction.addClause('gb_fp_totals.bl_id', itemId, '=');
		}
		restriction.addClause('gb_fp_totals.calc_year', calcYear, '=');
		this.abGbRptFp_summary.addParameter("groupBy", this.groupByParameter);
		this.abGbRptFp_summary.addParameter("isGroupPerArea", this.isGroupPerArea);
		this.abGbRptFp_summary.refresh(restriction);
	},
	/**
	 * set labels for custom field
	 */
	setLabels: function(){
		
		var unit_label = (this.isGroupPerArea == 'true') ? getMessage('label_unit_kgco2e') : getMessage('label_unit_mtco2e');
		
		$('scope1_top').innerHTML = getMessage('label_scope1');
		$('scope1_bottom').innerHTML = getMessage('label_scope1_total');
		$('scope1_bottom_unit').innerHTML = "&nbsp;(" + unit_label +")";
		$('scope2_top').innerHTML = getMessage('label_scope2');
		$('scope2_bottom').innerHTML = getMessage('label_scope2_total');
		$('scope2_bottom_unit').innerHTML = "&nbsp;(" + unit_label+")";
		$('scope_other_top').innerHTML = getMessage('label_scope_other');
		$('scope_other_bottom').innerHTML = getMessage('label_scope_other_total');
		$('scope_other_bottom_unit').innerHTML = "&nbsp;(" + unit_label+")";
		$('total_excl3').innerHTML = getMessage('label_total_excl3');
		$('total_excl3_unit').innerHTML = "&nbsp;(" + unit_label+")";
		$('scope3_top').innerHTML = getMessage('label_scope3');
		$('scope3_bottom').innerHTML = getMessage('label_scope3_total');
		$('scope3_bottom_unit').innerHTML = "&nbsp;(" + unit_label+")";
		$('total_incl3').innerHTML = getMessage('label_total_incl3');
		$('total_incl3_unit').innerHTML = "&nbsp;(" + unit_label+")";
	},
	/**
	 * set some field values after refresh
	 */
	abGbRptFp_summary_afterRefresh: function(){
		var selectionLabel =  getMessage("label_" + this.groupByParameter) + ": " + this.itemId;
		selectionLabel += "; "+getMessage("label_year") + ": " + this.calcYear;
		if(this.scenarioCode){
			selectionLabel += "; "+getMessage("label_scenario") + ": " + this.scenarioCode;
		}
		
		this.abGbRptFp_summary.setInstructions(selectionLabel);
		var ds = this.abGbRptFp_summary.getDataSource();
		var record = this.abGbRptFp_summary.record;
		// set vf_s1_co_transp_value 
		//var coRoad = ds.parseValue("gb_fp_totals.vf_s1_co_road", record.getValue("gb_fp_totals.vf_s1_co_road"), true);
		//var coAirc = ds.parseValue("gb_fp_totals.vf_s1_co_airc", record.getValue("gb_fp_totals.vf_s1_co_airc"), true);
		var coRoad = record.getValue("gb_fp_totals.vf_s1_co_road");
		var coAirc = record.getValue("gb_fp_totals.vf_s1_co_airc");
		var coTotal = parseFloat(coRoad) + parseFloat(coAirc);
		var coHTML = ds.formatValue("gb_fp_totals.vf_s1_co_road", (coTotal.toFixed(1)).toString(), true);
		coHTML += " ( "+ getMessage('label_road')+": " + ds.formatValue("gb_fp_totals.vf_s1_co_road", record.getValue("gb_fp_totals.vf_s1_co_road"), true) +"; ";
		coHTML += getMessage('label_airc')+": " + ds.formatValue("gb_fp_totals.vf_s1_co_airc", record.getValue("gb_fp_totals.vf_s1_co_airc"), true) +" )";
		$('vf_s1_co_transp_value').innerHTML = coHTML;
		
		//vf_s3_waste_value
		//var wasteSol = ds.parseValue("gb_fp_totals.vf_s3_waste_sol", record.getValue("gb_fp_totals.vf_s3_waste_sol"), true);
		//var wasteLiq = ds.parseValue("gb_fp_totals.vf_s3_waste_liq", record.getValue("gb_fp_totals.vf_s3_waste_liq"), true);
		var wasteSol = record.getValue("gb_fp_totals.vf_s3_waste_sol");
		var wasteLiq = record.getValue("gb_fp_totals.vf_s3_waste_liq");
		var wasteTotal  = parseFloat(wasteSol)+ parseFloat(wasteLiq);
		var wasteHTML = ds.formatValue("gb_fp_totals.vf_s3_waste_sol", (wasteTotal.toFixed(1)).toString(), true);
		wasteHTML += " ( "+ getMessage('label_solid')+": " + ds.formatValue("gb_fp_totals.vf_s3_waste_sol", record.getValue("gb_fp_totals.vf_s3_waste_sol"), true) +"; ";
		wasteHTML += getMessage('label_liquid')+": " + ds.formatValue("gb_fp_totals.vf_s3_waste_liq", record.getValue("gb_fp_totals.vf_s3_waste_liq"), true) +" )";
		$('vf_s3_waste_value').innerHTML = wasteHTML;
		
		//vf_s3_em_value
		//var emRoad = ds.parseValue("gb_fp_totals.vf_s3_em_road", record.getValue("gb_fp_totals.vf_s3_em_road"), true);
		//var emAirc = ds.parseValue("gb_fp_totals.vf_s3_em_air", record.getValue("gb_fp_totals.vf_s3_em_air"), true);
		//var emRail = ds.parseValue("gb_fp_totals.vf_s3_em_rail", record.getValue("gb_fp_totals.vf_s3_em_rail"), true);
		var emRoad = record.getValue("gb_fp_totals.vf_s3_em_road");
		var emAirc = record.getValue("gb_fp_totals.vf_s3_em_air");
		var emRail = record.getValue("gb_fp_totals.vf_s3_em_rail");
		var emTotal  = parseFloat(emRoad)+ parseFloat(emAirc)+ parseFloat(emRail);
		var emHTML = ds.formatValue("gb_fp_totals.vf_s3_em_road", (emTotal.toFixed(1)).toString(), true);
		emHTML += " ( "+ getMessage('label_road')+": " + ds.formatValue("gb_fp_totals.vf_s3_em_road", record.getValue("gb_fp_totals.vf_s3_em_road"), true) +"; ";
		emHTML += getMessage('label_rail')+": " + ds.formatValue("gb_fp_totals.vf_s3_em_rail", record.getValue("gb_fp_totals.vf_s3_em_rail"), true) +"; ";
		emHTML += getMessage('label_airc')+": " + ds.formatValue("gb_fp_totals.vf_s3_em_air", record.getValue("gb_fp_totals.vf_s3_em_air"), true) +" )";
		$('vf_s3_em_value').innerHTML = emHTML;
	}
	
})