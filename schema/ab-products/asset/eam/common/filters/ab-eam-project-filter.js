/*
//Global variables
// filter config options
var basicFilterConfig = new Ext.util.MixedCollection();
basicFilterConfig.addAll(
	{id: 'show_projects', fieldConfig: null},
	{id: 'project.status', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: {'AllOpen': 'optProjectStatus_allOpen', 'Proposed': '', 'Requested': ''}, dfltValue: 'AllOpen', hasEmptyOption: false}},
	{id: 'project.criticality', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: 'Mission Critical', hasEmptyOption: false}}
);

var extendedFilterConfig = new Ext.util.MixedCollection();
extendedFilterConfig.addAll(
	{id: 'time_frame', fieldConfig: {type: 'checkbox', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: null}},
	{id: 'from_year', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'to_year', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}}
);
*/

/**
 * Project filter controller.
 */
var abProjectFilterController = View.createController('abProjectFilterController', {
	// filter basic config object
	basicFilterConfig: null,
	
	// filter extended config object
	extendedFilterConfig: null,
	
	// callcback function for onFilter event
	onFilterCallback: null,
	
	// restriction with current values
	restriction: null,
	
	onClickActionButton1Handler: null,
	
	actionButton1Label: null,
	
	// initialize all config objects
	initializeConfigObjects: function(basicConfig, extendedConfig){
		this.basicFilterConfig = basicConfig;
		this.extendedFilterConfig = extendedConfig;

	},
	
	initializeFilter: function(){
		this.customizeFilterPanel(this.abEamProjectFilter_basic, this.basicFilterConfig, this.restriction);
		if(valueExists(this.onClickActionButton1Handler)){
			this.abEamProjectFilter_basic.actions.get('actionButton1').setTitle(this.actionButton1Label);
			this.abEamProjectFilter_basic.actions.get('actionButton1').show(true);
			// TODO find a general solution
			var menuParent = Ext.get('actionButton1');
			menuParent.on('click', this.abEamProjectFilter_basic_onActionButton1, this, null);
		}
		this.customizeFilterPanel(this.abEamProjectFilter_extended, this.extendedFilterConfig, this.restriction);
	},
	
	customizeFilterPanel: function(panel, fieldsConfig, restriction){
		var controller = this;
		fieldsConfig.each(function(field){
			if(valueExists(field.fieldConfig)){
				var fieldConfig = field.fieldConfig;
				if (fieldConfig.type == 'enumList') {
					controller.customizeDropdownField(panel, field.id, fieldConfig);
				}else if (fieldConfig.type == 'checkbox') {
					controller.customizeCheckboxField(panel, field.id, fieldConfig);
				}else{
					controller.customizeField(panel, field.id, fieldConfig);
				}
			}
			if(valueExists(restriction)){
				var clause = restriction.findClause(field.id);
				if(clause && clause.value){
					panel.setFieldValue(field.id, clause.value);
				}
			}
		});
	},
	
	abEamProjectFilter_basic_afterRefresh: function(){
		this.customizeFilterPanel(this.abEamProjectFilter_basic, this.basicFilterConfig, this.restriction);
	},

	abEamProjectFilter_extended_afterRefresh: function(){
		this.customizeFilterPanel(this.abEamProjectFilter_extended, this.extendedFilterConfig, this.restriction);
	},
	
	// Toggle More fields event handler
	abEamProjectFilter_basic_onToggleMoreFields: function(panel, action){
        this.abEamProjectFilter_extended.toggleCollapsed();
        
        action.setTitle(this.abEamProjectFilter_extended.collapsed ?
            getMessage('btnLabelMore') : getMessage('btnLabelLess'));
	},
	
	// Clear event handler
	abEamProjectFilter_basic_onClear: function(){
		var controller = this;
		// clear basic 
		var basicPanel = View.panels.get('abEamProjectFilter_basic');
		basicPanel.clear();
		this.basicFilterConfig.each(function(field){
			if (valueExists(field.fieldConfig)) {
				controller.setDefaultValueForField(basicPanel, field.id, field.fieldConfig);
			}
		});
		
		// clear extended
		var extendedPanel = View.panels.get('abEamProjectFilter_extended');
		extendedPanel.clear();
		this.extendedFilterConfig.each(function(field){
			if (valueExists(field.fieldConfig)) {
				controller.setDefaultValueForField(extendedPanel, field.id, field.fieldConfig);
			}
		});

	},
	
	abEamProjectFilter_basic_onFilter: function() {
		if(!this.validateFilter()){
			return false;
		}
		var restriction = this.getFilterRestriction();
		this.restriction = restriction;
		
		// call callback function
		if(this.onFilterCallback){
			this.onFilterCallback(restriction);
		}
	},

	/**
	 * Customize field.
	 */
	customizeField: function(panel, fieldId, fieldConfig){
		var field = panel.fields.get(fieldId);
		
		if (fieldConfig.hidden) {
			panel.showField(fieldId, false);
			return true;
		}
		
		// set default value
		if (valueExists(fieldConfig.dfltValue)) {
			panel.setFieldValue(fieldId, fieldConfig.dfltValue);
		}
		
		// disable field if required
		if (fieldConfig.readOnly){
			panel.enableField(fieldId, false);
		}
	},
	

	/**
	 * Customize dropdown field.
	 * fieldConfig:{
	 * 		type: enumList,
	 * 		hidden: false,
	 * 		readOnly: false,
	 * 		dfltValue: 'allOpen',
	 * 		values: {'Proposed': 'Proposed', 'Requested': 'Requested'},
	 * 		hasEmptyOption: false
	 * 
	 *  }
	 */
	customizeDropdownField: function(panel, fieldId, fieldConfig){
		var field = panel.fields.get(fieldId);
		
		if (fieldConfig.hidden) {
			panel.showField(fieldId, false);
			return true;
		}
		
		// customize field option
		if (valueExists(fieldConfig.values)){
			// remove all options
			field.clearOptions();
			// add new options
			for (var opt in fieldConfig.values) {
				var optTitle = valueExistsNotEmpty(fieldConfig.values[opt])? getMessage(fieldConfig.values[opt]):field.config.enumValues[opt];
				field.addOption(opt, optTitle);
			}
		}
		
		if (!fieldConfig.hasEmptyOption) {
			field.removeOptions({'':''});
		}
		
		// set default value
		if (valueExists(fieldConfig.dfltValue)) {
			panel.setFieldValue(fieldId, fieldConfig.dfltValue);
		}
		
		// disable field if required
		if (fieldConfig.readOnly){
			panel.enableField(fieldId, false);
		}
	},
	
	// customize checkbox field
	customizeCheckboxField: function(panel, fieldId, fieldConfig) {
		if (fieldConfig.hidden) {
			panel.showField(fieldId, false);
			return true;
		}
		// set default value
		if (valueExists(fieldConfig.dfltValue)) {
			$('chk_' + fieldId).checked = fieldConfig.dfltValue == 'checked';
		}
		
	},
	
	// set default value for customized fields
	setDefaultValueForField: function(panel, fieldId, fieldConfig){
		if(fieldConfig.type == 'checkbox'){
			$('chk_' + fieldId).checked = (valueExists(fieldConfig.dfltValue) && fieldConfig.dfltValue == 'checked');
		}else{
			if (valueExists(fieldConfig.dfltValue)) {
				panel.setFieldValue(fieldId, fieldConfig.dfltValue);
			}
		}
	},
	
	// validate filter settings
	validateFilter: function(){
		// check year time range
		var extendedPanel = this.abEamProjectFilter_extended;
		var chkTimeFrame = $('chk_time_frame');
		if(chkTimeFrame && chkTimeFrame.checked){
			var startYear = parseInt(extendedPanel.getFieldValue('from_year'));
			var endYear = parseInt(extendedPanel.getFieldValue('to_year'));
			if(startYear > endYear) {
				View.showMessage(getMessage('errTimeRange'));
				return false;
			}
		}
		
		return true;
	},
	
	//read filter values and return restriction object
	getFilterRestriction: function() {
		var restriction = new Ab.view.Restriction();
		// get basic filter fields
		var basicFilterPanel = this.abEamProjectFilter_basic;
		basicFilterPanel.fields.each(function(field){
			if(valueExists(field.fieldDef) 
					&& field.fieldDef.id != 'dummy_field' 
						&& valueExistsNotEmpty(basicFilterPanel.getFieldValue(field.fieldDef.id))) {
				
				if (basicFilterPanel.hasFieldMultipleValues(field.fieldDef.id)) {
					var values = basicFilterPanel.getFieldMultipleValues(field.fieldDef.id);
					restriction.addClause(field.fieldDef.id, values, 'IN');
				}else{
					var value = basicFilterPanel.getFieldValue(field.fieldDef.id);
					if(field.fieldDef.controlType == 'comboBox' || field.fieldDef.isEnum){
						restriction.addClause(field.fieldDef.id, value, '=');
					}else{
						restriction.addClause(field.fieldDef.id, value, 'LIKE');
					}
				}
			}
		});
		
		var extendedFilterPanel = this.abEamProjectFilter_extended;
		extendedFilterPanel.fields.each(function(field){
			if(valueExists(field.fieldDef) 
					&& field.fieldDef.id != 'dummy_field' 
						&& valueExistsNotEmpty(extendedFilterPanel.getFieldValue(field.fieldDef.id))
							&& field.fieldDef.id != 'time_frame') {
				if(field.fieldDef.id == 'from_year' || field.fieldDef.id == 'to_year'){
					var chkTimeFrame = $('chk_time_frame');
					if(chkTimeFrame && chkTimeFrame.checked){
						var value = extendedFilterPanel.getFieldValue(field.fieldDef.id);
						restriction.addClause(field.fieldDef.id, value, '=');
					}
				}else{
					if (extendedFilterPanel.hasFieldMultipleValues(field.fieldDef.id)) {
						var values = extendedFilterPanel.getFieldMultipleValues(field.fieldDef.id);
						restriction.addClause(field.fieldDef.id, values, 'IN');
					}else{
						var value = extendedFilterPanel.getFieldValue(field.fieldDef.id);
						if(field.fieldDef.controlType == 'comboBox' || field.fieldDef.isEnum){
							restriction.addClause(field.fieldDef.id, value, '=');
						}else{
							restriction.addClause(field.fieldDef.id, value, 'LIKE');
						}
					}
				}
			}
		});
		
		return restriction;
	}, 
	
	abEamProjectFilter_basic_onActionButton1: function(){
		if(valueExists(this.onClickActionButton1Handler)){
			var buttonElement = Ext.get('actionButton1');
			this.onClickActionButton1Handler(buttonElement);
		}
	}
});

