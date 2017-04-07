/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.SqliteView', 'Common.store.sync.SqliteStore', 'Common.log.Logger', function () {
        var store,
            async;

        Ext.define('TestView', {
            extend: 'Common.store.sync.SqliteStore',
            requires: ['Common.store.proxy.SqliteView'],

            config: {
                storeId: 'testViewStore',
                fields: [
                    {name: 'bl_id', type: 'string'},
                    {name: 'site_id', type: 'string'},
                    {name: 'name', type: 'string'}
                ],
                autoLoad: false,
                enableAutoLoad: true,
                remoteFilter: true,
                proxy: {
                    type: 'SqliteView',

                    viewDefinition: 'SELECT bl.bl_id,bl.site_id,bl.name FROM Building bl',

                    viewName: 'TestView',

                    baseTables: ['Building']
                }
            }
        });

        store = Ext.create('TestView');

        async = t.beginAsync();
        store.load(function (records) {
            var recordsExist = (records.length > 0),
                numberOfFields;

            t.is(recordsExist, true, 'Retrieved records from view.');
            if (recordsExist) {
                numberOfFields = records[0].getFields().items.length;
                // Check number of fields plus the id field
                t.is(numberOfFields, 4, 'Number of view fields is OK');
                store.getProxy().setViewDefinition("SELECT bl_id, site_id,name FROM Building WHERE bl_id = 'HQ' ");
                store.load(function (records2) {
                    if (records2.length > 0) {
                        numberOfFields = records2[0].getFields().items.length;
                        t.is(numberOfFields, 4, 'Number of modified view fields is OK');
                    } else {
                        t.fail('No records returned');
                    }
                    t.endAsync(async);
                    t.done();
                });
            }

        });
    });
});
