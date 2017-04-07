/**
 * TODO: replace areaUnitsConversionFactor by core feature when available
 */
var abRepmLsadminLsBenchmarkController = View.createController('abRepmLsadminLsBenchmarkCtrl', {
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
	
	//Statistic config object.
	gridFlds_statConfig: {
		formulas: ["avg", "min", "max"],
		fields: ["ls.area_rentable", "ls.qty_occupancy", "ls.yearly_op_cost_rentarea", "ls.yearly_base_rent_rentarea", 
		         "ls.yearly_pct_cost_rentarea", "ls.yearly_tot_cost_rentarea", "ls.yearly_base_rent_occ", 
		         "ls.yearly_pct_rent_occ", "ls.yearly_tot_cost_occ", "ls.vf_net_income"]
	},
	
	isLsContactsDef: false,

	afterViewLoad: function(){
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
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
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		
		//add Avg, Min and Max rows to grid
		this.abRepmLsadminLsBenchmark_gridPanel.setStatisticAttributes(this.gridFlds_statConfig);
		
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();

		this.abRepmLsadminLsBenchmarkDetails_bldgPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminLsBenchmarkDetails_bldgPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminLsBenchmarkDetails_bldgPanel.addParameter('neither', getMessage('neither'));

		this.abRepmLsadminLsBenchmarkDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmLsadminLsBenchmarkDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmLsadminLsBenchmarkDetails_propPanel.addParameter('neither', getMessage('neither'));
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(this.displayVAT, this.displayCurrency);
		//showFilter(true);
		enableDate();
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminLsBenchmark_gridPanel';
		
		// set area conversion factor parameter
		this.abRepmLsadminLsBenchmark_gridPanel.addParameter("areaUnitsConversionFactor", this.areaUnitsConversionFactor);
		this.abRepmLsadminLsBenchmarkDetails_lsCostsPanel.addParameter("areaUnitsConversionFactor", this.areaUnitsConversionFactor);
	},
	
	abRepmLsadminLsBenchmark_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmLsadminLsBenchmark_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmLsadminLsBenchmark_gridPanel_onDetails: function(row){
		var lsId = row.getFieldValue("ls.ls_id");
		var restriction = new Ab.view.Restriction({"ls.ls_id": row.getFieldValue("ls.ls_id")});
		this.row = row;
		
		var currencyCode = this.displayCurrency.code;
		
		// set currency
		this.abRepmLsadminLsBenchmarkDetails_lsDescrPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		this.abRepmLsadminLsBenchmarkDetails_lsCostsPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});
		
		var exchangeRateType = this.displayCurrency.exchangeRateType;
		// KB 3035042  we must use exchange rate type Budget to convert budget costs
		//var exchangeRate = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', '" + exchangeRateType + "')}":1);
		var exchangeRate = ((this.isMcAndVatEnabled)? "${sql.exchangeRateFromBudget('"+ currencyCode+ "', 'Budget')}":1);
		this.abRepmLsadminLsBenchmarkDetails_lsCostsPanel.addParameter("exchange_rate", exchangeRate);
		this.abRepmLsadminLsBenchmarkDetails_lsDescrPanel.addParameter("exchange_rate", exchangeRate);
		
		//set Costs instructions
		if(this.isMcAndVatEnabled){
			var instructions = getMessage("exchangeRateInstructions");
			this.abRepmLsadminLsBenchmarkDetails_lsCostsPanel.setInstructions(instructions);
		}
		
		/*
		 * KB 3029065 - IOAN 11/03/2010
		 * IE 7 bug with select tab when tab content is changed
		 * We must show/hide forms after tab select.
		 * Refresh lease description panel after show/hide building/property form
		 * to force resize 
		 */
		
		this.abRepmLsadminLsBenchmarkDetails_bldgPanel.refresh(restriction);
		this.abRepmLsadminLsBenchmarkDetails_propPanel.refresh(restriction);
		
		this.abRepmLsadminLsBenchmarkDetails_lsAreasPanel.refresh(restriction);
		this.abRepmLsadminLsBenchmarkDetails_lsCostsPanel.refresh(restriction);
		this.abRepmLsadminLsBenchmarkDetails_lsOptionsPanel.refresh(restriction);
		var contactsRestriction = null;
		if (this.isLsContactsDef) {
			contactsRestriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(lsId) + "' )";
		} else {
			contactsRestriction = new Ab.view.Restriction();
			contactsRestriction.addClause('contact.ls_id', lsId, '=');
		}
		this.abRepmLsadminLsBenchmarkDetails_lsContactsPanel.refresh(contactsRestriction);
		
		this.abRepmLsadminLsBenchmark_tabs.selectTab("abRepmLsadminLsBenchmark_tabDetails");
		
		this.abRepmLsadminLsBenchmarkDetails_bldgPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.bl_id")));
		this.abRepmLsadminLsBenchmarkDetails_propPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.pr_id")));
		
		this.abRepmLsadminLsBenchmarkDetails_lsDescrPanel.refresh(restriction);
		this.abRepmLsadminLsBenchmark_tabs.enableTab("abRepmLsadminLsBenchmark_tabDetails", true);
	},
	
	
	abRepmLsadminLsBenchmarkDetails_bldgPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminLsBenchmarkDetails_bldgPanel.getFieldValue('bl.bldg_photo'))) {
			this.abRepmLsadminLsBenchmarkDetails_bldgPanel.showImageDoc('bl_image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.abRepmLsadminLsBenchmarkDetails_bldgPanel.fields.get(this.abRepmLsadminLsBenchmarkDetails_bldgPanel.fields.indexOfKey('bl_image_field')).dom.src = null;
			this.abRepmLsadminLsBenchmarkDetails_bldgPanel.fields.get(this.abRepmLsadminLsBenchmarkDetails_bldgPanel.fields.indexOfKey('bl_image_field')).dom.alt = getMessage('text_no_image');
		}
	},
	
	abRepmLsadminLsBenchmarkDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmLsadminLsBenchmarkDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmLsadminLsBenchmarkDetails_propPanel.showImageDoc('pr_image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmLsadminLsBenchmarkDetails_propPanel.fields.get(this.abRepmLsadminLsBenchmarkDetails_propPanel.fields.indexOfKey('pr_image_field')).dom.src = null;
			this.abRepmLsadminLsBenchmarkDetails_propPanel.fields.get(this.abRepmLsadminLsBenchmarkDetails_propPanel.fields.indexOfKey('pr_image_field')).dom.alt = getMessage('text_no_image');
		}
	},
	abRepmLsadminLsBenchmark_gridPanel_onExportXLS: function(){
		// KB 3040136 pass restriction as paremeter for xls export
		this.parameters['filter_restriction'] = this.restriction;
		this.restriction = "1=1"
		overviewExportXLS(abRepmLsadminLsBenchmarkController, 'abRepmLsadminLsBenchmark_gridPanel');
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
	var controller = View.controllers.get('abRepmLsadminLsBenchmarkCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminLsBenchmark_gridPanel');

	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, true, isSqlStringRestriction);

	// defined in ab-repm-lsadmin-filter.js
	controller.requestParameters = getRequestParameters(crtFilter, displayCurrency, displayVAT); 

	if(controller.isMcAndVatEnabled){
		var dateFrom = crtFilter.get('date_start').value;
		var dateTo = crtFilter.get('date_end').value;
	    var isFromCosts = false;
	    var isFromScheduledCosts = false;
	    var isFromRecurringCosts = false;
		var costFrom = crtFilter.get('cost_from').value;
		for(var i=0; i< costFrom.length; i++){
			switch(costFrom[i]){
				case 'recurring': {isFromRecurringCosts = true; break;}
				case 'scheduled': {isFromScheduledCosts = true; break;}
				case 'cost': {isFromCosts = true; break;}
			}
		}
		var isActiveRecurringCosts = 1;
		//we must update all selected costs
		var costs = getCostsList(dateFrom, dateTo, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts);
		if(costs.ids.length > 0){
			try{
				var jobId = Workflow.startJob('AbCommonResources-CostService-updateCostRecordforVATandMC', costs.ids, costs.types);
			    View.openJobProgressBar(getMessage('msg_update_costs'), jobId, '', function(status) {
			    	var displayMessage = null;
			    	if(valueExists(status.jobProperties.message)){
			    		displayMessage = status.jobProperties.message; 
			    	}
			    	summarizeCosts(controller, overviewPanel, controller.requestParameters, displayVAT, displayCurrency, displayMessage);
			    });
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	}else{
		summarizeCosts(controller, overviewPanel, controller.requestParameters, displayVAT, displayCurrency, null);
	}
	
}

function summarizeCosts(controller, overviewPanel, requestParameters, displayVAT, displayCurrency, displayMessage){

	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var reportDataSource = View.dataSources.get('abRepmLsadminLsBenchmark_ds_report');

	try {
		var jobId = Workflow.startJob('AbCommonResources-CostReportingService-summarizeCosts', "ls", requestParameters);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}
	    	for(param in controller.parameters){
				overviewPanel.addParameter(param, controller.parameters[param]);
				reportDataSource.addParameter(param, controller.parameters[param]);
			}
			overviewPanel.addParameter("user_name", View.user.name);

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
			
			if(valueExistsNotEmpty(displayMessage)){
				View.showMessage(displayMessage);
			}
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
	var controller = View.controllers.get('abRepmLsadminLsBenchmarkCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	
	var row = controller.row;
	var isBuilding = valueExistsNotEmpty(row.getFieldValue("ls.bl_id"));
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-ls-benchmark-rpt',
		callerView: 'ab-repm-lsadmin-ls-benchmark.axvw',
		dataSource: 'abRepmLsadminLsBenchmark_ds_report',
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', row.getFieldValue("ls.ls_id"), '=');
	if(isBuilding){
		restriction.addClause('ls.bl_id', row.getFieldValue("ls.bl_id"), '=');
		var objRestr = {permanent: null, temporary: restriction, parameters: null};
		var rptFileCfg = getRptFileConfig('bl', objRestr);
	}else{
		restriction.addClause('ls.pr_id', row.getFieldValue("ls.pr_id"), '=');
		var objRestr = {permanent: null, temporary: restriction, parameters: null};
		var rptFileCfg = getRptFileConfig('property', objRestr);
	}
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}


/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminLsBenchmarkCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-ls-benchmark-rpt',
		callerView: 'ab-repm-lsadmin-ls-benchmark.axvw',
		dataSource: 'abRepmLsadminLsBenchmark_ds_report',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	controller.restriction;
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.bl_id', '', 'IS NOT NULL', ')AND(', false);
	var objRestr = {permanent: consoleRestr, temporary: restriction, parameters: parameters};
	var rptFileCfg = getRptFileConfig('bl', objRestr);
	reportConfig.files.push(rptFileCfg);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var objRestr = {permanent: consoleRestr, temporary: restriction, parameters: parameters};
	var rptFileCfg = getRptFileConfig('property', objRestr);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}
/**
 * gets RptFileConfig object for building or property
 * @param {Object} whatFor Values in "bl", "property"
 * @param {Object} restriction
 */
function getRptFileConfig(whatFor, restriction){
	var controller = View.controllers.get('abRepmLsadminLsBenchmarkCtrl');
	var areaUnitsConversionFactor = controller.areaUnitsConversionFactor;
	
	if (whatFor == "bl") {
		return new RptFileConfig(
			'ab-repm-lsadmin-ls-benchmark-details-bl-rpt.axvw',
			restriction,
			'ls.bl_id',
			{parameters: [
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")}]
			},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-ls-benchmark-details-ls-rpt.axvw',
					null,
					'ls.bl_id',
					{parameters: [
								{name: 'lsId', type: 'value',	value: 'ls.ls_id'},
								{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]
					},
					null)
			]);
	}
	else {
		return new RptFileConfig(
			'ab-repm-lsadmin-ls-benchmark-details-prop-rpt.axvw',
			restriction,
			'ls.pr_id',
			{parameters: [
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")}]
			},
			[
				new RptFileConfig(
					'ab-repm-lsadmin-ls-benchmark-details-ls-rpt.axvw',
					null,
					'ls.pr_id',
					{parameters: [
								{name: 'lsId', type: 'value',	value: 'ls.ls_id'},
								{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]
					},
					null)
			]);
	}
}

