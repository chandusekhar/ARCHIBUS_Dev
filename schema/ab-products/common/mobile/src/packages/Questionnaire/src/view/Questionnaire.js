/**
 * A Base view for questionnaire forms.
 */
Ext.define('Questionnaire.view.Questionnaire', {
    extend: 'Ext.Container',
    requires: ['Common.control.config.DatePicker'],

    xtype: 'questionnaire',

    config: {
        layout: 'vbox',
        items: [
            {
                xtype: 'container',
                itemId: 'errorContainer',
                hidden: true,
                cls: 'error-panel'
            },
            {
                xtype: 'fieldset',
                items: [
                    {
                        // The container for the dynamic questionnaire items
                        xtype: 'container',
                        itemId: 'questionnaireItems'
                    }
                ]
            },
            {
                xtype: 'button',
                text: LocaleManager.getLocalizedString('Save','Questionnaire.view.Questionnaire'),
                itemId: 'saveButton',
                ui: 'action',
                hidden: true,
                margin: '6px 0px 0px 0px',
                width: '240px'
            }
        ],

        isErrorPanelDisplayed: false,

        questionnaireId: null,

        questionnaireData: null,

        /**
         * @cfg {Ext.data.Model} record The record that the questionnaire result will be written to.
         */
        record: null,

        /**
         * @cfg {String} fieldName The name of the field in the record that the questionnaire result will be
         * written to.
         */
        fieldName: null,

        /**
         * @cfg {Boolean} cancelValidation Stops the validation or the required fields when true.
         */
        cancelValidation: false,

        /**
         * @cfg {Boolean} displaySaveButton Set to true to display the Save button with the Questionnaire items.
         */
        displaySaveButton: false,

        autoSave: false
    },

    initialize: function () {
        var me = this,
            button = me.down('#saveButton');

        button.on('tap', me.onSave, me);
    },

    applyQuestionnaireId: function (config) {
        if (config) {
            this.onQuestionnaireIdChanged(config);
        }
        return config;
    },

    applyDisplaySaveButton: function(config) {
        var me = this,
            button;

        if(config) {
            button = me.down('#saveButton');
            button.setHidden(!config);
        }
        return config;
    },

    updateDisplaySaveButton: function(newValue) {
        var me = this,
            button;
        if(newValue) {
            button = me.down('#saveButton');
            button.setHidden(!newValue);
        }
    },

    onSave: function () {
        var me = this;
        me.fireEvent('questionnairesave', me);
    },

    onQuestionnaireIdChanged: function (questionnaireId) {
        var me = this;

        me.fireEvent('questionnaireidchange', questionnaireId, me);
    },

    validateRequiredFields: function () {
        var me = this,
            fields = me.query('field'),
            isValid = true,
            invalidFields = [],
            cancelValidation = me.getCancelValidation();

        // Allow the validation to be cancelled for the case where the user exits the form
        // and does not want to apply the required Questionnaire values
        if(cancelValidation) {
            return true;
        }

        // Check for required fields
        Ext.each(fields, function (field) {
            if (field.getRequired() === 1) {
                if (Ext.isEmpty(field.getValue())) {
                    isValid = false;
                    field.element.last().first().addCls('invalid-field');
                    invalidFields.push(field.getLabel());
                } else {
                    field.element.last().first().removeCls('invalid-field');
                }
            }
        }, me);

        me.updateErrorPanel(invalidFields);
        return isValid;
    },

    addFieldListeners: function () {
        var me = this,
            fields = me.query('field');

        Ext.each(fields, function (field) {
            field.on('change', function (field, newValue, oldValue) {
                if(newValue !== oldValue) {
                    me.fireEvent('fieldchanged', field, newValue, oldValue);
                    if(me.getIsErrorPanelDisplayed()) {
                        me.validateRequiredFields();
                    }
                }
            }, me);
        }, me);
    },

    updateErrorPanel: function (invalidFields) {
        var me = this,
            errorPanel = me.down('#errorContainer'),
            html = '';

        if (invalidFields.length > 0) {
            errorPanel.setHidden(false);
            me.setIsErrorPanelDisplayed(true);
            // Generate the html
            Ext.each(invalidFields, function (fieldLabel) {
                html += '<div>' + fieldLabel + ' is required</div>';
            });
            errorPanel.setHtml(html);
        } else {
            errorPanel.setHtml('');
            errorPanel.setHidden(true);
            me.setIsErrorPanelDisplayed(false);
        }
    }
});