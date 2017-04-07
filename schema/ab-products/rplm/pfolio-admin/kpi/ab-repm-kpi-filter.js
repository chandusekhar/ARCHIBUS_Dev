/*
 * Settings object for KPI filter
 */
var kpiFilterObject = new Ext.util.MixedCollection();
kpiFilterObject.addAll(
		{id: 'group_by', columnName:null, custom: true, visible: true, disabled: false, defaultValue: 'ctry', value: null, values: ['ctry', 'regn', 'state', 'city', 'site', 'bl'], labelId: null, optionLabel: null, restriction: null},
		{id: 'ownership', columnName:null, custom: true, visible: true, disabled: false, defaultValue: 'all', value: null, values: [], labelId: null, optionLabel: null, restriction: null},
		{id: 'time_span', columnName:null, custom: true, visible: true, disabled: false, defaultValue: 'past1', value: null, values: [], labelId: null, optionLabel: null, restriction: null},
		{id: 'bl.ctry_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null},
		{id: 'bl.regn_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null},
		{id: 'bl.state_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null},
		{id: 'bl.city_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null},
		{id: 'bl.site_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null},
		{id: 'bl.pr_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null, labelId: null}
	);

var testObject = new Ext.util.MixedCollection();
testObject.addAll(
		{id: 'group_by', columnName:null, custom: true, visible: true, disabled: false, defaultValue: 'ctry', value: null, values: ['ctry', 'regn', 'state', 'city', 'site', 'bl']},
		{id: 'ownership', columnName:null, custom: true, visible: true, disabled: false, defaultValue: 'all', value: null},
		{id: 'time_span', columnName:null, custom: true, visible: true, disabled: true, defaultValue: 'past1', value: null},
		{id: 'bl.ctry_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null},
		{id: 'bl.regn_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null},
		{id: 'bl.state_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null},
		{id: 'bl.city_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null},
		{id: 'bl.site_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null},
		{id: 'bl.pr_id', columnName:null, custom: false, visible: true, disabled: false, defaultValue: null, value: null}
	);


var abRepmKpiFilterController = View.createController('abRepmKpiFilterController', {
	
	//initialize default settings from kpi filter object
	runtimeSettings: kpiFilterObject.clone(),
	
	afterViewLoad: function(){
		// read runtime settings from current chart
		if (valueExists(View.parameters) && valueExists(View.parameters['currentFilter'])) {
			var currentFilter = View.parameters['currentFilter'];
			copySettings(currentFilter, this.runtimeSettings);
		}
		
		//copySettings(testObject, this.runtimeSettings);
		
	},
	
	afterInitialDataFetch: function(){
		var controller = this;
		this.runtimeSettings.each(function(field) {
			// if is group by field we must populate drop down list
			if (field.id == 'group_by' || field.id == 'ownership' || field.id == 'time_span' ) {
				populateDropDown(field.id, field.values, field.optionLabel);
			}

			// set field value
			if(valueExistsNotEmpty(field.value)){
				controller.setFieldValue(field.id, field.value, field.custom);
			} else {
				// set default value
				//controller.setFieldValue(field.id, field.defaultValue, field.custom);
			}

			// disable field
			if(field.disabled){
				if (field.custom){
					$(field.id).disabled = field.disabled;
				}else{
					controller.abRepmKpiFilter.enableField(field.id, !field.disabled);
				}
			}
			// show / hide field
			if (field.custom){
				controller.showCustomField(field.id, field.visible);
				//set custom field label
				if(field.filterLabel){
					controller.setCustomFieldLabel(field.id, field.filterLabel);
				}
			}else{
				controller.abRepmKpiFilter.showField(field.id, field.visible);
			}
		});
		this.abRepmKpiFilter.show(true, true);
	},
	
	abRepmKpiFilter_onFilter: function(){
		this.readFilter();
		if (valueExists(View.parameters.callback)) {
			// pass the new filter to opener view 
			View.parameters.callback(this.runtimeSettings);
			View.closeThisDialog();
		}
	},
	
	abRepmKpiFilter_onDefault: function(){
		var controller = this;
		this.runtimeSettings.each(function(field) {
			if (field.visible && !field.disabled) {
				controller.setFieldValue(field.id, field.defaultValue, field.custom);
			}
		});
	},
	
	/*
	 * read current filter settings
	 */
	readFilter: function(){
		var controller = this;
		this.runtimeSettings.each(function(field){
			if (field.visible && !field.disabled) {
				field.value = controller.getFieldValue(field.id, field.defaultValue, field.custom);
			}
		});
	},
	
	/*
	 * Set field value
	 */
	setFieldValue: function(id, value, custom){
		var console = this.abRepmKpiFilter;
		var strValue = '';
		if(isArray(value)){
			strValue = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
		}else if (valueExistsNotEmpty(value)){
			strValue = value;
		}
		
		if(custom){
			$(id).value = strValue;
		}else{
			console.setFieldValue(id, strValue);
		}
	},
	
	/*
	 * Get field value
	 */
	getFieldValue: function(id, value, custom){
		var value = null;
		var console = this.abRepmKpiFilter;
		if (custom) {
			value = $(id).value;
		}else {
			if (console.hasFieldMultipleValues(id)) {
				value = console.getFieldMultipleValues(id);
			}else{
				value = console.getFieldValue(id);
			}
		}
		return value;
	},
	
	/*
	 * Show /hide custom field and field label.
	 *  
	 */
	showCustomField: function(id, visible) {
		var custFieldEl = document.getElementById(id);
		var fieldTd = custFieldEl.parentNode;
		var labelTd = fieldTd.previousSibling;

		var styleDisplay = (visible?'':'none');
		
		if (fieldTd) {
			fieldTd.style.display = styleDisplay;
		}
		if (labelTd) {
			labelTd.style.display = styleDisplay;
		}
	},
	
	/**
	 * Set custom label to filter field
	 * @param id field id
	 * @param label message id for custom label
	 */
	setCustomFieldLabel: function(id, label){
		var custFieldEl = document.getElementById(id);
		var fieldTd = custFieldEl.parentNode;
		var labelTd = fieldTd.previousSibling;
		if (labelTd) {
			labelTd.innerHTML = getMessage(label);
		}
		
	}
});


/**
 * Populate specified drop down list.
 * @param selElementId
 * @param arrOptions
 */
function populateDropDown(selElementId, arrOptions, optionLabel){
	var objSelect = document.getElementById(selElementId);
	if (valueExists(objSelect)) {
		for (var index = 0; index < arrOptions.length; index++){
			var value = arrOptions[index];
			var option = document.createElement("option");
			option.value = value;
			option.text = getMessage(optionLabel + value);
			objSelect.options.add(option);
		}
	} 
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
			destField.drillDownValue = srcField.drillDownValue;
			if (valueExists(srcField.values)){
				destField.values = srcField.values;
			}
			if (valueExists(srcField.labelId)){
				destField.labelId = srcField.labelId;
			}
			if (valueExists(srcField.optionLabel)){
				destField.optionLabel = srcField.optionLabel;
			}
			if (valueExists(srcField.filterLabel)){
				destField.filterLabel = srcField.filterLabel;
			}
			if (valueExists(srcField.restriction)){
				destField.restriction = srcField.restriction;
			}
		}
	});
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
