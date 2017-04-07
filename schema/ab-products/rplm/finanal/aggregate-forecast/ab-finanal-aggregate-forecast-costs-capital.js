var abFinanalAggregateForecastCostsCapitalCtrl = View.createController('abFinanalAggregateForecastCostsCapitalCtrl',{
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
		// hide open views menu for projects and equipment
		if (View.getOpenerView() && View.getOpenerView().panels.get("abFinanalAggregateForecastCostsProj_tabs")) {
			this.abFinanalAgregateForecastCostsAsset_capitalGrid.actions.get('openViews').show(false);
		}
		if (View.getOpenerView() && View.getOpenerView().panels.get("abFinanalAggregateForecastCostsEq_tabs")) {
			this.abFinanalAgregateForecastCostsAsset_capitalGrid.actions.get('openViews').show(false);
		}
	},
	
	afterInitialDataFetch: function() {
		// initial data fetch clears console content
		this.initializeFilterConsole();
		this.abFinanalAgregateForecastCostsAsset_capitalConsole_onFilter();
	},
	
	abFinanalAgregateForecastCostsAsset_capitalConsole_afterRefresh: function () {
		// tab change clears the console and sets selection restriction (bl_id or pr_id)
		var restriction = this.abFinanalAgregateForecastCostsAsset_capitalConsole.restriction;
		this.abFinanalAgregateForecastCostsAsset_capitalGrid.refresh(restriction);
		
		this.initializeFilterConsole();
		this.abFinanalAgregateForecastCostsAsset_capitalConsole_onFilter();
	},
	
	initializeFilterConsole: function() {
		// initialize Date Due - From in filter console
		var form = this.abFinanalAgregateForecastCostsAsset_capitalConsole;
		var date = new Date();
		var formattedDate = form.getDataSource().formatValue('cost_tran_sched.date_due', date);
		form.setFieldValue('date_due_from', formattedDate);
		form.setFieldValue('date_due_to', '');
	},
	
	abFinanalAgregateForecastCostsAsset_capitalConsole_onFilter: function() {
		var form = this.abFinanalAgregateForecastCostsAsset_capitalConsole;
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
		if (valueExistsNotEmpty(this.eqId)) {
			restriction.addClause("cost_tran_sched.description", '% '+this.eqId+' %', "LIKE");
		} else if(valueExistsNotEmpty(this.projId)){
			restriction.addClause("cost_tran_sched.description", '% '+this.projId+' %', "LIKE");
		} else if (valueExistsNotEmpty(this.blId)) {
			restriction.addClause("cost_tran_sched.bl_id", this.blId, "=");
		} else if(valueExistsNotEmpty(this.prId)) {
			restriction.addClause("cost_tran_sched.pr_id", this.prId, "=");
		}
		
		if (valueExistsNotEmpty(dateFrom)) {
			restriction.addClause("cost_tran_sched.date_due", dateFrom, ">=");
		}
		
		if (valueExistsNotEmpty(dateTo)) {
			restriction.addClause("cost_tran_sched.date_due", dateTo, "<=");
		}
		
		this.abFinanalAgregateForecastCostsAsset_capitalGrid.refresh(restriction);
	},
	
	abFinanalAgregateForecastCostsAsset_capitalGrid_afterRefresh: function(){
		var tab = this.view.getParentTab(); 

		getSelectParameters(tab, abFinanalAggregateForecastCostsCapitalCtrl);
		
		if(valueExistsNotEmpty(this.eqId)){
			if (valueExistsNotEmpty(this.blId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForEqBl').replace('{0}', this.eqId).replace('{1}', this.blId));
			} else if (valueExistsNotEmpty(this.prId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForEqPr').replace('{0}', this.eqId).replace('{1}', this.prId));
			}
		} else if (valueExistsNotEmpty(this.projId)){
			if (valueExistsNotEmpty(this.blId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForProjBl').replace('{0}', this.projId).replace('{1}', this.blId));
			} else if (valueExistsNotEmpty(this.prId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForProjPr').replace('{0}', this.projId).replace('{1}', this.prId));
			}
		} else {
			if (valueExistsNotEmpty(this.blId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForBl').replace('{0}', this.blId));
			} else if (valueExistsNotEmpty(this.prId)) {
				this.abFinanalAgregateForecastCostsAsset_capitalGrid.setTitle(getMessage('titleForPr').replace('{0}', this.prId));
			}
		}
	},
	
	abFinanalAgregateForecastCostsAsset_capitalGrid_onAddNewScheduledCost: function(){
		this.addEditSchedCost(null, true);
    },
    
    abFinanalAgregateForecastCostsAsset_capitalGrid_edit_onClick: function(row){
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
				gridPanel: this.abFinanalAgregateForecastCostsAsset_capitalGrid
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
    
    abFinanalAgregateForecastCostsAsset_capitalForm_onCreate: function() {
    	var costsCheckboxes = this.getCostCategCheckboxes();
    	var costCategParam = {};
    	var frequency;
    	
    	// before saving the record calculate the fractional values for rate fields
    	var vfLoanRate = this.abFinanalAgregateForecastCostsAsset_capitalForm.getFieldValue('finanal_params.vf_loan_rate');
    	if (valueExistsNotEmpty(vfLoanRate)) {
    		this.setFormFieldValue(this.abFinanalAgregateForecastCostsAsset_capitalForm, 'finanal_params.loan_rate', vfLoanRate / 100);
    	}
    	var vfRateApprec = this.abFinanalAgregateForecastCostsAsset_capitalForm.getFieldValue('finanal_params.vf_rate_apprec');
    	if (valueExistsNotEmpty(vfRateApprec)) {
    		this.setFormFieldValue(this.abFinanalAgregateForecastCostsAsset_capitalForm, 'finanal_params.rate_apprec', vfRateApprec / 100);
    	}
    	
    	if(!this.verifyRequiredFields(costsCheckboxes)) {
    		return false;
    	}
    	
    	// save finanal_params record (create or update)
    	var saved = this.abFinanalAgregateForecastCostsAsset_capitalForm.save();
    	
    	if (saved) {
    		// set autoNumber and subLoan parameters for capital costs tab
    		var tab = this.view.getParentTab();
    		tab.parameters.autoNumber = this.abFinanalAgregateForecastCostsAsset_capitalForm.getRecord().getValue('finanal_params.auto_number');
    		tab.parameters.subLoan = this.abFinanalAgregateForecastCostsAsset_capitalForm.getRecord().getValue('finanal_params.sub_loan');
    		
    		// set autoNumber and subLoan parameters for income expenses tab
    		if (tab && tab.parentPanel && tab.parentPanel.findTab('abFinanalAggregateForecastCosts_forecastIncomeExpensesTab')) {
    			var incomeExpensesTab = tab.parentPanel.findTab('abFinanalAggregateForecastCosts_forecastIncomeExpensesTab');
        		incomeExpensesTab.parameters.autoNumber = this.abFinanalAgregateForecastCostsAsset_capitalForm.getRecord().getValue('finanal_params.auto_number');
        		incomeExpensesTab.parameters.subLoan = this.abFinanalAgregateForecastCostsAsset_capitalForm.getRecord().getValue('finanal_params.sub_loan');
    		}
    	
    		// call WFR for deleting and creating cost_tran_sched records
        	costsCheckboxes.each(function(costsCheckbox) {
        		if ( $(costsCheckbox.id).checked == true) {
        			costCategParam[costsCheckbox.costType] = costsCheckbox.costCateg;
        		}
        	});
        	
        	if ($('forecast_per_year').checked) {
        		frequency = $('forecast_per_year').value;
        	} else if ($('forecast_per_month').checked){
        		frequency = $('forecast_per_month').value;
        	}
        	
        	var record = this.abFinanalAgregateForecastCostsAsset_capitalForm.getOutboundRecord();
        	try {
    			var result = Workflow.callMethod('AbCommonResources-FinancialAnalysisService-forecastCapitalCosts', this.assetType, record, frequency, costCategParam);
    		} catch (e) {
    			Workflow.handleError(e);
    			return;
    		}
        	
        	this.abFinanalAgregateForecastCostsAsset_capitalForm.closeWindow();
        	this.abFinanalAgregateForecastCostsAsset_capitalGrid.refresh(this.abFinanalAgregateForecastCostsAsset_capitalGrid.restriction);
    	}
    },
    
    abFinanalAgregateForecastCostsAsset_capitalForm_onDelete: function() {
    	var controller = abFinanalAggregateForecastCostsCapitalCtrl;
    	
    	// Prompts for confirmation
    	View.confirm(getMessage('confirmDeleteForecast'), function(button) {
			if (button == 'yes') {
				// Deletes all Scheduled Costs that were previously generated by the action 
				// (that is all Schedule Cost records that are assigned to the asset that have a Scheduled Cost Status of "AUTO-FORECAST" ).
            	var scheduledCosts = new Array();
            	
            	var restriction = new Ab.view.Restriction();
            	restriction.addClause('cost_tran_sched.status', 'AUTO-FORECAST');
            	if (valueExists(controller.blId)) {
            		restriction.addClause('cost_tran_sched.bl_id', controller.blId);
            	} else if (valueExists(controller.prId)) {
            		restriction.addClause('cost_tran_sched.pr_id', controller.prId);
            	}
            	
            	var scheduledCostsRecords = controller.ds_abFinanalAgregateForecastCostsCapital_costTranSched.getRecords(restriction);
            	for (var i = 0; i < scheduledCostsRecords.length; i++) {
            		var costId =  scheduledCostsRecords[i].getValue('cost_tran_sched.cost_tran_sched_id');
            		var rowKey = new Object();
            		rowKey['cost_tran_sched.cost_tran_sched_id'] = costId;
            		scheduledCosts.push(rowKey);
            	}
            	
				Workflow.call('AbCommonResources-deleteDataRecords', {
                    records: toJSON(scheduledCosts),
					viewName: 'ab-finanal-aggregate-forecast-costs-capital.axvw',
					dataSourceId: 'ds_abFinanalAgregateForecastCostsCapital_costTranSched'
                });
				
				// Deletes the finanal_params record representing this forecast.
				var autoNumber = controller.abFinanalAgregateForecastCostsAsset_capitalForm.getFieldValue('finanal_params.auto_number');
				var record = new Ab.data.Record({
				   'finanal_params.auto_number': autoNumber
				});
				var finanalDs = controller.ds_abFinanalAgregateForecastCostsCapital_forecast;
				finanalDs.deleteRecord(record);
				
				//delete the finanal_params records of subloans
				var restriction = new Ab.view.Restriction();
				restriction.addClause('finanal_params.sub_loan', 1);
				if (controller.assetType == 'bl') {
					restriction.addClause('finanal_params.bl_id', controller.blId);
				} else if(controller.assetType == 'pr') {
					restriction.addClause('finanal_params.pr_id', controller.prId);
				} else if(controller.assetType == 'eq') {
					restriction.addClause('finanal_params.eq_id', controller.eqId);
				} else if(controller.assetType == 'proj') {
					restriction.addClause('finanal_params.proj_id', controller.projectId);
				}
				var subLoanRecords = finanalDs.getRecords(restriction);
				for(var i=0;i<subLoanRecords.length; i++){
					finanalDs.deleteRecord(subLoanRecords[i]);
				}
				
				controller.abFinanalAgregateForecastCostsAsset_capitalForm.closeWindow();
				
				controller.abFinanalAgregateForecastCostsAsset_capitalGrid.refresh(controller.abFinanalAgregateForecastCostsAsset_capitalGrid.restriction);
				controller.autoNumber = null;
				controller.subLoan = null;
			}
    	});
    },
    
    abFinanalAgregateForecastCostsAsset_capitalGrid_onForecastCapitalCosts: function() {
    	var newRecord = valueExists(this.autoNumber) ? false : true;
    	var isSubLoan = (valueExists(this.subLoan) && this.subLoan == 1) ? true : false;
    	var form;
    	
    	if (isSubLoan){
    		form = this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm;
    	} else {
    		form  = this.abFinanalAgregateForecastCostsAsset_capitalForm;
    	}
    	
    	form.showInWindow({
            width: isSubLoan ? 400 : 800,
            height: isSubLoan ? 300 : 1200,
            x: 100, 
            y: 100,
            newRecord: newRecord
        });
    	
    	if (!newRecord) {
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause('finanal_params.auto_number', this.autoNumber);
    		form.refresh(restriction, newRecord);
    		
    		if (!isSubLoan && !valueExistsNotEmpty(form.getFieldValue('finanal_params.cost_of_land'))) {
    			this.initCostBasisForDeprec(form);
    		}
    		
    		// display percentage values for rate fields
    		var loanRate = form.getFieldValue('finanal_params.loan_rate');
        	if (valueExistsNotEmpty(loanRate)) {
        		this.setFormFieldValue(form, 'finanal_params.vf_loan_rate', loanRate * 100);
        	}
        	var rateApprec = form.getFieldValue('finanal_params.rate_apprec');
        	if (valueExistsNotEmpty(rateApprec)) {
        		this.setFormFieldValue(form, 'finanal_params.vf_rate_apprec', rateApprec * 100);
        	}
    		
    		// if there is an existing finanal_params record for this asset,
    		// the dialog queries for each type of cost and uncheck the checkbox if there are scheduled costs in that category for this asset.
    		this.checkAllCostCheckboxes();
    		if (!isSubLoan) {
    			this.uncheckCostCategories();
    		}
    		this.updateProposedDispositionYear();
    	} else {
    		form.refresh(null, true);
    		form.clear();
    		this.checkAllCostCheckboxes();
    		
    		// initialize with the selected asset id
    		switch (this.assetType) {
    		case 'bl':
    			form.setFieldValue('finanal_params.bl_id', this.blId);
    			this.setBlPurchasePriceAndDate(form);
    			break;
    		case 'pr':
    			form.setFieldValue('finanal_params.pr_id', this.prId);
    			this.setPrPurchasePriceAndDate(form);
    			break;
    		case 'proj':
    			form.setFieldValue('finanal_params.project_id', this.projId);
    			this.setProjCostAndDate(form);
    			break;
    		case 'eq':
    			form.setFieldValue('finanal_params.eq_id', this.eqId);
    			this.setEqCostDateAndType(form);
    			break;	
    		}
    		
    		if (!isSubLoan) {
    			this.initCostBasisForDeprec(form);
    		}
    	}
    	
    	if (!isSubLoan) {
			$('forecast_per_year').checked = true;
		}
    	
    	this.disableCostCheckboxes();
    },
    
    setBlPurchasePriceAndDate: function(form) {
    	var finanalDs = this.ds_abFinanalAgregateForecastCostsCapital_forecast;
    	var restriction = new Ab.view.Restriction();
		restriction.addClause("ot.bl_id", this.blId, "=");
		var otDataSource = this.ds_abFinanalAgregateForecastCostsCapital_ot;
		var blDataSource = Ab.data.createDataSourceForFields({
	        id: 'bl_ds',
	        tableNames: ['bl'],
	        fieldNames: ['bl.bl_id','bl.value_book', 'bl.date_book_val', 'bl.value_market']
    	});
		
		var records = otDataSource.getRecords(restriction);
		if (records.length > 0) {
			var purchasePrice = records[0].getValue('ot.cost_purchase');
			this.setFormFieldValue(form, 'finanal_params.cost_purchase', purchasePrice);
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', records[0].getValue('ot.date_purchase'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
		} else {
			var record = blDataSource.getRecord(restriction);
			
			var bookValue = record.getValue('bl.value_book');
			this.setFormFieldValue(form, 'finanal_params.cost_purchase', bookValue);
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', record.getValue('bl.date_book_val'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
		}
		
		var record = blDataSource.getRecord(restriction);
		var marketValue = record.getValue('bl.value_market');
		this.setFormFieldValue(form, 'finanal_params.value_market', marketValue);
    },
    
    setPrPurchasePriceAndDate: function(form) {
    	var finanalDs = this.ds_abFinanalAgregateForecastCostsCapital_forecast;
    	var restriction = new Ab.view.Restriction();
		restriction.addClause("ot.pr_id", this.prId, "=");
		var otDataSource = this.ds_abFinanalAgregateForecastCostsCapital_ot;
		var prDataSource = Ab.data.createDataSourceForFields({
	        id: 'property_ds',
	        tableNames: ['property'],
	        fieldNames: ['property.pr_id','property.value_book', 'property.date_book_val', 'property.value_market']
    	});
		
		var records = otDataSource.getRecords(restriction);
		if (records.length > 0) {
			var purchasePrice = records[0].getValue('ot.cost_purchase');
			this.setFormFieldValue(form, 'finanal_params.cost_purchase', purchasePrice);
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', records[0].getValue('ot.date_purchase'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
		} else {
			var record = prDataSource.getRecord(restriction);
			
			var bookValue = record.getValue('property.value_book');
			this.setFormFieldValue(form, 'finanal_params.cost_purchase', bookValue);
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', record.getValue('property.date_book_val'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
		}
		
		var record = prDataSource.getRecord(restriction);
		var marketValue = record.getValue('property.value_market');
		this.setFormFieldValue(form, 'finanal_params.value_market', marketValue);
    },
    
    setProjCostAndDate: function(form) {
    	var finanalDs = this.ds_abFinanalAgregateForecastCostsCapital_forecast;
    	var restriction = new Ab.view.Restriction();
		var projDataSource = Ab.data.createDataSourceForFields({
	        id: 'project_ds',
	        tableNames: ['project'],
	        fieldNames: ['project.project_id','project.cost_paid', 'project.cost_est_baseline', 'project.status', 'project.date_end']
    	});
		
		restriction.addClause("project.project_id", this.projId, "=");
		var record = projDataSource.getRecord(restriction);
		if (record) {
			var status = record.getValue('project.status');
			if(status.lastIndexOf('Complete') == 0 || status.lastIndexOf('Closed') == 0) {
				//completed projects
				var purchasePrice = record.getValue('project.cost_paid');
				this.setFormFieldValue(form, 'finanal_params.cost_purchase', purchasePrice);
			} else {
				//active and future projects
				var purchasePrice = record.getValue('project.cost_est_baseline');
				this.setFormFieldValue(form, 'finanal_params.cost_purchase', purchasePrice);
			}
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', record.getValue('project.date_end'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
		}
    },
    
    setEqCostDateAndType: function(form) {
    	var finanalDs = this.ds_abFinanalAgregateForecastCostsCapital_forecast;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("eq.eq_id", this.eqId, "=");
		var eqDataSource = Ab.data.createDataSourceForFields({
	        id: 'eq_ds',
	        tableNames: ['eq'],
	        fieldNames: ['eq.eq_id','eq.cost_purchase', 'eq.date_purchased', 'eq.property_type']
    	});
		
		var record = eqDataSource.getRecord(restriction);
		if (record) {
			var purchasePrice = record.getValue('eq.cost_purchase');
			this.setFormFieldValue(form, 'finanal_params.cost_purchase', purchasePrice);
			
			var formattedDate = finanalDs.formatValue('finanal_params.date_purchased', record.getValue('eq.date_purchased'));
			form.setFieldValue('finanal_params.date_purchased', formattedDate);
			
			form.setFieldValue('finanal_params.property_type', record.getValue('eq.property_type'));
			updateDeprecPeriod();
		}
    },
    
    initCostBasisForDeprec: function (form) {
		this.setFormFieldValue(form, 'finanal_params.cost_of_land', 0.00);
		this.updateCostBasisForDepreciation();
    },

    // On form load for new record check all checkboxes
    checkAllCostCheckboxes: function () {
    	$('forecast_principal_payments_chk').checked = true;
    	$('forecast_interest_payments_chk').checked = true;
    	$('forecast_cost_of_capital_chk').checked = true;
    	$('forecast_depreciation_chk').checked = true;
    	$('forecast_appreciation_chk').checked = true;
    	$('estimate_disposal_costs_chk').checked = true;
    	$('estimate_salvage_value_chk').checked = true;
    },
    
    // Regardless of whether there are finanal_params record for this asset, for projects and equipment enable just the checkboxes for financing and depreciation.
    disableCostCheckboxes: function() {
    	if (this.assetType == 'bl' || this.assetType == 'pr') {
    		return;
    	}
    	
    	document.getElementById('forecast_appreciation_chk_div').style.display="none";
    	
    	$('forecast_appreciation_chk').checked = false;
    },
    
    uncheckCostCategories: function() {
    	var controller = this;
    	var costsCheckboxes = this.getCostCategCheckboxes();

    	// To determine if there is at least one cost for a Cost Category, 
    	// query the Scheduled Costs records WHERE description like '%<finanal_params.auto_number>%' and Cost Category='<cost category>'
    	costsCheckboxes.each(function(costsCheckBox){
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause('cost_tran_sched.description', '%#'+controller.autoNumber+'#%', 'LIKE');
    		restriction.addClause('cost_tran_sched.cost_cat_id', costsCheckBox.costCateg);
    		
    		if (controller.assetType == 'bl' && valueExistsNotEmpty(controller.blId)){
    			restriction.addClause('cost_tran_sched.bl_id', controller.blId);
    		} else if (controller.assetType == 'pr' && valueExistsNotEmpty(controller.prId)){
    			restriction.addClause('cost_tran_sched.pr_id', controller.prId);
    		}
    		var records = controller.ds_abFinanalAgregateForecastCostsCapital_costTranSched.getRecords(restriction);
    		if(records && records.length > 0) {
    			$(costsCheckBox.id).checked = false;
    		}
    	});
    },
    
    verifyRequiredFields: function(costsCheckboxes) {
    	var form = this.abFinanalAgregateForecastCostsAsset_capitalForm;
    	
    	for(var i=0; i<costsCheckboxes.length; i++) {
    		var costsCheckBox = costsCheckboxes.get(i);
    		
    		if($(costsCheckBox.id).checked == true) {
    			switch (costsCheckBox.costType){
    			case 'principal':
    				var loanTerm = form.getFieldValue('finanal_params.loan_term');
    				var loanAmount = form.getFieldValue('finanal_params.loan_amount');
    				var loanDate = form.getFieldValue('finanal_params.date_loan_start');
    				
    				if(!valueExistsNotEmpty(loanTerm) || !valueExistsNotEmpty(loanAmount) || !valueExistsNotEmpty(loanDate)) {
    					var fields = form.getFieldLabelElement('finanal_params.loan_term').textContent + ', '+
    						form.getFieldLabelElement('finanal_params.loan_amount').textContent + ', '+
    						form.getFieldLabelElement('finanal_params.date_loan_start').textContent;
    					View.alert(String.format(getMessage('missingRequiredFields'), getMessage('principalText'), fields));
    					return false;
    				}
    				break;
    				
	    		case 'interest':
					var loanTerm = form.getFieldValue('finanal_params.loan_term');
					var loanAmount = form.getFieldValue('finanal_params.loan_amount');
					var loanDate = form.getFieldValue('finanal_params.date_loan_start');
					
					if(!valueExistsNotEmpty(loanTerm) || !valueExistsNotEmpty(loanAmount) || !valueExistsNotEmpty(loanDate)) {
						var fields = form.getFieldLabelElement('finanal_params.loan_term').textContent + ', ' +
							form.getFieldLabelElement('finanal_params.loan_amount').textContent + ', '+
    						form.getFieldLabelElement('finanal_params.date_loan_start').textContent;
						View.alert(String.format(getMessage('missingRequiredFields'), getMessage('interestText'), fields));
						return false;
					}
					break;
					
	    		case 'capital':
					var loanDownPayment = form.getFieldValue('finanal_params.down_payment');
					var plannedLife = form.getFieldValue('finanal_params.planned_life');
					var loanAmount = form.getFieldValue('finanal_params.loan_amount');
					var loanDate = form.getFieldValue('finanal_params.date_loan_start');
					
					if(!valueExistsNotEmpty(loanDownPayment) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(loanAmount) || !valueExistsNotEmpty(loanDate)) {
						var fields = form.getFieldLabelElement('finanal_params.down_payment').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.loan_amount').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.date_loan_start').textContent;
						
						View.alert(String.format(getMessage('missingRequiredFields'), getMessage('capitalText'), fields));
						return false;
					}
					break;
					
	    		case 'depreciation':
					var propertyType = form.getFieldValue('finanal_params.property_type');
					var costBasisForDeprec = form.getFieldValue('finanal_params.cost_basis_for_deprec');
					var datePurchased = form.getFieldValue('finanal_params.date_purchased');
					
					if(!valueExistsNotEmpty(propertyType) || !valueExistsNotEmpty(costBasisForDeprec) || !valueExistsNotEmpty(datePurchased)) {
						var fields = form.getFieldLabelElement('finanal_params.property_type').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.cost_basis_for_deprec').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.date_purchased').textContent;
						
						View.alert(String.format(getMessage('missingRequiredFields'), getMessage('depreciationText'), fields));
						return false;
					}
					break;
					
	    		case 'appreciation':
					var costPurchase = form.getFieldValue('finanal_params.cost_purchase');
					var rateApprec = form.getFieldValue('finanal_params.rate_apprec');
					var plannedLife = form.getFieldValue('finanal_params.planned_life');
					var dateApprecStart = form.getFieldValue('finanal_params.date_apprec_start');
					
					if(!valueExistsNotEmpty(costPurchase) || !valueExistsNotEmpty(rateApprec) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(dateApprecStart)) {
						var fields = form.getFieldLabelElement('finanal_params.cost_purchase').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.vf_rate_apprec').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
						 	+ form.getFieldLabelElement('finanal_params.date_apprec_start').textContent;
						
						View.alert(String.format(getMessage('missingRequiredFields'), getMessage('appreciationText'), fields));
						return false;
					}
					break;
					
	    		case 'disposition':
					var costPurchase = form.getFieldValue('finanal_params.cost_purchase');
					var plannedLife = form.getFieldValue('finanal_params.planned_life');
					
					var rateApprec = form.getFieldValue('finanal_params.rate_apprec');
					var dateApprecStart = form.getFieldValue('finanal_params.date_apprec_start');
					
					var propertyType = form.getFieldValue('finanal_params.property_type');
					var costBasisForDeprec = form.getFieldValue('finanal_params.cost_basis_for_deprec');
					var datePurchased = form.getFieldValue('finanal_params.date_purchased');
					
					if(this.assetType == 'bl' || this.assetType == 'pr'){
						if(!valueExistsNotEmpty(costPurchase) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(rateApprec) || !valueExistsNotEmpty(dateApprecStart)) {
							var fields = form.getFieldLabelElement('finanal_params.cost_purchase').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.vf_rate_apprec').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.date_apprec_start').textContent;
							
							View.alert(String.format(getMessage('missingRequiredFields'), getMessage('dispositionText'), fields));
							return false;
						}
					} else {
						if(!valueExistsNotEmpty(costPurchase) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(propertyType) || !valueExistsNotEmpty(costBasisForDeprec) || !valueExistsNotEmpty(datePurchased)) {
							var fields = form.getFieldLabelElement('finanal_params.cost_purchase').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.property_type').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.cost_basis_for_deprec').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.date_purchased').textContent;
							
							View.alert(String.format(getMessage('missingRequiredFields'), getMessage('dispositionText'), fields));
							return false;
						}
					}
					
					break;
					
	    		case 'salvage':
					var costPurchase = form.getFieldValue('finanal_params.cost_purchase');
					var plannedLife = form.getFieldValue('finanal_params.planned_life');

					var rateApprec = form.getFieldValue('finanal_params.rate_apprec');
					
					var propertyType = form.getFieldValue('finanal_params.property_type');
					var costBasisForDeprec = form.getFieldValue('finanal_params.cost_basis_for_deprec');
					var datePurchased = form.getFieldValue('finanal_params.date_purchased');
					
					if(this.assetType == 'bl' || this.assetType == 'pr'){
						if(!valueExistsNotEmpty(costPurchase) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(rateApprec) || !valueExistsNotEmpty(datePurchased)) {
							var fields = form.getFieldLabelElement('finanal_params.cost_purchase').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.vf_rate_apprec').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.date_purchased').textContent;
							
							View.alert(String.format(getMessage('missingRequiredFields'), getMessage('salvageText'), fields));
							return false;
						}
					} else {
						if(!valueExistsNotEmpty(costPurchase) || !valueExistsNotEmpty(plannedLife) || !valueExistsNotEmpty(propertyType) || !valueExistsNotEmpty(costBasisForDeprec) || !valueExistsNotEmpty(datePurchased)) {
							var fields = form.getFieldLabelElement('finanal_params.cost_purchase').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.planned_life').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.property_type').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.cost_basis_for_deprec').textContent + ', '
							 	+ form.getFieldLabelElement('finanal_params.date_purchased').textContent;
							
							View.alert(String.format(getMessage('missingRequiredFields'), getMessage('salvageText'), fields));
							return false;
						}
					}
					
					break;
					
				default: 
					return true;
    			}
    		}
    	}
    	
    	return true;
    },
    
    getCostCategCheckboxes: function () {
    	var costsCheckboxes =  new Ext.util.MixedCollection();
    	var principalCategParam;
    	var interestCategParam;
    	var capitalCategParam;
    	var depreciationCategParam;
    	var appreciationCategParam = 'CostCategory_Appreciation';
    	var dispositionCategParam;
    	var salvageCategParam;
    	
    	switch (this.assetType) {
    		case 'bl':
    			principalCategParam = 'CostCategory_PrincipalBuilding';
    			interestCategParam = 'CostCategory_InterestBuilding';
    			capitalCategParam = 'CostCategory_CapitalBuilding';
    			depreciationCategParam = 'CostCategory_DeprBuilding';
    			dispositionCategParam = 'CostCategory_Disposition';
    			salvageCategParam = 'CostCategory_SalvageValue';
    			break;
    		case 'pr':
    			principalCategParam = 'CostCategory_PrincipalProperty';
    			interestCategParam = 'CostCategory_InterestProperty';
    			capitalCategParam = 'CostCategory_CapitalProperty';
    			depreciationCategParam = 'CostCategory_DeprProperty';
    			dispositionCategParam = 'CostCategory_Disposition';
    			salvageCategParam = 'CostCategory_SalvageValue';
    			break;
    		case 'proj':
    			principalCategParam = 'CostCategory_PrincipalCapProj';
    			interestCategParam = 'CostCategory_InterestCapProj';
    			capitalCategParam = 'CostCategory_CapitalCapProj';
    			depreciationCategParam = 'CostCategory_DeprCapProj';
    			dispositionCategParam = 'CostCategory_DispositionCapProj';
    			salvageCategParam = 'CostCategory_SalvageValueCapProj';
    			break;
    		case 'eq':
    			principalCategParam = 'CostCategory_PrincipalPPE';
    			interestCategParam = 'CostCategory_InterestPPE';
    			capitalCategParam = 'CostCategory_CapitalPPE';
    			depreciationCategParam = 'CostCategory_DeprPPE';
    			dispositionCategParam = 'CostCategory_DispositionPPE';
    			salvageCategParam = 'CostCategory_SalvageValuePPE';
    			break;
    	}
    	
    	costsCheckboxes.addAll(
    		{id: 'forecast_principal_payments_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + principalCategParam], costType: 'principal'},
    		{id: 'forecast_interest_payments_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + interestCategParam], costType: 'interest'},
    		{id: 'forecast_cost_of_capital_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + capitalCategParam], costType: 'capital'},
    		{id: 'forecast_depreciation_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + depreciationCategParam], costType: 'depreciation'},
    		{id: 'forecast_appreciation_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + appreciationCategParam], costType: 'appreciation'},
    		{id: 'estimate_disposal_costs_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + dispositionCategParam], costType: 'disposition'},
    		{id: 'estimate_salvage_value_chk', costCateg: View.activityParameters["AbRPLMStrategicFinancialAnalysis-" + salvageCategParam], costType: 'salvage'});
    	
    	return costsCheckboxes;
    },
    
    addSubordinateLoan: function() {
    	var newRecord = true;
    	
    	this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.showInWindow({
            width: 800,
            height: 1200,
            newRecord: newRecord
        });
    	
		this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.refresh(null, true);
		
		// initialize with the selected asset id
		switch (this.assetType) {
		case 'bl':
			this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setFieldValue('finanal_params.bl_id', this.blId);
			break;
		case 'pr':
			this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setFieldValue('finanal_params.pr_id', this.prId);
			break;
		case 'proj':
			this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setFieldValue('finanal_params.project_id', this.projId);
			break;
		case 'eq':
			this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setFieldValue('finanal_params.eq_id', this.eqId);
			break;	
		}
		this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setFieldValue('finanal_params.sub_loan', '1');
    },
    
    abFinanalAgregateForecastCostsAsset_subordinateLoanForm_afterRefresh: function () {
    	var title = this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.newRecord ? getMessage('addSubLoanTitle') : getMessage('editSubLoanTitle');
		this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.setTitle(title);
    },
    
    updateCostBasisForDepreciation: function() {
    	var form = this.abFinanalAgregateForecastCostsAsset_capitalForm;
    	var purchasePrice = form.getFieldValue('finanal_params.cost_purchase');
    	var costOfLand = form.getFieldValue('finanal_params.cost_of_land');
    	
    	if(valueExistsNotEmpty(purchasePrice) && valueExistsNotEmpty(costOfLand)){
    		var costBasisForDeprec = purchasePrice - costOfLand;
    		
			this.setFormFieldValue(form, 'finanal_params.cost_basis_for_deprec', costBasisForDeprec);
    	}
    },
    
    updateProposedDispositionYear: function() {
    	var form = this.abFinanalAgregateForecastCostsAsset_capitalForm;
    	var appreciationStartDate = form.getFieldValue('finanal_params.date_apprec_start');
    	var planedLifeYears =  form.getFieldValue('finanal_params.planned_life');
    	
    	if(valueExistsNotEmpty(appreciationStartDate) && valueExistsNotEmpty(planedLifeYears)){
    		var appreciationStartYear = new Date(appreciationStartDate).getFullYear();
    		var proposedDispositionYear = parseInt(appreciationStartYear) + parseInt(planedLifeYears);
        	form.setFieldValue('finanal_params.proposed_disposition_year', proposedDispositionYear);
    	}
    },
    
    setFormFieldValue: function(form, fieldFullName, value) {
    	var finanalDs = this.ds_abFinanalAgregateForecastCostsCapital_forecast;
    	var formattedValue = finanalDs.formatValue(fieldFullName, value, true);
		var value = formatFieldWithoutCurrency(fieldFullName, formattedValue, finanalDs);
		form.setFieldValue(fieldFullName, value);
    },
    
    setSubLoanRateValue: function() {
    	// before saving the record calculate the fractional values for rate field
    	var vfLoanRate = this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm.getFieldValue('finanal_params.vf_loan_rate');
    	if (valueExistsNotEmpty(vfLoanRate)) {
    		this.setFormFieldValue(this.abFinanalAgregateForecastCostsAsset_subordinateLoanForm, 'finanal_params.loan_rate', vfLoanRate / 100);
    	}
    }
});

function updateDeprecPeriod() {
	var form = abFinanalAggregateForecastCostsCapitalCtrl.abFinanalAgregateForecastCostsAsset_capitalForm;
	var propertyType = form.getFieldValue('finanal_params.property_type');
	
	var propertyTypeDataSource = Ab.data.createDataSourceForFields({
        id: 'propertyType_ds',
        tableNames: ['property_type'],
        fieldNames: ['property_type.property_type', 'property_type.deprec_period']
	});
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("property_type.property_type", propertyType, "=");
	
	var record = propertyTypeDataSource.getRecord(restriction);
	if (record && record.getValue('property_type.deprec_period')) {
		form.setFieldValue('property_type.deprec_period', record.getValue('property_type.deprec_period'));
	}
}
