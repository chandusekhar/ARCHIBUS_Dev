/**
 *
 * @since 21.3
 */
Ext.define('Solutions.view.Questionnaire', {
    extend: 'Ext.Container',
    requires: 'Questionnaire.view.Questionnaire',


    xtype: 'solutionquestionnaire',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        items: [
            {
                xtype: 'fieldset',
                title: 'Select Questionnaire to dynamically generate the form elements',
                items: [
                    {
                        xtype: 'selectfield',
                        store: 'questionnaires',
                        label: 'Questionnaires',
                        valueField: 'questionnaire_id',
                        displayField: 'title'
                    }
                ]
            },

            {
                xclass: 'Questionnaire.view.Questionnaire',
                itemId: 'questionnaireForm',
                questionnaireId: 'SERVICE DESK - GROUP MOVE',
                displaySaveButton: false,
                flex: 1
            }
        ]
    },

    initialize: function() {
        var me = this,
            selectfield = this.down('selectfield');

        selectfield.on('change', me.onSelectChange, me);
    },

    onSelectChange: function(selectField, newValue) {
        var form = this.down('#questionnaireForm');

        form.setQuestionnaireId(newValue);
    }
});
