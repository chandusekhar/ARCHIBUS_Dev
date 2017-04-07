Ext.define('AssetReceipt.view.CommonData', {
    extend: 'Common.form.FormPanel',
    xtype: 'commonDataPanel',

    config: {
        layout: 'vbox',

        lastNumberTapped: false,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'startAddManyAssets',
                iconCls: 'check',
                cls: 'ab-icon-action',
                align: 'right'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Common Asset Data', 'AssetReceipt.view.CommonData'),
                docked: 'top'
            },
            {
                xtype: 'fieldset',
                style: 'margin: 0 0 1.5em;',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        name: 'method',
                        label: LocaleManager.getLocalizedString('Inventory Method', 'AssetReceipt.view.CommonData'),
                        options: [
                            {
                                text: LocaleManager.getLocalizedString('Barcode scanning', 'AssetReceipt.view.CommonData'),
                                value: 'scan'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Incremented Codes', 'AssetReceipt.view.CommonData'),
                                value: 'increment'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                style: 'margin: 0 0 1.5em;',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        name: 'prefix',
                        label: LocaleManager.getLocalizedString('Prefix', 'AssetReceipt.view.CommonData'),
                        disabled: true,
                        listeners: {
                            keyup: function (field) {
                                var value = field.getValue(),
                                    upperCaseValue = value.toUpperCase();
                                if (value !== upperCaseValue) {
                                    field.setValue(upperCaseValue);
                                }
                            }
                        }
                    },
                    {
                        xtype: 'arrowTextField',
                        name: 'getLastNumber',
                        label: LocaleManager.getLocalizedString('Get Last Number', 'AssetReceipt.view.CommonData'),
                        labelCls: Ext.os.is.Phone ? 'x-form-action-label-phone' : 'x-form-action-label',
                        disabled: true
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        name: 'totalCount',
                        label: LocaleManager.getLocalizedString('Total Count', 'AssetReceipt.view.CommonData'),
                        decimals: 0,
                        minValue: 1,
                        stepValue: 1,
                        defaultValue: ''
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'startNumber',
                        label: LocaleManager.getLocalizedString('Start Number', 'AssetReceipt.view.CommonData'),
                        disabled: true,
                        listeners: {
                            keyup: function (field) {
                                var value = field.getValue(),
                                    upperCaseValue = value.toUpperCase();
                                if (value !== upperCaseValue) {
                                    field.setValue(upperCaseValue);
                                }
                            }
                        }
                    }
                ]
            },

            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'equipmentStandardPrompt'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'miss'
                    },
                    {
                        xtype: 'sitePrompt',
                        childField: ['bl_id']
                    },
                    {
                        xtype: 'buildingPrompt',
                        childFields: ['fl_id', 'rm_id']
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'assetReceiptFloorPrompt',
                        parentFields: ['bl_id'],
                        childFields: ['rm_id']
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'assetReceiptRoomPrompt',
                        parentFields: ['bl_id', 'fl_id'],
                        childFields: []
                    },
                    {
                        xtype: 'prompt',
                        name: 'dv_id',
                        store: 'assetReceiptDivisions',
                        title: LocaleManager.getLocalizedString('Divisions', 'AssetReceipt.view.CommonData'),
                        displayFields: [
                            {
                                name: 'dv_id',
                                title: LocaleManager.getLocalizedString('Division', 'AssetReceipt.view.CommonData')
                            }
                        ],
                        childFields: ['dp_id']
                    },
                    {
                        xtype: 'prompt',
                        name: 'dp_id',
                        store: 'assetReceiptDepartments',
                        title: LocaleManager.getLocalizedString('Departments', 'AssetReceipt.view.CommonData'),
                        displayFields: [
                            {
                                name: 'dv_id',
                                title: LocaleManager.getLocalizedString('Division', 'AssetReceipt.view.CommonData')
                            },
                            {
                                name: 'dp_id',
                                title: LocaleManager.getLocalizedString('Department', 'AssetReceipt.view.CommonData')
                            }
                        ],
                        parentFields: ['dv_id']
                    },
                    {
                        xtype: 'prompt',
                        name: 'em_id',
                        store: 'assetReceiptEmployees',
                        title: LocaleManager.getLocalizedString('Employees', 'AssetReceipt.view.CommonData'),
                        displayFields: [
                            {
                                name: 'em_id',
                                title: LocaleManager.getLocalizedString('Employee', 'AssetReceipt.view.CommonData')
                            },
                            {
                                name: 'bl_id',
                                title: LocaleManager.getLocalizedString('Building', 'AssetReceipt.view.CommonData')
                            },
                            {
                                name: 'fl_id',
                                title: LocaleManager.getLocalizedString('Floor', 'AssetReceipt.view.CommonData')
                            },
                            {
                                name: 'rm_id',
                                title: LocaleManager.getLocalizedString('Room', 'AssetReceipt.view.CommonData')
                            }
                        ],
                        displayTemplate: {
                            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                            LocaleManager.getLocalizedString('Employee:', 'AssetReceipt.view.EditEquipment') +
                            '</span><span class="prompt-code-value">{em_id}</span></div>' +
                            '<div class="x-phone-prompt"><span class="prompt-label">' +
                            LocaleManager.getLocalizedString('Building:', 'AssetReceipt.view.EditEquipment') +
                            '</span><span>{bl_id}</span></div>' +
                            '<div class="x-phone-prompt"><span class="prompt-label">' +
                            LocaleManager.getLocalizedString('Floor:', 'AssetReceipt.view.EditEquipment') +
                            '</span><span>{fl_id}</span></div>' +
                            '<div class="x-phone-prompt"><span class="prompt-label">' +
                            LocaleManager.getLocalizedString('Room:', 'AssetReceipt.view.EditEquipment') +
                            '</span><span>{rm_id}</span></div>'
                        },

                        headerTemplate: {
                            phone: '<div></div>'
                        }
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'survey_comments',
                        useFieldDefLabel: false,
                        label: LocaleManager.getLocalizedString('Comments', 'AssetReceipt.view.CommonData')
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var fieldEnumList = TableDef.getEnumeratedList('eq_sync', 'status'),
            methodSelectField;

        this.callParent();

        this.setFieldLabelAndLength('eq_sync');

        // set status field options
        if (fieldEnumList && fieldEnumList.length > 0) {
            this.down('selectfield[name=status]').setOptions(fieldEnumList);
        }

        methodSelectField = this.down('selectfield[name=method]');
        methodSelectField.on('change', this.onInventoryMethodChanged, this);
        this.initializeSiteAndBl();
    },

    onInventoryMethodChanged: function (field, value) {
        var prefixField = this.down('commontextfield[name=prefix]'),
            getLastNumberField = this.down('arrowTextField[name=getLastNumber]'),
            startNumberField = this.down('commontextfield[name=startNumber]');

        prefixField.setDisabled(value === 'scan');
        prefixField.setValue('');
        getLastNumberField.setDisabled(value === 'scan');
        getLastNumberField.setValue('');
        startNumberField.setDisabled(value === 'scan');
        startNumberField.setValue('');
    },

    initializeSiteAndBl: function () {
        var locations = AssetReceiptData.getCurrentLocations(),
            sitePrompt = this.down('sitePrompt'),
            blPrompt = this.down('buildingPrompt');

        if (sitePrompt && locations.length === 1) {
            sitePrompt.setValue(locations[0].site_id);
        }

        if (blPrompt && locations.length === 1) {
            blPrompt.setValue(locations[0].bl_id);
        }

        AssetReceiptFilter.filterSiteStore();
        AssetReceiptFilter.filterBlStore();
    }
});