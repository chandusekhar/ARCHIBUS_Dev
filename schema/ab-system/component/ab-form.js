/**
 * Declare the namespace for the form JS classes.
 */
AFM.namespace('form');


/**
 * Class that holds the form fields validation results.
 */
AFM.form.ValidationResult = Base.extend({
    
    // whether all form field values are valid
    valid: true,
    
    // validation message to be displayed
    message: '',
    
    // detailed validation message to be displayed
    detailedMessage: '',
    
    // object that contains invalid field names and associated error messages
    invalidFields: null,
    
    constructor: function() {
        this.invalidFields = new Object();
    }
});


/**
 * Class that contains field definition.
 */
AFM.form.FieldDef = Base.extend({
    
    fullName: '',
    afmType: '',
    type: '',
    size: 0,
    decimals: 0,
    isReadOnly: false,
    isRequired: false,
    isEnum: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isMemo: false,
    
    constructor: function(fieldInformation) {
        this.fullName = fieldInformation.fullName;
        this.afmType = fieldInformation.afmType;
        this.type = fieldInformation.type;
        this.size = fieldInformation.size;
        this.decimals = fieldInformation.decimal;
        this.isReadOnly = getBoolean(fieldInformation.readOnly);
        this.isRequired = getBoolean(fieldInformation.required);
        this.isEnum = getBoolean(fieldInformation.isEnum);
        this.isPrimaryKey = getBoolean(fieldInformation.primaryKey);
        this.isForeignKey = getBoolean(fieldInformation.foreignKey);
        this.isMemo = (fieldInformation.format=="Memo");
    },
    
    isDocument: function() {
        return (this.afmType == '2165');
    },
    
    isDate: function() {
        return (this.type == 'java.sql.Date');
    },
    
    isTime: function() {
        return (this.type == 'java.sql.Time');
    }
});


/**
 * Form component.
 */
AFM.form.Form = AFM.view.Component.extend({
    
    // HTML form ID
    formId: '',
    
	// view definition to be displayed
	viewDef: null,
	
	// array of field definitions
	fieldDefs: null,
	
	// map (object) of field definitions keyed by the full field name
	fieldDefsByName: null,
	
    // name of the default WFR used to get the default record
    clearWorkflowRuleId: '',
    
    // name of the default WFR used to get the record
    refreshWorkflowRuleId: '',
    
    // name of the default WFR used to get the record
    saveWorkflowRuleId: '',
    
    // name of the default WFR used to delete the current record
    deleteWorkflowRuleId: '',
    
    // validation result object
    validationResult: null,
    
    // whether this form is used to edit new (unsaved yet) record
    newRecord: false,
    
    // data record retrieved from the server
    record: null,
    
    // user function to call after refresh()
    afterRefreshListener: null,
    
    // user function to call before save()
    beforeSaveListener: null,
    
    // user function to call before deleteRecord()
    beforeDeleteListener: null,
    
    // current form is a console or a regular form
    isConsole: false,
    
    // TODO: refactor using translatableDisplayStrings
    MESSAGE_INVALID_FIELD: 'One or more fields contain incorrect values. Form was not saved. Please correct highlighted values and save again.',
    
    // ----------------------- initialization ------------------------------------------------------
    
    /**
     * Constructor.
	 *
	 * @param controlId
	 * @param configObject - map with keys of (at least)  [viewDef, groupIndex, panelId] and possibly [showOnLoad, afterRefreshListener, beforeSaveListener, beforeDeleteListener,
	 *									refreshWorkflowRuleId, saveWorkflowRuleId, deleteWorkflowRuleId, clearWorkflowRuleId, useParentRestriction]
	 *						 passing map to base class with keys of (possibly)  [showOnLoad, useParentRestriction]
     */
	constructor: function(controlId, configObject) {
        this.inherit(controlId, 'form', configObject);  

        this.viewDef = new AFM.view.ViewDef(configObject.getConfigParameter('viewDef'), configObject.getConfigParameter('groupIndex'));
        this.formId = configObject.getConfigParameter('panelId');       
                
        this.newRecord = configObject.getConfigParameter('newRecord');
        if (this.newRecord == false) {
            this.newRecord = AFM.view.View.newRecord;
        }
        this.record = this.getFieldValues();
        
        this.isConsole = configObject.getConfigParameter('isConsole');
        
        this.MESSAGE_INVALID_FIELD = getMessage('form_invalid_value');
        
        // create field definitions
        this.fieldDefs = new Array();
        this.fieldDefsByName = new Object();
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var fieldDef = new AFM.form.FieldDef(arrFieldsInformation[fieldName]);
            this.fieldDefs.push(fieldDef);
            this.fieldDefsByName[fieldName] = fieldDef;
        }        
        
		var afterRefreshListener = configObject.getConfigParameterIfExists('afterRefreshListener');
        if (valueExists(afterRefreshListener) && afterRefreshListener != '') {
            this.afterRefreshListener = afterRefreshListener;
        }
		var beforeSaveListener = configObject.getConfigParameterIfExists('beforeSaveListener');
        if (valueExists(beforeSaveListener) && beforeSaveListener != '') {
            this.beforeSaveListener = beforeSaveListener;
        }
		var beforeDeleteListener = configObject.getConfigParameterIfExists('beforeDeleteListener');
        if (valueExists(beforeDeleteListener) && beforeDeleteListener != '') {
            this.beforeDeleteListener = beforeDeleteListener;
        }
		var refreshWorkflowRuleId = configObject.getConfigParameterIfExists('refreshWorkflowRuleId');        
		if (valueExists(refreshWorkflowRuleId) && refreshWorkflowRuleId != '') {
		    this.refreshWorkflowRuleId = refreshWorkflowRuleId;
		} else {
		    this.refreshWorkflowRuleId = AFM.form.Form.WORKFLOW_RULE_REFRESH;
		}
		var saveWorkflowRuleId = configObject.getConfigParameterIfExists('saveWorkflowRuleId');
		if (valueExists(saveWorkflowRuleId) && saveWorkflowRuleId != '') {
		    this.saveWorkflowRuleId = saveWorkflowRuleId;
		} else {
		    this.saveWorkflowRuleId = AFM.form.Form.WORKFLOW_RULE_SAVE;
		}
		var deleteWorkflowRuleId = configObject.getConfigParameterIfExists('deleteWorkflowRuleId');
		if (valueExists(deleteWorkflowRuleId) && deleteWorkflowRuleId != '') {
		    this.deleteWorkflowRuleId = deleteWorkflowRuleId;
		} else {
		    this.deleteWorkflowRuleId = AFM.form.Form.WORKFLOW_RULE_DELETE;
		}
		var clearWorkflowRuleId = configObject.getConfigParameterIfExists('clearWorkflowRuleId');
		if (valueExists(clearWorkflowRuleId) && clearWorkflowRuleId != '') {
		    this.clearWorkflowRuleId = clearWorkflowRuleId;
		} else {
		    this.clearWorkflowRuleId = AFM.form.Form.WORKFLOW_RULE_CLEAR;
		}
        
        // if the opener view specified restriction, use it to refresh the field values
        var showOnLoad = configObject.getConfigParameter('showOnLoad');
        if (!this.isConsole && showOnLoad && (this.restriction != null || this.newRecord)) {
            this.refresh();
        }
        
        this.updateDocumentButtons();
    },
    
    // ------------------------ common control API methods -----------------------------------------
    
    /**
     * Returns parent element ID. By default, the parent element ID is the same as the control ID.
     */
    getParentElementId: function() {
        return this.controlId + '_body';
    },
    
    /**
     * Clears the control UI state.
     */
    clear: function() {
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            
            this.setFieldValue(fieldName, '', '');
        }        
    },
    
    /**
     * Refreshes the control UI state, possibly by obtaining data from the server.
     */
    refresh: function(restriction, newRecord) {
        this.inherit();

        this.clearValidationResult();
        
        // store the restriction if specified
        // if restriction is not specified, keep the current one
        if (typeof(restriction) != 'undefined' && restriction != null && restriction != '') {
            this.restriction = restriction;
        }

        if (typeof(newRecord) != 'undefined') {
            this.newRecord = newRecord;
        }
        
        var workflowRuleName = (this.newRecord == true) ? this.clearWorkflowRuleId : this.refreshWorkflowRuleId;
        
        // retrieve record data from the server
        var result = AFM.workflow.Workflow.runRuleAndReturnResult(
            workflowRuleName, 
            this.getParameters(false));
            
		if (result.code == 'executed') {
			// kb# 3015986
		    // no need to clear all the field values as the field values will
		    // be conditionally reset in refreshFieldValues function.
		    //if (newRecord) {
		    //    this.clear();
		    //}
			this.refreshFieldValues(result.data);
            
            // show or hide document buttons
            this.updateDocumentButtons();
        
            // show the control
            this.show(true);
            
            // call user-defined callback function
            if (this.afterRefreshListener != null) {
                window[this.afterRefreshListener].call(self, this);
            }
		} 
		else {
		    this.validationResult.valid = false;
		    this.displayValidationResult(result);
		}
    },
    
    /**
     * Saves the changed data to the database.
     */
    save: function() {
        this.clearValidationResult();
        
        // call user-defined callback function
        if (this.beforeSaveListener != null) {
            var userResult = window[this.beforeSaveListener].call(self, this);
            if (valueExists(userResult) && userResult == false) {
    		    this.validationResult.valid = false;
    		    this.displayValidationResult();
    		    // stop chained command execution
                return false;
            }
        }
        
        // validate field values
        if (this.validateFields()) {
            // call WFR to save form values        
            var result = AFM.workflow.Workflow.runRuleAndReturnResult(
                this.saveWorkflowRuleId, 
                this.getParameters(true));
                
    		if (result.code == 'executed') {
    		    if (valueExists(result.data)) {
        	        this.refreshFieldValues(result.data);
        	        this.newRecord = false;
        	        this.refresh(this.getPrimaryKeyFieldValues(true));
        		    this.displayValidationResult(result);
    		    }
    		} 
    		else {
    		    this.validationResult.valid = false;
    		    this.displayValidationResult(result);
    		}
        }
            
        // return false (stop chained command execution) if validation or save has failed
        return this.validationResult.valid;
    },
    
    /**
     * Deletes the current form record.
     */
    deleteRecord: function() {
        this.clearValidationResult();
        
        // call user-defined callback function
        if (this.beforeDeleteListener != null) {
            var userResult = window[this.beforeDeleteListener].call(self, this);
            if (valueExists(userResult) && userResult == false) {
    		    this.validationResult.valid = false;
    		    this.displayValidationResult();
    		    // stop chained command execution
                return false;
            }
        }
        if (this.validateFields()) {
	        // call WFR to save form values        
	        var result = AFM.workflow.Workflow.runRuleAndReturnResult(
	            this.deleteWorkflowRuleId, 
	            this.getParameters(true),
	            this.afterDelete,
	            this);
			if (result.code == 'executed') {
			    this.displayValidationResult(result);
			} 
			else {
			    this.validationResult.valid = false;
			    this.displayValidationResult(result);
			}
        }  
        // return false (stop chained command execution) if delete has failed
        return this.validationResult.valid;
    },
    
    // ----------------------- implementation ------------------------------------------------------
    
    /**
     * Validates all field values and highlights all errors.
     * @return true if validation was successful, false otherwise.
     */
    validateFields: function() {
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            
            var fieldInput = $(fieldName);
            if (valueExists(fieldInput)) {
                var isValid = validationInputs(this.formId, fieldInput.name, true);
                if (!isValid) {
                    this.addInvalidField(fieldName, '');
                }
            }
        }
        if (this.validationResult.valid == false) {
            this.displayValidationResult();
        }
        return this.validationResult.valid;
    },
    
    /**
     * Adds an invalid field message to the validation result.
     * @param {fieldName}
     * @param {fieldError}
     */
    addInvalidField: function(fieldName, fieldError) {
        this.validationResult.valid = false;
        this.validationResult.message = this.MESSAGE_INVALID_FIELD;
        this.validationResult.invalidFields[fieldName] = fieldError;
    },
    
    /**
     * Updates all field values from specified WFR result.
     * Extracts and stores as a form vaiable the primary key values.
     * @param {data} Data object returned by WFR.
     */
    refreshFieldValues: function(data) {
        if (valueExists(data.records) && valueExists(data.records[0])) {
    		this.record = data.records[0];
            for (var fieldName in this.record) {
            
            	// ignore key values and unformatted values
                if (fieldName.indexOf('.key') == -1 && fieldName.indexOf('.raw') == -1) {
                	var formattedValue = this.record[fieldName];
                	var unformattedValue = this.record[fieldName + '.raw'];
					
					// KB 3018845: if unformatted value is the same as formatted, 
					// the server does not supply it as an optimization
					// this happens for enum fields where raw values and displayed values are same
					// e.q. resource.recource_type  
					if (!valueExists(unformattedValue)) {
						unformattedValue = formattedValue;
					}
                	this.setFieldValue(fieldName, formattedValue, unformattedValue);
                }
            }
        } else if (this.newRecord) {
        	// kb# 3015986
		    // only clear all fields when no records are returned for the form.
			this.clear();
        }
        
        if (this.newRecord){
        	//KB3022106
        	 for (var fieldName in arrFieldsInformation) {
     			var fieldDef = this.fieldDefsByName[fieldName];
     			var today = new Date();
     			if (fieldDef && fieldDef.isTime()){
     				var curr_hour = today.getHours();
     				var curr_min = today.getMinutes();
     				var curr_time = FormattingTime(curr_hour, curr_min, "AM", timePattern);
     				if(curr_hour > 12){
     					curr_time = FormattingTime(curr_hour, curr_min, "PM", timePattern);
     				} 
     				this.setFieldValue(fieldName, curr_time, curr_hour + ":" + curr_min);
     			}else if(fieldDef && fieldDef.isDate()){
     				var day	  = today.getDate();
     				var month = today.getMonth()+ 1;
     				var year  = today.getFullYear();
     				this.setFieldValue(fieldName, this.formatDate(day, month, year, false), this.formatDate(day, month, year, true));
     			}
        	 }
        }
        
    },
    
    /**
     * Returns a JSON object containing old field values retrieved from the server.
     */
    getOldFieldValues: function() {
        var oldFieldValues = {};
        for (var fieldName in arrFieldsInformation) {
			var fieldDef = this.fieldDefsByName[fieldName];
			var fieldValue = this.record[fieldName];
			
			
			// for enumerated fields, use raw value
			var field = $(fieldName, false);
			if (field != null && valueExists(this.record[fieldName + '.raw']) && field.tagName == 'SELECT') {
			    fieldValue = this.record[fieldName + '.raw'];
			}
			
			// for date/time values, use PK value
			if (fieldDef.isTime() || fieldDef.isDate()) {
				if(valueExists(this.record[fieldName + '.key'])){
					fieldValue = this.record[fieldName + '.key'];
				}else if (valueExists(this.record[fieldName + '.raw'])){
			    	fieldValue = this.record[fieldName + '.raw'];
			    	if(fieldDef.isTime() && valueExists(fieldValue) && fieldValue.length>0){
			    		// remove the ' if necessary
			    		fieldValue = fieldValue.replace(/\'/g, "");
			    		fieldValue = fieldValue.substring(fieldValue.indexOf(":")-2)
			    		//XXX: hh:mm:ss???? ->  hh:mm.ss.SSS
			    		fieldValue = fieldValue.substring(0, 5) + "." +fieldValue.substring(6, 8);
			    		fieldValue = fieldValue + ".000";
			    	}
				}
			}
		
			// replace null or undefined by empty value
			if (!valueExists(fieldValue)) {
			    fieldValue = '';
			}
			
			oldFieldValues[fieldName] = fieldValue; 
        }
        return oldFieldValues;
    },
    
    /**
     * Returns parameters for the workflow rule.
     */
    getParameters: function(includeFieldValues) {
        var parameters = {
            viewName:    this.viewDef.viewName,
			groupIndex:  this.viewDef.tableGroupIndex,
            controlId:   this.controlId,
            isNewRecord: this.newRecord
        };
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }
        if (includeFieldValues) {
            parameters.fieldValues = toJSON(this.getFieldValues());
            parameters.oldFieldValues = toJSON(this.getOldFieldValues());
        }
        return parameters;
    },
    
    /**
     * Returns XML record containing all form field values (unformatted).
     */
    getRecord: function() {
        var values = '';
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var fieldValue = getInputValue(fieldName, '');
            
            values = values + fieldName  + '=\'' + fieldValue + '\' ';
        }
        return '<record ' + values + '></record>';
    },
    
    /**
     * Returns an array containing all form field values (unformatted).
     * @param {ignoreEmptyValues} If specified and true, empty field values are not returned.
     */
    getFieldValues: function(ignoreEmptyValues) {
        if (!valueExists(ignoreEmptyValues)) {
            ignoreEmptyValues = false;
        }
        var fieldValues = new Object();
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var fieldValue = this.getFieldValue(fieldName);
			var fullFieldName = arrFieldsInformation[fieldName].fullName;	
			//XXX: skip alias fields
			var bMatch = fullFieldName==fieldName;
			if(bMatch && (!ignoreEmptyValues || fieldValue != '')){	
                 fieldValues[fieldName] = fieldValue;
			}
        }
        return fieldValues;
    },
    
    /**
     * Returns an array of form field names.
     */
    getFieldNames: function() {
        var fieldNames = [];
        for (var fieldName in arrFieldsInformation) {
            var form = document.forms[this.formId];
            var formInput = form.elements[fieldName];
            if (formInput != null && typeof(formInput) != 'undefined') {
                fieldNames.push(fieldName);
            }
        }
        return fieldNames;
    },    
    
    /**
     * Returns specified form field value.
     */
    getFieldValue: function(fieldName) {
        //XXX: JSON doesn't need encoding of five XML special characters
        //convertFromXMLValue() defined in common.js to decode XML's five special characters
        //getInputValue() defined in edit-forms.js to encode XML's five special characters
        return  convertFromXMLValue(getInputValue(fieldName, this.formId));
    },
    
    /**
     * Sets specified form field value.
     */
    setFieldValue: function(fieldName, fieldValue, unformattedValue) {
        // try to access edit field
        var field = $(fieldName, false);
        if (field != null) {
            if (field.tagName == 'SELECT') {
            	setInputValue(fieldName, this.formId, unformattedValue);
            	
				if (field.disabled == true){
					var roField = $("Show" + fieldName, false);
					if(roField!=null){
            			roField.innerHTML = fieldValue;	
            		}
            	}		
                
            } else {
                // clear the old field value - otherwise if new value is empty, 
                // the setInputValue() will keep the old value in the field
                if(fieldValue == null || fieldValue == ""){
                	field.value = '';
            	}
            	
            	//kb# 3016326
            	var fieldDef = this.fieldDefsByName[fieldName];
            	if(typeof(fieldDef) != 'undefined' && fieldDef != null && (fieldDef.isTime() || fieldDef.isDate())){
					// for date/time field, we nned to use the unformatted value 
					// and the formatting takes place in Converting Date/Time function in date-time.js file
					if(fieldDef.isTime() && valueExists(unformattedValue)){
						//time's unformattedValue could be like "2007-11-15 18:45:46.0" => time value must like "18:45:46" 
						var temp_time = unformattedValue.substring(unformattedValue.indexOf(":")-2);
						temp_time = temp_time.substring(0, 8);
	            		setInputValue(fieldName, this.formId, temp_time); 
	            		//readonly
	            		fieldValue = temp_time.substring(0, 5);
					}else{
						setInputValue(fieldName, this.formId, unformattedValue);
					}

            	} else {
            		setInputValue(fieldName, this.formId, fieldValue);
            	
            		// kb# 3016421 
            		// for some readonly field that are not date/time, the show field needs to be set too.
            		var fieldShow = $('Show' + fieldName, false);
					if (fieldShow != null) {
						if(typeof(fieldDef) != 'undefined' && fieldDef != null && fieldDef.isMemo && fieldValue!=null && fieldValue!=""){
							var regular_expression = new RegExp ('\r\n', 'gi') ;	 
	 						fieldValue = fieldValue.replace(regular_expression,"<br/>");
	 						regular_expression = new RegExp ('\n', 'gi') ;
	 						fieldValue = fieldValue.replace(regular_expression,"<br/>");	 
							regular_expression = new RegExp ('\r', 'gi') ;
	 						fieldValue = fieldValue.replace(regular_expression,"<br/>");	
	 						fieldValue = fieldValue.replace(/>/g, "&gt;");
	 						fieldValue = fieldValue.replace(/</g, "&lt;");
	 					}
						fieldShow.innerHTML = fieldValue;
					}
            	}
            }
        }
        
       	//kb# 3016326
        // The following code is duplicate to the codes in date-time.js 's converting date/time function
        // It also not covering all the date/time case
        // try to access the text label (for date and time)
        /*var fieldLabel = $('Show' + fieldName, false);
           
        if (fieldLabel != null) {
            fieldLabel.innerHTML = fieldValue;
        }
        
        //date long format: empty value -> display date pattern
        fieldLabel = $('Show' + fieldName + '_long');
        if (fieldLabel != null ){
        	if(unformattedValue==null || unformattedValue=="") {
        		// kb# 3016317
				// do not show date pattern for read only fields
        		if(arrFieldsInformation[fieldName] != null && arrFieldsInformation[fieldName]["readOnly"] == "true"){
			     	fieldLabel.innerHTML = "";
			    } else {		
            		fieldLabel.innerHTML = strDateShortPattern;
            	}
        	}
        }
        */
        
        // try to access the read-only input
        var readOnlyField = $('Show' + fieldName + '_numeric', false);
        if (readOnlyField == null) {
            readOnlyField = $('Show' + fieldName + '_short', false);
        }
        if (readOnlyField != null) {
            readOnlyField.innerHTML = fieldValue;
        }
    },
   
    /**
     * Enables or disables input field and all corresponding buttons (Select Value etc).
     * @param {fieldName}
     * @param {enabled}
     */
    enableField: function(fieldName, enabled) {
        var field = $(fieldName, false);
        if (field != null) {
            var inputs = field.parentNode.childNodes;
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                input.disabled = !enabled;

		//disabled select value icon will not prevent clicking event being fired in Firefox???
		if(input.src){
			input.style.display=enabled? "" : "none";
		}
		if(input.className && input.className.indexOf("inputField") >= 0){
			input.className = enabled? "inputField" : "inputField_readOnly";
		}
		
            }
        }
    },
	/**
 	 * show or hide field and all corresponding buttons (Select Value etc).
     * @param {fieldName}
     * @param {fieldName}
 	 */
 	showField: function(fieldName, bShow){
 		var field = $(fieldName);
        if (field != null) {
        	this.showElement(field, bShow);	
        	var inputs = field.parentNode.childNodes;
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                this.showElement(input, bShow);	
            }
        }
 	},
	/**
     * Return the specified form field element.
     */
    getFieldElement: function(fieldName) {
        // try to access edit field
        var field = $(fieldName, false);
		return field;
    },

    
    /**
     * Shows or hides document field buttons on the form.
     */
    updateDocumentButtons: function() {
        for (var i = 0; i < this.fieldDefs.length; i++) {
            var fieldDef = this.fieldDefs[i];
            if (fieldDef.isDocument()) {
                
                var documentInput = $(fieldDef.fullName);
                documentInput.disabled = this.newRecord;
                
                var documentValue = this.getFieldValue(fieldDef.fullName);
                
                var documentExists = (documentValue != '');
                var canShow = documentExists;
                var canCheckIn = (!documentExists && !fieldDef.isReadOnly && !this.newRecord);
                var canCheckOut = (documentExists && !fieldDef.isReadOnly && !this.newRecord)
                
                this.showElement(fieldDef.fullName + '_showDocument', canShow);
                this.showElement(fieldDef.fullName + '_checkInNewDocument', canCheckIn);
                this.showElement(fieldDef.fullName + '_checkInNewDocumentVersion', canCheckOut);
                this.showElement(fieldDef.fullName + '_checkOutDocument', canCheckOut);
                this.showElement(fieldDef.fullName + '_lockDocument', canCheckOut);
                this.showElement(fieldDef.fullName + '_deleteDocument', canCheckOut);
            }
        }
    },
    

	/**
	 *  Return an array of full field names
	 *  containing the form's primary key fields
	 */
  	getPrimaryKeyFields: function() {
		var fields = new Array()
        for (var i = 0, fieldDef; fieldDef = this.fieldDefs[i]; i++) {
            if (fieldDef.isPrimaryKey) {
				fields.push(fieldDef.fullName);
			}
		}
		return fields;
	},

	/**
	 *  Return an array of field values
	 *  containing the form's primary key field values
	 */
      getPrimaryKeyFieldValues: function(ignoreEmptyValues) {
        if (!valueExists(ignoreEmptyValues)) {
            ignoreEmptyValues = false;
        }
        
        var fieldValues = new Object();
        for (var i = 0, fieldDef; fieldDef = this.fieldDefs[i]; i++) {
            var fieldName = fieldDef.fullName;
            var fieldValue = this.getFieldValue(fieldName);

            // add primary key field value UNLESS ignoreEmptyValues is set and the value is empty
            if (!ignoreEmptyValues || fieldValue != '') {
                if (fieldDef.isPrimaryKey) {
                  fieldValues[fieldName] = fieldValue;
                }
            }
        }
        return fieldValues;
    },

   // ----------------------- validation methods --------------------------------------------------
    
    /**
     * Clears previous validation result, displayed message and field highlighting.
     */
    clearValidationResult: function() {
        this.validationResult = new AFM.form.ValidationResult();
        
        // clear validation message
        var messageElement = this.getMessageElement();
        messageElement.innerHTML = "";
        YAHOO.util.Dom.removeClass(messageElement, "formMessage");
        YAHOO.util.Dom.removeClass(messageElement, "formError");
        
        // clear field highlighting for all fields
        var fieldNames = this.getFieldNames();
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            
            // clear the input element class
            var fieldInput = $(fieldName);
            var fieldInputTd = fieldInput.parentNode;
            YAHOO.util.Dom.removeClass(fieldInputTd, "formErrorInput");
            
            // remove per-field error messages
            var errorTextElements = YAHOO.util.Dom.getElementsByClassName('formErrorText', '', fieldInputTd);
            for (var e = 0; e < errorTextElements.length; e++) {
                fieldInputTd.removeChild(errorTextElements[e]);
            }
        }
        
        // both Save and Refresh clear the afm_form_values_changed flag
        afm_form_values_changed = false;
    },
    
    /**
     * Displays current validation result message in the top row,
     * and highlights invalid fields.
     */
    displayValidationResult: function(result) {
        // if JSON result object is passed in, copy its messages
        if (valueExists(result)) {
            this.validationResult.message = result.message;
            this.validationResult.detailedMessage = result.detailedMessage;
        }
        
        // display error/information message
        var messageCell = this.getMessageElement();
        var message = this.validationResult.message;
        var detailedMessage = this.validationResult.detailedMessage;
        
        if (valueExists(message) && message != '') {
            
            // remove technical part of the message if it is provided
            var separatorIndex = message.indexOf('::');
            if (separatorIndex != -1) {
                message = message.substring(0, separatorIndex);
            }
            
            // add message text
            var messageElement = null;
            if (valueExists(detailedMessage) && detailedMessage != '') {
                messageElement = document.createElement('a');
                messageElement.href = 'javascript: //';
            } else {
                messageElement = document.createElement('p');
            }
            messageElement.innerHTML = message;
            messageCell.appendChild(messageElement);
            
            // add hidden detailed message
            if (valueExists(detailedMessage) && detailedMessage != '') {
                
                var detailedMessageElement = document.createElement('p');
                detailedMessageElement.id = "detailedMessage";
                detailedMessageElement.innerHTML = detailedMessage;
                messageCell.appendChild(detailedMessageElement);
                YAHOO.util.Dom.setStyle(detailedMessageElement, 'display', 'none');
                
                YAHOO.util.Event.addListener(messageElement, 'click', this.toggleDetailedMessage, this, true);
            }
        }
        YAHOO.util.Dom.addClass(messageElement, this.validationResult.valid ? "formMessage" : "formError");
        YAHOO.util.Dom.addClass(detailedMessageElement, "formDetailedMessage");
        
        
        // highlight invalid fields
        for (var fieldName in this.validationResult.invalidFields) {
            var fieldInput = $(fieldName);
            var fieldInputTd = fieldInput.parentNode;
            YAHOO.util.Dom.addClass(fieldInputTd, "formErrorInput");
            
            // add per-field error messages
            var fieldError = this.validationResult.invalidFields[fieldName];
            if (fieldError != '') {
                var errorBreakElement = document.createElement('br');
                errorBreakElement.className = 'formErrorText';
                fieldInputTd.appendChild(errorBreakElement);
                
                var errorTextElement = document.createElement('span');
                errorTextElement.className = 'formErrorText';
                errorTextElement.appendChild(document.createTextNode(fieldError));
                fieldInputTd.appendChild(errorTextElement);
            }
        }
    },

    /**
     * Toggles the visibility of the detailed message.
     */    
    toggleDetailedMessage: function() {
        var display = YAHOO.util.Dom.getStyle('detailedMessage', 'display');
        YAHOO.util.Dom.setStyle('detailedMessage', 'display', display == 'none' ? '' : 'none');
    },
    
    /**
     * Returns a reference to the DOM element that contains message.
     */
    getMessageElement: function() {
        return YAHOO.util.Dom.getElementsByClassName("formTopSpace", "td", this.parentElement)[0];
    },
    
    // ----------------------- date/time methods ---------------------------------------------------
    
    /**
     * Creates and formats the date string for specified day, month and year.
     * @param {useIsoFormat} If true, the date is formatted using ISO format. Default = true.
     */
    formatDate: function(day, month, year, useIsoFormat) {
	    var d = FormattingDate(day, month, year, strDateShortPattern);
	    if (!valueExists(useIsoFormat) || useIsoFormat) {
	        d = getDateWithISOFormat(d);
	    }
        return d;
    }
}, {
    // ----------------------- constants -----------------------------------------------------------
    
    // name of the default WFR used to get the default record
    WORKFLOW_RULE_CLEAR: 'AbCommonResources-getDefaultDataRecord',
    
    // name of the default WFR used to get the record
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecord',
    
    // name of the default WFR used to get the record
    WORKFLOW_RULE_SAVE: 'AbCommonResources-saveDataRecord',
    
    // name of the default WFR used to delete the current record
    WORKFLOW_RULE_DELETE: 'AbCommonResources-deleteDataRecords'
});