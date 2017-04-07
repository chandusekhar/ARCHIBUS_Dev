var controller = View.createController('calculateLeaseCosts', {

	year: null,
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
        this.isMcAndVatEnabled = View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1;
		// initialize vat variables
		if (this.isMcAndVatEnabled) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        	
        	this.console.displayVAT = this.displayVAT;
        	this.console.displayCurrency = this.displayCurrency;
        }
		
		setButtonLabels(new Array('addCostCategory', 'clearCostCategory'), new Array('add', 'clear'));
		
        var recs = View.dataSources.get("yearsDs").getRecords();
        var year_select = $('console_ls.year');
        year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
        var optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear())
        year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        year_select.value = this.getSystemYear();
        $('cost_cat_id_storage').value = 'RENT - BASE RENT';
	},
    
	console_onFilter : function() {
		var requestParameters = {
				"ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "",
				"multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
				"cost_from": "100", "cost_assoc_with": "ls", "cost_type_of": "NETINCOME", 
				"date_start":"", "date_end": "", "period":"MONTH", "is_fiscal_year": "false",
				"isMcAndVatEnabled":"", "currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false",
				"include_cost_categ": "", "group_by_cost_categ": "false"
		};
		
		this.year = $('console_ls.year').value;
		requestParameters["date_start"] = this.year + "-01-01";
		requestParameters["date_end"] = this.year + "-12-31";
		// geo fields
		var ctry_id = this.console.getFieldValue("bl.ctry_id");
		if (valueExistsNotEmpty(ctry_id)) {
        	requestParameters["ctry_id"] = ctry_id;
		}
		var regn_id = this.console.getFieldValue("bl.regn_id");
		if (valueExistsNotEmpty(regn_id)) {
        	requestParameters["regn_id"] = regn_id;
		}
		var state_id = this.console.getFieldValue("bl.state_id");
		if (valueExistsNotEmpty(state_id)) {
        	requestParameters["state_id"] = state_id;
		}
		var city_id = this.console.getFieldValue("bl.city_id");
		if (valueExistsNotEmpty(city_id)) {
        	requestParameters["city_id"] = city_id;
		}
		var site_id = this.console.getFieldValue("bl.site_id");
		if (valueExistsNotEmpty(site_id)) {
        	requestParameters["site_id"] = site_id;
		}
		var pr_id = this.console.getFieldValue("ls.pr_id");
		if (valueExistsNotEmpty(pr_id)) {
        	requestParameters["pr_id"] = pr_id;
		}
		var bl_id = this.console.getFieldValue("ls.bl_id");
		if (valueExistsNotEmpty(bl_id)) {
        	requestParameters["bl_id"] = bl_id;
		}
		
		// cost category
        var cost_cat_id_storage = trim($('cost_cat_id_storage').value);
        if (valueExistsNotEmpty(cost_cat_id_storage)) {
        	requestParameters["include_cost_categ"] = cost_cat_id_storage.split(',').join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
        }
		
		var objFilter =  this.console;
		if(valueExists(objFilter.displayVAT)){
			this.displayVAT = objFilter.displayVAT;
		}
		if(valueExists(objFilter.displayCurrency)){
			this.displayCurrency = objFilter.displayCurrency;
		}
		requestParameters["isMcAndVatEnabled"] = this.isMcAndVatEnabled?"true":"false";
		if (this.isMcAndVatEnabled) {
			requestParameters["currency_code"] = this.displayCurrency.code;
			requestParameters["exchange_rate"] = this.displayCurrency.exchangeRateType;
			requestParameters["is_budget_currency"] = (this.displayCurrency.type == 'budget'?"true":"false");
			requestParameters["vat_cost_type"] = this.displayVAT.type;
		}	
		
		this.requestParameters = requestParameters;
		
		try {
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getCashFlowProjection', requestParameters);
			var controller = this;
			
		    View.openJobProgressBar(getMessage('searchMessage'), jobId, '', function(status) {
		    	
		    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
		    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
		    		return true;
		    	}

		    	if (valueExists(status.jobProperties.errorMessage)) {
		    		View.showMessage(status.jobProperties.errorMessage);
		    	}
				controller.report.show();
				setCurrencyCodeForFields(controller.report, requestParameters["currency_code"]);
				controller.stripDaysFromColumnHeadings(controller.report, status.dataSet);
				controller.stripMinusSignFromValues(controller.report, status.dataSet);
				controller.report.setDataSet(status.dataSet);
				controller.appendRollups(controller.report);
				controller.WF_result = status.dataSet;
				var panelTitle = getMessage("title_report") + getCostTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled);
				controller.report.setTitle(panelTitle);
		    });
			
		} catch (e) {
  			Workflow.handleError(e);
		}
	},

	//XXX: XLS report
	report_onReport : function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		var requestParameters = this.requestParameters;
		try {
			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getCashFlowProjectionXLSReport', 
					this.report.viewDef.viewName + '.axvw',
					this.report.title,
					this.report.groupByFields,
					this.report.calculatedFields,										
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
	console_onClear : function() {
		this.console.clear();
		$('cost_cat_id_storage').value = 'RENT - BASE RENT';
		this.cost_cat_id_sh = '';
		var year_select = $('console_ls.year');
		var optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear())
        year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        year_select.value = this.getSystemYear();
        resetMcAndVatVariables(this, this.console);
	},

	getConsoleRestriction: function() { 
		var restriction = "";
        var ctry_id = getConsoleFieldValue(this.console, 'bl.ctry_id');
        var regn_id = getConsoleFieldValue(this.console, 'bl.regn_id');
        var state_id = getConsoleFieldValue(this.console, 'bl.state_id');
        var city_id = getConsoleFieldValue(this.console, 'bl.city_id');
        var site_id = getConsoleFieldValue(this.console, 'bl.site_id');
        var pr_id = getConsoleFieldValue(this.console, 'ls.pr_id');
        var bl_id = getConsoleFieldValue(this.console, 'ls.bl_id');

    	if (valueExistsNotEmpty(ctry_id) || valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id)
    			|| valueExistsNotEmpty(city_id) || valueExistsNotEmpty(site_id)) {
        	if (valueExistsNotEmpty(ctry_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.ctry_id ELSE property.ctry_id END) in " + toSQLRestrString(ctry_id);
    		}
    		if (valueExistsNotEmpty(regn_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.regn_id ELSE property.regn_id END) in " + toSQLRestrString(regn_id);
    		}
    		if (valueExistsNotEmpty(state_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.state_id ELSE property.state_id END) in " + toSQLRestrString(state_id);
    		}
    		if (valueExistsNotEmpty(city_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.city_id ELSE property.city_id END) in " + toSQLRestrString(city_id);
    		}
    		if (valueExistsNotEmpty(site_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.site_id ELSE property.site_id END) in " + toSQLRestrString(site_id);
    		}
    	}

    	if (valueExistsNotEmpty(pr_id)) {
			restriction += "AND ls.pr_id in " + toSQLRestrString(pr_id);
		}
    	if (valueExistsNotEmpty(bl_id)) {
			restriction += "AND ls.bl_id in " + toSQLRestrString(bl_id);
		}
        
        restriction += ") ";

		var cost_cat_id_storage = trim($('cost_cat_id_storage').value);
		if (cost_cat_id_storage != "") {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id IN ('" + cost_cat_id + "') ";
		}
		
		restriction += "AND cost_tran_recur.status_active = 1 ";
		// this part of the restriction is only for the details report
		restriction += "AND cost_tran_recur.amount_expense IS NOT NULL ";
		restriction += "AND cost_tran_recur.amount_expense > 0 ";

		return restriction;	
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

	addCostCategory: function() {
		var title = getMessage('costCat');
		Ab.view.View.selectValue(
		        '', title, ['ls.cost_cat_id'], 'cost_cat', ['cost_cat.cost_cat_id'], ['cost_cat.cost_cat_id','cost_cat.cost_class_id'], null, 
		        function(fieldName, newValue, oldValue) {
		        	var calculateLeaseCostsController = this.View.controllers.get('calculateLeaseCosts');
		        	calculateLeaseCostsController.updateCostCatStorage(newValue);
	                return false;
	            }, false, false, '',null,null,null,null,"[{'fieldName': 'cost_cat.cost_cat_id', 'sortOrder': 1}]");
	},

	clearCostCategory: function() {
		$('cost_cat_id_storage').value = 'RENT - BASE RENT';
		this.cost_cat_id_sh = '';
	},

	changeYear: function(amount, fieldId) {
		if ($(fieldId)) {
			var field_value = $(fieldId).value? parseInt($(fieldId).value) : 2000; 
			$(fieldId).value = amount + field_value;
		}
	},

	updateCostCatStorage: function(newCostCatId) {
		var cost_cat_id_storage = $('cost_cat_id_storage').value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		$('cost_cat_id_storage').value = cost_cat_id_storage;
	},

	getCostValues: function(dateStartRestriction) {
		var dateStart = null;
		var costValues = 0.0;
		for (var r = 0, row; row = this.report.dataSet.records[r]; r++) {
			dateStart = row.values['cost_tran_recur.date_start'];
			if (dateStart == dateStartRestriction) {
				costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
			}
		}
		costValues = costValues.toFixed(2);
		costValues = this.reportDs.formatValue('cost_tran_recur.amount_income', costValues, true);
		return costValues;
	},

	appendRollups: function(panel) {
		var parentElement = panel.parentElement.firstChild.lastChild;

		var rowCount = panel.dataSet.records.length;
		var rowElement = document.createElement('tr');
		rowElement.className = (rowCount % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
		
		var cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.className = 'AbMdx_DimensionRowHeader';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
		cellElement = document.createElement('td');
		cellElement.className = 'AbMdx_DimensionRowHeader';
        cellElement.appendChild(document.createTextNode(getMessage('monthly_totals')));
        rowElement.appendChild(cellElement);

		var dateStart = null;
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_MeasureCellData';
			cellElement.style.fontWeight = 'bold';
			dateStart = panel.dataSet.columnValues[c].n;
			var costValues = this.getCostValues(dateStart);
			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.appendChild(rowElement);
	},

	stripDaysFromColumnHeadings: function(panel, dataSet) {
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

    stripMinusSignFromValues: function(panel, dataSet) {
		var regex = /-/g;
		var localizedAmount = null;
		var amount = null;
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

function user_form_addCostCategory() {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.addCostCategory();
}

function user_form_clearCostCategory() {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.clearCostCategory();
}

function user_form_changeYear(amount, fieldId) {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.changeYear(amount, fieldId);
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
		crtObj.style.width = maxWidth+10;
	}
}
