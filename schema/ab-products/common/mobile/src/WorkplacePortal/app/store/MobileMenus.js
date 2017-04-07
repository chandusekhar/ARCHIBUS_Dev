Ext.define('WorkplacePortal.store.MobileMenus', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.MobileMenu' ],

    serverTableName: 'afm_mobile_menu',
    serverFieldNames: [ 'menu_id', 'title', 'description', 'menu_icon', 'mobile_action', 'display_order',
        'activity_id', 'group_name' ],
    inventoryKeyNames: [ 'menu_id' ],

    config: {
        model: 'WorkplacePortal.model.MobileMenu',

        remoteSort: true,
        sorters: [
            {
                property: 'display_order',
                direction: 'ASC'
            }
        ],
        storeId: 'mobileMenusStore',
        enableAutoLoad: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Mobile Menus', 'WorkplacePortal.store.MobileMenus'),
        restriction: [
            {
                tableName: 'afm_mobile_menu',
                fieldName: 'group_name',
                operation: 'EQUALS',
                value: 'WORKSVC-MOB'
            },
            {
                tableName: 'afm_mobile_menu',
                fieldName: 'activity_id',
                operation: 'EQUALS',
                value: 'AbWorkplacePortal'
            }
        ]
    }
});
