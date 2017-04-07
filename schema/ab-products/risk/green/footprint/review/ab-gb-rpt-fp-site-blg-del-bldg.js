Ab.grid.ReportGrid.prototype.decorateHeaderCell = function(level, c, column, headerCell) {
	var controller = View.controllers.get("abGbRptFpSiteBlgDelBldgCtrl");
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

var abGbRptFpSiteBlgDelBldgCtrl = View.createController('abGbRptFpSiteBlgDelBldgCtrl', {
	nonSortableColumns: {},
	columnTotals:{
		'gb_fp_totals.vf_total': true,
		'gb_fp_totals.vf_total_s1_s2_s_other': true,
		'gb_fp_totals.vf_total_s1': true,
		'gb_fp_totals.vf_total_s2': true,
		'gb_fp_totals.vf_total_other': true,
		'gb_fp_totals.vf_total_s3': true,
		'gb_fp_totals.vf_cf_bldg_count': true,
		'gb_fp_totals.vf_bldg_count': true,
		'gb_fp_totals.total': true,
		'gb_fp_totals.total_s1_s2_s_other': true,
		'gb_fp_totals.vf_s2_purch_e': true,
		'gb_fp_totals.vf_s_other': true
	},
	
	//Statistic config objects.
	blGridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["gb_fp_totals.vf_total","gb_fp_totals.vf_total_s1_s2_s_other","gb_fp_totals.vf_total_s1",
		         "gb_fp_totals.vf_s2_purch_e","gb_fp_totals.vf_s_other","gb_fp_totals.vf_total_s3"]
	},
	
	afterViewLoad: function(){
		this.abGbRptFpSiteBlgDelBldg_bl.setStatisticAttributes(this.blGridFlds_statConfig);
	},
	
	consoleRestriction: null,
	
	isGroupPerArea: false,
	
	parameters: {},
	
	abGbRptFpSiteBlgDelBldg_filter_onShow: function(){
		this.consoleRestriction = this.getConsoleRestriction();
		this.parameters.isGroupPerArea = this.isGroupPerArea.toString();
		this.abGbRptFpSiteBlgDelBldg_bl.addParameter("isGroupPerArea", this.isGroupPerArea);
		this.abGbRptFpSiteBlgDelBldg_bl.refresh(this.consoleRestriction);
	},
	
	getConsoleRestriction: function(){
		var console = this.abGbRptFpSiteBlgDelBldg_filter;
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

	abGbRptFpSiteBlgDelBldg_bl_afterRefresh: function(){
		setColumnTitle(this.abGbRptFpSiteBlgDelBldg_bl, "gb_fp_totals.vf_total");
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
	var console = View.panels.get("abGbRptFpSiteBlgDelBldg_filter");
	if(newValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
		newValue = newValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	}
	var clausesMap = getFieldClauses(console, fieldName);
	var fieldClause;
	var restriction = "NOT EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = gb_fp_totals.bl_id)";
	switch(fieldName){
		case "gb_fp_totals.vf_calc_year":
			{
				if(typeof(newValue) === 'object' && newValue instanceof Array){
					fieldClause = " AND gb_fp_totals.calc_year IN ("+ newValue.join(", ") +")";
				}else{
					fieldClause = " AND gb_fp_totals.calc_year = " + newValue;
				}
				restriction += fieldClause;

				// restrict bl_id
				addCommandRestriction(console.fields.get("gb_fp_totals.bl_id"), restriction);
				break;
			}
		case "gb_fp_totals.scenario_id":
			{
				if(typeof(newValue) === 'object' && newValue instanceof Array){
					fieldClause = " AND gb_fp_totals.scenario_id IN ('"+ newValue.join("', '") +"')";
				}else{
					fieldClause = " AND gb_fp_totals.scenario_id = '" + newValue + "'";
				}
				restriction += fieldClause;
				
				// restrict year
				addCommandRestriction(console.fields.get("gb_fp_totals.vf_calc_year"), restriction);
				
				// restrict bl_id
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
