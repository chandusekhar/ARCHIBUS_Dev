StartTest(function (t) {

    t.requireOk('Common.test.util.TestUser', 'Common.service.Session', 'Common.store.sync.ValidatingTableStore',
        'Common.util.Network', 'Common.util.TableDef', 'Common.store.TableDefs', 'Common.store.proxy.Sqlite',
        'Common.store.Employees', 'Common.store.Rooms', 'Common.log.Logger', 'Common.config.GlobalParameters', function () {

            var employeeStore,
                roomsStore,
                async,
                onFinish = function () {
                    Common.service.Session.end();
                    t.endAsync(async);
                    t.done();
                };

            // Create TableDefs store
            Ext.create('Common.store.TableDefs');

            employeeStore = Ext.create('Common.store.Employees');
            roomsStore = Ext.create('Common.store.Rooms');

            // Adjust the roomsStore syncRecordsPageSize
            roomsStore.setSyncRecordsPageSize(100);

            async = t.beginAsync();

            // Register the test user
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return employeeStore.deleteAndImportRecords();
                })
                .then(function () {
                    return roomsStore.deleteAndImportRecords();
                })
                .then(function () {
                    employeeStore.load(function () {
                        var totalRecordCount = employeeStore.getTotalCount();
                        t.is(totalRecordCount, 721, 'The Employee table has 721 records');
                        return Promise.resolve();
                    });
                })
                .then(function () {
                    roomsStore.load(function () {
                        var totalRecordCount = roomsStore.getTotalCount();
                        t.is(totalRecordCount, 1831, 'The Room table has 1831 records');
                        return Promise.resolve();
                    });
                })
                .then(null, function (error) {
                    t.fail(error);
                })
                .done(onFinish, onFinish);
        });

});

