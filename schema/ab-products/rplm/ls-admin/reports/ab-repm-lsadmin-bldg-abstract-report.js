/**
 * controller definition
 */
var abRepmLsadminBldgAbstractReportController = View.createController('abRepmLsadminBldgAbstractReportCtrl', {
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', isVisible: false},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', isVisible: false},
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
	
	// lease summarized costs
	blCosts: null,
	
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
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.addParameter('neither', getMessage('neither'));
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminBldgAbstractReport_gridPanel';
	},
	
	abRepmLsadminBldgAbstractReport_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmLsadminBldgAbstractReport_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmLsadminBldgAbstractReport_gridPanel_onDetails: function(row){
		this.row = row;
		//var restriction = new Ab.view.Restriction({"bl.bl_id": row.getFieldValue("bl.bl_id")});
		var restriction = "bl.bl_id = '" + row.getFieldValue("bl.bl_id") + "'";
		var exchangeRate = 1;
		if (this.isMcAndVatEnabled){
			var currencyCode = this.displayCurrency.code;
			var exchangeRateType = this.displayCurrency.exchangeRateType;
			// KB 3035042  we must use exchange rate type Budget to convert budget costs
			exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}";

			// set currency
			this.abRepmLsadminBldgAbstractDetails_bldgPanel.getDataSource().fieldDefs.each(function(fieldDef){
				if(valueExists(fieldDef.currency)){
					fieldDef.currency = currencyCode;
				}
			});
//			var instructions = getMessage("exchangeRateInstructions");
//			this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.setInstructions(instructions);
		}
		this.requestParameters["bl_id"] = row.getFieldValue("bl.bl_id");
		this.blCosts = getSummarizedCostsDetails("bl", this.requestParameters);
		//we must add MC and VAT
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.addParameter("exchange_rate", exchangeRate);

		this.abRepmLsadminBldgAbstractDetails_propPanel.addParameter("filter_restriction", restriction);
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.addParameter("filter_restriction", restriction);
		this.abRepmLsadminBldgAbstractDetails_bldgAreasPanel.addParameter("filter_restriction", restriction);
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.addParameter("filter_restriction", restriction);
		
		this.abRepmLsadminBldgAbstractDetails_propPanel.refresh();
		this.abRepmLsadminBldgAbstractDetails_bldgPanel.refresh();
		this.abRepmLsadminBldgAbstractDetails_bldgAreasPanel.refresh();
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.refresh();
		this.abRepmLsadminBldgAbstractDetails_amntsPanel.refresh(restriction);
		
		this.abRepmLsadminBldgAbstractReport_tabs.enableTab("abRepmLsadminBldgAbstractReport_tabDetails", true);
		this.abRepmLsadminBldgAbstractReport_tabs.selectTab("abRepmLsadminBldgAbstractReport_tabDetails");
	},
	
	/*
	 * KB3035558 -  Incorrect currency symbol in exported XLS files.
	 * Solution suggested in Core KB3036593 is to use the beforeExportReport event 
	 * to set the currency symbol for exported values. 
	 */
	abRepmLsadminBldgAbstractReport_gridPanel_beforeExportReport: function(panel, visibleFieldDefs){
		for(var i=0; i<visibleFieldDefs.length; i++){
	          if(visibleFieldDefs[i].currency){
	               visibleFieldDefs[i].currency = this.displayCurrency.code;
	          }
	    }
	    return visibleFieldDefs;
	},
	
	abRepmLsadminBldgAbstractDetails_bldgPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminBldgAbstractDetails_bldgPanel.getFieldValue('bl.bldg_photo'))) {
			this.abRepmLsadminBldgAbstractDetails_bldgPanel.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.abRepmLsadminBldgAbstractDetails_bldgPanel.fields.get('image_field').dom.src = null;
			this.abRepmLsadminBldgAbstractDetails_bldgPanel.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
		formatCurrency(this.abRepmLsadminBldgAbstractDetails_bldgPanel);
	},
	
	abRepmLsadminBldgAbstractDetails_bldgCostsPanel_afterRefresh: function(){
		//displayCosts(form, row, tableName, pKey, isMcAndVatEnabled, currencyCode, costFields, costValues);
		var costFields = new Array({id:"cost_operating_total", formula: "", hasCustomStyle: false}, {id:"cost_utility_total", formula:"", hasCustomStyle: false}, 
				{id:"cost_tax_total", formula:"", hasCustomStyle: false}, {id: "cost_other_total", formula:"", hasCustomStyle: false}, {id:"income_total", formula:"", hasCustomStyle: false}, 
				{id: "net_income", formula:"cost_operating_total + cost_utility_total + cost_tax_total + cost_other_total", hasCustomStyle: true});
		var blId = this.row.getFieldValue("bl.bl_id");
		var blCosts = this.blCosts;
		// show date fields
		var dataSource = this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.getDataSource();
		var dateStart = dataSource.parseValue("bl.date_costs_start", this.requestParameters["date_start"], false);
		var dateEnd = dataSource.parseValue("bl.date_costs_end", this.requestParameters["date_end"], false);
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.setFieldValue("bl.date_costs_start", dataSource.formatValue("bl.date_costs_start", dateStart, true));
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.setFieldValue("bl.date_costs_end", dataSource.formatValue("bl.date_costs_end", dateEnd, true));
		this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel.setFieldValue("bl.date_costs_last_calcd", dataSource.formatValue("bl.date_costs_last_calcd", new Date(), true));

		displayCosts(this.abRepmLsadminBldgAbstractDetails_bldgCostsPanel, this.row, "bl", "bl_id", this.isMcAndVatEnabled, this.displayCurrency.code, costFields, blCosts);
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

	// we need to run  AbCommonResources-CostReportingService-summarizeCosts job
	var controller = View.controllers.get('abRepmLsadminBldgAbstractReportCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminBldgAbstractReport_gridPanel');
	var tabs = View.panels.get('abRepmLsadminBldgAbstractReport_tabs');
	
	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, false, isSqlStringRestriction);
	
    // defined in ab-repm-lsadmin-filter.js
	controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 

    // MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('abRepmLsadminBldgAbstractReport_ds_report');
	
	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "bl", controller.requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

			var exchangeRate = 1;
			var exchangeRateBook = 1;
			var exchangeRateMarket = 1;
			if(controller.isMcAndVatEnabled){
				// KB 3035042  we must use exchange rate type Budget to convert budget costs
				//exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code+ "', '" + displayCurrency.exchangeRateType + "')}";
				exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code+ "', 'Budget')}";
				exchangeRateBook = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"', 'bl.date_book_val')}";
				exchangeRateMarket = "${sql.exchangeRateFromBudgetForDate('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"', 'bl.date_market_val')}";
				
				// set currency
				overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
					if(valueExists(fieldDef.currency)){
						fieldDef.currency = displayCurrency.code;
					}
				});
				for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
					if (valueExists(overviewPanel.fieldDefs[i].currency) || overviewPanel.fieldDefs[i].id == 'ls.vf_net_income') {
						overviewPanel.fieldDefs[i].currency = displayCurrency.code;
						overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
					}
					
				}
			}
			
			overviewPanel.addParameter("exchange_rate_book", exchangeRateBook);
			overviewPanel.addParameter("exchange_rate_market", exchangeRateMarket);
			overviewPanel.addParameter("exchange_rate", exchangeRate);
			
			overviewPanel.refresh();
			
			tabs.enableTab('abRepmLsadminBldgAbstractReport_tabDetails', false);
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
	var controller = View.controllers.get('abRepmLsadminBldgAbstractReportCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	//we must add MC and VAT
	var currencyCode = controller.displayCurrency.code;
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	// KB 3035042  we must use exchange rate type Budget to convert budget costs
	//var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}":1);
	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);
	
	var row = controller.row;
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-bldg-abstract-rpt',
		callerView: 'ab-repm-lsadmin-bldg-abstract-report.axvw',
		dataSource: 'abRepmLsadminBldgAbstractReport_ds_report',
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', row.getFieldValue("bl.bl_id"), '=');

	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-bldg-abstract-details-prop-rpt.axvw',
		{permanent: null, temporary: restriction, parameters: null},
		'bl.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'bl.pr_id'}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-bldg-abstract-details-bl-rpt.axvw',
				null,
				'bl.pr_id',
				{parameters:[
						{name: 'blId', type: 'value', value: 'bl.bl_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")},
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchange_rate', type: 'text', value: exchangeRate}]}, 
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}

/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminBldgAbstractReportCtrl');
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
	//var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}":1);
	var exchangeRate = ((controller.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);

	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-bldg-abstract-rpt',
		callerView: 'ab-repm-lsadmin-bldg-abstract-report.axvw',
		dataSource: 'abRepmLsadminBldgAbstractReport_ds_report',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var restriction = controller.restriction;

	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-bldg-abstract-details-prop-rpt.axvw',
		{permanent: null, temporary: restriction, parameters: null},
		'bl.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'bl.pr_id'}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-bldg-abstract-details-bl-rpt.axvw',
				null,
				'bl.pr_id',
				{parameters:[
						{name: 'blId', type: 'value', value: 'bl.bl_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")},
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchange_rate', type: 'text', value: exchangeRate}]}, 
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}
