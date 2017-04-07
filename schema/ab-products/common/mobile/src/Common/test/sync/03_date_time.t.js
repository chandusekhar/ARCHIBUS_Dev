// Test the synchronization of WorkRequest records created on the mobile client
// Test if a date value survives roundtrip to server and back.
// To run this test: 
// -	Install fresh canonic HQ.db;
// -	Clear browser cache;
// -	Open AppLauncher;
// -	Register user TRAM;
// -	Open the Maintenance application to have the WorkRequest table created in the client database;
// -	Run this test.
// 
// To check the timezone issue:
// -	Set the client timezone to Beijing GMT +8. The Web Central server should be set to a local timezone.
// -	Close the client browser and re-open.

// 
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.diag('Testing Work Request Sync: test if a date value survives roundtrip to server and back.');


    t.requireOk('Maintenance.model.WorkRequest', 'Maintenance.model.WorkRequestCraftsperson',
        'Maintenance.store.WorkRequestCraftspersons', 'Common.log.Logger', 'Common.config.GlobalParameters',
        'Maintenance.store.WorkRequests', 'Common.scripts.ScriptManager',
        'Common.service.MobileSyncServiceAdapter',
        'Common.service.MobileSecurityServiceAdapter',
        'Common.util.ConfigFileManager', 'Common.util.TableDef',
        'Common.store.TableDefs', 'Common.store.sync.SchemaUpdaterStore',
        'Common.store.sync.ValidatingTableStore',
        'Common.test.util.Database', 'Common.test.util.TestUser', 'Common.util.Network',
        function () {
            // expected date value
            var expectedDate = new Date("01-13-1999");
            // expected time value
            // TODO Sybase time type does not store milliseconds
            var expectedTime = new Date("01-01-1970 12:45:59");
            var comments = 'Test Date/Time roundtrip';
            var workRequestCraftspersonsStore,
                workRequestCraftsperson,
                async;

            // Register the tableDefs store in the StoreManager
            Ext.create('Common.store.TableDefs');

            // Register the WorkRequestStore
            Ext.create('Maintenance.store.WorkRequests');


            workRequestCraftsperson = Ext.create('Maintenance.model.WorkRequestCraftsperson');
            // The craftsperson model must contain valid data to allow the sync to succeed.
            workRequestCraftsperson.setData({
                cf_id: 'TRAM',
                wr_id: 1,
                comments: comments,
                date_assigned: expectedDate,
                time_assigned: expectedTime,
                mob_is_changed: 1,
                mob_locked_by: 'TRAM',
                hours_straight: 1
            });

            Ext.create('Maintenance.store.WorkRequestCraftspersons');

            workRequestCraftspersonsStore = Ext.getStore('workRequestCraftspersonsStore');

            workRequestCraftspersonsStore.add(workRequestCraftsperson);

            async = t.beginAsync(40000);

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    // Clean up the local database before inserting records
                    workRequestCraftspersonsStore.sync(function () {
                        workRequestCraftspersonsStore.synchronize(function () {
                            workRequestCraftspersonsStore.clearFilter();
                            workRequestCraftspersonsStore.filter('comments',
                                comments);
                            workRequestCraftspersonsStore.load(function (records) {
                                // Verify
                                Ext.each(records, function (record) {
                                    var dateAssigned = record.get('date_assigned');
                                    // verify that date value survived
                                    // roundtrip to server and back.
                                    t.is(dateAssigned, expectedDate,
                                        'Date value matches');

                                    var timeAssigned = record.get('time_assigned');
                                    // verify that time value survived
                                    // roundtrip to server and back.
                                    t.is(timeAssigned, expectedTime,
                                        'Time value matches');
                                });

                                t.endAsync(async);
                                t.done();
                            });
                        });
                    });
                });
        });
});
