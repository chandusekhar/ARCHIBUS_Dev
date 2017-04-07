Ext.define('WorkplacePortal.store.FacilityServicesMenus', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.FacilityServicesMenu' ],

    serverTableName: 'activitytype',
    serverFieldNames: [ 'activity_type', 'title', 'description', 'menu_icon', 'mobile_action', 'display_order' ],
    inventoryKeyNames: [ 'activity_type' ],

    config: {
        model: 'WorkplacePortal.model.FacilityServicesMenu',

        remoteSort: true,
        sorters: [
            {
                property: 'display_order',
                direction: 'ASC'
            }
        ],
        tableDisplayName: LocaleManager.getLocalizedString('Facility Menu', 'WorkplacePortal.store.FacilityServicesMenus'),
        storeId: 'facilityServicesMenusStore',
        enableAutoLoad: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        },

        restriction: [
            {
                tableName: 'activitytype',
                fieldName: 'group_name',
                operation: 'EQUALS',
                value: 'WORKSVC-MOB'
            }
        ]
    }
});
