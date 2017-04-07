Ext.define('Maintenance.view.manager.AddPurchasedPartsToInventory',{
    extend: 'Common.view.navigation.EditBase',
    xtype: 'addPurchasedPartsToInventory',
    config:{
        model: 'Maintenance.model.PartStorageLocation',
        storeId:'partStorageLocStore',

        title: LocaleManager.getLocalizedString('Add Purchased Parts to Inventory', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        items:[
            {
                xtype: 'titlebar',
                itemId: 'addPartToInventoryToolBar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        action: 'btnBartInfoSave',
                        ui: 'action',
                        align: 'right'
                    }

                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'addToInventoryForm',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items:[
                    {
                        xtype: 'prompt',
                        name: 'part_id',
                        itemId: 'part_id',
                        title: LocaleManager.getLocalizedString('Part', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        label: LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        required: true,
                        store: 'partsStore',
                        displayFields: [
                            {
                                name: 'part_id',
                                title: LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory')
                            }
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'prompt',
                        name: 'pt_store_loc_id',
                        itemId: 'pt_store_loc_id',
                        title: LocaleManager.getLocalizedString('Storage Location', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        label: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        required: true,
                        store: 'storageLocStore',
                        displayFields: [
                            {
                                name: 'pt_store_loc_id',
                                title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory')
                            }
                        ],
                        flex: 1
                    },
                    {
                        xtype:'formattednumberfield',
                        name:'qty_on_hand',
                        itemId: 'qty_on_hand',
                        label: LocaleManager.getLocalizedString('Quantity (each)','Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        store: 'partStorageLocStore'
                    },
                    {
                        xtype:'formattednumberfield',
                        name:'cost_unit_last',
                        itemId: 'cost_unit_last',
                        labelFormat: 'currency',
                        label: LocaleManager.getLocalizedString('Price','Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        store: 'partStorageLocStore'
                    },
                    {
                        xtype: 'prompt',
                        name: 'ac_id',
                        itemId: 'ac_id',
                        title: LocaleManager.getLocalizedString('Account', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        label: LocaleManager.getLocalizedString('Account Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory'),
                        required: false,
                        store: 'acStore',
                        displayFields: [
                            {
                                name: 'ac_id',
                                title: LocaleManager.getLocalizedString('Account Code', 'Maintenance.view.manager.AddPurchasedPartsToInventory')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'Maintenance.view.manager.AddPurchasedPartsToInventory')
                            }
                        ],
                        flex: 1
                    },

                ]
            }


        ]

    },

    initialize: function(){
        var record;
        this.callParent(arguments);
        record=this.getRecord();
        if(!record){
            record=Ext.create('Maintenance.model.PartStorageLocation');
        }

        this.setRecord(record);
    }
});