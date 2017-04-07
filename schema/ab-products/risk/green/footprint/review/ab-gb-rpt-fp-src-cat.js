Ab.grid.ReportGrid.prototype.decorateHeaderCell = function(level, c, column, headerCell) {
	var controller = View.controllers.get("abGbRptFpSrcCatCtrl");
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


var abGbRptFpSrcCatCtrl = View.createController('abGbRptFpSrcCatCtrl', {
	nonSortableColumns: {
		'abGbRptFpSrcCat_site': {"gb_fp_totals.site_name": true, "gb_fp_totals.vf_bldg_count": true}
	},
	columnTotals:{
		'gb_fp_totals.vf_s1_co_airc': true,
		'gb_fp_totals.vf_s1_co_road': true,
		'gb_fp_totals.vf_s1_co_transp': true,
		'gb_fp_totals.vf_s1_fuel_comb': true,
		'gb_fp_totals.vf_s1_refrig_airc': true,
		'gb_fp_totals.vf_s1_total': true,
		'gb_fp_totals.vf_s2_purch_e': true,
		'gb_fp_totals.vf_s3_cont': true,
		'gb_fp_totals.vf_s3_em_air': true,
		'gb_fp_totals.vf_s3_em_rail': true,
		'gb_fp_totals.vf_s3_em_road': true,
		'gb_fp_totals.vf_s3_em_total': true,
		'gb_fp_totals.vf_s3_mat': true,
		'gb_fp_totals.vf_s3_outs': true,
		'gb_fp_totals.vf_s3_serv': true,
		'gb_fp_totals.vf_s3_waste_liq': true,
		'gb_fp_totals.vf_s3_waste_sol': true,
		'gb_fp_totals.vf_s3_waste_total': true,
		'gb_fp_totals.vf_s3_total': true,
		'gb_fp_totals.vf_s_other': true,
		'gb_fp_totals.vf_cf_bldg_count': false,
		'gb_fp_totals.vf_bldg_count': false
	},
	
	scope1Columns : {'gb_fp_totals.vf_s1_total': true, 'gb_fp_totals.vf_s1_co_transp': true,
		'gb_fp_totals.vf_s1_co_airc': true, 'gb_fp_totals.vf_s1_co_road': true, 'gb_fp_totals.vf_s1_fuel_comb': true, 'gb_fp_totals.vf_s1_refrig_airc': true},
	
	scope2Columns : {'gb_fp_totals.vf_s2_purch_e': true},
	
	scope3Columns : {'gb_fp_totals.vf_s3_total': true, 'gb_fp_totals.vf_s3_waste_total': true, 'gb_fp_totals.vf_s3_em_total': true,'gb_fp_totals.vf_s3_cont': true, 'gb_fp_totals.vf_s3_em_air': true, 'gb_fp_totals.vf_s3_em_rail': true, 'gb_fp_totals.vf_s3_em_road': true,
	        		'gb_fp_totals.vf_s3_mat': true, 'gb_fp_totals.vf_s3_outs': true, 'gb_fp_totals.vf_s3_serv': true, 'gb_fp_totals.vf_s3_waste_liq': true, 'gb_fp_totals.vf_s3_waste_sol': true},
	        		
	otherColumns : {'gb_fp_totals.vf_s_other': true},
	
	consoleRestriction: null,
	
	isGroupPerArea: false,
	
	showScope: 'scope1',
	
	parameters: {},
	
	//Statistic config objects.
	siteGridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["gb_fp_totals.vf_s1_total","gb_fp_totals.vf_s1_fuel_comb","gb_fp_totals.vf_s1_co_road",
		         "gb_fp_totals.vf_s1_co_airc","gb_fp_totals.vf_s1_co_transp",
                 "gb_fp_totals.vf_s1_refrig_airc", "gb_fp_totals.vf_s2_purch_e","gb_fp_totals.vf_s3_total","gb_fp_totals.vf_s3_waste_sol", "gb_fp_totals.vf_s3_waste_liq","gb_fp_totals.vf_s3_waste_total","gb_fp_totals.vf_s3_em_road","gb_fp_totals.vf_s3_em_rail","gb_fp_totals.vf_s3_em_air","gb_fp_totals.vf_s3_em_total","gb_fp_totals.vf_s3_mat","gb_fp_totals.vf_s3_cont",
                 "gb_fp_totals.vf_s3_outs","gb_fp_totals.vf_s3_serv","gb_fp_totals.vf_s_other"]
	},
	blGridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["gb_fp_totals.vf_s1_total","gb_fp_totals.vf_s1_fuel_comb","gb_fp_totals.vf_s1_co_road",
		         "gb_fp_totals.vf_s1_co_airc","gb_fp_totals.vf_s1_co_transp",
		         "gb_fp_totals.vf_s1_refrig_airc","gb_fp_totals.vf_s2_purch_e","gb_fp_totals.vf_s3_total",
		         "gb_fp_totals.vf_s3_waste_sol","gb_fp_totals.vf_s3_waste_liq","gb_fp_totals.vf_s3_waste_total",
		         "gb_fp_totals.vf_s3_em_road","gb_fp_totals.vf_s3_em_rail","gb_fp_totals.vf_s3_em_air",
		         "gb_fp_totals.vf_s3_em_total","gb_fp_totals.vf_s3_mat","gb_fp_totals.vf_s3_cont",
		         "gb_fp_totals.vf_s3_outs","gb_fp_totals.vf_s3_serv","gb_fp_totals.vf_s_other"]
	},
	
	afterViewLoad: function(){
		this.abGbRptFpSrcCat_site.setStatisticAttributes(this.siteGridFlds_statConfig);
		this.abGbRptFpSrcCat_bl.setStatisticAttributes(this.blGridFlds_statConfig);
		
		this.setLabels();
	},
	
	setLabels: function(){
		$('radio_emission_scope').options[0].innerHTML = getMessage('label_scope1');
		$('radio_emission_scope').options[1].innerHTML = getMessage('label_scope2');
		$('radio_emission_scope').options[2].innerHTML = getMessage('label_scope3');
		$('radio_emission_scope').options[3].innerHTML = getMessage('label_other');
	},
	
    abGbRptFpSrcCat_filter_onShow: function(){
    
    	
        this.consoleRestriction = this.getConsoleRestriction();
        this.parameters.isGroupPerArea = this.isGroupPerArea.toString();
        this.abGbRptFpSrcCat_site.addParameter("isGroupPerArea", this.isGroupPerArea);
        this.abGbRptFpSrcCat_site.refresh(this.consoleRestriction);
        showReportColumns(this.abGbRptFpSrcCat_site);
        
        
        this.abGbRptFpSrcCat_bl.addParameter("isGroupPerArea", this.isGroupPerArea);
        this.abGbRptFpSrcCat_bl.refresh(this.consoleRestriction);
        showReportColumns(this.abGbRptFpSrcCat_bl);
        this.abGbRptFpSrcCat_tabs.selectTab("abGbRptFpSrcCat_site_tab");
        
    },
	
	getConsoleRestriction: function(){
		var console = this.abGbRptFpSrcCat_filter;
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
		
		var objRadio = document.getElementById('radio_emission_scope');
		this.showScope = objRadio.value;
		return (restriction);
	},
	
	abGbRptFpSrcCat_site_afterRefresh: function(){
        this.afterRefreshCommon(this.abGbRptFpSrcCat_site);        
	},

	abGbRptFpSrcCat_bl_afterRefresh: function(){
		this.afterRefreshCommon(this.abGbRptFpSrcCat_bl);
	},

	afterRefreshCommon: function(panel){
		this.setTotalColTitle(panel);
        
        if (this.isGroupPerArea) {    
            var totalFields;
            if (this.showScope == "scope1") {
                totalFields = this.scope1Columns;
            }
            else if (this.showScope == "scope2") {
                totalFields = this.scope2Columns;
            }
            else if (this.showScope == "scope3") {
                totalFields = this.scope3Columns;
            }
            else if (this.showScope == "other") {
                totalFields = this.otherColumns;
            }
            
            var totalPerAreaReport = panel;
            var perAreaTotals = this.abGbRptFp_perAreaTotals_ds.getRecord(this.consoleRestriction);
                                
            for (var fld in totalFields) {
              var sumfld = fld.replace('.', '.sum_');
              totalPerAreaReport.totals.setValue(sumfld, perAreaTotals.getValue(sumfld));            
              totalPerAreaReport.totals.localizedValues[sumfld] = this.abGbRptFpSrcCat_site_ds.formatValue(fld, totalPerAreaReport.totals.getValue(sumfld));
            }
                                    
            if(!valueExistsNotEmpty(document.getElementById(panel.id+"_totals"))){
                totalPerAreaReport.buildTotalsFooterRow(totalPerAreaReport.tableFootElement);
            }
            
        }        
	},
	
	setTotalColTitle: function(grid){
		var fieldName = "";

		if (this.showScope == "scope1") {
            fieldName = "gb_fp_totals.vf_s1_total";
        }
        else 
            if (this.showScope == "scope3") {
                fieldName = "gb_fp_totals.vf_s3_total";
            }
		
		setColumnTitle(grid, fieldName);
	}
})


/**
 * Show row details in second tab
 * @param row
 */
function showDetails(row){
	var controller = View.controllers.get('abGbRptFpSrcCatCtrl');
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
	controller.abGbRptFpSrcCat_bl.addParameter("isGroupPerArea", controller.isGroupPerArea);
	controller.abGbRptFpSrcCat_bl.refresh(restriction);
	showReportColumns(controller.abGbRptFpSrcCat_bl);
	controller.abGbRptFpSrcCat_tabs.selectTab("abGbRptFpSrcCat_bl_tab");
}

function showReportColumns(grid){
	var controller = View.controllers.get('abGbRptFpSrcCatCtrl');
	// show/hide columns
	for(var i=0; i<grid.columns.length; i++){
		var columnId = grid.columns[i].id;
		if(valueExists(controller.scope1Columns[columnId]) || valueExists(controller.scope2Columns[columnId]) 
				|| valueExists(controller.scope3Columns[columnId]) || valueExists(controller.otherColumns[columnId])){
			if(controller.showScope == "scope1" && controller.scope1Columns[columnId]){
				grid.showColumn(columnId, true);
			}else if(controller.showScope == "scope2" && controller.scope2Columns[columnId]){
				grid.showColumn(columnId, true);
			}else if(controller.showScope == "scope3" && controller.scope3Columns[columnId]){
				grid.showColumn(columnId, true);
			}else if(controller.showScope == "other" && controller.otherColumns[columnId]){
				grid.showColumn(columnId, true);
			}else{
				grid.showColumn(columnId, false);
			}
		}else{
			grid.showColumn(columnId, true);
		}
	}
	grid.update();
}

/**
 * After select value handler from filter console
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue){
	var console = View.panels.get("abGbRptFpSrcCat_filter");
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
