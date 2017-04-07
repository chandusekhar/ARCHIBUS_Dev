/**
 * KB 3036464 - Align filter action buttons to left.
 */
Ab.view.Component.prototype.isToolbarRightAligned = function(){
	if (this.id == 'formFilter'){
		return false;
	}else{
		return true;
	}
}

/*
 * default filter settings, initialized from parent view
 */ 
var objDefaultSettings = {
	items:[
		{id:'cost_from', type: 'checkbox', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'cost_for', type: 'radio', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'net_income', type: 'radio', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'date_start', type: '', isVisible: false, isOption: false, value: null, name: 'bl.date_bl', isParameter: false, formula: null},
		{id:'date_end', type: '', isVisible: false, isOption: false, value: null, name: 'bl.date_bl', isParameter: false, formula: null},
		{id:'ls_assoc', type: 'checkbox', isVisible: true, isOption: false, value: null, isParameter: false, formula: null},
		{id:'update_area', type: 'checkbox', isVisible: true, isOption: false, value: ['true', 'false'], isParameter: false, formula: null},
		{id:'update_tax', type: 'checkbox', isVisible: true, isOption: false, value: ['true', 'false'], isParameter: false, formula: null},
		{id:'bl.ctry_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.regn_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.pr_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.state_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.bl_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.city_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'bl.site_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null},
		{id:'ls.ls_id', type: '', isVisible: true, isOption: true, value: null, isParameter: false, formula: null}
	],
	
	keys:["cost_from", "cost_for", "net_income", "date_start", "date_end","ls_assoc", "update_area", "update_tax",
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

	console.setFieldLabel('ls_assoc', console.getFieldLabelElement('ls_assoc').innerHTML.replace('{0}', '<br/>'));
	
	// leases associated with
	$('title_ls_assoc_bl').innerHTML = getMessage('msg_title_ls_assoc_bl');
	$('title_ls_assoc_pr').innerHTML = getMessage('msg_title_ls_assoc_pr');
	$('title_update_area').innerHTML = getMessage('msg_title_update_area');
	$('title_update_tax').innerHTML = getMessage('msg_title_update_tax');
	
	fiscalYearFull = getFiscalYear();
}


/**
 * get fiscal year settings from schema
 */
function getFiscalYear(){
	var fiscalDateFull = new Date();
	var currentDate = new Date();
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
		if (currentDate.getTime() < fiscalDateFull.getTime()) {
			fiscalDateFull = fiscalDateFull.add(Date.YEAR, -1);
		}
		return(fiscalDateFull);
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * apply current filter to target panel
 */
function applyFilter(){
	var objPanel = View.panels.get('formFilter');
	var crtFilterSettings = readFilter();
	var displayVAT = {
			type: '',
			isHidden: false
		};
	var displayCurrency = {
			type: '',
			code: '',
			exchangeRateType: 'Budget'
		};
	
	if(valueExists(objPanel.displayVAT)){
		displayVAT = copyObject(objPanel.displayVAT);
	}
	if(valueExists(objPanel.displayCurrency)){
		displayCurrency = copyObject(objPanel.displayCurrency);
	}
	
	if(crtFilterSettings){
		onApplyFilter(crtFilterSettings, printableRestriction, displayVAT, displayCurrency);
	}
	
}


/**
 * clear current filter settings
 * and restore to default
 */
function clearFilter(){
	// reset MC and VAT
	var objPanel = View.panels.get('formFilter');
	
	if(valueExists(objPanel.displayVAT)){
		if(!valueExists(objPanel.displayVAT.isHidden) || 
				(valueExists(objPanel.displayVAT.isHidden) && !objPanel.displayVAT.isHidden)){
			if(valueExists(objPanel.customMcVatDefaults) && valueExists(objPanel.customMcVatDefaults.displayVAT)){
				objPanel.displayVAT.type = objPanel.customMcVatDefaults.displayVAT.type;
			}else{
				objPanel.displayVAT.type = "total";
			}
		}
	}
	
	if(valueExists(objPanel.displayCurrency)){
		if(valueExists(objPanel.customMcVatDefaults) && valueExists(objPanel.customMcVatDefaults.displayCurrency)){
			objPanel.displayCurrency.type = objPanel.customMcVatDefaults.displayCurrency.type;
			objPanel.displayCurrency.code = objPanel.customMcVatDefaults.displayCurrency.code;
			objPanel.displayCurrency.exchangeRateType = objPanel.customMcVatDefaults.displayCurrency.exchangeRateType;
		}else{
			objPanel.displayCurrency.type = 'budget';
			objPanel.displayCurrency.code = View.project.budgetCurrency.code;
			objPanel.displayCurrency.exchangeRateType = 'Budget';
		}
	}
	
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
	
	var costs = crtFilterSettings.get('cost_from').value;
	var lclCosts = "";
	if(costs.length == 1){
		lclCosts = getMessage("msg_" + costs[0]);
	}else if (costs.length == 2){
		lclCosts = getMessage("msg_" + costs[0]) + " " + 
				   getMessage('msg_and') + " " + 
				   getMessage("msg_" + costs[1]);
	} else if(costs.length == 3){
		lclCosts = getMessage("msg_" + costs[0]) + ", " + 
		  		   getMessage("msg_" + costs[1]) + " " + 
		  		   getMessage('msg_and') + " " + 
		  		   getMessage("msg_" + costs[2]);
	}
	
	msgOverviewNote = String.format(getMessage("msg_overview_note"), lclCosts, lclStartDate, lclEndDate, lclCurrentDate);
	
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
function setFilter(displayVAT, displayCurrency, customMcVatDefaults){
	var objPanel = View.panels.get('formFilter');
	var ds = objPanel.getDataSource();
	
	// set vat variables to filter panel
	if (valueExists(displayVAT) && View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1){
		objPanel.displayVAT = displayVAT;
	}

	if (valueExists(displayCurrency) && View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1){
		objPanel.displayCurrency = displayCurrency;
	}
	
	if (valueExists(customMcVatDefaults) && View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1){
		objPanel.customMcVatDefaults = customMcVatDefaults;
	}
	
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
							if(value[j] == optValue){
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
		if (valueExistsNotEmpty(type)) {
			setFieldVisible(objPanel, id, isFieldVisible);
		} else{
			objPanel.showField(id, isFieldVisible);
		}
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
	setFieldVisible(objPanel, 'date_start', enabled);
	setFieldVisible(objPanel, 'date_end', enabled);

    onMoreDetails(false);
}

function setFieldVisible(panel, fieldName, visible){
	var fieldEl = panel.getFieldElement(fieldName);
	if (fieldEl != null) {
		var parent = fieldEl.parentNode;
		if (parent.previousSibling) {
			var el = Ext.get(parent.previousSibling);
            if (el != null) {
                el.setVisible(visible);
            }
		}
		var el = Ext.get(parent);
        if (el != null) {
            el.setVisible(visible);
        }
        if (visible) {
            Ext.get(fieldEl.parentNode).removeClass('nohover');
        } else {
            Ext.get(fieldEl.parentNode).addClass('nohover');
        }
	}
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
		if (valueExistsNotEmpty(objField.type)) {
			setFieldVisible(objPanel, objField.id, isFieldVisible);
		} else{
			objPanel.showField(objField.id, isFieldVisible);
		}
	});
	/*
	 * KB 3028671 IOAN 09/06/2010
	 * set label
	 */
	var title = (isMoreDetails)?getMessage('msg_title_lessDetails'):getMessage('msg_title_moreDetails');
	objPanel.actions.get('moreDetails').setTitle(title);

    updateOverviewPanelHeight();
}

/*
 * KB 3028706 refresh overview details panel
 */
function updateOverviewPanelHeight() {
    if(overviewPanelId != null) {
        var objOverviewPanel = View.panels.get(overviewPanelId);
        if (objOverviewPanel) {
            objOverviewPanel.updateHeight();
            /*
            var height = objOverviewPanel.parentEl.getHeight();
            if (isMoreDetails) {
                height++;
            } else {
                height--;
            }
            objOverviewPanel.parentEl.setHeight(height);
            */
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
 * @param controller - object, main view controller
 * @param objFilter - object, main view filter object 
 * @param isBuilding - boolean true/false  if main view has clauses for building table
 * @param isProperty - boolean true/false  if main view has clauses for property table
 * @param isSqlString - boolean true/false if true restriction must be sql string, default is false
 */
function getRestrictionForOverview(controller, objFilter, isBuilding, isProperty, isSqlString){

	if(!valueExists(isSqlString)){
		isSqlString = false;
	}
	
	var restriction = ((isSqlString)?[]:new Ab.view.Restriction());
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
				if(isSqlString){
					var clause = relOp + " ls.bl_id IS NOT NULL ";
					restriction.push(clause);
				}else{
					restriction.addClause('ls.bl_id', '', 'IS NOT NULL', relOp);
				}
			}else if(value[i] == 'pr'){
				isLsForPr = true;
				if(isSqlString){
					var clause = relOp + " ls.pr_id IS NOT NULL ";
					restriction.push(clause);
				}else{
					restriction.addClause('ls.pr_id', '', 'IS NOT NULL', relOp);
				}
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
			var paramValue = "1  = 1";
			if(value == 'positive'){
				paramValue = " ("+ objNetIncome.formula +" >= 0) ";
			}else if(value == 'negative'){
				paramValue = " ("+ objNetIncome.formula +" < 0) ";
			}
			parameters[objNetIncome.id] = paramValue;
		}
	}

	// country
	addClauseForField(restriction, 'ctry_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);
	
	// region
	addClauseForField(restriction, 'regn_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);
	
	// state
	addClauseForField(restriction, 'state_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);
	
	// city
	addClauseForField(restriction, 'city_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);	
	
	// site
	addClauseForField(restriction, 'site_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);	
	
	// property
	addClauseForField(restriction, 'pr_id', objFilter, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);	

	// building 
	addClauseForField(restriction, 'bl_id', objFilter, (isBuilding && isLsForBl), false, isSqlString);	
	
	// we must add VPA restriction
	if(valueExistsNotEmpty(controller.vpaRestriction)){
		addVpaRestriction(restriction, controller.vpaRestriction, (isBuilding && isLsForBl), (isProperty && isLsForPr), isSqlString);
	}
	
	// lease 
	var objLs = objFilter.get('ls.ls_id');
	if(objLs.isVisible){
		var value = objLs.value;
		if (valueExistsNotEmpty(value)) {
			var op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : '=';
			if(isSqlString){
				var clause = ")AND( ls.ls_id " + op + " " + formatValueForSqlString(value);
				restriction.push(clause);
			}else{
				restriction.addClause('ls.ls_id', value, op, ')AND(');
			}
		}
	}
	var formattedRestriction;
	// if is SQL string restriction we must remove first relation operator and add paranthesis
	if(isSqlString){
		// relop: "AND" "OR" ")AND(" ")OR(" 
		if(typeof(restriction) === 'object' && restriction instanceof Array && restriction.length > 0){
			var clause = restriction[0];
			var operators = ["AND", "OR", ")AND(" , ")OR("];
			clause = removeOperator(clause, operators);
			restriction[0] = clause;
			formattedRestriction = "(" + restriction.join(" ") + ")";
		}else{
			formattedRestriction = "1 = 1";
		}
	}else{
		formattedRestriction = restriction;
	}
	
	controller.restriction = formattedRestriction;
	controller.parameters = parameters;
}

/**
 * Remove operator from string if is in first position.
 * @param value
 * @param operators
 * @returns
 */
function removeOperator(value, operators){
	value = trim(value);
	for(var i = 0; i <  operators.length; i++){
		var op = operators[i];
		if(value.indexOf(op) == 0){
			value =  value.substr(op.length, value.length);
			break;
		}
	}
	return value;
}

/**
 * Trim string function. 
 */
function trim(value){
	if(value.constructor == String || typeof(value) === 'string'){
		return value.replace(/^\s*/, "").replace(/\s*$/, "");
	}
	return value;
}
/**
 * add clause to restriction for specified field
 * @param {Object} restriction
 * @param {String} fieldId
 * @param {Object} objFilter
 * @param {Boolean} isBuilding
 * @param {Boolean} isProperty
 * @param {Boolean} isSqlString - boolean true/false if true restriction must be sql string, default is false
 */
function addClauseForField(restriction, fieldId, objFilter, isBuilding, isProperty, isSqlString){
	var objField = objFilter.get('bl.'+ fieldId);
	if (objField.isVisible) {
		var value = objField.value;
		if (valueExistsNotEmpty(value)) {
			var op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : '=';
			var relOp = ')AND(';
			if (isBuilding) {
				if(isSqlString){
					var clause = relOp + " bl." + fieldId + " " + op + " " + formatValueForSqlString(value);
					restriction.push(clause);
				}else{
					restriction.addClause('bl.' + fieldId, value, op, relOp);
				}
			}
			if (isProperty) {
				relOp = (isBuilding)?'OR':')AND(';
				if(isSqlString){
					var clause = relOp + " property." + fieldId + " " + op + " " + formatValueForSqlString(value);
					restriction.push(clause);
				}else{
					restriction.addClause('property.' + fieldId, value, op, relOp);
				}
			}
		}
	}
}

/**
 * Add Vpa restriction to current restriction.
 * 
 * @param restriction
 * @param vpaRestriction
 * @param isBuilding
 * @param isProperty
 * @param isSqlString
 */
function addVpaRestriction(restriction, vpaRestriction, isBuilding, isProperty, isSqlString){
	if(valueExistsNotEmpty(vpaRestriction)){
		var relOp = ')AND(';
		if(isBuilding){
			var isBuildingVpa = false;
			if(valueExistsNotEmpty(vpaRestriction.restriction["bl.bl_id"])){
				isBuildingVpa = true;
				if(isSqlString){
					var clause = vpaRestriction.string["bl.bl_id"];
					clause = relOp + clause.slice(3, clause.length);
					restriction.push(clause);
				}else{
					var tmpRestriction = vpaRestriction.restriction["bl.bl_id"];	
					tmpRestriction.clause[0].relOp = relOp;
					restriction.addClauses(vpaRestriction.restriction["bl.bl_id"], false, true);
				}
			}
			if(valueExistsNotEmpty(vpaRestriction.restriction["site.site_id"])){
				relOp = (isBuildingVpa)?'OR':')AND(';
				if(isSqlString){
					var clause = vpaRestriction.string["site.site_id"].replace(/site\./g, "bl.");
					clause = relOp + clause.slice(3, clause.length);
					restriction.push(clause);
				}else{
					var tmpRestriction = vpaRestriction.restriction["site.site_id"];
					for( var i=0; i < tmpRestriction.clauses.length; i++ ){
						tmpRestriction.clause[i].name = tmpRestriction.clause[i].name.replace(/site\./g, "bl.");
					}
					tmpRestriction.clause[0].relOp = relOp;
					restriction.addClauses(tmpRestriction, false, true);
				}
			}
		}
		if(isProperty){
			relOp = (isBuilding)?'OR':')AND(';
			if(valueExistsNotEmpty(vpaRestriction.restriction["site.site_id"])){
				if(isSqlString){
					var clause = vpaRestriction.string["site.site_id"].replace(/site\./g, "property.");
					clause = relOp + clause.slice(3, clause.length);
					restriction.push(clause);
				}else{
					var tmpRestriction = vpaRestriction.restriction["site.site_id"];
					for( var i=0; i < tmpRestriction.clauses.length; i++ ){
						tmpRestriction.clause[i].name = tmpRestriction.clause[i].name.replace(/site\./g, "property.");
					}
					tmpRestriction.clause[0].relOp = relOp;
					restriction.addClauses(tmpRestriction, false, true);
				}
			}
		}
	}
}

/**
 * Format value for sql string restriction.
 * @param value
 */
function formatValueForSqlString(value){
	var formmattedValue;
	if(typeof(value) === 'object' && value instanceof Array){
		formmattedValue = "('" + value.join("','") + "')";
	}else{
		formmattedValue = "'" + value + "'";
	}
	return formmattedValue;
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

/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}
	});
}

/**
 * Remove panel level action button.
 * @param name
 * @param hidden 
 */
function hideAction(name, hidden){
	var objPanel = View.panels.get("formFilter");
	var action = objPanel.actions.get(name);
	if(action){
		action.forceHidden(hidden);
	}
}

/**
 * Get list of costs where we must update MC and VAT
 * @param dateFrom
 * @param dateTo
 * @param isFromCosts
 * @param isFromScheduledCosts
 * @param isFromRecurringCosts
 * @param isActiveRecurringCosts
 */
function getCostsList(dateFrom, dateTo, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts){
	var costs = {
			ids: [],
			types: [],
			add: function(id, type){
				this.ids.push(id);
				this.types.push(type);
			}
	};
	var costType = "";
	if (isFromCosts){
		costType = "cost_tran";
		var restriction = "( ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} >= ${sql.date('" + dateFrom + "')} ";
		restriction += " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} <= ${sql.date('" + dateTo + "')} )";
		var parameters = {
				tableName: "cost_tran",
				fieldNames: toJSON(["cost_tran.cost_tran_id"]),
				restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.code == 'executed'){
			for(var i = 0; i < result.data.records.length; i++){
				var record = result.data.records[i];
				if(valueExistsNotEmpty(record["cost_tran.cost_tran_id"])){
					costs.add(parseInt(record["cost_tran.cost_tran_id"]), costType);
				}
			}
		}
	}
	if (isFromScheduledCosts){
		costType = "cost_tran_sched";
		var restriction = "( ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} >= ${sql.date('" + dateFrom + "')} ";
		restriction += " AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} <= ${sql.date('" + dateTo + "')} )";
		var parameters = {
				tableName: "cost_tran_sched",
				fieldNames: toJSON(["cost_tran_sched.cost_tran_sched_id"]),
				restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.code == 'executed'){
			for(var i = 0; i < result.data.records.length; i++){
				var record = result.data.records[i];
				if(valueExistsNotEmpty(record["cost_tran_sched.cost_tran_sched_id"])){
					costs.add(parseInt(record["cost_tran_sched.cost_tran_sched_id"]), costType);
				}
			}
		}
	}
	if (isFromRecurringCosts){
		costType = "cost_tran_recur";
		var restriction = "((cost_tran_recur.date_end >= ${sql.date('" + dateFrom + "')} OR cost_tran_recur.date_end IS NULL ) ";
		restriction += " AND cost_tran_recur.date_start <= ${sql.date('" + dateTo + "')})";
		if(isActiveRecurringCosts != -1){
			restriction += " AND cost_tran_recur.status_active = " +  isActiveRecurringCosts;
		}
		var parameters = {
				tableName: "cost_tran_recur",
				fieldNames: toJSON(["cost_tran_recur.cost_tran_recur_id"]),
				restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.code == 'executed'){
			for(var i = 0; i < result.data.records.length; i++){
				var record = result.data.records[i];
				if(valueExistsNotEmpty(record["cost_tran_recur.cost_tran_recur_id"])){
					costs.add(parseInt(record["cost_tran_recur.cost_tran_recur_id"]), costType);
				}
			}
		}
	}
	
	return costs;
}

/**
 * Initialize filter action buttons
 * @param isRefreshButtonVisible
 */
function setFilterButtons(isRefreshButtonVisible){
	var objFilterPanel = View.panels.get("formFilter");
	if (isRefreshButtonVisible) {
		objFilterPanel.actions.get("show").setTitle(getMessage("msg_title_process"));
		objFilterPanel.actions.get("refresh").show(true);
	}
	
}

/**
 * Refresh report without summarizing costs.
 */
function refreshReport(){
	var objPanel = View.panels.get('formFilter');
	var crtFilterSettings = readFilter();
	var displayVAT = {
			type: '',
			isHidden: false
		};
	var displayCurrency = {
			type: '',
			code: '',
			exchangeRateType: ''
		};
	
	if(valueExists(objPanel.displayVAT)){
		displayVAT = copyObject(objPanel.displayVAT);
	}
	if(valueExists(objPanel.displayCurrency)){
		displayCurrency = copyObject(objPanel.displayCurrency);
	}
	
	if(crtFilterSettings){
		onRefreshReport(crtFilterSettings, printableRestriction, displayVAT, displayCurrency);
	}
}

function getRequestParameters(objFilter, displayCurrency, displayVAT){
	var requestParameters = {
			"ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "", "ls_id": "",
			"multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
			"cost_from": "000", "cost_assoc_with": "", "cost_type_of": "", 
			"date_start":"", "date_end": "", "period":"", "is_fiscal_year": "true", 
			"currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false", "update_area" : "true", "update_tax" : "true"
	};
	// geographical fields
	if (valueExistsNotEmpty(objFilter.get("bl.ctry_id").value)) {
		requestParameters["ctry_id"] = getRequestParamValue(objFilter.get("bl.ctry_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.regn_id").value)) {
		requestParameters["regn_id"] = getRequestParamValue(objFilter.get("bl.regn_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.state_id").value)) {
		requestParameters["state_id"] = getRequestParamValue(objFilter.get("bl.state_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.city_id").value)) {
		requestParameters["city_id"] = getRequestParamValue(objFilter.get("bl.city_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.site_id").value)) {
		requestParameters["site_id"] = getRequestParamValue(objFilter.get("bl.site_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.pr_id").value)) {
		requestParameters["pr_id"] = getRequestParamValue(objFilter.get("bl.pr_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("bl.bl_id").value)) {
		requestParameters["bl_id"] = getRequestParamValue(objFilter.get("bl.bl_id").value); 
	}
	if (valueExistsNotEmpty(objFilter.get("ls.ls_id").value)) {
		requestParameters["ls_id"] = getRequestParamValue(objFilter.get("ls.ls_id").value); 
	}
	// dates
	requestParameters["date_start"] = objFilter.get("date_start").value;
	requestParameters["date_end"] = objFilter.get("date_end").value;
	var costForPeriod = objFilter.get('cost_for').value;
	requestParameters["is_fiscal_year"] = (costForPeriod == 'fiscal'?"true":"false");
	requestParameters["period"] = getDatePeriod(costForPeriod);

	var costFrom = objFilter.get('cost_from').value;
	var arrCostFrom = ['0', '0', '0'];
	for (var i=0; i < costFrom.length; i++) {
		switch(costFrom[i]){
			case 'recurring': {arrCostFrom[0] = '1'; break;}
			case 'scheduled': {arrCostFrom[1] = '1'; break;}
			case 'cost': {arrCostFrom[2] = '1'; break;}
		}
	}
	requestParameters["cost_from"] = arrCostFrom.join('');
	// lease associated with
	var lsAssociatedWith = objFilter.get('ls_assoc').value;
	if (valueExistsNotEmpty(lsAssociatedWith)){
		if (lsAssociatedWith.length == 2){
			requestParameters["cost_assoc_with"] = "ls";
		}else {
			requestParameters["cost_assoc_with"] = (lsAssociatedWith[0] == "bl"?"ls_bl":"ls_pr");
		}
	}
	// MC and VAt 
	
	requestParameters["isMcAndVatEnabled"] = View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1?"true":"false";
	requestParameters["currency_code"] = displayCurrency.code;
	requestParameters["exchange_rate"] = displayCurrency.exchangeRateType;
	requestParameters["is_budget_currency"] = (displayCurrency.type == 'budget'?"true":"false");
	requestParameters["vat_cost_type"] = displayVAT.type;
	// if length = 2 then update_area = true else false
	requestParameters["update_area"] = (objFilter.get("update_area").value.length > 1);
	requestParameters["update_tax"] = (objFilter.get("update_tax").value.length > 1);
	return requestParameters;
}
/**
 * Format multiple selection values.
 * @param value value
 * @returns string
 */
function getRequestParamValue(value){
	var result = value;
	if (typeof(value) === 'object' && value instanceof Array) {
		result = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	}
	return result;
}

/**
 * Display summarized cost in details panel.
 * @param form form object
 * @param row selected row
 * @param tableName main table name
 * @param pKey primary key field
 * @param isMcAndVatEnabled if Mc And vat is enabled
 * @param currencyCode selected currency code 
 * @param costFields cost fields
 * @param costValues cost values
 */
function displayCosts(form, row, tableName, pKey, isMcAndVatEnabled, currencyCode, costFields, costValues){
	var dataSource = form.getDataSource();
	var currencySymbol = View.project.currencies.currencySymbolFor(currencyCode);
	for (var index = 0; index < costFields.length; index++) {
		var costField = costFields[index];
		var costFieldValues = null;
		if (valueExistsNotEmpty(costField.formula)) {
			costFieldValues = evaluateFormula(costField.formula, costValues, isMcAndVatEnabled);
		}else{
			costFieldValues = costValues[costField.id];
		}
		// get cell element
		var tdElement = form.getFieldCell('vf_' + costField.id);
		tdElement.className = 'nohover';
		var trElement = tdElement.parentElement;
		if (isMcAndVatEnabled) {

			dataSource.fieldDefs.get(tableName + "." + costField.id).currency = currencyCode;
			// display in current span element
			if (costField.hasCustomStyle) {
				tdElement.style.borderTopStyle = 'solid';
				tdElement.style.borderTopWidth = 'thin';
			}
			tdElement.children[0].innerHTML = dataSource.formatValue(tableName + "." + costField.id,  costFieldValues['total'], true);
/*
			dataSource.fieldDefs.get(tableName + "." + costField.id).currency = currencyCode;
			var cellIndex = parseInt(tdElement.cellIndex);
			// add total label
			tdElement.width = "5%";
			tdElement.className = 'label null';
			tdElement.style.color = "#777777";
			tdElement.innerHTML = getMessage('labelCost_total');
			// add total value
			var tdElementTotalCell = document.getElementById("ShowTotal" + costField.id + "cell");
			if (!valueExists(tdElementTotalCell)) {
				tdElementTotalCell = trElement.insertCell(cellIndex + 1);
			}
			tdElementTotalCell.id = "ShowTotal" + costField.id + "cell";
			tdElementTotalCell.width = "5%";
			tdElementTotalCell.className = 'nohover';
			if (costField.hasCustomStyle) {
				tdElementTotalCell.style.borderTopStyle = 'solid';
				tdElementTotalCell.style.borderTopWidth = 'thin';
			}
			tdElementTotalCell.innerHTML = '<span class="inputField">' + dataSource.formatValue(tableName + "." + costField.id,  costFieldValues['total'], true) +'</span>';

			// vat cost
			var tdElementVatLabel = document.getElementById("ShowVat" + costField.id + "label");
			if (!valueExists(tdElementVatLabel)) {
				tdElementVatLabel = trElement.insertCell(cellIndex + 2);
			}
			tdElementVatLabel.id = "ShowVat" + costField.id + "label";
			tdElementVatLabel.width = "5%";
			tdElementVatLabel.className = 'label null';
			tdElementVatLabel.style.color = "#777777";
			tdElementVatLabel.innerHTML = getMessage('labelCost_vat');
			//
			var tdElementVatCell = document.getElementById("ShowVat" + costField.id + "cell");
			if (!valueExists(tdElementVatCell)) {
				tdElementVatCell = trElement.insertCell(cellIndex + 3);
			}
			tdElementVatCell.id = "ShowVat" + costField.id + "cell";
			tdElementVatCell.width = "5%";
			tdElementVatCell.className = 'nohover'; 
			if (costField.hasCustomStyle) {
				tdElementVatCell.style.borderTopStyle = 'solid';
				tdElementVatCell.style.borderTopWidth = 'thin';
			}
			tdElementVatCell.innerHTML =  '<span class="inputField">' + dataSource.formatValue(tableName + "." + costField.id,  costFieldValues['vat'], true) +'</span>';

			// base cost
			var tdElementBaseLabel = document.getElementById("ShowBase" + costField.id + "label");
			if (!valueExists(tdElementBaseLabel)) {
				tdElementBaseLabel = trElement.insertCell(cellIndex + 4);
			}
			tdElementBaseLabel.id = "ShowBase" + costField.id + "label";
			tdElementBaseLabel.width = "5%";
			tdElementBaseLabel.className = 'label null';
			tdElementBaseLabel.style.color = "#777777";
			tdElementBaseLabel.innerHTML = getMessage('labelCost_base');
			//
			var tdElementBaseCell = document.getElementById("ShowBase" + costField.id + "cell");
			if (!valueExists(tdElementBaseCell)) {
				tdElementBaseCell = trElement.insertCell(cellIndex + 5);
			}
			tdElementBaseCell.id = "ShowBase" + costField.id + "cell";
			tdElementBaseCell.width = "5%";
			tdElementBaseCell.className = 'nohover';
			if (costField.hasCustomStyle) {
				tdElementBaseCell.style.borderTopStyle = 'solid';
				tdElementBaseCell.style.borderTopWidth = 'thin';
			}
			tdElementBaseCell.innerHTML =  '<span class="inputField">' + dataSource.formatValue(tableName + "." + costField.id,  costFieldValues['base'], true) +'</span>';
*/
		}else{
			// display in current span element
			if (costField.hasCustomStyle) {
				tdElement.style.borderTopStyle = 'solid';
				tdElement.style.borderTopWidth = 'thin';
			}
			tdElement.children[0].innerHTML = dataSource.formatValue(tableName + "." + costField.id,  costFieldValues['budget'], true);
		}
	}
}

/**
 * TODO: must be moved on server
 * 
 * @param formula
 * @param values
 * @param isMcAndVatEnabled
 * @returns
 */
function evaluateFormula(formula, values, isMcAndVatEnabled){
	var costValues = isMcAndVatEnabled?{budget: 0.0, total: 0.0, vat: 0.0, base: 0.0}:{budget: 0.0};
	for (var prop in costValues) {
		var tmpFormula = formula;
		for (var field in values) {
			var fieldValue = values[field][prop];
			tmpFormula = tmpFormula.replace(field, fieldValue.toString());
		}
		// try to evaluate
		try{
			var evaluatedValue = eval('parseFloat(' + tmpFormula + ')');
			costValues[prop] = evaluatedValue
		} catch(e){
			
		}
	}
	return costValues;
}

function getDatePeriod(costForPeriod){
	var period = "";
	if ( costForPeriod === 'fiscal' || costForPeriod === 'calendar') {
		period = "YEAR";
	} else if ( costForPeriod === 'quarter1' || costForPeriod === 'quarter2' || costForPeriod === 'quarter3' || costForPeriod === 'quarter4') {
		period = "QUARTER";
	} else if ( costForPeriod === 'month') {
		period = "MONTH";
	} else {
		period = "CUSTOM";
	}
	return period;
}

/**
 * get summarized costs details.
 * @param type summary tyoe
 * @param requestParameters request parameters.
 */
function getSummarizedCostsDetails(type, requestParameters) {
	try {
		var result = Workflow.callMethod("AbCommonResources-CostReportingService-summarizeCostsDetails", type, requestParameters);
		return JSON.parse(result.jsonExpression);
		
	} catch (e) {
		Workflow.handleError(e);
	}
}
