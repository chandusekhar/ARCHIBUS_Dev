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

	afterViewLoad: function(){
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},

	afterInitialDataFetch: function(){
		// set filter default values
		setFilter();
		//showFilter(true);
		enableDate();
		// set parameters for details panels\
		this.form_RentRollDetails_bl.addParameter('owned', getMessage('owned'));
		this.form_RentRollDetails_bl.addParameter('leased', getMessage('leased'));
		this.form_RentRollDetails_bl.addParameter('neither', getMessage('neither'));
		this.form_RentRollDetails_pr.addParameter('owned', getMessage('owned'));
		this.form_RentRollDetails_pr.addParameter('leased', getMessage('leased'));
		this.form_RentRollDetails_pr.addParameter('neither', getMessage('neither'));
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'listRentRoll_overview';
	},

	/**
	 * show building photo
	 */
	form_RentRollDetails_bl_afterRefresh: function(){
		if (valueExistsNotEmpty(this.form_RentRollDetails_bl.getFieldValue('bl.bldg_photo'))) {
			this.form_RentRollDetails_bl.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		} else {
			this.form_RentRollDetails_bl.fields.get('image_field').dom.src = null;
			this.form_RentRollDetails_bl.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
	},

	/**
	 * show property photo
	 */
	form_RentRollDetails_pr_afterRefresh: function(){
		if (valueExistsNotEmpty(this.form_RentRollDetails_pr.getFieldValue('property.prop_photo'))) {
			this.form_RentRollDetails_pr.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		} else  {
			this.form_RentRollDetails_pr.fields.get('image_field').dom.src = null;
			this.form_RentRollDetails_pr.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
	}
})

/**
 * Apply filter restriction to overview panel
 *
 * @param {Object} crtFilter - current filter settings
 * @param {Object} printableRestriction - current printable restriction
 */
function onApplyFilter(crtFilter, printableRestriction){
	if (crtFilter == undefined) {
		crtFilter = readFilter();
	}
	// we need to run  AbCommonResources-CostService-summarizeLeaseCosts job
	var controller = View.controllers.get('rentRollCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('listRentRoll_overview');
	var tabs = View.panels.get('tabsRentRoll');

	/*
	// job parameters
	var dateFrom = crtFilter.get('date_start').value;
	var dateTo = crtFilter.get('date_end').value;
	var period = "YEAR";
    var isFromCosts = false;
    var isFromScheduledCosts = false;
    var isFromRecurringCosts = false;
	var isActiveRecurringCosts = 1;
	var costFor = crtFilter.get('cost_for').value;
	if ( costFor === 'fiscal' || costFor === 'calendar') {
		period = "YEAR";
	} else if ( costFor === 'quarter1' || costFor === 'quarter2' || costFor === 'quarter3' || costFor === 'quarter4') {
		period = "QUARTER";
	} else if ( costFor === 'month') {
		period = "MONTH";
	} else {
		period = "DATE_RANGE";
	}
	var costFrom = crtFilter.get('cost_from').value;
	for (var i=0; i< costFrom.length; i++) {
		switch(costFrom[i]){
			case 'recurring': {isFromRecurringCosts = true; break;}
			case 'scheduled': {isFromScheduledCosts = true; break;}
			case 'cost': {isFromCosts = true; break;}
		}
	}
	// get console restriction for overview panel
	getRestrictionForOverview(controller, crtFilter, true, true);

	try {
		var jobId = Workflow.startJob('AbCommonResources-CostService-summarizeLeaseCosts', dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
			for (param in controller.parameters) {
				overviewPanel.addParameter(param, controller.parameters[param]);
			}
			overviewPanel.refresh(controller.restriction);
			tabs.enableTab('tabRentRollDetails', false);
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
    */
	// get console restriction for overview panel
	getRestrictionForOverview(controller, crtFilter, true, true);

	overviewPanel.refresh(controller.restriction);
	tabs.enableTab('tabRentRollDetails', false);
}

/**
 * Create paginated report. Called from details panel.
 */
function onReport(){
	var controller = View.controllers.get('rentRollCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);

	var row = controller.row;
	var isBuilding = valueExistsNotEmpty(row.getFieldValue("bl.bl_id"));
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-rentroll-rpt',
		callerView: 'ab-repm-lsadmin-rentroll-report.axvw',
		dataSource: 'ds_RentRoll_overview',
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', row.getFieldValue("ls.ls_id"), '=');
	if (isBuilding) {
		restriction.addClause('bl.bl_id', row.getFieldValue("bl.bl_id"), '=');

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
							{name: 'lsId', type: 'value', value: 'ls.ls_id'}]},
					null)
			]
		);
	} else {
		restriction.addClause('property.pr_id', row.getFieldValue("property.pr_id"), '=');
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
							{name: 'lsId', type: 'value', value: 'ls.ls_id'}]},
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
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-rentroll-rpt',
		callerView: 'ab-repm-lsadmin-rentroll-report.axvw',
		dataSource: 'ds_RentRoll_overview',
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
						{name: 'lsId', type: 'value', value: 'ls.ls_id'}]},
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
						{name: 'lsId', type: 'value', value: 'ls.ls_id'}]},
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
	var blId = row.getFieldValue("bl.bl_id");
	var prId = row.getFieldValue("property.pr_id");

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

	controller.form_RentRollDetails_bl.refresh(blRestr);
	controller.form_RentRollDetails_pr.refresh(prRestr);


	controller.form_RentRollDetails_lsCosts.refresh(lsRestr);
	controller.form_RentRollDetails_lsOptions.refresh(lsRestr);

	controller.tabsRentRoll.selectTab('tabRentRollDetails');

	controller.form_RentRollDetails_bl.show(valueExistsNotEmpty(blId), true);
	controller.form_RentRollDetails_pr.show(valueExistsNotEmpty(prId), true);

	controller.form_RentRollDetails_lsDet.refresh(lsRestr);
	controller.tabsRentRoll.enableTab('tabRentRollDetails', true);
}
