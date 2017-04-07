Ext.define('Maintenance.view.WorkRequestValidateBase', {
    extend: 'Common.view.navigation.EditBase',

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
    }

});