Ext.define('IncidentReporting.view.Witness', {
    extend: 'Common.view.navigation.EditBase',
    xtype: 'witnesscard',

    config: {
        title: LocaleManager.getLocalizedString('Witness', 'IncidentReporting.view.Witness'),
        isCreateView: false,
        model: 'IncidentReporting.model.IncidentWitness',
        storeId: 'incidentWitnessesStore',
        editViewClass: 'IncidentReporting.view.Witness',
        mobIncidentId: null,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Delete', 'IncidentReporting.view.Witness'),
                action: 'deleteWitness',
                displayOn: 'update',
                align: 'right'
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
                        xtype: 'label',
                        html: '', //text is filled in dinamicaly from IncidentNavigation.js
                        itemId: 'witnessInstructionLabel',
                        style: 'color: red; margin-left: 1em'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'witness_type',
                        value: 'Employee',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        required: true,
                        options: [
                            {
                                text: LocaleManager.getLocalizedString('Employee', 'IncidentReporting.view.Witness'),
                                value: 'Employee'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Non-Employee', 'IncidentReporting.view.Witness'),
                                value: 'Non-Employee'
                            }
                        ]
                    },
                    {
                        xtype: 'incidentEmployeePrompt'
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
                        xtype: 'commontextareafield',
                        name: 'information',
                        required: true
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var record = this.getRecord(),
            witnessTypeEnumList = TableDef.getEnumeratedList('ehs_incident_witness', 'witness_type');

        this.callParent(arguments);

        if (!record) {
            record = Ext.create('IncidentReporting.model.IncidentWitness');
        }
        record.set('witness_type', 'Employee');
        this.setRecord(record);

        //set witness_type options
        if (witnessTypeEnumList && witnessTypeEnumList.length > 0) {
            this.query('selectfield[name=witness_type]')[0].setOptions(witnessTypeEnumList);
        }

        this.setFieldLabelAndLength('ehs_incident_witness');
    }
});