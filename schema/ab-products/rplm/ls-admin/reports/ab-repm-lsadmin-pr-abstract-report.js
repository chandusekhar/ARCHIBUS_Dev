/**
 * controller definition
 */
var abRepmLsadminPrAbstractReportController = View.createController('abRepmLsadminPrAbstractReportCtrl', {
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
	// selected ls row
	row: null,
	
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

	afterViewLoad: function(){
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }

		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(copyObject(this.displayVAT), copyObject(this.displayCurrency));
		//showFilter(true);
		enableDate();
		// set parameters for details panel
		this.abRepmLsadminPrAbstractDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminPrAbstractDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminPrAbstractDetails_propPanel.addParameter('neither', getMessage('neither'));
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminPrAbstractReport_gridPanel';
	},
	
	abRepmLsadminPrAbstractReport_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmLsadminPrAbstractReport_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmLsadminPrAbstractReport_gridPanel_onDetails: function(row){
		this.row = row;
		var restriction = new Ab.view.Restriction({"property.pr_id": row.getFieldValue("property.pr_id")});
		//we must add MC and VAT
		var currencyCode = this.displayCurrency.code;
		var exchangeRateType = this.displayCurrency.exchangeRateType;
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		var exchangeRateOt = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'ot.date_purchase')}":1);
		var exchangeRateBook = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_book_val')}":1);
		var exchangeRateMarket = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_market_val')}":1);
		var exchangeRate = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);
		
		// set currency
		this.abRepmLsadminPrAbstractDetails_valuePanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});

		
		this.abRepmLsadminPrAbstractDetails_valuePanel.addParameter("exchange_rate_ot", exchangeRateOt);
		this.abRepmLsadminPrAbstractDetails_valuePanel.addParameter("exchange_rate_book", exchangeRateBook);
		this.abRepmLsadminPrAbstractDetails_valuePanel.addParameter("exchange_rate_market", exchangeRateMarket);
		
		var requestParameters = this.requestParameters;
		requestParameters["pr_id"] = row.getFieldValue("property.pr_id");
		this.propertyCosts =  getSummarizedCostsDetails("pr", requestParameters);
		
		this.abRepmLsadminPrAbstractDetails_propPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_valuePanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_areasPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_costsPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_bldgsPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_amntsPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_taxReasEvalPanel.refresh(restriction);
		this.abRepmLsadminPrAbstractDetails_parcelsPanel.refresh(restriction);
		
		
		this.abRepmLsadminPrAbstractReport_tabs.enableTab("abRepmLsadminPrAbstractReport_tabDetails", true);
		this.abRepmLsadminPrAbstractReport_tabs.selectTab("abRepmLsadminPrAbstractReport_tabDetails");
	},
	
	abRepmLsadminPrAbstractDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminPrAbstractDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmLsadminPrAbstractDetails_propPanel.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmLsadminPrAbstractDetails_propPanel.fields.get('image_field').dom.src = null;
			this.abRepmLsadminPrAbstractDetails_propPanel.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
	},
	
	abRepmLsadminPrAbstractDetails_costsPanel_afterRefresh: function(){
		var costFields = new Array({id:"cost_operating_total", formula: "", hasCustomStyle: false}, {id:"cost_utility_total", formula:"", hasCustomStyle: false}, 
				{id:"cost_tax_total", formula:"", hasCustomStyle: false}, {id: "cost_other_total", formula:"", hasCustomStyle: false}, 
				{id:"net_income", formula:"cost_operating_total + cost_utility_total + cost_tax_total + cost_other_total", hasCustomStyle: true}, 
				{id: "income_total", formula:"", hasCustomStyle: false}, 
				{id:"yearly_net_income", formula:"income_total + cost_operating_total + cost_utility_total + cost_tax_total + cost_other_total", hasCustomStyle: true});
		var prId = this.row.getFieldValue("property.pr_id");
		var propertyCosts = this.propertyCosts;
		// show date fields
		var dataSource = this.abRepmLsadminPrAbstractDetails_costsPanel.getDataSource();
		var dateStart = dataSource.parseValue("property.date_costs_start", this.requestParameters["date_start"], false);
		var dateEnd = dataSource.parseValue("property.date_costs_end", this.requestParameters["date_end"], false);
		this.abRepmLsadminPrAbstractDetails_costsPanel.setFieldValue("property.date_costs_start", dataSource.formatValue("property.date_costs_start", dateStart, true));
		this.abRepmLsadminPrAbstractDetails_costsPanel.setFieldValue("property.date_costs_end", dataSource.formatValue("property.date_costs_end", dateEnd, true));
		this.abRepmLsadminPrAbstractDetails_costsPanel.setFieldValue("property.date_costs_last_calcd", dataSource.formatValue("property.date_costs_last_calcd", new Date(), true));

		
		displayCosts(this.abRepmLsadminPrAbstractDetails_costsPanel, this.row, "property", "pr_id", this.isMcAndVatEnabled, this.displayCurrency.code, costFields, propertyCosts);
		
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
	var controller = View.controllers.get('abRepmLsadminPrAbstractReportCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminPrAbstractReport_gridPanel');
	var tabs = View.panels.get('abRepmLsadminPrAbstractReport_tabs');

	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, false, true, isSqlStringRestriction);
    // defined in ab-repm-lsadmin-filter.js
	controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 
	
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('abRepmLsadminPrAbstractReport_ds_report');
	

	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "pr", controller.requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

			var exchangeRateBook = 1;
			var exchangeRateMarket = 1;
			if(controller.isMcAndVatEnabled){
				// KB 3035042  we must use exchange rate type Budget to convert budget costs
//				exchangeRateBook = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"', 'property.date_book_val')}";
//				exchangeRateMarket = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"', 'property.date_market_val')}";
				exchangeRateBook = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', 'Budget', 'property.date_book_val')}";
				exchangeRateMarket = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', 'Budget', 'property.date_market_val')}";

				// set currency
				overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
					if(valueExists(fieldDef.currency)){
						fieldDef.currency = displayCurrency.code;
					}
				});
				for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
					if (valueExists(overviewPanel.fieldDefs[i].currency) ) {
						overviewPanel.fieldDefs[i].currency = displayCurrency.code;
						overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
					}
				}
			
			}
			overviewPanel.addParameter("exchange_rate_book", exchangeRateBook);
			overviewPanel.addParameter("exchange_rate_market", exchangeRateMarket);
			
			overviewPanel.refresh();
			
			tabs.enableTab('abRepmLsadminPrAbstractReport_tabDetails', false);
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * create report from details panel
 * @param {Object} commandObject
 * @param {Object} reportView
 */
function onReport(){
	var controller = View.controllers.get('abRepmLsadminPrAbstractReportCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	//we must add MC and VAT
	var currencyCode = controller.displayCurrency.code;
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	// KB 3035042  we must use exchange rate type Budget to convert budget costs
//	var exchangeRateOt = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'ot.date_purchase')}":1);
//	var exchangeRateBook = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'property.date_book_val')}":1);
//	var exchangeRateMarket = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'property.date_market_val')}":1);
//	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}":1);
	var exchangeRateOt = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'ot.date_purchase')}":1);
	var exchangeRateBook = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_book_val')}":1);
	var exchangeRateMarket = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_market_val')}":1);
	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);
	
	var row = controller.row;
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-pr-abstract-rpt',
		callerView: 'ab-repm-lsadmin-pr-abstract-report.axvw',
		dataSource: 'abRepmLsadminPrAbstractReport_ds_report',
		printableRestriction: printableRestriction,
		files:[]
	};

	var restriction = new Ab.view.Restriction();
	restriction.addClause('property.pr_id', row.getFieldValue("property.pr_id"), '=');
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-pr-abstract-details-rpt.axvw',
		{permanent: null, temporary: restriction, parameters: null},
		'property.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")},
				{name: 'exchange_rate_ot', type: 'text', value: exchangeRateOt},
				{name: 'exchange_rate_book', type: 'text', value: exchangeRateBook},
				{name: 'exchange_rate_market', type: 'text', value: exchangeRateMarket},
				{name: 'exchange_rate', type: 'text', value: exchangeRate},
				{name: 'currencyCode', type: 'text', value: currencyCode}]},
		null
	);

	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}

/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminPrAbstractReportCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	
	//we must add MC and VAT
	var currencyCode = controller.displayCurrency.code;
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	// KB 3035042  we must use exchange rate type Budget to convert budget costs
//	var exchangeRateOt = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'ot.date_purchase')}":1);
//	var exchangeRateBook = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'property.date_book_val')}":1);
//	var exchangeRateMarket = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', '" + exchangeRateType + "', 'property.date_market_val')}":1);
//	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}":1);
	var exchangeRateOt = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'ot.date_purchase')}":1);
	var exchangeRateBook = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_book_val')}":1);
	var exchangeRateMarket = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudgetForDate('"+ currencyCode+ "', 'Budget', 'property.date_market_val')}":1);
	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);

	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-pr-abstract-rpt',
		callerView: 'ab-repm-lsadmin-pr-abstract-report.axvw',
		dataSource: 'abRepmLsadminPrAbstractReport_ds_report',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var restriction = controller.restriction;
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-pr-abstract-details-rpt.axvw',
		{permanent: null, temporary: restriction, parameters: null},
		'property.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")},
				{name: 'exchange_rate_ot', type: 'text', value: exchangeRateOt},
				{name: 'exchange_rate_book', type: 'text', value: exchangeRateBook},
				{name: 'exchange_rate_market', type: 'text', value: exchangeRateMarket},
				{name: 'exchange_rate', type: 'text', value: exchangeRate},
				{name: 'currencyCode', type: 'text', value: currencyCode}]},
		null
	);
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}
