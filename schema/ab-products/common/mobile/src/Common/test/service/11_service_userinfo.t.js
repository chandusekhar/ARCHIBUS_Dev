/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.test.util.TestUser', 'Common.store.UserInfo', 'Common.store.proxy.Sqlite',
        'Common.service.MobileSecurityServiceAdapter', 'Common.model.UserInfo', 'Common.sync.Manager',
        'Common.promise.util.DatabaseOperation', 'Common.type.CustomType', 'Common.config.GlobalParameters', function () {

            var userInfoStore = Ext.create('Common.store.UserInfo');
            var async = t.beginAsync();

            var checkResultsTram = function (record) {
                t.is('TRAM', record.get('user_name'));
                t.is('WILL TRAM', record.get('cf_id'));
                t.is('ENGINEERING', record.get('dp_id'));
                t.is('ELECTRONIC SYS.', record.get('dv_id'));
                t.is('TRAM, WILL', record.get('em_id'));
                t.is('tram@tgd.com', record.get('email'));
                t.is('', record.get('bl_id'));
                t.is('', record.get('fl_id'));
                t.is('', record.get('rm_id'));
                t.is('', record.get('site_id'));

            };

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return userInfoStore.deleteAndImportRecords();
                })
                .then(function () {
                    return SyncManager.loadStore(userInfoStore);
                })
                .then(function () {
                    var record = userInfoStore.getAt(0);
                    checkResultsTram(record);
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.resolve();
                })
                .done(function () {
                    Common.service.Session.end();
                    t.done();
                    t.endAsync(async);
                });
        });
});

