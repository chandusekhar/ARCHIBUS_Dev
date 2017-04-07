Ext.define('Maintenance.view.manager.ScheduleFormTools', {
    extend: 'Ext.Panel',

    xtype: 'scheduleFormTools',

    tabletItemTemplate: '<div class="prompt-list-hbox"><h1 style="width:50%;text-align:left">{[this.getToolDisplayValue(values.wr_id, values.tool_id)]}</h1>' +
    '<div style="width:50%;text-align:right">{[UiUtil.formatHour(values.hours_est)]} ' +
    LocaleManager.getLocalizedString("Hours", 'Maintenance.view.manager.ScheduleFormTools') +
    '</div></div>' +
    '<div class="prompt-list-hbox"><div class="prompt-list-date" style="width:35%;text-align:center">{date_assigned:date("{0}")}</div>' +
    '<div style="width:30%;text-align:right">{time_assigned:date("H:i")}</div></div>',

    phoneItemTemplate: '<div class="prompt-list-hbox"><h1 style="width:50%;text-align:left">{[this.getToolDisplayValue(values.wr_id, values.tool_id)]}</h1>' +
    '<div style="width:50%;text-align:right">{[UiUtil.formatHour(values.hours_est)]} ' +
    LocaleManager.getLocalizedString("Hours", 'Maintenance.view.manager.ScheduleFormTools') +
    '</div></div>' +
    '<div class="prompt-list-hbox"><div class="prompt-list-date" style="width:35%;text-align:center">{date_assigned:date("{0}")}</div>' +
    '<div style="width:30%;text-align:right">{time_assigned:date("H:i")}</div></div>',

    config: {
        //KB#3051445 Note 'Type form.getStoreId is not a function' pops up when I hit on Start button of field 'Time Started' in Assign Craftsperon form.
        storeId:'toolsStore',
        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        items: [
            {
                xtype: 'titlebar',
                itemId: 'assignToolToolBar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'switchToAddNewToolMode',
                        align: 'right'
                    },    
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.ScheduleFormTools'),
                        action: 'assignTool',
                        ui: 'action',
                        align: 'right'
                    },
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Assign Tool', 'Maintenance.view.manager.ScheduleFormTools')
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'assignToolForm',
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
                        name: 'tool_id',
                        itemId: 'tool_id',
                        title: LocaleManager.getLocalizedString('Tool', 'Maintenance.view.manager.ScheduleFormTools'),
                        label: LocaleManager.getLocalizedString('Tool Code', 'Maintenance.view.manager.ScheduleFormTools'),
                        required: true,
                        store: 'toolsStore',
                        displayFields: [
                            {
                                name: 'tool_id',
                                title: LocaleManager.getLocalizedString('Tool Code', 'Maintenance.view.manager.ScheduleFormTools')
                            },
                            {
                                name: 'bl_id',
                                title: LocaleManager.getLocalizedString('Building Code', 'Maintenance.view.manager.ScheduleFormTools')
                            },
                            {
                                name: 'tool_type',
                                title: LocaleManager.getLocalizedString('Tool Type', 'Maintenance.view.manager.ScheduleFormTools')
                            }
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Scheduled', 'Maintenance.view.manager.ScheduleFormTools'),
                        name: 'date_assigned',
                        itemId: 'date_assigned',
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        value: new Date(),
                        required: true
                        //width: Ext.os.is.Phone ? '100%' : '40%'
                    },
                    {
                        xtype: 'timepickerfield',
                        label: LocaleManager.getLocalizedString('Time Scheduled', 'Maintenance.view.manager.ScheduleFormTools'),
                        name: 'time_assigned',
                        itemId: 'time_assigned',
                        value: new Date(),
                        required: true,
                        style: 'border-bottom:1px solid #DDD',
                        flex: 1,
                        picker: {xtype: 'timepickerconfig'}
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Started', 'Maintenance.view.manager.ScheduleFormTools'),
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        name: 'date_start',
                        itemId: 'date_start'
                        //flex: Ext.os.is.Phone ? 1 : 4
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
                                label: LocaleManager.getLocalizedString('Time Started', 'Maintenance.view.manager.ScheduleFormTools'),
                                name: 'time_start',
                                itemId: 'time_start',
                                //labelWidth: Ext.os.is.Phone ? '40%' : '43%',
                                flex: Ext.os.is.Phone ? 1 : 5.5,
                                picker: {xtype: 'timepickerconfig'}
                            },
                            {
                                xtype: 'button',
                                itemId: 'startWorkButton',
                                margin: '4px',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Start', 'Maintenance.view.manager.ScheduleFormTools')
                            }
                        ]
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Finished', 'Maintenance.view.manager.ScheduleFormTools'),
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        name: 'date_end',
                        itemId: 'date_end'
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
                                label: LocaleManager.getLocalizedString('Time Finished', 'Maintenance.view.manager.ScheduleFormTools'),
                                name: 'time_end',
                                itemId: 'time_end',
                                flex: Ext.os.is.Phone ? 1 : 5.5,
                                //labelWidth: Ext.os.is.Phone ? '40%' : '41%',
                                picker: {xtype: 'timepickerconfig'}
                            },
                            {
                                xtype: 'button',
                                itemId: 'stopWorkButton',
                                margin: '4px',
                                style: 'height:2em',
                                text: LocaleManager.getLocalizedString('Stop', 'Maintenance.view.manager.ScheduleFormTools')
                            }
                        ]
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        label: LocaleManager.getLocalizedString('Scheduled Hours', 'Maintenance.view.manager.ScheduleFormTools'),
                        name: 'hours_est',
                        itemId: 'hours_est',
                        flex: 1
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Straight Time Hours Used', 'Maintenance.view.manager.ScheduleFormCraftspersons'),
                        name: 'hours_straight',
                        itemId: 'hours_straight',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.ScheduleFormTools')
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'workRequestToolsStore',
                itemTpl: '',
                itemId: 'toolsList',
                height: Ext.os.is.Phone ? '8em' : '6em',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            list = me.down('list'),
            issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
            || WorkRequestFilter.listType === Constants.Completed || WorkRequestFilter.listType === Constants.MyWork),
            template = Ext.os.is.Phone ? me.phoneItemTemplate : me.tabletItemTemplate,
            formattedTpl,
            xTpl;

        if (issuedOrCompletedList) {
            template = template.replace("hours_est", "hours_straight");
            template = template.replace("date_assigned", "date_end");
            template = template.replace("time_assigned", "time_end");
        }

        if (!FormUtil.userCanEditResourcesAfterIssued()) {
            me.down('button[action=switchToAddNewToolMode]').setHidden(true);
            me.down('button[action=assignTool]').setHidden(true);
        }

        formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat());
        xTpl = new Ext.XTemplate(formattedTpl, {
            getToolDisplayValue: function (wr_id, tool_id) {
                return '' + (me.getMultipleSelection() ? (wr_id + ' ') : '') + tool_id;
            }
        });

        if (list) {
            list.setItemTpl(xTpl);
        }

        me.callParent();

        me.displayFormFields();

        FormUtil.registerDatesListeners(me);
    },

    displayFormFields: function () {
        var me = this,
            displayMode = WorkRequestFilter.listType,
            visibleFields,
            editableFields,
            visibleContainers,
            visibleButtons;

        if (displayMode === Constants.Issued || displayMode === Constants.Completed || displayMode === Constants.MyWork) {
            visibleFields = ['tool_id', 'date_assigned', 'time_assigned', 'date_start', 'time_start', 'date_end', 'time_end', 'hours_est', 'hours_straight'];
            visibleContainers = ['dateTimeContainer', 'startDateTimeContainer', 'endDateTimeContainer'];
            if (FormUtil.userCanEditResourcesAfterIssued()) {
                editableFields = ['tool_id', 'date_start', 'time_start', 'date_end', 'time_end', 'hours_straight'];
            } else {
                me.down('button[itemId=startWorkButton]').setDisabled(true);
                me.down('button[itemId=stopWorkButton]').setDisabled(true);
            }
            visibleButtons = ['startWorkButton', 'stopWorkButton'];
        } else {
            visibleFields = ['tool_id', 'date_assigned', 'time_assigned', 'hours_est'];
            editableFields = ['tool_id', 'date_assigned', 'time_assigned', 'hours_est'];
            visibleContainers = ['dateTimeContainer'];
        }

        NavigationUtil.showItemsByItemId(me, visibleContainers);
        NavigationUtil.showFields(me, visibleFields, editableFields);
        NavigationUtil.showButtons(me, visibleButtons);
    }
});