/* global StartTest */
/**
 * Tests the TableDef.getPrimaryKeyFieldsFromTableDef function. Verifies that the correct primary key fields are
 * returned and that the primary key fields are in the correct order.
 */
StartTest(function (t) {

    t.requireOk('Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.Sqlite', 'Common.service.Session',
        'Common.store.TableDefs', 'Common.util.TableDef', 'Common.test.util.TestUser',
        'Common.service.MobileSyncServiceAdapter', 'Common.log.Logger', 'Common.config.GlobalParameters', function () {

            var buildingTableDef,
                floorTableDef,
                roomTableDef,
                buildingPrimaryKeys,
                floorPrimaryKeys,
                roomPrimaryKeys,
                onFinished = function () {
                    Common.service.Session.end();
                    t.endAsync(async);
                    t.done();
                },
                async = t.beginAsync();

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return TableDef.getTableDefFromServer('bl');
                })
                .then(function (blTableDef) {
                    buildingTableDef = blTableDef;
                    return TableDef.getTableDefFromServer('fl');
                })
                .then(function (flTableDef) {
                    floorTableDef = flTableDef;
                    return TableDef.getTableDefFromServer('rm');
                })
                .then(function (rmTableDef) {
                    roomTableDef = rmTableDef;
                    buildingPrimaryKeys = TableDef.getPrimaryKeyFieldsFromTableDef(buildingTableDef);
                    floorPrimaryKeys = TableDef.getPrimaryKeyFieldsFromTableDef(floorTableDef);
                    roomPrimaryKeys = TableDef.getPrimaryKeyFieldsFromTableDef(roomTableDef);

                    t.is(buildingPrimaryKeys[0], 'bl_id', 'Building Table Primary Keys are valid.');

                    t.is(floorPrimaryKeys[0], 'bl_id', 'Floor Table PK 1 is valid');
                    t.is(floorPrimaryKeys[1], 'fl_id', 'Floor Table PK 2 is valid');

                    t.is(roomPrimaryKeys[0], 'bl_id', 'Room Table PK 1 is valid');
                    t.is(roomPrimaryKeys[1], 'fl_id', 'Room Table PK 2 is valid');
                    t.is(roomPrimaryKeys[2], 'rm_id', 'Room Table PK 3 is valid');
                })
                .done(onFinished, onFinished);
        });
});
