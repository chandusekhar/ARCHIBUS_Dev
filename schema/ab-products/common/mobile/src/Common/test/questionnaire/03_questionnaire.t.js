/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Questionnaire.store.Questions', 'Common.test.util.TestUser',
        'Common.store.sync.ValidatingTableStore', 'Common.util.Network', 'Common.store.TableDefs', 'Questionnaire.Question',
        'Questionnaire.FormFactory', 'Common.data.ModelGenerator', 'Common.service.Session', 'Common.log.Logger',
        'Common.config.GlobalParameters',
        function () {
            var table = 'fnstd';
            var field = 'category';
            var async;

            var createStore = function (table) {
                var store = Ext.create('Common.store.sync.ValidatingTableStore', {
                    storeId: table + '_dynamic',
                    remoteSort: true,
                    remoteFilter: true,
                    enableAutoLoad: true,
                    proxy: {
                        type: 'Sqlite'
                    }
                });

                return store;
            };

            // Register the test user
            //Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

            // Create TableDefs store
            Ext.create('Common.store.TableDefs');

            // Dynamically build a store and sync it

            async = t.beginAsync();

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return Common.promise.util.TableDef.getTableDefFromServer(table);
                })
                .then(function (tableDef) {
                    var store = createStore(table),
                        primaryKeys = Common.promise.util.TableDef.getPrimaryKeyFieldsFromTableDef(tableDef),
                        fieldFieldDef = TableDef.findFieldDef(tableDef, field),
                        fieldModelType = Common.data.ModelGenerator.mapFieldDefDataTypeToModelFieldDataType(fieldFieldDef.dataType);

                    var model = Ext.define(table + '_question', {
                        extend: 'Ext.data.Model',
                        config: {
                            fields: [
                                {name: 'id', type: 'int'},
                                {name: field, type: fieldModelType}
                            ]
                        }

                    });

                    store.setModel(model);
                    store.serverTableName = table;
                    store.serverFieldNames = [field];
                    store.inventoryKeyNames = primaryKeys;

                    return store.deleteAndImportRecords();
                })
                .then(function () {
                    return Common.service.Session.end();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Common.service.Session.end();
                })
                .done(function () {
                    t.endAsync(async);
                    t.done();

                });

        });
});
