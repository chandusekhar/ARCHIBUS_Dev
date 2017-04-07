// Tests AdminService.isUserMemberOfGroup() method call.
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* global StartTest */
/* jshint newcap: false */
StartTest(function (test) {

    test.requireOk('Common.scripts.ScriptManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.util.ConfigFileManager', 'Common.test.util.TestUser', 'Common.Session', function () {

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm');
            var session = Ext.create('Common.Session');
            var onCompleted = function () {
                test.endAsync(async);
                session.endSession();
                test.done();
            };

            var errorHandler = function (message) {
                test.fail('MobileSecurityServiceAdapter exception ' + message);
                onCompleted();
            };

            var checkIsMemberOfGroup = function (group, user, desiredResult, callback) {
                MobileSecurityServiceAdapter.isUserMemberOfGroupAsync(group, function (isMemberOfGroup) {
                    test.is(isMemberOfGroup, desiredResult, Ext.String.format('User {0} is a member of the {1} group', user, group));
                    Ext.callback(callback, this);
                }, errorHandler);
            };

            var group1 = 'SPAC-SURVEY';
            var group2 = 'SPAC-SURVEY-POST';
            session.startSession();

            var async = test.beginAsync();

            session.startSession();
            checkIsMemberOfGroup(group1, 'TRAM', true, function () {
                checkIsMemberOfGroup(group2, 'TRAM', true, function () {
                    onCompleted();
                });
            });

        });
});

