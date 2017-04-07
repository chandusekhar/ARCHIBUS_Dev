// Tests AdminService.isUserMemberOfGroup() method call.
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* global StartTest */
/* jshint newcap: false */
StartTest(function (test) {

    test.requireOk('Common.scripts.ScriptManager', 'Common.service.Session',
        'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager',
        'Common.test.util.TestUser', 'Common.log.Logger', function () {

            var async;


            async = test.beginAsync();

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return MobileSecurityServiceAdapter.isUserMemberOfGroup('ASSET-MOB');
                })
                .then(function (isMember) {
                    test.is(isMember, true, 'Group check is successful');
                    return Promise.resolve();
                })
                .then(function () {
                    return MobileSecurityServiceAdapter.isUserMemberOfGroup('TENANT');
                })
                .then(function (isMember) {
                    test.is(isMember, true, 'Group check is successful');
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    test.fail(error);
                    return Promise.resolve();
                })
                .done(function () {
                    Common.service.Session.end();
                    test.endAsync(async);
                    test.done();
                });

        });
});
