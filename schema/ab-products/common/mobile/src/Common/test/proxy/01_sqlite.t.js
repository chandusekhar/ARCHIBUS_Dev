/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
/* global TestModel */
StartTest(function (t) {

    t.requireOk('Common.store.proxy.Sqlite', 'Ext.data.Model', 'Ext.data.Operation',
        'Common.store.proxy.SqliteConnectionManager', 'Common.test.util.Database', 'Common.data.Model',
        'Common.store.proxy.ChangeTableStructureOperation', 'Common.log.Logger', function () {

            var proxy = Ext.create('Common.store.proxy.Sqlite'),
                model,
                async;

            Ext.define('TestModel', {
                extend: 'Common.data.Model',
                config: {
                    proxy: proxy,

                    fields: [
                        {
                            name: 'id',
                            type: 'int'
                        },
                        {
                            name: 'field1',
                            type: 'string'
                        },
                        {
                            name: 'field2',
                            type: 'int'
                        },
                        {
                            name: 'field3',
                            type: 'string',
                            defaultValue: 'hello'
                        },
                        {
                            name: 'field4',
                            type: 'DateClass'
                        },
                        {
                            name: 'field5',
                            type: 'TimeClass'
                        },
                        {
                            name: 'field6',
                            type: 'TimeStampClass'
                        },
                        {
                            name: 'field7',
                            type: 'date'
                        },
                        {
                            name: 'field8',
                            type: 'IntegerClass'
                        },
                        {
                            name: 'field9',
                            type: 'Bool'
                        },
                        {
                            name: 'field10'
                        },
                        {
                            name: 'field11',
                            type: 'string',
                            persist: false
                        }
                    ]
                }
            });

            model = new TestModel();

            model.set('field1', 22);

            async = t.beginAsync();

            model.save(function () {
                Common.test.util.Database.getTableFields('TestModel', function (result) {

                    // The results are not guaranteed to be in order. We need to retrieve the
                    // the type for each field.

                    t.is(result.get('id').type, 'INTEGER', 'Integer type matches');
                    t.is(result.get('field1').type, 'TEXT', 'TEXT type matches');
                    t.is(result.get('field2').type, 'INTEGER', 'Integer type matches');
                    t.is(result.get('field3').type, 'TEXT', 'Text type matches');
                    t.is(result.get('field4').type, 'TEXT', 'Text type matches');
                    t.is(result.get('field5').type, 'TEXT', 'Text type matches');
                    t.is(result.get('field6').type, 'TEXT', 'Text type matches');
                    t.is(result.get('field7').type, 'TEXT', 'Text type matches');
                    t.is(result.get('field8').type, 'INTEGER', 'Integer type matches');
                    t.is(result.get('field10').type, 'TEXT', 'Text type matches');

                    t.endAsync(async);
                    t.done();

                }, this);

            }, this);

        });
});

