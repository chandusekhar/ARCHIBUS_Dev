// overwrite chart control getParameters function
Ab.chart.ChartControl.prototype.getParameters = function(restriction){
	
	var isScope1 = true;
	var isScope2 = true;
	var isScope3 = true;
	var isOther = true;
	var objCheckboxScope1 = document.getElementById("emission_scopes_scope1");
	if(objCheckboxScope1){
		isScope1 = objCheckboxScope1.checked;
	}
	var objCheckboxScope2 = document.getElementById("emission_scopes_scope2");
	if(objCheckboxScope2){
		isScope2 = objCheckboxScope2.checked;
	}
	var objCheckboxScope3 = document.getElementById("emission_scopes_scope3");
	if(objCheckboxScope3){
		isScope3 = objCheckboxScope3.checked;
	}
	var objCheckboxOther = document.getElementById("emission_scopes_other");
	if(objCheckboxOther){
		isOther = objCheckboxOther.checked;
	}
	
	var viewName = this.configObj.getConfigParameter('viewDef');
	var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
	var dataAxis = this.configObj.getConfigParameter('dataAxis');
	var dataAxisNew = [];

	// update chart dataAxis
	this.dataAxis = new Ext.util.MixedCollection();
    if (valueExists(dataAxis) && dataAxis.length > 0) {
   		for (var i = 0; i < dataAxis.length; i++) {
   			if( (dataAxis[i].field == 'vf_scope1' && isScope1) || (dataAxis[i].field == 'vf_scope2' && isScope2) ||
   					(dataAxis[i].field == 'vf_scope3' && isScope3) || (dataAxis[i].field == 'vf_other' && isOther)){
   				dataAxisNew.push(dataAxis[i]);
	   			var _dataAxis = new Ab.chart.ChartAxis(this.dataSourceId, dataAxis[i]);
	            this.dataAxis.add(_dataAxis.id, _dataAxis);
   			}
	    }
    }

	
	var  parameters = {
	           version: '2',
	           viewName: viewName,
	           groupingAxis: toJSON(groupingAxis),
	           dataAxis: toJSON(dataAxisNew),
	           type: 'chart'
	 };
	 
	 var secondaryGroupingAxis = this.configObj.getConfigParameter('secondaryGroupingAxis');
	 if (valueExists(secondaryGroupingAxis)) {
         parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
     }
     
     if (valueExists(restriction)) {
         parameters.restriction = toJSON(restriction);
     }
     
	 Ext.apply(parameters, this.parameters);
	 
     // we must load the new data into flash control
	 this.loadChartSWFIntoFlash();
	 
	 return parameters;
}

var abGbRptFpChartCompareCtrl = View.createController('abGbRptFpChartCompareCtrl', {
	selectionLabel: null,
	groupByParameter: null,
	curRestriction: null,
    
	// used to set parameters for generating XLS
	parameters: {},
	
	afterViewLoad: function(){
		this.setLabels();
	},
	
	
	
	afterInitialDataFetch: function(){
		this.abGbRptFpChartCompare_totalEmissionChart.show(false, true);
		this.abGbRptFpChartCompare_totalEmissionChart.setDataAxisTitle(getMessage('totalEmissDataAxisTitle'));
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.show(false, true);
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.setDataAxisTitle(getMessage('totalEmissPerAreaDataAxisTitle'));
	},
	
	abGbRptFpChartCompare_totalPerAreaReport_afterRefresh: function(){
		var totalPerAreaReport = this.abGbRptFpChartCompare_totalPerAreaReport;
		var totalFields = ["gb_fp_totals.sum_vf_total", "gb_fp_totals.sum_vf_scope1_total", "gb_fp_totals.sum_vf_scope2_total", "gb_fp_totals.sum_vf_scope3_total", "gb_fp_totals.sum_vf_other_total"];
        
        var perAreaTotals = this.abGbRptFp_perAreaTotals_ds.getRecord(this.curRestriction);
        
		totalPerAreaReport.totals = new Ab.data.Record();		
                
        for (var i=0; i<totalFields.length; i++) {
		  totalPerAreaReport.totals.setValue(totalFields[i], perAreaTotals.getValue(totalFields[i]));            
        }
		
		totalPerAreaReport.totals.localizedValues =
			this.abGbRptFpChartCompare_dataReport_ds.formatValues(totalPerAreaReport.totals.values,true,true);
                    
        for (var i=0; i<totalFields.length; i++) {
            totalPerAreaReport.totals.localizedValues[totalFields[i]] = this.abGbRptFpChartCompare_dataReport_ds.formatValue(totalFields[i].replace('.sum_','.'), totalPerAreaReport.totals.getValue(totalFields[i]));
        }
        
		if(!valueExistsNotEmpty(document.getElementById("abGbRptFpChartCompare_totalPerAreaReport_totals"))){
			totalPerAreaReport.buildTotalsFooterRow(totalPerAreaReport.tableFootElement);
		}
		
	},
	
	setLabels: function(){
		$('label_emission_scopes_scope1').innerHTML = getMessage("label_scope1");
		$('label_emission_scopes_scope2').innerHTML = getMessage("label_scope2");
		$('label_emission_scopes_scope3').innerHTML = getMessage("label_scope3");
		$('label_emission_scopes_other').innerHTML = getMessage("label_other");
	},
	
	abGbRptFpChartCompare_filter_onShow: function(){
		var console = this.abGbRptFpChartCompare_filter;
		var siteId = console.getFieldValue("bl.site_id");
		var blId = console.getFieldValue("gb_fp_totals.bl_id");
		if(!valueExistsNotEmpty(siteId) && !valueExistsNotEmpty(blId) ){
			var message = getMessage("err_values_not_set").replace('{0}', console.fields.get("bl.site_id").fieldDef.title).replace('{1}', console.fields.get("gb_fp_totals.bl_id").fieldDef.title);
			View.showMessage(message);
			return;
		}
		
		if(!this.isEmissionSelected()){
			View.showMessage(getMessage('noEmissionSelected'));
			return;
		}
		
		var calcYear;
		if(console.hasFieldMultipleValues("gb_fp_totals.vf_calc_year")){
			calcYear = console.getFieldMultipleValues("gb_fp_totals.vf_calc_year");
		}else{
			calcYear = console.getFieldValue("gb_fp_totals.vf_calc_year");
		}
		if(console.hasFieldMultipleValues("gb_fp_totals.scenario_id")){
			scenarioId = console.getFieldMultipleValues("gb_fp_totals.scenario_id");
		}else{
			scenarioId = console.getFieldValue("gb_fp_totals.scenario_id");
		}
		if(console.hasFieldMultipleValues("gb_fp_totals.bl_id")){
			blId = console.getFieldMultipleValues("gb_fp_totals.bl_id");
		}else{
			blId = console.getFieldValue("gb_fp_totals.bl_id");
		}
		if(console.hasFieldMultipleValues("bl.site_id")){
			siteId = console.getFieldMultipleValues("bl.site_id");
		}else{
			siteId = console.getFieldValue("bl.site_id");
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
			this.groupByParameter = "site";
			op = (typeof(siteId) === 'object' && siteId instanceof Array) ? 'IN' : '=';
			restriction.addClause("bl.site_id", siteId, op);
		}
		if(valueExistsNotEmpty(blId)){
			this.groupByParameter = "bl";
			op = (typeof(blId) === 'object' && blId instanceof Array) ? 'IN' : '=';
			restriction.addClause("gb_fp_totals.bl_id", blId, op);
		}
		this.selectionLabel = getFilterSelectionAsLabel(console);
		var isScope1 = false;
		var isScope2 = false;
		var isScope3 = false;
		var isScopeOther = false;
		var scopesLabel = console.fields.get("emission_scopes").fieldDef.title + ":";
		if(document.getElementById('emission_scopes_scope1').checked){
			isScope1 = true;
			scopesLabel += getMessage("label_scope1") + ", ";
		}
		if(document.getElementById('emission_scopes_scope2').checked){
			isScope2 = true;
			scopesLabel += getMessage("label_scope2") + ", ";
		}
		if(document.getElementById('emission_scopes_scope3').checked){
			isScope3 = true;
			scopesLabel += getMessage("label_scope3") + ", ";
		}
		if(document.getElementById('emission_scopes_other').checked){
			isScopeOther = true
			scopesLabel += getMessage("label_other") + ", ";
		}
		if(scopesLabel.lastIndexOf(", ") ==  scopesLabel.length -2){
			scopesLabel = scopesLabel.slice(0, scopesLabel.length - 2);
		}
		this.selectionLabel += "; " + scopesLabel;
		
		this.curRestriction = restriction;
        
		this.abGbRptFpChartCompare_totalEmissionChart.addParameter("groupBy", this.groupByParameter);
		this.abGbRptFpChartCompare_totalEmissionChart.refresh(restriction);
		this.abGbRptFpChartCompare_totalEmissionChart.show(true, true);
		
		this.abGbRptFpChartCompare_totalReport.addParameter("isGroupPerArea", false);
		
		this.abGbRptFpChartCompare_totalReport.addParameter("isScope1" , isScope1);
		this.abGbRptFpChartCompare_totalReport.addParameter("isScope2" , isScope2);
		this.abGbRptFpChartCompare_totalReport.addParameter("isScope3" , isScope3);
		this.abGbRptFpChartCompare_totalReport.addParameter("isScopeOther" , isScopeOther);
		this.abGbRptFpChartCompare_totalReport.refresh(restriction);
		this.abGbRptFpChartCompare_totalReport.showColumn("gb_fp_totals.vf_scope1_total", isScope1);
		this.abGbRptFpChartCompare_totalReport.showColumn("gb_fp_totals.vf_scope2_total", isScope2);
		this.abGbRptFpChartCompare_totalReport.showColumn("gb_fp_totals.vf_scope3_total", isScope3);
		this.abGbRptFpChartCompare_totalReport.showColumn("gb_fp_totals.vf_other_total", isScopeOther);
		this.abGbRptFpChartCompare_totalReport.update();
		
		
		
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.addParameter("groupBy", this.groupByParameter);
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.refresh(restriction);
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.show(true, true);
		this.abGbRptFpChartCompare_totalPerAreaReport.addParameter("isGroupPerArea", true);
		this.parameters.isGroupPerArea = true;
		this.abGbRptFpChartCompare_totalPerAreaReport.addParameter("isScope1" , isScope1);
		this.parameters.isScope1 = isScope1;
		this.abGbRptFpChartCompare_totalPerAreaReport.addParameter("isScope2" , isScope2);
		this.parameters.isScope2 = isScope2;
		this.abGbRptFpChartCompare_totalPerAreaReport.addParameter("isScope3" , isScope3);
		this.parameters.isScope3 = isScope3;
		this.abGbRptFpChartCompare_totalPerAreaReport.addParameter("isScopeOther" , isScopeOther);
		this.parameters.isScopeOther = isScopeOther;

   		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope1" , isScope1);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope2" , isScope2);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope3" , isScope3);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScopeOther" , isScopeOther);
        
		this.abGbRptFpChartCompare_totalPerAreaReport.refresh(restriction);
		this.abGbRptFpChartCompare_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope1_total", isScope1);
		this.abGbRptFpChartCompare_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope2_total", isScope2);
		this.abGbRptFpChartCompare_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope3_total", isScope3);
		this.abGbRptFpChartCompare_totalPerAreaReport.showColumn("gb_fp_totals.vf_other_total", isScopeOther);
		this.abGbRptFpChartCompare_totalPerAreaReport.update();
		
	},
	
	/**
	 * Check if any 'Emission' checkbox is selected
	 */
	isEmissionSelected: function(){
		
		if($('emission_scopes_scope1').checked){
			return true;
		}
		if($('emission_scopes_scope2').checked){
			return true;
		}
		if($('emission_scopes_scope3').checked){
			return true;
		}
		if($('emission_scopes_other').checked){
			return true;
		}
		return false;
	},
	
	abGbRptFpChartCompare_totalEmissionChart_afterRefresh: function(){
		this.abGbRptFpChartCompare_totalEmissionChart.setInstructions(this.selectionLabel);
		this.abGbRptFpChartCompare_totalEmissionChart.enableAction("exportDOCX", true);
	},
		
	abGbRptFpChartCompare_totalEmissionPerAreaChart_afterRefresh: function(){
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.setInstructions(this.selectionLabel);
		this.abGbRptFpChartCompare_totalEmissionPerAreaChart.enableAction("exportDOCX", true);
	}
});


function openSummary(ctx){
	var controller = View.controllers.get('abGbRptFpChartCompareCtrl');
	var selectedChartData = ctx.selectedChartData;
	var groupingValue = selectedChartData['gb_fp_totals.vf_grouping_value'];
	var itemId = groupingValue.slice(0, groupingValue.lastIndexOf(' - '));
	var calcYear = groupingValue.slice(groupingValue.lastIndexOf(' - ')+3, groupingValue.length);
	var isGroupPerArea = (ctx.chart.id == 'abGbRptFpChartCompare_totalEmissionChart') ? 'false' : 'true';
	var scenarioCode = controller.abGbRptFpChartCompare_filter.getFieldValue("gb_fp_totals.scenario_id");
	
	View.openDialog("ab-gb-rpt-fp-summary-rpt.axvw", null, false, {
	    width: 800, 
	    height: 600, 
	    closeButton: true,
	    maximize: false,
	    groupingValue: groupingValue,
	    groupByParameter: controller.groupByParameter,
	    itemId: itemId,
	    calcYear: calcYear,
	    isGroupPerArea: isGroupPerArea,
		scenarioCode: scenarioCode
	});
	
	
}