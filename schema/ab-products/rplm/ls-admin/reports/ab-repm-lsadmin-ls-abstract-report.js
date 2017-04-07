/**
 * TODO: replace areaUnitsConversionFactor by core feature when available
 */
// controller defintion
var abRepmLsadminLsAbstractReportController = View.createController('abRepmLsadminLsAbstractReportCtrl', {
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', value: 'all', isParameter: true, formula: 'ls.amount_base_rent + ls.amount_pct_rent + ls.amount_operating + ls.amount_taxes + ls.amount_other'},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', value: ['bl', 'pr']}
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
	
	// if UOM is enabled, set from user.areaUnits.conversionFactor
	areaUnitsConversionFactor: 1.0,
	
	// report request parameters
	requestParameters: null,
	
	// lease summarized costs
	leaseCosts: null,

	isLsContactsDef: false,
	
	afterViewLoad: function(){
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);

		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
		//setFilterButtons(false);
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(copyObject(this.displayVAT), copyObject(this.displayCurrency));
		//showFilter(true);
		enableDate();
		// set parameters for details panels
		this.abRepmLsadminLsAbstractDetails_bldgPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminLsAbstractDetails_bldgPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminLsAbstractDetails_bldgPanel.addParameter('neither', getMessage('neither'));

		this.abRepmLsadminLsAbstractDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminLsAbstractDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminLsAbstractDetails_propPanel.addParameter('neither', getMessage('neither'));

		// set area conversion factor parameter
		this.abRepmLsadminLsAbstractDetails_lsCostsPanel.addParameter("areaUnitsConversionFactor", this.areaUnitsConversionFactor);

		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminLsAbstractReport_gridPanel';
	},
	
	abRepmLsadminLsAbstractReport_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmLsadminLsAbstractReport_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmLsadminLsAbstractReport_gridPanel_onDetails: function(row){
		
		var lsId = row.getFieldValue("ls.ls_id");
		//var restriction = new Ab.view.Restriction({"ls.ls_id": row.getFieldValue("ls.ls_id")});
		var restriction = "ls.ls_id = '" + convert2SafeSqlString(lsId) + "'";
		this.row = row;
		
		/*
		 * KB 3029065 - IOAN 11/03/2010
		 * IE 7 bug with select tab when tab content is changed
		 * We must show/hide forms after tab select.
		 * Refresh lease description panel after show/hide building/property form
		 * to force resize 
		 */
		
		var currencyCode = this.displayCurrency.code;
		var exchangeRateType = this.displayCurrency.exchangeRateType;
		var exchangeRate = 1;
		if (this.isMcAndVatEnabled){
			// KB 3035042  we must use exchange rate type Budget to convert budget costs
			//exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}";			
			exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}";			
		}

		
		this.abRepmLsadminLsAbstractDetails_bldgPanel.refresh(restriction);
		this.abRepmLsadminLsAbstractDetails_propPanel.refresh(restriction);
		
		this.abRepmLsadminLsAbstractDetails_lsAreasPanel.refresh(restriction);
		// set currency
		this.abRepmLsadminLsAbstractDetails_lsCostsPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminLsAbstractDetails_lsCostsPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminLsAbstractDetails_lsCostsPanel.addParameter("filter_restriction", restriction);
		
		//set Costs instructions
		if(this.isMcAndVatEnabled){
			var instructions = getMessage("exchangeRateInstructions");
			this.abRepmLsadminLsAbstractDetails_lsCostsPanel.setInstructions(instructions);
		}
		
		this.abRepmLsadminLsAbstractDetails_lsCostsPanel.refresh();
		this.abRepmLsadminLsAbstractDetails_lsOptionsPanel.refresh(restriction);
		var contactsRestriction = null;
		if (this.isLsContactsDef) {
			contactsRestriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(lsId) + "' )";
		} else {
			contactsRestriction = new Ab.view.Restriction();
			contactsRestriction.addClause('contact.ls_id', lsId, '=');
		}
		this.abRepmLsadminLsAbstractDetails_lsContactsPanel.refresh(contactsRestriction);
		this.abRepmLsadminLsAbstractDetails_lsAmntsPanel.refresh(restriction);
		
		this.abRepmLsadminLsAbstractReport_tabs.selectTab("abRepmLsadminLsAbstractReport_tabDetails");

		this.abRepmLsadminLsAbstractDetails_bldgPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.bl_id")));
		this.abRepmLsadminLsAbstractDetails_propPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.pr_id")));
		
		// set currency
		this.abRepmLsadminLsAbstractDetails_lsDescrPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminLsAbstractDetails_lsDescrPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminLsAbstractDetails_lsDescrPanel.addParameter("filter_restriction", restriction);
		this.abRepmLsadminLsAbstractDetails_lsDescrPanel.refresh();

		this.abRepmLsadminLsAbstractReport_tabs.enableTab("abRepmLsadminLsAbstractReport_tabDetails", true);
	},
	
	/*
	 * KB3035558 -  Incorrect currency symbol in exported XLS files.
	 * Solution suggested in Core KB3036593 is to use the beforeExportReport event 
	 * to set the currency symbol for exported values. 
	 */
	abRepmLsadminLsAbstractReport_gridPanel_beforeExportReport: function(panel, visibleFieldDefs){
		for(var i=0; i<visibleFieldDefs.length; i++){
	          if(visibleFieldDefs[i].currency){
	               visibleFieldDefs[i].currency = this.displayCurrency.code;
	          }
	    }
	    return visibleFieldDefs;
	},
	
	abRepmLsadminLsAbstractDetails_bldgPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminLsAbstractDetails_bldgPanel.getFieldValue('bl.bldg_photo'))) {
			this.abRepmLsadminLsAbstractDetails_bldgPanel.showImageDoc('bl_image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.abRepmLsadminLsAbstractDetails_bldgPanel.fields.get('bl_image_field').dom.src = null;
			this.abRepmLsadminLsAbstractDetails_bldgPanel.fields.get('bl_image_field').dom.alt = getMessage('text_no_image');
		}
	},
	abRepmLsadminLsAbstractDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminLsAbstractDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmLsadminLsAbstractDetails_propPanel.showImageDoc('pr_image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmLsadminLsAbstractDetails_propPanel.fields.get('pr_image_field').dom.src = null;
			this.abRepmLsadminLsAbstractDetails_propPanel.fields.get('pr_image_field').dom.alt = getMessage('text_no_image');
		}
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

	// we need to run  AbCommonResources-CostService-summarizeLeaseCosts job
	var controller = View.controllers.get('abRepmLsadminLsAbstractReportCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminLsAbstractReport_gridPanel');
	var tabs = View.panels.get('abRepmLsadminLsAbstractReport_tabs');

	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, true, isSqlStringRestriction);

    // defined in ab-repm-lsadmin-filter.js
	controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 

    // MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('abRepmLsadminLsAbstractReport_ds_report');
	
	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "ls", controller.requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
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
			
			var exchangeRate = 1;
			if (controller.isMcAndVatEnabled){
				// KB 3035042  we must use exchange rate type Budget to convert budget costs
				//exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"')}";
				exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', 'Budget')}";

				overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
					if(valueExists(fieldDef.currency)){
						fieldDef.currency = displayCurrency.code;
					}
				});
			}
			overviewPanel.addParameter("exchange_rate", exchangeRate);

			overviewPanel.refresh();
			tabs.enableTab('abRepmLsadminLsAbstractReport_tabDetails', false);
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Refresh report without summarizing costs.
 * @param crtFilter
 * @param printableRestriction
 * @param displayVAT
 * @param displayCurrency
 */
function onRefreshReport(crtFilter, printableRestriction, displayVAT, displayCurrency){
	if(crtFilter == undefined){
		crtFilter = readFilter();
	}
	var controller = View.controllers.get('abRepmLsadminLsAbstractReportCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminLsAbstractReport_gridPanel');
	var tabs = View.panels.get('abRepmLsadminLsAbstractReport_tabs');
	
	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, true, isSqlStringRestriction);
	
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('abRepmLsadminLsAbstractReport_ds_report');

	for(param in controller.parameters){
		overviewPanel.addParameter(param, controller.parameters[param]);
		reportDataSource.addParameter(param, controller.parameters[param]);
	}
	overviewPanel.addParameter("user_name", View.user.name);
	
	var exchangeRate = 1;
	if (controller.isMcAndVatEnabled){
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', '"+ displayCurrency.exchangeRateType +"')}";
		exchangeRate = "${sql.exchangeRateFromBudget('"+ displayCurrency.code +"', 'Budget')}";
	}
	
	overviewPanel.addParameter("exchange_rate", exchangeRate);
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
	
	if(isSqlStringRestriction){
		overviewPanel.addParameter("filter_restriction", controller.restriction);
		overviewPanel.refresh();
	}else{
		overviewPanel.refresh(controller.restriction);
	}
	tabs.enableTab('abRepmLsadminLsAbstractReport_tabDetails', false);
	
}

/**
 * create report from details panel
 * @param {Object} commandObject
 * @param {Object} reportView
 */
function onReport(){
	var controller = View.controllers.get('abRepmLsadminLsAbstractReportCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	var currencyCode = controller.displayCurrency.code;
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	var exchangeRate = 1;
	if (controller.isMcAndVatEnabled) {
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}";
		exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}";
	}
	var areaUnitsConversionFactor = controller.areaUnitsConversionFactor;
	
	var row = controller.row;
	var isBuilding = valueExistsNotEmpty(row.getFieldValue("ls.bl_id"));
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-ls-abstract-rpt',
		callerView: 'ab-repm-lsadmin-ls-abstract-report.axvw',
		dataSource: 'abRepmLsadminLsAbstractReport_ds_report',
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', row.getFieldValue("ls.ls_id"), '=');
	if(isBuilding){
		restriction.addClause('bl.bl_id', row.getFieldValue("ls.bl_id"), '=');
		
		var rptFileCfg = new RptFileConfig(
			'ab-repm-lsadmin-ls-abstract-details-bl-rpt.axvw',
			{permanent: null, temporary: restriction, parameters: null},
			'bl.bl_id',
			{parameters :[
					{name: 'blOrPrId', type: 'value', value: 'bl.bl_id'},
					{name: 'owned', type: 'text', value: getMessage("owned")},
					{name: 'leased', type: 'text', value: getMessage("leased")},
					{name: 'neither', type: 'text', value: getMessage("neither")}]},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-ls-abstract-details-ls-rpt.axvw',
					null,
					'bl.bl_id',
					{parameters:[
							{name: 'lsId', type: 'value', value: 'ls.ls_id'},
							{name: 'currencyCode', type: 'text', value: currencyCode},
							{name: 'exchange_rate', type: 'text', value: exchangeRate},
							{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]},
					null)
			]
		);
	}else{
		restriction.addClause('property.pr_id', row.getFieldValue("ls.pr_id"), '=');
		var rptFileCfg = new RptFileConfig(
			'ab-repm-lsadmin-ls-abstract-details-prop-rpt.axvw',
			{permanent: null, temporary: restriction, parameters: null},
			'property.pr_id',
			{parameters :[
					{name: 'blOrPrId', type: 'value', value: 'property.pr_id'},
					{name: 'owned', type: 'text', value: getMessage("owned")},
					{name: 'leased', type: 'text', value: getMessage("leased")},
					{name: 'neither', type: 'text', value: getMessage("neither")}]},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-ls-abstract-details-ls-rpt.axvw',
					null,
					'property.pr_id',
					{parameters:[
							{name: 'lsId', type: 'value', value: 'ls.ls_id'},
							{name: 'currencyCode', type: 'text', value: currencyCode},
							{name: 'exchange_rate', type: 'text', value: exchangeRate}, 
							{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]},
					null)
			]
		);
	}
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}

/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminLsAbstractReportCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	var currencyCode = controller.displayCurrency.code;
	var exchangeRateType = controller.displayCurrency.exchangeRateType;
	var exchangeRate = 1;
	if (controller.isMcAndVatEnabled) {
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}";
		exchangeRate = "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}";
	}
	var areaUnitsConversionFactor = controller.areaUnitsConversionFactor;

	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-ls-abstract-rpt',
		callerView: 'ab-repm-lsadmin-ls-abstract-report.axvw',
		dataSource: 'abRepmLsadminLsAbstractReport_ds_report',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	
	var consoleRestr = 	controller.restriction;
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.bl_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-ls-abstract-details-bl-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: parameters},
		'bl.bl_id',
		{parameters :[
				{name: 'blOrPrId', type: 'value', value: 'bl.bl_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-ls-abstract-details-ls-rpt.axvw',
				null,
				'bl.bl_id',
				{parameters:[
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchange_rate', type: 'text', value: exchangeRate}, 
						{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]},
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-ls-abstract-details-prop-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: parameters},
		'property.pr_id',
		{parameters :[
				{name: 'blOrPrId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")}]},
		[
			new RptFileConfig(
				'ab-repm-lsadmin-ls-abstract-details-ls-rpt.axvw',
				null,
				'property.pr_id',
				{parameters:[
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'currencyCode', type: 'text', value: currencyCode},
						{name: 'exchange_rate', type: 'text', value: exchangeRate}, 
						{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]},
				null)
		]
	);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}
