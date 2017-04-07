Ext.define('AssetReceipt.view.EditEquipment', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'editEquipmentPanel',

    config: {
        title: LocaleManager.getLocalizedString('Edit Equipment', 'AssetReceipt.view.EditEquipment'),

        model: 'AssetReceipt.model.AssetReceiptEquipment',
        storeId: 'assetReceiptEquipment',

        // The zIndex setting is required for the Windows Phone platform. The zIndex value should be
        // less than the zIndex setting of the Prompt component which is currently 12.
        zIndex: 6,

        totalCount: 0,
        currentCount: 0,

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

        layout: 'vbox',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'deleteAsset',
                iconCls: 'delete',
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'nextBarcodeField',
                        name: 'eq_id',
                        required: true,
                        barcodeFormat: [{fields: ['eq_id']}]
                    },
                    {
                        xtype: 'equipmentStandardPrompt'
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'num_serial',
                        barcodeFormat: [{fields: ['num_serial']}]
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
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
                        parentFields: ['site_id', 'bl_id'],
                        childFields: ['rm_id']
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'assetReceiptRoomPrompt',
                        parentFields: ['site_id', 'bl_id', 'fl_id'],
                        childFields: []
                    },
                    {
                        xtype: 'prompt',
                        name: 'dv_id',
                        store: 'assetReceiptDivisions',
                        title: LocaleManager.getLocalizedString('Divisions', 'AssetReceipt.view.EditEquipment'),
                        displayFields: [
                            {
                                name: 'dv_id',
                                title: LocaleManager.getLocalizedString('Division', 'AssetReceipt.view.EditEquipment')
                            }
                        ],
                        childFields: ['dp_id']
                    },
                    {
                        xtype: 'prompt',
                        name: 'dp_id',
                        store: 'assetReceiptDepartments',
                        title: LocaleManager.getLocalizedString('Departments', 'AssetReceipt.view.EditEquipment'),
                        displayFields: [
                            {
                                name: 'dv_id',
                                title: LocaleManager.getLocalizedString('Division', 'AssetReceipt.view.EditEquipment')
                            },
                            {
                                name: 'dp_id',
                                title: LocaleManager.getLocalizedString('Department', 'AssetReceipt.view.EditEquipment')
                            }
                        ],
                        parentFields: ['dv_id']
                    },
                    {
                        xtype: 'prompt',
                        name: 'em_id',
                        store: 'assetReceiptEmployees',
                        title: LocaleManager.getLocalizedString('Employees', 'AssetReceipt.view.EditEquipment'),
                        displayFields: [
                            {
                                name: 'em_id',
                                title: LocaleManager.getLocalizedString('Employee', 'AssetReceipt.view.EditEquipment')
                            },
                            {
                                name: 'bl_id',
                                title: LocaleManager.getLocalizedString('Building', 'AssetReceipt.view.EditEquipment')
                            },
                            {
                                name: 'fl_id',
                                title: LocaleManager.getLocalizedString('Floor', 'AssetReceipt.view.EditEquipment')
                            },
                            {
                                name: 'rm_id',
                                title: LocaleManager.getLocalizedString('Room', 'AssetReceipt.view.EditEquipment')
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
                        label: LocaleManager.getLocalizedString('Comments', 'AssetReceipt.view.EditEquipment')
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'countIndicator',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                padding: '10px',
                items: [
                    {
                        xtype: 'container',
                        itemId: 'recordNumberIndicator',
                        html: LocaleManager.getLocalizedString('1 of x', 'AssetReceipt.view.EditEquipment')
                    }
                ],
                hidden: true
            }
        ]
    },

    initialize: function () {
        var fieldEnumList = TableDef.getEnumeratedList('eq_sync', 'status'),
            statusField;

        this.callParent();

        this.setFieldLabelAndLength('eq_sync');
        //set label widths after setting the label values form the server table definition
        this.setLabelWidths();

        // set status field options
        if (fieldEnumList && fieldEnumList.length > 0) {
            statusField = this.query('selectfield[name=status]')[0];
            statusField.setOptions(fieldEnumList);
        }
    },

    applyRecord: function (record) {
        var recordNumberIndicator = this.down('container[itemId=recordNumberIndicator]'),
            text = LocaleManager.getLocalizedString('{0} of {1}', 'AssetReceipt.view.EditEquipment'),
            deleteButton = this.getDeleteButton();

        if (this.getTotalCount() > 0 && recordNumberIndicator) {
            recordNumberIndicator.setHtml(Ext.String.format(text, this.getCurrentCount(), this.getTotalCount()));
        } else if (record && record.phantom) {
            this.initializeSiteAndBl(record);
        }

        if (deleteButton) {
            deleteButton.record = record;
        }

        return record;
    },

    getDeleteButton: function () {
        var toolBarButtons = this.getToolBarButtons(),
            i;

        for (i = 0; i < toolBarButtons.length; i++) {
            if (toolBarButtons[i].action === 'deleteAsset') {
                return toolBarButtons[i];
            }
        }
    },

    initializeSiteAndBl: function (record) {
        var locations = AssetReceiptData.getCurrentLocations();

        if (locations.length === 1) {
            record.set('site_id', locations[0].site_id);
            record.set('bl_id', locations[0].bl_id);
        }

        AssetReceiptFilter.filterSiteStore();
        AssetReceiptFilter.filterBlStore();
    }
});