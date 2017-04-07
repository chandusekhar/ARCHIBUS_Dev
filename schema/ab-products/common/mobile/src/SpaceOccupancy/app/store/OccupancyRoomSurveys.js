Ext.define('SpaceOccupancy.store.OccupancyRoomSurveys', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: 'Space.model.RoomSurvey',

    serverTableName: 'surveyrm_sync',
    serverFieldNames: [
        'survey_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'rm_cat',
        'rm_type',
        'dv_id',
        'dp_id',
        'rm_std',
        'rm_use',
        'name',
        'cap_em',
        'prorate',
        'survey_comments_rm',
        'survey_photo',
        'survey_redline_rm',
        'date_last_surveyed',
        'status',
        'mob_locked_by',
        'mob_is_changed',
        'transfer_status',
        'auto_number' // Required so that we can generate the paging restriction
    ],

    inventoryKeyNames: [
        'bl_id',
        'fl_id',
        'rm_id',
        'survey_id'
    ],

    config: {
        model: 'Space.model.RoomSurvey',
        storeId: 'occupancyRoomSurveyStore',
        remoteFilter: true,
        autoSync: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Rooms', 'SpaceOccupancy.store.OccupancyRoomSurveys'),
        destroyRemovedRecords: false,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'rm',
        documentTablePrimaryKeyFields: ['bl_id', 'fl_id', 'rm_id']
    }
});