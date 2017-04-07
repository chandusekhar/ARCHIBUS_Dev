/**
 * Base class for ARCHIBUS mobile forms. Adds change event listeners to the form fields to allow the form
 * {@link Ext.data.Model} to be updated when the form data is changed. Displays validation errors that are generated
 * from the {@link Ext.data.Model} configuration
 *
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.form.FormPanel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Common.type.CustomType',
        'Common.control.ErrorPanel'
    ],

    xtype: 'commonformpanel',

    isErrorPanelDisplayed: false,

    config: {
        model: null,

        /**
         * @cfg {Boolean} ignoreFieldChangeEvents The field change events are not added when true. Typically
         * used when there are more than one FormPanels in a view. Setting to true prevents the listeners
         * from being applied multiple times.
         */
        ignoreFieldChangeEvents: false
    },

    constructor: function () {
        this.callParent(arguments);
        this.addFieldListeners();
    },


    initialize: function () {
        this.callParent(arguments);
        this.setLabelWidths();
    },

    /**
     * Sets the label widths of all fields to 40%. Overrides the settings in the form config section.
     */
    setLabelWidths: function () {
        var me = this,
            fields = me.query('field');

        Ext.each(fields, function (field) {
            if (!Ext.isEmpty(field.getLabel())) {
                field.setLabelWidth('40%');
            }
        }, me);
    },

    // Remove the submit tag from the from. We never directly submit a form to the server.
    // This prevents that Enter or Go key from submitting the form in some cases
    // See KB 3043855
    getElementConfig: function () {
        var config = this.callParent();
        config.tag = "form";
        // Added a submit input for standard form submission. This cannot have "display: none;" or it will not work
        //config.children.push({
        //    tag: 'input',
        //    type: 'submit',
        //    style: 'visibility: hidden; width: 0; height: 0; position: absolute; right: 0; bottom: 0;'
        // });

        // Remove the submit element that was added in the Ext.form.Panel parent function
        config.children.pop();
        return config;
    },

    /**
     * Loads matching fields from a model instance into this form.
     * @param {Ext.data.Model} instance The model instance.
     * @return {Ext.form.Panel} This form.
     */
    setRecord: function (record) {
        var me = this;
        // Call applyRecord to allow all inherited classes to react to the
        // record change
        record = me.applyRecord(record);

        if (record && record.data) {
            me.setValues(record.data);
        }

        me._record = record;

        return this;
    },

    /* Overridden framework function. Ignore JSHint warnings. */
    /* jshint maxstatements: 25 */
    /* jshint maxcomplexity: 15 */
    /* jshint maxdepth: 7 */
    /**
     * Overrides Ext.panel.FormPanel. Required to handle custom type implementation
     * @override
     * @private
     */
    setValues: function (values) {
        var fields = this.getFields(),
            me = this,
            name, field, value, ln, i, f;

        values = values || {};

        for (name in values) {
            if (values.hasOwnProperty(name)) {
                field = fields[name];
                value = values[name];

                if (field) {
                    // If there are multiple fields with the same name. Checkboxes, radio fields and
                    // maybe event just
                    // normal fields..
                    if (Ext.isArray(field)) {
                        ln = field.length;

                        // Loop through each of the fields
                        for (i = 0; i < ln; i++) {
                            f = field[i];

                            if (f.isRadio) {
                                // If it is a radio field just use setGroupValue which will handle all
                                // of the radio
                                // fields
                                f.setGroupValue(value);
                                break;
                            } else if (f.isCheckbox) {
                                if (Ext.isArray(value)) {
                                    f.setChecked((value.indexOf(f._value) !== -1));
                                } else {
                                    f.setChecked((value === f._value));
                                }
                            } else {
                                // If it is a bunch of fields with the same name, check if the value is
                                // also an array,
                                // so we can map it
                                // to each field
                                if (Ext.isArray(value)) {
                                    f.setValue(value[i]);
                                }
                            }
                        }
                    } else {
                        if (field.isRadio || field.isCheckbox) {
                            // If the field is a radio or a checkbox
                            field.setChecked(value);
                        } else {
                            // If just a normal field
                            // Changed to handle custom types
                            field.setValue(this.getFieldValue(value));
                        }
                    }

                    if (me.getTrackResetOnLoad()) {
                        field.resetOriginalValue();
                    }
                }
            }
        }

        return this;
    },

    /**
     * Calls the getValue method to retrieve the value if this is a CustomType
     * @private
     * @param value
     * @returns {Object}
     */
    getFieldValue: function (value) {
        if (value instanceof Common.type.CustomType) {
            return value.getValue();
        } else {
            return value;
        }
    },

    /**
     * Registers change listeners for all fields included in the form panel. Updates the form record on
     * each field change.
     * Keeps the form model updated with the contents of the form. This simplifies the form
     * processing. We can call form.getRecord() and always get the contents of the form fields.
     */
    addFieldListeners: function () {
        var me = this,
            fields = me.query('field'),
            fieldChangedMessage = LocaleManager.getLocalizedString('Field Changed field: {0} newValue: {1} oldValue: {2}',
                'Common.form.FormPanel'),
            fieldLimitMessageTitle = LocaleManager.getLocalizedString('Input', 'Common.form.FormPanel'),
            fieldLimitMessage = LocaleManager.getLocalizedString('Input for field {0} is limited to {1} characters',
                'Common.form.FormPanel'),
            ignoreFieldChangeEvents = me.getIgnoreFieldChangeEvents();

        Ext.each(fields, function (field) {
            var previousLength;
            if (field.xtype === 'commontextfield' || field.xtype === 'commontextareafield' || field.xtype === 'textpromptfield') {
                previousLength = 0;
                field.on('inputchanged', function (textfield) {
                    var maxLength = textfield.getMaxLength(),
                        value = textfield.getValue(),
                        currentLength = value.length;
                    if (maxLength && maxLength > 0) {
                        if (previousLength >= maxLength && currentLength === maxLength) {
                            Ext.Msg.alert(fieldLimitMessageTitle,
                                Ext.String.format(fieldLimitMessage, field.getLabel(), maxLength));
                        }
                    }
                    previousLength = value.length;
                }, me);
            }
            if (!ignoreFieldChangeEvents) {
                field.on('change', function (field, newValue, oldValue) {
                    var record;
                    Log.log(Ext.String.format(fieldChangedMessage, field.getName(), newValue, oldValue), 'verbose', me, arguments);
                    record = me.getRecord();
                    if (record) {
                        Log.log('Field Changed - Set Model Data', 'verbose', me, arguments);
                        record.set(field.getName(), field.getValue());
                        if (me.isErrorPanelDisplayed) {
                            me.displayErrors(record);
                        }
                    }
                }, me);
            }

        }, me);
    },

    /**
     * Displays the error messages on the form.
     * @param {Ext.data.Model} data The form record
     */
    displayErrors: function (data) {
        var me = this,
            fields = me.query('field'),
            errors = data.validate(),
            errorMessages = [];

        Ext.each(fields, function (field) {
            var fieldName = field.getName(),
                fieldErrors = errors.getByField(fieldName);

            if (fieldErrors.length > 0) {
                field.element.last().first().addCls('invalid-field');
            } else {
                field.element.last().first().removeCls('invalid-field');
            }

            Ext.each(fieldErrors, function (fieldError) {
                var fieldErrorMessage = '';
                if (fieldError.getMessage() !== null) {
                    if (fieldError.isExtendedError && fieldError.getFormatted()) {
                        fieldErrorMessage = me.formatErrorMessage(fieldError, fields);
                    } else {
                        fieldErrorMessage = fieldError.getMessage() + ' ' + me.stripHtmlFromLabel(field.getLabel());
                    }
                    errorMessages.push({fieldName:fieldName, errorMessage: fieldErrorMessage});
                }
            }, me);
        }, me);

        if (errorMessages.length > 0) {
            me.isErrorPanelDisplayed = true;
            // Check if the error panel is displayed
            me.removeErrorPanelIfExists();
            me.insert(0, {
                xtype: 'errorpanel',
                errorMessages: errorMessages
            });
        } else {
            me.isErrorPanelDisplayed = false;
            me.removeErrorPanelIfExists();
        }
    },

    /**
     *
     * @private
     * @param fieldError
     * @param fields
     * @returns {String|*}
     */
    formatErrorMessage: function (fieldError, fields) {
        var me = this,
            dependentFields = fieldError.getDependentFields(),
            fieldLabels = me.retrieveFieldLabels(fields, dependentFields),
            args = Ext.Array.clone(fieldLabels).map(me.stripHtmlFromLabel);

        // Add the message to the beginning of the array
        args.splice(0, 0, fieldError.getMessage());
        return Ext.String.format.apply(this, args);
    },

    stripHtmlFromLabel: function(labelText) {
        // Remove <br> first
        var label = labelText.replace(/<br>/g, ' ');
        label = label.replace(/(<([^>]+)>)/ig, '');

        return label;
    },

    /**
     * Returns an array of field labels for each field name in the dependentFields parameter
     * @private
     * @param fields
     * @param dependentFields
     * @returns {Array}
     */
    retrieveFieldLabels: function (fields, dependentFields) {
        var fieldLabels = [];

        Ext.each(dependentFields, function (dependentField) {
            Ext.each(fields, function (field) {
                if (dependentField === field.getName()) {
                    fieldLabels.push(field.getLabel());
                }
            });
        });
        return fieldLabels;
    },

    /**
     * @private
     */
    removeErrorPanelIfExists: function () {
        var errorPanel = this.down('errorpanel');
        if (errorPanel) {
            this.remove(errorPanel, true);
        }
    },

    /**
     * Removes the invalid field highlights from each of the fields in the form.
     * @private
     */
    removeFieldErrorCls: function () {
        var me = this,
            fields = me.query('field');

        Ext.each(fields, function (field) {
            field.element.last().first().removeCls('invalid-field');
        }, me);
    },

    /**
     * Sets the field labels to the values contained in the server side schema definition.
     * @param {String} tableName The server side table name
     */
    setColumnHeadings: function (tableName) {
        this.setFieldLabelAndLength(tableName);
    },

    /**
     * Sets the field label using the values contained in the TableDef multiline and singleline heading fields.
     * @param {String} tableName
     */
    setFieldLabelAndLength: function (tableName) {
        var me = this,
            fields = me.query('field');

        me.doSetFieldLabelAndLength(tableName, fields);

    },

    setFieldLabelAndLengthForContainer: function (tableName, container) {
        var me = this,
            fields = container.query('field');

        me.doSetFieldLabelAndLength(tableName, fields);
    },

    /**
     * @private
     * @param tableName
     * @param fields
     */
    doSetFieldLabelAndLength: function (tableName, fields) {
        var me = this,
            fieldCollection = TableDef.getTableDefFieldCollection(tableName);

        if (fieldCollection.keys.length === 0) {
            return;
        }

        Ext.each(fields, function (field) {
            var fieldName = field.getName(),
                fieldDef = fieldCollection.get(fieldName),
                fieldHeading;

            if (fieldDef) {
                fieldHeading = me.getFieldHeadingFromFieldDef(fieldDef);
                if (fieldHeading.length > 0) {
                    me.setFieldHeading(field, fieldHeading);
                }

                if (field.isXType('commontextfield') || field.isXType('commontextareafield')) {
                    if (fieldDef.size) {
                        field.setMaxLength(fieldDef.size);
                    }
                }
            }
        }, me);
    },

    /**
     * @private
     * @param field
     * @param heading
     */
    setFieldHeading: function (field, heading) {
        var fieldHeading = heading,
            numberFormat,
            useFieldDefLabel = field.config.useFieldDefLabel;

        // if useFieldDefLabel is set to false then use the field's label instead of multiline heading from TableDef
        if (!Ext.isEmpty(useFieldDefLabel) && !useFieldDefLabel) {
            fieldHeading = field.getLabel();
        }

        if (field.xtype === 'formattednumberfield') {
            numberFormat = field.getLabelFormatString();
            if (numberFormat !== '') {
                fieldHeading = fieldHeading + ' (' + numberFormat + ')';
            }
        }

        field.setLabel(fieldHeading);
    },

    /**
     * @private
     * @param fieldDef
     * @returns {*}
     */
    getFieldHeadingFromFieldDef: function (fieldDef) {
        var multiLineHeadings = fieldDef.multiLineHeadings,
            singleLineHeading = fieldDef.singleLineHeading,
            heading;

        if (singleLineHeading && Ext.os.is.Phone) {
            heading = singleLineHeading;
        } else {
            heading = Common.util.Ui.convertMultiLineToSingleLineHeading(multiLineHeadings);
        }

        return heading;
    },

    //@private
    applyRecord: function (config) {
        return config;
    }


}, function () {
    //<deprecated product=mobile since=21.3>

    /**
     * Sets the field labels to the values contained in the server side schema definition.
     * @param {String} tableName
     * @deprecated 21.3 Please use {@link #setFieldLabelAndLength} instead.
     */
    Ext.deprecateClassMethod(this, 'setColumnHeadings', 'setFieldLabelAndLength');
});
