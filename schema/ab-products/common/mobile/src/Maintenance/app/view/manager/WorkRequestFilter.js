Ext.define('Maintenance.view.manager.WorkRequestFilter', {
    extend: 'Common.view.navigation.FilterForm',

    requires: [
        'Common.control.field.Prompt',
        'Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room',
        'Common.control.prompt.ProblemType',
        'Common.control.prompt.Division',
        'Common.control.prompt.Department',
        'Common.control.prompt.Employee',
        'Common.control.prompt.EquipmentStandard',
        'Common.control.prompt.Equipment',
        'Common.control.field.Calendar',
        'Ext.field.Toggle'
    ],

    xtype: 'workRequestFilterPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Set Filter', 'Maintenance.view.manager.WorkRequestFilter'),

        workRequestDisplayMode: 'Approved',

        showFieldOptions: [
            {
                displayValue: LocaleManager.getLocalizedString('All', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'all'
            },
            {
                displayValue: LocaleManager.getLocalizedString('Escalated', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'escalated'
            },
            {
                displayValue: LocaleManager.getLocalizedString('My Requests', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'myRequests'
            },
            {
                displayValue: LocaleManager.getLocalizedString('Requests Requiring my Approval', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'myApproval'
            },
            // out of scope { displayValue: LocaleManager.getLocalizedString('My Approved Requests', 'Maintenance.view.manager.WorkRequestFilter'), objectValue: 'myApproved' },
            {
                displayValue: LocaleManager.getLocalizedString('Unassigned Requests', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'unassigned'
            },
            {
                displayValue: LocaleManager.getLocalizedString('10 Newest Requests', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'tenNewest'
            },
            {
                displayValue: LocaleManager.getLocalizedString('10 Oldest Requests', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'tenOldest'
            },
            {
                displayValue: LocaleManager.getLocalizedString('10 Nearing Escalation', 'Maintenance.view.manager.WorkRequestFilter'),
                objectValue: 'tenEscalation'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Show', 'Maintenance.view.manager.WorkRequestFilter'),
                        name: 'show',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'all',
                        options: []
                    }
                ]
            },

            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'buildingPrompt'
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'floorPrompt',
                                flex: 1
                            },
                            {
                                xtype: 'roomPrompt',
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'problemtypefield',
                        name: 'prob_type',
                        label: LocaleManager.getLocalizedString('Problem Type', 'Maintenance.view.manager.WorkRequestFilter')
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Work Type', 'Maintenance.view.manager.WorkRequestFilter'),
                        name: 'work_type',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'both',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('Both', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: 'both'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('On Demand', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: 'onDemand'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('PM', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: 'pm'
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'cf_id',
                        label: LocaleManager.getLocalizedString('Craftsperson',
                            'Maintenance.view.manager.WorkRequestFilter'),
                        title: LocaleManager.getLocalizedString('Craftspersons',
                            'Maintenance.view.manager.WorkRequestFilter'),
                        store: 'craftspersonStore',
                        displayFields: [
                            {
                                name: 'cf_id',
                                title: LocaleManager.getLocalizedString('Craftsperson',
                                    'Maintenance.view.manager.WorkRequestFilter')
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'divisionPrompt',
                                flex: 1
                            },
                            {
                                xtype: 'departmentPrompt',
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'employeePrompt',
                                label: LocaleManager.getLocalizedString('Requestor',
                                    'Maintenance.view.manager.WorkRequestFilter'),
                                flex: 1
                            },
                            {
                                xtype: 'prompt',
                                name: 'wr_id',
                                label: LocaleManager.getLocalizedString('Work Request',
                                    'Maintenance.view.manager.WorkRequestFilter'),
                                title: LocaleManager.getLocalizedString('Work Requests',
                                    'Maintenance.view.manager.WorkRequestFilter'),
                                store: 'workRequestPromptStore',
                                displayFields: [
                                    {
                                        name: 'wr_id',
                                        title: LocaleManager.getLocalizedString('Work Request',
                                            'Maintenance.view.manager.WorkRequestFilter')
                                    },
                                    {
                                        name: 'description',
                                        title: LocaleManager.getLocalizedString('Description',
                                            'Maintenance.view.manager.WorkRequestFilter')
                                    }
                                ],
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'equipmentStandardPrompt',
                                childFields: ['eq_id'],
                                flex: 1
                            },
                            {
                                xtype: 'equipmentPrompt',
                                label: LocaleManager.getLocalizedString('Equipment',
                                    'Maintenance.view.manager.WorkRequestFilter'),
                                parentFields: ['eq_std'],
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'part_id',
                        label: LocaleManager.getLocalizedString('Part',
                            'Maintenance.view.manager.WorkRequestFilter'),
                        title: LocaleManager.getLocalizedString('Parts',
                            'Maintenance.view.manager.WorkRequestFilter'),
                        store: 'partsStore',
                        displayFields: [
                            {
                                name: 'part_id',
                                title: LocaleManager.getLocalizedString('Part',
                                    'Maintenance.view.manager.WorkRequestFilter')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description',
                                    'Maintenance.view.manager.WorkRequestFilter')
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Priority', 'Maintenance.view.manager.WorkRequestFilter'),
                        name: 'priority',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'any',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('Any', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: 'any'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('1', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: '1'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('2', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: '2'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('3', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: '3'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('4', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: '4'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('5', 'Maintenance.view.manager.WorkRequestFilter'),
                                objectValue: '5'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date Requested From', 'Maintenance.view.manager.WorkRequestFilter'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_requested_from',
                                //value: new Date(),
                                flex: 1
                            },
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date Requested To', 'Maintenance.view.manager.WorkRequestFilter'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_requested_to',
                                //value: new Date(),
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                        },
                        items: [
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date To Perform From', 'Maintenance.view.manager.WorkRequestFilter'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_assigned_from',
                                //value: new Date(),
                                flex: 1
                            },
                            {
                                xtype: 'calendarfield',
                                label: LocaleManager.getLocalizedString('Date To Perform To', 'Maintenance.view.manager.WorkRequestFilter'),
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_assigned_to',
                                //value: new Date(),
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'togglefield',
                        name: 'escalated',
                        value: false,
                        label: LocaleManager.getLocalizedString('Escalated ?', 'Maintenance.view.manager.WorkRequestFilter')
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this;

        me.callParent();

        me.addOptionsToShowField(me.getWorkRequestDisplayMode());

        me.filterWorkRequestPromptStore(me.getWorkRequestDisplayMode());
    },

    /**
     * Add the options to the Show field.
     *
     * @param listType
     */
    addOptionsToShowField: function (listType) {
        var me = this,
            showField = me.down('selectlistfield[name=show]'),
            showMyApproval = (listType === Constants.Requested),
            showUnassigned = (listType === Constants.Approved),
            myApprovalIndex = 3,
            unassignedIndex = 4,
            optionRemoved = false,
            showFieldOptions = me.getShowFieldOptions();


        if (!showMyApproval) {
            // remove Requests Requiring my Approval option
            showFieldOptions.splice(myApprovalIndex, 1);
            optionRemoved = true;
        }

        if (!showUnassigned) {
            // remove Unassigned Requests option
            showFieldOptions.splice(unassignedIndex - (optionRemoved ? 1 : 0), 1);
        }

        showField.setOptions(showFieldOptions);
    },

    /**
     * Changes the WorkRequestPromptStore view definition to include the work request status filter.
     *
     * @param listType
     */
    filterWorkRequestPromptStore: function (listType) {
        var workRequestPromptStore = Ext.getStore('workRequestPromptStore'),
            viewDefinitionTpl = workRequestPromptStore.getViewDefinitionTpl(),
            sqliteView = workRequestPromptStore.getProxy(),
            workRequestStatuses = WorkRequestFilter.getListTypeStatuses(listType),
            viewDefinition = '';

        if (!Ext.isEmpty(workRequestStatuses)) {
            viewDefinition = ' AND status_initial IN (\'' + workRequestStatuses.join('\',\'') + '\')';
        }

        viewDefinition = Ext.String.format(viewDefinitionTpl, viewDefinition);
        sqliteView.setViewDefinition(viewDefinition);
        workRequestPromptStore.loadPage(1);
    }
});
