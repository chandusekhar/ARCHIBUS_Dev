Ext.define('WorkplacePortal.store.UserReservationRooms', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView',
        'WorkplacePortal.model.ReservationAndRoom'],

    config: {
        storeId: 'userReservationRoomsStore',
        model: 'WorkplacePortal.model.ReservationAndRoom',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: false,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT reserve_rm.*, reserve.* FROM Reservation reserve'
            + ' LEFT JOIN ReservationRoom reserve_rm ON reserve_rm.res_id = reserve.res_id'
            + ' WHERE reserve_rm.date_start > \''
            + WorkplacePortal.util.Ui.getAMonthAgoFormattedDateValue()
            + '\''
            + ' ORDER by reserve_rm.date_start DESC, reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id',

            viewName: 'userReservationRooms',

            baseTables: ['Reservation', 'ReservationRoom']
        },

        grouper: {
            groupFn: function (record) {
                var dateStart = record.get('date_start'),
                    dateStartNoTime = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 0, 0),
                    currentDate = WorkplacePortal.util.Ui.getCurrentDateValue();

                if (dateStartNoTime < currentDate) {
                    return LocaleManager.getLocalizedString('Past Reservations', 'WorkplacePortal.store.UserReservationRooms');
                } else if (dateStartNoTime > currentDate) {
                    return LocaleManager.getLocalizedString('Future Reservations', 'WorkplacePortal.store.UserReservationRooms');
                } else {
                    return LocaleManager.getLocalizedString('Current Reservations', 'WorkplacePortal.store.UserReservationRooms');
                }
            },
            sorterFn: function (record1, record2) {
                var date1 = record1.get('date_start'),
                    date1NoTime = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), 0, 0),
                    date2 = record2.get('date_start'),
                    date2NoTime = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), 0, 0),
                    currentDate = WorkplacePortal.util.Ui.getCurrentDateValue();

                if (date1NoTime.getTime() === date2NoTime.getTime()) {
                    return 0;
                }

                // order reservation: current, future, past

                // both in the past sort descending
                if (date1NoTime < currentDate && date2NoTime < currentDate) {
                    return (date1NoTime > date2NoTime) ? -1 : 1;
                }

                // both in the future sort ascending
                if (date1NoTime > currentDate && date2NoTime > currentDate) {
                    return (date1NoTime > date2NoTime) ? 1 : -1;
                }

                // past reservation is always last
                if (date1NoTime < currentDate && (date2NoTime > currentDate || date2NoTime.getTime() === currentDate.getTime())) {
                    return 1;
                }

                //current date reservation is always first
                if (date1NoTime.getTime() === currentDate.getTime()) {
                    return -1;
                }

                // future record < current record AND future record > past record
                if (date1NoTime > currentDate) {
                    if (date2NoTime.getTime() === currentDate.getTime()) {
                        return 1;
                    }
                    if (date2NoTime < currentDate) {
                        return -1;
                    }
                }
            }
        }
    }
});
