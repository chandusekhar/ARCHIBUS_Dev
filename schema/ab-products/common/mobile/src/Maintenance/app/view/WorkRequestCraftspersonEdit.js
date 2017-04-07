Ext.define('Maintenance.view.WorkRequestCraftspersonEdit', {
    extend: 'Maintenance.view.WorkRequestEditBase',
    xtype: 'workRequestCraftspersonEditPanel',

    requires: [
        'Common.control.field.Calendar',
        'Common.control.config.TimePicker'],

    config: {
        model: 'Maintenance.model.WorkRequestCraftsperson',
        storeId: 'workRequestCraftspersonsStore',
        title: '',

        addTitle: LocaleManager.getLocalizedString('Add Craftsperson', 'Maintenance.view.WorkRequestCraftspersonEdit'),
        editTitle: LocaleManager.getLocalizedString('Edit Craftsperson', 'Maintenance.view.WorkRequestCraftspersonEdit'),

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: !Ext.os.is.Phone
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    stepValue: 0.1,
                    minValue: 0
                },
                items: [

                    {
                        xtype: 'prompt',
                        name: 'cf_id',
                        store: 'craftspersonInPlannerWorkTeamStore',
                        displayFields: [
                            {
                                name: 'cf_id',
                                title: LocaleManager.getLocalizedString('Craftsperson Code', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                            },
                            {
                                name: 'tr_id',
                                title: LocaleManager.getLocalizedString('Primary Trade', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                            }
                        ],
                        label: LocaleManager.getLocalizedString('Craftsperson', 'Maintenance.view.WorkRequestCraftspersonEdit')
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Actual Hours', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'hours_straight',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Overtime Hours', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'hours_over',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Doubletime Hours', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'hours_double',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'container',
                        layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date Started', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_start',
                                flex: Ext.os.is.Phone ? 1 : 5
                            },
                            {
                                xtype: 'timepickerfield',
                                label: LocaleManager.getLocalizedString('Time Started', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                                name: 'time_start',
                                flex: Ext.os.is.Phone ? 1 : 4.5,
                                picker: {xtype: 'timepickerconfig'}
                            },
                            {
                                xtype: 'button',
                                margin: '4px',
                                itemId: 'startWorkButton',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Start', 'Maintenance.view.WorkRequestCraftspersonEdit')
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date Finished', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_end',
                                flex: Ext.os.is.Phone ? 1 : 5
                            },
                            {
                                xtype: 'timepickerfield',
                                label: LocaleManager.getLocalizedString('Time Finished', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                                name: 'time_end',
                                flex: Ext.os.is.Phone ? 1 : 4.5,
                                picker: {xtype: 'timepickerconfig'}
                            },
                            {
                                xtype: 'button',
                                margin: '4px',
                                itemId: 'stopWorkButton',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Stop', 'Maintenance.view.WorkRequestCraftspersonEdit')
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        label:  LocaleManager.getLocalizedString('Work Type', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'work_type',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard work types are entered here to handle the
                        // case when the TableDef is not available.
                        options: [
                            {
                                displayValue: 'UnSpecified',
                                objectValue: 'UnSp'
                            },
                            {
                                displayValue: 'Work',
                                objectValue: 'W'
                            },
                            {
                                displayValue: 'Material Pickup',
                                objectValue: 'P'
                            },
                            {
                                displayValue: 'Job Setup or Prep.',
                                objectValue: 'Prep'
                            },
                            {
                                displayValue: 'Travel Time',
                                objectValue: 'Tr'
                            },
                            {
                                displayValue: 'Wait for Security',
                                objectValue: 'WSec'
                            },
                            {
                                displayValue: 'Wait for Client',
                                objectValue: 'WCli'
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        label:  LocaleManager.getLocalizedString('Status', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard work types are entered here to handle the
                        // case when the TableDef is not available.
                        options: [
                            {
                                displayValue: 'Active',
                                objectValue: 'Active'
                            },
                            {
                                displayValue: 'Complete',
                                objectValue: 'Complete'
                            },
                            {
                                displayValue: 'Returned',
                                objectValue: 'Returned'
                            }
                        ]
                    },
                    {
                        xtype: 'commontextareafield',
                        label:  LocaleManager.getLocalizedString('Comments', 'Maintenance.view.WorkRequestCraftspersonEdit'),
                        name: 'comments'
                    }
                ]

            }
        ]

    },

    initialize: function () {
        // Set the title
        var me = this,
            userProfile,
            record = me.getRecord(),
            workEnumList,
            statusEnumList,
            fieldName;

        me.callParent();

        workEnumList = TableDef.getEnumeratedList('wrcf_sync', 'work_type');
        if (workEnumList && workEnumList.length > 0) {
            me.query('selectfield[name=work_type]')[0].setOptions(workEnumList);
        }
        
        statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
        if (statusEnumList && statusEnumList.length > 0) {
            me.query('selectfield[name=status]')[0].setOptions(statusEnumList);
        }

        // Get the cf_id value
        userProfile = Common.util.UserProfile.getUserProfile();
        if (me.getIsCreateView()) {
            //KB#3051491 If view is eidt view then set work_type and status value.
            record.set('work_type','UnSp');
            record.set('status','Active');

            me.setValues(userProfile);
            //record.setData(userProfile); it erases the wr_id and mob_wr_id values
            for (fieldName in userProfile) {
                if (userProfile.hasOwnProperty(fieldName) && Ext.isDefined(record.get(fieldName))) {
                    record.set(fieldName, userProfile[fieldName]);
                }
            }
        }

        me.setFieldLabelAndLength('wrcf_sync');

        // Adjust height of the date and time controls
        Ext.each(me.query('calendarfield'), function (control) {
            control.setHeight('100%');
        });

        FormUtil.registerDatesListeners(me);
    },

    applyViewIds: function (config) {
        var me = this,
            formHeader = me.down('formheader');
        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    },

    setRecord: function (record) {
        var me = this,
            statusEnumList,
            newOptionListWithoutReturned = [],
            isCreateView = me.getIsCreateView(),
            userProfile;

        me.callParent(arguments);

        if (isCreateView) {
            return;
        }
        if (record) {
            userProfile = Common.util.UserProfile.getUserProfile();
            if (userProfile.cf_id !== record.get('cf_id')) {
                this.setAllFieldsReadOnly();
            } else {
                if (!ApplicationParameters.isCraftspersonPlanner) {
                    me.down('field[name=cf_id]').setReadOnly(true);
                }
            }

            if (record.get('status') === 'Returned') {
                statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
                if (statusEnumList && statusEnumList.length > 0) {
                    me.query('selectfield[name=status]')[0].setOptions(statusEnumList);
                }
            } else {
                statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
                for (var i = 0; i < statusEnumList.length; i++) {
                    if (statusEnumList[i].objectValue !== 'Returned') {
                        newOptionListWithoutReturned.push(statusEnumList[i]);
                    }
                }
                if (newOptionListWithoutReturned && newOptionListWithoutReturned.length > 0) {
                    me.query('selectfield[name=status]')[0].setOptions(newOptionListWithoutReturned);
                }

                if (record.get('status') === 'Complete') {
                    if (record.get('hours_straight') > 0 || record.get('hours_double') > 0 || record.get('hours_over') > 0) {
                        me.query('selectfield[name=status]')[0].setReadOnly(true);
                    } else {
                        me.query('selectfield[name=status]')[0].setReadOnly(false);
                    }
                }
            }
        }
    },

    setAllFieldsReadOnly: function () {
        var me = this,
            fields = me.query('field');
        Ext.each(fields, function (field) {
            field.setReadOnly(true);
        });

        me.down('button[itemId=startWorkButton]').setDisabled(true);
        me.down('button[itemId=stopWorkButton]').setDisabled(true);
    },

    applyRecord: function (record) {
        var me = this,
            viewIds = me.getViewIds();
        if (!record) {
            record = Ext.create('Maintenance.model.WorkRequestCraftsperson');
        }
        record.set('wr_id', viewIds.workRequestId);
        record.set('mob_wr_id', viewIds.mobileId);
        return record;
    }
});