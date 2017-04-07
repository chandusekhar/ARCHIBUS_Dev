Ab.grid.ReportGrid.prototype.decorateHeaderCell = function(level, c, column, headerCell) {
	var controller = View.controllers.get("abGbRptFpSiteBlgCtrl");
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

var abGbRptFpSiteBlgCtrl = View.createController('abGbRptFpSiteBlgCtrl', {
	nonSortableColumns: {
		'abGbRptFpSiteBlg_site': {"gb_fp_totals.site_name": true, "gb_fp_totals.vf_bldg_count": true}
	},
	columnTotals:{
		'gb_fp_totals.vf_total': true,
		'gb_fp_totals.vf_total_s1_s2_s_other': true,
		'gb_fp_totals.vf_total_s1': true,
		'gb_fp_totals.vf_total_s2': true,
		'gb_fp_totals.vf_total_other': true,
		'gb_fp_totals.vf_total_s3': true,
		'gb_fp_totals.vf_cf_bldg_count': false,
		'gb_fp_totals.vf_bldg_count': false,
		'gb_fp_totals.total': true,
		'gb_fp_totals.total_s1_s2_s_other': true
	},
	
	//Statistic config objects.
	siteGridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["gb_fp_totals.vf_total","gb_fp_totals.vf_total_s1_s2_s_other","gb_fp_totals.vf_total_s1",
		         "gb_fp_totals.vf_total_s2","gb_fp_totals.vf_total_other","gb_fp_totals.vf_total_s3"]
	},
	blGridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["gb_fp_totals.vf_total","gb_fp_totals.vf_total_s1_s2_s_other","gb_fp_totals.vf_total_s1",
		         "gb_fp_totals.vf_total_s2","gb_fp_totals.vf_total_other","gb_fp_totals.vf_total_s3"]
	},
	
	afterViewLoad: function(){
		this.abGbRptFpSiteBlg_site.setStatisticAttributes(this.siteGridFlds_statConfig);
		this.abGbRptFpSiteBlg_bl.setStatisticAttributes(this.blGridFlds_statConfig);
	},
	
	consoleRestriction: null,
	
	isGroupPerArea: false,
	
	parameters: {},
	
	columnTotalsMap:{
		'gb_fp_totals.vf_total': 'gb_fp_totals.sum_vf_total',
		'gb_fp_totals.vf_total_s1_s2_s_other': 'gb_fp_totals.sum_vf_s1_s2_s_other',
		'gb_fp_totals.vf_total_s1': 'gb_fp_totals.sum_vf_s1_total',
		'gb_fp_totals.vf_total_s2': 'gb_fp_totals.sum_vf_s2_total',
		'gb_fp_totals.vf_total_other': 'gb_fp_totals.sum_vf_other_total',
		'gb_fp_totals.vf_total_s3': 'gb_fp_totals.sum_vf_s3_total'
	},
    
	abGbRptFpSiteBlg_filter_onShow: function(){
		
		
		this.consoleRestriction = this.getConsoleRestriction();
		this.parameters.isGroupPerArea = this.isGroupPerArea.toString();
		this.abGbRptFpSiteBlg_site.addParameter("isGroupPerArea", this.isGroupPerArea);
		this.abGbRptFpSiteBlg_site.refresh(this.consoleRestriction);
		this.abGbRptFpSiteBlg_bl.addParameter("isGroupPerArea", this.isGroupPerArea);
		this.abGbRptFpSiteBlg_bl.refresh(this.consoleRestriction);
		
		this.abGbRptFpSiteBlg_tabs.selectTab("abGbRptFpSiteBlg_site_tab");
	},
	
	getConsoleRestriction: function(){
		var console = this.abGbRptFpSiteBlg_filter;
		var restriction = new Ab.view.Restriction();
		console.fields.each(function(field){
			var fieldName = field.config.id;
			var fieldValue = console.getFieldValue(fieldName);
			if(valueExistsNotEmpty(fieldValue)){
				if(fieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
					fieldValue = fieldValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}
				var op = (typeof(fieldValue) === 'object' && fieldValue instanceof Array)?"IN":"=";
				
				if(fieldName == "gb_fp_totals.vf_calc_year"){
					restriction.addClause("gb_fp_totals.calc_year", fieldValue, op);
				}else{
					restriction.addClause(fieldName, fieldValue, op);
				}
			}
		});
		this.isGroupPerArea = document.getElementById("chk_vf_totals_per_area").checked;
		return (restriction);
	},
	
	abGbRptFpSiteBlg_site_afterRefresh: function(){
		this.afterRefreshCommon(this.abGbRptFpSiteBlg_site);
	},

	abGbRptFpSiteBlg_bl_afterRefresh: function(){
		this.afterRefreshCommon(this.abGbRptFpSiteBlg_bl);
	},
    
	afterRefreshCommon: function(panel){
		setColumnTitle(panel, "gb_fp_totals.vf_total");
        
        if (this.isGroupPerArea) {    
            var totalFields = this.columnTotalsMap;            
            var totalPerAreaReport = panel;
            var perAreaTotals = this.abGbRptFp_perAreaTotals_ds.getRecord(this.consoleRestriction);
                                
            for (var fld in totalFields) {
              var sumfld = fld.replace('.', '.sum_');
              totalPerAreaReport.totals.setValue(sumfld, perAreaTotals.getValue(totalFields[fld]));            
              totalPerAreaReport.totals.localizedValues[sumfld] = this.abGbRptFpSiteBlg_site_ds.formatValue(fld, totalPerAreaReport.totals.getValue(sumfld));
            }
                                    
            if(!valueExistsNotEmpty(document.getElementById(panel.id+"_totals"))){
                totalPerAreaReport.buildTotalsFooterRow(totalPerAreaReport.tableFootElement);
            }

            panel.reloadGrid();
        }        
	}    
})

/**
 * Show row details in second tab
 * @param row
 */
function showDetails(row){
	var controller = View.controllers.get('abGbRptFpSiteBlgCtrl');
	var restriction = new Ab.view.Restriction();
	restriction.addClauses(controller.consoleRestriction);
	if(typeof(row) == "object" && typeof(row) != "string" && row != "total_row"  ){
		if(valueExistsNotEmpty(row["bl.site_id"])){
			restriction.addClause("bl.site_id", row["bl.site_id"], "=", "AND", true);
		}
		if(valueExistsNotEmpty(row["gb_fp_totals.calc_year"])){
			restriction.addClause("gb_fp_totals.calc_year", row["gb_fp_totals.calc_year"], "=", "AND", true);
		}
	}
	controller.abGbRptFpSiteBlg_bl.addParameter("isGroupPerArea", controller.isGroupPerArea);
	controller.abGbRptFpSiteBlg_bl.refresh(restriction);
	controller.abGbRptFpSiteBlg_tabs.selectTab("abGbRptFpSiteBlg_bl_tab");
}
	
/**
 * After select value handler from filter console
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue){
	var console = View.panels.get("abGbRptFpSiteBlg_filter");
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
