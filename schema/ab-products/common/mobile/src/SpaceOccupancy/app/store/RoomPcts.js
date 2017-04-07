Ext.define('SpaceOccupancy.store.RoomPcts', {

    extend: 'Common.store.sync.SyncStore',
    requires: ['SpaceOccupancy.model.RoomPct'],

    serverTableName: 'rmpctmob_sync',
    serverFieldNames: [
        'survey_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'dv_id',
        'dp_id',
        'primary_rm',
        'primary_em',
        'pct_space',
        'em_id',
        'action',
        'pct_id',
        'rm_cat',
        'rm_type',
        'activity_log_id',
        'date_start',
        'date_end',
        'status',
        'mob_locked_by',
        'mob_is_changed'
    ],

    inventoryKeyNames: [
        'survey_id',
        'pct_id'
    ],

    config: {
        model: 'SpaceOccupancy.model.RoomPct',
        storeId: 'roomPctsStore',
        autoSync: true,
        remoteFilter: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Room Percentanges', 'SpaceOccupancy.store.RoomPcts'),
        enableAutoLoad: true,
        destroyRemovedRecords: false,
        proxy: {
            type: 'Sqlite'
        }
    }
});