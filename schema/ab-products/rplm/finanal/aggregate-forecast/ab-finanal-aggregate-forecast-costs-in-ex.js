var abFinanalAggregateForecastCostsInExCtrl = View.createController('abFinanalAggregateForecastCostsInExCtrl',{
	isBuilding: false,
	isProperty: false,
	assetType: null,
	blId: null,
	prId: null,
	projId: null,
	eqId: null,
	subLoan: null,
	autoNumber: null,
	
	costTranRecurDataSource: null,
	defaultCostValues: null,
	
	fieldsModifiedByUser: [],
	
	abFinanalAgregateForecastCostsAsset_inExGrid_afterRefresh: function(){
		var tab = this.view.getParentTab(); 

		getSelectParameters(tab, abFinanalAggregateForecastCostsInExCtrl);
		
		if (valueExists(this.blId)) {
			this.abFinanalAgregateForecastCostsAsset_inExGrid.setTitle(getMessage('titleForBlInEx').replace('{0}', this.blId));
		} else if (valueExists(this.prId)) {
			this.abFinanalAgregateForecastCostsAsset_inExGrid.setTitle(getMessage('titleForPrInEx').replace('{0}', this.prId));
		}
	},
	
	abFinanalAgregateForecastCostsAsset_inExGrid_onAddNewRecurringCost: function(){
		this.addEditRecurCost(null, true);
    },
    
    abFinanalAgregateForecastCostsAsset_inExGrid_edit_onClick: function(row){
    	this.addEditRecurCost(row, false);
    },
    
    addEditRecurCost: function (row, isNew) {
    	var costTranRecurId = null;
        if(valueExists(row)){
        	costTranRecurId = row.getFieldValue("cost_tran_recur.cost_tran_recur_id");
        }
        
    	var runtimeParameters = {
        		isNewRecord: isNew,
        		isBuilding: this.isBuilding,
        		isProperty: this.isProperty,
				pr_id: this.prId,
				bl_id: this.blId,
				cost_tran_recur_id: costTranRecurId,
				openerController: this,
				gridPanel: this.abFinanalAgregateForecastCostsAsset_inExGrid
        };
    	
        View.openDialog('ab-rplm-cost-mgmt-add-edit-recurring.axvw', null, false, {
            width: 900,
            height: 700,
            closeButton: true,
            runtimeParameters: runtimeParameters
        });
    },
    
    abFinanalAgregateForecastCostsAsset_inExGrid_onForecastIncomeExpenses: function() {
    	// If the Financial Analysis Parameter selected is for a subordinate loan, present a message and do not continue.
    	if (valueExistsNotEmpty(this.subLoan) && this.subLoan == 1) {
    		View.alert(getMessage('estimateUnavailableForSubLoan'));
    		return false;
    	}
    	
		var form = this.abFinanalAgregateForecastCostsAsset_form;

		form.showInWindow({
            width: 800,
            height: 720,
            x: 100, 
            y: 100,
            newRecord: true
        });
		
		this.fieldsModifiedByUser = [];
		this.initEstimateFormValues();
    },
    
    initEstimateFormValues: function() {
    	var form = this.abFinanalAgregateForecastCostsAsset_form;
    	
    	form.clear();
    	$('estimate_per_year').checked = true;
    	
    	//  If this is a building, Internal Gross Area shows bl.area_gross_int.  
		if (this.assetType == 'bl') {
			var blDataSource = Ab.data.createDataSourceForFields({
		        id: 'bl_ds',
		        tableNames: ['bl'],
		        fieldNames: ['bl.bl_id','bl.area_gross_int']
	    	});
			
			var blRecord = blDataSource.getRecord({'bl.bl_id': this.blId});
			var internalGrosArea = blRecord.getLocalizedValue('bl.area_gross_int');
			form.setFieldValue('bl.area_gross_int', internalGrosArea);
		}
		
		// Start date defaults to the first day of the current Fiscal Year.
		var fiscalYearStartDate = getFiscalYearStartDate();
		var uiFiscalYearStartDate = fiscalYearStartDate.format(View.dateFormat);
		form.setFieldValue('start_date', uiFiscalYearStartDate);
		
		// End Date defaults ideally to the Fiscal Year plus the Planned Life in Years. We would look up the planned life from the finanal_params table.
		if (valueExistsNotEmpty(this.autoNumber)) {
			var finanalParamsDataSource = Ab.data.createDataSourceForFields({
		        id: 'finanal_params_ds',
		        tableNames: ['finanal_params'],
		        fieldNames: ['finanal_params.auto_number','finanal_params.planned_life']
	    	});
			
			var finanalParamsRecord = finanalParamsDataSource.getRecord({'finanal_params.auto_number': this.autoNumber});
			var plannedLife = finanalParamsRecord.getValue('finanal_params.planned_life');
			
			if (valueExistsNotEmpty(plannedLife) && isNumeric(plannedLife) && plannedLife > 0) {
				var endDate = fiscalYearStartDate;
				endDate.setFullYear(parseInt(endDate.getFullYear()) + parseInt(plannedLife));
				endDate.setDate(endDate.getDate() - 1);
				var uiEndDate = endDate.format(View.dateFormat);
				form.setFieldValue('end_date', uiEndDate);
			}
		}
		
		this.initEstimateCostValues();
    },
    
    initEstimateCostValues: function() {
    	var form = this.abFinanalAgregateForecastCostsAsset_form;
    	var dataSource = abFinanalAggregateForecastCostsInExCtrl.ds_abFinanalAgregateForecastCostsInEx_forecast;
    	var frequency;
    	
    	if ($('estimate_per_year').checked) {
    		frequency = $('estimate_per_year').value;
    	} else if ($('estimate_per_month').checked){
    		frequency = $('estimate_per_month').value;
    	}

    	// load default cost values object
    	if (this.assetType == 'bl') {
    		this.initDefaultCostValues();
		}
	
		var incomeCostCategories = new Ext.util.MixedCollection();
		incomeCostCategories.addAll(
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeOffice'], formField: 'rent_office'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeRetail'], formField: 'rent_retail'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_IncomeOther'], formField: 'other_income'}
		);

		var costValue = 0;
		
		incomeCostCategories.each(function(costCat) {
			// do not modify values entered by the user in form
			if (abFinanalAggregateForecastCostsInExCtrl.fieldsModifiedByUser.indexOf(costCat.formField) == -1) {
				costValue = abFinanalAggregateForecastCostsInExCtrl.getLatestRecurValue('income', costCat, frequency);
				if (valueExistsNotEmpty(costValue)) {
					var parsedValue = new Number(dataSource.parseValue("cost_tran_recur.amount_income_total_payment", costValue, false));
					form.setFieldValue(costCat.formField, dataSource.formatValue(costCat.formField, parsedValue, true));
				}
			}
		});
		
		var expenseCostCategories = new Ext.util.MixedCollection();
		expenseCostCategories.addAll(
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Custodial'], formField: 'cleaning'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Maintenance'], formField: 'maintenance'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_MaintenanceGrounds'], formField: 'roads'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Administration'], formField: 'administration'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Security'], formField: 'security'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Utility'], formField: 'energy'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentExpense'], formField: 'rent'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Tax'], formField: 'property_taxes'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_AdminSupplies'], formField: 'supplies'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Trash'], formField: 'trash_removal'},
				{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Misc'], formField: 'miscellaneous'}
		);

		costValue = 0;
		
		expenseCostCategories.each(function(costCat) {
			// do not modify values entered by the user in form
			if (abFinanalAggregateForecastCostsInExCtrl.fieldsModifiedByUser.indexOf(costCat.formField) == -1) {
				costValue = abFinanalAggregateForecastCostsInExCtrl.getLatestRecurValue('expense', costCat, frequency);
				if (valueExistsNotEmpty(costValue)) {
					var parsedValue = new Number(dataSource.parseValue("cost_tran_recur.amount_income_total_payment", costValue, false));
					form.setFieldValue(costCat.formField, dataSource.formatValue(costCat.formField, parsedValue, true));
				}
				
			}
		});
    },
    
    getLatestRecurValue: function(costType, costCat, frequency) {
    	var costValueField = "cost_tran_recur.amount_income";
    	var costValue = 0;
    	var costCatId = costCat.id;
    	var formField = costCat.formField;
    	var isReadOnly = false;
    	
    	if(costType == "expense") {
    		costValueField = "cost_tran_recur.amount_expense";
    	}
    	
    	var restriction = '';
    	if (valueExistsNotEmpty(this.blId)) {
    		restriction = " AND cost_tran_recur.bl_id='" + this.blId + "'";
    	} else if(valueExistsNotEmpty(this.prId)) {
    		restriction = " AND cost_tran_recur.pr_id='" + this.prId + "'";
    	}
    	restriction = "cost_tran_recur.cost_tran_recur_id = (SELECT MAX(cost_tran_recur.cost_tran_recur_id) FROM cost_tran_recur WHERE cost_tran_recur.cost_cat_id='" + costCatId + "'"+restriction+")";
    	
    	if (!valueExistsNotEmpty(this.costTranRecurDataSource)) {
    		this.costTranRecurDataSource = Ab.data.createDataSourceForFields({
    	        id: 'cost_tran_recur_ds',
    	        tableNames: ['cost_tran_recur'],
    	        fieldNames: ['cost_tran_recur.cost_tran_recur_id','cost_tran_recur.amount_income', 'cost_tran_recur.amount_expense',
    	                     'cost_tran_recur.description', 'cost_tran_recur.period', 'cost_tran_recur.period_custom']
        	});
    	}
    		
		var costRecord = this.costTranRecurDataSource.getRecord(restriction);
    	if (costRecord) {
    		costValue = costRecord.getValue(costValueField);
    		    		
    		if (valueExistsNotEmpty(costValue)) {
    			
    			// make the field read - only is a manually entered cost
    			if (costRecord.getValue('cost_tran_recur.description').indexOf('AUTO-FORECAST') == -1) {
    				isReadOnly = true;
    			}
    			
    			// convert the cost to current selected frequency
    			if (frequency == 'YEAR') {
    				if (costRecord.getValue('cost_tran_recur.period') == 'MONTH') {
    					costValue = costValue * 12;
    				} else if (costRecord.getValue('cost_tran_recur.period') == 'QUARTER') {
    					costValue = costValue * 4;
    				} else if (costRecord.getValue('cost_tran_recur.period') == 'CUSTOM') {
    					var customPeriod = costRecord.getValue('cost_tran_recur.period_custom');
    					costValue = costValue * (365 / customPeriod);
    				}
    			} else if (frequency == 'MONTH') {
    				if(costRecord.getValue('cost_tran_recur.period') == 'YEAR') {
    					costValue = costValue / 12;
    				} else if(costRecord.getValue('cost_tran_recur.period') == 'QUARTER') {
    					costValue = costValue / 3;
    				} else if (costRecord.getValue('cost_tran_recur.period') == 'CUSTOM') {
    					var customPeriod = costRecord.getValue('cost_tran_recur.period_custom');
    					costValue = costValue * (365 / customPeriod) / 12;
    				}
    			}
    		}
    	}
    	
    	// If the asset is a building, create an estimate as the default.
    	if (!valueExistsNotEmpty(costValue) || costValue == 0) {
    		if (this.assetType == 'bl') {
    			if (frequency == 'YEAR') {
    				costValue = this.defaultCostValues.get(costCatId).value;
    			} else {
    				// Divide by 12 if the frequency of the scheduled cost is monthly rather than yearly.
    				costValue = parseFloat((this.defaultCostValues.get(costCatId).value/12).toFixed(2));
    			}
    			
    		} else {
    			costValue = 0;
    		}
    	}
    	
    	costValue = parseFloat(costValue).toFixed(2);
    	
    	this.abFinanalAgregateForecastCostsAsset_form.getFieldElement(formField).readOnly = isReadOnly;
    	
    	return costValue;
    },
    
    initDefaultCostValues: function() {
    	this.defaultCostValues = new Ext.util.MixedCollection();
    	this.defaultCostValues.addAll(
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeOffice'], value: 0},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeRetail'], value: 0},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_IncomeOther'], value: 0},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Custodial'], value: 1.39},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Maintenance'], value: 1.84},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_MaintenanceGrounds'], value: 0.21},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Administration'], value: 0.65},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Security'], value: 0.65},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Utility'], value: 2.28},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentExpense'], value: 30},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Tax'], value: 1.4},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_AdminSupplies'], value: 0.13},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Trash'], value: 0.07},
    			{id: View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Misc'], value: 0.06}
    	);
    	
    	// Multiply these values by 1/0.09290304 if the Base Units are Meters to convert these USD / sqft to USD / sq.
    	if (View.user.displayUnits == 'metric') {
    		this.defaultCostValues.each( function(costValue) {
    			costValue.value = costValue.value * (1 / 0.09290304);
    		});
    	}
    	
    	// Multiply the result by the Internal Gross Area to get the default value for each category.
    	var internalGrossArea = this.abFinanalAgregateForecastCostsAsset_form.getFieldValue('bl.area_gross_int');
    	if(valueExistsNotEmpty(internalGrossArea)) {
    		this.defaultCostValues.each( function(costValue) {
        		costValue.value = costValue.value * internalGrossArea;
    		});
    	}
    	
    	// Convert the result to the Organizational Budget Currency.
    	if (View.project.budgetCurrency.code != 'USD') {
    		this.defaultCostValues.each( function(costValue) {
    			var result = Workflow.callMethod("AbCommonResources-CostService-convertCostToBudget", costValue.value, 'USD', 'Budget');
    			costValue.value = result.value;
    		});
    	}
    	
    	// format value to 2 decimals
    	this.defaultCostValues.each( function(costValue) {
    		costValue.value = parseFloat(costValue.value.toFixed(2));
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
    
    abFinanalAgregateForecastCostsAsset_form_onCreate: function() {
    	if (!this.hasValidFormValues()) {
    		return;
    	}
    	
    	var frequency;
    	var record = this.abFinanalAgregateForecastCostsAsset_form.getRecord();
    	
    	var rentIncomeOfficeCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeOffice'];
    	var rentIncomeRetailCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentIncomeRetail'];
    	var incomeOtherCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_IncomeOther'];
    	var custodialCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Custodial'];
    	var maintenanceCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Maintenance'];
    	var roadsCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_MaintenanceGrounds'];
    	var administrationCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Administration'];
    	var securityCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Security'];
    	var utitlityCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Utility'];
    	var rentExpenseCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_RentExpense'];
    	var taxCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Tax'];
    	var suppliesCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_AdminSupplies'];
    	var trashCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Trash'];
    	var miscCat = View.activityParameters['AbRPLMStrategicFinancialAnalysis-CostCategory_Misc'];
    	
    	var costCategParam = {};
    	costCategParam[rentIncomeOfficeCat] = 'income';
    	costCategParam[rentIncomeRetailCat] = 'income';
    	costCategParam[incomeOtherCat] = 'income';
    	costCategParam[custodialCat] = 'expense';
    	costCategParam[maintenanceCat] = 'expense';
    	costCategParam[roadsCat] = 'expense';
    	costCategParam[administrationCat] = 'expense';
    	costCategParam[securityCat] = 'expense';
    	costCategParam[utitlityCat] = 'expense';
    	costCategParam[rentExpenseCat] = 'expense';
    	costCategParam[taxCat] = 'expense';
    	costCategParam[suppliesCat] = 'expense';
    	costCategParam[trashCat] = 'expense';
    	costCategParam[miscCat] = 'expense';
    	
    	var costValuesParam = {};
    	costValuesParam[rentIncomeOfficeCat] = record.getValue('rent_office');
    	costValuesParam[rentIncomeRetailCat] = record.getValue('rent_retail');
    	costValuesParam[incomeOtherCat] = record.getValue('other_income');
    	costValuesParam[custodialCat] = record.getValue('cleaning');
    	costValuesParam[maintenanceCat] = record.getValue('maintenance');
    	costValuesParam[roadsCat] = record.getValue('roads');
    	costValuesParam[administrationCat] = record.getValue('administration');
    	costValuesParam[securityCat] = record.getValue('security');
    	costValuesParam[utitlityCat] = record.getValue('energy');
    	costValuesParam[rentExpenseCat] = record.getValue('rent');
    	costValuesParam[taxCat] = record.getValue('property_taxes');
    	costValuesParam[suppliesCat] = record.getValue('supplies');
    	costValuesParam[trashCat] = record.getValue('trash_removal');
    	costValuesParam[miscCat] = record.getValue('miscellaneous');
    	
    	if ($('estimate_per_year').checked) {
    		frequency = $('estimate_per_year').value;
    	} else if ($('estimate_per_month').checked){
    		frequency = $('estimate_per_month').value;
    	}
    	
    	var parameters = {
    			frequency: frequency,
    			asset_type: this.assetType,
    			bl_id: this.blId,
    			pr_id: this.prId,
    			auto_number: valueExistsNotEmpty(this.autoNumber) ? this.autoNumber : ''
    		}
    	
    	var startDate = this.abFinanalAgregateForecastCostsAsset_form.getFieldValue('start_date')
    	var endDate = this.abFinanalAgregateForecastCostsAsset_form.getFieldValue("end_date");
    	try {
			var result = Workflow.callMethod('AbCommonResources-FinancialAnalysisService-estimateIncomeExpensesCosts', parameters, costCategParam, costValuesParam, startDate, endDate);
		} catch (e) {
			Workflow.handleError(e);
			return;
		}
		
		this.abFinanalAgregateForecastCostsAsset_form.closeWindow();
		this.abFinanalAgregateForecastCostsAsset_inExGrid.refresh(this.abFinanalAgregateForecastCostsAsset_inExGrid.restriction);
    },
    
    hasValidFormValues: function() {
    	var startDate = this.abFinanalAgregateForecastCostsAsset_form.getFieldValue('start_date')
    	var endDate = this.abFinanalAgregateForecastCostsAsset_form.getFieldValue("end_date");
    	
    	if (!valueExistsNotEmpty(startDate)) {
    		View.alert(getMessage('startDateRequired'));
    		return false;
    	}
    	
    	if (!valueExistsNotEmpty(endDate)) {
    		View.alert(getMessage('endDateRequired'));
    		return false;
    	}
    	
    	if (startDate > endDate) {
    		View.alert(getMessage('invalidEndDate'));
    		return false;
    	}
    	
    	return true;
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
    
    onChangeFrequency: function() {
    	this.initEstimateCostValues();
    },
    
    valueChangedByUser: function (fieldName) {
    	this.fieldsModifiedByUser.push(fieldName);
    }
});

function getFiscalYearStartDate () {
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

    var fiscalYear = today.getFullYear() - 1;
    if ((todayMonth === fiscalYearStartMonth - 1 && todayDate >= fiscalYearStartDay) || todayMonth > fiscalYearStartMonth) {
        fiscalYear++;
    }
    
    var startFiscalYearDate = new Date(fiscalYear, fiscalYearStartMonth-1, 1, 0, 0, 0, 0);

    return startFiscalYearDate;
}
