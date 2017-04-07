/**
 * Tests the date conversion of the MobileSyncServiceAdapter.checkInRecords
 * function. To execute this test: - Delete all values in the wrcf_sync table. -
 * Execute the test
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk(
        'Maintenance.model.WorkRequestCraftsperson', 'Common.log.Logger', 'Common.config.GlobalParameters',
        'Common.scripts.ScriptManager', 'Common.service.MobileSyncServiceAdapter', 'Common.service.MobileSecurityServiceAdapter',
        'Common.util.ConfigFileManager', 'Common.store.sync.SchemaUpdaterStore', 'Common.test.util.Database',
        'Common.test.util.TestUser', 'Common.util.Network', 'Common.service.Session',
        function () {
            var syncFields = ['wr_id', 'cf_id', 'date_assigned', 'time_assigned', 'comments'];
            var async;
            var testWrId = Math.floor(Math.random() * 10000);
            var initialWrDateValues = {};

            var generateModels = function () {
                var wrIdSeed = testWrId;
                var modelData = {
                        cf_id: 'WILL TRAM',
                        time_assigned: '12:00',
                        hours_straight: 1.0,
                        mob_locked_by: 'TRAM'
                    },
                    modelRecords = [],
                    workRequestCraftsperson,
                    i;

                for (i = 1; i < 13; i++) {
                    modelData.wr_id = wrIdSeed;
                    modelData.date_assigned = '2013-' + i + '-01';
                    wrIdSeed += 1;
                    workRequestCraftsperson = Ext.create('Maintenance.model.WorkRequestCraftsperson');
                    workRequestCraftsperson.setData(modelData);
                    modelRecords.push(workRequestCraftsperson);
                }

                return modelRecords;
            };

            var checkResult = function (records) {
                var p,
                    resultWrDateValues = {};
                // Compare the returned values of date_assigned
                Ext.each(records, function (record) {
                    // Convert records to objects
                    resultWrDateValues[record.fieldValues[0].fieldValue] = record.fieldValues[2].fieldValue;
                });

                for (p in resultWrDateValues) {
                    t.isDateEqual(resultWrDateValues[p], initialWrDateValues[p], 'Dates match after sync');
                }
            };

            var onFinished = function () {
                Common.service.Session.end();
                t.endAsync(async);
                t.done();
            };

            // Get an array of model records with the date_assigned
            // value for each month in the year
            var modelRecords = generateModels(),
                i = 0;

            // Test the date_assigned values in the model before
            // syncing
            Ext.each(modelRecords, function (record) {
                // The wrId value is equal to the
                // month value of the record
                var dateAssigned = record.get('date_assigned'),
                    expectedDate = new Date(2013, i++, 1);

                // Save values for result check
                initialWrDateValues[record.get('wr_id')] = dateAssigned;

                t.is(dateAssigned, expectedDate, 'Date Assigned values match before sync');
            });

            async = t.beginAsync();

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return MobileSyncServiceAdapter.checkInRecords('wrcf_sync', syncFields, modelRecords);
                })
                .then(function () {
                    var modelInstance = Ext.ModelManager.getModel('Maintenance.model.WorkRequestCraftsperson'),
                        startWrId = testWrId,
                        endWrId = testWrId + 12,
                        restriction = {};

                    restriction.clauses = [
                        {
                            tableName: 'wrcf_sync',
                            fieldName: 'wr_id',
                            operation: 'GTE',
                            value: startWrId,
                            relativeOperation: 'AND'
                        },
                        {
                            tableName: 'wrcf_sync',
                            fieldName: 'wr_id',
                            operation: 'LTE',
                            value: endWrId,
                            relativeOperation: 'AND'
                        }
                    ];

                    return MobileSyncServiceAdapter.checkOutRecords('wrcf_sync', syncFields, restriction, modelInstance);
                })
                .then(function (records) {
                    checkResult(records);
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.reject();
                })
                .done(onFinished, onFinished);
        });
});
