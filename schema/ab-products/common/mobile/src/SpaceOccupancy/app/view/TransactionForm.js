Ext.define('SpaceOccupancy.view.TransactionForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'transactionForm',

    requires: [
        'Common.control.config.DatePicker',
        'Common.control.Select'
    ],

    config: {
        model: 'SpaceOccupancy.model.RoomPct',
        storeId: 'roomPctsStore',

        showSaveButton: true,
        hideSaveButtons: false,

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
                xtype: 'fieldset',
                defaults: {
                    xtype: 'commontextfield',
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        name: 'pct_id',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Transaction Code', 'SpaceOccupancy.view.TransactionForm'),
                        useFieldDefLabel: false,
                        readOnly: true
                    },
                    {
                        name: 'bl_id',
                        readOnly: true
                    },
                    {
                        name: 'fl_id',
                        readOnly: true
                    },
                    {
                        name: 'rm_id',
                        readOnly: true
                    },
                    {
                        xtype: 'divisionPrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Division', 'SpaceOccupancy.view.TransactionForm'),
                        useFieldDefLabel: false,
                        readOnly: true
                    },
                    {
                        xtype: 'departmentPrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Department', 'SpaceOccupancy.view.TransactionForm'),
                        useFieldDefLabel: false,
                        readOnly: true
                    },
                    {
                        xtype: 'roomCategoryPrompt',
                        readOnly: true
                    },
                    {
                        xtype: 'roomTypePrompt',
                        readOnly: true
                    },
                    {
                        xtype: 'employeePrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Employee', 'SpaceOccupancy.view.TransactionForm'),
                        useFieldDefLabel: false,
                        store: 'employeesSyncStore',
                        displayTemplate: {
                            phone: '<div class="prompt-list-hbox"><div style="width:100%"><h1>{em_id}</h1></div></div>' +
                            '<div class="prompt-list-hbox"><div style="width:40%"><h3>{name_first}</h3></div><div style="width:60%"><h3>{name_last}</h3></div></div>' +
                            '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>',
                            tablet: '<div class="prompt-list-hbox"><div style="width:40%"><h1>{em_id}</h1></div><div style="width:30%"><h1>{name_first}</h1></div><div style="width:30%"><h1>{name_last}</h1></div></div>' +
                            '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>' +
                            '<div class="prompt-list-hbox"><div style="width:40%"><h3>{dv_id}</h3></div><div style="width:60%"><h3>{dp_id}</h3></div></div>'
                        },
                        headerTemplate: {
                            phone: '<div style="display:none"></div>',
                            tablet: '<div style="display:none"></div>'
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'pct_space',
                        clearIcon: false
                    },
                    {
                        xtype: 'commondatepickerfield',
                        name: 'date_start',
                        readOnly: true,
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        picker: {xtype: 'datepickerconfig'}
                    },
                    {
                        xtype: 'commondatepickerfield',
                        name: 'date_end',
                        readOnly: true,
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        picker: {xtype: 'datepickerconfig'}
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'primary_rm',
                        options: [
                            {
                                text: LocalizedStrings.z_No,
                                value: '0'
                            },
                            {
                                text: LocalizedStrings.z_Yes,
                                value: '1'
                            }
                        ],
                        readOnly: true
                    },
                    {
                        xtype: 'selectlistfield',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Primary Employee', 'SpaceOccupancy.view.TransactionForm'),
                        useFieldDefLabel: false,
                        name: 'primary_em',
                        options: [
                            {
                                text: LocalizedStrings.z_No,
                                value: '0'
                            },
                            {
                                text: LocalizedStrings.z_Yes,
                                value: '1'
                            }
                        ],
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'id',
                        hidden: true
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent();
        this.setFieldLabelAndLength('rmpctmob_sync');
    },

    applyRecord: function (record) {
        var isPrimaryRm, isPrimaryEm;

        //need to set the values in a specific order else setting dv_id value will reset dp_id
        if (record) {
            this.query('divisionPrompt')[0].setValue(record.get('dv_id'));
            this.query('departmentPrompt')[0].setValue(record.get('dp_id'));
        }

        if (record) {
            // For any record that has either primary flag set to 1, the user cannot edit any data that will change the primary record
            // except for the %.
            // For primary_rm = 0 the user may edit Division, Department, Category, Type and %.
            // For primary_em = 0 the Employee and % can be edited.
            // If both Primary flags are set to 0, then dv, dp, cat, type, em, %, start date, end date can be edited.
            isPrimaryRm = (record.get('primary_rm') === 1);
            isPrimaryEm = (record.get('primary_em') === 1);
            this.query('divisionPrompt')[0].setReadOnly(isPrimaryRm);
            this.query('departmentPrompt')[0].setReadOnly(isPrimaryRm);
            this.query('roomCategoryPrompt')[0].setReadOnly(isPrimaryRm);
            this.query('roomTypePrompt')[0].setReadOnly(isPrimaryRm);
            this.query('employeePrompt')[0].setReadOnly(isPrimaryEm);
            this.query('datepickerfield[name=date_start]')[0].setReadOnly(isPrimaryRm || isPrimaryEm);
            this.query('datepickerfield[name=date_end]')[0].setReadOnly(isPrimaryRm || isPrimaryEm);
        }

        return record;
    }
});