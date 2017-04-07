var abStraightLineRentController = View.createController('abStraightLineRentController', {
	
	startDate: null,
	endDate: null,
	// chart variables
	chartDataAxisLabel: '',
	chartGoupingAxisLabel: '',
	chartData: [],
	
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
	isGgroupByCostCategory: false,
	requestParameters: null,
	
	afterViewLoad: function(){
		this.isMcAndVatEnabled = View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1;
		// MC & VAT 
		if (this.isMcAndVatEnabled) {
			this.displayVAT.type = 'total';
			this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = this.view.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	this.abStraightLineRentFilter_form.displayVAT = this.displayVAT;
        	this.abStraightLineRentFilter_form.displayCurrency = this.displayCurrency;
		} else {
			this.isMcAndVatEnabled = false;
		}
		// populate time range limits dropdowns
		this.populateTimeRangeLimits();
		
	},
	
	afterInitialDataFetch: function(){
		this.setFilterValues("ls", new Array("cost_tran_recur"), "NETINCOME", "MONTH", "calendar", new Date().getFullYear(), new Date().getFullYear());
		
	},
	
	/**
	 * onFilter event handler.
	 */
	abStraightLineRentFilter_form_onFilter: function(){
		var requestParameters = {
				"ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "", "ls_id": "",
				"multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
				"cost_from": "111", "cost_assoc_with": "ls", "cost_type_of": "NETINCOME", 
				"date_start":"", "date_end": "", "period":"", "is_fiscal_year": "true", 
				"currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false",
				"group_by_cost_categ": "false", "Base_Rent_Category" : ""
		};

		if (this.validateFilter()) {
			this.chartData = [];
			this.chartDataAxisLabel = '';
			this.chartGoupingAxisLabel = '';
			this.isGgroupByCostCategory = false;
			
			var objConsole = this.abStraightLineRentFilter_form;
			// geographical fields
			var ctryId = objConsole.getFieldValue("bl.ctry_id");
			if (valueExistsNotEmpty(ctryId)) {
				requestParameters["ctry_id"] = ctryId; 
			}
			var regnId = objConsole.getFieldValue("bl.regn_id");
			if (valueExistsNotEmpty(regnId)) {
				requestParameters["regn_id"] = regnId; 
			}
			var stateId = objConsole.getFieldValue("bl.state_id");
			if (valueExistsNotEmpty(stateId)) {
				requestParameters["state_id"] = stateId; 
			}
			var cityId = objConsole.getFieldValue("bl.city_id");
			if (valueExistsNotEmpty(cityId)) {
				requestParameters["city_id"] = cityId; 
			}
			var siteId = objConsole.getFieldValue("bl.site_id");
			if (valueExistsNotEmpty(siteId)) {
				requestParameters["site_id"] = siteId; 
			}
			var prId = objConsole.getFieldValue("bl.pr_id");
			if (valueExistsNotEmpty(prId)) {
				requestParameters["pr_id"] = prId; 
			}
			var blId = objConsole.getFieldValue("bl.bl_id");
			if (valueExistsNotEmpty(blId)) {
				requestParameters["bl_id"] = blId; 
			}
			
			this.calculateDateRange();
			var yearType = getRadioButtonValue("radTimeRangeType");
			requestParameters["period"] = getRadioButtonValue("radTimeRangeSpan");
			requestParameters["is_fiscal_year"] = (yearType == 'fiscal'?"true":"false");
			
			requestParameters["date_start"] = this.abStraightLineRentFilter_ds.formatValue('bl.date_bl', this.startDate, false);
			requestParameters["date_end"] = this.abStraightLineRentFilter_ds.formatValue('bl.date_bl', this.endDate, false);
			requestParameters["isMcAndVatEnabled"] = this.isMcAndVatEnabled?"true":"false";
			requestParameters["group_by_cost_categ"] = this.isGgroupByCostCategory?"true":"false";
			requestParameters["Base_Rent_Category"] = this.view.activityParameters["AbRPLMCosts-Base_Rent_Category"]; 
			
			
			if (this.isMcAndVatEnabled) {
				requestParameters["currency_code"] = this.abStraightLineRentFilter_form.displayCurrency.code;
				requestParameters["exchange_rate"] = this.abStraightLineRentFilter_form.displayCurrency.exchangeRateType;
				requestParameters["is_budget_currency"] = (this.abStraightLineRentFilter_form.displayCurrency.type == 'budget'?"true":"false");
				requestParameters["vat_cost_type"] = this.abStraightLineRentFilter_form.displayVAT.type;
			}
			this.requestParameters = requestParameters;

			var controller = this;
			// refresh report panel
			this.getReportDataSet(controller, controller.abStraightLineRentOverviewReport, controller.requestParameters , function(){
				var panelTitle = getMessage("report_title") + getVatTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled);
				controller.abStraightLineRentOverviewReport.setTitle(panelTitle);
				
				// select first tab and disable the other two tabs
				controller.abStraightLineRentTabs.selectTab('abStraightLineRentOverviewTab');
				controller.abStraightLineRentTabs.enableTab('abStraightLineRentDetailsTab', false);
			});
		}
	},
	
	// export overview to XLS
	abStraightLineRentOverviewReport_onExportToXLS: function(){
		var viewName = "ab-repm-cost-straight-line-rent.axvw";
		var title = this.abStraightLineRentOverviewReport.title;
		var groupByFields = this.abStraightLineRentOverviewReport.groupByFields;
		var calculatedFields = this.abStraightLineRentOverviewReport.calculatedFields;
		
		var requestParameters = this.requestParameters;
		// group by cost categ false
		requestParameters["group_by_cost_categ"] = "false";
		requestParameters["ls_id"] = "";
		
		this.exportToXls(viewName, title, groupByFields, calculatedFields, requestParameters);
		
	},
	
	// export details to XLS
	abStraightLineRentDetailsReport_onExportToXLS: function() {
		var viewName = "ab-repm-cost-straight-line-rent.axvw";
		var title = this.abStraightLineRentDetailsReport.title;
		var groupByFields = this.abStraightLineRentDetailsReport.groupByFields;
		var calculatedFields = this.abStraightLineRentDetailsReport.calculatedFields;
		
		var requestParameters = this.requestParameters;
		// group by cost categ false
		requestParameters["group_by_cost_categ"] = "true";
		this.exportToXls(viewName, title, groupByFields, calculatedFields, requestParameters);
	},
	
	// export to xls common function
	exportToXls: function(viewName, title, groupByFields, calculatedFields, requestParameters){
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		try {

			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getStraightLineRentXlsReport', 
					viewName,
					title,
					groupByFields,
					calculatedFields,										
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
	
	// show overview chart
	abStraightLineRentOverviewReport_onChart: function(){
		var chartTitle = getMessage("chartTitle").replace("{0}", getVatTypeMessage(this.displayVAT.type, this.isMcAndVatEnabled));
		var curencyCode = this.isMcAndVatEnabled?this.displayCurrency.code:"";
		
		View.openDialog('ab-repm-cost-straight-line-rent-chart.axvw', null, false, {
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
	},
	
	// refresh report
	getReportDataSet: function(controller, panel, requestParameters, callback){
		try {
			/*
			* Job parameters: final Date dateFrom, final Date dateTo,
        	*			final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
        	*			final Map<String, String> currencyReqParam
			*/
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getStraightLineRentProjection', requestParameters);
			View.openJobProgressBar(getMessage('jobStatusCalculating'), jobId, '', function(status) {
				panel.show();
				setCurrencyCodeForFields(panel, requestParameters['currency_code']);
				controller.updateDataSetDimensions(status.dataSet, controller.isGgroupByCostCategory);
				controller.updateColumnHeadings(panel, status.dataSet, requestParameters['period']);
				//controller.stripMinusSignFromValues(panel, status.dataSet, controller.showCostTypeOf);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType(requestParameters['cost_assoc_with']);
				controller.updateDimensionHeadings(panel, requestParameters['cost_assoc_with'], requestParameters['period'], requestParameters['cost_type_of'], status.dataSet);
				controller.appendRollups(panel, requestParameters['period']);
				controller.WF_result = status.dataSet;
		    	// Show error message
		    	if (valueExists(status.jobProperties.missingExchangeRate)) {
		    		View.showMessage(status.jobProperties.missingExchangeRate);
		    	}
				// if callback is defined 
				if (callback) {
					callback.call();
				}
		    });
			
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	// Show straight line rent details for lease
	showDetailsForLease: function(leaseCode){
		// send previous filter restriction, all filter changes are ignored when show details
		this.isGgroupByCostCategory =  true;
		var requestParameters = this.requestParameters;
		requestParameters["ls_id"] = leaseCode;
		requestParameters["group_by_cost_categ"] = this.isGgroupByCostCategory?"true":"false";;		
		
		var controller = this;
		var panel = this.abStraightLineRentDetailsReport;
		try {
			panel.show(false);
			/*
			* Job parameters: final leaseCode, final Date dateFrom, final Date dateTo,
        	*			final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
        	*			final Map<String, String> currencyReqParam
			*/
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getStraightLineRentProjection', requestParameters);
			View.openJobProgressBar(getMessage('jobStatusCalculating'), jobId, '', function(status) {
				panel.show();
				setCurrencyCodeForFields(panel, requestParameters['currency_code']);
				controller.updateDataSetDimensions(status.dataSet,  controller.isGgroupByCostCategory);
				controller.updateColumnHeadings(panel, status.dataSet, requestParameters['period']);
				//controller.stripMinusSignFromValues(panel, status.dataSet, controller.showCostTypeOf);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType(requestParameters['cost_assoc_with']);
				controller.updateDimensionHeadings(panel, requestParameters['cost_assoc_with'], requestParameters['period'], requestParameters['cost_type_of'], status.dataSet);
				controller.WF_result = status.dataSet;
				
				// select first tab and disable the other two tabs
				controller.abStraightLineRentTabs.enableTab('abStraightLineRentDetailsTab', true);
				controller.abStraightLineRentTabs.selectTab('abStraightLineRentDetailsTab');
				
				panel.setTitle(getMessage("reportDetails_title").replace("{0}", getVatTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled))+" "+ leaseCode);
			});
			
		} catch (e) {
			Workflow.handleError(e);
		}

	},
	
	/**
	 * Validate filter selection
	 */
	validateFilter: function(){
		var timeRangeFrom = $("selTimeRangeFrom").value;
		var timeRangeTo = $("selTimeRangeTo").value;
		if (parseInt(timeRangeFrom) > parseInt(timeRangeTo)) {
			View.showMessage(getMessage("errInvalidTimeRange"));
			return false;
		}
//		this.showCostsFrom = getCheckBoxValues("chkShowCostsFrom");
//		if (this.showCostsFrom.length == 0) {
//			View.showMessage(getMessage("errNoValueShowCostFrom"));
//			return false;
//		}
		return true;
	},
	
	/**
	 * Calculate time range dates.
	 */
	calculateDateRange: function() {
		var yearType = getRadioButtonValue("radTimeRangeType");
		var timeRangeFrom = $("selTimeRangeFrom").value;
		var timeRangeTo = $("selTimeRangeTo").value;


		if(yearType === 'calendar'){
			this.startDate = timeRangeFrom + '-01-01';
			this.endDate = timeRangeTo + '-12-31';
		}else if(yearType === 'fiscal'){
			var fromFiscalYear = new Date();
			var toFiscalYear = new Date();
			fromFiscalYear.setYear(timeRangeFrom);
			toFiscalYear.setYear(timeRangeTo);
			
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
				
				var ds = View.dataSources.get('abStraightLineRentFilter_ds');
				this.startDate = ds.formatValue('bl.date_bl', fromFiscalYear, false);
				this.endDate = ds.formatValue('bl.date_bl', toFiscalYear, false);
				
			} catch (e) {
				Workflow.handleError(e);
			}
			
		}
	},

	
	/**
	 * onClear event handler.
	 */
	abStraightLineRentFilter_form_onClear: function(){
		this.abStraightLineRentFilter_form.clear();
		
		if (this.isMcAndVatEnabled) {
			this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = this.view.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	this.abStraightLineRentFilter_form.displayVAT = this.displayVAT;
        	this.abStraightLineRentFilter_form.displayCurrency = this.displayCurrency;
		}
		
		this.setFilterValues("ls", new Array("cost_tran_recur"), "NETINCOME", "MONTH", "calendar", new Date().getFullYear(), new Date().getFullYear());
	},
	
	/**
	 * Filter values.
	 */
	setFilterValues: function(showCostsFor, showCostsFrom, showCostTypeOf, timeRangeSpan, timeRangeType, timeRangeFrom, timeRangeTo){
		this.setFieldValue("radShowCostFor", showCostsFor, true);
		this.setFieldValue("chkShowCostsFrom", showCostsFrom, true);
		this.setFieldValue("radShowCostTypeOf", showCostTypeOf, true);
		this.setFieldValue("radTimeRangeSpan", timeRangeSpan , true);
		this.setFieldValue("radTimeRangeType", timeRangeType, true);
		var objYearFrom = document.getElementById("selTimeRangeFrom");
		if (objYearFrom && objYearFrom.options.length > 0) {
			objYearFrom.value = timeRangeFrom;
		}
		var objYearTo = document.getElementById("selTimeRangeTo");
		if (objYearTo && objYearTo.options.length > 0) {
			objYearTo.value = timeRangeTo;
		}
		this.onChangeShowCostsFor(showCostsFor);
	},
	
	/**
	 * Set filter field value.
	 */
	setFieldValue: function(fieldId, value, custom){
		if (valueExistsNotEmpty(value)) {
			if (custom) {
				if (isArray(value)) {
					// is checkbox
					setCheckBoxValues(fieldId, value);
				}else{
					// is radio button
					setRadioButtonValue(fieldId, value);
				}
			} else {
				var strValue = '';
				if(isArray(value)){
					strValue = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}else if (valueExistsNotEmpty(value)){
					strValue = value;
				}
				this.abStraightLineRentFilter_form.setFieldValue(fieldId, strValue);
			}
		}
	},
	
	/**
	 * Populate time range select elements.
	 */
	populateTimeRangeLimits: function(){
		var afmYearDs = this.view.dataSources.get("abAfmCalDateYear_ds");
		var records = afmYearDs.getRecords();
		populateDropDown("selTimeRangeFrom", records, "afm_cal_dates.year", new Date().getFullYear());
		populateDropDown("selTimeRangeTo", records, "afm_cal_dates.year", new Date().getFullYear());
	},
	
	/**
	 * On change ShowCostsFrom handler.
	 * Enable/disable console fields 
	 */
	onChangeShowCostsFor: function(value){
		this.abStraightLineRentFilter_form.enableField("bl.ctry_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.regn_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.state_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.city_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.site_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.pr_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.bl_id", (value != "ac" && value != 'pr' && value != 'lsPr'));
		if (value == 'ac') {
			this.abStraightLineRentFilter_form.setFieldValue("bl.ctry_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.regn_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.state_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.city_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.site_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.pr_id", "");
		}
		if (value == "ac" || value == 'pr' || value == 'lsPr') {
			this.abStraightLineRentFilter_form.setFieldValue("bl.bl_id", "");
		}
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
					dataSet.rowValues[r].l = getMessage("cost_type_"+secondTitle);
				}
			}
		}
	},

	updateColumnHeadings: function(panel, dataSet, timeRangeSpan) {
		switch (timeRangeSpan) {
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
		var dataSource = this.abStraightLineRentFilter_ds;
		var dateStart = dataSource.formatValue('bl.date_bl', this.startDate, false);
		var dateEnd = dataSource.formatValue('bl.date_bl', this.endDate, false);
		
		var quarters = getQuarters(dateStart, dateEnd);
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
    
    stripMinusSignFromValues: function(panel, dataSet, calculationType) {
		var regex = /-/g;
		var localizedAmount = null;
		var amount = null;
		
		if (calculationType != "EXPENSE") {
			return 0;
		}
		
		for (var c = 0; c < dataSet.records.length; c++) {
			var lsId = dataSet.records[c].values['cost_tran_recur.ls_id'];
			if (lsId.indexOf('|b_li_credit') == -1 && lsId.indexOf('|e_differential_rent') == -1 && lsId.indexOf('|f_differential_rent_cumul') == -1 ) {
				localizedAmount = dataSet.records[c].localizedValues['cost_tran_recur.amount_income'].replace(regex, '');
				dataSet.records[c].localizedValues['cost_tran_recur.amount_income'] = localizedAmount;
				amount = dataSet.records[c].values['cost_tran_recur.amount_income'].replace(regex, '');
				dataSet.records[c].values['cost_tran_recur.amount_income'] = amount;
			}
		}
    },
    
	getAssetKeyLocationFromProjectionType: function(showCostsFor) {
		var assetKeyLocation = ""
		switch (showCostsFor) {
		case 'ls_bl': 
			assetKeyLocation = 'ls_id';
			break;
		case 'ls_pr': 
			assetKeyLocation = 'ls_id';
			break;
		case 'ls': 
			assetKeyLocation = 'ls_id';
			break;
		case 'bl': 
			assetKeyLocation = 'bl_id';
			break;
		case 'ac': 
			assetKeyLocation = 'ac_id';
			break;
		case 'pr': 
			assetKeyLocation = 'pr_id';
			break;
		}
		return assetKeyLocation;
	},
	
	
	updateDimensionHeadings: function(panel, projectionType, calculationPeriod, calculationType, dataSet) {
		
		if(panel.id == 'abStraightLineRentDetailsReport'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = '';
		}else if(panel.id == 'abStraightLineRentOverviewReport') {
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
				case 'pr': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('propertyCode');
					break;
				}
			
			// remove link element from columns header
			for (var i = 0; i < dataSet.columnValues.length; i++) {
				panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[i+2].innerHTML = dataSet.columnValues[i].l;
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

		var measureTitle = getMessage('measure_sl_rent');
		if (panel.id == 'abStraightLineRentDetailsReport'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[1].style.display = "none";
			measureTitle = "";
		}
		
		for (var i = 0; i < dataSet.rowValues.length; i++) {
			if (panel.id == 'abStraightLineRentDetailsReport') {
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].style.display = "none";
			}else{
				switch (calculationType) {
				case 'NETINCOME': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				case 'INCOME': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				case 'EXPENSE': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				}
			}
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
			if(panel.id === 'abStraightLineRentOverviewReport'){
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
	}
});

/**
 * On click handler
 * @param context
 */
function onClickOverview(context){
	var restriction = context.restriction;
	if (restriction) {
		var clause = restriction.findClause('cost_tran_recur.ls_id');
		var leaseCode = clause.value;
		var controller = View.controllers.get("abStraightLineRentController");
		controller.showDetailsForLease(leaseCode);
	}
}


/**
 * Set checkbox values.
 * @param elemName element NAME, must be the same for entire checkbox collection
 * @param values selected values
 */
function setCheckBoxValues(elemName, values){
	var elCollection = document.getElementsByName(elemName);
	for (var i = 0; i < elCollection.length; i++) {
		var objElem = elCollection[i];
		objElem.checked = (values.indexOf(objElem.value) != -1);
	}
}

/**
 * Get checkbox values.
 * @param elemName element NAME, must be the same for entire checkbox collection
 * @returns selected values
 */
function getCheckBoxValues(elemName){
	var values = [];
	var objElements = document.getElementsByName(elemName);
	for (var i = 0; i < objElements.length; i++) {
		var objElem = objElements[i];
		if (objElem.checked) {
			values.push(objElem.value);
		}
	}
	return values;
}

/**
 * Set radio button value.
 * @param elemId radio button name
 * @param value selected value
 */
function setRadioButtonValue(elemId, value){
	var objElem = document.getElementsByName(elemId);
	if (objElem) {
		for (var i = 0; i < objElem.length; i++) {
			if (objElem[i].value === value) {
				objElem[i].checked = true;
				break;
			}
		}
	}
}

/**
 * Get radio button selected value.
 * @param elemId element id
 * @returns selected value
 */
function getRadioButtonValue(elemId){
	var objElem = document.getElementsByName(elemId);
	var value = null;
	if (objElem) {
		for (var i = 0; i < objElem.length; i++) {
			if (objElem[i].checked) {
				value = objElem[i].value;
				break;
			}
		}
	}
	return value;
}

/**
 * Populate drop dopwn list from records collection.
 * @param elemId select element id
 * @param records  records collection
 * @param fieldId record field name
 * @param selectedValue selected value
 */
function populateDropDown(elemId, records, fieldId, selectedValue){
	var objSelectElem = document.getElementById(elemId);
	if (objSelectElem) {
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			var value = record.getValue(fieldId);
			var option = document.createElement("option");
			option.value = value;
			option.text = value;
			objSelectElem.options.add(option);
		}
		if (valueExistsNotEmpty(selectedValue)) {
			objSelectElem.value = selectedValue;
		}
	}
}

function isArray(object){
	if(object instanceof Array){
		return true;
	}
	
	if(typeof object !== 'object'){
		return false;
	}
	
	if(getObjectType(object) === "array"){
		return true;
	}
}

function getObjectType(obj){
	if (obj === null || typeof obj === 'undefined') {
        return String (obj);
    }
    return Object.prototype.toString.call(obj)
        .replace(/\[object ([a-zA-Z]+)\]/, '$1').toLowerCase();
}


/**
 * Set selected currency to datasource field definition.
 */
function setCurrencyCodeForFields(panel, currencyCode){
	var dataSource = panel.getDataSource();
	dataSource.fieldDefs.each(function(fieldDef){
		if(valueExists(fieldDef.currency)){
			fieldDef.currency = currencyCode;
		}
	});
}

function getQuarters(startDate, endDate){
	var result  = new Ext.util.MixedCollection();
	var regexMonth = /\d{2}/g;
	var startMonth = startDate.match(regexMonth)[2];
	var counter = parseInt(startMonth);
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 3; j++){
			result.add(counter, {quarter: i+1});
			counter = (counter + 1 == 13 ? 1: counter + 1);
		}
	}
	return result;
}

/**
 * Get cost type label.
 * 
 * @param vatType selected vat tpe
 * @param isMcAndVatEnabled
 * @returns {String}
 */
function getVatTypeMessage(vatType, isMcAndVatEnabled){
	if(isMcAndVatEnabled){
		return " - " + getMessage("vatType_"+ vatType);
	}else{
		return "";
	}
}

