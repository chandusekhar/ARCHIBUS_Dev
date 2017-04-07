Ext.define('WorkplacePortal.store.ReservationRooms', {

    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.ReservationRoom' ],

    serverTableName: 'reserve_rm',
    serverFieldNames: [
        'rmres_id',
        'res_id',
        'date_start',
        'time_start',
        'time_end',
        'bl_id',
        'fl_id',
        'rm_id',
        'status',
        'verified',
        'config_id',
        'rm_arrange_type_id',
        'cost_rmres'
    ],

    inventoryKeyNames: ['rmres_id'],

    config: {
        model: 'WorkplacePortal.model.ReservationRoom',
        storeId: 'reservationRoomsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Room Reservations', 'WorkplacePortal.store.ReservationRooms'),

        proxy: {
            type: 'Sqlite'
        }
    }
});