var abGbRptFpByYearCompCtrl = View.createController('abGbRptFpByYearCompCtrl', {
	
	selectionLabel: null,
	curRestriction: null,
	
	parameters: {},
	
	afterViewLoad: function(){
		this.setLabels();
	},
	
	afterInitialDataFetch: function(){
		this.abGbRptFpYearComp_totalChart.show(false, true);
		this.abGbRptFpYearComp_totalPerAreaChart.show(false, true);
	},
	
	setLabels: function(){
		$('label_emission_scope1').innerHTML = getMessage("label_scope1");
		$('label_emission_scope2').innerHTML = getMessage("label_scope2");
		$('label_emission_scope3').innerHTML = getMessage("label_scope3");
		$('label_emission_other').innerHTML = getMessage("label_other");
	},
	
	abGbRptFpYearComp_filter_onShow: function(){
		var console = this.abGbRptFpYearComp_filter;
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
		var areDatesValid = validateDates(this.abGbRptFpYearComp_filter, "gb_fp_totals.vf_from_year", "gb_fp_totals.vf_to_year");
		if(!areDatesValid){
			return;
		}
		
		var fromYear;
		var toYear;
		var scenarioId;
		fromYear = console.getFieldValue("gb_fp_totals.vf_from_year");
		toYear = console.getFieldValue("gb_fp_totals.vf_to_year");
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
		
		var consoleRestriction = "";
		if(valueExistsNotEmpty(fromYear)){
			consoleRestriction += "AND gb_fp_totals.calc_year >= "+ fromYear;
		}
		
		if(valueExistsNotEmpty(toYear)){
			consoleRestriction += "AND gb_fp_totals.calc_year <= "+ toYear;
		}

		if(valueExistsNotEmpty(scenarioId)){
			if(typeof(scenarioId) === 'object' && scenarioId instanceof Array){
				consoleRestriction += "AND gb_fp_totals.scenario_id IN ('"+ scenarioId.join("','") +"')";
			}else{
				consoleRestriction += "AND gb_fp_totals.scenario_id = '"+ scenarioId+"'";
			}
		}
		var groupByParameter;
		if(valueExistsNotEmpty(siteId)){
			groupByParameter = "site";
			if(typeof(siteId) === 'object' && siteId instanceof Array){
				consoleRestriction += "AND bl.site_id IN ('"+ siteId.join("','") +"')";
			}else{
				consoleRestriction += "AND bl.site_id = '"+ siteId+"'";
			}
		}

		if(valueExistsNotEmpty(blId)){
			groupByParameter = "bl";
			if(typeof(blId) === 'object' && blId instanceof Array){
				consoleRestriction += "AND gb_fp_totals.bl_id IN ('"+ blId.join("','") +"')";
			}else{
				consoleRestriction += "AND gb_fp_totals.bl_id = '"+ blId+"'";
			}
		}
		this.selectionLabel = getFilterSelectionAsLabel(console);
		var isScope1 = false;
		var isScope2 = false;
		var isScope3 = false;
		var isScopeOther = false;
		var scopesLabel = console.fields.get("vf_emission_scope").fieldDef.title + ":";
		if(document.getElementById('chk_emission_scope1').checked){
			isScope1 = true;
			scopesLabel += getMessage("label_scope1") + ", ";
		}
		if(document.getElementById('chk_emission_scope2').checked){
			isScope2 = true;
			scopesLabel += getMessage("label_scope2") + ", ";
		}
		if(document.getElementById('chk_emission_scope3').checked){
			isScope3 = true;
			scopesLabel += getMessage("label_scope3") + ", ";
		}
		if(document.getElementById('chk_emission_other').checked){
			isScopeOther = true
			scopesLabel += getMessage("label_other") + ", ";
		}
		if(scopesLabel.lastIndexOf(", ") ==  scopesLabel.length -2){
			scopesLabel = scopesLabel.slice(0, scopesLabel.length - 2);
		}
		this.selectionLabel += "; " + scopesLabel;

		this.curRestriction = consoleRestriction;

		this.abGbRptFpYearComp_totalChart.addParameter("consoleRestriction" , consoleRestriction);
		this.abGbRptFpYearComp_totalChart.addParameter("groupBy" , groupByParameter);
		this.abGbRptFpYearComp_totalChart.addParameter("isGroupPerArea" , false);
		this.abGbRptFpYearComp_totalChart.addParameter("isScope1" , isScope1);
		this.abGbRptFpYearComp_totalChart.addParameter("isScope2" , isScope2);
		this.abGbRptFpYearComp_totalChart.addParameter("isScope3" , isScope3);
		this.abGbRptFpYearComp_totalChart.addParameter("isScopeOther" , isScopeOther);
		this.abGbRptFpYearComp_totalChart.refresh();
		this.abGbRptFpYearComp_totalChart.show(true, true);

		this.abGbRptFpYearComp_totalReport.addParameter("consoleRestriction" , consoleRestriction);
		this.abGbRptFpYearComp_totalReport.addParameter("isGroupPerArea" , false);
		this.abGbRptFpYearComp_totalReport.addParameter("isScope1" , isScope1);
		this.abGbRptFpYearComp_totalReport.addParameter("isScope2" , isScope2);
		this.abGbRptFpYearComp_totalReport.addParameter("isScope3" , isScope3);
		this.abGbRptFpYearComp_totalReport.addParameter("isScopeOther" , isScopeOther);
		this.abGbRptFpYearComp_totalReport.refresh();
		this.abGbRptFpYearComp_totalReport.showColumn("gb_fp_totals.vf_scope1_total", isScope1);
		this.abGbRptFpYearComp_totalReport.showColumn("gb_fp_totals.vf_scope2_total", isScope2);
		this.abGbRptFpYearComp_totalReport.showColumn("gb_fp_totals.vf_scope3_total", isScope3);
		this.abGbRptFpYearComp_totalReport.showColumn("gb_fp_totals.vf_other_total", isScopeOther);
		this.abGbRptFpYearComp_totalReport.update();
		
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("consoleRestriction" , consoleRestriction);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("groupBy" , groupByParameter);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("isGroupPerArea" , true);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("isScope1" , isScope1);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("isScope2" , isScope2);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("isScope3" , isScope3);
		this.abGbRptFpYearComp_totalPerAreaChart.addParameter("isScopeOther" , isScopeOther);
		this.abGbRptFpYearComp_totalPerAreaChart.refresh();
		this.abGbRptFpYearComp_totalPerAreaChart.show(true, true);
		
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("consoleRestriction" , consoleRestriction);
		this.parameters.consoleRestriction = consoleRestriction;
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("isGroupPerArea" , true);
		this.parameters.isGroupPerArea = true;
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("isScope1" , isScope1);
		this.parameters.isScope1 = isScope1;
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("isScope2" , isScope2);
		this.parameters.isScope2 = isScope2;
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("isScope3" , isScope3);
		this.parameters.isScope3 = isScope3;
		this.abGbRptFpYearComp_totalPerAreaReport.addParameter("isScopeOther" , isScopeOther);
		this.parameters.isScopeOther = isScopeOther;
        
   		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope1" , isScope1);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope2" , isScope2);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScope3" , isScope3);
		this.abGbRptFp_perAreaTotals_ds.addParameter("isScopeOther" , isScopeOther);
        
		this.abGbRptFpYearComp_totalPerAreaReport.refresh();
		this.abGbRptFpYearComp_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope1_total", isScope1);
		this.abGbRptFpYearComp_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope2_total", isScope2);
		this.abGbRptFpYearComp_totalPerAreaReport.showColumn("gb_fp_totals.vf_scope3_total", isScope3);
		this.abGbRptFpYearComp_totalPerAreaReport.showColumn("gb_fp_totals.vf_other_total", isScopeOther);
		this.abGbRptFpYearComp_totalPerAreaReport.update();

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
	
	abGbRptFpYearComp_totalChart_afterRefresh: function(){
		this.abGbRptFpYearComp_totalChart.setInstructions(this.selectionLabel);
		this.abGbRptFpYearComp_totalChart.enableAction("exportDOCX", true);
		
	},
	
	abGbRptFpYearComp_totalPerAreaChart_afterRefresh: function(){
		this.abGbRptFpYearComp_totalPerAreaChart.setInstructions(this.selectionLabel);
		this.abGbRptFpYearComp_totalPerAreaChart.enableAction("exportDOCX", true);
	},

	abGbRptFpYearComp_totalPerAreaReport_afterRefresh: function(){
		var totalPerAreaReport = this.abGbRptFpYearComp_totalPerAreaReport;
		var totalFields = ["gb_fp_totals.sum_vf_total", "gb_fp_totals.sum_vf_scope1_total", "gb_fp_totals.sum_vf_scope2_total", "gb_fp_totals.sum_vf_scope3_total", "gb_fp_totals.sum_vf_other_total"];
        
        var perAreaTotals = this.abGbRptFp_perAreaTotals_ds.getRecord(this.curRestriction.replace("AND ",""));
        
		totalPerAreaReport.totals = new Ab.data.Record();		
                
        for (var i=0; i<totalFields.length; i++) {
		  totalPerAreaReport.totals.setValue(totalFields[i], perAreaTotals.getValue(totalFields[i]));            
        }
		
		totalPerAreaReport.totals.localizedValues =
			this.abGbRptFpYearComp_dataReport_ds.formatValues(totalPerAreaReport.totals.values,true,true);
                    
        for (var i=0; i<totalFields.length; i++) {
            totalPerAreaReport.totals.localizedValues[totalFields[i]] = this.abGbRptFpYearComp_dataReport_ds.formatValue(totalFields[i].replace('.sum_','.'), totalPerAreaReport.totals.getValue(totalFields[i]));
        }
        
		if(!valueExistsNotEmpty(document.getElementById("abGbRptFpYearComp_totalPerAreaReport_totals"))){
			totalPerAreaReport.buildTotalsFooterRow(totalPerAreaReport.tableFootElement);
		}
		
	},
	
	abGbRptFpYearComp_totalChart_onExportDOCX: function(){
		var printableRestriction = this.obtainPrintableRestriction();
		
		var  panel  =  this.abGbRptFpYearComp_totalChart;
		var  parameters  = {};
		if(panel.getParametersForRefresh){
			parameters   =  panel.getParametersForRefresh();
		}
		parameters. printRestriction  =  true;
		parameters. printableRestriction  =  printableRestriction;

		var  jobId  =  panel.callDOCXReportJob(panel.title,  panel.restriction,  parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
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

	},
	
	abGbRptFpYearComp_totalPerAreaChart_onExportDOCX: function(){
		var printableRestriction = this.obtainPrintableRestriction();
		
		var  panel  =  this.abGbRptFpYearComp_totalPerAreaChart;
		var  parameters  = {};
		if(panel.getParametersForRefresh){
			parameters   =  panel.getParametersForRefresh();
		}
		parameters. printRestriction  =  true;
		parameters. printableRestriction  =  printableRestriction;

		var  jobId  =  panel.callDOCXReportJob(panel.title,  panel.restriction,  parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
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

	},
	
	obtainPrintableRestriction: function(){
		var console = this.abGbRptFpYearComp_filter;
		
		//final variables
		var  site_id;
		var  vf_from_year;
		var  vf_to_year;
		var  vf_emission_scope;
		var  bl_id;
		var  scenario_id;
		
		//temporary variables
		var scenarioId;
		var blId;
		var siteId;
		vf_from_year = console.getFieldValue("gb_fp_totals.vf_from_year");
		vf_to_year = console.getFieldValue("gb_fp_totals.vf_to_year");
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
		
		if(valueExistsNotEmpty(scenarioId)){
			if(typeof(scenarioId) === 'object' && scenarioId instanceof Array){
				scenario_id = scenarioId.join(", ");
			}else{
				scenario_id = scenarioId;
			}
		}
		
		if(valueExistsNotEmpty(siteId)){
			if(typeof(siteId) === 'object' && siteId instanceof Array){
				site_id = siteId.join(", ");
			}else{
				site_id = siteId;
			}
		}

		if(valueExistsNotEmpty(blId)){
			if(typeof(blId) === 'object' && blId instanceof Array){
				bl_id = blId.join(",");
			}else{
				bl_id = blId;
			}
		}
		
		this.selectionLabel = getFilterSelectionAsLabel(console);
		var isScope1 = false;
		var isScope2 = false;
		var isScope3 = false;
		var isScopeOther = false;
		var scopesLabel = "";
		if(document.getElementById('chk_emission_scope1').checked){
			isScope1 = true;
			scopesLabel += getMessage("label_scope1") + ", ";
		}
		if(document.getElementById('chk_emission_scope2').checked){
			isScope2 = true;
			scopesLabel += getMessage("label_scope2") + ", ";
		}
		if(document.getElementById('chk_emission_scope3').checked){
			isScope3 = true;
			scopesLabel += getMessage("label_scope3") + ", ";
		}
		if(document.getElementById('chk_emission_other').checked){
			isScopeOther = true
			scopesLabel += getMessage("label_other") + ", ";
		}
		if(scopesLabel.lastIndexOf(", ") ==  scopesLabel.length -2){
			scopesLabel = scopesLabel.slice(0, scopesLabel.length - 2);
		}
		vf_emission_scope = scopesLabel;
		
		var  printableRestriction = [];
	
		if(site_id != null && site_id != ''){
		      printableRestriction.push({'title': console.fields.get("bl.site_id").fieldDef.title, 'value': site_id});
		}
		if(vf_from_year != null && vf_from_year != ''){
		      printableRestriction.push({'title': console.fields.get("gb_fp_totals.vf_from_year").fieldDef.title, 'value': vf_from_year});
		}
		if(vf_to_year != null && vf_to_year != ''){
		      printableRestriction.push({'title': console.fields.get("gb_fp_totals.vf_to_year").fieldDef.title, 'value': vf_to_year});
		}
		if(bl_id != null && bl_id != ''){
		      printableRestriction.push({'title': console.fields.get("gb_fp_totals.bl_id").fieldDef.title, 'value': bl_id});
		}
		if(scenario_id != null && scenario_id != ''){
		      printableRestriction.push({'title': console.fields.get("gb_fp_totals.scenario_id").fieldDef.title, 'value': scenario_id});
		}
		if(vf_emission_scope != null && vf_emission_scope != ''){
		      printableRestriction.push({'title': console.fields.get("vf_emission_scope").fieldDef.title, 'value': vf_emission_scope});
		}
		return printableRestriction;
	}
})



/**
 * After select value handler from filter console
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue){
	var console = View.panels.get("abGbRptFpYearComp_filter");
	if(newValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
		newValue = newValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	}
	var clausesMap = getFieldClauses(console, fieldName);
	var fieldClause;
	var additionalClause;
	var restriction;
	switch(fieldName){
		case "gb_fp_totals.vf_from_year":
			{
				fieldClause = "AND  gb_fp_totals.calc_year >= " + newValue;

				// restrict site_id
				additionalClause = "";
				if(valueExists(clausesMap["gb_fp_totals.scenario_id"])){
					additionalClause +=  clausesMap["gb_fp_totals.scenario_id"];
				}
				restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals, bl WHERE gb_fp_totals.bl_id = bl.bl_id AND bl.site_id = site.site_id " + fieldClause + " " + additionalClause + ")";
				addCommandRestriction(console.fields.get("bl.site_id"), restriction);
				// restrict bl_id
				if(valueExists(clausesMap["bl.site_id"])){
					additionalClause +=  clausesMap["bl.site_id"];
				}
				restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id " + fieldClause + " " + additionalClause + ")";
				addCommandRestriction(console.fields.get("gb_fp_totals.bl_id"), restriction);
				break;
			}
		case "gb_fp_totals.vf_to_year":
		{
			fieldClause = "AND  gb_fp_totals.calc_year <= " + newValue;

			// restrict site_id
			additionalClause = "";
			if(valueExists(clausesMap["gb_fp_totals.scenario_id"])){
				additionalClause +=  clausesMap["gb_fp_totals.scenario_id"];
			}
			restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals, bl WHERE gb_fp_totals.bl_id = bl.bl_id AND bl.site_id = site.site_id " + fieldClause + " " + additionalClause + ")";
			addCommandRestriction(console.fields.get("bl.site_id"), restriction);
			// restrict bl_id
			if(valueExists(clausesMap["bl.site_id"])){
				additionalClause +=  clausesMap["bl.site_id"];
			}
			restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id " + fieldClause + " " + additionalClause + ")";
			addCommandRestriction(console.fields.get("gb_fp_totals.bl_id"), restriction);
			break;
		}
		case "bl.site_id":
			{
				if(typeof(newValue) === 'object' && newValue instanceof Array){
					fieldClause = "AND  bl.site_id IN ('"+ newValue.join("', '") +"')";
				}else{
					fieldClause = "AND  bl.site_id = '" + newValue + "'";
				}
				// restrict bl_id
				additionalClause = ""
				if(valueExists(clausesMap["gb_fp_totals.vf_from_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_from_year"];
				}
				if(valueExists(clausesMap["gb_fp_totals.vf_to_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_to_year"];
				}
				if(valueExists(clausesMap["gb_fp_totals.scenario_id"])){
					additionalClause +=  clausesMap["gb_fp_totals.scenario_id"];
				}
				restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id " + fieldClause + " " + additionalClause + ")";
				addCommandRestriction(console.fields.get("gb_fp_totals.bl_id"), restriction);
				break;
			}
		case "gb_fp_totals.scenario_id":
			{
				if(typeof(newValue) === 'object' && newValue instanceof Array){
					fieldClause = "AND  gb_fp_totals.scenario_id IN ('"+ newValue.join("', '") +"')";
				}else{
					fieldClause = "AND  gb_fp_totals.scenario_id = '" + newValue + "'";
				}
				// restrict year
				additionalClause = "";
				restriction = "1 = 1 " + fieldClause;
				addCommandRestriction(console.fields.get("gb_fp_totals.vf_from_year"), restriction);
				addCommandRestriction(console.fields.get("gb_fp_totals.vf_to_year"), restriction);
				// restrict site_id
				if(valueExists(clausesMap["gb_fp_totals.vf_from_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_from_year"];
				}
				if(valueExists(clausesMap["gb_fp_totals.vf_to_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_to_year"];
				}
				restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals, bl WHERE gb_fp_totals.bl_id = bl.bl_id AND bl.site_id = site.site_id " + fieldClause + " " + additionalClause + ")";
				addCommandRestriction(console.fields.get("bl.site_id"), restriction);
				// restrict bl_id
				if(valueExists(clausesMap["bl.site_id"])){
					additionalClause +=  clausesMap["bl.site_id"];
				}
				restriction = "EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id " + fieldClause + " " + additionalClause + ")";
				addCommandRestriction(console.fields.get("gb_fp_totals.bl_id"), restriction);
				break;
			}
	}
}

/**
 * Get console field restriction
 * 
 */
function getFieldClauses(console, fieldChanged){
	var clausesMap = {};
	console.fields.each(function(field){
		var fieldName = field.config.id;
		if(fieldName != fieldChanged){
			var fieldValue = console.getFieldValue(fieldName);
			if(valueExistsNotEmpty(fieldValue)){
				if(fieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
					fieldValue = fieldValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}
				var fieldClause = "";
				if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
					fieldClause = "AND "+fieldName+" IN ('"+ fieldValue.join("', '") +"')";
				}else{
					if(fieldName == "gb_fp_totals.vf_from_year"){
						fieldClause = "AND gb_fp_totals.calc_year >= " + fieldValue;
						fieldName = "gb_fp_totals.calc_year";
					}if(fieldName == "gb_fp_totals.vf_to_year"){
						fieldClause = "AND gb_fp_totals.calc_year <= " + fieldValue;
						fieldName = "gb_fp_totals.calc_year";
					}else{
						fieldClause = "AND " + fieldName + " = '"+ fieldValue +"'";
					}
				}
				clausesMap[fieldName] = fieldClause;
			}
		}
	});
	return clausesMap;
}
