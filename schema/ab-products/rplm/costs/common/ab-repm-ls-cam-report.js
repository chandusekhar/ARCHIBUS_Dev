var abRepmLsCamReportController = View.createController('abRepmLsCamReportController', {
	// selected lease code	
	lsId: null,
	
	activityParamBaseRent: "'RENT - BASE RENT'",
	activityParamCamEstimate: "'RENT - CAM ESTIMATE'",
	activityParamCamReconciliation: "'RENT - CAM RECONCILIATION'",

	fromSelectedYear: "",
	toSelectedYear: "",
	
	projectionType: "ls",
	calculationPeriod: "YEAR",
	calculationType: "NETINCOME",
	groupByCostCategory: true,
	isFromActualCosts: true,
	isFromScheduled: true,
	isFromRecurring: true,
	showExchangeRateError: true,
	cashFlowDataSet: null,
	

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

	afterViewLoad: function() {
		// initialize year selects
		this.initYears();
        
        // get cost category activity parameters
		this.initCostCat();
        
		// initialize currency variables
        this.initVatAndMultiCurrency();
	},
	
	abRepmLsCamReportFilter_onFilter: function(){
		// lease code
		this.lsId = this.abRepmLsCamReportFilter.getFieldValue("ls.ls_id");
		if (!valueExistsNotEmpty(this.lsId)) {
			View.showMessage(getMessage("msgSelectLease"));
			return false;
		}
		
		// years
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var fromSelectedYear = fromyear_select.options[fromyear_select.selectedIndex].value;
		var toSelectedYear = toyear_select.options[toyear_select.selectedIndex].value;
		
		if(fromSelectedYear > toSelectedYear){
			View.showMessage(getMessage("msgSelectYearRange"));
			return false;
		}
		this.fromSelectedYear = fromSelectedYear;
		this.toSelectedYear = toSelectedYear;
		
		// VAT
		if(valueExists(this.abRepmLsCamReportFilter.displayVAT)){
			this.displayVAT = this.abRepmLsCamReportFilter.displayVAT;
		}
		
		// currency
		if(valueExists(this.abRepmLsCamReportFilter.displayCurrency)){
			this.displayCurrency = this.abRepmLsCamReportFilter.displayCurrency;
		}

		var dateFrom = this.fromSelectedYear + "-01-01";
		var dateTo = this.toSelectedYear + "-12-31";
		
		var requestParameters = {
				"cost_from": "111",
				"date_start":dateFrom, "date_end": dateTo, "period":"YEAR", "is_fiscal_year": "false",
				"currency_code":this.displayCurrency.code, "exchange_rate": this.displayCurrency.exchangeRateType, "vat_cost_type":this.displayVAT.type,  
				"is_budget_currency": (this.displayCurrency.type == 'budget'?"true":"false"),
				"Base_Rent_Category" : this.activityParamBaseRent, "CAM_Estimate": this.activityParamCamEstimate, "CAM_Reconciliation": this.activityParamCamReconciliation
		};
		
		// call summarize cost job 
		//'AbCommonResources-CostReportingService-calculateCamReconciliation'
		try{
			var result = Workflow.callMethod('AbCommonResources-CostReportingService-calculateCamReconciliation', this.lsId, requestParameters);
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause("ccost_sum.user_name", this.view.user.name, "=");
				restriction.addClause("ccost_sum.report_name", "cam_reconciliation", "=");
				setCurrencyCodeForFields(this.abRepmLsCamReportCosts, this.displayCurrency.code);
				this.abRepmLsCamReportCosts.refresh(restriction);
			}
			
			
		} catch(e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Set panel parameter based on user settings.
	 * @param panel
	 * @param isMcAndVatEnabled
	 * @param displayCurrency
	 * @return exchangeRate
	 * 
	 */
	setMCAndVATParameters: function(grid, isMcAndVatEnabled, displayCurrency){
		var exchangeRate = 1;
		var exchangeRateForVatAmount = 1;
		var currencyCode = "";
		var exchangeRateType = "";
		if(isMcAndVatEnabled && (displayCurrency.type == "user" || displayCurrency.type == "custom")){
			currencyCode = displayCurrency.code;
			exchangeRateType = displayCurrency.exchangeRateType;
			exchangeRate = "${sql.exchangeRateFromField('"+ "currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
			exchangeRateForVatAmount = "${sql.exchangeRateFromField('"+ "currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
		}
		if(isMcAndVatEnabled && displayCurrency.type == 'budget'){
			exchangeRateType = displayCurrency.exchangeRateType;
			currencyCode = displayCurrency.code;
			exchangeRateForVatAmount = "${sql.exchangeRateFromField('"+ "currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
		}
		grid.addParameter("exchangeRate", exchangeRate);
		
		return exchangeRate;
	},
	
	isCostCatInActivParam: function(costCat, costCatRange){
		var costCats = costCatRange.split(",");
		
		for ( var i = 0; i < costCats.length; i++) {
			var thisCostCat = costCats[i].split("'");
			if(thisCostCat.length > 1){
				thisCostCat = thisCostCat[1];
			}
			
			if(costCat == thisCostCat){
				return true;
			}
		}
		
		return false;
	},
	
	abRepmLsCamReportFilter_onClear: function(){
		this.abRepmLsCamReportFilter.clear();
		
		this.initYears();
		this.initVatAndMultiCurrency();
	},
	
	initYears: function(){
        var years = View.dataSources.get("abRepmLsCamReportYears_ds").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        this.populateYearSelectLists(years, fromyear_select, false);
        this.populateYearSelectLists(years, toyear_select, true);
	},

	initCostCat: function(){
        var message = getMessage("infoNoActivityParameter");
        if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-Base_Rent_Category"])){
			this.activityParamBaseRent = "'" + View.activityParameters["AbRPLMCosts-Base_Rent_Category"].replace(/;/g, "','") + "'";
		}else{
			var infoNoActivityParameterMissing = message.replace("{0}", "Base_Rent_Category").replace("{1}", this.activityParamBaseRent);
			View.showMessage(infoNoActivityParameterMissing);
		}
        
        if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-CAM_Estimate"])){
            this.activityParamCamEstimate = "'" + View.activityParameters['AbRPLMCosts-CAM_Estimate'].replace(/;/g, "','") + "'";
        }else{
			var infoNoActivityParameterMissing = message.replace("{0}", "CAM_Estimate").replace("{1}", this.activityParamCamEstimate);
			View.showMessage(infoNoActivityParameterMissing);
		}
        
        if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-CAM_Reconciliation"])){
        	this.activityParamCamReconciliation = "'" + View.activityParameters['AbRPLMCosts-CAM_Reconciliation'].replace(/;/g, "','") + "'";
        }else{
			var infoNoActivityParameterMissing = message.replace("{0}", "CAM_Reconciliation").replace("{1}", this.activityParamCamReconciliation);
			View.showMessage(infoNoActivityParameterMissing);
		}
	},

	initVatAndMultiCurrency: function(){
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
			this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = View.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	
        	this.abRepmLsCamReportFilter.displayVAT = this.displayVAT;
        	this.abRepmLsCamReportFilter.displayCurrency = this.displayCurrency;
        }
	},
	
	abRepmLsCamReportCosts_afterRefresh: function(){
		this.abRepmLsCamReportCosts.setTitle(getMessage("title_CamReportForLease").replace("{0}", this.lsId));
	},

    populateYearSelectLists: function(recs, year_select, is_to_year) {
		var currentDateObj = new Date();
		var currentDate = this.abRepmLsCamReportYears_ds.formatValue("afm_cal_dates.cal_date", currentDateObj, false);
		var currentYear = currentDate.substring(0,4);

    	year_select.options.length = 0;
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            if(year == currentYear){
	            option.selected = true;
            }
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
    },

    /**
     * Set Lease Year - From console field with the year of the selected lease start date
     */
    setLeaseYearFrom: function(cmdObj){
    	var leaseId = cmdObj.restriction["ls.ls_id"];
    	
    	for ( var i = 0; i < cmdObj.getParentPanel().rows.length; i++) {
			var row = cmdObj.getParentPanel().rows[i];
			if(row["ls.ls_id"] == leaseId){
				var leaseYear = row["ls.vf_start_year"];
				this.setYearFrom(leaseYear);
				break;
			}
		}
    },
    
    setYearFrom: function(year){
		// select the year in the "Lease Year - From" dropbox
		var fromyear_select = $('console_cost.year');
		for ( var j = 0; j < fromyear_select.options.length; j++) {
			var option = fromyear_select.options[j];
			if(option.value == year){
				option.selected = true;
				break;
			}
		}
    },
    
    onChangeLeaseId: function(){
    	var now = new Date();
    	var leaseYear = now.getFullYear(); 
    	var leaseId = this.abRepmLsCamReportFilter.getFieldValue("ls.ls_id");
    	if(valueExistsNotEmpty(leaseId)){
    		var records = this.abRepmLsCamReportFilter_ds.getRecords({"ls.ls_id": leaseId});
    		if(records.length > 0){
    			leaseYear = records[0].getValue("ls.vf_start_year");
    		}
    	}
		this.setYearFrom(leaseYear);
    },

    abRepmLsCamReportCosts_onPaginatedReport: function(){
    	
    	var printableRestriction = [];
    	printableRestriction.push({'title': getMessage("pagRepRestriction_lease"), 'value': this.lsId});
    	printableRestriction.push({'title': getMessage("pagRepRestriction_fromYear"), 'value': this.fromSelectedYear});
    	printableRestriction.push({'title': getMessage("pagRepRestriction_toYear"), 'value': this.toSelectedYear});
		
	    var parameters = {
	    	'printRestriction': true,
	    	'printableRestriction': printableRestriction,
	        'currencyCode': this.displayCurrency.code
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-ls-cam-report-pgrp.axvw", null, parameters);
	},
	
	abRepmLsCamReportCosts_onAddAdjustment: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ls_cam_rec_report.ls_id", this.lsId, "=");

		View.openDialog('ab-repm-ls-cam-review-adjust.axvw', restriction, false, {
	        closeButton: false
	    });
	}
});

function openAdjustments(cmdOject){
	var cmdRestriction = cmdOject.restriction;
	if(!valueExistsNotEmpty(cmdRestriction)) {
		return;
	}
	
	var yearClause = cmdRestriction.findClause("ccost_sum.vf_year");
	if(!valueExistsNotEmpty(yearClause)){
		return;
	}
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls_cam_rec_report.ls_id", abRepmLsCamReportController.lsId, "=");
	restriction.addClause("ls_cam_rec_report.ls_rent_year", yearClause.value, "=");
	
	View.openDialog('ab-repm-ls-cam-review-adjust.axvw', restriction, false, {
        closeButton: false
    });
}
