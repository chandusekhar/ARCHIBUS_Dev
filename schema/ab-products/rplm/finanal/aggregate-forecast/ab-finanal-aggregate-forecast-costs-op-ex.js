var abFinanalAggregateForecastCostsOpExCtrl = View.createController('abFinanalAggregateForecastCostsOpExCtrl',{
	isBuilding: false,
	isProperty: false,
	assetType: null,
	blId: null,
	prId: null,
	projId: null,
	eqId: null,
	subLoan: null,
	autoNumber: null,

	afterViewLoad: function() {
		
		if (View.getOpenerView() && View.getOpenerView().panels.get("abFinanalAggregateForecastCostsProj_tabs")) {
			// hide open views menu for projects
			this.abFinanalAgregateForecastCostsAsset_opExGrid.actions.get('openViews').show(false);
			
			// restrict to some cost categories
			var costCategories = [];
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_PrincipalCapProj"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_InterestCapProj"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_DeprCapProj"]);
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('cost_tran_sched.cost_cat_id', costCategories, 'IN');
			this.abFinanalAgregateForecastCostsAsset_opExGrid.refresh(restriction);
		}
		if (View.getOpenerView() && View.getOpenerView().panels.get("abFinanalAggregateForecastCostsEq_tabs")) {
			// hide open views menu for equipment
			this.abFinanalAgregateForecastCostsAsset_opExGrid.actions.get('openViews').show(false);
			
			// restrict to some cost categories
			var costCategories = [];
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_PrincipalPPE"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_InterestPPE"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_DeprPPE"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_DispositionPPE"]);
			costCategories.push(View.activityParameters["AbRPLMStrategicFinancialAnalysis-CostCategory_SalvageValuePPE"]);
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('cost_tran_sched.cost_cat_id', costCategories, 'IN');
			this.abFinanalAgregateForecastCostsAsset_opExGrid.refresh(restriction);
		}
	},
	
	afterInitialDataFetch: function() {
		// initial data fetch clears console content
		this.initializeFilterConsole();
		this.abFinanalAgregateForecastCostsAsset_opExConsole_onFilter();
	},
	
	abFinanalAgregateForecastCostsAsset_opExConsole_afterRefresh: function () {
		// tab change clears the console
		this.initializeFilterConsole();
		this.abFinanalAgregateForecastCostsAsset_opExConsole_onFilter();
	},
	
	initializeFilterConsole: function() {
		// initialize Date Due - From in filter console
		var form = this.abFinanalAgregateForecastCostsAsset_opExConsole;
		var date = new Date();
		// initialize to first day of current year -10
		date.setDate(1);
		date.setMonth(0);
		date.setFullYear(date.getFullYear()-10);
		var formattedDate = form.getDataSource().formatValue('cost_tran_sched.date_due', date);
		form.setFieldValue('date_due_from', formattedDate);
		form.setFieldValue('date_due_to', '');
	},
	
	abFinanalAgregateForecastCostsAsset_opExConsole_onFilter: function() {
		var form = this.abFinanalAgregateForecastCostsAsset_opExConsole;
		var dateFrom = form.getFieldValue('date_due_from');
		var dateTo = form.getFieldValue('date_due_to');
		
		// enforce the rule:  "Date Due - To" >= "Date Due - From"
		if (valueExistsNotEmpty(dateFrom) && valueExistsNotEmpty(dateTo)) {
			var dateFromObj = form.getDataSource().parseValue('cost_tran_sched.date_due', dateFrom, false);
			var dateToObj = form.getDataSource().parseValue('cost_tran_sched.date_due', dateTo, false);
			if (dateFromObj.getTime() > dateToObj.getTime()) {
				View.alert(getMessage('startDateGreater'));
				return false;
			}
		}
		
		var restriction = new Ab.view.Restriction();
		if (valueExistsNotEmpty(dateFrom)) {
			restriction.addClause("cost_tran_sched.date_due", dateFrom, ">=");
		}
		
		if (valueExistsNotEmpty(dateTo)) {
			restriction.addClause("cost_tran_sched.date_due", dateTo, "<=");
		}
		
		this.abFinanalAgregateForecastCostsAsset_opExGrid.refresh(restriction);
	},

	abFinanalAgregateForecastCostsAsset_opExGrid_afterRefresh: function() {
		var tab = this.view.getParentTab(); 

		getSelectParameters(tab, abFinanalAggregateForecastCostsOpExCtrl);
	},
	
	abFinanalAgregateForecastCostsAsset_opExGrid_onAddNewScheduledCost: function(){
		this.addEditSchedCost(null, true);
    },
    
    abFinanalAgregateForecastCostsAsset_opExGrid_edit_onClick: function(row){
    	this.addEditSchedCost(row, false);
    },
    
    addEditSchedCost: function (row, isNew) {
    	var costTranSchedId = null;
        if(valueExists(row)){
        	costTranSchedId = row.getFieldValue("cost_tran_sched.cost_tran_sched_id");
        }
        
    	var runtimeParameters = {
        		isNewRecord: isNew,
        		isBuilding: this.isBuilding,
        		isProperty: this.isProperty,
				pr_id: this.prId,
				bl_id: this.blId,
				cost_tran_sched_id: costTranSchedId,
				openerController: this,
				gridPanel: this.abFinanalAgregateForecastCostsAsset_opExGrid
        };
    	
        View.openDialog('ab-rplm-cost-mgmt-add-edit-scheduled.axvw', null, false, {
            width: 900,
            height: 700,
            closeButton: true,
            runtimeParameters: runtimeParameters
        });
    },
    
    viewCostWizard: function() {
    	var queryParameters = this.getQueryParameters();
    	
    	window.open('ab-rplm-cost-mgmt-costs-wiz-ls-bl-pr.axvw' + queryParameters);
    },
    
    viewCashFlow: function() {
    	var queryParameters = this.getQueryParameters();
    	
    	window.open('ab-rplm-cost-mgmt-cash-flow-rep.axvw' + queryParameters);
    },
    
    getQueryParameters: function() {
    	var queryParameters='';
    	
    	if (valueExists(this.blId)) {
    		queryParameters = '?bl_id=' + this.blId;
    	}
    	
    	if (valueExists(this.prId)) {
    		queryParameters = '?pr_id=' + this.prId;
    	}
    	
    	return queryParameters;
    },
    
    abFinanalAgregateForecastCostsAsset_opExDates_onStartAggregateOpEx: function() {
    	var startMonth = $('abFinanalAgregateForecastCostsAsset_opExDates_startMonth').value;
    	var startYear = $('abFinanalAgregateForecastCostsAsset_opExDates_startYear').value;
    	var endMonth = $('abFinanalAgregateForecastCostsAsset_opExDates_endMonth').value;
    	var endYear = $('abFinanalAgregateForecastCostsAsset_opExDates_endYear').value;
    	
    	var isValid = validateDates(startMonth, startYear, endMonth, endYear);
    	
    	if (isValid) {
    		var startDate = startYear + "-" + startMonth + "-01";
        	var endDate = endYear + "-" + endMonth + "-01";; // the WFR doesn't take the day value into consideration
        	
        	try {
    			Workflow.callMethod('AbCommonResources-FinancialAnalysisService-aggregateOperatingCosts', 'all', startDate, endDate);
    			this.abFinanalAgregateForecastCostsAsset_opExDates.closeWindow();
    		}
    		catch (e) {
    			Workflow.handleError(e);
    		}
    	}
    }
});

function validateDates(startMonth, startYear, endMonth, endYear) {
	if (!valueExistsNotEmpty(startMonth) || !valueExistsNotEmpty(startYear) || !valueExistsNotEmpty(endMonth) || !valueExistsNotEmpty(endYear)) {
		View.alert(getMessage('allFieldsRequired'));
		return false;
	}
	
	var minYear = $('abFinanalAgregateForecastCostsAsset_opExDates_startYear').min;
	var maxYear = $('abFinanalAgregateForecastCostsAsset_opExDates_startYear').max;
	
	if(!isNumeric(startYear) || startYear < minYear || startYear > maxYear){
		View.alert(getMessage('invalidStartYear'));
		return false;
	}
	
	if(!isNumeric(endYear) || endYear < minYear || endYear > maxYear){
		View.alert(getMessage('invalidEndYear'));
		return false;
	}
	
	if (startYear > endYear) {
		View.alert(getMessage('startYearGreater'));
		return false;
	} else if (startYear == endYear && startMonth > endMonth) {
		View.alert(getMessage('startMonthGreater'));
		return false;
	}
	
	return true;
}

function initFiscalYearDates () {
	var schemaPreferencesDataSource = Ab.data.createDataSourceForFields({
        id : 'schemaPreferencesDataSource',
        tableNames: ['afm_scmpref'],
        fieldNames: ['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth']
    });
    var schemaPreferences = schemaPreferencesDataSource.getRecord();
    var fiscalYearStartDay = schemaPreferences.getValue('afm_scmpref.fiscalyear_startday'); // 1 based
    var fiscalYearStartMonth = schemaPreferences.getValue('afm_scmpref.fiscalyear_startmonth'); // 1 based

    var today = new Date();
    var todayMonth = today.getMonth(); // 0 based
    var todayDate = today.getDate(); // 1 based

    var fiscalYear = today.getFullYear();
    if ((todayMonth === fiscalYearStartMonth - 1 && todayDate >= fiscalYearStartDay) || todayMonth > fiscalYearStartMonth) {
        fiscalYear++;
    }
    
	var endYear = fiscalYear;
	var startYear = endYear - 1;
	var startMonth = fiscalYearStartMonth;
	var endMonth = (fiscalYearStartMonth === 1) ? 12 : fiscalYearStartMonth - 1;
	
	$('abFinanalAgregateForecastCostsAsset_opExDates_startMonth').selectedIndex = startMonth - 1; //0 based
	$('abFinanalAgregateForecastCostsAsset_opExDates_startYear').value = startYear;
	$('abFinanalAgregateForecastCostsAsset_opExDates_endMonth').selectedIndex = endMonth - 1; //0 based
	$('abFinanalAgregateForecastCostsAsset_opExDates_endYear').value = endYear;
	
}
