var abRepmLsadminPropAndBlBenchController = View.createController('abRepmLsadminPropAndBlBenchCtrl', {
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', isVisible: false},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', isVisible: false},
			{id:'bl.bl_id', isVisible: false},
			{id:'ls.ls_id', isVisible: false}
		]
	},
	
	// current restriction
	restriction: null,

	// current printable restriction
	printableRestriction: [],
	
	//current parameters
	parameters: null,
	
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
	
	// report request parameters
	requestParameters: null,
	
	// summarized costs
	propertyCosts: null,

	//Statistic config object.
	gridFlds_statConfig: {
		formulas: ["avg", "min", "max"],
		fields: ["property.value_book", "property.value_market", "property.sum_cost_total", "property.income_total", "property.area_bl_rentable", 
		         "property.qty_occupancy", "property.yearly_op_cost_rentarea", "property.yearly_rent_inc_rentarea", 
		         "property.yearly_tot_cost_rentarea", "property.yearly_income_occ", "property.yearly_tot_cost_occ"]
	},

	afterViewLoad: function(){
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {

			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'base';
        	
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        	this.displayCurrency.isCurrencyHidden = false;
        }else{
			this.isMcAndVatEnabled = false;
        	this.displayVAT.type = 'total';

        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }
		
		//add Avg, Min and Max rows to grid
		this.abRepmLsadminPropAndBlBench_gridPanel.setStatisticAttributes(this.gridFlds_statConfig);

		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(this.displayVAT, this.displayCurrency);
		//showFilter(true);
		enableDate();
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminPropAndBlBench_gridPanel';
	},
	
	abRepmLsadminPropAndBlBench_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmLsadminPropAndBlBench_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmLsadminPropAndBlBench_gridPanel_onDetails: function(row){
		var restriction = new Ab.view.Restriction({"property.pr_id": row.getFieldValue("property.pr_id")});
		
		var currencyCode = this.displayCurrency.code;
		
		// set currency
		this.abRepmLsadminPropAndBlBenchDetails_propPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminPropAndBlBenchDetails_costsPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminPropAndBlBenchDetails_benchPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminPropAndBlBenchDetails_bldgsPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		
		//set exchange_rate
		var exchangeRateType = this.displayCurrency.exchangeRateType;
		var conversionFactor = "1";
		if (this.view.user.displayUnits != this.view.project.units) {
			conversionFactor = "1/${user.areaUnits.conversionFactor}";
		}
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//var exchangeRate = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ this.displayCurrency.code+ "', '" + exchangeRateType + "')}":1);
		var exchangeRate = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ this.displayCurrency.code+ "', 'Budget')}":1);
		this.abRepmLsadminPropAndBlBenchDetails_costsPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminPropAndBlBenchDetails_benchPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminPropAndBlBenchDetails_bldgsPanel.addParameter("exchange_rate", exchangeRate);

		this.abRepmLsadminPropAndBlBenchDetails_costsPanel.addParameter("conversionFactor", conversionFactor);
		this.abRepmLsadminPropAndBlBenchDetails_benchPanel.addParameter("conversionFactor", conversionFactor);
		this.abRepmLsadminPropAndBlBenchDetails_bldgsPanel.addParameter("conversionFactor", conversionFactor);
		//set Costs instructions
		if(this.isMcAndVatEnabled){
			var instructions = getMessage("exchangeRateInstructions");
			this.abRepmLsadminPropAndBlBenchDetails_costsPanel.setInstructions(instructions);
		}
		
		this.abRepmLsadminPropAndBlBenchDetails_propPanel.refresh(restriction);
		this.abRepmLsadminPropAndBlBenchDetails_areasPanel.refresh(restriction);
		this.abRepmLsadminPropAndBlBenchDetails_costsPanel.refresh(restriction);
		this.abRepmLsadminPropAndBlBenchDetails_benchPanel.refresh(restriction);
		this.abRepmLsadminPropAndBlBenchDetails_bldgsPanel.refresh(restriction);
		
		this.abRepmLsadminPropAndBlBench_tabs.enableTab("abRepmLsadminPropAndBlBench_tabDetails", true);
		this.abRepmLsadminPropAndBlBench_tabs.selectTab("abRepmLsadminPropAndBlBench_tabDetails");
	},
	
	abRepmLsadminPropAndBlBench_gridPanel_onExportXLS: function(){
		overviewExportXLS(abRepmLsadminPropAndBlBenchController, 'abRepmLsadminPropAndBlBench_gridPanel');
	}
})

/**
 * Apply filter restriction to overview panel
 * 
 * @param {Object} crtFilter - current filter settings
 * @param {Object} printableRestriction - current printable restriction
 * @param {String} displayVAT - current VAT Option
 * @param {Object} displayCurrency - current Multi currency settings
 */
function onApplyFilter(crtFilter, printableRestriction, displayVAT, displayCurrency){
	if(crtFilter == undefined){
		crtFilter = readFilter();
	}

	// we need to run  AbCommonResources-CostService-summarizePropertyCosts job
	var controller = View.controllers.get('abRepmLsadminPropAndBlBenchCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminPropAndBlBench_gridPanel');
	
	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, false, true, isSqlStringRestriction);
	
    // defined in ab-repm-lsadmin-filter.js
    controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 
	
	if(controller.isMcAndVatEnabled){
		var dateFrom = crtFilter.get('date_start').value;
		var dateTo = crtFilter.get('date_end').value;
	    var isFromCosts = false;
	    var isFromScheduledCosts = false;
	    var isFromRecurringCosts = false;
		var isActiveRecurringCosts = 1;
		var costFrom = crtFilter.get('cost_from').value;
		for(var i=0; i< costFrom.length; i++){
			switch(costFrom[i]){
				case 'recurring': {isFromRecurringCosts = true; break;}
				case 'scheduled': {isFromScheduledCosts = true; break;}
				case 'cost': {isFromCosts = true; break;}
			}
		}
		//we must update all selected costs
		var costs = getCostsList(dateFrom, dateTo, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts);
		if(costs.ids.length > 0){
			try{
				var jobId = Workflow.startJob('AbCommonResources-CostService-updateCostRecordforVATandMC', costs.ids, costs.types);
			    View.openJobProgressBar(getMessage('msg_update_costs'), jobId, '', function(status) {
			    	if(valueExists(status.jobProperties.message)){
			    		View.showMessage(status.jobProperties.message);
			    	}
		    		summarizeCosts(controller, overviewPanel, controller.requestParameters, displayVAT, displayCurrency);
			    });
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	}else{
		summarizeCosts(controller, overviewPanel, controller.requestParameters, displayVAT, displayCurrency);
	}
}

function summarizeCosts(controller, overviewPanel, requestParameters, displayVAT, displayCurrency){
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	

	//set exchange_rate
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	// KB 3035042  we must use exchange rate type Budget to convert budget costs
	//var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ controller.displayCurrency.code+ "', '" + exchangeRateType + "')}":1);
	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ controller.displayCurrency.code+ "', 'Budget')}":1);
	var conversionFactor = "1";
	if (View.user.displayUnits != View.project.units) {
		conversionFactor = "1/${user.areaUnits.conversionFactor}";
	}
	
	var reportDataSource = View.dataSources.get('abRepmLsadminPropAndBlBench_ds_report');

	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "pr", requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

	    	overviewPanel.addParameter("exchange_rate", exchangeRate);
			overviewPanel.addParameter("conversionFactor", conversionFactor);

			// set currency
			overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
				if(valueExists(fieldDef.currency)){
					fieldDef.currency = displayCurrency.code;
				}
			});
			for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
				if (valueExists(overviewPanel.fieldDefs[i].currency)) {
					overviewPanel.fieldDefs[i].currency = displayCurrency.code;
					overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
				}
				
			}

			overviewPanel.refresh();
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminPropAndBlBenchCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	var currencyCode = View.project.budgetCurrency.code;
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-prop-and-bl-bench-rpt',
		callerView: 'ab-repm-lsadmin-prop-and-bl-bench.axvw',
		dataSource: 'abRepmLsadminPropAndBlBench_ds_report',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	controller.restriction;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('property.pr_id', '', 'IS NOT NULL', ')AND(', false);
	
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-prop-and-bl-bench-details-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: null},
		'property.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")},
				{name: 'currencyCode', type: 'text', value: currencyCode}]},
		null
	);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}
