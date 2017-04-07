/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.data.Model', 'Common.store.sync.SyncStore', 'Common.store.proxy.SqliteConnectionManager',
        'Common.store.proxy.Sqlite', function () {
            var testModel,
                store,
                currentDate,
                modelData,
                async;

            Ext.define('TestModel', {
                extend: 'Common.data.Model',

                config: {
                    fields: [
                        {name: 'id', type: 'int'},
                        {name: 'intfld', type: 'integerclass'},
                        {name: 'datefld', type: 'dateclass'},
                        {name: 'timefld', type: 'timeclass'},
                        {name: 'timestampfld', type: 'timestampclass'},
                        {name: 'stringfld', type: 'string'},
                        {name: 'baseintfld', type: 'int'},
                        {name: 'floatfld', type: 'float'},
                        {name: 'booleanfld', type: 'bool'},
                        {name: 'basedatefld', type: 'date'}
                    ]
                }
            });


            testModel = Ext.create('TestModel');

            // Create store
            store = Ext.create('Common.store.sync.SyncStore',
                {
                    model: 'TestModel',
                    storeId: 'typeTestStore',
                    proxy: {
                        type: 'Sqlite',
                        tableName: 'typetest'
                    }
                });

            store.enableAutoLoad = false;

            // Create and populate the model

            currentDate = new Date();
            modelData = {
                intfld: 98,
                datefld: '2012-12-25',
                timefld: '15:45',
                timestampfld: '2012-11-30 17:55:33',
                stringfld: 'Test String',
                baseintfld: 101,
                floatfld: 87.543,
                booleanfld: true,
                basedatefld: currentDate
            };

            testModel.setData(modelData);

            store.add(testModel);

            store.on('write', function () {
                // Read the data back
                var index = store.findExact('intfld', 98),
                    record;

                if (index > -1) {
                    record = store.getAt(index);
                    t.ok(record.get('intfld') === 98, 'intfld matches');
                    t.isDateEqual(record.get('datefld'), new Date(2012, 11, 25, 0, 0, 0), 'datefld matches');
                    t.isDateEqual(record.get('timefld'), new Date(1970, 0, 1, 15, 45, 0), 'timefld matches');
                    t.isDateEqual(record.get('timestampfld'), new Date(2012, 10, 30, 17, 55, 33), 'timefld matches');
                    t.ok(record.get('stringfld') === 'Test String', 'stringfld matches');
                    t.ok(record.get('baseintfld') === 101, 'baseintfld matches');
                    t.ok(record.get('floatfld') === 87.543, 'floatfld matches');
                    t.ok(record.get('booleanfld') === true, 'booleanfld matches');
                    t.isDateEqual(record.get('basedatefld'), currentDate, 'basedatefld matches');
                }

                t.endAsync(async);
                t.done();
            });

            async = t.beginAsync();


            store.getProxy().dropAndCreateTable('TestModel', store.getModel(), function () {
                console.log('Drop and create table');
                store.sync();
            }, this);
        });
});
