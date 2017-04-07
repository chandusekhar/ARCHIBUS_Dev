/**
 * Check if specified view is displayed in dashboard.
 * @param view view object
 * @returns {Boolean}
 */
function isInDashboard(view){
	var result = false;
	if (valueExists(view.parameters) && valueExists(view.parameters["isDialogWindow"]) && view.parameters["isDialogWindow"]) {
		result = false;
	} 
	else if(view.type === 'dashboard' || (typeof(view.getOpenerView) == 'function' && typeof(view.getOpenerView()) == 'object' && view.getOpenerView().type == 'dashboard')) {
		result = true;
	}
	
	return result;
}

/**
 * Overwrite has title to hide title when is in dashboard
 * @returns
 */
Ab.view.View.hasTitle = function() {
	if (isInDashboard(this)) {
		return false;
	} else {
		return valueExistsNotEmpty(this.title);
	}
}


/*
 * Overwrite/add some methods of/to report grid
 */
/*
 * Clone object function
 */
function Clone() { };
function clone(obj) {
    if (valueExists(obj)) {
        Clone.prototype = obj;
        return new Clone();
    } else {
    	return obj;
    }
};

/*
 * Overwrite getVisibleFieldDefs that is called by XLS and DOCX export command
 * Original function change fieldDef definition.
 */
Ab.grid.ReportGrid.prototype.getVisibleFieldDefs = function(){
	var ctx = this.createEvaluationContext();
	var fieldDefs = this.fieldDefs;  
	if(fieldDefs && fieldDefs.length == 0){
		this.getDataSource().fieldDefs.each(function (fieldDef) {
    		fieldDefs.push(fieldDef);
    	});
	}

	var visibleFieldDefs = [];
	for (var i = 0, column; column = this.columns[i]; i++) {
		 // return clone of fieldDef object
	     var field = clone(this.getFieldDefById(fieldDefs, column.fullName, i));
	     if(valueExists(field)){
	    	 if(field.controlType === '' || field.controlType === 'link'){
	    		 //XXX: evulate field.title and field.hidden proprties
	    		 field.title = Ab.view.View.evaluateString(field.title, ctx, false);
	    		 //field.hidden = Ab.view.View.evaluateString(field.hidden, ctx, false);
	    		 // evaluate field and column hidden parameter
	    		 field.hidden = (Ab.view.View.evaluateBoolean(field.hidden, ctx, false) || column.hidden);
	    		 visibleFieldDefs.push(field);
	    	 }
	     }
	}
	var listener = this.getEventListener('beforeExportReport');
    if (listener) {
    	visibleFieldDefs = listener(this, visibleFieldDefs);
    }
	return visibleFieldDefs;
}
/*
 * Set field title and label
 */

Ab.grid.ReportGrid.prototype.setFieldTitle = function (fieldName, fieldTitle) {
	var ctx = this.createEvaluationContext();
	var fieldDefs = this.fieldDefs;  
	if(fieldDefs && fieldDefs.length == 0){
		this.getDataSource().fieldDefs.each(function (fieldDef) {
    		fieldDefs.push(fieldDef);
    	});
	}
	
	for (var i = 0, column; column = this.columns[i]; i++) {
		if (column.fullName == fieldName){
			var field = this.getFieldDefById(fieldDefs, column.fullName, i);
			if(valueExists(field)){
				var evaluatedTitle = Ab.view.View.evaluateString(fieldTitle, ctx, false);
				field.title = evaluatedTitle;
				column.name = evaluatedTitle;
				this.setFieldLabel(fieldName, evaluatedTitle);
			}
		}
	}
}

/**
 * Open filter dialog window.
 * @param controller current controller
 */
function onOpenFilter(controller){
	var crtFilterObject = controller.crtFilter;
    View.openDialog('ab-repm-kpi-filter.axvw', null, true, {
        width: 800,
        height: 600,
        closeButton: true,
        currentFilter: crtFilterObject,
		callback: function(filter){
			controller.onApplyFilter(filter);
		}
    });
}

/**
 * Copy settings from source to destination.
 * 
 * @param source Ext.util.MixedCollection
 * @param destination Ext.util.MixedCollection
 */
function copySettings(source, destination) {
	source.each(function(srcField){
		var destField = destination.get(srcField.id);
		if (destField) {
			destField.columnName = srcField.columnName;
			destField.visible = srcField.visible;
			destField.disabled = srcField.disabled;
			destField.defaultValue = srcField.defaultValue;
			destField.value = srcField.value;
			//destField.labelId = srcField.labelId;
			if (valueExists(srcField.values)){
				destField.values = srcField.values;
			}
		}
	});
}

/**
 * Get time span interval.
 * 
 * @param dateRef reference date
 * @param interval interval to add
 * @param value period to add
 * @param format result format
 */
function getTimeSpanInterval(dateRef, interval, value, format){
	var number = parseInt(value.replace("past", "-").replace("next", "+"));
	var dateFrom = null;
	var dateTo = null;
	if(number > 0) {
		dateFrom = getCustomDate(dateRef, interval, 0, format);
		dateTo = getCustomDate(dateRef, interval, number, format);
	}else{
		dateFrom = getCustomDate(dateRef, interval, number, format);
		dateTo = getCustomDate(dateRef, interval, 0, format);
	}
	return ({'dateFrom': dateFrom, 'dateTo': dateTo});
}


/**
 * Return a date in specified format. Result is calculated adding 
 * specified interval value to reference date.
 * 
 * @param {Object} date - reference date, Date object
 * @param {Object} interval - interval to add; 'day', 'month', 'year'
 * @param {Object} value - number 
 * @param {Object} format - specify result format. Valid values 'day'(year-month-day), 'month' (year-month), 'year'
*/
function getCustomDate(reference, interval, value, format){
	var calcDate = reference;
	switch(interval){
		case 'day': { calcDate = reference.add(Date.DAY, value); break; }
		case 'month': {calcDate = reference.add(Date.MONTH, value); break;}
		case 'year': {calcDate = reference.add(Date.YEAR, value); break;}
	}
	var result = calcDate.getFullYear();
	if(format == 'month' || format == 'day'){
		result += '-'+((calcDate.getMonth()+1 < 10)?'0':'')+ (calcDate.getMonth()+1);
	}
	if(format == 'day'){
		result += '-'+((calcDate.getDate()<10)?'0':'') + calcDate.getDate();
	}
	return(result);
}

/**
 * GEt restriction from filter object.
 * @param filterObj filter object
 * @param type restriction type "string", "object"
 */
function getRestrictionFromObject(filterObj, type, tableName){
	var result = null;
	if(type == "string"){
		result = getSQLString(filterObj, tableName);
	} else {
		//result = getRestriction(filterObj);
	}
	return result;
}

function getSQLString(filterObj, tableName){
	var result = "1 = 1";
	//add not null restriction for group by field
	if (filterObj.get('group_by').visible) {
		result = getGroupByRestriction(filterObj.get('group_by').value, tableName);
	}
	filterObj.each(function(fieldObj){
		var fieldValue = null;
		if(!fieldObj.custom){
			if (fieldObj.visible && !fieldObj.disabled) {
				fieldValue = fieldObj.value;
			}else{
				fieldValue = fieldObj.defaultValue;
			}
		}
		
		if (valueExistsNotEmpty(fieldValue)) {
			if (isArray(fieldValue)) {
				result += " AND " + fieldObj.columnName + " IN (${sql.literal('" + fieldValue.join("')}, ${sql.literal('") + "')})";
			} else{
				result += " AND " + fieldObj.columnName + " = ${sql.literal('" + fieldValue + "')}";
			}
		}
	});
	return result;
}

function getGroupByRestriction(groupBy, tableName){
	var result = null;
	switch (groupBy) {
		case 'ctry':
			{
				result = tableName + ".ctry_id IS NOT NULL";
				break;
			}
		case 'regn':
			{
				result = tableName + ".ctry_id  IS NOT NULL AND " + tableName + ".regn_id IS NOT NULL";
				break;
			}
		case 'state':
			{
				result = tableName + ".state_id IS NOT NULL";
				break;
			}
		case 'city':
			{
				result = tableName + ".state_id IS NOT NULL AND " + tableName + ".city_id IS NOT NULL";
				break;
			}
		case 'site':
			{
				result = tableName + ".site_id IS NOT NULL";
				break;
			}
		case 'property':
			{
				result = tableName + ".pr_id IS NOT NULL";
				break;
			}
		case 'bl':
			{
				result = tableName + ".bl_id IS NOT NULL";
				break;
			}
		case 'facility_type':
			{
				result = tableName + ".facility_type_id IS NOT NULL";
				break;
			}
	}
	return result;
}

function isArray(object){
	if(object instanceof Array){
		return true;
	}
	
	if(typeof object !== 'object'){
		return false;
	}
	
	if(getObjectType(object) === "array"){
		return true;
	}
}

function getObjectType(obj){
	if (obj === null || typeof obj === 'undefined') {
        return String (obj);
    }
    return Object.prototype.toString.call(obj)
        .replace(/\[object ([a-zA-Z]+)\]/, '$1').toLowerCase();
}

/**
 * Get group by field.
 * @param groupBy current group by value
 * @param tableName table name
 */
function getGroupByField(groupBy, tableName){
	var result = null;
	switch (groupBy) {
		case 'ctry':
			{
				result = tableName + ".ctry_id";
				break;
			}
		case 'regn':
			{
				result = tableName + ".ctry_id ${sql.concat}'-'${sql.concat}" + tableName + ".regn_id";
				break;
			}
		case 'state':
			{
				result = tableName + ".state_id";
				break;
			}
		case 'city':
			{
				result = tableName + ".state_id ${sql.concat}'-'${sql.concat}" + tableName + ".city_id";
				break;
			}
		case 'site':
			{
				result = tableName + ".site_id";
				break;
			}
		case 'property':
			{
				result = tableName + ".pr_id";
				break;
			}
		case 'bl':
			{
				result = tableName + ".bl_id";
				break;
			}
		case 'facility_type':
			{
				result = tableName + ".facility_type_id";
				break;
			}
	}
	return result;
}

/**
 * Get next level for group by 
 * @param groupBy current group by level
 * @param groupByValues array with group by values
 * @returns next group by level
 */
function getNextGroupByForDrillDown(groupBy, groupByValues){
	var nextLevel = null;
	var index = groupByValues.indexOf(groupBy);
	if (index < groupByValues.length - 1 && groupByValues[index + 1] != 'facility_type') {
		nextLevel = groupByValues[index + 1];
	}
	return nextLevel;
}

function getGroupByFieldTitle(groupBy){
	var result = null;
	switch (groupBy) {
		case 'regn':
			{
				result = getMessage("opt_ctry") +' - ' +getMessage("opt_regn");
				break;
			}
		case 'city':
			{
				result = getMessage("opt_state") +' - ' +getMessage("opt_city");
				break;
			}
		default:
			{
				result = getMessage("opt_" + groupBy);
				break;
			}
			
	}
	return result;
}

/**
 * General drill down event handler
 * Call specific drill down event handler from chart controller.
 * @param ctx context
 * 
 */
function onDrillDown(ctx){
	var selectedChartData = ctx.selectedChartData;
	var controllerId = ctx.command.getParentPanel().controllerId;
	var objController =  View.controllers.get(controllerId);
	objController.onDrillDown(selectedChartData);
}


/**
 * Get Selected chart data on drilldown
 * @param groupBy
 * @param tableName
 * @param selectedValue
 */
function getSelectedChartData(groupBy, tableName, selectedValue){
	var fields = [];
	var values = [];
	var field = null;
	if (groupBy == 'regn' || groupBy == 'city') {
		field = getGroupByField(groupBy, groupBy);
		var sqlRestriction = field + " = ${sql.literal('" + selectedValue + "')}";
		var dataSourceId = (groupBy == 'regn'?'abRepmKpiRegn_ds':'abRepmKpiCity_ds');
		var dsObject = View.dataSources.get(dataSourceId);
		var record = dsObject.getRecord(sqlRestriction);
		if (groupBy == 'regn') {
			if (valueExistsNotEmpty(record.getValue('regn.ctry_id'))){
				fields.push(tableName + '.ctry_id');
				values.push(record.getValue('regn.ctry_id'));
			}
			if (valueExistsNotEmpty(record.getValue('regn.regn_id'))){
				fields.push(tableName + '.regn_id');
				values.push(record.getValue('regn.regn_id'));
			}
		}else {
			if (valueExistsNotEmpty(record.getValue('city.state_id'))){
				fields.push(tableName + '.state_id');
				values.push(record.getValue('city.state_id'));
			}
			if (valueExistsNotEmpty(record.getValue('city.city_id'))){
				fields.push(tableName + '.city_id');
				values.push(record.getValue('city.city_id'));
			}
		}
	} else {
		field = getGroupByField(groupBy, tableName);
		fields.push(field);
		values.push(selectedValue);
	}
	return ({'fields' : fields, 'values': values});
}

/**
 * Get filter as text - display this as chart instructions
 * @param filter filter object
 */
function getFilterAsText(filter){
	var text = '';
	filter.each(function (field){
		if(field.id != 'group_by' && field.visible && valueExistsNotEmpty(field.value)){
			if(!(field.id == 'time_span' && field.value == 'all')){
				var label = getMessage(field.labelId);
				var value = ((field.id == 'ownership' || field.id == 'time_span')?getMessage(field.id + "_" + field.value):field.value);
				
				text += "<font color=\"red\">"+label+":</font> " + value +"; ";
			}
		}
	});
	
	return text;
}


/**
 * Get group by parameter value.
 * @param controllerObj controller object
 */
function getGroupByParameter(controllerObj){
	var result = null;
	if (valueExists(window.location.parameters) 
			&& valueExists(window.location.parameters["groupBy"])) {
		// when parameters come as URL query parameters
		result = window.location.parameters["groupBy"];
	} else if (valueExists(controllerObj.view.parameters) && valueExists(controllerObj.view.parameters["groupBy"])){
		// When is called from drill down event
		result = controllerObj.view.parameters["groupBy"];
	} else if (typeof(controllerObj.view.getOpenerView()) == 'object' &&
			controllerObj.view.getOpenerView().type == 'dashboard' && valueExists(controllerObj.view.getOpenerView().dashboardConfigObj)
			&& controllerObj.view.parameters) {
		var parentViewPanelId = controllerObj.view.parameters.viewPanelId;
		// when is opened from maximize button from dashboard
		result = controllerObj.view.getOpenerView().dashboardConfigObj.get(parentViewPanelId+'_'+controllerObj.id).groupBy;
	}
	
	return result;
}

/**
 * Read chart config object when is in dashboard.
 */
function getDashboardConfigObject(controller, chartId){
	var result  = null;
	// is in dashboard without frame.
	var parentViewPanelId = null;
	if (valueExists(controller.view.dashboardConfigObj)) {
		var chartPanel  = controller.view.panels.get(chartId);
		parentViewPanelId = 'panel_' + chartPanel.layoutRegion;
		result  = controller.view.dashboardConfigObj.get(parentViewPanelId+'_'+controller.id);
	} 
	else if (typeof(controller.view.getOpenerView()) == 'object' &&
		     valueExists(controller.view.getOpenerView().dashboardConfigObj)){
		// is in dashboard with frames
		parentViewPanelId = controller.view.getParentViewPanel().id;
		result  = controller.view.getOpenerView().dashboardConfigObj.get(parentViewPanelId+'_'+controller.id);
	}
	
	return result;
}
