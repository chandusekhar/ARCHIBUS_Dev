Ext.define('MaterialInventory.store.MaterialLocations', {
    extend: 'Common.store.sync.SyncStore',
    requires: ['MaterialInventory.model.MaterialLocation'],

    serverTableName: 'msds_location_sync',

    serverFieldNames: ['tier2', 'site_id', 'bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id',
        'msds_id', 'container_code', 'num_containers', 'container_status', 'container_cat', 'container_type', 'quantity',
        'quantity_units', 'quantity_units_type', 'temperature', 'temperature_units', 'pressure', 'pressure_units', 'pressure_units_type',
        'custodian_id', 'date_start', 'date_end', 'date_updated', 'date_last_inv', 'last_edited_by', 'comments',
        'description', 'location_auto_number', 'mob_locked_by', 'mob_is_changed'],

    inventoryKeyNames: ['location_auto_number'],

    config: {
        model: 'MaterialInventory.model.MaterialLocation',
        storeId: 'materialLocations',
        autoSync: true,
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Locations', 'MaterialInventory.store.MaterialLocations'),
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            },
            {
                property: 'fl_id',
                direction: 'ASC'
            },
            {
                property: 'rm_id',
                direction: 'ASC'
            },
            {
                property: 'aisle_id',
                direction: 'ASC'
            },
            {
                property: 'cabinet_id',
                direction: 'ASC'
            },
            {
                property: 'shelf_id',
                direction: 'ASC'
            },
            {
                property: 'bin_id',
                direction: 'ASC'
            },
            {
                property: 'msds_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: false,
        proxy: {
            type: 'Sqlite'
        }
    },

    /**
     * return the sort by location array
     */
    getSortByLocation: function () {
        return [
            {
                property: 'bl_id',
                direction: 'ASC'
            },
            {
                property: 'fl_id',
                direction: 'ASC'
            },
            {
                property: 'rm_id',
                direction: 'ASC'
            },
            {
                property: 'aisle_id',
                direction: 'ASC'
            },
            {
                property: 'cabinet_id',
                direction: 'ASC'
            },
            {
                property: 'shelf_id',
                direction: 'ASC'
            },
            {
                property: 'bin_id',
                direction: 'ASC'
            },
            {
                property: 'msds_id',
                direction: 'ASC'
            }
        ];
    },

    /**
     * return the sort by product array
     */
    getSortByProduct: function () {
        return [
            {
                property: 'product_name',
                direction: 'ASC'
            }
        ];
    },

    /**
     * return the sort by container_status array
     */
    getSortByStatus: function () {
        return [
            {
                property: 'container_status',
                direction: 'ASC'
            }
        ];
    },

    /**
     * return the sort by tier2 array
     */
    getSortByHazmat: function () {
        return [
            {
                property: 'CASE'
                + ' WHEN tier2 = \'Extremely Hazardous\' THEN 1'
                + ' WHEN tier2 LIKE \'Hazardous\' THEN 2'
                + ' WHEN tier2 = \'Not Listed\' THEN 3'
                + ' ELSE 4'
                + ' END',
                direction: 'ASC'
            }
        ];
    }
});