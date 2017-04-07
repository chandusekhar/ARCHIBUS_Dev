/*
* read console geographical field
* return string if is single selection  or array if is multiple selection
*/
function getConsoleFieldValue(objConsole, field){
	if(objConsole.hasFieldMultipleValues(field)){
		return (objConsole.getFieldMultipleValues(field));
	}else{
		return (objConsole.getFieldValue(field));
	}
}

/*
* format value (array or string) to SQL statement
*/
function toSQLRestrString(value){
	if(typeof(value) === 'object' && value instanceof Array){
		return ("('" + value.join("','") + "')");
	}else{
		return ("('" + value + "')");
	}
}

/**
* format value (array or string) to SQL statement
* Replace empty value by "NULL"
*/
function toSQLRestrStringNULL(value){
	if(typeof(value) === 'object' && value instanceof Array){
		return ("('" + value.join("','") + "')");
	}else if(valueExistsNotEmpty(value)) {
		return ("('" + value + "')");
	} else {
		return 'NULL';
	}
}


/**
 * Sets displayVAT and displayCurrency controller variables
 * depending on user selection
 * @param controller tabs container-view controller
 * @returns {setVATAndMCVariables}
 */
function setVATAndMCVariables(controller){
	if (valueExists(controller.console.displayVAT)){
		controller.displayVAT = controller.console.displayVAT;
	}
	
	if(valueExists(controller.console.displayCurrency)){
		controller.displayCurrency = controller.console.displayCurrency;
	}
}

/**
 * Set tabs titles, show/hide grid columns
 * depending on VAT display and currency
 * @param controller tabs container-view controller
 * @returns
 */
function setVATAndMCDisplay(controller){
	if(!controller.isMcAndVatEnabled)
		return;
	
	// tab titles
	var displayVATMessage = getMessage(controller.displayVAT.type);
	controller.tabsCosts.setTabTitle("tabsCosts_0", getMessage("tab_title_RecCosts").replace("{0}", displayVATMessage));
	controller.tabsCosts.setTabTitle("tabsCosts_1", getMessage("tab_title_SchedCosts").replace("{0}", displayVATMessage));
	controller.tabsCosts.setTabTitle("tabsCosts_2", getMessage("tab_title_ActCosts").replace("{0}", displayVATMessage));
	
	// grid columns
	showHideColumns(controller, controller.recurringCostGrid, "cost_tran_recur");
	showHideColumns(controller, controller.scheduledCostUpper, "cost_tran_sched");
	showHideColumns(controller, controller.scheduledCostLower, "cost_tran_sched");
	showHideColumns(controller, controller.actualCostUpper, "cost_tran");
	showHideColumns(controller, controller.actualCostLower, "cost_tran");
}

/**
 * Shows/hides grid columns
 * depending on VAT display and currency
 * @param controller tabs container-view controller
 * @param grid Grid object
 * @param tableName
 * @returns
 */
function showHideColumns(controller, grid, tableName){
	// budget fields
	grid.showColumn(tableName + ".amount_expense_base_budget", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "base"));
	grid.showColumn(tableName + ".amount_income_base_budget", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "base"));
	grid.showColumn(tableName + ".amount_expense_vat_budget", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "vat"));
	grid.showColumn(tableName + ".amount_income_vat_budget", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "vat"));
	grid.showColumn(tableName + ".amount_expense", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "total"));
	grid.showColumn(tableName + ".amount_income", (controller.displayCurrency.type == "budget" && controller.displayVAT.type == "total"));

	// payment fields
	grid.showColumn(tableName + ".amount_expense_base_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "base"));
	grid.showColumn(tableName + ".amount_income_base_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "base"));
	grid.showColumn(tableName + ".amount_expense_vat_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "vat"));
	grid.showColumn(tableName + ".amount_income_vat_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "vat"));
	grid.showColumn(tableName + ".amount_expense_total_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "total"));
	grid.showColumn(tableName + ".amount_income_total_payment", ((controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom") && controller.displayVAT.type == "total"));
	

	grid.update();
}

/**
 * Change titles for amount_expense and amount_income fields
 * depending on MC&VAT enabled or not
 * 
 * @param controller the view controller
 * @param grid the fields' grid
 * @param tableName the table of the field
 * @param isTotalGrid true for Upper grids (totals grids)
 */
function setColumnTitles(controller, grid, tableName, isTotalGrid){
	if(controller.displayCurrency.type == "budget" && controller.displayVAT.type == "total"){
		var message = "";
		if(isTotalGrid){
			message = getMessage("total") + " ";
		}
		grid.setFieldLabel(tableName + ".amount_expense",  message + getMessage("expenseColumnTitle"));
		grid.setFieldLabel(tableName + ".amount_income", message + getMessage("incomeColumnTitle"));
	}
}

/**
 * Returns the exchange rate dataSource parameter
 * "1.0"
 * or
 * i.e. "${sql.exchangeRateFromFieldForDate('cost.payment_currency', 'USD', 'Payment', 'cost.payment_date')}"
 * @param controller tabs container-view controller
 * @param tableName
 * @param dateFieldName
 * @returns {String}
 */
function getExchangeRateParameter(controller, tableName, dateFieldName){
	var exchangeRate = "1.0";
	
	if(controller.isMcAndVatEnabled && (controller.displayCurrency.type == "user" || controller.displayCurrency.type == "custom")){
		if(tableName == "cost_tran_recur"){
			exchangeRate = "${sql.exchangeRateFromField(" +
			"'" + tableName + ".currency_payment'," +
			" '" + controller.displayCurrency.code + "'," +
			" '" + controller.displayCurrency.exchangeRateType +  "')}";
		}else{
			exchangeRate = "${sql.exchangeRateFromFieldForDate(" +
							"'" + tableName + ".currency_payment'," +
							" '" + controller.displayCurrency.code + "'," +
							" '" + controller.displayCurrency.exchangeRateType + "'," +
							" '" + tableName + "." + dateFieldName + "')}";
		}
	}
	
	return exchangeRate;
}

/**
 * Adds VAT & MC parameters to recurring, scheduled and actual costs grids
 * @param controller tabs container-view controller
 */
function addVATAndMCGridsParameters(controller){
	controller.recurringCostGrid.addParameter('exchangeRate', getExchangeRateParameter(controller, "cost_tran_recur", "date_end"));
	controller.recurringCostGrid.addParameter('currencyCode', controller.displayCurrency.code);

	controller.scheduledCostUpper.addParameter('exchangeRate', getExchangeRateParameter(controller, "cost_tran_sched", "date_due"));
	controller.scheduledCostUpper.addParameter('currencyCode', controller.displayCurrency.code);
	controller.scheduledCostLower.addParameter('exchangeRate', getExchangeRateParameter(controller, "cost_tran_sched", "date_due"));
	controller.scheduledCostLower.addParameter('currencyCode', controller.displayCurrency.code);
	
	controller.actualCostUpper.addParameter('exchangeRate', getExchangeRateParameter(controller, "cost_tran", "date_due"));
	controller.actualCostUpper.addParameter('currencyCode', controller.displayCurrency.code);
	controller.actualCostLower.addParameter('exchangeRate', getExchangeRateParameter(controller, "cost_tran", "date_due"));
	controller.actualCostLower.addParameter('currencyCode', controller.displayCurrency.code);
}


/**
 * Get cost type label.
 * 
 * @param costType
 * @param isMcAndVatEnabled
 * @returns {String}
 */
function getCostTypeMessage(costType, isMcAndVatEnabled){
	if(isMcAndVatEnabled){
		return " - " + getMessage("titleCostType_"+ costType);
	}else{
		return "";
	}
}


/**
 * Set selected currency to datasource field definition.
 */
function setCurrencyCodeForFields(panel, currencyCode){
	var dataSource = panel.getDataSource();
	dataSource.fieldDefs.each(function(fieldDef){
		if(valueExists(fieldDef.currency)){
			fieldDef.currency = currencyCode;
		}
	});
}

/**
 * Reset multicurrency and vat variables to default.
 * 
 * @param controller
 * @param panel
 */
function resetMcAndVatVariables(controller, panel, customDefaults){
	if(controller && (!valueExists(controller.displayVAT.isHidden) || (valueExists(controller.displayVAT.isHidden) && !controller.displayVAT.isHidden))){
		if(valueExists(customDefaults) && valueExists(customDefaults.displayVAT)){
			controller.displayVAT.type = customDefaults.displayVAT.type;
		}else{
		controller.displayVAT.type = "total";
	}
	}
	
	if(controller && valueExists(controller.displayCurrency)){
		if(valueExists(customDefaults) && valueExists(customDefaults.displayCurrency)){
			controller.displayCurrency.type = customDefaults.displayCurrency.type;
			controller.displayCurrency.code = customDefaults.displayCurrency.code;
			controller.displayCurrency.exchangeRateType = customDefaults.displayCurrency.exchangeRateType;
		}else{
		controller.displayCurrency.type = 'budget';
		controller.displayCurrency.code = View.project.budgetCurrency.code;
		controller.displayCurrency.exchangeRateType = 'Budget';
	}
	}

	if(panel && (!valueExists(panel.displayVAT.isHidden) || (valueExists(panel.displayVAT.isHidden) && !panel.displayVAT.isHidden))){
		if(valueExists(customDefaults) && valueExists(customDefaults.displayVAT)){
			panel.displayVAT.type = customDefaults.displayVAT.type;
		}else{
		panel.displayVAT.type = "total";
	}
	}
	
	if(panel && valueExists(panel.displayCurrency)){
		if(valueExists(customDefaults) && valueExists(customDefaults.displayCurrency)){
			panel.displayCurrency.type = customDefaults.displayCurrency.type;
			panel.displayCurrency.code = customDefaults.displayCurrency.code;
			panel.displayCurrency.exchangeRateType = customDefaults.displayCurrency.exchangeRateType;
		}else{
		panel.displayCurrency.type = 'budget';
		panel.displayCurrency.code = View.project.budgetCurrency.code;
		panel.displayCurrency.exchangeRateType = 'Budget';
	}
}
}

/**
 * Set panel parameter based on user settings.
 * @param panel
 * @param tableName
 * @param isMcAndVatEnabled
 * @param displayCurrency
 */
function setPanelParameters(grid, tableName, isMcAndVatEnabled, displayCurrency){
	var exchangeRate = 1;
	var exchangeRateForVatAmount = 1;
	var currencyCode = "";
	var exchangeRateType = "";
	if(isMcAndVatEnabled && (displayCurrency.type == "user" || displayCurrency.type == "custom")){
		currencyCode = displayCurrency.code;
		exchangeRateType = displayCurrency.exchangeRateType;
		exchangeRate = "${sql.exchangeRateFromField('"+ tableName +".currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
		exchangeRateForVatAmount = "${sql.exchangeRateFromField('"+ tableName +".currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
	}
	if(isMcAndVatEnabled && displayCurrency.type == 'budget'){
		exchangeRateType = displayCurrency.exchangeRateType;
		currencyCode = displayCurrency.code;
		exchangeRateForVatAmount = "${sql.exchangeRateFromField('"+ tableName +".currency_payment', '" + currencyCode + "', '" + exchangeRateType + "')}";
	}
	grid.addParameter("exchangeRate", exchangeRate);
	grid.addParameter("exchangeRateForVatAmount", exchangeRateForVatAmount);
	grid.addParameter("currencyCode", currencyCode);
}

/**
 * Set panel display based on user selection;
 * @param panel
 * @param tableName
 * @param isMcAndVatEnabled
 * @param displayCurrency
 */
function setPanelDisplay(grid, tableName, isMcAndVatEnabled, displayCurrency){
	var currencyType = displayCurrency.type;
	var dataSource =  grid.getDataSource();
	// budget fields
	grid.showColumn(tableName + ".amount_expense_base_budget", (isMcAndVatEnabled && currencyType == "budget"));
	grid.showColumn(tableName + ".amount_income_base_budget", (isMcAndVatEnabled && currencyType == "budget"));
	grid.showColumn(tableName + ".amount_expense_vat_budget", (isMcAndVatEnabled && currencyType == "budget"));
	grid.showColumn(tableName + ".amount_income_vat_budget", (isMcAndVatEnabled && currencyType == "budget"));
	grid.showColumn(tableName + ".amount_expense", (!isMcAndVatEnabled || (isMcAndVatEnabled && currencyType == "budget")));
	grid.showColumn(tableName + ".amount_income", (!isMcAndVatEnabled || (isMcAndVatEnabled && currencyType == "budget")));
	if(dataSource.fieldDefs.containsKey(tableName + ".vat_percent_value_budget")){
		grid.showColumn(tableName + ".vat_percent_value_budget", (isMcAndVatEnabled && currencyType == "budget"));
	}
	
	// payment fields
	grid.showColumn(tableName + ".amount_expense_base_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	grid.showColumn(tableName + ".amount_income_base_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	grid.showColumn(tableName + ".amount_expense_vat_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	grid.showColumn(tableName + ".amount_income_vat_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	grid.showColumn(tableName + ".amount_expense_total_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	grid.showColumn(tableName + ".amount_income_total_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	if(dataSource.fieldDefs.containsKey(tableName + ".vat_percent_value_payment")){
		grid.showColumn(tableName + ".vat_percent_value_payment", (isMcAndVatEnabled && (currencyType == "user" || currencyType == "custom")));
	}
	
	grid.update();
}

/**
 * Get restriction for Show Costs Associated with radio buttons from console
 * @param console
 * @param costAsocWith associated field full name
 * @param projectionTypeRadioValue Show Costs Associated with radio button value
 * @returns restriction
 */
function getRestrictionCostAsocWith(console, costAsocWith, projectionTypeRadioValue){
	var ctry_id = getConsoleFieldValue(console, 'bl.ctry_id');
    var regn_id = getConsoleFieldValue(console, 'bl.regn_id');
    var state_id = getConsoleFieldValue(console, 'bl.state_id');
    var city_id = getConsoleFieldValue(console, 'bl.city_id');
    var site_id = getConsoleFieldValue(console, 'bl.site_id');
    var pr_id = getConsoleFieldValue(console, 'property.pr_id');
    var bl_id = getConsoleFieldValue(console, 'bl.bl_id');
    
    var blGeoRestriction="";
    var prGeoRestriction="";
    var bl_ls_JOIN="";
    var pr_ls_JOIN="";
    var restriction="";
    
	if (valueExistsNotEmpty(pr_id) || valueExistsNotEmpty(bl_id) || valueExistsNotEmpty(ctry_id)
			|| valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id) || valueExistsNotEmpty(city_id)
			|| valueExistsNotEmpty(site_id) || costAsocWith != ' cost_tran_recur.ac_id' ) {

		switch (costAsocWith)
			{
				case ' cost_tran_recur.ls_id': 
						bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id ";
						pr_ls_JOIN=" SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id ";
						if (valueExistsNotEmpty(bl_id)) {
							blGeoRestriction = " AND bl.bl_id in " + toSQLRestrString(bl_id);
						}  
						if (valueExistsNotEmpty(pr_id)) {
							prGeoRestriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
							blGeoRestriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
							}
						if (valueExistsNotEmpty(ctry_id)) {
							blGeoRestriction += " AND bl.ctry_id in " + toSQLRestrString(ctry_id);
							prGeoRestriction += " AND property.ctry_id in " + toSQLRestrString(ctry_id);
						}
						if (valueExistsNotEmpty(regn_id)) {
							blGeoRestriction += " AND bl.regn_id in " + toSQLRestrString(regn_id);
							prGeoRestriction += " AND property.regn_id in " + toSQLRestrString(regn_id);
						}
						if (valueExistsNotEmpty(state_id)) {
							blGeoRestriction += " AND bl.state_id in " + toSQLRestrString(state_id);
							prGeoRestriction += " AND property.state_id in " + toSQLRestrString(state_id);
						}
						if (valueExistsNotEmpty(city_id)) {
							blGeoRestriction += " AND bl.city_id in " + toSQLRestrString(city_id);
							prGeoRestriction += " AND property.city_id in " + toSQLRestrString(city_id);
						}
						if (valueExistsNotEmpty(site_id)) {
							blGeoRestriction += " AND bl.site_id in " + toSQLRestrString(site_id);
							prGeoRestriction += " AND property.site_id in " + toSQLRestrString(site_id);
						}
						restriction += " AND cost_tran_recur.ls_id IN ";
						if(projectionTypeRadioValue == 'lsBl'){
							restriction += bl_ls_JOIN + blGeoRestriction;	
						}else if(projectionTypeRadioValue == 'lsProp'){
							restriction += "( " + pr_ls_JOIN + prGeoRestriction;
						}else{
							restriction += bl_ls_JOIN + blGeoRestriction +" UNION "+ pr_ls_JOIN + prGeoRestriction;
						}
	   					restriction += ") ";
						break;
				case ' cost_tran_recur.bl_id': 
						restriction += " AND EXISTS(SELECT * FROM bl WHERE bl.bl_id=cost_tran_recur.bl_id ";
						if (valueExistsNotEmpty(ctry_id)) {
							restriction += "AND bl.ctry_id in " + toSQLRestrString(ctry_id);
						}
						if (valueExistsNotEmpty(regn_id)) {
							restriction += "AND bl.regn_id in " + toSQLRestrString(regn_id);
						}
						if (valueExistsNotEmpty(state_id)) {
						restriction += "AND bl.state_id in " + toSQLRestrString(state_id);
						}
						if (valueExistsNotEmpty(city_id)) {
						restriction += "AND bl.city_id in " + toSQLRestrString(city_id);
						}
						if (valueExistsNotEmpty(site_id)) {
						restriction += "AND bl.site_id in " + toSQLRestrString(site_id);
						}
	   					if (valueExistsNotEmpty(bl_id)) {
							restriction += " AND bl.bl_id in " + toSQLRestrString(bl_id);
						}
						if (valueExistsNotEmpty(pr_id)) {
						restriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
						}
						restriction += ") ";
						break;
				case ' cost_tran_recur.pr_id': 
						restriction += " AND EXISTS(SELECT * FROM property WHERE property.pr_id=cost_tran_recur.pr_id ";
						if (valueExistsNotEmpty(ctry_id)) {
							restriction += "AND property.ctry_id in " + toSQLRestrString(ctry_id);
						}
						if (valueExistsNotEmpty(regn_id)) {
							restriction += "AND property.regn_id in " + toSQLRestrString(regn_id);
						}
						if (valueExistsNotEmpty(state_id)) {
						restriction += "AND property.state_id in " + toSQLRestrString(state_id);
						}
						if (valueExistsNotEmpty(city_id)) {
						restriction += "AND property.city_id in " + toSQLRestrString(city_id);
						}
						if (valueExistsNotEmpty(site_id)) {
						restriction += "AND property.site_id in " + toSQLRestrString(site_id);
						}
				    	if (valueExistsNotEmpty(pr_id)) {
						restriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
						}
						restriction += ") ";
						break;
			}

	}
	return restriction;
}

/**
 * Hide cost fields depending if VAT & MC is enabled or not and depending on the currency type("budget", "payment", "custom", "").
 * @param fieldDefs
 * @param tableName
 * @param isMcAndVatEnabled
 * @param currencyType
 * @returns {Array} visibleFieldDefs
 */
function hideFieldBeforeExport(fieldDefs, tableName, isMcAndVatEnabled, currencyType){
	var visibleFieldDefs = [];
	for (var i = 0; i < fieldDefs.length; i++) {
		var fieldId = fieldDefs[i].id;
		
		//budget fields
		if(fieldId == tableName + ".amount_expense_base_budget" || 
				fieldId == tableName + ".amount_income_base_budget" ||
				fieldId == tableName + ".amount_expense_vat_budget" ||
				fieldId == tableName + ".amount_income_vat_budget"){
			if(!isMcAndVatEnabled || currencyType != "budget"){
				fieldDefs[i].hidden = "true";
			}
			continue;
		}
		if(fieldId == tableName + ".amount_expense" || fieldId == tableName + ".amount_income"){
			if(isMcAndVatEnabled && currencyType != "budget"){
				fieldDefs[i].hidden = "true";
			}
			continue;
		}
		
		//payment fields
		if(fieldId == tableName + ".amount_expense_base_payment" ||
				fieldId == tableName + ".amount_income_base_payment" ||
				fieldId == tableName + ".amount_expense_vat_payment" ||
				fieldId == tableName + ".amount_income_vat_payment" ||
				fieldId == tableName + ".amount_expense_total_payment" ||
				fieldId == tableName + ".amount_income_total_payment"){
			if(!isMcAndVatEnabled || (currencyType == "budget")){
				fieldDefs[i].hidden = "true";
			}
			continue;
		}
	}
	
	for(var i = 0; i < fieldDefs.length; i++){
		if(fieldDefs[i].hidden == "false"){
			visibleFieldDefs.push(fieldDefs[i]);
		}
	}
	return visibleFieldDefs;
}


function getQuarters(startDate, endDate){
	var result  = new Ext.util.MixedCollection();
	var regexMonth = /\d{2}/g;
	var startMonth = startDate.match(regexMonth)[2];
	var counter = parseInt(startMonth);
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 3; j++){
			result.add(counter, {quarter: i+1});
			counter = (counter + 1 == 13 ? 1: counter + 1);
		}
	}
	return result;
}