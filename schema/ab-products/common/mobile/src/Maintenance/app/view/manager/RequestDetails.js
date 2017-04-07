// TODO: Localize field labels using the translated headings that are available in the TableDef
Ext.define('Maintenance.view.manager.RequestDetails', {
    extend: 'Ext.Panel',

    requires: ['Common.control.field.Prompt',
        'Common.control.prompt.ProblemType',
        'Common.control.prompt.Site',
        'Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room',
        'Common.control.prompt.Equipment'],

    xtype: 'requestDetailsPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: !Ext.os.is.Phone,
                dateLabel: LocaleManager.getLocalizedString('Date Requested', 'Maintenance.view.manager.RequestDetails')
            },
            {
                xtype: 'fieldset',
                style: 'margin-top:0.2em',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextareafield',
                        //KB#3046703, Change the title and label for the Comments field(on the screen to approve) to be 'Approver's Comments'.
                        label: LocaleManager.getLocalizedString("Approver's Comments", 'Maintenance.view.manager.RequestDetails'),
                        title: LocaleManager.getLocalizedString("Approver's Comments", 'Maintenance.view.manager.RequestDetails'),
                        name: 'mob_step_comments',
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        displayEditPanel: true,
                        hidden: true,
                        readOnly: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                style: 'margin-top:0.2em',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        name: 'requestor',
                        readOnly: true,
                        label: LocaleManager.getLocalizedString('Requestor', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'date_requested'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'wr_id'
                    },
                    {
                        xtype: 'buildingPrompt',
                        name: 'bl_id',
                        readOnly: true,
                        label: LocaleManager.getLocalizedString('Building', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'floorPromptStore',
                        label: LocaleManager.getLocalizedString('Floor', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'roomPromptStore',
                        label: LocaleManager.getLocalizedString('Room', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'location',
                        label: LocaleManager.getLocalizedString('Problem Location', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true,
                        readOnly: true
                    },

                    {
                        xtype: 'problemtypefield',
                        name: 'prob_type',
                        label: LocaleManager.getLocalizedString('Problem Type', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'selectfield',
                        name: 'status',
                        label: LocaleManager.getLocalizedString('Status', 'Maintenance.view.manager.RequestDetails'),
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values are provided for the case
                        // where the TableDef object is not available.
                        options: [
                            {
                                displayValue: 'Requested',
                                objectValue: 'R'
                            },
                            {
                                displayValue: 'Reviewed but On Hold',
                                objectValue: 'Rev'
                            },
                            {
                                displayValue: 'Rejected',
                                objectValue: 'Rej'
                            },
                            {
                                displayValue: 'Approved',
                                objectValue: 'A'
                            },
                            {
                                displayValue: 'Assigned to Work Order',
                                objectValue: 'AA'
                            },
                            {
                                displayValue: 'Issued and In Process',
                                objectValue: 'I'
                            },
                            {
                                displayValue: 'On Hold for Parts',
                                objectValue: 'HP'
                            },
                            {
                                displayValue: 'On Hold for Access',
                                objectValue: 'HA'
                            },
                            {
                                displayValue: 'On Hold for Labor',
                                objectValue: 'HL'
                            },
                            {
                                displayValue: 'Stopped',
                                objectValue: 'S'
                            },
                            {
                                displayValue: 'Cancelled',
                                objectValue: 'Can'
                            },
                            {
                                displayValue: 'Completed',
                                objectValue: 'Com'
                            },
                            {
                                displayValue: 'Closed',
                                objectValue: 'Clo'
                            }
                        ],
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'equipmentPrompt',
                        parentFields: ['bl_id', 'fl_id', 'rm_id'],
                        label: LocaleManager.getLocalizedString('Equipment Code', 'Maintenance.view.manager.RequestDetails'),
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Priority', 'Maintenance.view.manager.RequestDetails'),
                        name: 'priority',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: '1',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('1', 'Maintenance.view.manager.RequestDetails'),
                                objectValue: '1'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('2', 'Maintenance.view.manager.RequestDetails'),
                                objectValue: '2'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('3', 'Maintenance.view.manager.RequestDetails'),
                                objectValue: '3'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('4', 'Maintenance.view.manager.RequestDetails'),
                                objectValue: '4'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('5', 'Maintenance.view.manager.RequestDetails'),
                                objectValue: '5'
                            }
                        ],
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'description',
                        serverTableName: 'wr_sync',
                        title: LocaleManager.getLocalizedString('Description',
                            'Maintenance.view.manager.RequestDetails'),
                        label: LocaleManager.getLocalizedString('Description', 'Maintenance.view.manager.RequestDetails'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        displayEditPanel: true,
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'cf_notes',
                        title: LocaleManager.getLocalizedString('Craftsperson Notes',
                            'Maintenance.view.manager.RequestDetails'),
                        label: LocaleManager.getLocalizedString('Craftsperson Notes', 'Maintenance.view.manager.RequestDetails'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        displayEditPanel: true,
                        hidden: true,
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        readOnly: true,
                        label: LocaleManager.getLocalizedString('Related Requests', 'Maintenance.view.manager.RequestDetails')
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            dateRequestedField, wrkRequestField,
            statusEnumList;

        me.callParent();


        // Retrieve the status list enumerated values
        statusEnumList = TableDef.getEnumeratedList('wr_sync', 'status');
        if (statusEnumList && statusEnumList.length > 0) {
            me.query('selectfield[name=status]')[0].setOptions(statusEnumList);
        }

        // Set the Date Requested value in the form header
        dateRequestedField = me.query('hiddenfield[name=date_requested]')[0];
        dateRequestedField.on('change', this.onDateRequestedChanged, this);

        // Set the Request Id value in the form header
        wrkRequestField = me.query('hiddenfield[name=wr_id]')[0];
        wrkRequestField.on('change', this.onWorkRequestIdChanged, this);
    },

    onDateRequestedChanged: function (field, newValue) {
        var me = this;
        me.down('formheader').setDateValue(newValue);
    },

    onWorkRequestIdChanged: function (field, newValue) {
        var me = this;
        me.down('formheader').setWorkRequestId(newValue);
    }
});