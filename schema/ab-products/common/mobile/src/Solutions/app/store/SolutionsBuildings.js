Ext.define('Solutions.store.SolutionsBuildings', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Solutions.model.SolutionsBuildings'],

    serverTableName: 'bl',

    serverFieldNames: [
        'bl_id',
        'name',
        'city_id',
        'state_id',
        'ctry_id',
        'address1',
        'address2',
        'use1',
        'contact_name',
        'date_bl',
        'area_gross_ext',
        'area_gross_int',
        'area_rentable',
        'area_usable',
        'contact_phone',
        'construction_type',
        'count_occup',
        'site_id',
        'lat',
        'lon'
    ],
    inventoryKeyNames: ['bl_id'],

    config: {
        model: 'Solutions.model.SolutionsBuildings',
        storeId: 'solutionsBuildings',
        tableDisplayName: 'Buildings',
        remoteSort: true,
        remoteFilter: true,
        sorters: [{
            property: 'bl_id',
            direction: 'ASC'
        }],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});