Ext.define('SpaceOccupancy.view.RoomForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'roomForm',

    requires: ['Common.control.Spinner'],

    config: {
        model: 'Space.model.RoomSurvey',
        storeId: 'occupancyRoomSurveyStore',

        // Disable overscroll to prevent errors when handling the swipe event.
        scrollable: {
            directionLock: true,
            direction: 'vertical',
            momentumEasing: {
                momentum: {
                    acceleration: 30,
                    friction: 0.5
                },
                bounce: {
                    acceleration: 0.0001,
                    springTension: 0.9999
                },
                minVelocity: 3
            },
            outOfBoundRestrictFactor: 0
        },

        items: [
            {
                defaults: {
                    xtype: 'commontextfield',
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commondatepickerfield',
                        name: 'date_last_surveyed',
                        readOnly: true
                    },
                    {
                        xtype: 'divisionPrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Division', 'SpaceOccupancy.view.RoomForm'),
                        useFieldDefLabel: false
                    },
                    {
                        xtype: 'departmentPrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Department', 'SpaceOccupancy.view.RoomForm'),
                        useFieldDefLabel: false
                    },
                    {
                        xtype: 'roomCategoryPrompt'
                    },
                    {
                        xtype: 'roomTypePrompt'
                    },
                    {
                        xtype: 'roomStandardPrompt'
                    },
                    {
                        xtype: 'selectlistfield',
                        store: 'roomUsesStore',
                        valueField: 'rm_use',
                        displayField: 'description',
                        name: 'rm_use'
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'name'
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        minValue: 0,
                        stepValue: 1,
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Capacity', 'SpaceOccupancy.view.RoomForm'),
                        useFieldDefLabel: false,
                        name: 'cap_em',
                        decimals: 0
                    },
                    {
                        xtype: 'commontextareafield',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Survey Comments', 'SpaceOccupancy.view.RoomForm'),
                        useFieldDefLabel: false,
                        name: 'survey_comments_rm',
                        displayEditPanel: true,
                        useNativeTextArea: true
                    },
                    {
                        name: 'survey_id',
                        readOnly: true
                    }
                ]
            }
        ]

    },

    initialize: function () {
        this.callParent(arguments);
        this.setFieldLabelAndLength('surveyrm_sync');
    },

    applyRecord: function (record) {
        //need to set the values in a specific order else setting dv_id value will reset dp_id
        if (record) {
            this.query('divisionPrompt')[0].setValue(record.get('dv_id'));
            this.query('departmentPrompt')[0].setValue(record.get('dp_id'));
        }
        return record;
    }
});