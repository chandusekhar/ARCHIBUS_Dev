Ext.define('WorkplacePortal.store.Reservations', {

    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.Reservation' ],

    serverTableName: 'reserve',
    serverFieldNames: [
        'res_id',
        'res_type',
        'user_requested_by',
        'user_requested_for',
        'reservation_name',
        'dv_id',
        'dp_id',
        'comments',
        'attendees'
    ],

    inventoryKeyNames: [ 'res_id' ],

    config: {
        model: 'WorkplacePortal.model.Reservation',
        storeId: 'reservationsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,

        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Reservations', 'WorkplacePortal.store.Reservations')
        }
});