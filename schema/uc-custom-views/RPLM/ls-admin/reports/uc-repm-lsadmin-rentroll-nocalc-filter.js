/*
 * default filter settings, initialized from parent view
 */
var objDefaultSettings = {
	items:[
		{id:'cost_from', type: 'checkbox', isVisible: false, isOption: false, value: null, isParameter: false, formula: null},
		{id:'cost_for', type: 'radio', isVisible: false, isOption: false, value: null, isParameter: false, formula: null},
		{id:'net_income', type: 'radio', isVisible: false, isOption: false, value: null, isParameter: false, formula: null},
		{id:'date_start', type: '', isVisible: false, isOption: false, value: null, name: 'bl.date_bl', isParameter: false, formula: null},
		{id:'date_end', type: '', isVisible: false, isOption: false, value: null, name: 'bl.date_bl', isParameter: false, formula: null},
		{id:'ls_assoc', type: 'checkbox', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.ctry_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.regn_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.pr_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.state_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.bl_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.city_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'bl.site_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'ls.ls_id', type: '', isVisible: true, isOption: false, value: null, isParameter: false, formula: null}
	],

	keys:["cost_from", "cost_for", "net_income", "date_start", "date_end","ls_assoc",
		"bl.ctry_id", "bl.regn_id", "bl.pr_id", "bl.state_id", "bl.bl_id", "bl.city_id",
		"bl.site_id", "ls.ls_id"],

	get: function(id){
		var index = -1;
		for(var i=0, len = this.keys.length; i<len; i++){
			if(this.keys[i] === id){
				return (this.items[i]);
			}
		}
	},

	each: function(fn, scope){
		var items = [].concat(this.items);
		for (var i = 0, len = items.length; i < len; i++) {
		    if (fn.call(scope || items[i], items[i], i, len) === false) {
		        break;
		    }
		}
	},
	clone: function(){
		return(copyObject(this));
	}
};

/*
 * global variable used to know if more details
 * are shown or not
 * default = false
 */
var isMoreDetails = false;
/*
 * fiscal year start date
 */
var fiscalYearFull = new Date();

/*
 * overview panel id. Must be refreshed
 * after show/hide more details to force resize on IE
 */
var overviewPanelId = null;

/*
 * overview note
 */
var msgOverviewNote = "";
/*
 * customized printable restriction for paginated report
 */
var printableRestriction = [];

/**
 * set custom labels on filter console
 */
function setFilterLabels(){

	/*
	 * KB 3028671 IOAN 09/06/2010
	 * set label
	 */
	// more options button
	var console = View.panels.get('formFilter');
	var title = (isMoreDetails)? getMessage('msg_title_lessDetails'):getMessage('msg_title_moreDetails');
	console.actions.get('moreDetails').setTitle(title);

	// analyze costs from
	$('title_cost_from_recurring').innerHTML = getMessage('msg_title_cost_from_recurring');
	$('title_cost_from_scheduled').innerHTML = getMessage('msg_title_cost_from_scheduled');
	$('title_cost_from_cost').innerHTML = getMessage('msg_title_cost_from_cost');

	// analyze costs for date range
	console.setFieldLabel('cost_for', console.getFieldLabelElement('cost_for').innerHTML.replace('{0}', '<br/>'));
	$('title_cost_for_fiscalYear').innerHTML = getMessage('msg_title_cost_for_fiscalYear');
	$('title_cost_for_calendarYear').innerHTML = getMessage('msg_title_cost_for_calendarYear');
	$('title_cost_for_quarter1').innerHTML = getMessage('msg_title_cost_for_quarter1');
	$('title_cost_for_quarter2').innerHTML = getMessage('msg_title_cost_for_quarter2');
	$('title_cost_for_quarter3').innerHTML = getMessage('msg_title_cost_for_quarter3');
	$('title_cost_for_quarter4').innerHTML = getMessage('msg_title_cost_for_quarter4');
	$('title_cost_for_month').innerHTML = getMessage('msg_title_cost_for_month');
	$('title_cost_for_custom').innerHTML = getMessage('msg_title_cost_for_custom');

	//show cost type of
	$('title_net_income_all').innerHTML = getMessage('msg_title_net_income_all');
	$('title_net_income_positive').innerHTML = getMessage('msg_title_net_income_positive');
	$('title_net_income_negative').innerHTML = getMessage('msg_title_net_income_negative');

	// leases that have
	console.setFieldLabel('net_income', console.getFieldLabelElement('net_income').innerHTML.replace('{0}', '<br/>'));

	// leases associated with
	$('title_ls_assoc_bl').innerHTML = getMessage('msg_title_ls_assoc_bl');
	$('title_ls_assoc_pr').innerHTML = getMessage('msg_title_ls_assoc_pr');

	fiscalYearFull = getFiscalYear();
}

/**
 * get fiscal year settings from schema
 */
function getFiscalYear(){
	var fiscalDateFull = new Date();
	var fiscalYearDay = 1;
	var fiscalYearMonth = 1;
	var params = {
		tableName: 'afm_scmpref',
		fieldNames: toJSON(['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth', 'afm_scmpref.afm_scmpref']),
		restriction: toJSON({
			'afm_scmpref.afm_scmpref': 0
		})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		var record = result.dataSet.records[0];
		fiscalYearDay = record.getValue('afm_scmpref.fiscalyear_startday');
		fiscalYearMonth = record.getValue('afm_scmpref.fiscalyear_startmonth');
		fiscalDateFull.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
		return(fiscalDateFull);
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * apply current filter to target panel
 */
function applyFilter(){
	var crtFilterSettings = readFilter();
	if(crtFilterSettings){
		onApplyFilter(crtFilterSettings, printableRestriction);
	}

}


/**
 * clear current filter settings
 * and restore to default
 */
function clearFilter(){
	setFilter();
	enableDate();
}

/**
 * read current filter setting
 * and return an object that contain this settings
 */
function readFilter(){

	var crtFilterSettings = objDefaultSettings.clone();

	var objPanel = View.panels.get('formFilter');
	var ds = objPanel.getDataSource();
	var tmpPrintableRestriction = [];
	// read filter values
	var canContinue = true;
	crtFilterSettings.each(function(objField){
		var id = objField.id;
		var type = objField.type;
		if (objField.isVisible) {
			if (type === 'checkbox') {
				var objCheckbox = document.getElementsByName('checkbox' + id);
				if (objCheckbox) {
					var value = new Array();
					var prntRestrTitle = getMessage('printable_'+ id);
					var prntRestrValue = new Array();
					for (var i = 0; i < objCheckbox.length; i++) {
						var optCheckbox = objCheckbox[i];
						if (optCheckbox.checked) {
							value.push(optCheckbox.value);
							prntRestrValue.push(getMessage('msg_title_'+ optCheckbox.id));
						}
					}
					objField.value = value;
					if (prntRestrValue.length > 0) {
						tmpPrintableRestriction.push({
							'title': prntRestrTitle,
							'value': prntRestrValue.join(' ; ')
						});
					}
				}
				if (objField.value.length == 0) {
					View.showMessage(getMessage('err_' + id));
					canContinue = false;
					return false;
				}

			}
			else
				if (type === 'radio') {
					var objRadio = document.getElementsByName('radio' + id);
					if (objRadio) {
						var value = "";
						var prntRestrTitle = getMessage('printable_'+ id);
						var prntRestrValue = "";
						for (var i = 0; i < objRadio.length; i++) {
							var optRadio = objRadio[i];
							if (optRadio.checked) {
								value = optRadio.value;
								prntRestrValue = getMessage('msg_title_'+ optRadio.id);
								break;
							}
						}
						if (id === 'cost_for'){
							// we must add start date and end date
							var dateStart = ds.parseValue(crtFilterSettings.get('date_start').name, objPanel.getFieldValue('date_start'), false);
							var dateEnd = ds.parseValue(crtFilterSettings.get('date_end').name, objPanel.getFieldValue('date_end'), false);
							prntRestrValue += ' ('+ ds.formatValue(crtFilterSettings.get('date_start').name, dateStart, true);
							prntRestrValue += ' - ' + ds.formatValue(crtFilterSettings.get('date_end').name, dateEnd, true) + ')';
						}
						if(valueExistsNotEmpty(prntRestrValue)){
							tmpPrintableRestriction.push({
								'title': prntRestrTitle,
								'value': prntRestrValue
							});
						}
						objField.value = value;
					}
				}
				else {
					var value = "";
					var prntRestrTitle = objPanel.fields.get(id).fieldDef.title;
					var prntRestrValue = objPanel.getFieldValue(id);

					if(objPanel.hasFieldMultipleValues(id)){
						value = objPanel.getFieldMultipleValues(id);
					}else{
						value = objPanel.getFieldValue(id);
					}

					if(valueExistsNotEmpty(prntRestrValue) && (id != 'date_start' && id != 'date_end')){
						tmpPrintableRestriction.push({
							'title': prntRestrTitle,
							'value': prntRestrValue
						});
					}

					objField.value = value;
				}
		}else if (!objField.isVisible && (id == 'date_start' || id == 'date_end')){
			objField.value = objPanel.getFieldValue(id);
		}
	});
	// check start date and end date
	var startDate = crtFilterSettings.get('date_start').value;
	var endDate = crtFilterSettings.get('date_end').value;
	var costFor = crtFilterSettings.get('cost_for').value;
	if(costFor === 'custom'){
		if(!valueExistsNotEmpty(startDate) || !valueExistsNotEmpty(endDate)){
			View.showMessage(getMessage('err_cost_for_values'));
			canContinue = false;
			return false;
		}
		/*
		 * KB 3028665 IOAN 09/06/2010
		 * check if end date is greater than start date
		 */
		var objDateStart = ds.parseValue(crtFilterSettings.get('date_start').name, startDate, false);
		var objDateEnd = ds.parseValue(crtFilterSettings.get('date_end').name, endDate, false);
		if(objDateStart.getTime() >= objDateEnd.getTime()){
			View.showMessage(getMessage('err_cost_for_dates'));
			canContinue = false;
			return false;
		}
	}
	// prepare overview note message
	//msgOverviewNote = getMessage("msg_overview_note");
	var currentDate = new Date();
	var lclStartDate = ds.formatValue(crtFilterSettings.get('date_start').name, ds.parseValue(crtFilterSettings.get('date_start').name, startDate, false), true);
	var lclEndDate = ds.formatValue(crtFilterSettings.get('date_end').name, ds.parseValue(crtFilterSettings.get('date_end').name, endDate, false), true);
	var lclCurrentDate = ds.formatValue(crtFilterSettings.get('date_end').name, currentDate, true);

	msgOverviewNote = String.format(getMessage("msg_overview_note"), lclStartDate, lclEndDate, lclCurrentDate);

	if(canContinue){
		printableRestriction =  tmpPrintableRestriction;
		return crtFilterSettings;
	}else{
		return false;
	}
}

/**
 * set filter values
 */
function setFilter(){
	var objPanel = View.panels.get('formFilter');
	var ds = objPanel.getDataSource();
	objDefaultSettings.each(function(objField){
		var id = objField.id;
		var type = objField.type;
		var isVisible = objField.isVisible;
		var isOption = objField.isOption;
		var value = objField.value;
		if (valueExists(value)) {
			// set field value
			if (type === 'checkbox') {
				var objCheckbox = document.getElementsByName('checkbox' + id);
				if(objCheckbox){
					for(var i=0;i<objCheckbox.length; i++){
						var optCheckbox = objCheckbox[i];
						var optValue = optCheckbox.value;
						var index = -1;
						for(var j=0;j<value.length;j++){
							if(value[i] == optValue){
								index = i;
								break;
							}
						}
						optCheckbox.checked = (index != -1);
					}
				}
			}
			else
				if (type === 'radio') {
					var objRadio = document.getElementsByName('radio' + id);
					if (objRadio) {
						for (var i = 0; i < objRadio.length; i++) {
							var optRadio = objRadio[i];
							optRadio.checked = (optRadio.value === value);
						}
					}
				}
				else {
					setFieldValue(objField, ds, objPanel, id, value);
				}
		}
		// show/hide field
		var isFieldVisible = (objField.isVisible && objField.isOption ? isMoreDetails: objField.isVisible);
		objPanel.showField(id, isFieldVisible);
	});
}

/**
 * enable/disable start_date, end_date fields
 */
function enableDate(enabled){
	var objRadio = document.getElementsByName('radiocost_for');
	var value = '';
	for (var i = 0; i < objRadio.length; i++) {
		var optRadio = objRadio[i];
		if(optRadio.checked){
			value = optRadio.value;
			break;
		}
	}
	var objPanel = View.panels.get('formFilter');
	setStartEndDateValues(value, fiscalYearFull, objPanel);
	enabled = (value === 'custom');
	objDefaultSettings.get('date_start').isVisible = enabled;
	objDefaultSettings.get('date_end').isVisible = enabled;
	objPanel.showField('date_start', enabled);
	objPanel.showField('date_end', enabled);
}

/**
 * set start date / end date based on current selection
 * @param {Object} option
 * @param {Object} fiscalYear
 * @param {Object} objPanel
 */
function setStartEndDateValues(option, fiscalYear, objPanel){
	var startDate =  new Date();
	var endDate =  new Date();

	switch(option){
		case 'fiscal':
			{
				startDate = fiscalYear;
				endDate = startDate.add(Date.YEAR, 1);
				break;
			}
		case 'calendar':
			{
				startDate.setMonth(0, 1);
				endDate = startDate.add(Date.YEAR, 1);
				break;
			}
		case 'quarter1':
			{
				startDate = fiscalYear;
				endDate = startDate.add(Date.MONTH, 3);
				break;
			}
		case 'quarter2':
			{
				startDate = fiscalYear.add(Date.MONTH, 3);
				endDate = startDate.add(Date.MONTH, 3);
				break;
			}
		case 'quarter3':
			{
				startDate = fiscalYear.add(Date.MONTH, 6);
				endDate = startDate.add(Date.MONTH, 3);
				break;
			}
		case 'quarter4':
			{
				startDate = fiscalYear.add(Date.MONTH, 9);
				endDate = startDate.add(Date.MONTH, 3);
				break;
			}
		case 'month':
			{
				startDate.setDate(1);
				endDate = startDate.add(Date.MONTH, 1);
				break;
			}
		default:
			{
				startDate = new Date();
				endDate = startDate.add(Date.DAY, 365);
				break;
			}
	}
	// always endDate = endDate - 1 day
	endDate = endDate.add(Date.DAY, -1);
	var ds = objPanel.getDataSource();
	var objField = objDefaultSettings.get('date_start');
	setFieldValue(objField, ds, objPanel, 'date_start', startDate);

	objField = objDefaultSettings.get('date_end');
	setFieldValue(objField, ds, objPanel, 'date_end', endDate);

}

/**
 * set field value
 * @param {Object} objField
 * @param {Object} objDs
 * @param {Object} objPanel
 * @param {Object} id
 * @param {Object} value
 */
function setFieldValue(objField, objDs, objPanel, id, value){
	if(!valueExistsNotEmpty(value)){
		value = "";
	}
	var name = id;
	if (valueExists(objField.name)) {
		name = objField.name;
	}
	objPanel.setFieldValue(id, objDs.formatValue(name, value, true));
}

/**
 * copy current default settings to global variable
 * defaultSettings
 * @param {Object} crtDefaultSettings
 */
function copyDefaultSettings(crtDefaultSettings){
	for(var i=0; i< crtDefaultSettings.items.length; i++){
		var crtItem = crtDefaultSettings.items[i];
		var crtId = crtItem.id;
		var lclItem = objDefaultSettings.get(crtId);
		// isVisible
		if(valueExists(crtItem.isVisible)){
			lclItem.isVisible = crtItem.isVisible;
		}
		// isOption
		if(valueExists(crtItem.isOption)){
			lclItem.isOption = crtItem.isOption;
		}
		// value
		if(valueExists(crtItem.value)){
			lclItem.value = crtItem.value;
		}
		// isParameter and formula, this must come together
		if(valueExists(crtItem.isParameter) && crtItem.isParameter){
			lclItem.isParameter = crtItem.isParameter;
			lclItem.formula = crtItem.formula;
		}
	}
}

/**
 * show / hide more options on filter console
 *
 * @param {Object} show
 */
function onMoreDetails(show){
	if(show != undefined && typeof(show)== 'boolean'){
		isMoreDetails = show;
	}else{
		isMoreDetails = !isMoreDetails;
	}
	var objPanel = View.panels.get('formFilter');
	objDefaultSettings.each(function(objField){
		var isFieldVisible = (objField.isVisible && objField.isOption ? isMoreDetails: objField.isVisible);
		objPanel.showField(objField.id, isFieldVisible);
	});
	/*
	 * KB 3028671 IOAN 09/06/2010
	 * set label
	 */
	var title = (isMoreDetails)? getMessage('msg_title_lessDetails'):getMessage('msg_title_moreDetails');
	objPanel.actions.get('moreDetails').setTitle(title);

	/*
	 * KB 3028706 refresh overview details panel
	 */
	if(overviewPanelId != null){
		var objOverviewPanel = View.panels.get(overviewPanelId);
		if(objOverviewPanel){
			var height = objOverviewPanel.parentEl.getHeight();
			if (isMoreDetails) {
				height++;
			} else {
				height--;
			}
			objOverviewPanel.parentEl.setHeight(height);
		}
	}
}

/**
 * copy object
 * @param {Object} object
 */
function copyObject(object){
	var tmp = (object instanceof Array) ? [] : {};
	for(prop in object){
		//if(prop == 'clone') continue;
		if (object[prop] && typeof object[prop] == "object") {
			tmp[prop] = copyObject(object[prop]);
		}
		else {
			tmp[prop] = object[prop];
		}
	}
	return tmp;
}

/**
 * get restriction object for overview panel is called from each main view that
 * include this restriction console
 *
 * @param {Object} controller - object, main view controller
 * @param {Object} objFilter - object, main view filter object
 * @param {Object} isBuilding - boolean true/false  if main view has clauses for building table
 * @param {Object} isProperty - boolean true/false  if main view has clauses for property table
 */
function getRestrictionForOverview(controller, objFilter, isBuilding, isProperty){

	var restriction = new Ab.view.Restriction();
	var parameters = {};
	// show leases associated with
	var objLsAssocWith = objFilter.get('ls_assoc');
	// local variable
	var isLsForBl = false;
	var isLsForPr = false;

	if(objLsAssocWith.isVisible){
		var value = objLsAssocWith.value;
		for(var i=0; i < value.length; i++){
			var relOp = (i>0)?'OR':')AND(';
			if(value[i] == 'bl'){
				isLsForBl = true;
				restriction.addClause('ls.bl_id', '', 'IS NOT NULL', relOp);
			}else if(value[i] == 'pr'){
				isLsForPr = true;
				restriction.addClause('ls.pr_id', '', 'IS NOT NULL', relOp);
			}
		}
	}else{
		isLsForBl = isBuilding;
		isLsForPr = isProperty;
	}
	// net income field
	var objNetIncome = objFilter.get('net_income');
	if(objNetIncome.isVisible){
		var value = objNetIncome.value;
		if(objNetIncome.isParameter){
			var paramValue = "";
			if(value == 'positive'){
				paramValue = " ("+ objNetIncome.formula +" >= 0) ";
			}else if(value == 'negative'){
				paramValue = " ("+ objNetIncome.formula +" < 0) ";
			}
			parameters[objNetIncome.id] = paramValue;
		}
	}

	// country
	addClauseForField(restriction, 'ctry_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// region
	addClauseForField(restriction, 'regn_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// state
	addClauseForField(restriction, 'state_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// city
	addClauseForField(restriction, 'city_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// site
	addClauseForField(restriction, 'site_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// property
	addClauseForField(restriction, 'pr_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr));

	// building
	addClauseForField(restriction, 'bl_id', objFilter, (isBuilding && isLsForBl), false);

	// lease
	var objLs = objFilter.get('ls.ls_id');
	if(objLs.isVisible){
		var value = objLs.value;
		if (valueExistsNotEmpty(value)) {
			var op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : '=';
			restriction.addClause('ls.ls_id', value, op, ')AND(');
		}
	}
	controller.restriction = restriction;
	controller.parameters = parameters;
}

/**
 * add clause to restriction for specified field
 * @param {Ab.view.Restriction} restriction
 * @param {String} fieldId
 * @param {Object} objFilter
 * @param {Boolean} isBuilding
 * @param {Boolean} isProperty
 */
function addClauseForField(restriction, fieldId, objFilter, isBuilding, isProperty){
	var objField = objFilter.get('bl.'+ fieldId);
	if (objField.isVisible) {
		var value = objField.value;
		if (valueExistsNotEmpty(value)) {
			var op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : '=';
			var relOp = ')AND(';
			if (isBuilding) {
				restriction.addClause('bl.' + fieldId, value, op, relOp);
			}
			if (isProperty) {
				relOp = (isBuilding)?'OR':')AND(';
				restriction.addClause('property.' + fieldId, value, op, relOp);
			}
		}
	}
}

/**
 *  Paginated report common objects and functions
 */
/**
 * config object for paginated report part
 */
var RptFileConfig = Base.extend({
	// report definition axvw file name
	fileName: null,
	// file main restriction, Ab.view.Restriction object or null
	fileRestriction: null,
	// main restriction field
	fieldRestriction: null,
	// report restriction. JSONObject with datasource or parameters restriction
	reportRestriction: null,
	// JSONArray[RptFileConfig] with child reports definition or null if this don't exist
	files: null,

	constructor: function(fileName, fileRestriction, fieldRestriction, reportRestriction, files){
		this.fileName = fileName;
		this.fileRestriction = fileRestriction;
		this.fieldRestriction = fieldRestriction;
		this.reportRestriction = reportRestriction;
		this.files = files;
	}
});


/**
 * start paginated report job
 * @param {Object} restriction
 * @param {Object} config
 */

function onPaginatedReport(config){

	var result = Workflow.callMethod('AbRPLMLeaseAdministration-LeaseAdministrationService-onPaginatedReport', config);

    if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
		result.data = eval('(' + result.jsonExpression + ')');
		var jobId = result.data.jobId;
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	}
}

/**
 * Export to XLS an Overview panel
 *
 * @param controller
 * @param panelId
 */
function overviewExportXLS(controller, panelId){
	try{
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));

		var panel = View.panels.get(panelId);
		var reportViewName = panel.viewDef.viewName + '.axvw';
		var reportTitle = convertFromXMLValue(panel.title);
		if(reportTitle==''){
			reportTitle = Ab.view.View.title;
		}
		var visibleFieldDefs = getVisibleFieldDefs(panel);

		var jobId = Workflow.startJob("AbRPLMLeaseAdministration-calculateCashFlowProjection-generateGridXLSReport",
				reportViewName, panel.dataSourceId, reportTitle, visibleFieldDefs, controller.restriction, controller.parameters);

		var jobStatus = Workflow.getJobStatus(jobId);
		//XXX: finished or failed
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}

		if (jobStatus.jobFinished) {
			var url  = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}

		View.closeProgressBar();
	}
	catch(e){
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}

/**
 * Provide panel fields list to DOCX and Grid XLS  report
 * @param panel
 * @returns {Array}
 */
function getVisibleFieldDefs(panel){
	var fieldDefs = panel.fieldDefs;
	if(fieldDefs && fieldDefs.length == 0){
		panel.getDataSource().fieldDefs.each(function (fieldDef) {
			fieldDefs.push(fieldDef);
		});
	}

	var visibleFieldDefs = [];
	var columns = panel.columns;
	for (var i = 0, column; column = columns[i]; i++) {
		 if(column.hidden){
			 continue;
		 }
	     var field = getFieldDefById(fieldDefs, column.id, i);
	     if(valueExists(field)){
	    	 if(field.controlType == '' || field.controlType == 'link'){
	    		 visibleFieldDefs.push(field);
	    	 }
	     }
	}
	return visibleFieldDefs;
}

/**
 *
 * @param fieldDefs
 * @param id
 * @param index
 * @returns a fieldDefs[index] or null
 */
function getFieldDefById(fieldDefs, id, index){
	if(index < fieldDefs.length){
    	var field = fieldDefs[index];
    	if(valueExists(field) && (id == field.id)){
    		return field;
    	}
	}
	//use case: manually add columns in js
	for (var i = 0, field; field = fieldDefs[i]; i++) {
		if(id == field.id){
			return field;
		}
	}

	return null;
}

/**
 * get customized printable restriction for details report
 *
 * @param printableRestriction
 */
function getCustomPrintableRestriction(printableRestriction){
	var removeFields = ["ls_assoc", "bl.ctry_id", "bl.regn_id", "bl.pr_id", "bl.state_id", "bl.bl_id", "bl.city_id", "bl.site_id", "ls.ls_id"];
	var objPanel =  View.panels.get('formFilter');
	//objPanel.fields.get(id).fieldDef.title;
	var clone = copyObject(printableRestriction);
	for (var i=0; i < removeFields.length; i++ ){
		var field = removeFields[i];
		var fieldTitle = objPanel.fields.get(field).fieldDef.title;
		for(var j=0; j < clone.length; j++ ){
			var clause = clone[j];
			if(clause.title === fieldTitle){
				clone.remove(clause);
				break;
			}
		}
	}
	return (clone);
}
