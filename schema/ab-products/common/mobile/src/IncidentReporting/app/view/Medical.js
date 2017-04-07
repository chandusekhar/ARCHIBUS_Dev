Ext.define('IncidentReporting.view.Medical', {
    extend: 'Common.view.navigation.EditBase',
    xtype: 'medicalcard',

    config: {
        title: LocaleManager.getLocalizedString('Medical Information', 'IncidentReporting.view.Medical'),
        isCreateView: true,
        model: 'IncidentReporting.model.Incident',
        storeId: 'incidentsStore',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },

                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'mob_incident_id'
                    },
                    {
                        xtype: 'incidentInjuryCategoryPrompt'
                    },
                    {
                        xtype: 'incidentInjuryAreaPrompt'
                    },
                    {
                        xtype: 'togglefield',
                        name: 'emergency_rm_treatment'
                    },
                    {
                        xtype: 'togglefield',
                        name: 'is_hospitalized'
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_death'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this;

        me.callParent(arguments);
        me.setFieldLabelAndLength('ehs_incidents');

        // Force the toggle field CSS to update on Android devices.
        if (Ext.os.is.Android) {
            me.on('painted', function () {
                var toggleFields = this.query('togglefield');
                Ext.each(toggleFields, function (field) {
                    setTimeout(function () {
                        field.toggle().toggle();
                    }, 500);
                }, me);
            }, me);
        }
    }
});