Ext.define('Space.view.StartSurvey', {
    extend: 'Common.form.FormPanel',

    xtype: 'startSurveyPanel',

    config: {

        title: LocaleManager.getLocalizedString('Start Survey', 'Space.view.StartSurvey'),
        items: [
            {
                xtype: 'fieldset',
                style: 'margin: 6px 20px 20px 20px',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        label: LocaleManager.getLocalizedString('Survey Code', 'Space.view.StartSurvey'),
                        name: 'survey_id'
                    },
                    {
                        xtype: 'commontextfield',
                        label: LocaleManager.getLocalizedString('Survey Name', 'Space.view.StartSurvey'),
                        name: 'description'
                    },
                    {
                        xtype: 'commontextfield',
                        label: LocaleManager.getLocalizedString('Surveyor', 'Space.view.StartSurvey'),
                        name: 'em_id',
                        readOnly: true
                    }
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Start', 'Space.view.StartSurvey'),
                        itemId: 'startSurveyButton',
                        ui: 'action',
                        width: '200px',
                        style: 'margin-bottom:10px'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            startSurveyButton = me.down('button'),
            surveyNameField = me.down('textfield[name=description]');

        this.callParent(arguments);

        startSurveyButton.on('tap', function () {
            surveyNameField.blur();
            // Use a delay to allow Android devices to process the validation events
            setTimeout(function () {
                me.fireEvent('surveybuttontap', me);
            }, 50);
        }, me);
    }
});