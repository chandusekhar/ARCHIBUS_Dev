Ext.define('Maintenance.view.manager.ScheduleFormCraftspersons', {
    extend: 'Ext.Panel',

    xtype: 'scheduleFormCraftspersons',

    editableFields: [],

    config: {
        //KB#3051445 Note 'Type form.getStoreId is not a function' pops up when I hit on Start button of field 'Time Started' in Assign Craftsperon form.
        storeId: 'workRequestCraftspersonsStore',
        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        wrRecord: null,

        items: [
            {
                xtype: 'titlebar',
                itemId: 'assignCraftspersonToolBar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'switchToAddNewCfMode',
                        align: 'right'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        action: 'assignCraftsperson',
                        ui: 'action',
                        align: 'right'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Copy', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        action: 'copyCraftsperson',
                        ui: 'action',
                        hidden: true,
                        align: 'right'
                    },
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Assign Craftsperson', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'assignCraftspersonForm',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    stepValue: 0.1,
                    minValue: 0,
                    readOnly: true,
                    hidden: true
                },
                items: [
                    {
                        xtype: 'prompt',
                        name: 'cf_id',
                        itemId: 'cf_id',
                        title: LocaleManager.getLocalizedString('Craftsperson', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        label: LocaleManager.getLocalizedString('Craftsperson Code', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        required: true,
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
                        flex: 1
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Scheduled', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'date_assigned',
                        itemId: 'date_assigned',
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        required: true,
                        value: new Date(),
                        flex: 1
                    },
                    {
                        xtype: 'timepickerfield',
                        label: LocaleManager.getLocalizedString('Time Scheduled', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'time_assigned',
                        itemId: 'time_assigned',
                        required: true,
                        value: new Date(),
                        style: 'border-bottom:1px solid #DDD',
                        flex: 1,
                        picker: {xtype: 'timepickerconfig'}
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        label: LocaleManager.getLocalizedString('Scheduled Hours', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'hours_est',
                        itemId: 'hours_est',
                        flex: 1
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Actual Hours', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'hours_straight',
                        itemId: 'hours_straight',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Overtime Hours', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'hours_over',
                        itemId: 'hours_over',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Doubletime Hours', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'hours_double',
                        itemId: 'hours_double',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Started', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        name: 'date_start',
                        itemId: 'date_start',
                        flex: Ext.os.is.Phone ? 1 : 4
                    },
                    {
                        xtype: 'container',
                        itemId: 'startDateTimeContainer',
                        layout: Ext.os.is.Phone ? '' : 'hbox',
                        defaults: {
                            labelWidth: '40%',
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                            readOnly: true,
                            hidden: true
                        },
                        items: [
                            {
                                xtype: 'timepickerfield',
                                label: LocaleManager.getLocalizedString('Time Started', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                                name: 'time_start',
                                itemId: 'time_start',
                                picker: {xtype: 'timepickerconfig'},
                                flex: Ext.os.is.Phone ? 1 : 5.5
                            },
                            {
                                xtype: 'button',
                                itemId: 'startWorkButton',
                                margin: '4px',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Start', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                            }
                        ]
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Finished', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        name: 'date_end',
                        itemId: 'date_end',
                        flex: Ext.os.is.Phone ? 1 : 4
                    },
                    {
                        xtype: 'container',
                        itemId: 'endDateTimeContainer',
                        layout: Ext.os.is.Phone ? '' : 'hbox',
                        defaults: {
                            labelWidth: '40%',
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                            readOnly: true,
                            hidden: true
                        },
                        items: [
                            {
                                xtype: 'timepickerfield',
                                label: LocaleManager.getLocalizedString('Time Finished', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                                name: 'time_end',
                                itemId: 'time_end',
                                picker: {xtype: 'timepickerconfig'},
                                flex: Ext.os.is.Phone ? 1 : 5.5
                            },
                            {
                                xtype: 'button',
                                itemId: 'stopWorkButton',
                                margin: '4px',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Stop', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Work Type', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'work_type',
                        itemId: 'work_type',
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
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Status', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'status',
                        itemId: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard work types are entered here to handle the
                        // case when the TableDef is not available.
                        options: [
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'commontextareafield',
                        label: LocaleManager.getLocalizedString('Comments', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'comments',
                        itemId: 'comments'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.ScheduleFormCraftspersons')
                    }
                ]
            },
            {
                xtype: 'wrCraftspersonList',
                multipleSelection: false,
                itemId: 'craftspersonsList',
                height: Ext.os.is.Phone ? '8em' : '6em',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            cfIdField = me.down('field[name=cf_id]'),
            wrRecord = me.getWrRecord(),
            statusEnumList,
            workTypeEnumList,
            issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
            || WorkRequestFilter.listType === Constants.Completed);

        me.callParent();

        if(me.getMultipleSelection()){
            wrRecord = Ext.getStore('workRequestsStore').getSelectedWorkRequests()[0];
        }
        
        workTypeEnumList = TableDef.getEnumeratedList('wrcf_sync', 'work_type');
        if (workTypeEnumList && workTypeEnumList.length > 0) {
            me.query('selectfield[name=work_type]')[0].setOptions(workTypeEnumList);
        }
        
        statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
        if (statusEnumList && statusEnumList.length > 0) {
            me.query('selectfield[name=status]')[0].setOptions(statusEnumList);
        }

        // after the WR was issued, only Supervisor can add craftspersons
        if (!FormUtil.userCanEditResourcesAfterIssued()
            || (ApplicationParameters.getUserRoleName() !== 'supervisor'
            && wrRecord && wrRecord.get('is_req_craftsperson') !== 1)
            || (wrRecord && wrRecord.get('is_req_supervisor') === 0 && wrRecord.get('is_req_craftsperson') === 1 && !ApplicationParameters.isCraftspersonPlanner)) {
            me.down('button[action=switchToAddNewCfMode]').setHidden(true);
            me.down('button[action=assignCraftsperson]').setHidden(true);
        } else if (issuedOrCompletedList && ApplicationParameters.getUserRoleName() !== 'supervisor'
            && ((wrRecord && wrRecord.get('is_req_craftsperson') === 1) || me.getMultipleSelection())) {
            cfIdField.setValue(userProfile.cf_id);
        }

        me.displayFormFields();

        if(wrRecord && wrRecord.get('is_req_supervisor') === 0 && wrRecord.get('is_req_craftsperson') === 1 && ApplicationParameters.isCraftspersonPlanner){
            Ext.each(me.query('field'), function (field) {
                field.setReadOnly(true);
            });
            me.down('button[itemId=startWorkButton]').setDisabled(true);
            me.down('button[itemId=stopWorkButton]').setDisabled(true);

            FormUtil.setFieldsReadOnly(me, ['cf_id','work_type'], false);
        }

        FormUtil.registerDatesListeners(me);
    },

    applyRecord: function (wrRecord) {
        var me = this;

        if (wrRecord) {
            me.setWrRecord(wrRecord);
        }
    },

    applyMultipleSelection: function (config) {
        // set the multiple selection flag to the craftsperson list
        this.down('[itemId=craftspersonsList]').setMultipleSelection(config);

        return config;
    },

    displayFormFields: function () {
        var me = this,
            displayMode = WorkRequestFilter.listType,
            visibleFields,
            visibleButtons,
            visibleContainers,
            wrRecord = me.getWrRecord();

        if (displayMode === Constants.Issued || displayMode === Constants.Completed) {
            visibleFields = ['cf_id', 'date_assigned', 'time_assigned', 'hours_est',
                'hours_straight', 'hours_over', 'hours_double',
                'date_start', 'time_start', 'date_end', 'time_end',
                'work_type', 'comments', 'status'];
            if (FormUtil.userCanEditResourcesAfterIssued()) {
                me.editableFields = [//'cf_id',
                    'hours_straight', 'hours_over', 'hours_double',
                    'date_start', 'time_start', 'date_end', 'time_end',
                    'work_type', 'comments', 'status'];

                if (!(ApplicationParameters.getUserRoleName() !== 'supervisor'
                    && ((wrRecord && wrRecord.get('is_req_craftsperson') === 1) || me.getMultipleSelection()))) {
                    me.editableFields = me.editableFields.concat('cf_id');
                }else{
                    //KB#3051620 Planner: Craftsperson Code field should be editable in Issued form/Assign Craftsperson form.
                    if( ApplicationParameters.isCraftspersonPlanner){
                        me.editableFields = me.editableFields.concat('cf_id');
                    }
                }
            } else {
                me.down('button[itemId=startWorkButton]').setDisabled(true);
                me.down('button[itemId=stopWorkButton]').setDisabled(true);
            }
            visibleButtons = ['startWorkButton', 'stopWorkButton'];
            visibleContainers = ['dateTimeContainer', 'startDateTimeContainer', 'endDateTimeContainer'];
        } else {
            visibleFields = ['cf_id', 'date_assigned', 'time_assigned', 'hours_est', 'work_type', 'status'];
            me.editableFields = ['cf_id', 'date_assigned', 'time_assigned', 'hours_est', 'work_type', 'status'];
            visibleContainers = ['dateTimeContainer'];
        }

        NavigationUtil.showItemsByItemId(me, visibleContainers);
        NavigationUtil.showFields(me, visibleFields, me.editableFields);
        NavigationUtil.showButtons(me, visibleButtons);
    }
});