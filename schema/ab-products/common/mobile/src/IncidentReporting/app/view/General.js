Ext.define('IncidentReporting.view.General', {
    extend: 'Common.view.navigation.EditBase',
    xtype: 'generalcard',

    config: {
        title: LocaleManager.getLocalizedString('Incident Details', 'IncidentReporting.view.General'),

        isCreateView: false,
        showSaveButton: null, //hide both Add and Save buttons
        model: 'IncidentReporting.model.Incident',
        storeId: 'incidentsStore',
        parentRecord: null,

        addViewClass: 'IncidentReporting.view.Witness',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                align: 'left',
                iconCls: 'camera',
                action: 'capturePhoto',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'toolbar',
                itemId: 'generaltoolbar',
                docked: 'bottom',
                items: [
                    // Add ButtonPicker to the toolbar
                    {
                        xtype: 'buttonpicker',
                        text: LocaleManager.getLocalizedString('Add Incident Details', 'IncidentReporting.view.General'),
                        store: 'detailButtonsStore',
                        valueField: 'view_name',
                        displayField: 'title',
                        badgeField: 'badge_value',
                        centered: true,
                        hidden: true,
                        panelHeight: '12em',
                        panelHeightOnPhone: '12em'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'generalFieldSet',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },

                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'mob_incident_id'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'parent_incident_id'
                    },
                    {
                        xtype: 'label',
                        html: LocaleManager.getLocalizedString('One and only one of these fields is mandatory:<br />Affected Employee, Non-Emp. Contact Code or Affected Non-Emp. Name', 'IncidentReporting.view.General'),
                        itemId: 'generalInstructionLabel',
                        style: 'color: red; margin-left: 1em'
                    },
                    {
                        xtype: 'incidentEmployeePrompt',
                        name: 'em_id_affected',
                        valueField: 'em_id',
                        store: 'affectedEmployees'
                    },
                    {
                        xtype: 'contactPrompt'
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'non_em_name'
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'non_em_info'
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_incident',
                        required: true,
                        style: 'margin: 1.5em 0 0 0;'
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_incident',
                        picker: {
                            xtype: 'timepickerconfig',
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        }
                    },
                    {
                        xtype: 'incidentTypePrompt',
                        required: true
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'description',
                        displayEditPanel: true,
                        useNativeTextArea: true
                    },
                    {
                        xtype: 'incidentEmployeePrompt',
                        name: 'reported_by',
                        valueField: 'em_id'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            record = this.getRecord();
        me.callParent(arguments);

        if (!record) {
            record = Ext.create('IncidentReporting.model.Incident');
        }
        record.set('date_incident', new Date());
        record.set('reported_by', ConfigFileManager.employeeId);
        record.set('recorded_by', ConfigFileManager.employeeId);

        me.setRecord(record);

        me.setFieldLabelAndLength('ehs_incidents');

        IncidentReporting.util.Ui.setCameraIconVisibility(me.toolBarButtons);

    },

    /**
     * Copy values from parent incident to current incident. Called on copy incident action in class IncidentNavigation.
     * @param parentRecord
     * @returns {*}
     */
    applyParentRecord: function (parentRecord) {
        var record = this.getRecord(),
            fieldNames = ['parent_incident_id', 'date_incident', 'incident_type', 'time_incident', 'recorded_by',
                'reported_by', 'description', 'site_id', 'pr_id', 'bl_id', 'fl_id', 'rm_id'],
            i;
        if (record) {
            for (i = 0; i < fieldNames.length; i++) {
                record.set(fieldNames[i], parentRecord.get(fieldNames[i]));
            }
            this.setRecord(record);
        }
        return parentRecord;
    }
});