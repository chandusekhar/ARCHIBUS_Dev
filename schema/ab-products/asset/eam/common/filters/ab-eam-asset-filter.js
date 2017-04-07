var abEamAssetFilterCtrl = View.createController('abEamAssetFilterCtrl', {
	// filter basic config object
	filterConfig: null,
	
	// callcback function for onFilter event
	onFilterCallback: null,
	
	// restriction with current values
	restriction: null,
	
	// action button handler
	onClickActionButton1Handler: null,
	
	actionButton1Label: null,
	
	// initialize all config objects
	initializeConfigObjects: function(filterConfig){
		this.filterConfig = filterConfig;
	},
	
	setRestriction: function(restriction){
		if (valueExists(restriction)) {
			this.restriction = restriction;
		}
	},

	initializeFilter: function(){
		this.customizeFilterPanel(this.abEamAssetFilter, this.filterConfig, this.restriction);
		if(valueExists(this.onClickActionButton1Handler)){
			this.abEamAssetFilter.actions.get('actionButton1').setTitle(this.actionButton1Label);
			this.abEamAssetFilter.actions.get('actionButton1').show(true);
			// TODO find a general solution
			var menuParent = Ext.get('actionButton1');
			menuParent.on('click', this.abEamAssetFilter_onActionButton1, this, null);
		}
	},
	
	customizeFilterPanel: function(panel, fieldsConfig, restriction){
		var controller = this;

		panel.fields.each(function(field){
			if (valueExists(field.fieldDef) 
					&& field.fieldDef.id != 'dummy_field') {
				if (valueExists(fieldsConfig) 
						&& valueExists(fieldsConfig.get(field.fieldDef.id))) {
					var fieldConfig = fieldsConfig.get(field.fieldDef.id).fieldConfig;
					if (fieldConfig.type == 'enumList') {
						controller.customizeDropdownField(panel, field.fieldDef.id, fieldConfig);
					}else if (fieldConfig.type == 'checkbox') {
						controller.customizeCheckboxField(panel, field.fieldDef.id, fieldConfig);
					}else{
						controller.customizeField(panel, field.fieldDef.id, fieldConfig);
					}
				}
				if(valueExists(restriction)){
					var clause = restriction.findClause(field.fieldDef.id);
					if(clause && clause.value){
						panel.setFieldValue(field.fieldDef.id, clause.value);
					}
				}
			}
		});
		
		// disable status and type fields if no asset type is selected
		var assetType = this.abEamAssetFilter.getFieldValue('bl.asset_type');
		this.abEamAssetFilter.enableField('bl.asset_status',  valueExistsNotEmpty(assetType));
		this.abEamAssetFilter.enableField('bl.asset_std',  valueExistsNotEmpty(assetType));
		
	},
	
	abEamAssetFilter_afterRefresh: function(){
		this.customizeFilterPanel(this.abEamAssetFilter, this.filterConfig, this.restriction);
	},
	
	resetFilter: function(){
		// called to reset and apply default filter
		this.abEamAssetFilter_onClear();
		this.abEamAssetFilter_onFilter();
	},
	
	// Clear event handler
	abEamAssetFilter_onClear: function(){
		var controller = this;
		// clear basic 
		var filterPanel = View.panels.get('abEamAssetFilter');
		filterPanel.clear();
		if(valueExists(this.filterConfig)){
			this.filterConfig.each(function(field){
				if (valueExists(field.fieldConfig)) {
					controller.setDefaultValueForField(filterPanel, field.id, field.fieldConfig);
				}
			});
		}
		this.onChangeAssetType();
		onChangeDeprecValueType();
	},
	
	abEamAssetFilter_onFilter: function() {
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

		return true;
	},
	
	//read filter values and return restriction object
	getFilterRestriction: function() {
		var restriction = new Ab.view.Restriction();
		// get basic filter fields
		var filterPanel = this.abEamAssetFilter;
		filterPanel.fields.each(function(field){
			if(valueExists(field.fieldDef) 
					&& field.fieldDef.id != 'dummy_field' 
						&& valueExistsNotEmpty(filterPanel.getFieldValue(field.fieldDef.id))) {
				
				if (filterPanel.hasFieldMultipleValues(field.fieldDef.id)) {
					var values = filterPanel.getFieldMultipleValues(field.fieldDef.id);
					restriction.addClause(field.fieldDef.id, values, 'IN');
				}else{
					var value = filterPanel.getFieldValue(field.fieldDef.id);
					if(field.fieldDef.controlType == 'comboBox' || field.fieldDef.isEnum){
						restriction.addClause(field.fieldDef.id, value, '=');
					}else{
						restriction.addClause(field.fieldDef.id, value, 'LIKE');
					}
				}
			}
		});
		return restriction;
	},
	// customize filter fields when asset type is changed
	onChangeAssetType: function(){
		var assetType = this.abEamAssetFilter.getFieldValue('bl.asset_type');
		if(valueExistsNotEmpty(assetType)){
			// customize asset status field
			var enumValues = this.abAssetStatus_ds.fieldDefs.get(assetType + ".status").enumValues;
			var statusField = this.abEamAssetFilter.fields.get('bl.asset_status');
			if(statusField){
				// remove all options
				statusField.clearOptions();
				statusField.addOption('', '');
				// add new options
				for (var opt in enumValues) {
					statusField.addOption(opt, enumValues[opt]);
				}
				this.abEamAssetFilter.enableField('bl.asset_status', true);
			}
			// enable asset standard field
			if(assetType == 'eq' || assetType == 'ta'){
				this.abEamAssetFilter.setFieldValue('bl.asset_std', '');
				this.abEamAssetFilter.enableField('bl.asset_std', true);
			}else{
				this.abEamAssetFilter.setFieldValue('bl.asset_std', '');
				this.abEamAssetFilter.enableField('bl.asset_std', false);
			}
			
			
		}else{
			var statusField = this.abEamAssetFilter.fields.get('bl.asset_status');
			if(statusField){
				// remove all options
				statusField.clearOptions();
				statusField.addOption('', '');

				this.abEamAssetFilter.enableField('bl.asset_status', false);
			}
			this.abEamAssetFilter.setFieldValue('bl.asset_std', '');
			this.abEamAssetFilter.enableField('bl.asset_std', false);
		}
	},
	
	abEamAssetFilter_onActionButton1: function(){
		if(valueExists(this.onClickActionButton1Handler)){
			var buttonElement = Ext.get('actionButton1');
			this.onClickActionButton1Handler(buttonElement);
		}
	},
	
	setFieldValue: function(fieldName, fieldValue){
		this.abEamAssetFilter.setFieldValue(fieldName, fieldValue);
	}
});

function onAssetStd_selectValue(){
	var filterPanel = View.panels.get('abEamAssetFilter');
	var assetType = filterPanel.getFieldValue('bl.asset_type');
	var title = getMessage('titleAssetStd_'+assetType);
	if(assetType == 'eq'){
		View.selectValue('abEamAssetFilter', title, ['bl.asset_std'], 'eqstd', 
				['eqstd.eq_std'], ['eqstd.eq_std','eqstd.category','eqstd.description'], null, null, null, null, null, 800, 600, 'multiple');
		
	} else if(assetType == 'ta'){
		View.selectValue('abEamAssetFilter', title, ['bl.asset_std'], 'fnstd', 
				['fnstd.fn_std'], ['fnstd.fn_std','fnstd.catalog_id','fnstd.category','fnstd.description'], null, null, null, null, null, 800, 600, 'multiple');
	}
}

/**
 * Asset type - onChange event handler
 * @param ctx
 */
function onChangeAssetType(ctx){
	var controller = View.controllers.get('abEamAssetFilterCtrl');
	controller.onChangeAssetType();
}

/**
 * Depreciation value type - onChange event handler
 * @param ctx
 */
function onChangeDeprecValueType(ctx){
	var filterPanel = View.panels.get('abEamAssetFilter');
	var selectedValue = filterPanel.getFieldValue('deprec_value_type');
	if(selectedValue == 'greater_than'){
		filterPanel.showField('deprec_value', true);
		filterPanel.setFieldValue('deprec_value', '0.00');
	}else{
		filterPanel.showField('deprec_value', false);
	}
}

