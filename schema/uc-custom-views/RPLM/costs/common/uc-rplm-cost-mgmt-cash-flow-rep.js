var controller = View.createController('calculateCashFlow', {

	fromYear: null,
	toYear: null,
	fromDate: null,
	toDate: null,
	groupByCostCategory: false,
	calculationPeriod: null,
	WF_result: null,
	currentRowsForSummation: new Ext.util.MixedCollection(),
	summaryRowsAdded: 0,
	assetKeyLocation: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	rowRestriction:null,
	isActiveRecurringCost: 1,
	// chart variables
	chartDataAxisLabel: '',
	chartGoupingAxisLabel: '',
	chartData: [],
	printableRestriction: [],
	
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
	
	showExchangeRateError: true,
	
	requestParameters: null,
	
	queryParameterNames: ['bl_id', 'pr_id'],
	queryParameters: null,
	isDemoMode: false,
	
    afterViewLoad: function() {
        this.inherit();
        this.isDemoMode = isInDemoMode();
        this.queryParameters =  readQueryParameters(this.queryParameterNames);
        
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = View.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	
        	this.console.displayVAT = this.displayVAT;
        	this.console.displayCurrency = this.displayCurrency;
        }
		this.setLabel();

        var recs = View.dataSources.get("dsYearsCashFlow").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
		// remove click event from second dimension header
		this.reportCashFlow.getColumnHtml = getColumnHtmlWithoutClick;
	},
    
	afterInitialDataFetch: function(){
		// set query parameters and refresh view if is demo mode
		if (valueExistsNotEmpty(this.queryParameters['bl_id'])) {
			this.console.setFieldValue('bl.bl_id', this.queryParameters['bl_id']);
		}
		
		if (valueExistsNotEmpty(this.queryParameters['pr_id'])) {
			this.console.setFieldValue('property.pr_id', this.queryParameters['pr_id']);
		}
		if (this.isDemoMode) {
			this.console_onFilter();
		}
		
		
	},
	
    setLabel: function(){
    	this.excludeCostCat_title = getMessage('exclude_cost_cat_of').replace('{0}', ' ');
    	this.showCostCat_title = getMessage('show_cost_cat_of').replace('{0}', ' ');
		
		setButtonLabels(new Array('addCostCategory_ex','clearCostCategory_ex'), new Array('add','clear'));
		setButtonLabels(new Array('addCostCategory_sh','clearCostCategory_sh'), new Array('add','clear'));

		$('exclude_cost_cat_of_label').innerHTML = '&#160;' + getMessage('exclude_cost_cat_of').replace('{0}', '<br/>');
		$('show_cost_cat_of_label').innerHTML = '&#160;' + getMessage('show_cost_cat_of').replace('{0}', '<br/>');
		this.console.setFieldLabel('analyze_costs_for', this.console.getFieldLabelElement('analyze_costs_for').innerHTML.replace('{0}', '<br/>'));
		this.console.setFieldLabel('from_year_to_year', this.console.getFieldLabelElement('from_year_to_year').innerHTML.replace('{0}', '<br/>'));
		
		// wrap the labels
		this.console.getFieldLabelElement('show_cost_associated_with').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('analyze_cost_from').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('show_cost_types_of').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('group_results_by').style.whiteSpace = 'normal';
    },
    
	console_onFilter : function() {
		// read filter restriction
		this.getConsoleRestriction();
		
		var cost_radio = document.getElementsByName("costSource");
		
		this.requestParameters["group_by_cost_categ"] = "false";
		
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
       	if ( !cost_radio[0].checked && !cost_radio[1].checked && !cost_radio[2].checked) {
        	View.showMessage(getMessage('cost_mess'));
       		return;
        }
		
		if(valueExists(this.console.displayVAT)){
			this.displayVAT = this.console.displayVAT;
		}
		if(valueExists(this.console.displayCurrency)){
			this.displayCurrency = this.console.displayCurrency;
		}

		var panel = this.reportCashFlow;
		panel.show(false);
		// we must reset chart custom data
        this.chartData = [];
        
		this.calculateCashFlow(this, panel, this.requestParameters); 
		
		var panelTitle = getMessage("reportCashFlow_title") + getCostTypeMessage(this.displayVAT.type, this.isMcAndVatEnabled);
		panel.setTitle(panelTitle);
		
		// select first tab and disable the other two tabs
		controller.tabsCashFlow.selectTab('tabCashFlow');
		controller.tabsCashFlow.enableTab('tabCashFlowDetails', false);
		
	},
	
	calculateCashFlow: function(controller, panel, requestParameters){
		
		var displayError  = this.showExchangeRateError;
		
		try {
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getCashFlowProjection', requestParameters);
		    View.openJobProgressBar(getMessage('searchMessage'), jobId, '', function(status) {

		    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
		    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
		    		return true;
		    	}
		    	
				panel.show();
				setCurrencyCodeForFields(panel, requestParameters["currency_code"]);
				controller.updateDataSetDimensions(status.dataSet, requestParameters["group_by_cost_categ"]);
				controller.updateColumnHeadings(panel, status.dataSet);
				controller.stripMinusSignFromValues(panel, status.dataSet, requestParameters["cost_type_of"]);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType(requestParameters["cost_assoc_with"]);
				controller.updateDimensionHeadings(panel, requestParameters["cost_assoc_with"], requestParameters["period"], requestParameters["cost_type_of"], status.dataSet);
				controller.appendRollups(panel, controller.calculationPeriod);
				controller.WF_result = status.dataSet;
				
		    	// Show error message
		    	if (displayError && valueExists(status.jobProperties.missingExchangeRate)) {
		    		controller.showExchangeRateError = false;
		    		View.showMessage(status.jobProperties.missingExchangeRate);
		    	}
				
		    });
			
		} catch (e) {
  			Workflow.handleError(e);
		}
		
	},

	//XXX: XLS report
	reportCashFlow_onReport : function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		var requestParameters = this.requestParameters;
		requestParameters["group_by_cost_categ"] = "false";
		requestParameters["ls_id"] = "";
		try {

			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getCashFlowProjectionXLSReport', 
					this.reportCashFlow.viewDef.viewName + '.axvw',
					this.reportCashFlow.title,
					this.reportCashFlow.groupByFields,
					this.reportCashFlow.calculatedFields,										
					requestParameters);
			
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
		} catch (e) {
			View.closeProgressBar();
  			Workflow.handleError(e);
		}

	},
	reportCashFlowDetails_onReport : function() {
		if(this.rowRestriction){
			View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		 	
			var requestParameters = this.requestParameters;
			requestParameters["group_by_cost_categ"] = "true";


			try {

				var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getCashFlowProjectionXLSReport', 
						this.reportCashFlow.viewDef.viewName + '.axvw',
						this.reportCashFlow.title,
						this.reportCashFlow.groupByFields,
						this.reportCashFlow.calculatedFields,										
						requestParameters);
				
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
			} catch (e) {
				View.closeProgressBar();
	  			Workflow.handleError(e);
			}
			
		}
	},
	
	getConsoleRestriction: function(){
		this.printableRestriction = [];
		
		var requestParameters = {
				"ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "", "ls_id": "",
				"multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
				"cost_from": "000", "cost_assoc_with": "", "cost_type_of": "", 
				"date_start":"", "date_end": "", "period":"", "is_fiscal_year": "true", 
				"currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false",
				"exclude_cost_categ":"", "include_cost_categ": "", "group_by_cost_categ": "false"
		};
		
		var objConsole = this.console;
		// geographical fields
		var ctryId = objConsole.getFieldValue("bl.ctry_id");
		if (valueExistsNotEmpty(ctryId)) {
			requestParameters["ctry_id"] = ctryId; 
			this.printableRestriction.push({'title': this.console.fields.get('bl.ctry_id').fieldDef.title, 'value': ctryId});
		}
		var regnId = objConsole.getFieldValue("bl.regn_id");
		if (valueExistsNotEmpty(regnId)) {
			requestParameters["regn_id"] = regnId; 
        	this.printableRestriction.push({'title': this.console.fields.get('bl.regn_id').fieldDef.title, 'value': regnId});
		}
		var stateId = objConsole.getFieldValue("bl.state_id");
		if (valueExistsNotEmpty(stateId)) {
			requestParameters["state_id"] = stateId; 
        	this.printableRestriction.push({'title': this.console.fields.get('bl.state_id').fieldDef.title, 'value': stateId});
		}
		var cityId = objConsole.getFieldValue("bl.city_id");
		if (valueExistsNotEmpty(cityId)) {
			requestParameters["city_id"] = cityId; 
        	this.printableRestriction.push({'title': this.console.fields.get('bl.city_id').fieldDef.title, 'value': cityId});
		}
		var siteId = objConsole.getFieldValue("bl.site_id");
		if (valueExistsNotEmpty(siteId)) {
			requestParameters["site_id"] = siteId; 
			this.printableRestriction.push({'title': this.console.fields.get('bl.site_id').fieldDef.title, 'value': siteId});
		}
		var prId = objConsole.getFieldValue("property.pr_id");
		if (valueExistsNotEmpty(prId)) {
			requestParameters["pr_id"] = prId; 
			this.printableRestriction.push({'title': this.console.fields.get('property.pr_id').fieldDef.title, 'value': prId});
		}
		var blId = objConsole.getFieldValue("bl.bl_id");
		if (valueExistsNotEmpty(blId)) {
			requestParameters["bl_id"] = blId; 
			this.printableRestriction.push({'title': this.console.fields.get('bl.bl_id').fieldDef.title, 'value': blId});
		}

		this.fromYear = $('console_cost.year').value;
        this.toYear = $('console_cost.toyear').value;
        this.printableRestriction.push({'title': this.console.fields.get('from_year_to_year').fieldDef.title.replace('{0}', ' '), 'value': this.fromYear + " - " + this.toYear});
		
		var costForPeriod = getRadioButtonValue("analyzeCostFor");
		this.setStartEndDate(costForPeriod, this.fromYear, this.toYear);
		// dates
		requestParameters["date_start"] = controller.fromDate;
		requestParameters["date_end"] = controller.toDate;

		requestParameters["is_fiscal_year"] = (costForPeriod == 'fiscal'?"true":"false");
		this.calculationPeriod = getRadioButtonValue("calculationPeriod");
		requestParameters["period"] = this.calculationPeriod;
		this.printableRestriction.push({'title': this.console.fields.get('group_results_by').fieldDef.title, 'value': getMessage("calculationPeriod_" + requestParameters["period"])});
		
		var arrCostFrom = ['0', '0', '0'];
		var costSourceList = [];
		if (document.getElementById("costSourceRecurring").checked) {
			arrCostFrom[0] = '1';
			costSourceList.push(getMessage("costSourceRecurring"));
		}
		if (document.getElementById("costSourceScheduled").checked) {
			arrCostFrom[1] = '1';
			costSourceList.push(getMessage("costSourceScheduled"));
		}
		if (document.getElementById("costSourceActual").checked) {
			arrCostFrom[2] = '1';
			costSourceList.push(getMessage("costSourceActual"));
		}
		requestParameters["cost_from"] = arrCostFrom.join('');
		this.printableRestriction.push({'title': this.console.fields.get('analyze_cost_from').fieldDef.title, 'value': costSourceList.join(",")});

		// lease associated with
		requestParameters["cost_assoc_with"] = getRadioButtonValue("projectionType");
		this.printableRestriction.push({'title': this.console.fields.get('show_cost_associated_with').fieldDef.title, 'value': getMessage("projectionType_" + requestParameters["cost_assoc_with"])});
		
		requestParameters["cost_type_of"] = getRadioButtonValue("calculationType");
		this.printableRestriction.push({'title': this.console.fields.get('show_cost_types_of').fieldDef.title, 'value': getMessage("calculationType_" + requestParameters["cost_type_of"])});
		
		// include /exclude cost categories
		if (document.getElementById("cost_cat_id_ex_check").checked && valueExistsNotEmpty(trim($('cost_cat_id_storage_ex').value))) {
			requestParameters["exclude_cost_categ"] = trim($('cost_cat_id_storage_ex').value);
			this.printableRestriction.push({'title': getMessage('exclude_cost_cat_of').replace('{0}', ' '), 'value': trim($('cost_cat_id_storage_ex').value)});
		}
		if (document.getElementById("cost_cat_id_sh_check").checked && valueExistsNotEmpty(trim($('cost_cat_id_storage_sh').value))) {
			requestParameters["include_cost_categ"] =  trim($('cost_cat_id_storage_sh').value);
			this.printableRestriction.push({'title': getMessage('show_cost_cat_of').replace('{0}', ' '), 'value': trim($('cost_cat_id_storage_sh').value)});
		}
		
		
		// MC and VAt 
		requestParameters["isMcAndVatEnabled"] = View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1?"true":"false";
		if (this.isMcAndVatEnabled) {
	        if(valueExists(this.console.displayVAT)){
	        	this.printableRestriction.push({'title': getMessage("costTypeTitle"), 'value': getMessage("titleCostType_" + this.console.displayVAT.type)});
			}
			if(valueExists(this.console.displayCurrency)){
				this.printableRestriction.push({'title': getMessage("currencyTypeTitle"), 'value': getMessage("currencyType_" + this.console.displayCurrency.type)});
				this.printableRestriction.push({'title': getMessage("currencyTitle"), 'value': this.console.displayCurrency.code});
				this.printableRestriction.push({'title': getMessage("exchangeRateTypeTitle"), 'value': getMessage("exchangeRateType_" + this.console.displayCurrency.exchangeRateType)});
			}
			requestParameters["currency_code"] = this.console.displayCurrency.code;
			requestParameters["exchange_rate"] = this.console.displayCurrency.exchangeRateType;
			requestParameters["is_budget_currency"] = (this.console.displayCurrency.type == 'budget'?"true":"false");
			requestParameters["vat_cost_type"] = this.console.displayVAT.type;
		}
		this.requestParameters = requestParameters;
	},
	
	setStartEndDate: function(analyzeCostFor, fromYear, toYear){
		if(analyzeCostFor === 'calendar'){
			this.fromDate = fromYear + '-01-01';
			this.toDate = toYear + '-12-31';
		}else if(analyzeCostFor === 'fiscal'){
			var fromFiscalYear = new Date();
			var toFiscalYear = new Date();
			fromFiscalYear.setYear(fromYear);
			toFiscalYear.setYear(toYear);
			
			var fiscalYearDay = 1;
			var fiscalYearMonth = 1;
			var params = {
				tableName: 'afm_scmpref',
				fieldNames: toJSON(['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth', 'afm_scmpref.afm_scmpref']),
				restriction: toJSON({
					'afm_scmpref.afm_scmpref': 0
				})
			};
			try {
				var result = Workflow.call('AbCommonResources-getDataRecords', params);
				var record = result.dataSet.records[0];
				fiscalYearDay = record.getValue('afm_scmpref.fiscalyear_startday');
				fiscalYearMonth = record.getValue('afm_scmpref.fiscalyear_startmonth');
//				fromFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
//				toFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
				fromFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(1));
				toFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(1));
				toFiscalYear = toFiscalYear.add(Date.YEAR, 1);
				
				var ds = View.dataSources.get('dsConsoleCashFlow');
				this.fromDate = ds.formatValue('bl.date_bl', fromFiscalYear, false);
				this.toDate = ds.formatValue('bl.date_bl', toFiscalYear, false);
				
			} catch (e) {
				Workflow.handleError(e);
			}
			
		}
	},
	
	console_onClear : function() {
		this.console.clear();
		document.getElementById('projectionTypeLs').checked = true;
		document.getElementById('costSourceRecurring').checked = true;
		document.getElementById('costSourceActual').checked = false;
		document.getElementById('costSourceScheduled').checked = false;
		document.getElementById('calculationTypeNetIncome').checked = true;
		document.getElementById('calculationPeriodMonth').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = false;
		document.getElementById('analyzeCostForCalendar').checked = true;
		enableGeo();
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
        var customDefaults = {
        			displayVat : {
        				type : 'total'
        			},
        			displayCurrency : {
        				type : 'user',
        				code : View.user.userCurrency.code,
        				exchangeRateType: 'Payment'
        			}
        		};
        resetMcAndVatVariables(this, this.console, customDefaults);
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
                    values += Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
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

        this.formSelectValueMultiple_grid.showInWindow({
            width: 600,
            height: 400,
            title: title_label
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

    getCostValues: function(panel, dateStartRestriction, rowMap) {
		var dateStart = null;
		var assetKey = null;
		var costValues = 0.0;
		for (var r = 0, row; row = panel.dataSet.records[r]; r++) {
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
		costValues = costValues.toFixed(2);
		return costValues;
	},
	
	getAssetKeyLocationFromProjectionType: function(projectionType) {
		switch (projectionType) {
		case 'ls_bl': 
			this.assetKeyLocation = 'ls_id';
			break;
		case 'ls_pr': 
			this.assetKeyLocation = 'ls_id';
			break;
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
		cellElement.className = 'AbMdx_TotalCellHeader';
		
		switch (calculationPeriod) {
			case 'MONTH': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('monthly_totals')));
				this.chartDataAxisLabel = getMessage('monthly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_month');
				break;
			}
			case 'QUARTER': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('quarterly_totals')));
				this.chartDataAxisLabel = getMessage('quarterly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_quarter');
				break;
			}
			case 'YEAR': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('yearly_totals')));
				this.chartDataAxisLabel = getMessage('yearly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_year');
				break;
			}
		}
        
        rowElement.appendChild(cellElement);
        var dateStart = null;
        var dateStartLabel = null;
        var ds = panel.getDataSource();
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_SubTotalRowData';
			cellElement.style.fontWeight = 'bold';
			dateStart = panel.dataSet.columnValues[c].n;
			dateStartLabel = panel.dataSet.columnValues[c].l;
			
			var costValues = this.getCostValues(panel, dateStart, null);
			if(panel.id === 'reportCashFlow'){
				// prepare data set for chart
				var crtValue = costValues;
				var positiveValue = 0.0;
				var negativeValue = 0.0;
				if (crtValue >= 0.0){
					positiveValue = crtValue;
				}else{
					negativeValue = crtValue;
				}
				/*
				var crtRecord = {'cost_tran_recur.date_start': dateStartLabel,
						'cost_tran_recur.positive_amount_income': positiveValue,
						'cost_tran_recur.negative_amount_income': negativeValue
					};
				*/
				var crtRecord = {'cost_tran_recur.date_start': dateStartLabel,
						'cost_tran_recur.net_amount_income': crtValue
					};
				this.chartData.push(crtRecord);
			}
			costValues = ds.formatValue('cost_tran_recur.amount_income', costValues+ '', true);
			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.appendChild(rowElement);
	},

	updateDimensionHeadings: function(panel, projectionType, calculationPeriod, calculationType, dataSet) {
		
		if(panel.id == 'reportCashFlowDetails'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('CostCategory');
		}else if(panel.id == 'reportCashFlow') {
			switch (projectionType) {
				case 'ls_bl': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
				case 'ls_pr': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
				case 'ls': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
				case 'bl': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('buildingCode');
					break;
				case 'ac': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('accountCode');
					break;
				case 'property': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('propertyCode');
					break;
				}
		}

		switch (calculationPeriod) {
			case 'MONTH': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_month');
				break;
			case 'QUARTER': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_quarter');
				break;
			case 'YEAR': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_year');
				break;
		}

		for (var i = 0; i < dataSet.rowValues.length; i++) {
			switch (calculationType) {
			case 'NETINCOME': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_netincome');
				break;
			case 'INCOME': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_income');
				break;
			case 'EXPENSE': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_expenses');
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
		var quarters = getQuarters(this.fromDate, this.toDate);
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			if (!valueExistsNotEmpty(year) || (c % 4 == 0)){
				year = dataSet.columnValues[c].n.match(regexYear)[0];
			}
			var quarter = getMessage('quarter' + quarters.get(parseInt(month)).quarter);

			dataSet.columnValues[c].l = quarter + '/' + year;
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
	},
	updateDataSetDimensions: function(dataSet, update){
		if(update){
			dataSet.type = "1d";
			for (var r = 0; r < dataSet.rowValues.length; r++) {
	            var rowTitle = dataSet.rowValues[r].l;
				var rowValue = dataSet.rowValues[r].n;
				var separatorIndex = rowTitle.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				if (separatorIndex >= 0) {
				    var secondTitle	= rowTitle.slice(separatorIndex + Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length);
					dataSet.rowValues[r].l = secondTitle;
				}
			}
		}
	},
	getAssetKeyLabel: function(projectionType){
		switch (projectionType) {
			case 'ls_bl': 
				return getMessage('leaseCode');
			case 'ls_pr': 
				return getMessage('leaseCode');
			case 'ls': 
				return getMessage('leaseCode');
			case 'bl': 
				return getMessage('buildingCode');
			case 'ac': 
				return getMessage('accountCode');
			case 'property': 
				return getMessage('propertyCode');
			}
	},
	/*
	 * Open chart in pop-up
	 */
	reportCashFlow_onChart: function(){
		//??????
		var chartTitle = getMessage("chartTitle").replace("{0}", getCostTypeMessage(this.displayVAT.type, this.isMcAndVatEnabled)) + " " + getMessage("projectionType_"+this.requestParameters["cost_assoc_with"]);
		var curencyCode = this.isMcAndVatEnabled?this.displayCurrency.code:"";
		
		View.openDialog('ab-rplm-cost-mgmt-cash-flow-chart.axvw', null, false, {
			width: 800, 
		    height: 600, 
		    closeButton: true,
		    dataAxisLabel: this.chartDataAxisLabel,
		    groupingAxisLabel: this.chartGoupingAxisLabel,
		    dataSet: this.chartData,
		    printableRestriction: this.printableRestriction,
		    panelTitle: chartTitle,
		    currencyCode: curencyCode
		});
		
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
    var radioLeaseProperty = document.getElementById("projectionTypels_pr");
    this.controller.console.enableField('bl.ctry_id', true);
    this.controller.console.enableField('bl.regn_id', true);
    this.controller.console.enableField('bl.city_id', true);
    this.controller.console.enableField('bl.site_id', true);
    this.controller.console.enableField('bl.state_id', true);
    this.controller.console.enableField('property.pr_id', true);
    if(radioProperty.checked || radioLeaseProperty.checked){
    	this.controller.console.enableField('bl.bl_id', false);
		this.controller.console.setFieldValue('bl.bl_id', '');
    }else{
    	this.controller.console.enableField('bl.bl_id', true);
    }
}
function check_exclude(){
	if(document.getElementById("cost_cat_id_ex_check").checked){
		document.getElementById("cost_cat_id_sh_check").checked = false;
	}
}
function check_show(){
	if(document.getElementById("cost_cat_id_sh_check").checked){
		document.getElementById("cost_cat_id_ex_check").checked = false;
	}
}	

function onClickCashFlow(event){
	var controller = View.controllers.get('calculateCashFlow');
	controller.rowRestriction = event.restriction.findClause('cost_tran_recur.ls_id');
	
	if(controller.rowRestriction){
		controller.requestParameters["group_by_cost_categ"] = "true";
		controller.requestParameters[controller.assetKeyLocation] = controller.rowRestriction.value;
		
		var panel = View.panels.get('reportCashFlowDetails');
		panel.show(false);
		controller.calculateCashFlow(controller, panel, controller.requestParameters); 	
		// select first tab and disable the other two tabs
		controller.tabsCashFlow.enableTab('tabCashFlowDetails', true);
		controller.tabsCashFlow.selectTab('tabCashFlowDetails');
		
		panel.setTitle(getMessage("reportCashFlowDetails_title").replace("{0}", getCostTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled))+" "+controller.getAssetKeyLabel(controller.requestParameters["cost_assoc_with"])+": "+ controller.rowRestriction.value);
	}
}

function onClickCashFlowDetails(event){
	var controller = View.controllers.get('calculateCashFlow');
	var rowRestriction = controller.rowRestriction;
	var eventRestriction = event.restriction.findClause('cost_tran_recur.ls_id');
	if(rowRestriction && !eventRestriction){
		event.restriction.addClause('cost_tran_recur.ls_id', rowRestriction.value, '=');
	}
	
	View.openDialog('uc-rplm-cost-mgmt-cash-flow-rep-details.axvw', null, true, {
            width: 1000,
            height: 400,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('cashFlowCtrlDetails');
                dialogController.setCashFlowParameters( View.controllers.get('calculateCashFlow').WF_result,
                										View.controllers.get('calculateCashFlow').requestParameters["cost_assoc_with"],
                										View.controllers.get('calculateCashFlow').requestParameters["cost_from"].substr(0, 1) == 1,
                										View.controllers.get('calculateCashFlow').requestParameters["cost_from"].substr(1, 1) == 1,
                										View.controllers.get('calculateCashFlow').requestParameters["cost_from"].substr(2, 1) == 1,
                										event,
                										'1=1',
                										View.controllers.get('calculateCashFlow').calculationPeriod, 
                										View.controllers.get('calculateCashFlow').isMcAndVatEnabled, 
                										View.controllers.get('calculateCashFlow').displayVAT, 
                										View.controllers.get('calculateCashFlow').displayCurrency);
            }});
	
}

function setButtonLabels(arrButtons, arrLabels){
	var maxLabelIndex = -1;
	var maxLabelLength = -1;
	var maxWidth = 0;
	for(var i=0; i < arrLabels.length; i++){
		var crtText = getMessage(arrLabels[i]);
		if(crtText.length > maxLabelLength){
			maxLabelLength = crtText.length;
			maxLabelIndex = i;
		}
	}
	// set label for maxLabelIndex
	var objButton = document.getElementById(arrButtons[maxLabelIndex]);
	objButton.value = getMessage(arrLabels[maxLabelIndex]);
	maxWidth = objButton.clientWidth;
	for(var i =0;i < arrButtons.length; i++){
		var crtObj = document.getElementById(arrButtons[i]);
		crtObj.value = getMessage(arrLabels[i]);
		crtObj.style.width = (maxWidth+10) +"px";
	}
}

/**
 * Returns column cell HTML for specified column index and cell value without click event.
 * ONLY FOR reportCashFlow tpo Remove Click event from second dimension header
 * @param {Object} c
 * @param {Object} cellValue
 */
function getColumnHtmlWithoutClick(c, cellValue){
	return this.getItemHtml(this.id + '_column_c' + c, cellValue, false);
}

/**
 * Returns selected option for radio button.
 * @param radioButtonName radion button name
 * @returns selected value
 */
function getRadioButtonValue(radioButtonName){
	var value = null;
	var objRadioButton = document.getElementsByName(radioButtonName);
	if (objRadioButton) {
		for (var i = 0; i < objRadioButton.length; i++) {
			if (objRadioButton[i].checked) {
				value = objRadioButton[i].value;
				break;
			}
		}
	} 
	return value;
}



