Ab.grid.ReportGrid.prototype.decorateHeaderCell = function(level, c, column, headerCell) {
	var controller = View.controllers.get("abGbRptFpTotByYearCtrl");
	var isSortable = true;
	if(valueExists(controller.nonSortableColumns[this.id])){
		var nonSortableColumns = controller.nonSortableColumns[this.id];
		isSortable= !valueExists(nonSortableColumns[column.id]);
	}
	if (this.sortEnabled && level == 0 && this.columnTypeIsSortable(column.type) && isSortable) {
		var sortLink = this.getSortImage(this.sortDirections[c]);
		sortLink.id = 'sortLink_' + c;
		// onClick function
		this.activateSortListener(headerCell, c);
		headerCell.appendChild(sortLink);
	}
}

// overwrite chart control getParameters function
Ab.chart.ChartControl.prototype.getParameters = function(restriction){
	var controlType = View.controllers.get('abGbRptFpTotByYearCtrl').chartType;
	
	if(controlType === 'line'){
		this.chartType = "lineChart";
	}else if(controlType === 'stacked'){
		this.chartType = "stackedBarChart";
	}
	
	var viewName = this.configObj.getConfigParameter('viewDef');
	var groupingAxis = this.configObj.getConfigParameter('groupingAxis');

	if(!this.configObj.getConfigParameter('dataAxisAll')){
		this.configObj.setConfigParameter('dataAxisAll',this.configObj.getConfigParameter('dataAxis'));
	}

	var dataAxis = new Array();
	 if(this.chartType == "lineChart"){
		 dataAxis = this.configObj.getConfigParameter('dataAxisAll');
	 }else if (this.chartType == "stackedBarChart"){
		dataAxis = [];
		for(var i = 0; i < this.configObj.getConfigParameter('dataAxisAll').length; i++){
			var dAxis = this.configObj.getConfigParameter('dataAxisAll')[i];
			if(dAxis.id != 'gb_fp_totals.vf_total_s1_s2_s_other' && dAxis.id != 'gb_fp_totals.vf_total' ){
				dataAxis.push(dAxis);
			}
		}
		
	 }
	 this.configObj.setConfigParameter("dataAxis", dataAxis);
	
	var  parameters = {
	           version: '2',
	           viewName: viewName,
	           groupingAxis: toJSON(groupingAxis),
	           dataAxis: toJSON(dataAxis),
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
     this.setSwfPath();
	 
     // we must load the new data into flash control
	 this.loadChartSWFIntoFlash();
	 
	 return parameters;
}


var abGbRptFpTotByYearCtrl = View.createController('abGbRptFpTotByYearCtrl', {
	nonSortableColumns: {
		'abGbRptFpTotByYear_totalReport': {"gb_fp_totals.vf_site_count": true, "gb_fp_totals.vf_bl_count": true},
		'abGbRptFpTotByYear_totalPerAreaReport': {"gb_fp_totals.vf_site_count": true, "gb_fp_totals.vf_bl_count": true}
	},
	
	selectionLabel: null,
	
	chartType: null,
	
	afterViewLoad: function(){
		this.setLabels();
	},
	
	afterInitialDataFetch: function(){
		this.abGbRptFpTotByYear_totalChart.setDataAxisTitle(getMessage('dataAxisTitleMT'));
		this.abGbRptFpTotByYear_totalPerAreaChart.setDataAxisTitle(getMessage('dataAxisTitleKg'));
	},
	
	setLabels: function(){
		$('label_chartType_line').innerHTML = getMessage("label_line_chart");
		$('label_chartType_stacked').innerHTML = getMessage("label_stacked_chart");
	},
	
	abGbRptFpTotByYear_filter_onShow: function(){
		var console = this.abGbRptFpTotByYear_filter;
		var restriction = new Ab.view.Restriction();
		var reportRestriction = new Ab.view.Restriction();
		var reportSiteClause = "";
		var calcYear;
		if(console.hasFieldMultipleValues("gb_fp_totals.vf_calc_year")){
			calcYear = console.getFieldMultipleValues("gb_fp_totals.vf_calc_year");
		}else{
			calcYear = console.getFieldValue("gb_fp_totals.vf_calc_year");
		}
		if(valueExistsNotEmpty(calcYear)){
			var op = (typeof(calcYear) === 'object' && calcYear instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.calc_year", calcYear, op);
			reportRestriction.addClause("gb_fp_totals.calc_year", calcYear, op);
		}
		var siteId;
		if(console.hasFieldMultipleValues("bl.site_id")){
			siteId = console.getFieldMultipleValues("bl.site_id");
		}else{
			siteId = console.getFieldValue("bl.site_id");
		}
		if(valueExistsNotEmpty(siteId)){
			var op = (typeof(siteId) === 'object' && siteId instanceof Array)?'IN':'=';
			restriction.addClause("bl.site_id", siteId, op);
			reportSiteClause = "EXISTS(SELECT bl.site_id FROM bl WHERE bl.bl_id = gb_fp_totals.bl_id AND ";
			if(typeof(siteId) === 'object' && siteId instanceof Array){
				reportSiteClause += "bl.site_id IN ('"+ siteId.join("','") +"'))";
			}else{
				reportSiteClause += "bl.site_id = '"+ siteId +"')";
			}
			
		}
		var blId;
		if(console.hasFieldMultipleValues("gb_fp_totals.bl_id")){
			blId = console.getFieldMultipleValues("gb_fp_totals.bl_id");
		}else{
			blId = console.getFieldValue("gb_fp_totals.bl_id");
		}
		if(valueExistsNotEmpty(blId)){
			var op = (typeof(blId) === 'object' && blId instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.bl_id", blId, op);
			reportRestriction.addClause("gb_fp_totals.bl_id", blId, op);
		}
		var scenarioId;
		if(console.hasFieldMultipleValues("gb_fp_totals.scenario_id")){
			scenarioId = console.getFieldMultipleValues("gb_fp_totals.scenario_id");
		}else{
			scenarioId = console.getFieldValue("gb_fp_totals.scenario_id");
		}
		if(valueExistsNotEmpty(scenarioId)){
			var op = (typeof(scenarioId) === 'object' && scenarioId instanceof Array)?'IN':'=';
			restriction.addClause("gb_fp_totals.scenario_id", scenarioId, op);
			reportRestriction.addClause("gb_fp_totals.scenario_id", scenarioId, op);
		}
		
		this.selectionLabel = getFilterSelectionAsLabel(console);
		if(document.getElementById('rad_chartType_line').checked){
			this.chartType = "line";
		}else if(document.getElementById('rad_chartType_stacked').checked){
			this.chartType = "stacked";
		}
		
		this.abGbRptFpTotByYear_tabs.selectTab("abGbRptFpTotByYear_total_tab");
		
		this.abGbRptFpTotByYear_totalChart.addParameter("isGroupPerArea" ,false);
		this.abGbRptFpTotByYear_totalChart.refresh(restriction);
		
		this.abGbRptFpTotByYear_totalPerAreaChart.addParameter("isGroupPerArea" ,true);
		this.abGbRptFpTotByYear_totalPerAreaChart.refresh(restriction);
		
		this.abGbRptFpTotByYear_totalReport.addParameter("isGroupPerArea" ,false);
		this.abGbRptFpTotByYear_totalReport.addParameter("siteClause" ,reportSiteClause);
		
		this.abGbRptFpTotByYear_totalReport.refresh(reportRestriction);
		this.abGbRptFpTotByYear_totalPerAreaReport.addParameter("isGroupPerArea" ,true);
		this.abGbRptFpTotByYear_totalPerAreaReport.addParameter("siteClause" ,reportSiteClause);
		this.abGbRptFpTotByYear_totalPerAreaReport.refresh(reportRestriction);
		
		
	},
	
	abGbRptFpTotByYear_totalChart_afterRefresh: function(){
		this.abGbRptFpTotByYear_totalChart.setInstructions(this.selectionLabel);
		this.abGbRptFpTotByYear_totalChart.enableAction("exportDOCX", true);
		
	},
	
	abGbRptFpTotByYear_totalPerAreaChart_afterRefresh: function(){
		this.abGbRptFpTotByYear_totalPerAreaChart.setInstructions(this.selectionLabel);
		this.abGbRptFpTotByYear_totalPerAreaChart.enableAction("exportDOCX", true);
		
	}
});

/**
 * After select value handler from filter console
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue){
	var console = View.panels.get("abGbRptFpTotByYear_filter");
	if(newValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
		newValue = newValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	}
	var clausesMap = getFieldClauses(console, fieldName);
	var fieldClause;
	var additionalClause;
	var restriction;
	switch(fieldName){
		case "gb_fp_totals.vf_calc_year":
			{
				if(typeof(newValue) === 'object' && newValue instanceof Array){
					fieldClause = "AND  gb_fp_totals.calc_year IN ("+ newValue.join(", ") +")";
				}else{
					fieldClause = "AND  gb_fp_totals.calc_year = " + newValue;
				}
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
				if(valueExists(clausesMap["gb_fp_totals.vf_calc_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_calc_year"];
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
				addCommandRestriction(console.fields.get("gb_fp_totals.vf_calc_year"), restriction);
				// restrict site_id
				if(valueExists(clausesMap["gb_fp_totals.vf_calc_year"])){
					additionalClause +=  clausesMap["gb_fp_totals.vf_calc_year"];
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
					if(fieldName == "gb_fp_totals.vf_calc_year"){
						fieldClause = "AND gb_fp_totals.calc_year IN ("+ fieldValue.join(", ") +")";
					}else{
						fieldClause = "AND "+fieldName+" IN ('"+ fieldValue.join("', '") +"')";
					}
				}else{
					if(fieldName == "gb_fp_totals.vf_calc_year"){
						fieldClause = "AND gb_fp_totals.calc_year = " + fieldValue;
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
