// data types array
var arrayDataTypes = [1, 2, 4, 9, 10, 12];

// max field name length
var MaxFldLengthSYBASE = 32;
var MaxFldLengthMSSQL = 32; 
var MaxFldLengthORACLE = 28;

var abSchemaAddFieldCtrl = View.createController('abSchemaAddFieldCtrl', {
	
	// after view load event customize some fields
	afterViewLoad: function(){
		// customize data type field
		makeSelectElement(this.abSchemaAddField_form.fields.get("afm_flds.data_type").dom, arrayDataTypes, "dataType_", false);
		//set min/max limit for decimals
		this.abSchemaAddField_form.setMinValue("afm_flds.decimals", 0);
		this.abSchemaAddField_form.setMaxValue("afm_flds.decimals", 4);
		//set min/max limit for size
		this.abSchemaAddField_form.setMinValue("afm_flds.afm_size", 0);
		this.abSchemaAddField_form.setMaxValue("afm_flds.afm_size", 32767);
	},
	
	// after refresh form - enable/disable some fields based on other fields values
	abSchemaAddField_form_afterRefresh: function(){
		checkFormFields();
		// disable input for table name 
		this.abSchemaAddField_form.fields.get("afm_flds.table_name").dom.readOnly = true;
	},
	
	abSchemaAddField_form_onSave: function(){
		this.abSchemaAddField_form.clearValidationResult();
		// if new field can be saved
		if (this.validateNewField()) {
			var tableName = this.abSchemaAddField_form.getFieldValue("afm_flds.table_name");
			var fieldName = this.abSchemaAddField_form.getFieldValue("afm_flds.field_name");
			if (this.abSchemaAddField_form.save()) {
				this.updateSchema(tableName, fieldName);
			}
		}
	},
	
	updateSchema: function(tableName, fieldName){
		var controller = this;
		try {
			SchemaUpdateWizardService.startUpdateSchemaForTableJob(tableName, 
											{
											callback: function() {
												controller.afterUpdateSchema(tableName, fieldName);
		    								},
		    								errorHandler: function(m, e) {
		    									View.showException(e);
		        							}
			});
		}catch(e){
			Workflow.handleError(e);
		}
		
	} ,
	
	afterUpdateSchema: function(tableName, fieldName){
		var message = getMessage("msg_schema_updated").replace("{0}", fieldName).replace("{1}", tableName);
		View.showMessage(message);
		this.abSchemaAddField_form.refresh({}, true);
	},
	
	// validate form values
	validateNewField: function(){
		// table name field, must be an existing table
		var tableName = this.abSchemaAddField_form.getFieldValue("afm_flds.table_name");
		var fieldDef = this.abSchemaAddField_form.fields.get("afm_flds.table_name").fieldDef;
		// table name cannot be empty
		if (!valueExistsNotEmpty(tableName)) {
			var message = getMessage("error_field_empty").replace("{0}", fieldDef.title);
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.table_name", message);
			return false;
		}
		// field name
		var fieldName = this.abSchemaAddField_form.getFieldValue("afm_flds.field_name");
		var fieldDef = this.abSchemaAddField_form.fields.get("afm_flds.field_name").fieldDef;
		// cannot be empty
		if (!valueExistsNotEmpty(fieldName)) {
			var message = getMessage("error_field_empty").replace("{0}", fieldDef.title);
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.field_name", message);
			return false;
		}
		// cannot be an existing field name
		if (!isNewFieldName(this.abSchemaAddField_form.getDataSource(), tableName, fieldName)) {
			var message = getMessage("error_existing_field").replace("{0}", fieldName).replace("{1}", tableName);
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.field_name", message);
			return false;
		}
		// name length
		var message = isValidNameLength(fieldName);
		if ( valueExistsNotEmpty(message)) {
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.field_name", message);
			return false;
		}
		//validate special chars , spaces ...
		var message = isValidFieldName(fieldName);
		if ( valueExistsNotEmpty(message)) {
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.field_name", message);
			return false;
		}
		
		
		// field heading cannot be empty
		var mlHeading = this.abSchemaAddField_form.getFieldValue("afm_flds.ml_heading");
		var fieldDef = this.abSchemaAddField_form.fields.get("afm_flds.ml_heading").fieldDef;

		if (!valueExistsNotEmpty(mlHeading)) {
			var message = getMessage("error_field_empty").replace("{0}", fieldDef.title);
			this.addInvalidField(this.abSchemaAddField_form, "afm_flds.ml_heading", message);
			return false;
		}
		
		return true;
	},
	
	addInvalidField: function(form, fieldName, error){
		form.addInvalidField(fieldName, error);
		form.displayValidationResult();
	}
});

/**
 * Check some fields conditions.
 */
function checkFormFields(){
	var form = View.panels.get("abSchemaAddField_form");
	var dataType = parseInt(form.getFieldValue("afm_flds.data_type"));
	if (dataType == 1 || dataType == 12) {
		form.setMaxValue("afm_flds.afm_size", 32767);
		form.setFieldValue("afm_flds.afm_size", 16);
		form.setFieldValue("afm_flds.decimals", form.fields.get("afm_flds.decimals").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.string_format", form.fields.get("afm_flds.string_format").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.num_format", form.fields.get("afm_flds.num_format").fieldDef.defaultValue);
		form.enableField("afm_flds.afm_size", true);
		form.enableField("afm_flds.decimals", false);
		form.enableField("afm_flds.string_format", true);
		form.enableField("afm_flds.num_format", false);
	} else if (dataType == 4) {
		form.setMaxValue("afm_flds.afm_size", 10);
		form.setFieldValue("afm_flds.afm_size", 10);
		form.setFieldValue("afm_flds.decimals", form.fields.get("afm_flds.decimals").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.string_format", form.fields.get("afm_flds.string_format").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.num_format", form.fields.get("afm_flds.num_format").fieldDef.defaultValue);
		form.enableField("afm_flds.afm_size", true);
		form.enableField("afm_flds.decimals", false);
		form.enableField("afm_flds.string_format", false);
		form.enableField("afm_flds.num_format", true);
	} else if (dataType == 2) {
		form.setMaxValue("afm_flds.afm_size", 32767);
		form.setFieldValue("afm_flds.afm_size", 16);
		form.setFieldValue("afm_flds.decimals", form.fields.get("afm_flds.decimals").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.string_format", form.fields.get("afm_flds.string_format").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.num_format", form.fields.get("afm_flds.num_format").fieldDef.defaultValue);
		form.enableField("afm_flds.afm_size", true);
		form.enableField("afm_flds.decimals", true);
		form.enableField("afm_flds.string_format", false);
		form.enableField("afm_flds.num_format", true);
	} else if (dataType == 9 || dataType == 10) {
		form.setFieldValue("afm_flds.afm_size", form.fields.get("afm_flds.afm_size").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.decimals", form.fields.get("afm_flds.decimals").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.string_format", form.fields.get("afm_flds.string_format").fieldDef.defaultValue);
		form.setFieldValue("afm_flds.num_format", form.fields.get("afm_flds.num_format").fieldDef.defaultValue);
		form.enableField("afm_flds.afm_size", false);
		form.enableField("afm_flds.decimals", false);
		form.enableField("afm_flds.string_format", false);
		form.enableField("afm_flds.num_format", false);
	}
}

/**
 * Show existing fields for selected table.
 */
function showExistingFields(){
	var form = View.panels.get("abSchemaAddField_form");
	var tableName = form.getFieldValue("afm_flds.table_name");
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_flds.table_name", tableName, "=");
	View.selectValue("abSchemaAddField_form", 
			getMessage("title_fieldName"), 
			['afm_flds.field_name'], 
			'afm_flds',
			['afm_flds.field_name'], 
			['afm_flds.table_name', 'afm_flds.field_name', 'afm_flds.ml_heading'], 
			restriction);
}

/**
 * Check if specified field name already exist or not
 * @returns boolean
 */
function isNewFieldName(dataSource, tableName, fieldName){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_flds.table_name", tableName, "=");
	restriction.addClause("afm_flds.field_name", fieldName, "=");
	
	var record = dataSource.getRecord(restriction);
	if (valueExistsNotEmpty(record.getValue("afm_flds.field_name")) && record.getValue("afm_flds.field_name") == fieldName) {
		return false;
	} 
	return true;
}

/**
 * Check field name length
 * @param fieldName field name
 * @returns string, error message
 */
function isValidNameLength(fieldName){
	var result = null;
	var maxLength = getNameLength();
	if (fieldName.length > maxLength) {
		result = getMessage("error_field_name_too_long").replace("{0}", maxLength);
	}
	return result;
}

/**
 * Validate field name, should not contain spaces, special chars
 * @param fieldName field name
 * @returns string, error message
 */
function isValidFieldName(fieldName){
	var result = null;
	var objRegExp  = /^[a-z0-9_]+$/;
	if (!objRegExp.test(fieldName)) {
		result = getMessage("error_invalid_field_name");
	}
	return result;
}

function getNameLength(){
	var dataSource = View.dataSources.get("abSchemaAddFieldDbType_ds");
	var record = dataSource.getRecord();
	var dbType = record.getValue("afm_flds.vf_db_type");
	var maxLength = -1;
	if (dbType == 0) {
		maxLength = MaxFldLengthORACLE;
	}else if (dbType == 1){
		maxLength = MaxFldLengthMSSQL;
	} else if (dbType == 2) {
		maxLength = MaxFldLengthSYBASE;
	}
	return maxLength;
}

/**
 * Customize select element.
 * Remove all options and add new options.
 * @param objSelect select element
 * @param arrOptions array with new option values
 * @param msgPrefix message name prefix. Option text
 * @param isEmptyOption if first option is empty, default true
 */
function makeSelectElement(objSelect, arrOptions, msgPrefix, isEmptyOption) {
	if (!valueExists(isEmptyOption)) {
		isEmptyOption = true;
	}
	var objOption = null;
	if (valueExists(objSelect) && objSelect.tagName == "SELECT") {
		// remove all options
		objSelect.innerHTML = "";
		for (var i = 0; i < objSelect.options.length; i++) {
			objSelect.remove(i);
		}
		
		// add empty option if is required
		if (isEmptyOption) {
			objOption = document.createElement('option');
			objOption.value = "";
			objOption.text = "";
			objSelect.add(objOption);
		}
		// add new options
		for (var i = 0; i < arrOptions.length; i++) {
			var value = arrOptions[i];
			var text = getMessage(msgPrefix + value);
			objOption = document.createElement('option');
			objOption.value = value;
			objOption.text = text;
			objSelect.add(objOption);
		}
		objSelect.options.selectedIndex = 0;
	}
}

function toLowerCase(){
	var form = View.panels.get("abSchemaAddField_form");
	form.setFieldValue("afm_flds.field_name", form.getFieldValue("afm_flds.field_name").toLowerCase());
}