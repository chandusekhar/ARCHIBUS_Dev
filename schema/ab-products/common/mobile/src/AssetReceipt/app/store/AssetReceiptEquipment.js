Ext.define('AssetReceipt.store.AssetReceiptEquipment', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: 'AssetReceipt.model.AssetReceiptEquipment',

    serverTableName: 'eq_sync',
    serverFieldNames: [
        'eq_id',
        'eq_std',
        'status',
        'site_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'dv_id',
        'dp_id',
        'em_id',
        'num_serial',
        'survey_comments',
        'edited',
        'mob_is_changed',
        'mob_locked_by',
        'mob_action'
    ],

    inventoryKeyNames: ['eq_id'],

    config: {
        model: 'AssetReceipt.model.AssetReceiptEquipment',
        storeId: 'assetReceiptEquipment',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        autoSync: true,
        tableDisplayName: LocaleManager.getLocalizedString('Equipment', 'AssetReceipt.store.AssetReceiptEquipment'),
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
                property: 'site_id',
                direction: 'ASC'
            },
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
            // always sort by eq_id descending ( KB 3049917 )
            {
                property: 'eq_id',
                direction: 'DESC'
            }
        ];
    },

    /**
     * return the sort by owner array
     */
    getSortByOwner: function () {
        return [
            {
                property: 'dv_id',
                direction: 'ASC'
            },
            {
                property: 'dp_id',
                direction: 'ASC'
            },
            {
                property: 'em_id',
                direction: 'ASC'
            },
            // always sort by eq_id descending ( KB 3049917 )
            {
                property: 'eq_id',
                direction: 'DESC'
            }
        ];
    },

    /**
     * return the sort by standard array
     */
    getSortByStandard: function () {
        return [
            {
                property: 'eq_std',
                direction: 'ASC'
            },
            // always sort by eq_id descending ( KB 3049917 )
            {
                property: 'eq_id',
                direction: 'DESC'
            }
        ];
    }
});
