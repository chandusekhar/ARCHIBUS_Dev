Ext.define('AssetReceipt.view.InventoryList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'inventoryList',

    config: {
        title: LocaleManager.getLocalizedString('Asset Inventory List',
            'AssetReceipt.view.InventoryList'),

        editViewClass: 'AssetReceipt.view.EditEquipment',

        isNavigationList: true,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'syncAssets',
                iconCls: 'refresh',
                align: 'right',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'completeAssets',
                text: LocaleManager.getLocalizedString('Complete', 'AssetReceipt.view.InventoryList'),
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'toolbar',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'search',
                        name: 'searchAsset',
                        align: 'left'
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'sortEquipmentField',
                        isSortField: true,
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        align: Ext.os.is.Phone ? 'left' : 'right',
                        style: 'margin-left:10px;padding-left:10px',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('Location', 'AssetReceipt.view.InventoryList'),
                                objectValue: "location"
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('Owner', 'AssetReceipt.view.InventoryList'),
                                objectValue: "owner"
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('Standard', 'AssetReceipt.view.InventoryList'),
                                objectValue: "standard"
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'checkboxfield',
                        name: 'selectAllAssets',
                        align: 'left',
                        cls: 'ab-titlebar-checkbox'
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'buttonpicker',
                        name: 'deleteSelectedAssets',
                        cls: 'delete-button-picker',
                        iconCls: 'delete',
                        store: new Ext.data.Store({
                            storeId: 'store',
                            data: [
                                {
                                    action: 'deleteSelectedAssets',
                                    text: LocaleManager.getLocalizedString('Delete Selected', 'AssetReceipt.view.InventoryList')
                                },
                                {
                                    action: 'deleteAllAssets',
                                    text: LocaleManager.getLocalizedString('Delete ALL', 'AssetReceipt.view.InventoryList')
                                }
                            ]
                        }),
                        align: 'right',
                        panelSize: {
                            tablet: {width: '14em', height: '8em'},
                            phone: {width: '14em', height: '8em'}
                        }
                    }
                ]
            },
            {
                xtype: 'equipmentList',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            searchField = me.down('search'),
            sortField = me.down('selectfield');

        me.callParent();

        if (Ext.os.is.Phone) {
            searchField.setWidth('45%');
            sortField.setWidth('50%');
        }
    }
});