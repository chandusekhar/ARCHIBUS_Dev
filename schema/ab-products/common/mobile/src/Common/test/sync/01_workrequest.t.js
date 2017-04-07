// Test the synchronization of WorkRequest records created on the mobile client
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.diag('Testing Work Request Sync');

    t.requireOk('Maintenance.model.WorkRequest', 'Maintenance.store.WorkRequests', 'Common.scripts.ScriptManager',
        'Common.service.MobileSyncServiceAdapter', 'Common.service.MobileSecurityServiceAdapter',
        'Common.util.ConfigFileManager', 'Common.util.TableDef', 'Common.store.TableDefs',
        'Common.store.sync.SchemaUpdaterStore', 'Common.store.sync.ValidatingTableStore',
        'Common.log.Logger', 'Common.config.GlobalParameters',
        'Common.test.util.Database', 'Common.test.util.TestUser', 'Common.util.Network', function () {
            var workRequestModel1,
                workRequestModel2,
                workRequestModel3,
                workRequestStore,
                currentDate,
                async;

            // Register the tableDefs store in the StoreManager
            Ext.create('Common.store.TableDefs');

            workRequestModel1 = Ext.create('Maintenance.model.WorkRequest');
            workRequestModel1.setData({
                bl_id: 'HQ',
                fl_id: '01',
                rm_id: '151',
                prob_type: 'ASBESTOS',
                description: '',
                mob_is_changed: 1,
                mob_locked_by: 'TRAM'
            });

            workRequestModel2 = Ext.create('Maintenance.model.WorkRequest');
            workRequestModel2.setData({
                bl_id: 'HQ',
                fl_id: '01',
                rm_id: '151',
                prob_type: 'AIR QUALITY',
                description: '',
                mob_is_changed: 1,
                mob_locked_by: 'TRAM'
            });

            workRequestModel3 = Ext.create('Maintenance.model.WorkRequest');
            workRequestModel3.setData({
                bl_id: 'HQ',
                fl_id: '01',
                rm_id: '151',
                prob_type: 'VANDALISM',
                description: '',
                mob_is_changed: 1,
                mob_locked_by: 'TRAM'
            });

            workRequestStore = Ext.create('Maintenance.store.WorkRequests');

            workRequestStore.add(workRequestModel1);
            workRequestStore.add(workRequestModel2);
            workRequestStore.add(workRequestModel3);

            currentDate = new Date();
            // Remove time information
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
            async = t.beginAsync();


                // Configure test user.
                Common.test.util.TestUser.registerTestUser('TRAM', 'afm').then(function () {
                    // Clean up the local database before inserting records
                    //Common.test.util.Database.deleteWorkRequestSyncTestRecords(function () {
                        workRequestStore.sync(function () {
                            workRequestStore.synchronize(function () {
                                workRequestStore.clearFilter();
                                workRequestStore.filter('description', 'TEST WORK REQUEST SYNC');
                                workRequestStore.load(function (records) {
                                    t.is(records.length, 3, 'All Work requests synced to the wr_sync table.');
                                    // Clean up database
                                    Ext.each(records, function (record) {
                                        var dateRequested = record.get('date_requested');
                                        t.is(dateRequested, currentDate, 'Date Requested matches the current date');
                                    });
                                    t.endAsync(async);
                                    t.done();
                                });
                            });
                        });
                    //}, this);
                });
            });

});
