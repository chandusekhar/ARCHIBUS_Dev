Ext.define('MaterialInventory.view.MaterialList', {
    extend: 'Common.view.navigation.ComponentListBase',

    requires: [
        'MaterialInventory.view.MaterialListItem'
    ],

    xtype: 'materialList',

    config: {
        title: LocaleManager.getLocalizedString('Materials', 'MaterialInventory.view.MaterialList'),

        addTitle: LocaleManager.getLocalizedString('Add Material', 'MaterialInventory.view.MaterialList'),

        defaultType: 'materialListItem',

        store: 'materialLocations',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        editViewClass: 'MaterialInventory.view.MaterialForm',

        cls: 'component-list',

        useComponents: true,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'closeInventoryButton',
                iconCls: 'circle_check',
                align: 'right',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'syncMaterialButton',
                iconCls: 'refresh',
                align: 'right',
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
                        name: 'materialSearchField',
                        enableBarcodeScanning: true,
                        barcodeFormat: [{fields: ['container_code']}],
                        width: Ext.os.is.Phone ? '45%' : '14em',
                        style: 'margin-right: 6px'
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'sortMaterialField',
                        isSortField: true,
                        width: Ext.os.is.Phone ? '38%' : ' 14em',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        options: [
                            {
                                "displayValue": LocaleManager.getLocalizedString('Location', 'MaterialInventory.view.MaterialList'),
                                "objectValue": "location"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.MaterialList'),
                                "objectValue": "product"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Status', 'MaterialInventory.view.MaterialList'),
                                "objectValue": "status"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Hazmat', 'MaterialInventory.view.MaterialList'),
                                "objectValue": "hazmat"
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        iconCls: 'filter',
                        action: 'filterMaterialsList',
                        width: '2em'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        width: Ext.os.is.Phone ? '90%' : '50%',
                        defaults: {
                            width: '50%',
                            labelWidth: '100%'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Review', 'MaterialInventory.view.MaterialList'),
                                itemId: 'reviewTab',
                                pressed: true
                            },
                            {
                                text: LocaleManager.getLocalizedString('Inventory', 'MaterialInventory.view.MaterialList'),
                                itemId: 'inventoryTab'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});