Ext.define('WorkplacePortal.store.ReservationEmployee', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['WorkplacePortal.model.ReservationEmployee'],

    serverTableName: 'em',
    serverFieldNames: ['em_id', 'email', 'phone'],

    inventoryKeyNames: ['em_id'],

    config: {
        model: 'WorkplacePortal.model.ReservationEmployee',
        storeId: 'reservationEmployeeStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        autoLoad: true,
        tableDisplayName: LocaleManager.getLocalizedString('Reservation Employees', 'WorkplacePortal.store.ReservationEmployee'),
        proxy: {
            type: 'Sqlite'
        },

        restriction: [
            {
                tableName: 'em',
                fieldName: 'email',
                operation: 'LIKE',
                value: "%@%"
            }
        ]
    }
});