Ext.define('WorkplacePortal.store.HotelingBookings', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'WorkplacePortal.model.HotelingBooking'
    ],

    config: {
        storeId: 'hotelingBookingsStore',
        model: 'WorkplacePortal.model.HotelingBooking',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: false,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT hb.* FROM HotelingBooking hb, HotelingRequest hr'
            + ' WHERE hr.activity_log_id = hb.activity_log_id'
            + ' AND hb.em_id = (SELECT Employee.em_id FROM User,Employee WHERE Employee.email = User.email)'
            + ' AND hb.date_start > \''
            + WorkplacePortal.util.Ui.getAMonthAgoFormattedDateValue()
            + '\''
            + ' ORDER by hb.date_start DESC, hb.bl_id, hb.fl_id, hb.rm_id',

            viewName: 'hotelingBookings',

            baseTables: ['HotelingRequest', 'HotelingBooking', 'Employee', 'User']
        }
    }
});
