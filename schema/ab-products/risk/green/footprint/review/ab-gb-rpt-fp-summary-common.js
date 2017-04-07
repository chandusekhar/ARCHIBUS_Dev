var abGbRptFpSummaryCommonCtrl = View. createController('abGbRptFpSummaryCommonCtrl', {
	
	filterPanel: null,
	
	isDeletedBldgs: false,
	
	afterViewLoad: function(){
		this.setLabels();
	},
	
	/**
	 * set labels for custom field
	 */
	setLabels: function(){
		$('scope1_top').innerHTML = getMessage('label_scope1');
		$('scope1_bottom').innerHTML = getMessage('label_scope1_total');
		$('scope1_bottom_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
		$('scope2_top').innerHTML = getMessage('label_scope2');
		$('scope2_bottom').innerHTML = getMessage('label_scope2_total');
		$('scope2_bottom_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
		$('scope_other_top').innerHTML = getMessage('label_scope_other');
		$('scope_other_bottom').innerHTML = getMessage('label_scope_other_total');
		$('scope_other_bottom_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
		$('total_excl3').innerHTML = getMessage('label_total_excl3');
		$('total_excl3_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
		$('scope3_top').innerHTML = getMessage('label_scope3');
		$('scope3_bottom').innerHTML = getMessage('label_scope3_total');
		$('scope3_bottom_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
		$('total_incl3').innerHTML = getMessage('label_total_incl3');
		$('total_incl3_unit').innerHTML = "&nbsp;(" + getMessage('label_unit_mtco2e')+")";
	},
	
	/**
	 * set some field values after refresh
	 */
	abGbRptFpSummaryCommon_report_afterRefresh: function(){
		var selectionLabel = getFilterSelectionAsLabel(this.filterPanel);
		this.abGbRptFpSummaryCommon_report.setInstructions(selectionLabel);
		var ds = this.abGbRptFpSummaryCommon_report.getDataSource();
		var record = this.abGbRptFpSummaryCommon_report.record;
		// set vf_s1_co_transp_value 
		//var coRoad = ds.parseValue("gb_fp_totals.vf_s1_co_road", record.getValue("gb_fp_totals.vf_s1_co_road"), true);
		//var coAirc = ds.parseValue("gb_fp_totals.vf_s1_co_airc", record.getValue("gb_fp_totals.vf_s1_co_airc"), true);
		var coRoad = record.getValue("gb_fp_totals.vf_s1_co_road");
		var coAirc = record.getValue("gb_fp_totals.vf_s1_co_airc");
		var coTotal  = parseFloat(coRoad)+ parseFloat(coAirc);
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
	},
	
	/**
	 * Listener for 'generateReport' action from 'abGbRptFpSummaryCommon_report' panel - generate a paginated report
	 */
	abGbRptFpSummaryCommon_report_onGenerateReport:function(){
		
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		
		
		//construct a restriction based on filter console selection
		var consoleRestr = "1=1";
		
		if(this.isDeletedBldgs){
			printableRestrictions.push({'title': getMessage("buildings"), 'value': getMessage("deletedBuildingsOnly")});
		} else {
			if(this.filterPanel.getFieldValue('bl.site_id')){
				consoleRestr += " and gb_fp_totals.bl_id in ( select bl_id from bl where bl.site_id = '" + this.filterPanel.getFieldValue('bl.site_id') + "')";
				printableRestrictions.push({'title': getMessage('siteId'), 'value': this.filterPanel.getFieldValue('bl.site_id')});
			}
		}
		
		if(this.filterPanel.getFieldValue('gb_fp_totals.vf_calc_year')){
			consoleRestr += " and gb_fp_totals.calc_year = '" + this.filterPanel.getFieldValue('gb_fp_totals.vf_calc_year') + "'";
			printableRestrictions.push({'title': getMessage('calcYear'), 'value': this.filterPanel.getFieldValue('gb_fp_totals.vf_calc_year')});
		}
		
		if(this.filterPanel.getFieldValue('gb_fp_totals.bl_id')){
			consoleRestr += " and gb_fp_totals.bl_id = '" + this.filterPanel.getFieldValue('gb_fp_totals.bl_id') + "'";
			printableRestrictions.push({'title': getMessage('blId'), 'value': this.filterPanel.getFieldValue('gb_fp_totals.bl_id')});
		}
		
		if(this.filterPanel.getFieldValue('gb_fp_totals.scenario_id')){
			consoleRestr += " and gb_fp_totals.scenario_id = '" + this.filterPanel.getFieldValue('gb_fp_totals.scenario_id') + "'";
			printableRestrictions.push({'title': getMessage('scId'), 'value': this.filterPanel.getFieldValue('gb_fp_totals.scenario_id')});
		}
		
		var restriction = {'abGbRptFpSummary_report_ds':consoleRestr};
		
		
		// set parameters for paginated report datasouce
		var parameters = {
				 'scope1_label':getMessage('label_scope1'), 
				 'scope2_label':getMessage('label_scope2'), 
				 'scope3_label':getMessage('label_scope3'), 
				 'other_label':getMessage('label_scope_other'), 
				 'printRestriction':true, 
				 'printableRestriction':printableRestrictions
				 };
		
		
		
		
		//generate paginated report
		View.openPaginatedReportDialog('ab-gb-rpt-fp-summary-pgrpt.axvw',restriction, parameters);
	}
});