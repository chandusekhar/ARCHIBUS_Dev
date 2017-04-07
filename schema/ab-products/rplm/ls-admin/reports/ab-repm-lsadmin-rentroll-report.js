/**
 * controller definition
 */
var rentRollCtrl = View.createController('rentRollCtrl',{
	
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', value: 'all', isParameter: true, formula: 'ls.amount_base_rent + ls.amount_pct_rent + ls.amount_operating + ls.amount_taxes + ls.amount_other'},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', value: ['bl', 'pr']},
			{id:'update_area', value: ['false'], }
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
		exchangeRateType: 'Budget'
	},
	
	// is Mc and VAT is enabled
	isMcAndVatEnabled: false,
	
	// report request parameters
	requestParameters: null,
	
	// lease summarized costs
	leaseCosts: null,
	
    customMcVatDefaults: {
			displayVat : {
				type : 'total'
			},
			displayCurrency : {
				type : 'user',
				code : '',
				exchangeRateType: 'Payment'
			}
		},
	
	afterViewLoad: function(){
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = View.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	this.customMcVatDefaults.displayCurrency.code = View.user.userCurrency.code;
        }
		// kb 3035144 populate ctry_id with user country
		var ctrySettings = {id:'bl.ctry_id', value: this.view.user.country};
		this.defaultFilter.items.push(ctrySettings);
		
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(copyObject(this.displayVAT), copyObject(this.displayCurrency), this.customMcVatDefaults);
		//showFilter(true);
		enableDate();
		// set parameters for detail panels
		this.form_RentRollDetails_bl.addParameter('owned', getMessage('owned'));
		this.form_RentRollDetails_bl.addParameter('leased', getMessage('leased'));
		this.form_RentRollDetails_bl.addParameter('neither', getMessage('neither'));
		this.form_RentRollDetails_pr.addParameter('owned', getMessage('owned'));
		this.form_RentRollDetails_pr.addParameter('leased', getMessage('leased'));
		this.form_RentRollDetails_pr.addParameter('neither', getMessage('neither'));
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'listRentRoll_overview';
	},
	
	listRentRoll_overview_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.listRentRoll_overview.setTitle(overviewTitle);
		}
	},
	
	/**
	 * show building photo
	 */
	form_RentRollDetails_bl_afterRefresh: function(){
		if (valueExistsNotEmpty(this.form_RentRollDetails_bl.getFieldValue('bl.bldg_photo'))) {
			this.form_RentRollDetails_bl.showImageDoc('bl_image_field', 'bl.bl_id', 'bl.bldg_photo');
		} else {
			this.form_RentRollDetails_bl.fields.get('bl_image_field').dom.src = null;
			this.form_RentRollDetails_bl.fields.get('bl_image_field').dom.alt = getMessage('text_no_image');
		}
	},
	
	/**
	 * show property photo
	 */
	form_RentRollDetails_pr_afterRefresh: function(){
		if (valueExistsNotEmpty(this.form_RentRollDetails_pr.getFieldValue('property.prop_photo'))) {
			this.form_RentRollDetails_pr.showImageDoc('pr_image_field', 'property.pr_id', 'property.prop_photo');
		} else  {
			this.form_RentRollDetails_pr.fields.get('pr_image_field').dom.src = null;
			this.form_RentRollDetails_pr.fields.get('pr_image_field').dom.alt = getMessage('text_no_image');
		}
	},
	
	form_RentRollDetails_lsCosts_afterRefresh: function(){
		//displayCosts(form, row, tableName, pKey, isMcAndVatEnabled, currencyCode, costFields, costValues);
		var costFields = new Array({id:"amount_base_rent", formula: "", hasCustomStyle: false}, {id:"amount_pct_rent", formula:"", hasCustomStyle: false}, 
				{id:"amount_operating", formula:"", hasCustomStyle: false}, {id: "amount_taxes", formula:"", hasCustomStyle: false}, {id:"amount_other", formula:"", hasCustomStyle: false}, 
				{id: "net_income", formula:"amount_base_rent + amount_pct_rent + amount_operating + amount_taxes + amount_other", hasCustomStyle: true});
		var lsId = this.row.getFieldValue("ls.ls_id");
		var leaseCosts = this.leaseCosts;
		// show date fields
		var dataSource = this.form_RentRollDetails_lsCosts.getDataSource();
		var dateStart = dataSource.parseValue("ls.date_cost_anal_start", this.requestParameters["date_start"], false);
		var dateEnd = dataSource.parseValue("ls.date_cost_anal_end", this.requestParameters["date_end"], false);
		this.form_RentRollDetails_lsCosts.setFieldValue("ls.date_cost_anal_start", dataSource.formatValue("ls.date_cost_anal_start", dateStart, true));
		this.form_RentRollDetails_lsCosts.setFieldValue("ls.date_cost_anal_end", dataSource.formatValue("ls.date_cost_anal_end", dateEnd, true));
		this.form_RentRollDetails_lsCosts.setFieldValue("ls.date_costs_last_calcd", dataSource.formatValue("ls.date_costs_last_calcd", new Date(), true));
		
		displayCosts(this.form_RentRollDetails_lsCosts, this.row, "ls", "ls_id", this.isMcAndVatEnabled, this.displayCurrency.code, costFields, leaseCosts);
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
	if (crtFilter == undefined) {
		crtFilter = readFilter();
	}
	// we need to run  AbCommonResources-CostReportingService-summarizeCosts job
	var controller = View.controllers.get('rentRollCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('listRentRoll_overview');
	var tabs = View.panels.get('tabsRentRoll');

	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, true, isSqlStringRestriction);
	
    // defined in ab-repm-lsadmin-filter.js
	controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 
	
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('ds_RentRoll_overview_report');
	
	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "ls", controller.requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	// Update legacy data message
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}
	    	
	    	// Show error message
	    	if (valueExists(status.jobProperties.missingExchangeRate)) {
	    		View.showMessage(status.jobProperties.missingExchangeRate);
	    	}

	    	//net income restriction
	    	var objNetIncome = crtFilter.get('net_income');
	    	if(objNetIncome.isVisible){
	    		var value = objNetIncome.value;
	    		if(objNetIncome.isParameter){
	    			var paramValue = "1  = 1";
	    			if(value == 'positive'){
	    				paramValue = " ("+ objNetIncome.formula +" >= 0) ";
	    			}else if(value == 'negative'){
	    				paramValue = " ("+ objNetIncome.formula +" < 0) ";
	    			}
					overviewPanel.addParameter('net_income', paramValue);
					reportDataSource.addParameter('net_income', paramValue);
	    		}
	    	}
	    	
			if (controller.isMcAndVatEnabled) {
				// KB 3035042  we must use exchange rate type Budget to convert budget costs
				//var exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"')}";
				var exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', 'Budget')}";
				overviewPanel.addParameter("conversion_rate", exchangeRate);
				// set currency
				overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
					if(valueExists(fieldDef.currency)){
						fieldDef.currency = displayCurrency.code;
						fieldDef.config.currency = displayCurrency.code;
					}
				});
				
				for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
					if (valueExists(overviewPanel.fieldDefs[i].currency) || overviewPanel.fieldDefs[i].id == 'ls.vf_net_income') {
						overviewPanel.fieldDefs[i].currency = displayCurrency.code;
						overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
					}
					
				}
			}

			overviewPanel.refresh();
			tabs.enableTab('tabRentRollDetails', false);
	    });
	    
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Create paginated report. Called from details panel.
 */
function onReport(){
	var controller = View.controllers.get('rentRollCtrl');
	/*
	 * we must remove some fields from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	var currencyCode = "";
	var exchangeRate = 1;
	if(controller.isMcAndVatEnabled){
		currencyCode = controller.displayCurrency.code;
		if(controller.displayCurrency.type != "budget"){
			// KB 3035042  we must use exchange rate type Budget to convert budget costs
			//exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','"+ controller.displayCurrency.exchangeRateType +"')}";
			exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','Budget')}";
		}
	}
	
	var row = controller.row;
	var isBuilding = valueExistsNotEmpty(row.getFieldValue("ls.bl_id"));
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-rentroll-rpt',
		callerView: 'ab-repm-lsadmin-rentroll-report.axvw',
		dataSource: 'ds_RentRoll_overview_report',
		dataSourceParameters: controller.parameters,
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', row.getFieldValue("ls.ls_id"), '=');
	if (isBuilding) {
		restriction.addClause('bl.bl_id', row.getFieldValue("ls.bl_id"), '=');
		
		var rptFileCfg = new RptFileConfig(
			'ab-repm-lsadmin-rentroll-details-bl-rpt.axvw',
			{permanent: null, temporary: restriction, parameters: null},
			'bl.bl_id',
			{parameters :[
					{name: 'blOrPrId', type: 'value', value: 'bl.bl_id'},
					{name: 'owned', type: 'text', value: getMessage("owned")},
					{name: 'leased', type: 'text', value: getMessage("leased")},
					{name: 'neither', type: 'text', value: getMessage("neither")}]},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-rentroll-details-ls-rpt.axvw',
					null,
					'bl.bl_id',
					{parameters:[
							{name: 'lsId', type: 'value', value: 'ls.ls_id'}, 
							{name: 'currencyCode', type: 'text', value: currencyCode},
							{name: 'exchangeRate', type: 'text', value: exchangeRate}]}, 
					null)
			]
		);
	} else {
		restriction.addClause('property.pr_id', row.getFieldValue("ls.pr_id"), '=');
		var rptFileCfg = new RptFileConfig(
			'ab-repm-lsadmin-rentroll-details-prop-rpt.axvw',
			{permanent: null, temporary: restriction, parameters: null},
			'property.pr_id',
			{parameters :[
					{name: 'blOrPrId', type: 'value', value: 'property.pr_id'},
					{name: 'owned', type: 'text', value: getMessage("owned")},
					{name: 'leased', type: 'text', value: getMessage("leased")},
					{name: 'neither', type: 'text', value: getMessage("neither")}]},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-rentroll-details-ls-rpt.axvw',
					null,
					'property.pr_id',
					{parameters:[
							{name: 'lsId', type: 'value', value: 'ls.ls_id'}, 
							{name: 'currencyCode', type: 'text', value: currencyCode},
							{name: 'exchangeRate', type: 'text', value: exchangeRate}]}, 
					null)
			]
		);
	}
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}

/**
 * Create paginated report. Called from overview panel.
 */
function onDocX(){
	var controller = View.controllers.get('rentRollCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	
	var currencyCode = "";
	var exchangeRate = 1;
	if(controller.isMcAndVatEnabled){
		currencyCode = controller.displayCurrency.code;
		if(controller.displayCurrency.type != "budget"){
			// KB 3035042  we must use exchange rate type Budget to convert budget costs
			//exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','"+ controller.displayCurrency.exchangeRateType +"')}";
			exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','Budget')}";
		}
	}
	
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-rentroll-rpt',
		callerView: 'ab-repm-lsadmin-rentroll-report.axvw',
		dataSource: 'ds_RentRoll_overview_report',
		dataSourceParameters: controller.parameters,
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	controller.restriction;
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.bl_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-rentroll-details-bl-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: parameters},
		'bl.bl_id',
		{parameters :[
				{name: 'blOrPrId', type: 'value', value: 'bl.bl_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-rentroll-details-ls-rpt.axvw',
				null,
				'bl.bl_id',
				{parameters:[
						{name: 'lsId', type: 'value', value: 'ls.ls_id'}, 
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchangeRate', type: 'text', value: exchangeRate}]},
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-rentroll-details-prop-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: parameters},
		'property.pr_id',
		{parameters :[
				{name: 'blOrPrId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-rentroll-details-ls-rpt.axvw',
				null,
				'property.pr_id',
				{parameters:[
						{name: 'lsId', type: 'value', value: 'ls.ls_id'}, 
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchangeRate', type: 'text', value: exchangeRate}]}, 
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}

/**
 * Open details panel for selected row.
 * 
 * @param {gridRow} row - selected grid row
 */
function onDetails(row){
	var controller = View.controllers.get('rentRollCtrl');
	row = row.row;
	controller.row = row;
	var lsId = row.getFieldValue("ls.ls_id");
	var blId = row.getFieldValue("ls.bl_id");
	var prId = row.getFieldValue("ls.pr_id");
	
	var lsRestr = new Ab.view.Restriction();
	lsRestr.addClause('ls.ls_id', lsId, '=');
	
	var blRestr = new Ab.view.Restriction();
	blRestr.addClause('bl.bl_id', blId, '=');

	var prRestr = new Ab.view.Restriction();
	prRestr.addClause('property.pr_id', prId, '=');

	/*
	 * KB 3029065 - IOAN 11/03/2010
	 * IE 7 bug with select tab when tab content is changed
	 * We must show/hide forms after tab select.
	 * Refresh lease description panel after show/hide building/property form
	 * to force resize 
	 */
	var exchangeRate = 1;
	if(controller.isMcAndVatEnabled && controller.displayCurrency.type != 'budget'){
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','"+ controller.displayCurrency.exchangeRateType +"')}";
		exchangeRate = "${sql.exchangeRateFromBudget('" + controller.displayCurrency.code + "','Budget')}";
	}
	
	controller.form_RentRollDetails_bl.refresh(blRestr);
	controller.form_RentRollDetails_pr.refresh(prRestr);
	
	controller.form_RentRollDetails_lsDet.addParameter("exchange_rate", exchangeRate);
	controller.form_RentRollDetails_lsDet.addParameter("currencyCode", controller.displayCurrency.code);
	controller.form_RentRollDetails_lsDet.refresh(lsRestr);
	
	var requestParameters = controller.requestParameters;
	requestParameters["ls_id"] = lsId;
	
	controller.leaseCosts = getSummarizedCostsDetails("ls", requestParameters);
	
	/**
	//set Costs instructions
	if(controller.isMcAndVatEnabled){
		var instructions = getMessage("exchangeRateInstructions");
//		controller.form_RentRollDetails_lsCosts.setInstructions(instructions);
	}
	
	*/
	controller.form_RentRollDetails_lsCosts.refresh(lsRestr);
	
	controller.form_RentRollDetails_lsOptions.refresh(lsRestr);
	
	controller.tabsRentRoll.selectTab('tabRentRollDetails');

	controller.form_RentRollDetails_bl.show(valueExistsNotEmpty(blId), true);
	controller.form_RentRollDetails_pr.show(valueExistsNotEmpty(prId), true);
	
	controller.tabsRentRoll.enableTab('tabRentRollDetails', true);
}


