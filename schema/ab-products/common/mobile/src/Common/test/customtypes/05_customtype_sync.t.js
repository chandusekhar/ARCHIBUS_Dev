// Tests if all supported by the WebCentral data types survive roundtrip to the server and back (including saving and loading from database).
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (test) {

    test.requireOk(
        'Maintenance.model.WorkRequestCraftsperson',
        'Common.scripts.ScriptManager',
        'Common.service.MobileSyncServiceAdapter',
        'Common.service.MobileSecurityServiceAdapter',
        'Common.test.util.TestUser',
        'Common.util.Network',
        'Common.Session', 'Common.log.Logger',

        function () {

            // Create and populate the model
            var workRequestCraftspersonModel = Ext.create('Maintenance.model.WorkRequestCraftsperson');

            // Supported type: Common.type.Integer
            // Generate a random wr_id
            var idExpected = Math.floor(Math.random() * 1001);
            workRequestCraftspersonModel.set('wr_id', idExpected);
            test.isaOk(workRequestCraftspersonModel.data.wr_id, 'Common.type.Integer',
                'wr_id field of the Model contains JavaScript object of type Common.type.Integer.');

            // Supported type: string
            var cfIdExpected = 'TRAM';
            workRequestCraftspersonModel.set('cf_id', cfIdExpected);
            test.is(test.typeOf(workRequestCraftspersonModel.data.cf_id), 'String',
                'cf_id field of the Model contains JavaScript value of type string.');

            // Supported type: Common.type.Date
            var dateAssignedExpected = new Date(2012, 9, 31, 0, 0, 0, 0);
            workRequestCraftspersonModel.set('date_assigned', dateAssignedExpected);
            test.isaOk(workRequestCraftspersonModel.data.date_assigned, 'Common.type.Date',
                'date_assigned field of the Model contains JavaScript object of type Common.type.Date.');

            // Supported type: Common.type.Time
            var timeAssignedExpected = new Date(1970, 0, 1, 16, 45, 0, 0);
            workRequestCraftspersonModel.set('time_assigned', timeAssignedExpected);
            test.isaOk(workRequestCraftspersonModel.data.time_assigned, 'Common.type.Time',
                'time_assigned field of the Model contains JavaScript object of type Common.type.Time.');

            // Supported type: number(float)
            var hoursStraightExpected = 123.45;
            workRequestCraftspersonModel.set('hours_straight', hoursStraightExpected);
            test.is(test.typeOf(workRequestCraftspersonModel.data.hours_straight), 'Number',
                'hours_straight field of the Model contains JavaScript value of type number.');


            var verifyResults = function (recordActual) {
                var idActual = recordActual.data.wr_id;
                test.is(idActual, idExpected, 'wr_id matches');
                test.isaOk(idActual, 'Common.type.Integer',
                    'wr_id field of the Model contains JavaScript object of type Common.type.Integer.');


                var dateAssignedActual = recordActual.data.date_assigned;
                test.is(dateAssignedActual.getValue(),
                    dateAssignedExpected,
                    'date_assigned matches');
                test.isaOk(dateAssignedActual, 'Common.type.Date',
                    'date_assigned field of the Model contains JavaScript object of type Common.type.Date.');

                var timeAssignedActual = recordActual.data.time_assigned;
                test.is(timeAssignedActual.getValue(), timeAssignedExpected, 'time_assigned matches');
                test.isaOk(timeAssignedActual, 'Common.type.Time',
                    'time_assigned field of the Model contains JavaScript object of type Common.type.Time.');


                var cfIdActual = recordActual.data.cf_id;
                test.is(cfIdActual, cfIdExpected, 'cf_id matches');
                test.is(test.typeOf(cfIdActual), 'String',
                    'cf_id field of the Model contains JavaScript value of type string.');

                var hoursStraightActual = recordActual.data.hours_straight;
                test.is(hoursStraightActual, hoursStraightExpected, 'hours_straight matches');
                test.is(test.typeOf(hoursStraightActual), 'Number',
                    'hours_straight field of the Model contains JavaScript value of type number.');

                test.endAsync(async);
                test.done();
            };

            var serverTableName = 'wrcf_sync';

            // Register user
            //Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

            var restriction = {};
            restriction.clauses = [
                {
                    tableName: serverTableName,
                    fieldName: 'wr_id',
                    operation: 'EQUALS',
                    value: idExpected
                }
            ];

            var async = test.beginAsync();
            var checkedOutRecords = [];


            // Check in the record
            var session = Ext.create('Common.Session');
            var records = [workRequestCraftspersonModel];
            session.startSession();
            Common.service.MobileSyncServiceAdapter.checkInRecords(serverTableName, [
                'wr_id', 'cf_id',
                'date_assigned',
                'time_assigned'], records, function (result) {
                session.endSession();
                if (result.success) {
                    // Check out the same record
                    session.startSession();
                    Common.service.MobileSyncServiceAdapter.checkOutRecords(serverTableName, [
                            'wr_id', 'cf_id',
                            'date_assigned',
                            'time_assigned',
                            'hours_straight'],
                        restriction,
                        'Maintenance.model.WorkRequestCraftsperson', function (result) {
                            session.endSession();
                            if (result.success) {
                                checkedOutRecords = result.records;
                                verifyResults(checkedOutRecords[0]);
                            } else {
                                alert('Error Checking out records ' + result.exception);
                            }
                        }, this);
                } else {
                    alert('Error Checking in Records ' + result.exception);
                }
            }, this);
        });
});
