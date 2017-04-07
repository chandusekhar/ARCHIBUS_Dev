Ext.define('Maintenance.view.FormValidateBase', {
    extend: 'Common.form.FormPanel',

    /**
     * @override To take the fields from the given form
     * Displays the error messages on the form.
     * @param {Ext.data.Model} data The form record
     * @param formView
     */
    displayErrors: function (data, formView) {
        var me = this,
        /* Override: start */
            form = Ext.isDefined(formView) ? formView : me,
            fields = form.query('field'),
        /* Override: end */
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
            /* Override: start */
            me.removeErrorPanelIfExists(form);
            form.insert(0, {
                xtype: 'errorpanel',
                errorMessages: errorMessages
            });
        } else {
            me.isErrorPanelDisplayed = false;
            /* Override: start */
            me.removeErrorPanelIfExists(form);
            /* Override: end */
        }
    },

    /**
     * @override TODO make WR resources views inherit 'Common.form.FormPanel'
     * @private
     */
    removeErrorPanelIfExists: function (view) {
        var form = Ext.isDefined(view) ? view : this,
            errorPanel = form.down('errorpanel');

        if (errorPanel) {
            form.remove(errorPanel, true);
        }
    },

    /**
     * Override {@link Common.form.FormPanel} to check that the field's table corresponds to record's table
     * @override
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
            displayErrors = function (record) {
                var disableValidation = record.getDisableValidation();
                if (record instanceof Maintenance.model.WorkRequest) {
                    record.setDisableValidation(true);
                }
                me.displayErrors(record);
                if (record instanceof Maintenance.model.WorkRequest) {
                    record.setDisableValidation(disableValidation);
                }
            };

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
            field.on('change', function (field, newValue, oldValue) {
                var record;
                Log.log(Ext.String.format(fieldChangedMessage, field.getName(), newValue, oldValue), 'verbose', me, arguments);
                record = me.getRecord();
                if (record) {
                    /* Override: start */

                    if (!Ext.isDefined(record.getServerTableName) || !Ext.isDefined(field.getServerTableName)
                        || record.getServerTableName() === field.getServerTableName()) {

                        /* Override: end */
                        record.set(field.getName(), field.getValue());
                        if (me.isErrorPanelDisplayed) {
                            displayErrors(record);
                        }
                    }
                }
            }, me);
        }, me);
    }
});