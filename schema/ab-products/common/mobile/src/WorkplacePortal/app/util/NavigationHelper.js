Ext.define('WorkplacePortal.util.NavigationHelper', {
    singleton: true,

    // menu action selected by user
    mobileAction: null,

    onDisplayRoomInfo: function (blId, flId, rmId) {
        var me = this,
            store = Ext.getStore('roomsInfoReportStore'),
            filterArray = WorkplacePortal.util.Filter.getRoomFilterArray(blId, flId, rmId);

        Mask.displayLoadingMask();
        me.retrieveRoomInfoRecord(filterArray, store)
            .then(function(record) {
                var reportConfig,
                    detailView;

                reportConfig = Space.view.report.Configuration.getRoomInfoReportConfig();
                reportConfig.record = record;
                detailView = Ext.create('Common.view.report.Detail', reportConfig);
                Mask.hideLoadingMask();

                detailView.show();
            }, function() {
                // Error loading store.
                Mask.hideLoadingMask();
            });
    },

    /**
     * Get the record to use for the Room Info Report
     * @param filters
     * @param store
     * @returns {Promise}
     */
    retrieveRoomInfoRecord: function(filters, store) {
        return new Promise(function(resolve, reject) {

            var currentFilters = store.getFilters(),
                retrievedRecord = null,
                isPagingDisabled = store.getDisablePaging();

            store.suspendEvents();
            store.clearFilter();
            if (!Ext.isEmpty(filters)) {
                store.setFilters(filters);
            }
            store.setDisablePaging(true);
            store.load(function (records, operation, success) {
                store.resumeEvents(true);
                if (records && records.length > 0) {
                    retrievedRecord = records[0];
                }
                store.setFilters(currentFilters);
                store.setDisablePaging(isPagingDisabled);
                if(success) {
                    resolve(retrievedRecord);
                } else {
                    reject();
                }
            });
        });
    },

    /**
     * Set parent id to Site and Floor list views
     * @param updateView the view to display
     * @param record current record
     */
    setParentIdToNavigationLists: function (updateView, record) {
        if (updateView.xtype === 'sitePanel') {
            updateView.setParentId(record.get('site_id'));
        }
        if (updateView.xtype === 'floorsListPanel') {
            updateView.setParentId(record.get('bl_id'));
        }
    },

    /**
     * Default the 'From' field to start within the next hour (ex. current time = 2:33PM then From = 3:35 PM; current time = 3:00 then From = 4:00).
     * The default timeframe for a reservation should be 1 hour. The 'To' field should be by default prepopulated with the 'From' time + 1 hour. (KB 3045555)
     * @returns {WorkplacePortal.model.ReservationRoomArrange}
     */
    createReservationRoomArrangeRecord: function () {
        var record = Ext.create('WorkplacePortal.model.ReservationRoomArrange'),
            now = new Date(),
            startTime = new Date(now.setHours(now.getHours() + 1)),
            endTime = new Date(now.setHours(now.getHours() + 1)),
            modulo,
            minutes = now.getMinutes(),
            increment = 5;

        // Round minutes
        modulo = minutes % increment;
        if (modulo > 0) {
            minutes = Math.round(minutes / increment) * increment;
        }

        startTime.setMinutes(minutes);
        endTime.setMinutes(minutes);

        record.set('time_start', startTime);
        record.set('time_end', endTime);

        return record;
    }
});