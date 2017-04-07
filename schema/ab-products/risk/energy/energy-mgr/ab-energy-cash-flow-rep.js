var controller = View.createController('calculateCashFlow', {

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	projectionType:null,
	calculationPeriod: null,
	calculationType: null,
	isFromRecurring: null,
	isFromScheduled: null,
	isFromActualCosts: null,
	groupByCostCategory: true,
	ctry_id: null,
	regn_id: null,
	state_id: null,
	city_id: null,
	site_id: null,
	pr_id: null,
	bl_id: null,
	cost_cat_id_ex: null,
	cost_cat_id_sh: null,
	WF_result: null,
	restriction:null,
	currentRowsForSummation: new Ext.util.MixedCollection(),
	summaryRowsAdded: 0,
	assetKeyLocation: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	sh_costCat:'',

	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
	},
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
	
	isMcAndVatEnabled: false,
    
	requestParameters: null,
	
    afterViewLoad: function() {
        this.inherit();
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = View.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';        	
        }
		this.setLabel();

        var recs = View.dataSources.get("dsYearsCashFlow").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
        
        // Add the cost_cat with cost_type='UTILITY' for Energy Management
        this.m_costCat = '';
        var records = this.selectValueCostCateg_ds.getRecords(new Ab.view.Restriction({"cost_cat.cost_type" : "UTILITY"}));
        for (var i = 0; i < records.length; i++ ){
            var rec = records[i];
            if (i>0) {
              this.m_costCat += Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
            }
            this.m_costCat += rec.getValue('cost_cat.cost_cat_id');
        } 
        this.sh_costCat = '';
        var records = this.selectValueShCostCateg_ds.getRecords();
        for (var i = 0; i < records.length; i++ ){
            var rec = records[i];
            if (i>0) {
              this.sh_costCat += Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
            }
            this.sh_costCat += rec.getValue('bill_type.cost_cat_id');
        } 
        $('cost_cat_id_storage_sh').value = this.sh_costCat;
        
	},
    
    setLabel: function(){
    	this.excludeCostCat_title = getMessage('exclude_cost_cat_of_0')+' '+getMessage('exclude_cost_cat_of_1');
    	this.showCostCat_title = getMessage('show_cost_cat_of_0')+' '+getMessage('show_cost_cat_of_1');
		$('addCostCategory_ex').value = getMessage('add');
		$('clearCostCategory_ex').value = getMessage('clear');
		$('addCostCategory_sh').value = getMessage('add');
		$('clearCostCategory_sh').value = getMessage('clear');

		$('show_cost_associated_with_label').innerHTML = getMessage('show_cost_associated_with_0')+'<br/>'+getMessage('show_cost_associated_with_1');
		$('analyze_cost_from_label').innerHTML = getMessage('analyze_cost_from_0')+'<br/>'+getMessage('analyze_cost_from_1');
		$('show_cost_types_of_label').innerHTML = getMessage('show_cost_types_of_0')+'<br/>'+getMessage('show_cost_types_of_1');
		$('group_results_by_label').innerHTML = getMessage('group_results_by_0')+'<br/>'+getMessage('group_results_by_1');
		$('exclude_cost_cat_of_label').innerHTML = '&#160;'+getMessage('exclude_cost_cat_of_0')+'<br/>'+getMessage('exclude_cost_cat_of_1');
		$('show_cost_cat_of_label').innerHTML = '&#160;&#160;&#160;&#160;'+getMessage('show_cost_cat_of_0')+'<br/>'+getMessage('show_cost_cat_of_1');

    	$('projectionTypeLs_label').innerHTML = getMessage('projectionType_ls');
    	$('projectionTypeBl_label').innerHTML = getMessage('projectionType_bl');
    	$('projectionTypeAc_label').innerHTML = getMessage('projectionType_ac');
    	$('projectionTypeProperty_label').innerHTML = getMessage('projectionType_pr');

    	$('costSourceActual_label').innerHTML = getMessage('costSource_actual');
    	$('costSourceScheduled_label').innerHTML = getMessage('costSource_recur');
    	$('costSourceRecurring_label').innerHTML = getMessage('costSource_sched');

    	$('calculationTypeNetIncome_label').innerHTML = getMessage('calculationType_ie');
    	$('calculationTypeIncome_label').innerHTML = getMessage('calculationType_inc');
    	$('calculationTypeExpense_label').innerHTML = getMessage('calculationType_exp');

    	$('calculationPeriodMonth_label').innerHTML = getMessage('calculationPeriod_month');
    	$('calculationPeriodQuarter_label').innerHTML = getMessage('calculationPeriod_quarter');
    	$('calculationPeriodYear_label').innerHTML = getMessage('calculationPeriod_year');
    },
    
	console_onFilter : function() {
		var regex = /,/g;
		//var record = this.console.getRecord();
		var restriction = this.getConsoleRestriction();
		var cost_radio = document.getElementsByName("costSource");
		this.restriction = restriction;
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
       	if ( !cost_radio[0].checked && !cost_radio[1].checked && !cost_radio[2].checked){
        	View.showMessage(getMessage('cost_mess'));
       		return;
        	}
			
			
		var restriction_tab1 = restriction.replace(/cost_tran_recur/g,"cost_tran_sched");
		var restriction_tab2 = restriction.replace(/cost_tran_recur/g,"cost_tran");
		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';

		restriction_tab1 = restriction_tab1.replace(/date_start/g,"date_trans_created");
		restriction_tab1 = restriction_tab1.replace(/date_end/g,"date_due");
		restriction_tab2 = restriction_tab2.replace(/date_start/g,"date_trans_created");
		restriction_tab2 = restriction_tab2.replace(/date_end/g,"date_due");        

		this.requestParameters["group_by_cost_categ"] = "true";
        
		try {
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getCashFlowProjection', this.requestParameters);
                        
			var controller = this;
		    View.openJobProgressBar(getMessage('searchMessage'), jobId, '', function(status) {
				controller.reportCashFlow.show();
				controller.updateColumnHeadings(controller.reportCashFlow, status.dataSet);
				controller.stripMinusSignFromValues(controller.report, status.dataSet, controller.calculationType);
				controller.reportCashFlow.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType();
				// controller.updateDataSetDimensions(status.dataSet, controller.groupByCostCategory);
				controller.updateDimensionHeadings(controller.projectionType, controller.calculationPeriod, controller.calculationType, status.dataSet);
				controller.appendRollups(controller.reportCashFlow, controller.calculationPeriod);
				controller.appendSubtotals(controller.reportCashFlow, controller.calculationPeriod);
				controller.WF_result = status.dataSet;
		    });
			
		} catch (e) {
  			Workflow.handleError(e);
		}
	},

	getConsoleRestriction: function() { 
		var restriction = "";
		var costAsocWith= "";
        var record = this.console.getRecord();
		var analyzeBy = {
			"property": " cost_tran_recur.pr_id",
			"bl": " cost_tran_recur.bl_id",
			"ac": " cost_tran_recur.ac_id",
			"ls": " cost_tran_recur.ls_id"
		};
        //var analyzeBy = new Array(" cost_tran_recur.ls_id"," cost_tran_recur.ac_id"," cost_tran_recur.bl_id"," cost_tran_recur.pr_id");
        var radioAnalyzeCost = document.getElementsByName("costBy");
        var ctry_id = trim(record.getValue('bl.ctry_id'));
        var regn_id = trim(record.getValue('bl.regn_id'));
        var state_id = trim(record.getValue('bl.state_id'));
        var city_id = trim(record.getValue('bl.city_id'));
        var site_id = trim(record.getValue('bl.site_id'));
        var pr_id = trim(record.getValue('property.pr_id'));
        var bl_id = trim(record.getValue('bl.bl_id'));
        var blGeoRestriction="";
        var prGeoRestriction="";
        var bl_ls_JOIN="";
        var pr_ls_JOIN="";
        
        this.isFromRecurring = $('costSourceRecurring').checked;
        this.isFromScheduled = $('costSourceScheduled').checked;
        this.isFromActualCosts = $('costSourceActual').checked;
        
        var calculationTypeRadio = document.getElementsByName("calculationType");
        for(var i = 0; i < calculationTypeRadio.length; i++) {
        	if (calculationTypeRadio[i].checked) this.calculationType = calculationTypeRadio[i].value;
        }
        
        var calculationPeriodRadio = document.getElementsByName("calculationPeriod");
        for(var i = 0; i < calculationPeriodRadio.length; i++) {
        	if (calculationPeriodRadio[i].checked) this.calculationPeriod = calculationPeriodRadio[i].value;
        }

        var projectionTypeRadio = document.getElementsByName("projectionType");
        for(var i = 0; i < projectionTypeRadio.length; i++) {
        	if (projectionTypeRadio[i].checked){
        		costAsocWith = analyzeBy[projectionTypeRadio[i].value];
        		restriction = " "+ costAsocWith+" IS NOT NULL ";
        		this.projectionType = projectionTypeRadio[i].value;
        	}
        }
		
    	if ( ((pr_id != "") || (bl_id != "") || (ctry_id != "") || (regn_id != "") || (state_id != "") || (city_id != "") || (site_id != "")) || costAsocWith != ' cost_tran_recur.ac_id' ) {
		
			switch (costAsocWith)
				{
					case ' cost_tran_recur.ls_id': 
							bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id ";
							pr_ls_JOIN=" UNION SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id ";
    						if (bl_id != "") {
								blGeoRestriction = " AND bl.bl_id = '" + bl_id + "' ";
    						}  
    						if (pr_id != "") {
								prGeoRestriction += " AND property.pr_id = '" + pr_id + "' ";
								blGeoRestriction += " AND bl.pr_id = '" + pr_id + "' ";
								}
							if (ctry_id && trim(ctry_id) != "") {
								blGeoRestriction += " AND bl.ctry_id = '" + ctry_id +"' ";
								prGeoRestriction += " AND property.ctry_id = '" + ctry_id +"' ";
    						}
    						if (regn_id && trim(regn_id) != "") {
								blGeoRestriction += " AND bl.regn_id = '" + regn_id +"' ";
								prGeoRestriction += " AND property.regn_id = '" + regn_id +"' ";
    						}
    						if (state_id && trim(state_id) != "") {
								blGeoRestriction += " AND bl.state_id = '" + state_id +"' ";
								prGeoRestriction += " AND property.state_id = '" + state_id +"' ";
    						}
    						if (city_id && trim(city_id) != "") {
								blGeoRestriction += " AND bl.city_id = '" + city_id +"' ";
								prGeoRestriction += " AND property.city_id = '" + city_id +"' ";
    						}
    						if (site_id && trim(site_id) != "") {
								blGeoRestriction += " AND bl.site_id = '" + site_id +"' ";
								prGeoRestriction += " AND property.site_id = '" + site_id +"' ";
    						}

    	   					restriction += " AND cost_tran_recur.ls_id IN "+ bl_ls_JOIN + blGeoRestriction + pr_ls_JOIN + prGeoRestriction;
    	   					restriction += ") ";
							break;
					case ' cost_tran_recur.bl_id': 
							restriction += " AND EXISTS(SELECT * FROM bl WHERE bl.bl_id=cost_tran_recur.bl_id ";
							if (ctry_id && trim(ctry_id) != "") {
    							restriction += "AND bl.ctry_id = '" + ctry_id + "' ";
    						}
    						if (regn_id && trim(regn_id) != "") {
    							restriction += "AND bl.regn_id = '" + regn_id + "' ";
    						}
    						if (state_id && trim(state_id) != "") {
    						restriction += "AND bl.state_id = '" + state_id + "' ";
    						}
    						if (city_id && trim(city_id) != "") {
    						restriction += "AND bl.city_id = '" + city_id + "' ";
    						}
    						if (site_id && trim(site_id) != "") {
    						restriction += "AND bl.site_id = '" + site_id + "' ";
    						}
    	   					if (bl_id != "") {
								restriction += " AND bl.bl_id = '" + bl_id + "' ";
							}
							if (pr_id != "") {
							restriction += " AND bl.pr_id = '" + pr_id + "' ";
							}
							restriction += ") ";
							break;
					case ' cost_tran_recur.pr_id': 
							restriction += " AND EXISTS(SELECT * FROM property WHERE property.pr_id=cost_tran_recur.pr_id ";
							if (ctry_id && trim(ctry_id) != "") {
    							restriction += "AND property.ctry_id = '" + ctry_id + "' ";
    						}
    						if (regn_id && trim(regn_id) != "") {
    							restriction += "AND property.regn_id = '" + regn_id + "' ";
    						}
    						if (state_id && trim(state_id) != "") {
    						restriction += "AND property.state_id = '" + state_id + "' ";
    						}
    						if (city_id && trim(city_id) != "") {
    						restriction += "AND property.city_id = '" + city_id + "' ";
    						}
    						if (site_id && trim(site_id) != "") {
    						restriction += "AND property.site_id = '" + site_id + "' ";
    						}
					    	if (pr_id != "") {
							restriction += " AND property.pr_id = '" + pr_id + "' ";
							}
							restriction += ") ";
							break;
				}

    	}
		var check_show_cat = document.getElementById("cost_cat_id_sh_check").checked;
		var check_exculde_cat = document.getElementById("cost_cat_id_ex_check").checked;
		var cost_cat_id_storage_ex = trim($('cost_cat_id_storage_ex').value);
		var cost_cat_id_storage_sh = trim($('cost_cat_id_storage_sh').value);

		if (cost_cat_id_storage_ex != "" && check_exculde_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_ex.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id NOT IN ('" + cost_cat_id + "') ";
		}
		if (cost_cat_id_storage_sh != "" && check_show_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_sh.replace(regex, "','");
//			restriction += "AND cost_tran_recur.cost_cat_id LIKE ('" + cost_cat_id + "') ";
			restriction += "AND cost_tran_recur.cost_cat_id IN ('" + cost_cat_id + "') ";

		}
		
		this.fromYear = $('console_cost.year').value;
        this.toYear = $('console_cost.toyear').value;
		/*
		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		restriction += " AND ((cost_tran_recur.date_start &gt;=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_start &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran_recur.date_end &gt;=${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end &lt;=${sql.date('"+dateEnd+"')}) ";
		restriction += " OR (cost_tran_recur.date_start &lt;${sql.date('"+dateStart+"')} AND cost_tran_recur.date_end &gt;${sql.date('"+dateEnd+"')}) ) ";
		*/
                
        // KB 3045253 - Temporary stop-gap to deal with refactoring of cost service code.
        // See ab-rplm-cost-mgmt-cash-flow-rep.js, refactoring occurred from revision 52->53
		var requestParameters = {
				"ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "", "ls_id": "",
				"multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
				"cost_from": "000", "cost_assoc_with": "", "cost_type_of": "", 
				"date_start":"", "date_end": "", "period":"", "is_fiscal_year": "false", 
				"currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false",
				"exclude_cost_categ":"", "include_cost_categ": "", "group_by_cost_categ": "true"
		};
		if (valueExistsNotEmpty(ctry_id)) {
			requestParameters["ctry_id"] = ctry_id; 
		}
		if (valueExistsNotEmpty(regn_id)) {
			requestParameters["regn_id"] = regn_id; 
		}
		if (valueExistsNotEmpty(state_id)) {
			requestParameters["state_id"] = state_id; 
		}
		if (valueExistsNotEmpty(city_id)) {
			requestParameters["city_id"] = city_id; 
		}
		if (valueExistsNotEmpty(site_id)) {
			requestParameters["site_id"] = site_id; 
		}
		if (valueExistsNotEmpty(pr_id)) {
			requestParameters["pr_id"] = pr_id; 
		}
		if (valueExistsNotEmpty(bl_id)) {
			requestParameters["bl_id"] = bl_id; 
		}        
		requestParameters["date_start"] = this.fromYear + '-01-01';
		requestParameters["date_end"] = this.toYear + '-12-31';
		requestParameters["is_fiscal_year"] = "false";
		requestParameters["period"] = this.calculationPeriod;

        this.isFromRecurring = $('costSourceRecurring').checked;
        this.isFromScheduled = $('costSourceScheduled').checked;
        this.isFromActualCosts = $('costSourceActual').checked;
        
		var arrCostFrom = ['0', '0', '0'];
		if (document.getElementById("costSourceRecurring").checked) {
			arrCostFrom[0] = '1';
		}
		if (document.getElementById("costSourceScheduled").checked) {
			arrCostFrom[1] = '1';
		}
		if (document.getElementById("costSourceActual").checked) {
			arrCostFrom[2] = '1';
		}
		requestParameters["cost_from"] = arrCostFrom.join('');
		requestParameters["cost_assoc_with"] = this.projectionType;
 		requestParameters["cost_type_of"] = this.calculationType;
		// include /exclude cost categories
		if (document.getElementById("cost_cat_id_ex_check").checked && valueExistsNotEmpty(trim($('cost_cat_id_storage_ex').value))) {
			requestParameters["exclude_cost_categ"] = $('cost_cat_id_storage_ex').value.split(",").join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
		}
		if (document.getElementById("cost_cat_id_sh_check").checked && valueExistsNotEmpty(trim($('cost_cat_id_storage_sh').value))) {
			requestParameters["include_cost_categ"] =  this.sh_costCat;
		}
		requestParameters["isMcAndVatEnabled"] = this.isMcAndVatEnabled?"true":"false";
		requestParameters["currency_code"] = this.displayCurrency.code;
		requestParameters["exchange_rate"] = this.displayCurrency.exchangeRateType;
		requestParameters["is_budget_currency"] = (this.displayCurrency.type == 'budget'?"true":"false");
		requestParameters["vat_cost_type"] = this.displayVAT.type;
                    
		this.requestParameters = requestParameters;
        
		return restriction;	
	},

	console_onClear : function() {
		this.console.clear();
		document.getElementById('projectionTypeBl').checked = true;
		document.getElementById('costSourceRecurring').checked = false;
		document.getElementById('costSourceActual').checked = true;
		document.getElementById('costSourceScheduled').checked = false;
		document.getElementById('calculationTypeExpense').checked = true;
		document.getElementById('calculationPeriodMonth').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = true;
		enableGeo();
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

    /**
     * Sets multiple selected items in the grid from specified list of names.
     * @param {grid} Grid panel with multiple selection enabled.
     * @param {fieldName} Name of the field used in the list. 
     * @param {values} Comma-separated list of values.
     */
    setSelectedItems: function (grid, fieldName, values) {
        // prepare the values map for fast indexing
        var valuesMap = {};
        var valuesArray = values.split(',');
        for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            valuesMap[value] = value;
        }
        // select rows
        grid.gridRows.each(function(row) {
            var value = row.getRecord().getValue(fieldName);
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });        
    },
	
	getSelectedItems: function(grid, fieldName) {
        var values = '';
        grid.gridRows.each(function(row) {
            if (row.isSelected()) {
                var value = row.getRecord().getValue(fieldName);
                if (values != '') {
                    values += ',';
                }
                values += value;
            }
        });        
        return values;
    },

    addCostCategory: function(costCat,title_label) {
        // select cost categories in the grid
		this.formSelectValueMultiple_grid.refresh();
		var values = $(costCat).value;
		this.m_costCat = costCat;
        this.setSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id', values);
        this.formSelectValueMultiple_grid.setTitle(title_label);

        this.formSelectValueMultiple_grid.showInWindow({
            width: 600,
            height: 400
        });
    },
	
    formSelectValueMultiple_grid_onAddSelected: function() {
        // get selected cost categories from the grid
        var values = this.getSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id');
        $(this.m_costCat).value = values;
        
        this.formSelectValueMultiple_grid.closeWindow();
    },


	clearCostCategory: function(costCat) {
		$(costCat).value = '';
	},

	updateCostCatStorage: function(newCostCatId, costCat) {
		var cost_cat_id_storage = $(costCat).value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		$(costCat).value = cost_cat_id_storage;
	},

    getCostValues: function(dateStartRestriction, rowMap) {
		var dateStart = null;
		var assetKey = null;
		var costValues = 0.0;
		for (var r = 0, row; row = this.reportCashFlow.dataSet.records[r]; r++) {
			dateStart = row.values['cost_tran_recur.date_start'];

			if (dateStartRestriction === dateStart) {
				if (rowMap != null) {
					assetKey = row.values['cost_tran_recur.'+this.assetKeyLocation];
					if (rowMap.contains(assetKey)) {
						costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
					}
				}
				else {
					costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
				}
			}
		}
		costValues = costValues.toFixed(2) + '';
		costValues = this.dsReportCashFlow.formatValue('cost_tran_recur.amount_income', costValues, true);
		return costValues;
	},
	
	getAssetKeyLocationFromProjectionType: function() {
		switch (this.projectionType) {
		case 'ls': 
			this.assetKeyLocation = 'ls_id';
			break;
		case 'bl': 
			this.assetKeyLocation = 'bl_id';
			break;
		case 'ac': 
			this.assetKeyLocation = 'ac_id';
			break;
		case 'property': 
			this.assetKeyLocation = 'pr_id';
			break;
		}
	},

	updateDataSetDimensions: function(dataSet, update){
		if(update){
            var parentElement = this.reportCashFlow.parentElement.firstChild.firstChild;
            var row = parentElement.childNodes[0];
            var cellElement = row.insertCell(1);
	        cellElement.className = 'AbMdx_DimensionNames';
            row = parentElement.childNodes[1];
            cellElement = row.insertCell(1);
	        cellElement.className = 'AbMdx_DimensionNames first';
			for (var r = 0; r < dataSet.rowValues.length; r++) {
                row = parentElement.childNodes[r+2];
		        cellElement = row.insertCell(1);
		        cellElement.className = 'AbMdx_DimensionRowHeader first';
                
	            var rowTitle = dataSet.rowValues[r].l;
				var rowValue = dataSet.rowValues[r].n;
				var separatorIndex = rowTitle.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				if (separatorIndex >= 0) {
				    var firstTitle	= rowTitle.slice(0, separatorIndex);
				    var secondTitle	= rowTitle.slice(separatorIndex + 1);
                    row.firstChild.innerHTML = firstTitle;
                    row.childNodes[1].innerHTML = secondTitle;
				}
			}
		}
	},
    
	appendSubtotals: function(panel, calculationPeriod) {
		this.summaryRowsAdded = 0;
		for (var r = 0; r < panel.dataSet.rowValues.length; r++) {
			var row = r;
			if ((row != 0) && (this.groupByCostCategory = true)) {
            	
            	var separatorIndexCurrent = panel.dataSet.rowValues[row].n.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
            	var separatorIndexPrevious = panel.dataSet.rowValues[row-1].n.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
                var assetKeyCurrent = panel.dataSet.rowValues[row].n.slice(0, separatorIndexCurrent);
                var assetKeyPrevious = panel.dataSet.rowValues[row-1].n.slice(0, separatorIndexPrevious);

                var rowToSum = null;
                if ((assetKeyCurrent == assetKeyPrevious)) {
                	rowToSum = panel.dataSet.rowValues[row-1].n;
					this.currentRowsForSummation.add(rowToSum, rowToSum);
				}
                
                var parentElement = panel.parentElement.firstChild.firstChild;
                var siblingElement = null;
                
                if (assetKeyCurrent != assetKeyPrevious) {
                	siblingElement = panel.parentElement.firstChild.firstChild.childNodes[(row+2)+this.summaryRowsAdded];
                	rowToSum = panel.dataSet.rowValues[row-1].n;
                	this.currentRowsForSummation.add(rowToSum, rowToSum);
                	this.buildSubTotalRow(panel, calculationPeriod, parentElement, siblingElement);
                	this.summaryRowsAdded++;
            		this.currentRowsForSummation.clear();
                }
                
                if (row+1 == panel.dataSet.rowValues.length) {
                	siblingElement = panel.parentElement.firstChild.firstChild.childNodes[(row+3)+this.summaryRowsAdded];
                	rowToSum = panel.dataSet.rowValues[row].n;
                	this.currentRowsForSummation.add(rowToSum, rowToSum);
                	this.buildSubTotalRow(panel, calculationPeriod, parentElement, siblingElement);
                	this.summaryRowsAdded++;
            		this.currentRowsForSummation.clear();
                }
			}
		}
	},
	
	buildSubTotalRow: function(panel, calculationPeriod, parentElement, siblingElement) {
		var rowElement = document.createElement('tr');

		var cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
        cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
		cellElement = document.createElement('td');
		cellElement.className = 'AbMdx_TotalCellHeader';
		
		cellElement.appendChild(document.createTextNode(getMessage('groupSubtotals')));

        rowElement.appendChild(cellElement);

        var dateStart = null;
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_SubTotalRowData';
			dateStart = panel.dataSet.columnValues[c].n;
			
			var costValues = this.getCostValues(dateStart, this.currentRowsForSummation);
			
			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.insertBefore(rowElement, siblingElement);
	},

	appendRollups: function(panel, calculationPeriod) {
		var parentElement = panel.parentElement.firstChild.lastChild;

		var rowCount = panel.dataSet.records.length;
		var rowElement = document.createElement('tr');
		rowElement.className = (rowCount % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
		
		var cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
        cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
		cellElement = document.createElement('td');
		cellElement.className = 'AbMdx_TotalCellHeader';
		
		switch (calculationPeriod) {
			case 'MONTH': 
				cellElement.appendChild(document.createTextNode(getMessage('monthly_totals')));
				break;
			case 'QUARTER': 
				cellElement.appendChild(document.createTextNode(getMessage('quarterly_totals')));
				break;
			case 'YEAR': 
				cellElement.appendChild(document.createTextNode(getMessage('yearly_totals')));
				break;
		}
        
        rowElement.appendChild(cellElement);

        var dateStart = null;
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_SubTotalRowData';
			cellElement.style.fontWeight = 'bold';
			dateStart = panel.dataSet.columnValues[c].n;
			
			var costValues = this.getCostValues(dateStart, null);

			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.appendChild(rowElement);
	},

	updateDimensionHeadings: function(projectionType, calculationPeriod, calculationType, dataSet) {
		
		this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[1].innerHTML = getMessage('CostCategory');
		var ptitle = "";       
		switch (projectionType) {
			case 'ls': 
				ptitle = getMessage('leaseCode');
				break;
			case 'bl': 
				ptitle = getMessage('buildingCode');
				break;
			case 'ac': 
				ptitle = getMessage('accountCode');
				break;
			case 'pr': 
				ptitle = getMessage('propertyCode');
				break;
			}
        
		this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = ptitle;
                
		switch (calculationPeriod) {
			case 'MONTH': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_month');
				break;
			case 'QUARTER': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_quarter');
				break;
			case 'YEAR': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_year');
				break;
		}
		
		for (var i = 0; i < dataSet.rowValues.length; i++) {
			switch (calculationType) {
			case 'NETINCOME': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[2].innerHTML = getMessage('measure_netincome');
				break;
			case 'INCOME': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[2].innerHTML = getMessage('measure_income');
				break;
			case 'EXPENSE': 
				this.reportCashFlow.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[2].innerHTML = getMessage('measure_expenses');
				break;
			}
			
		}
    },

	updateColumnHeadings: function(panel, dataSet) {
		switch (this.calculationPeriod) {
  			case 'MONTH': 
  				this.getMonthColumnHeadings(panel, dataSet);
  				break;
  			case 'QUARTER': 
  				this.getQuarterColumnHeadings(panel, dataSet);
  				break;
  			case 'YEAR': 
  				this.getYearColumnHeadings(panel, dataSet);
  				break;
  		}
    },

	getYearColumnHeadings: function(panel, dataSet) {
		var year = null;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			year = dataSet.columnValues[c].n.match(regexYear)[0];
			dataSet.columnValues[c].l = year;
		}
    },
    
	getQuarterColumnHeadings: function(panel, dataSet) {
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			year = dataSet.columnValues[c].n.match(regexYear)[0];
			if (month == '01' || month == '02' || month == '03') {
				month = getMessage('quarter1');
			}
			if (month == '04' || month == '05' || month == '06') {
				month = getMessage('quarter2');
			}
			if (month == '07' || month == '08' || month == '09') {
				month = getMessage('quarter3');
			}
			if (month == '10' || month == '11' || month == '12') {
				month = getMessage('quarter4');
			}
			dataSet.columnValues[c].l = month + '/' + year;
		}
    },
    
	getMonthColumnHeadings: function(panel, dataSet) {
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			year = dataSet.columnValues[c].n.match(regexYear)[0];
			dataSet.columnValues[c].l = month + '/' + year;
		}
    },

    populateYearSelectLists: function(recs, year_select, is_to_year) {
    	year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
        var optionIndexCurrentYear = null;
        if (is_to_year) {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        else {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        
    },

    stripMinusSignFromValues: function(panel, dataSet, calculationType) {
		var regex = /-/g;
		var localizedAmount = null;
		var amount = null;
		
		if (calculationType != "EXPENSE") {
			return 0;
		}
		
		for (var c = 0; c < dataSet.records.length; c++) {
			localizedAmount = dataSet.records[c].localizedValues['cost_tran_recur.amount_income'].replace(regex, '');
			dataSet.records[c].localizedValues['cost_tran_recur.amount_income'] = localizedAmount;
			amount = dataSet.records[c].values['cost_tran_recur.amount_income'].replace(regex, '');
			dataSet.records[c].values['cost_tran_recur.amount_income'] = amount;
		}
    },
    
    getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	}
});

function user_addCostCategory_ex() {
	var controller = View.controllers.get('calculateCashFlow');
	controller.addCostCategory('cost_cat_id_storage_ex',controller.excludeCostCat_title);
}


function user_addCostCategory_sh() {
	var controller = View.controllers.get('calculateCashFlow');
	controller.addCostCategory('cost_cat_id_storage_sh',controller.showCostCat_title);
}

function user_clearCostCategory_ex() {
	var controller = View.controllers.get('calculateCashFlow');
	controller.clearCostCategory('cost_cat_id_storage_ex');
}


function user_clearCostCategory_sh() {
	var controller = View.controllers.get('calculateCashFlow');
	controller.clearCostCategory('cost_cat_id_storage_sh');
}

function changeYear(amount, fieldId) {
	var controller = View.controllers.get('calculateCashFlow');
	controller.changeYear(amount, fieldId);
}
function disableGeo(){
	this.controller.console.setFieldValue('bl.ctry_id', '');
	this.controller.console.setFieldValue('bl.regn_id', '');
	this.controller.console.setFieldValue('bl.city_id', '');
	this.controller.console.setFieldValue('bl.state_id', '');
	this.controller.console.setFieldValue('bl.site_id', '');
	this.controller.console.setFieldValue('bl.bl_id', '');
	this.controller.console.setFieldValue('property.pr_id', '');
    this.controller.console.enableField('bl.ctry_id', false);
    this.controller.console.enableField('bl.regn_id', false);
    this.controller.console.enableField('bl.city_id', false);
    this.controller.console.enableField('bl.site_id', false);
    this.controller.console.enableField('bl.state_id', false);
    this.controller.console.enableField('bl.bl_id', false);
    this.controller.console.enableField('property.pr_id', false);
}
function enableGeo(){
    var radioProperty = document.getElementById("projectionTypeProperty");
    this.controller.console.enableField('bl.ctry_id', true);
    this.controller.console.enableField('bl.regn_id', true);
    this.controller.console.enableField('bl.city_id', true);
    this.controller.console.enableField('bl.site_id', true);
    this.controller.console.enableField('bl.state_id', true);
    this.controller.console.enableField('property.pr_id', true);
    if(radioProperty.checked){
    	this.controller.console.enableField('bl.bl_id', false);
		this.controller.console.setFieldValue('bl.bl_id', '');
    }else{
    	this.controller.console.enableField('bl.bl_id', true);
    }
}
function check_exclude(){
	if(document.getElementById("cost_cat_id_ex_check").checked){
		document.getElementById("cost_cat_id_sh_check").checked = true;
	}
}
function check_show(){
	if(document.getElementById("cost_cat_id_sh_check").checked){
		document.getElementById("cost_cat_id_ex_check").checked = false;
	}
}	
function showDetails(event){
	
View.openDialog('ab-energy-cash-flow-rep-details.axvw', null, true, {
            width: 1000,
            height: 400,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('cashFlowCtrlDetails');
                dialogController.setCashFlowParameters( View.controllers.get('calculateCashFlow').WF_result,
                										View.controllers.get('calculateCashFlow').projectionType,
                										View.controllers.get('calculateCashFlow').isFromRecurring,
                										View.controllers.get('calculateCashFlow').isFromScheduled,
                										View.controllers.get('calculateCashFlow').isFromActualCosts,event,
                										View.controllers.get('calculateCashFlow').restriction,
                										View.controllers.get('calculateCashFlow').calculationPeriod);
            }});
	
}
