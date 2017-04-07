/**
 * Table used for testing:
 *  CREATE TABLE afm.testtable(autonumber int not null primary key, eq_id char(24), eq_std char(24));
 */

/* jshint newcap:false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.test.util.TestUser', 'Common.log.Logger', 'Common.config.GlobalParameters', 'Common.store.sync.ValidatingTableStore',
        'Common.util.Network', 'Common.util.TableDef', 'Common.store.TableDefs', 'Common.store.proxy.Sqlite',
        function () {

            var testStore,
                async,
                onFinish = function () {
                    Common.service.Session.end();
                    t.endAsync(async);
                    t.done();
                };


            // Create TableDefs store
            Ext.create('Common.store.TableDefs');

            // Create the Test model
            Ext.define('TestModel', {
                extend: 'Ext.data.Model',
                fields: [
                    {
                        name: 'id',
                        type: 'int'
                    },
                    {
                        name: 'autonumber',
                        type: 'int'
                    },
                    {
                        name: 'eq_id',
                        type: 'string'
                    },
                    {
                        name: 'eq_std',
                        type: 'string'
                    }
                ]
            });

            testStore = Ext.create('Common.store.sync.ValidatingTableStore', {
                model: 'TestModel',
                storeId: 'testStore',
                remoteSort: true,
                remoteFilter: true,
                enableAutoLoad: true,
                proxy: {
                    type: 'Sqlite'
                }
            });

            // set testStore properties
            testStore.serverTableName = 'testtable';
            testStore.serverFieldNames = ['autonumber', 'eq_id', 'eq_std'];
            testStore.inventoryKeyNames = ['autonumber'];

            async = t.beginAsync();

            // Register the test user
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return testStore.deleteAndImportRecords();
                })
                .then(function () {
                    testStore.load(function (records) {
                        t.is(records.length, 0, 'Store loaded with 0 records');
                        return Promise.resolve();
                    }, this);
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.reject();
                })
                .done(onFinish, onFinish);
        });
});

