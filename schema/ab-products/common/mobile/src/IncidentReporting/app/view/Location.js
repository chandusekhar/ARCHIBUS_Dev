Ext.define('IncidentReporting.view.Location', {
    extend: 'Common.view.navigation.EditBase',
    xtype: 'locationcard',

    config: {
        title: LocaleManager.getLocalizedString('Location Details', 'IncidentReporting.view.Location'),
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
                itemId: 'locationFieldSet',
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
                        xtype: 'sitePrompt',
                        itemId: 'site_id',
                        childFields: ['pr_id', 'bl_id', 'fl_id', 'rm_id']

                    },
                    {
                        xtype: 'propertyPrompt',
                        itemId: 'pr_id'
                    },
                    {
                        xtype: 'buildingPrompt',
                        itemId: 'bl_id',
                        parentFields: ['site_id', 'pr_id']
                    },
                    {
                        xtype: 'floorPrompt',
                        itemId: 'fl_id',
                        store: 'floorPromptStore',
                        parentFields: ['site_id', 'pr_id', 'bl_id']
                    },
                    {
                        xtype: 'roomPrompt',
                        itemId: 'rm_id',
                        store: 'roomPromptStore',
                        parentFields: ['site_id', 'pr_id', 'bl_id', 'fl_id']
                    }
                ]
            }
        ]

    },

    initialize: function () {
        this.callParent(arguments);
        this.setFieldLabelAndLength('ehs_incidents');
    },

    applyRecord: function (record) {
        //need to set the values in a specific order else setting one value might reset others
        if (record) {
            this.query('sitePrompt')[0].setValue(record.get('site_id'));
            this.query('propertyPrompt')[0].setValue(record.get('pr_id'));
            this.query('buildingPrompt')[0].setValue(record.get('bl_id'));
            this.query('floorPrompt')[0].setValue(record.get('fl_id'));
            this.query('roomPrompt')[0].setValue(record.get('rm_id'));
        }
        return record;
    }
});