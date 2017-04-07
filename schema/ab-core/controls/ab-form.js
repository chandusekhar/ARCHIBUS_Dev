/**
 * Declare the namespace for the form JS classes.
 */
Ab.namespace('form');


/**
 * Class that holds the form fields validation results.
 */
Ab.form.ValidationResult = Base.extend({
    
    // whether all form field values are valid
    valid: true,
    
    // validation message to be displayed
    message: '',
    
    // detailed validation message to be displayed
    detailedMessage: '',
    
    // object that contains invalid field names and associated error messages
    invalidFields: null,
    
    constructor: function() {
        this.invalidFields = {};
    }
});

/**
 * Base class for fields and field sets.
 */
Ab.form.FieldBase = Base.extend({
    // parent form panel
    panel: null,

    // original config object
    config: null,

    // Ext.util.MixedCollection of field actions
    actions: null,

    constructor: function(panel, config) {
        this.panel = panel;
        this.config = config;

        this.actions = new Ext.util.MixedCollection();
        if (valueExists(config.actions)) {
            for (var i = 0; i < config.actions.length; i++) {
                this.addAction(config.actions[i]);
            }
        }
    },

    addAction: function(config) {
        config.useExtButton = false;
        var action = new Ab.view.Action(this.panel, config);
        this.actions.add(action.id, action);
    }

});

/**
 * Wrapper for the form field UI control.
 */
Ab.form.Field = Ab.form.FieldBase.extend({
    // field DOM element
    dom: null,
    
    // Ab.data.FieldDef
    fieldDef: null,
	
	// true if the field is hidden
	hidden: false,

    // Ext.util.MixedCollection of custom event listeners for form field.
	// Collection holds function. Function code is from application js files
    docFieldEventListeners: null,    

    // true if the field should have focus on form load
    focus: false,

    // title before evaluation
    unevaluatedTitle: null,
    
    // IOAN - parent fieldSet id 
    fieldSetId: null,

    /**
     * Constructor.
     * @param panel
     * @param config
     */
    constructor: function(panel, config) {
        this.inherit(panel, config);

        this.focus = config.focus;
        this.fieldDef = new Ab.data.FieldDef(config);
		this.unevaluatedTitle = this.title;
        this.dom = this.panel.getFieldElement(this.getId());

        // attach mouse hover listener to the parent TD element, to reveal Select Value buttons
        var fieldCell = this.panel.getFieldCell(this.getId());
        if (fieldCell) {
            fieldCell.onmouseover = function() {
                Ext.get(this).addClass('hovered');
            };
            fieldCell.onmouseout = function() {
                Ext.get(this).removeClass('hovered');
            };
        }

        if (this.dom) {
            if (this.fieldDef.rowspan > 1 && this.fieldDef.format === 'Memo') {
                var labelHeight = ('top' === this.panel.labelsPosition) ? 22 : 0;
                var fieldHeight = 22;
                var cellHeight = 26;

                Ext.get(this.dom).setHeight(fieldHeight + (this.fieldDef.rowspan - 1) * (labelHeight + cellHeight));
            }

            this.dom.onkeyup = this.afterChange.createDelegate(this);
            this.dom.onkeydown = this.afterKeyDown.createDelegate(this);
        }

        if (config.isDocument) {
            // functions ARE stored within collection, not only event name, function name
            this.docFieldEventListeners = new Ext.util.MixedCollection(true);
		}
    },

    afterKeyDown: function() {
        this.panel.clearLookupFieldValue(this.getId());
    },

    /**
     * Called when the user types in the field, or selects a value in the Select Value dialog.
     */
    afterChange: function() {
        if (this.config.controlType === 'multiEdit') {
            // auto-grow height for multi-edit fields
            if (this.dom.clientHeight < this.dom.scrollHeight) {
                this.dom.style.height = this.dom.scrollHeight + "px";
                if (this.dom.clientHeight < this.dom.scrollHeight) {
                    this.dom.style.height = (this.dom.scrollHeight * 2 - this.dom.clientHeight) + "px";
                }
            }
        }
    },

    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions: function(ctx) {
        var id = this.getId();
        
        var evaluatedReadOnly = Ab.view.View.evaluateBoolean(this.config.readOnly, ctx, false);
 		if (evaluatedReadOnly != this.fieldDef.readOnly) {
	        this.fieldDef.readOnly = evaluatedReadOnly;
			this.panel.enableField(id, !evaluatedReadOnly);
		}
       
        var evaluatedHidden = Ab.view.View.evaluateBoolean(this.config.hidden, ctx, false);
		if (evaluatedHidden != this.hidden) {
	        this.hidden = evaluatedHidden;
			this.panel.showField(id, !evaluatedHidden);
		}
        
        var evaluatedTitle = Ab.view.View.evaluateString(this.config.title, ctx, false);
		if (evaluatedTitle != this.fieldDef.title) {
			this.panel.setFieldLabel(id, evaluatedTitle);
		}

		var evaluatedValue = Ab.view.View.evaluateString(this.config.value, ctx, false);
		if (evaluatedValue != this.fieldDef.value) {
	        this.fieldDef.value = evaluatedValue;
	        this.panel.record.setValue(id, evaluatedValue);
			this.setUIValue(evaluatedValue);
		}
        
        this.actions.each(function(action) {
            action.evaluateExpressions(ctx);
        });
    },
    
    /**
     * Return field id.
     */
    getId: function() {
        return this.fieldDef.id;
    },
    
    /**
     * Return field full name.
     */
    getFullName: function() {
        return this.fieldDef.fullName;
    },
    
    /**
     * Return initial value set on when the form was rendered.
     */
    getInitialValue: function() {
        return this.fieldDef.value;
    },
    
    /**
     * Return stored record field value. 
     */
    getStoredValue: function() {
        var id = this.getId();
        var index = id.indexOf('_lookupFor_');
        if (index != -1) {
            // the name of the lookup field is in the form of em.name_lookupFor_project.requestor
            // there can be multiple such fields for the same lookup database field (em.name)
            // only set the value of the first one
            var lookupFieldName = id.slice(0, index);
            if (this.panel.lookupFieldsProcessed && !valueExists(this.panel.lookupFieldsProcessed[lookupFieldName])) {
                this.panel.lookupFieldsProcessed[lookupFieldName] = true;
                id = id.slice(0, index);
            }
        }

        return this.panel.record.getValue(id);
    },

    /**
     * Sets stored record field value.
     */    
    setStoredValue: function(value) {
        this.panel.record.setValue(this.getId(), value);
    },
    
    /**
     * Return current UI field value. 
     */
    getUIValue: function() {
        return this.panel.getFieldValue(this.getId());
    },
    
    /**
     * Set UI field value.
     * @param value: field's value.
     * @param neutralValue:  field's neutral value.
     * @param doValidation: boolean - if doing any validation.
     */
    setUIValue: function(value, neutralValue, doValidation) {
        this.panel.setFieldValue(this.getId(), value, neutralValue, doValidation);
    },

    /**
     * Returns the field's instructions element.
     * @return {Element}
     */
    getInstructionsEl: function() {
        return Ext.get(this.panel.getFieldElementName(this.getId()) + '_instructionsText');
    },
    
    /**
     * Clear UI field value.
     */
    clear: function() {
        if (this.panel.isConsole && this.fieldDef.isEnum) {
			this.addAllToEnumFieldForConsole();
        }

        this.panel.setFieldTooltip(this.getId(), '');
        //XXX: don't doing validation since default values come from  DB schema
        this.setUIValue(this.getInitialValue(), null, false);
        
        if (this.fieldDef.controlType === 'image') {
            this.panel.clearImage(this.getId());
        }

        this.panel.clearLookupFieldValue(this.getId());
    },
    
    /**
     * YQ 12/01/2008 - kb3020575
     * Add "" value into Enum field for console window - This enable users to filter optionally on the enum field
     */
    addAllToEnumFieldForConsole: function(){
	     // if the empty label has not yet been added
	     if (this.dom && this.dom.firstChild && this.dom.firstChild.text != "") {
		     var newOption = document.createElement('option');
		     newOption.value = "";
	    	 newOption.appendChild(document.createTextNode(""));
	     	 this.dom.insertBefore(newOption, this.dom.firstChild);
		}
	},

    clearOptions: function() {
        if (this.fieldDef.controlType === 'comboBox') {
            for (var i = this.dom.length - 1; i >= 0; i--) {
                this.dom.remove(i);
            }
        }
    },

    /**
     * Adds a option to the combo box control.
     * @param value The option value, i.e. Com.
     * @param title The option title, i.e. Completed
     */
    addOption: function(value, title) {
        var newOption = document.createElement('option');
        newOption.value = value;
        newOption.appendChild(document.createTextNode(title));
        this.dom.appendChild(newOption);
    },

    /**
     * Removes specified options from the combo box control.
     * @param {values} An object where each key is the option name and each value is the option title.
     */
    removeOptions: function(values) {
        if (this.fieldDef.controlType === 'comboBox') {
        	for (var x in values) {
        		for (var i = this.dom.length - 1; i >= 0; i--) {
        			if (x == this.dom[i].value) {
        				this.dom.remove(i);
        				break;
        			}
        		}
            }
        }
    },
    
    /**
     * Get stored record value, format it as localized string, and display in the UI control.
     * @return formatted value.
     */
    syncToUI: function() {
        var value = this.getStoredValue();
        if (valueExists(value)) {
            var neutralValue = value;
            // format object value into localized string
            value = this.fieldDef.formatValue(value, true, false);        
            this.setUIValue(value, neutralValue);
        }
        return value;
    },
    
    /**
     * Get UI control value, parse it into an object, and store in the record.
     * @return parsed value.
     */
    syncFromUI: function() {
        var value = this.getUIValue();
        if (valueExists(value)) {
            // parse localized string into object value
            value = this.fieldDef.parseValue(value, false);
            this.setStoredValue(value);
        }
        return value;
    },
    
    /**
     * Marks this field as invalid.
     * @param {message} Message to display for the field.
     */
    setInvalid: function(message) {
        this.panel.addInvalidField(this.getId(), message);
    },

	/**
     * Registers custom event listener for this field. Specific to Document fields.
     * @param {eventName}		Event name, specific to the control type.
     * @param {listenerFunction} Function in application-specific JavaScript file handling the event. 
     * @param {scope}			Object instance scope. 
     */
    addDocumentFieldEventListener: function(eventName, listenerFunction, scope) {
		// non-document fields do not have an initialized collection
		if (!this.docFieldEventListeners) {
			return;
		}

		// eventHandler may be a function reference or a function name
		var eventHandler = null;
		if (typeof listenerFunction == 'function')
		{
			eventHandler = listenerFunction;
		}
		else {
			View.controllers.each(function (controller) {
				var func = controller[listenerFunction];
				if (valueExists(func) && func.constructor == Function) {
					eventHandler = func;
					return;
				}
			});
		}

		if (valueExists(eventHandler)) {
			// if scope is provided create a delegate within the given scope
			if (valueExists(scope)) {
                eventHandler = eventHandler.createDelegate(scope);
			}
			// insert or update
			if (this.docFieldEventListeners.containsKey(eventName)) {
				this.docFieldEventListeners.replace(eventName, eventHandler);
			} else {
				this.docFieldEventListeners.add(eventName, eventHandler);
			}
		}
		else {
			var message = 'The document field listener for event ' + eventName + ' was not found';
			View.showMessage('message', message);
		}
    },

    /**
     * Returns registered event listener function name.
     * @param {eventName}   Event name, specific to the control type.
     */
    getDocumentFieldEventListener: function(eventName) {
        return this.docFieldEventListeners.get(eventName);
    },
    
    /**
     * Removes event listener.
     * @param {Object} eventName
     */
    removeDocumentFieldEventListener: function(eventName) {
        this.docFieldEventListeners.removeKey(eventName);  
    }

});

/**
 * Wrapper for the form field set.
 */
Ab.form.FieldSet = Ab.form.FieldBase.extend({
    // Ext.util.MixedCollection of nested fields
    fields: null,

    // is the field set collapsed?
    collapsed: false,

    /**
     * Constructor.
     * @param panel
     * @param config
     */
    constructor: function(panel, config) {
        this.inherit(panel, config);

        this.fields = new Ext.util.MixedCollection();
        for (var i = 0; i < config.fieldDefs.length; i++) {
            var fieldDef = config.fieldDefs[i];
            var field = new Ab.form.Field(panel, fieldDef);
            // IOAN : set fieldSetId  for each field
            field.fieldSetId = this.config.id;
            panel.fields.add(fieldDef.id, field);
            this.fields.add(fieldDef.id, field);
        }

        var id = panel.id + '_' + config.id + '_labelCell';
        var dom = $(id);

        this.collapsible = config.collapsible;
        this.collapsed = config.collapsed;

        if (this.collapsible) {
            var imageCollapse = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-opened.png';
            var imageExpand = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-closed.png';

            dom.style.paddingLeft = '18px';

            var fieldSet = this;
            var toggleCollapsed = function() {
                fieldSet.collapsed = !fieldSet.collapsed;
                var backgroundImage = fieldSet.collapsed ? imageExpand : imageCollapse;

                dom.style.background = 'url(' + backgroundImage + ') no-repeat 0 50%';
                jQuery(dom).parent().siblings().toggle(!fieldSet.collapsed);

                panel.updateLayoutScroller();
            };

            Ext.get(id).addListener('click', toggleCollapsed);

            this.collapsed = !this.collapsed;
            toggleCollapsed();
        }
    }
});

/**
 * Form component.
 */
Ab.form.Form = Ab.view.Component.extend({
    
    // HTML form ID
    formId: '',
    
	// view definition to be displayed
	viewDef: null,
    
	// Ext.util.MixedCollection of Ab.form.Field objects
	fields: null,

    // Ext.util.MixedCollection of Ab.form.FieldSet objects
    fieldsets: null,

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
    
    // whether the form should display its field values on load
    showOnLoad: false,
    
    // data record retrieved from the server - Ab.data.Record
    record: null,
    
    // default field values
    defaultRecord: null,
    
    // current form is a console or a regular form
    isConsole: false,

    // position of form label element, either to 'left' in same table row or 'top' in previous table row
	labelsPosition: 'left',
    
    // number of columns 
    columns: 1,
	    
    // ----------------------- initialization ------------------------------------------------------
    
    /**
     * Constructor.
	 *
	 * @param id
	 * @param configObject - map with keys of (at least)  [viewDef, groupIndex, panelId] and possibly [showOnLoad, afterRefreshListener, beforeSaveListener, beforeDeleteListener,
	 *									refreshWorkflowRuleId, saveWorkflowRuleId, deleteWorkflowRuleId, clearWorkflowRuleId, useParentRestriction]
	 *						 passing map to base class with keys of (possibly)  [showOnLoad, useParentRestriction]
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'form', configObject);  
        this.viewDef = new Ab.view.ViewDef(configObject.getConfigParameter('viewDef'), configObject.getConfigParameter('groupIndex'), null, null, configObject.getConfigParameter('dataSourceId'));
        this.formId = configObject.getConfigParameter('panelId');       
                
        this.isConsole = configObject.getConfigParameter('isConsole', false);
        this.labelsPosition = configObject.getConfigParameter('labelsPosition', 'left');
        this.showOnLoad = configObject.getConfigParameter('showOnLoad', false);
        this.newRecord = configObject.getConfigParameter('newRecord', false);
        if (this.newRecord == false) {
            this.newRecord = Ab.view.View.newRecord;
        }

        // create field definitions
        this.fields = new Ext.util.MixedCollection();
        this.fieldsets = new Ext.util.MixedCollection();

        var fieldDefs = configObject.getConfigParameter('fieldDefs');
        for (var i = 0; i < fieldDefs.length; i++) {
            var fieldDef = fieldDefs[i];
            if (fieldDef) {
	        	if ('fieldset' === fieldDef.type) {
	                this.fieldsets.add(fieldDef.id, new Ab.form.FieldSet(this, fieldDef));
	        	} else {
	                this.fields.add(fieldDef.id, new Ab.form.Field(this, fieldDef));
		        }
            }
        }
        
        // store initial field values        
        this.record = new Ab.data.Record(this.getFieldValues());
        this.defaultRecord = new Ab.data.Record(this.getFieldValues());
        
        // add specified event listeners
        this.addEventListenerFromConfig('beforeSave', configObject);
        this.addEventListenerFromConfig('beforeDelete', configObject);
        this.addEventListenerFromConfig('onAutoCompleteClear', configObject);
        this.addEventListenerFromConfig('onAutoCompleteQuery', configObject);
        this.addEventListenerFromConfig('onAutoCompleteSelect', configObject);

        this.refreshWorkflowRuleId = configObject.getConfigParameterNotEmpty('refreshWorkflowRuleId',
            Ab.form.Form.WORKFLOW_RULE_REFRESH);        
		this.saveWorkflowRuleId = configObject.getConfigParameterNotEmpty('saveWorkflowRuleId', 
            Ab.form.Form.WORKFLOW_RULE_SAVE);
		this.deleteWorkflowRuleId = configObject.getConfigParameterNotEmpty('deleteWorkflowRuleId', 
            Ab.form.Form.WORKFLOW_RULE_DELETE);
		this.clearWorkflowRuleId = configObject.getConfigParameterNotEmpty('clearWorkflowRuleId', 
            Ab.form.Form.WORKFLOW_RULE_CLEAR);
        
        this.updateDocumentButtons();
        
        this.visible = true;
        
        this.columns = configObject.getConfigParameter('columns', 1);
    },
    
    // ------------------------ common control API methods -----------------------------------------

    /**
     * Returns the Ext element that can be resized to match the region height and scrolled.
     * Form layout is fixed and should not be resized. The region itself will auto-scroll.
     */
    getScrollableEl: function() {
        return null;
    },

    /**
     * Returns parent element ID. By default, the parent element ID is the same as the control ID.
     */
    getParentElementId: function() {
        return this.id + '_body';
    },
    
    /**
     * Performs initial data fetch from the server to display the control after the view is loaded. 
     */
    initialDataFetch: function() {
        if (this.isConsole) {
            this.clear();
        } else if ((this.showOnLoad || this.restriction != null || this.newRecord) && 
                    this.viewDef.dataSourceId != 'none') {
            this.refresh();
        }
        this.show(this.showOnLoad);

        var autoComplete = new Ab.form.AutoComplete();
        autoComplete.addAutoCompleteToFormFields.defer(1000, autoComplete, [this]);
    },

    /**
     * Shows or hides the control.
     * @param {show} If true or undefined shows the control, if false hides the control.
     * @param {includeHeader} If true, shows or hides the panel header bar as well (optional).
     */
    show: function(show, includeHeader) {
        this.inherit(show, includeHeader);

        if (this.visible) {
            this.setFocusField.defer(500, this);
        }
    },

    /**
     * Sets the initial focused field.
     */
    setFocusField: function() {
        var firstFocusField = this.fields.find(function(field) {
            return (field.focus);
        });

        if (firstFocusField) {
            var focusInput = this.getFieldElement(firstFocusField.getId());
            if (focusInput) {
                focusInput.focus();
            }
        }
    },

    /**
     * Clears the control UI state.
     */
    clear: function() {
        this.fields.each(function(field) {
            field.clear();
        });

        this.defaultRecord = new Ab.data.Record(this.getFieldValues());
        
        this.clearValidationResult();

        if (!View.supportsPlaceholders()) {
            Placeholders.create();
        }
    },
    
    /**
     * Creates evaluation context with references to the view and this panel.
     */
    createEvaluationContext: function() {
        var ctx = this.inherit();
        ctx['record'] = this.record.values;
        return ctx;
    },

    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions: function(ctx) {
		this.inherit();
		if (!ctx) {
			ctx = this.createEvaluationContext();
		}

        this.fields.each(function(field) {
            field.evaluateExpressions(ctx);
        });
        
        this.updateDocumentButtons();
    },
    
    /**
     * Refreshes the control UI state, possibly by obtaining data from the server.
     */
    doRefresh: function() {
        this.clear();
        this.clearValidationResult();
        
        var workflowRuleName = (this.newRecord == true) ? this.clearWorkflowRuleId : this.refreshWorkflowRuleId;
        
        // retrieve record data from the server
        try {
            var result = Workflow.call(workflowRuleName, this.getParameters(false));
           
		    var record = this.getDataSource().processInboundRecord(result.dataSet);
			this.setRecord(record);
            
            // show the control
            this.show(true);
		} catch (e) {
		    this.validationResult.valid = false;
		    this.displayValidationResult(e);
		}

        // fill in default values
        if (this.newRecord) {
            this.fields.eachKey(function(fieldName) {
                var defaultValue = this.defaultRecord.getValue(fieldName);      
                if (valueExistsNotEmpty(defaultValue)) {	
                	var fieldDef = this.fields.get(fieldName).fieldDef;
                	if (fieldDef.isEnum) {
                        // KB 3023304: default enumerated value is always retrieved from the server
                		// KB 3024694: unless a value is explicitly set in AXVW
                		var isFirstEnumValue = true;
                		for (var enumKey in fieldDef.enumValues) {
                			// do not set the value if it matches the first enumerated value
                			// (this happens if the value is not defined in AXVW)
                		    if (enumKey === defaultValue && !isFirstEnumValue) {
                		    	this.setFieldValue(fieldName, defaultValue);
                		    	break;
                		    }
                		    isFirstEnumValue = false;
                		}
                	} else if (!fieldDef.isNumber() || defaultValue > 0) {
                        // KB 3021389, 3022631 - do not set the numeric field's default value if it is 0,
                        // as the value has been reset in setRecord(record).
                        this.setFieldValue(fieldName, defaultValue);
                    }
                }
            }, this);
        } else {
            this.updateLookupFieldValues();
        }

        if (!View.supportsPlaceholders()) {
            Placeholders.refresh();
        }
    },
    
    /**
     * Saves the changed data to the database.
     */
    save: function(workflowRuleId) {
        if (!valueExists(workflowRuleId)) {
            workflowRuleId = this.saveWorkflowRuleId;
        }
        if (this.canSave()) {
            try {
                var result = Workflow.call(workflowRuleId, this.getParameters(true));
    		    if (valueExists(result.dataSet)) {
    		    	//XXX: new record save will return result.dataSet as object
                    var record = this.getDataSource().processInboundRecord(result.dataSet);
        	        this.setRecord(record);
        	        this.newRecord = false;
        	        this.refresh(this.getPrimaryKeyRestriction());
        		    this.displayValidationResult(result);
    		    }else{
    		        this.updateOldFieldValues();
    		    	// XXX: not new record will return result.dataSet as undefined
    		    	this.newRecord = false;
    		    	// XXX: presenting result.message to UI
    		    	this.displayValidationResult(result);
    		    }
    		} catch (e) {
    		    this.validationResult.valid = false;
    		    this.displayValidationResult(e);
    		}
        }
            
        // return false (stop chained command execution) if validation or save has failed
        return this.validationResult.valid;
    },

    /**
     * Checks whether the record can be saved.
     */
    canSave: function() {
        this.clearValidationResult();
        
        var beforeSaveListener = this.getEventListener('beforeSave');
        if (beforeSaveListener) {
            var proceed = beforeSaveListener(this);
            if (valueExists(proceed) && proceed == false) {
                this.validationResult.valid = false;
                this.displayValidationResult();
                // stop chained command execution
                return false;
            }
        }
        //XXX: don't show each individual field validation message to avoid duplicated messages
        return this.validateFields(false);
    },
    
    
    /**
     * Deletes the current form record.
     */
    deleteRecord: function() {
        this.clearValidationResult();
 
        // call user-defined callback function
        var beforeDeleteListener = this.getEventListener('beforeDelete');
        if (beforeDeleteListener) {
            var proceed = beforeDeleteListener(this);
            if (valueExists(proceed) && proceed == false) {
    		    this.validationResult.valid = false;
    		    this.displayValidationResult();
    		    // stop chained command execution
                return false;
            }
        }
        
        var parameters = this.getParameters(true);
        parameters.fieldValues = parameters.oldFieldValues;

        // call WFR to save form values        
        var result = Workflow.runRuleAndReturnResult(
            this.deleteWorkflowRuleId, 
            parameters,
            this.afterDelete,
            this);
		if (result.code == 'executed') {
		    this.displayValidationResult(result);
		} 
		else {
		    this.validationResult.valid = false;
		    this.displayValidationResult(result);
		}
            
        // return false (stop chained command execution) if delete has failed
        return this.validationResult.valid;
    },

    /**
     * Returns record with current form field values.
     * @return Ab.data.Record
     */
    getRecord: function() {
        this.fields.each(function(field) {
            field.syncFromUI();
        });
        return this.record;  
    },
    
    /**
     * Sets this form record and displays converted record values in UI controls.
     * @param {record} Ab.data.Record
     */
    setRecord: function(record) {
        this.record = record;
        this.onModelUpdate();
    },

    /**
     * Clears visible content and displays the current record values.
     */
    onModelUpdate: function() {
        this.lookupFieldsProcessed = {};
        this.fields.each(function(field) {
            field.syncToUI();
        });

        // show or hide document buttons
        this.updateDocumentButtons();

        // force view-wide expression evaluation
        //View.evaluateExpressions();
        
        // use panel-wide expression evaluation instead 
        this.evaluateExpressions(); 

        var message = String.format('Form model updated: {0}', this.id);
        View.log(message);
    },
    
    // -----------------------currency or unit text -------------------------
    /**
     * Add description text as the red label following the targeted field.
     * 
     * fieldId: field id (generally it will be same as field full name).
     * descriptionTxt: description text.
     * 
     */
    showFieldDescription: function(fieldId, descriptionTxt) {
		var descriptionTxtElId = fieldId + '_descriptionText';
		var descriptionTxtEl = Ext.get(descriptionTxtElId);
		if(descriptionTxtEl === null){
			var fieldEl = this.getFieldElement(fieldId);
			var brEl = Ext.DomHelper.insertAfter(fieldEl, {
				tag: 'br'
		    }, true);
			
			descriptionTxtEl = Ext.DomHelper.insertAfter(brEl, {
				tag: 'span', 
				id: descriptionTxtElId, 
				cls: 'showingDateAndTimeLongFormat'
		    }, true);
		}
		
		descriptionTxtEl.dom.innerHTML = descriptionTxt;
    },
    
    // ----------------------- implementation ------------------------------------------------------
    
    /**
     * Validates all field values and highlights all errors.
     * @param showFieldValidationMessage: boolean - if showing individual field's validation message.
     * @return true if validation was successful, false otherwise.
     */
    validateFields: function(showFieldValidationMessage) {
    	if(!valueExists(showFieldValidationMessage)){
    		showFieldValidationMessage = true;
    	}
        this.fields.eachKey(function(fieldName) {
            var fieldInput = this.getFieldElement(fieldName);
            var field = this.fields.get(fieldName);
            if (valueExists(fieldInput) && field && !field.hidden) {
                var isValid = this.validateField(fieldName, true, showFieldValidationMessage);
                if (!isValid) {
                    this.addInvalidField(fieldName, '');
                }
            }
        }, this);
        
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
        this.validationResult.message = Ab.view.View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
        this.validationResult.invalidFields[fieldName] = fieldError;
    },
    
    /**
     * Returns Ab.data.Record containing new and old values, in the ARCHIBUS locale-neutral format.
     * This record can be passed as a parameter to custom workflow rules.
     */
    getOutboundRecord: function() {
        var record = new Ab.data.Record();
        record.isNew = this.newRecord;
        record.values = this.getFieldValues(true);
        record.oldValues = this.getOldFieldValues();
        return this.getDataSource().processOutboundRecord(record);
    },
    
    /**
     * Returns parameters for the workflow rule.
     */
    getParameters: function(includeFieldValues) {
        var parameters = {
            viewName:    this.viewDef.viewName,
			groupIndex:  this.viewDef.tableGroupIndex,
            controlId:   this.id,
            controlType: this.type,
            isNewRecord: this.newRecord,
            version:     Ab.view.View.version
        };
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }
        if (this.viewDef.dataSourceId != null) {
			parameters.dataSourceId = this.viewDef.dataSourceId;
		}
		if (includeFieldValues) {
            parameters.fieldValues = toJSON(this.getFieldValues(true));
            parameters.oldFieldValues = toJSON(this.getOldFieldValues());
        }

        Ext.apply(parameters, this.parameters);

        return parameters;
    },

    /**
     * Returns an SQL expression to be used as a query parameter for a single or multiple fields values.
     *
     * @param fieldName The field name.
     * @return {String} The SQL expression. If the field value is empty, returns IS NOT NULL.
     */
    getFieldQueryParameter: function(fieldName) {
        var queryParameter = " IS NOT NULL";

        if (this.hasFieldMultipleValues(fieldName)) {
            var values = this.getFieldMultipleValues(fieldName);
            queryParameter = " IN ('" + values.join("','") + "')";
        } else {
            var value = this.getFieldValue(fieldName);
            if (value) {
                queryParameter = " = '" + value + "'";
            }
        }

        return queryParameter;
    },

    /**
     * Returns Ab.view.Restriction based on the non-empty field values.
     */
    getFieldRestriction: function() {
        var restriction = new Ab.view.Restriction();
        var form = this;

        this.fields.each(function(field) {
            var value = field.getUIValue();
            if (field.fieldDef.type === 'java.lang.Double'){
            	value = field.fieldDef.formatValue(value, false, false);
          	}
            if (valueExistsNotEmpty(value)) {
            	var fieldName = field.getFullName();
                if (form.isLookupField(fieldName)) {
                    // do not include lookup fields in restrictions
                } else if (form.hasFieldMultipleValues(fieldName)) {
            		restriction.addClause(fieldName, form.getFieldMultipleValues(fieldName), 'IN');
            	} else {
                    if (value === 'NULL' || value === 'NOT NULL') {
                        restriction.addClause(fieldName, null, 'IS ' + value);
                    }
                    else {
                        restriction.addClause(fieldName, value, field.fieldDef.op);
                    }
            	}
            }
        });
        return restriction;
    },

    /**
     * Copies clause values from the restriction into form fields.
     * @param restriction Ab.view.Restriction.
     */
    setFieldRestriction: function(restriction) {
        var form = this;

        this.fields.each(function(field) {
            var id = field.getId();
            var clause = restriction.findClause(id);
            if (clause) {
                form.setFieldValue(id, clause.value);
            } else {
                form.setFieldValue(id, '');
            }
        });
    },
    
    /**
     * Returns an object containing all form field values (unformatted).
     */
    getFieldValues: function(includeEmptyValues) {
        includeEmptyValues = includeEmptyValues || false;
        
        var fieldValues = {};
        this.fields.each(function(field) {
            //YS: KB 3021139, 3021138, and 3019543 (to support hidden time fields, renderHiddenField() of PanelSimpleTag.java
            //is also updated to include stored-value input)
            /*if (field.hidden) {
                value = field.getStoredValue();
                // KB 3019543: for hidden fields set using setFieldValue()
                if (value == null) {
                    value = field.getUIValue();
                }
                if (value != null) {
                    value = field.fieldDef.formatValue(value, false);
                }
            } else {
                value = field.getUIValue();
            }*/
            	
            //KB3024142-skip special fields with controlType="..." ("link" case is ok in form???)
            if (valueExists(field.fieldDef) && valueExists(field.fieldDef.controlType) && valueExists(field.fieldDef.controlType) &&  field.fieldDef.controlType != 'image'){
            	var value = field.getUIValue();  
	            if ((includeEmptyValues && valueExists(value)) || valueExistsNotEmpty(value)) {
	                fieldValues[field.getId()] = value;
	            }
            }
        });
        return fieldValues;
    },

    /**
     * Returns true if the user has entered at least one field value.
     */
    hasFieldValues: function() {
        var result = false;
        this.fields.each(function(field) {
            var value = field.getUIValue();            
            if (valueExistsNotEmpty(value)) {
                result = true;
            }
        });
        return result;
    },
     
    /**
     * Returns an object containing old field values retrieved from the server.
     */
    getOldFieldValues: function() {
        var oldValues = {};
        this.fields.each(function(field) {
            var value = field.getStoredValue();
            if (value != null) {
                value = field.fieldDef.formatValue(value, false);
                oldValues[field.getId()] = value;
            }
        });
        return oldValues;
    },
    
    /**
     * Copies the current field values into the old values.
     */
    updateOldFieldValues: function() {
        this.fields.each(function(field) {
            var value = field.getUIValue();
            if (value != null) {
                value = field.fieldDef.formatValue(value, false);
                field.setStoredValue(value);
            }
        });
    },
    
    /**
     * Returns true if the form contains specified field. 
     */
    containsField: function(fieldName) {
    	return (this.getFieldElement(fieldName) != null);
    },
    
    /**
     * Returns specified form field value.
     */
    getFieldValue: function(fieldName) {
        //XXX: JSON doesn't need encoding of five XML special characters
        //convertFromXMLValue() defined in common.js to decode XML's five special characters
        //getInputValue() defined in edit-forms.js to encode XML's five special characters
        var value = '';
        var fieldElement = this.getFieldElement(fieldName);
        if (fieldElement != null && valueExists(fieldElement.value)) {
            // do not return the placeholder value that in IE is the same as the field value
            var placeholder = fieldElement.getAttribute('placeholder') || '';
            if (placeholder.toUpperCase() === fieldElement.value.toUpperCase()) {
                value = '';
            } else {
                value = trim(fieldElement.value);
            }

            var field = this.fields.get(fieldName);
            var type = field.fieldDef.type.toUpperCase();
            var format = field.fieldDef.format.toUpperCase();
            
            value = convertFieldValueIntoValidFormat(type, format, value);
            if (type != "JAVA.SQL.TIME") {
                value = convert2validXMLValue(value);
            } else {
                var fieldEl = this.getFieldElement(fieldName, "Stored");
                if (fieldEl) {
                    value = fieldEl.value;
                }
            }
            
            value = convertFromXMLValue(value);
        
        } else {
            // not a simple field - try getting radio buttons
            var form = document.forms[this.formId];
            var buttonGroupName = this.getFieldElementName(fieldName);
            var buttonGroup = form[buttonGroupName];
            if (buttonGroup) {
                for (var i = 0; i < buttonGroup.length; i++) {
                    if (buttonGroup[i].checked) {
                        value = buttonGroup[i].value;
                        break;
                    }
                }
            }
        }

        return value;
    },

    /**
     * Returns selected checkbox values.
     */
    getCheckboxValues: function(fieldName) {
        var values = [];

        var form = document.forms[this.formId];
        var buttonGroupName = this.getFieldElementName(fieldName);
        var buttonGroup = form[buttonGroupName];
        if (buttonGroup) {
        	if(buttonGroup.length){
        		 for (var i = 0; i < buttonGroup.length; i++) {
                     if (buttonGroup[i].checked) {
                         values.push(buttonGroup[i].value);
                     }
                 }
        	}else if(buttonGroup.checked){
        		values.push(buttonGroup.value);
        	}
        }

        return values;
    },
    
    /**
     * Clears check box.
     */
    clearCheckbox: function(fieldName){
    	  var form = document.forms[this.formId];
          var buttonGroupName = this.getFieldElementName(fieldName);
          var buttonGroup = form[buttonGroupName];
          if (buttonGroup) {
        	  if(buttonGroup.length){
	              for (var i = 0; i < buttonGroup.length; i++) {
	                  buttonGroup[i].checked = false;
	              }
        	  }else{
        		  buttonGroup.checked = false;
        	  }
          }
    },
    
    
    /**
     * Sets specified option to be checked or not.
     */
    setCheckbox: function(fieldName, value, checked){
    	 var form = document.forms[this.formId];
         var buttonGroupName = this.getFieldElementName(fieldName);
         var buttonGroup = form[buttonGroupName];
         if (buttonGroup) {
        	 if(buttonGroup.length){
	             for (var i = 0; i < buttonGroup.length; i++) {
	            	   if (buttonGroup[i].value === value) {
	            		   buttonGroup[i].checked = checked;
	            		   break;
	            	   }
	             }
        	 }else{
        		 buttonGroup.checked = checked;
        	 }
         }
    },
    
    /**
     * Set field's value.
     * @param fieldName: field name.
     * @param localizedValue: localized value.
     * @param neutralValue: neutral Value.
     * @param doValidation: boolean - if doing validation.
     */
    setFieldValue: function(fieldName, localizedValue, neutralValue, doValidation) {
        if (!valueExists(neutralValue)) {
            neutralValue = localizedValue;
        }
        if (!valueExists(doValidation)) {
        	doValidation = true;
        }
        // try to access edit field
        var fieldEl = this.getFieldElement(fieldName);
        if (fieldEl != null) {
            if (fieldEl.tagName == 'SELECT') {
				if (valueExistsNotEmpty(neutralValue)) {
					this.setInputValue(fieldName, neutralValue, doValidation);
				} else {
					fieldEl.selectedIndex = 0;
				}
                
            } else {
                // clear the old field value - otherwise if new value is empty, 
                // the setInputValue() will keep the old value in the field
                fieldEl.value = '';
                
                // KB 3016326, 3019254
                // for date/time field, we need to use the unformatted value 
                // and the formatting takes place in Converting Date/Time function in date-time.js file
                var field = this.fields.get(fieldName);
                var type = field.fieldDef.type.toUpperCase();
                var format = field.fieldDef.format.toUpperCase();
                if (type === 'JAVA.SQL.TIME') {
                    // unformatted value could be like "2007-11-15 18:45:46.0" => time value must like "18:45:46"
                    neutralValue = '' + neutralValue;
                    var timeValue = neutralValue.substring(neutralValue.indexOf(":")-2);
                    timeValue = timeValue.substring(0, 8);
                    this.setInputValue(fieldName, timeValue, doValidation); 
                } else if(type === 'JAVA.SQL.DATE'){
                	 this.setInputValue(fieldName, '' + localizedValue, doValidation);
                	 if(valueExistsNotEmpty(localizedValue)){
                		 var temp_date_array = [];
                		 if(localizedValue.getMonth){
                			 localizedValue = getIsoFormatDate(localizedValue);
                		 }
                		 
                		 if(isBeingISODateFormat(localizedValue)){
                			 var temArray = localizedValue.split("-");
                			 temp_date_array['year'] = temArray[0];
                			 temp_date_array['month'] = temArray[1];
                			 temp_date_array['day'] = temArray[2];
                		 }else{
                			 temp_date_array = gettingYearMonthDayFromDate(localizedValue);
                		 }
                	
                    	 localizedValue = FormattingDate(temp_date_array["day"], temp_date_array["month"], temp_date_array["year"], strDateShortPattern);
                 	}
                }else {
            	    this.setInputValue(fieldName, '' + localizedValue, doValidation);
            	    //XXX: 
            	    if(format=='MEMO' && valueExistsNotEmpty(localizedValue)){
            	        localizedValue = localizedValue.replace(/\r\n/g, "<br/>");
            	        localizedValue = localizedValue.replace(/\n/g, "<br/>");
            	        //if(microsoftIEBrowser){
                            // This causes text area fields to have height of 1px in dialogs.
            	        	// fieldEl.style.height = fieldEl.offsetHeight;
            	        //}
            	    }
                }
            }
        } else {
            // not a simple field - try radio buttons
            var form = document.forms[this.formId];
            var buttonGroupName = this.getFieldElementName(fieldName);
            var buttonGroup = form[buttonGroupName];
            if (buttonGroup) {
                for (var i = 0; i < buttonGroup.length; i++) {
                    buttonGroup[i].checked = (buttonGroup[i].value === neutralValue);
                }
            }
        }
      
        // try to access the text label (for date and time)
        var fieldLabel = this.getFieldElement(fieldName, 'Show');
        if (fieldLabel != null) {
            fieldLabel.innerHTML = localizedValue;
        }
        
        // try to access the read-only input
        var readOnlyField = this.getFieldElement(fieldName + '_numeric', 'Show');
        if (readOnlyField == null) {
            readOnlyField = this.getFieldElement(fieldName + '_short', 'Show');
        }
        if (readOnlyField != null) {
            readOnlyField.innerHTML = localizedValue;
        }

        this.updateLookupFieldValue(fieldName);
    },
   
    /**
     * Sets form field value in locale-dependent format.
     * @param {fieldName}   Fully-qualified name of the input field, i.e. wr.date_created.
     * @param {fieldValue}  Value to be set, in locale-neutral format.
     * @param {doValidation}  boolean - if doing field's validation.
     * @return  True if the field has been set, false otherwise.
     */
    setInputValue: function(fieldName, fieldValue, doValidation) {
    	if (!valueExists(doValidation)) {
        	doValidation = true;
        }
        // decode special characters previously encoded by getInputValue()
        var field = this.fields.get(fieldName);
        var fieldDef = field.fieldDef;
        
        var type = fieldDef.type.toUpperCase();
        if (type != "JAVA.SQL.DATE" && type != "JAVA.SQL.TIME") {
            fieldValue = convertFromXMLValue(fieldValue);
        }
        
        var fieldEl = this.getFieldElement(fieldName);
        fieldEl.value = fieldValue;
        field.afterChange();
        
        if(doValidation){
        	  this.validateField(fieldName, false);
        }
      
        if (type == "JAVA.SQL.DATE"){
            //"YYY-MM-DD"
            var dateArray = [];
            if (valueExistsNotEmpty(fieldValue)){
                //isBeingISODateFormat() in date-time.js
                if (isBeingISODateFormat(fieldValue)){
                    dateArray = fieldValue.split("-");
                } else {
                    //gettingYearMonthDayFromDate() in date-time.js
                    var temp_date_array = gettingYearMonthDayFromDate(fieldValue);
                    dateArray[0] = temp_date_array["year"];
                    dateArray[1] = temp_date_array["month"];
                    dateArray[2] = temp_date_array["day"];
                }
                validationAndConvertionDateInput(fieldEl, fieldEl.name, dateArray, fieldDef.required, true, true);
            } else {
                validationAndConvertionDateInput(fieldEl, fieldEl.name, null, "false", true, false);
            }
        } else if (type == "JAVA.SQL.TIME"){
            //"HH:MM"
            var timeArray = null;
            if (valueExistsNotEmpty(fieldValue)) {
                timeArray = fieldValue.split(":");
            }
            validationAndConvertionTimeInput(fieldEl, fieldEl.name, timeArray, "false", true, true);
        }
        return true;
    },
    
    /**
     * Returns true if the user has entered multiple values into specified field, 
     * or false if the user has entered a single value or no value.
     */
    hasFieldMultipleValues: function(fieldName) {
        var fieldValue = this.getFieldValue(fieldName);
        
        return (fieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
    },
    
    /**
     * Returns an array of strings, containing values the user entered into specified field. 
     * by default unique=true, returns unique values.
     * If the user has entered a single value, the array has one element. 
     * If the user has entered no value, the array is empty.
     */
    getFieldMultipleValues: function(fieldName, unique) {
    	var values;
    	if(!valueExists(unique)){
    		unique = true;
    	}
    	var fieldValue = this.getFieldValue(fieldName);
    	if (this.hasFieldMultipleValues(fieldName)) {
    		values = fieldValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    		if(unique){
    			values = this.getFieldUniqueMultipleValues(values);
    		}
    	} else {
    		values = [];
    		values.push(fieldValue);
    	}
    	
    	return values;
    },
    /**
     * Returns a new array to hold unique values.
     */
    getFieldUniqueMultipleValues: function (values){
    	var n = {},r=[];
    	for(var i = 0; i < values.length; i++) {
    		if (!n[values[i]]) {
    			n[values[i]] = true; 
    			r.push(values[i]); 
    		}
    	}
    	return r;
    },
   
    /**
     * Saves specified array of values into the field.
     */
    setFieldMultipleValues: function(fieldName, values) {
    	var fieldValue = values.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    	this.setFieldValue(fieldName, fieldValue);
    },

    /**
     * Sets specified field label text.
     */
	setFieldLabel: function(fieldName, fieldLabel) {
		var labelCell = this.getFieldLabelElement(fieldName);
		if (labelCell != null ) {
			labelCell.innerHTML = fieldLabel
			
		} else {
	        // try to access the text label (for date and time)
	        fieldEl = this.getFieldElement(fieldName, 'Show');
			if (fieldEl != null) {
				fieldEl.parentNode.parentNode.firstChild.innerHTML = fieldLabel
			}
       }
	},
	
	/**
	 * Sets field tooltip text.
	 */
	setFieldTooltip: function(fieldName, tooltipText) {
		var id = this.getFieldElementName(fieldName, '');

		// remove previous tooltip
		Ext.QuickTips.unregister(id);

        // replace multiple value separators by spaces
        // NB: if Ab.form.Form.MULTIPLE_VALUES_SEPARATOR changes, must change the following regex
        tooltipText = tooltipText.replace(/\^/g, " ");

        tooltipText = replaceHTMLPlaceholders(tooltipText);

        // add new tooltip, if not empty
		if (tooltipText != '') {
	        Ext.QuickTips.register({
	            target: id,
	            text: tooltipText
	        });            
		}
	},

	toUpperCase: function(fieldEl){
    	 var value = fieldEl.value;
    	 if(valueExistsNotEmpty(value)){
    		 fieldEl.value = value.toUpperCase();
    	 }
	},
	
	/**
	 * Validate specified field's user input.
	 * @param fieldName: field name.
	 * @param bCheckRequiredFields: boolean - if check required fields. 
	 * @param showFieldValidationMessage: boolean - if showing this field's validation message.
	 */
    validateField: function(fieldName, bCheckRequiredFields, showValidationMessage) {
		if (!valueExists(showValidationMessage)) {
			showValidationMessage = true;
        }
        var bReturned = true;
        
        var fieldEl = this.getFieldElement(fieldName);
        if (fieldEl != null){
            var field = this.fields.get(fieldName).fieldDef;
            
            var maxsize   = field.size;
            var format    = field.format.toUpperCase();
            var type      = field.type.toUpperCase();
            var decimal   = field.decimals;
            var required  = field.required;
            var multiple  = (field.selectValueType === 'multiple');
            
            //don't work on any enumeration fields
            if (!field.isEnum) {
                //all validation functions are in inputs-validation.js
                //check integer
                if (type == "JAVA.LANG.INTEGER") {
                	bReturned = validationIntegerOrSmallint(fieldEl, showValidationMessage, field);
                     
                } else if (type == "JAVA.LANG.DOUBLE" || type == "JAVA.LANG.FLOAT") {
                	var defaultValue = '';
                	if(valueExistsNotEmpty(field.defaultValue) && field.defaultValue != 'null' && field.defaultValue != 'NULL'){
                		defaultValue = field.formatValue(field.defaultValue, true);
                	}
                	 bReturned = validationNumeric(fieldEl, decimal, showValidationMessage, defaultValue, field);   
                }
                
                if(field.isUpperCase()){
                	this.toUpperCase(fieldEl);
                }
              
                if (format === "UPPERALPHANUM") {
                	 bReturned = validationUPPERALPHANUMString(fieldEl.value, showValidationMessage, field);
                } else if (format === "UPPERALPHA") {
                	 bReturned = validationUPPERALPHAString(fieldEl.value, showValidationMessage, field);
                } 
                
                // check required fields
                if (bCheckRequiredFields && (!validationRequiredField(fieldEl, required ? "true" : "false"))) {
                    bReturned = false;
                }
                
            	if(bReturned){
	                // validate user's input aginst field's maxValue and minValue.
	                if(type == "JAVA.LANG.INTEGER" || type == "JAVA.LANG.DOUBLE" || type == "JAVA.LANG.FLOAT"){
	                	bReturned = doMaxAndMinValidation(fieldEl.value, field, showValidationMessage);
	                }
            	}
                
                if(bReturned){
	                // validate user's input aginst field's schema storage limitation (skip date and time fields, skip multiple-value fields)
	                if (type != "JAVA.SQL.DATE" && type != "JAVA.SQL.TIME" && !multiple) {
	                	bReturned = validationDataMaxSize(fieldEl, field, showValidationMessage);
	                }
                }
            }
        }
        return bReturned;
    },
   
    /**
     * Enables or disables input field and all corresponding buttons (Select Value etc).
     * @param {fieldName}
     * @param {enabled}
     */
    enableField: function(fieldName, enabled) {
        var fieldEl = this.getFieldElement(fieldName);
        if (fieldEl != null) {
        	var field = this.fields.get(fieldName);
            var inputs = [];
        	// IOAN if is fieldset disable just selected field
        	if(this.fieldsets.length > 0 
        			&& valueExistsNotEmpty(field.fieldSetId)){
        		inputs.push(fieldEl);
        	}else{
        		inputs = fieldEl.parentNode.childNodes;
        	}

            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];

                if (input.type === 'hidden' || !valueExists(input.type)) {
					// ignore non-inputs
				} else {
                	if(input.tagName === 'SELECT'){
                		input.disabled = !enabled;
                	} else {
                		input.readOnly = !enabled;
                	}	
                }
			}

            this.enableFieldHover(fieldName, enabled);
		}
        this.enableFieldActions(fieldName, enabled);
    },
    
    /**
     * Enables or disables mouse hover events for the field.
     * @param {fieldName}
     * @param {enabled}
     */
    enableFieldHover: function(fieldName, enabled) {
        var fieldEl = this.getFieldElement(fieldName);
        if (fieldEl != null) {
            var field = this.fields.get(fieldName);
        	// IOAN if fieldset has other visible fields don't remove on hover event
        	if(this.fieldsets.length > 0 
        			&& valueExistsNotEmpty(field.fieldSetId)){
        		enabled = this.hasVisibleFields(field.fieldSetId);
        	}

        	if (enabled) {
                Ext.get(fieldEl.parentNode).removeClass('nohover');
            } else {
                Ext.get(fieldEl.parentNode).addClass('nohover');
            }
        }
    },

    /**
     * Enables or disables action buttons of input field.
     * @param {fieldName}
     * @param {enabled}
     */
    enableFieldActions: function(fieldName, enabled) {
		var field = this.fields.get(fieldName);
		if (field != null) {
			field.actions.each(function(action) {
				action.enable(enabled);
			});

            this.enableFieldHover(fieldName, enabled);
		}
    },

    /**
     * Shows or hides input field and all corresponding buttons (Select Value etc).
     * @param {fieldName}
     * @param {show}
     */
    showField: function(fieldName, show) {
        var fieldEl = this.getFieldElement(fieldName);
        if (fieldEl != null) {
            var parent = fieldEl.parentNode;
 
             if (this.fieldsets.length > 0) {
            	parent = fieldEl;
            	var selectValue = this.getFieldElement(fieldName + '_selectValue');
            	if (selectValue) {
            		this.showElement(selectValue, show);
            	}
            	// check if is fluid fieldset 
            	if (jQuery(parent.parentElement.parentElement).hasClass('fieldsetFluid')) {
                    // show or hide the field label in the fluid fieldset
                	// 05-05-2015 IOAN add check for node type - when showLabel = false is not working
            		if (parent.previousSibling && parent.previousSibling.previousSibling 
            				&& parent.previousSibling.previousSibling.tagName.toUpperCase() == 'SPAN') {
            			this.showElement(parent.previousSibling.previousSibling, show);
            		}
            	}else{
            		this.showElement(parent.parentElement.parentElement, show);
            	}
            } else if (this.columns < 2) {
            	while (parent.tagName != 'tr' && parent.tagName != 'TR' && parent.parentNode) {
                	parent = parent.parentNode;
            	}
            }
             //comment out the following due to KB#3040467
          // } else {
            	//this.showElement(parent.previousSibling, show);
          // }
            
            this.showElement(parent, show);

			// if label is not in same table row show/hide label (previous sibling)
			//if (this.labelsPosition == 'top') {
			var labelElement = this.getFieldLabelElement(fieldName);
			if(labelElement){
				this.showElement(labelElement, show);
			}
			//}

            // suppress Select Value on hover if the field is hidden
            // KB 3040750: suppress Select Value on hover if the action is disabled
            var field = this.fields.get(fieldName);
            if (show) {
                if (field) {
                    var firstAction = field.actions.get(0);
                    if (!firstAction || firstAction.enabled) {
                        this.enableFieldHover(fieldName, show);
                    }
                }
            } else {
        		this.enableFieldHover(fieldName, show);
            }
        }
    },
    
    // check if fieldset has visible fields
    hasVisibleFields: function(fieldSetId){
    	var result = false;
    	var fieldSet = this.fieldsets.get(fieldSetId);
    	fieldSet.fields.each(function(field){
			result = !field.hidden;
		});
		return result;
    },
  
	/**
     * Return the specified form field element.
     */
    getFieldElement: function(fieldName, prefix) {
        return $(this.getFieldElementName(fieldName, prefix), false);
    },

    getFieldElementName: function(fieldName, prefix) {
        var name = '';
        if (valueExists(prefix)) {
            name = prefix;
        }
        return name + this.id + '_' + fieldName;
    },

    /**
     * Return the parent cell element for specified field.
     */
    getFieldCell: function(fieldName) {
        var fieldCell = null;

        var fieldElement = this.getFieldElement(fieldName);
        if (fieldElement) {
            fieldCell = fieldElement.parentNode;
        } else {
            fieldCell = $(this.id + '_' + fieldName + '_fieldCell');
        }

        return fieldCell;
    },

    /**
     * Returns the label cell element for specified field name.
     */
    getFieldLabelElement: function(fieldName) {
    	var id = this.getFieldElementName(fieldName, '') + '_labelCell';
        return $(id, false);
    },

    /**
     * Shows or hides document field buttons on the form.
     */
    updateDocumentButtons: function() {
        var panelId = this.id;
        this.fields.each(function(field) {
            var fieldDef = field.fieldDef;
            if (fieldDef.isDocument) {
                var panel = field.panel;
                var fullName = fieldDef.fullName;
                
                var documentInput = panel.getFieldElement(fullName);
                documentInput.disabled = panel.newRecord;
                
                var documentValue = panel.getFieldValue(fullName);
                
                var documentExists = (documentValue != '');
                var canShow = documentExists;
                var canCheckIn = (!documentExists && !fieldDef.readOnly && !panel.newRecord);
                var canCheckOut = (documentExists && !fieldDef.readOnly && !panel.newRecord);
				// checkin via file browser if showCheckInDialog attribute is false
				var doBrowseForCheckIn = canCheckIn && !fieldDef.showCheckInDialog;
                
                var prefix = panelId + '_' + fullName;
                
                panel.showElement(prefix + '_showDocument', canShow);
                panel.showElement(prefix + '_checkInNewDocument', canCheckIn && fieldDef.showCheckInDialog);
                panel.showElement(prefix + '_checkInNewDocumentVersion', canCheckOut);
                panel.showElement(prefix + '_checkOutDocument', canCheckOut);
                panel.showElement(prefix + '_lockDocument', canCheckOut);
                panel.showElement(prefix + '_deleteDocument', canCheckOut);

				// turn on only one of text input with buttons or file input
                panel.showElement(prefix, !doBrowseForCheckIn);
                panel.showElement(prefix + '_browseDocument_div', doBrowseForCheckIn);				
			}
        });
    },

	/**
     * Updates all lookup field svalues displayed under ID fields, from hidden lookup fields.
     */
    updateLookupFieldValues: function() {
        var processedLookupNames = {};

        this.fields.eachKey(function(fieldName) {
            var field = this.fields.get(fieldName);

            // 3051372: if there are multiple fields that validate on the same lookup table, query their lookup values
            if (field && field.fieldDef.lookupName) {
                var lookupFieldName = field.fieldDef.lookupName;
                var index = lookupFieldName.indexOf('_lookupFor_');
                if (index != -1) {
                    lookupFieldName = lookupFieldName.slice(0, index);
                }

                if (processedLookupNames[lookupFieldName]) {
                    // we did process the same lookup field before, so there are multiple fields that validate on it

                    // restrict by the ID field value
                    var restriction = new Ab.view.Restriction();
                    restriction.addClause('PRIMARY_KEY_FOR_THIS_TABLE', field.getUIValue());

                    // get the lookup field value
                    var dataSource = Ab.data.createDataSourceForFields({
                        tableNames: [lookupFieldName.split('.')[0]],
                        fieldNames: [lookupFieldName.split('.')[1]]
                    });

                    // query the lookup value
                    try {
                        var records = dataSource.getRecords(restriction);
                        if (records && records.length > 0) {
                            var lookupField = this.fields.get(field.fieldDef.lookupName);
                            if (lookupField) {
                                lookupField.setUIValue(records[0].getValue(lookupFieldName));
                            }
                        }
                    } catch (e) {
                        View.log('Failed to retrieve lookup value: ' + field.fieldDef.lookupName, 'error');
                    }
                } else {
                    // we did not process this lookup field yet, nothing to do
                    processedLookupNames[lookupFieldName] = lookupFieldName;
                }
            }

            this.updateLookupFieldValue(fieldName);
        }, this);
    },

    /**
     * Displays read-only Lookup field value under the ID field.
     * @param {fieldName} The ID field name.
     */
    updateLookupFieldValue: function(fieldName) {
        var field = this.fields.get(fieldName);
        
        var displayLookupValue = function(field, lookupField) {
            var instructionsEl = field.getInstructionsEl();
            if (instructionsEl) {
                instructionsEl.dom.innerHTML = lookupField.getUIValue();
            }
        };
        
        // if fieldName refers to the ID field
        if (field && field.fieldDef.lookupName) {
            var lookupField = this.fields.get(field.fieldDef.lookupName);
            if (lookupField) {
            	displayLookupValue(field, lookupField);
            }
        }
        
        // if fieldName refers to the lookup field 
        if (field && !field.fieldDef.lookupName) {
            this.fields.each(function(idField) {
            	if (idField.fieldDef.lookupName === fieldName) {
            		displayLookupValue(idField, field);
            	}
            });
        }
    },

    /**
     * Displays read-only Lookup field value under the ID field.
     * @param {fieldName} The ID field name.
     */
    clearLookupFieldValue: function(fieldName) {
        var field = this.fields.get(fieldName);
        if (field && field.fieldDef.lookupName) {
            // clear the value displayed next to the ID field
            var instructionsEl = field.getInstructionsEl();
            if (instructionsEl) {
                instructionsEl.dom.innerHTML = '';
            }

            // clear the hidden lookup field value, if any
            var fieldEl = this.getFieldElement(field.fieldDef.lookupName);
            if (fieldEl != null) {
                fieldEl.value = '';
            }
        }
    },

    /**
     * Returns true if this field is a ookup field.
     * @param fieldName
     */
    isLookupField: function(fieldName) {
        var result = false;

        this.fields.each(function(field) {
            var lookupFieldName = field.fieldDef.lookupName;
            if (lookupFieldName) {
                var index = lookupFieldName.indexOf('_lookupFor_');
                if (index != -1) {
                    lookupFieldName = lookupFieldName.slice(0, index);
                }
                if (lookupFieldName === fieldName) {
                    result = true;
                }
            }
        });

        return result;
    },

	/**
     * Registers custom event listener for this field. Specific to Document fields.
     * @param {fieldFullName}	Form field for whose events are being listened 
     * @param {eventName}		Event name, specific to the control type.
     * @param {listenerFunction}    Name of the function in application-specific JavaScript file handling the event. 
     * @param {scope}				Object instance scope. 
     */
    addFieldEventListener: function(fieldFullName, eventName, listenerFunction, scope) {
        var field = this.fields.get(fieldFullName);
		if (valueExists(field) && field.fieldDef.isDocument) {
            field.addDocumentFieldEventListener(eventName, listenerFunction, scope);
        }
    },

    /**
     * Returns registered event listener function.
     * @param {fieldFullName}	Form field for whose events are being listened 
     * @param {eventName}		Event name, specific to the control type.
     */
    getFieldEventListener: function(fieldFullName, eventName) {
		var listener = null;
        var field = this.fields.get(fieldFullName);
		if (valueExists(field) && field.fieldDef.isDocument) {
			listener = field.getDocumentFieldEventListener(eventName);
        }
        return listener;
    },
    
    /**
     * Removes event listener.
     * @param {fieldFullName}	Form field for whose events are being listened 
     * @param {eventName}		Event name, specific to the control type.
     */
    removeFieldEventListener: function(fieldFullName, eventName) {
        var field = this.fields.get(fieldFullName);
		if (valueExists(field) && field.fieldDef.isDocument) {
	        field.removeDocumentFieldEventListener(eventName);  
		}
    },
    

	/**
	 *  Return an array of full field names
	 *  containing the form's primary key fields
	 */
  	getPrimaryKeyFields: function() {
		var pkFields = [];
        this.fields.each(function(field) {
            if (field.fieldDef.primaryKey) {
				pkFields.push(field.fieldDef.fullName);
			}
		});
		return pkFields;
	},

	/**
	 *  Return an array of field values
	 *  containing the form's primary key field values
	 */
    getPrimaryKeyFieldValues: function(ignoreEmptyValues) {
        if (!valueExists(ignoreEmptyValues)) {
            ignoreEmptyValues = false;
        }
        
        var fieldValues = {};
        this.fields.each(function(field) {
            var fieldName = field.fieldDef.fullName;
            var fieldValue = field.panel.getFieldValue(fieldName);

            // add primary key field value UNLESS ignoreEmptyValues is set and the value is empty
            if (!ignoreEmptyValues || fieldValue != '') {
                if (field.fieldDef.primaryKey) {
                  fieldValues[fieldName] = fieldValue;
                }
            }
        });
        return fieldValues;
    },
    
	/**
	 *  Return parsed restriction
	 *  containing the form's primary key field values
	 */
    getPrimaryKeyRestriction: function() {
        var pkValues = this.getPrimaryKeyFieldValues(true);
        var restriction = new Ab.view.Restriction(pkValues);
        return restriction;
    },

   // ----------------------- validation methods --------------------------------------------------
    
    /**
     * Clears previous validation result, displayed message and field highlighting.
     */
    clearValidationResult: function() {
        this.validationResult = new Ab.form.ValidationResult();
        
        // clear validation message
        var messageCell = this.getMessageCell();
		if (messageCell !== null) {
			messageCell.dom.innerHTML = "";
		}
        
        // clear field highlighting for all fields
        this.fields.eachKey(function(fieldName) {
            
            // clear the input element class
            var fieldInput = this.getFieldElement(fieldName);
            if (valueExists(fieldInput)) { 
                var fieldInputTd = fieldInput.parentNode;
				if (valueExists(fieldInputTd)) { 
					Ext.fly(fieldInputTd).removeClass('formError');
					// remove per-field error messages
					var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
					for (var e = 0; e < errorTextElements.length; e++) {
						fieldInputTd.removeChild(errorTextElements[e]);
					}
				}
            }

            var fieldLabel = this.getFieldLabelElement(fieldName);
            if (fieldLabel) {
				if (valueExists(fieldInputTd)) { 
	                Ext.fly(fieldLabel).removeClass('formError');
				}
            }
        }, this);
        
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
        var message = this.validationResult.message;
        var detailedMessage = this.validationResult.detailedMessage;
        
        if (valueExists(message) && message != '') {
            // remove technical part of the message if it is provided
            var separatorIndex = message.indexOf('::');
            if (separatorIndex != -1) {
                message = message.substring(0, separatorIndex);
            }

            if (!this.validationResult.valid) {
                this.displayValidationMessage(message, detailedMessage);
            } else {
                this.displayTemporaryMessage(message);
            }
        }
        
        // highlight invalid fields
        for (var fieldName in this.validationResult.invalidFields) {
            var fieldInput = this.getFieldElement(fieldName);
            if (fieldInput) {
                Ext.fly(fieldInput.parentNode).addClass('formError');
            }

            var fieldLabel = this.getFieldLabelElement(fieldName);
            if (fieldLabel) {
                Ext.fly(fieldLabel).addClass('formError');
            }

            // add per-field error messages
            var fieldError = this.validationResult.invalidFields[fieldName];
            if (fieldError != '') {
                var fieldInputTd = fieldInput.parentNode;

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
     * Displays a message in the top row for 3 seconds by default.
     * @param message String to display
     * @param duration Duration in milliseconds. Optional. If not specified, the default is 3 seconds.
     */
    displayTemporaryMessage: function(message, duration){
        // show message as inline text, dismiss after 3 seconds
        var messageCell = this.getMessageCell();
        messageCell.dom.innerHTML = "";

        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {duration: 1});
        messageElement.setHeight(20, {duration: 1});

        // default duration = 3000ms
        this.dismissMessage.defer(valueExistsNotEmpty(duration) ? duration : 3000, this, [messageElement]);

        if (this.isShownInWindow()) {
            this.updateWindowHeight();
        }
    },

    /**
     * Displays validation error message in the top row.
     * @param message The message to display in the form.
     * @param detailedMessage The detailed message to display in a popup.
     */
    displayValidationMessage: function(message, detailedMessage){
        // show message as inline text
        var messageCell = this.getMessageCell();
		if (valueExists(messageCell)) { 
			messageCell.dom.innerHTML = "";
		}

        // begin paragraph and display message
        var messageAndButton = "<p>" + message;

        // add the Details button
        if (detailedMessage) {
            messageAndButton += " " + "<a>" + Ab.view.View.getLocalizedString(Ab.form.Form.z_MESSAGE_LABEL_DETAILS) + "</a>";
        }

        // end the paragraph
        messageAndButton += "</p>";

        // put it all into the message cell
        var messageElement = Ext.DomHelper.append(messageCell, messageAndButton, true);
        messageElement.addClass('formError');

        // add event listener to OK button to hide the message
        var form = this;
        messageElement.dom.onclick = function() {
            form.dismissMessage(messageElement);
        };

        // add event listener to Details button to open the popup that shows the detailed message
        if (detailedMessage) {
            messageElement.dom.childNodes[1].onclick = function() {
                View.showMessage('error', message, detailedMessage);
            };
        }

        if (this.isShownInWindow()) {
            this.updateWindowHeight();
        }
    },

    /**
     * Hides confirmation message.
     */
    dismissMessage: function(messageElement) {
        var form = this;
        messageElement.setVisible(false, {duration: 0.25});
        messageElement.setHeight(0, {
            duration: 1,
            callback: function() {
                messageElement.remove();

                if (form.isShownInWindow()) {
                    form.updateWindowHeight();
                }
            }
        });
    },

    /**
     * Returns a reference to the DOM element that contains message.
     */
    getMessageCell: function() {
        return Ext.fly(Ext.query('.formTopSpace', this.parentElement)[0]);
    },

    /**
     * Set field's maxValue for validation.
     * @param fieldFullName: field's full name.
     * @param maxValue: max value (nmueric).
     */
    setMaxValue:function(fieldFullName, maxValue){
    	var fieldDef = this.fields.get(fieldFullName).fieldDef;
    	fieldDef.maxValue = maxValue;
    },
   
    /**
     * Set field's minValue for validation.
     * @param fieldFullName: field's full name.
     * @param minValue: min value (nmueric).
     */
    setMinValue:function(fieldFullName, minValue){
    	var fieldDef = this.fields.get(fieldFullName).fieldDef;
    	fieldDef.minValue = minValue;
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
    },
	

    // -------------- KB 3024726 browse directly to doc checkin when field attribute directCheckin = 'true' -------------
	/**
	 * Event handler for direct browse document field	 
	 * 
	 */
	processingFileInputChange: function(fileNameElement, docFieldName) {
		var fileName = this.validateDocumentFileNameElement(fileNameElement);
		if (fileName == null || fileName == '') { return; }
		
		fileName = this.removeDirectories(fileName);
	
		var docFieldPanel = this;
		var tableName = docFieldName.split('.')[0];
		var fieldName = docFieldName.split('.')[1];
		
		// map{[fld,val]} param for svc call. fld is NOT fullName
		var pKeyFieldValues = this.getDocSvcPrimaryKeyFieldValues();
			
		// div wrapping the <input type='file'> element to be reset on success
		var divId = fileNameElement.id + '_div';
		
		DocumentService.checkinNewFile(fileNameElement, pKeyFieldValues, tableName, fieldName, fileName, 'auto', '0', {
			callback: function() {
				// clear value from file input element by resetting the inner html of the div
				// var test = document.getElementById(divId).innerHTML;
				// XXX why set the content to itself?
				if(document.getElementById(divId))
					document.getElementById(divId).innerHTML = document.getElementById(divId).innerHTML;
				
				// refresh with saved record, updates doc field buttons
				docFieldPanel.refresh();
			},
			errorHandler: function(m, e) {
				Ab.view.View.showException(e);
			}
		});
	},
		

	/**
	 * Check document field file name text is not empty
	 */
	validateDocumentFileNameElement: function(fileNameElement) {
		var fileName = fileNameElement.value;
		if (fileNameElement == null || fileNameElement.value == null && fileNameElement.value.trim() == '') {
			var warning_message_empty_filename = Ab.form.Form.z_MESSAGE_EMPTY_FILENAME;
			// TODO transform into validation failure
			View.showMessage('error', warning_message_empty_filename, warning_message_empty_filename);
			return null;
		}
		return fileName
	},

	/**
	 * remove IE-supplied directories from fileName
	 */
	 removeDirectories: function(fileName) {
		var separatorPos = fileName.lastIndexOf('\\');
		if (separatorPos >= 0) {
			fileName = fileName.substring(separatorPos + 1);
		}
		else {
			separatorPos = fileName.lastIndexOf('/');
			if (separatorPos >= 0) {
				fileName = fileName.substring(separatorPos + 1);
			}
		}
		return fileName;
	},

	/**
	 * Massage the PrimaryKeyFieldValues to remove tableName from the key 
	 * to conform to the server-side document service expectations 
	 */
	getDocSvcPrimaryKeyFieldValues: function() {
		var pKeyFieldValues = this.getPrimaryKeyFieldValues(true);
		var docSvcKeys = {};
		// remove tableName
		for (fullName in pKeyFieldValues) {
			docSvcKeys[fullName.split('.')[1]] = pKeyFieldValues[fullName];
		}

		return docSvcKeys;
	},
    
    // ----------------------- image support -------------------------------------------------------
    
    /**
     * Show image loaded from the server using specified document field as an image source.
     * 
     * @param {imageDisplayField} ID of the image field that displays the image.
     * @param {imageDocField}     ID of the document field that contains document PK ('ls.ls_id') or array of document PKs (['eq_audit.survey_id','eq_audit.eq_id']).
     * @param {imageDocField}     ID of the document field that contains document name (ls.doc).
     */
    showImageDoc: function(imageDisplayField, imageDocKeyField, imageDocValueField) {
    	var imageDocKeyFieldArray = [];
    	if(imageDocKeyField instanceof Array){
    		imageDocKeyFieldArray = imageDocKeyField;
    	}else{
    		imageDocKeyFieldArray.push(imageDocKeyField);
    	}
    	
    	var keys = {};
    	var keyName = '';
        for(var i=0; i<imageDocKeyFieldArray.length; i++){
        	keyName = imageDocKeyFieldArray[i].split('.')[1];
        	keys[keyName] = this.getFieldValue(imageDocKeyFieldArray[i]);
        }
        
    	var tableName = imageDocKeyFieldArray[0].split('.')[0];
    	var fieldName = imageDocValueField.split('.')[1];
    	
        var form = this;
        form.disable();

        DocumentService.getImage(keys, tableName, fieldName, '1', true, {
            callback: function(image) {
                dwr.util.setValue(form.getFieldElementName(imageDisplayField), image);
                form.enable();
            },
            errorHandler: function(m, e) {
                Ab.view.View.showException(e);
                form.enable();
            }
        });
    },

    /**
     * Show image file loaded from the server.
     * 
     * @param {imageDisplayField} Name of the image field that displays the image.
     * @param {fileName}          Absolute server image path.
     */
    showImageFile: function(imageDisplayField, fileName) {
        var field = this.fields.get(imageDisplayField);
        field.dom.src = fileName;
    },
    
    /**
     * Clears the image display field.
     * 
     * @param {imageDisplayField} Name of the image field that displays the image.
     */
    clearImage: function(imageDisplayField) {
        this.showImageFile(imageDisplayField, Ab.view.View.contextPath + '/schema/ab-system/graphics/blank.gif');
    }
}, {
    // ----------------------- constants -----------------------------------------------------------

	// @begin_translatable
    z_MESSAGE_INVALID_FIELD: 'Please correct highlighted values and save again.',
	z_MESSAGE_NO_DWG_VIEW: 'no drawing view!!!',
	z_MESSAGE_EMPTY_FILENAME: 'Please choose a file for the document.',
	z_MESSAGE_INVALID_NUMERIC_TOO_LARGE: 'Value entered for [{0}] exceeds the maximum storage limits defined for the field. Please enter a number less than {1}.',
    z_MESSAGE_INVALID_NUMERIC_TOO_SMALL: 'Value entered for [{0}] is smaller than the minimum storage limits defined for the field. Please enter a number greater than -{1}.',
    z_MESSAGE_INVALID_NUMERIC_MAX: 'Value entered for [{0}] exceeds the maximum limits defined for the field. Please enter a number less than or equal to {1}.',
    z_MESSAGE_INVALID_NUMERIC_MIN: 'Value entered for [{0}] is smaller than the minimum limits defined for the field. Please enter a number greater than or equal to {1}.',
    z_MESSAGE_INVALID_UPPERALPHANUM: 'Value entered for [{0}] is invalid. Please enter alpha characters and/or numbers.',
    z_MESSAGE_INVALID_INTEGERORSMALLINT: 'Value entered for [{0}] is not an integer. Please enter an integer.',
    z_MESSAGE_INVALID_NUMERIC: 'Value entered for [{0}] is not a number. Please enter a numeric value.',
    z_MESSAGE_INVALID_NUMERIC_DECIMAL: 'Value entered for [{0}] exceeds the number of decimal places defined for the field. Please enter a number with {1} or fewer numbers after the decimal.',
    z_MESSAGE_INVALID_MEMO_TOO_LARGE: 'Value exceeds the maximum storage limits defined for the field.  Value will be truncated to {0} characters.',
    z_MESSAGE_LABEL_OK: 'OK',
    z_MESSAGE_LABEL_DETAILS: 'Details',
	// @end_translatable
    
    // name of the default WFR used to get the default record
    WORKFLOW_RULE_CLEAR: 'AbCommonResources-getDefaultDataRecord',
    
    // name of the default WFR used to get the record
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecord',
    
    // name of the default WFR used to get the record
    WORKFLOW_RULE_SAVE: 'AbCommonResources-saveDataRecord',
    
    // name of the default WFR used to delete the current record
    WORKFLOW_RULE_DELETE: 'AbCommonResources-deleteDataRecords',
    
    // separator character for multiple values in one field, used for Select Multiple console fields
    MULTIPLE_VALUES_SEPARATOR: ', \u200C',

    // Event key for user-defined document field event listener
    DOC_EVENT_CHECKIN: 'onCheckInDocument',
    // Event key for user-defined document field event listener
    DOC_EVENT_CHECKIN_NEW_VERSION: 'onCheckinNewVersion',
    // Event key for user-defined document field event listener
    DOC_EVENT_CHECKOUT: 'onCheckOutDocument',
    // Event key for user-defined document field event listener
    DOC_EVENT_DELETE: 'onDeleteDocument',
    // Event key for user-defined document field event listener
    DOC_EVENT_CHANGE_LOCK_STATUS: 'onChangeLockStatus'

});


/**
 * Returns field value by name from unspecified form panel.
 * Searches for the field in all form panels in the current window, returns the first found.
 * Added for backward compatibility with 16.3. 
 */
function getInputValue(fieldName) {
	var value = '';
	
	var forms = Ab.view.View.getControlsByType('', 'form');
	for (var i = 0; i < forms.length; i++) {
		var form = forms[i];
		if (form.containsField(fieldName)) {
			value = form.getFieldValue(fieldName);
			break;
		}
	}
	
	return value;
}

/**
 * Set the field value by name from unspecified form panel.
 * Searches for the field in all form panels in the current window, setting the first found.
 * Added for backward compatibility with 16.3. 
 */
function setInputValue(fieldName, fieldValue) {
	var forms = Ab.view.View.getControlsByType('', 'form');

	for (var i = 0; i < forms.length; i++) {
		var form = forms[i];
		if (form.containsField(fieldName)) {
			value = form.setFieldValue(fieldName, fieldValue);
			break;
		}
	}
}

