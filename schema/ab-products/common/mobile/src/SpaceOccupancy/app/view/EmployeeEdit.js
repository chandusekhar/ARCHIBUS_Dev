Ext.define('SpaceOccupancy.view.EmployeeEdit', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'employeeEdit',

    config: {
        title: LocaleManager.getLocalizedString('Employee Edit Form', 'SpaceOccupancy.view.EmployeeEdit'),

        model: 'SpaceOccupancy.model.EmployeeSurvey',
        storeId: 'employeesSyncStore',

        showSaveButton: false,
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

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                align: 'right',
                iconCls: 'check',
                cls: 'ab-icon-action',
                action: 'doneEmployeeEdit'
            }
        ],

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
                        name: 'em_id',
                        required: true
                    },
                    {
                        name: 'name_first',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Name First', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    },
                    {
                        name: 'name_last',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Name Last', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    },
                    {
                        name: 'em_number'
                    },
                    {
                        xtype: 'employeeStandardPrompt'
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
                        label: LocaleManager.getLocalizedString('Division', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    },
                    {
                        xtype: 'departmentPrompt',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Department', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    },
                    {
                        name: 'phone',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Phone', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    },
                    {
                        name: 'email',
                        // custom shorter label
                        label: LocaleManager.getLocalizedString('Email', 'SpaceOccupancy.view.EmployeeEdit'),
                        useFieldDefLabel: false
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var emIdField = this.down('commontextfield[name=em_id]');

        this.callParent();
        this.setFieldLabelAndLength('em_sync');
        this.setFields();

        // Force em_id to be upper case KB 3045140
        emIdField.on('keyup', function (commontextfield, e) {
            var value = commontextfield.getValue().toUpperCase();
            e.stopPropagation();
            e.stopEvent();
            commontextfield.setValue('');
            commontextfield.setValue(value);
        }, this);
    },

    applyRecord: function (record) {
        //need to set the values in a specific order else setting dv_id value will reset dp_id
        if (record) {
            this.query('divisionPrompt')[0].setValue(record.get('dv_id'));
            this.query('departmentPrompt')[0].setValue(record.get('dp_id'));
        }
        return record;
    },

    setFields: function () {
        var me = this,
            isCreateView = me.getIsCreateView(),
            emText = me.query('commontextfield[name=em_id]')[0];

        if (emText) {
            emText.setReadOnly(!isCreateView);
        }
    }
});