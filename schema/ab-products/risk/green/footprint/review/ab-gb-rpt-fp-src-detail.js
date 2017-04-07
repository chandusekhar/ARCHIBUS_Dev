var abGbRptFpSrcDetailCtrl = View.createController('abGbRptFpSrcDetailCtrl', {
	selectionLabel: null,
	
	isTotalPerArea: false,
	isScope1: true,
	isScope2: true,
	isScope3: true,
	isOther: true,
	
	isBuildingReport: false,

	consoleRestriction: null,
	
	afterViewLoad: function(){
		this.setLabels();
	},
	
	setLabels: function(){
		$('label_emission_scope1').innerHTML = getMessage("label_scope1");
		$('label_emission_scope2').innerHTML = getMessage("label_scope2");
		$('label_emission_scope3').innerHTML = getMessage("label_scope3");
		$('label_emission_other').innerHTML = getMessage("label_other");
	},
	
	abGbRptFpSrcDetail_filter_onShow: function(){
		var console =  this.abGbRptFpSrcDetail_filter;
		var siteId;
		if(console.hasFieldMultipleValues("bl.site_id")){
			siteId = console.getFieldMultipleValues("bl.site_id");
		}else{
			siteId = console.getFieldValue("bl.site_id");
		}
		var blId;
		if(console.hasFieldMultipleValues("gb_fp_totals.bl_id")){
			blId = console.getFieldMultipleValues("gb_fp_totals.bl_id");
		}else{
			blId = console.getFieldValue("gb_fp_totals.bl_id");
		}
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
		var scenarioId;
		if(console.hasFieldMultipleValues("gb_fp_totals.scenario_id")){
			scenarioId = console.getFieldMultipleValues("gb_fp_totals.scenario_id");
		}else{
			scenarioId = console.getFieldValue("gb_fp_totals.scenario_id");
		}
		
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(calcYear)){
			var op = (typeof(calcYear) === 'object' && calcYear instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.calc_year", calcYear , op);
		}
		if(valueExistsNotEmpty(siteId)){
			var op = (typeof(siteId) === 'object' && siteId instanceof Array)?'IN':'=';
			restriction.addClause("bl.site_id", siteId , op);
		}
		this.isBuildingReport = valueExistsNotEmpty(blId);
		if(valueExistsNotEmpty(blId)){
			var op = (typeof(blId) === 'object' && blId instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.bl_id", blId , op);
		}
		if(valueExistsNotEmpty(scenarioId)){
			var op = (typeof(scenarioId) === 'object' && scenarioId instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.scenario_id", scenarioId , op);
		}
		
		if(!this.isEmissionSelected()){
			View.showMessage(getMessage('noEmissionSelected'));
			return;
		}
		
        this.consoleRestriction = restriction;
        
		// read other settings
		this.isTotalPerArea = document.getElementById("chk_vf_totals_per_area").checked;
		this.isScope1 = document.getElementById("chk_emission_scope1").checked;
		this.isScope2 = document.getElementById("chk_emission_scope2").checked;
		this.isScope3 = document.getElementById("chk_emission_scope3").checked;
		this.isOther = document.getElementById("chk_emission_other").checked;

   		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope1" , this.isScope1);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope2" , this.isScope2);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope3" , this.isScope3);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScopeOther" , this.isOther);
		
		this.abGbRptFpSrcDetail_scope.addParameter("isTotalPerArea", this.isTotalPerArea);
		this.abGbRptFpSrcDetail_scope.addParameter("isScopeGrid", true);
		this.abGbRptFpSrcDetail_scope.addParameter("isScope1", this.isScope1);
		this.abGbRptFpSrcDetail_scope.addParameter("isScope2", this.isScope2);
		this.abGbRptFpSrcDetail_scope.addParameter("isScope3", this.isScope3);
		this.abGbRptFpSrcDetail_scope.addParameter("isOther", this.isOther);
		this.abGbRptFpSrcDetail_scope.refresh(restriction);
		this.customizeGrid(this.abGbRptFpSrcDetail_scope);
		
		this.abGbRptFpSrcDetail_tabs.selectTab("abGbRptFpSrcDetail_scope_tab");
		
		this.abGbRptFpSrcDetail_source.addParameter("isTotalPerArea", this.isTotalPerArea);
		this.abGbRptFpSrcDetail_source.addParameter("isScopeGrid", false);
		this.abGbRptFpSrcDetail_source.addParameter("isScope1", this.isScope1);
		this.abGbRptFpSrcDetail_source.addParameter("isScope2", this.isScope2);
		this.abGbRptFpSrcDetail_source.addParameter("isScope3", this.isScope3);
		this.abGbRptFpSrcDetail_source.addParameter("isOther", this.isOther);
		this.abGbRptFpSrcDetail_source.refresh(restriction);
		this.customizeGrid(this.abGbRptFpSrcDetail_source);
	},
	
	
	/**
	 * Check if any 'Emission' checkbox is selected
	 */
	isEmissionSelected: function(){
		
		if($('chk_emission_scope1').checked){
			return true;
		}
		if($('chk_emission_scope2').checked){
			return true;
		}
		if($('chk_emission_scope3').checked){
			return true;
		}
		if($('chk_emission_other').checked){
			return true;
		}
		return false;
	},
	
	abGbRptFpSrcDetail_scope_afterRefresh: function(){
        this.afterRefreshCommon(this.abGbRptFpSrcDetail_scope);        
	},
	
	abGbRptFpSrcDetail_source_afterRefresh: function(){
        this.afterRefreshCommon(this.abGbRptFpSrcDetail_source);        
	},

	afterRefreshCommon: function(panel){
        
		panel.removeSorting();
		// last row is total we must chnage style
		var lastRow = panel.gridRows.get(panel.gridRows.length-1);
		lastRow.cells.each(function(cell){
			cell.dom.className =  'totals';
			cell.dom.style.textAlign = 'right';
		});

		setColumnTitle(panel, "gb_fp_totals.vf_total_emiss");
        
        if (this.isTotalPerArea) {                
            var perAreaTotals = this.abGbRptFp_perAreaTotals_ds.getRecord(this.consoleRestriction);
            var sumval = perAreaTotals.getValue("gb_fp_totals.sum_vf_total");
            var localSumVal = this.abGbRptFpSrcDetail_scope_ds.formatValue("gb_fp_totals.vf_total_emiss", sumval);
            var totSumCell = lastRow.cells.get(lastRow.cells.length-1);
            totSumCell.dom.innerHTML = localSumVal;
        }        
	},
	
	customizeGrid: function(grid){
		// show/hide column
		grid.showColumn("gb_fp_totals.bl_id", this.isBuildingReport);
		grid.update();
	}
});

function showDetails(row){
	row = row.row;
	var controller = View.controllers.get("abGbRptFpSrcDetailCtrl");
	var scope = row.getFieldValue("gb_fp_totals.vf_scope_type");
	var isScope1 = (scope == 's1_total');
	var isScope2 = (scope == 's2_total');
	var isScope3 = (scope == 's3_total');
	var isOther = (scope == 'other_total');
	var isTotalPerArea = controller.isTotalPerArea;
	var restriction = new Ab.view.Restriction();
	if(valueExistsNotEmpty(row.getFieldValue("bl.site_id"))){
		restriction.addClause("bl.site_id", row.getFieldValue("bl.site_id"), "=");
	}
	if(valueExistsNotEmpty(row.getFieldValue("gb_fp_totals.bl_id"))){
		restriction.addClause("gb_fp_totals.bl_id", row.getFieldValue("gb_fp_totals.bl_id"), "=");
	}
	if(valueExistsNotEmpty(row.getFieldValue("gb_fp_totals.calc_year"))){
		restriction.addClause("gb_fp_totals.calc_year", row.getFieldValue("gb_fp_totals.calc_year"), "=");
	}
	if(valueExistsNotEmpty(row.getFieldValue("gb_fp_totals.scenario_id"))){
		restriction.addClause("gb_fp_totals.scenario_id", row.getFieldValue("gb_fp_totals.scenario_id"), "=");
	}

	controller.abGbRptFpSrcDetail_source.addParameter("isTotalPerArea", isTotalPerArea);
	controller.abGbRptFpSrcDetail_source.addParameter("isScopeGrid", false);
	controller.abGbRptFpSrcDetail_source.addParameter("isScope1", isScope1);
	controller.abGbRptFpSrcDetail_source.addParameter("isScope2", isScope2);
	controller.abGbRptFpSrcDetail_source.addParameter("isScope3", isScope3);
	controller.abGbRptFpSrcDetail_source.addParameter("isOther", isOther);
	controller.abGbRptFpSrcDetail_source.refresh(restriction);
	controller.customizeGrid(controller.abGbRptFpSrcDetail_source);
	controller.abGbRptFpSrcDetail_tabs.selectTab("abGbRptFpSrcDetail_sources_tab");
}

function exportToXLS(button){
	try{
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		
		var controller = abGbRptFpSrcDetailCtrl;
		var panel = button.command.getParentPanel();
		var reportViewName = panel.viewDef.viewName + '.axvw';
		var reportTitle = convertFromXMLValue(Ab.view.View.title) +' -> '+ convertFromXMLValue(panel.title);
		var visibleFieldDefs = getVisibleFieldDefs(panel);

		var parameters = panel.getParametersForRefresh();
				
		var jobId = Workflow.startJob("AbRiskGreenBuilding-FootprintService-exportFootprintBySourceDetail",
				reportViewName, reportTitle, visibleFieldDefs, parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
		//XXX: finished or failed
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}
		
		if (jobStatus.jobFinished) {
			var url  = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}
		
		View.closeProgressBar();
	}
	catch(e){
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}