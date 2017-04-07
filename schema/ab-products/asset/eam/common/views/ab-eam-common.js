/**
 * Returns valid values for SQL
 * @param value object
 * @returns object
 */
function makeSafeSqlValue(value)
{
	if (isArray(value)) {
		// if is an array we need to format all values
		for(var i=0; i < value.length; i++){
			value[i] = makeSafeSqlString(value[i]);
		}
	} else {
		value = makeSafeSqlString(value);
	}
	
	return value;
}

function isArray(value){
	return ('isArray' in Array) ? 
	        Array.isArray(value) : 
	                Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * Make safe string for sql.
 * @param value string
 * @returns string
 */
function makeSafeSqlString(value){
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}

/**
 * Returns formatted filter value for sql restriction
 * @param operator operator 
 * @param value value
 */
function getSqlClauseValue(operator, value){
	var sqlValue = "";
	if(operator == 'IN'){
		sqlValue = operator +" ('" + makeSafeSqlValue(value).join("', '")  +  "') ";
	}else{
		sqlValue = operator + " '" + makeSafeSqlValue(value) + (operator == 'LIKE'?"%":"") +"'";
	}
	return sqlValue;
}

/**
 * Convert sql restriction to sql statement. RelOp = 'AND'
 * 
 * TODO:  Add support for relOp.
 * 
 * @param restriction Ab.view.Restriction object
 * @returns {String} sql statement
 */
function restrictionToSql(restriction){
	var sqlClauses = [];
	if(restriction.clauses.length > 0){
		for(var i=0; i< restriction.clauses.length; i++){
			var clause = restriction.clauses[i];
			var sqlClauseStatement = "(" + clause.name + " " +  getSqlClauseValue(clause.op, clause.value) + ")";
			sqlClauses.push(sqlClauseStatement);
		}
	}
	var sqlRestriction = "1=1";
	if(sqlClauses.length > 0){
		sqlRestriction = sqlClauses.join(' AND ');
	}
	return sqlRestriction;
}

/**
 * Returns project record. Data source is defined in ab-eam-common-ds-and-panels.axvw
 * @param projectId
 */
function getProjectRecord(projectId){
	var dsProject = View.dataSources.get('abProject_ds');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', projectId, '=');
	return dsProject.getRecord(restriction);
}

/**
 * Set project name to project code when project name not exists
 * @param projectRecord
 */
function saveProjectNameAsCode(projectRecord) {
	if (!projectRecord.isNew) {
		var projectName = projectRecord.getValue('project.project_name');
		if (!valueExistsNotEmpty(projectName)) {
			projectRecord.setValue('project.project_name',projectRecord.getValue('project.project_id'));
			var dsProject = View.dataSources.get('abProject_ds');
			dsProject.saveRecord(projectRecord);
		}
	}
}

/**
 * Returns space budget. Data source is defined in ab-eam-common-ds-and-panels.axvw
 * @param sbName
 */
function getSpaceBudgetRecord(sbName){
	var dsSpaceBudget = View.dataSources.get('abSb_ds');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('sb.sb_name', sbName, '=');
	return dsSpaceBudget.getRecord(restriction);
}

/**
 * Clone object.
 * @param {Object} object
 */
function cloneObject(object){
	var tmp = (object instanceof Array) ? [] : {};
	for(prop in object){
		//if(prop == 'clone') continue;
		if (object[prop] && typeof object[prop] == "object") {
			tmp[prop] = cloneObject(object[prop]);
		}
		else {
			tmp[prop] = object[prop];
		} 
	}
	return tmp;
}

/**
 * Get all activity_log buildings for restriction
 * (activity_log.bl_id )
 * @param restriction
 * @returns {Array}
 */
function getActivityLogBuildings(restriction){
	var params = {
			tableName: 'activity_log',
			isDistinct: 'true',
			fieldNames: toJSON(['activity_log.bl_id']),
			restriction: toJSON(restriction)
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			var blIds = [];
			for (var i=0; i < result.dataSet.records.length; i++){
				var blId = result.dataSet.records[i].getValue('activity_log.bl_id');
				if(valueExistsNotEmpty(blId)){
					blIds.push(blId);
				}
			}
			return blIds;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get all sb_items buildings
 * @param restriction 
 * @returns {Array}
 */
function getSbItemsBuildings(restriction){
	var params = {
			tableName: 'sb_items',
			isDistinct: 'true',
			fieldNames: toJSON(['sb_items.bl_id']),
			restriction: toJSON(restriction)
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			var blIds = [];
			for (var i=0; i < result.dataSet.records.length; i++){
				var blId = result.dataSet.records[i].getValue('sb_items.bl_id');
				if(valueExistsNotEmpty(blId)){
					blIds.push(blId);
				}
			}
			return blIds;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get all group buildings.
 * @param restriction restriction
 * @returns {Array}
 */
function getGroupBuildings(restriction){
	var params = {
			tableName: 'gp',
			isDistinct: 'true',
			fieldNames: toJSON(['gp.bl_id']),
			restriction: toJSON(restriction)
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			var blIds = [];
			for (var i=0; i < result.dataSet.records.length; i++){
				var blId = result.dataSet.records[i].getValue('gp.bl_id');
				if(valueExistsNotEmpty(blId)){
					blIds.push(blId);
				}
			}
			return blIds;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * get list with project names for selected project id's.
 * 
 * @param projectIds project id's
 * @returns {Array}
 */
function getProjectNames(projectIds){
	var dsProject = View.dataSources.get('abProject_ds');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', projectIds, 'IN');
	var records = dsProject.getRecords(restriction);
	var projectNames = [];
	for (var i =0; i < records.length; i++){
		var record = records[i];
		var projectName = record.getValue('project.project_name');
		if(valueExists(projectName)){
			projectNames.push(projectName);
		}
	}
	return projectNames;
}

/**
 * Returns list with portfolio scenario id for selected projects.
 * @param projectNames project names
 * @returns {Array}
 */
function getPortfolioScenarioIds(projectNames){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('portfolio_scenario.scn_name', projectNames, 'IN');
	
	var params = {
			tableName: 'portfolio_scenario',
			fieldNames: toJSON(['portfolio_scenario.portfolio_scenario_id', 'portfolio_scenario.scn_name']),
			restriction: toJSON(restriction)
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			var portfolioScenarioIds = [];
			for (var i=0; i < result.dataSet.records.length; i++){
				var scenarioId = result.dataSet.records[i].getValue('portfolio_scenario.portfolio_scenario_id');
				if(valueExistsNotEmpty(scenarioId)){
					portfolioScenarioIds.push(scenarioId);
				}
			}
			return portfolioScenarioIds;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get selected radio button value.
 * @param radioButtonName radio button name.
 * @return string
 */
function getSelectedRadioButtonValue(radioButtonName){
	var objRadioButton = document.getElementsByName(radioButtonName);
	var selectedValue = null;
	if(objRadioButton){
		for(var i = 0; i < objRadioButton.length ; i++){
			if(objRadioButton[i].checked){
				selectedValue = objRadioButton[i].value;
				break;
			}
		}
	}
	return selectedValue;
}

/**
 * Set selected value for radio button
 * @param radioButtonName radio button name
 * @param selectedValue selected value (when is empty all values are reseted)
 */
function setRadioButtonValue(radioButtonName, selectedValue){
	var objRadioButton = document.getElementsByName(radioButtonName);
	if(objRadioButton){
		for(var i = 0; i < objRadioButton.length ; i++){
			objRadioButton[i].checked = (objRadioButton[i].value == selectedValue);
		}
	}
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
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}

