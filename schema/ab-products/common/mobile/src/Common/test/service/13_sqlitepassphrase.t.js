/**
 * Verify the getSqlitePassphrase function
 * Prerequsite: The Passphrase is set in the mobileservices.properties file
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.test.util.TestUser', 'Common.service.MobileSecurityServiceAdapter', 'Common.log.Logger',
        'Common.service.Session', function () {

            var async = t.beginAsync();

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function() {
                    return Common.service.Session.start();
                })
                .then(function() {
                    return MobileSecurityServiceAdapter.getSqlitePassphrase();
                })
                .then(function(passPhrase) {
                    t.is(passPhrase, 'TestPhrase', 'Passphrase matches server property');
                    return Promise.resolve();
                })
                .then(function() {
                    return Common.service.Session.end();
                })
                .then(null, function(error) {
                    t.fail(error);
                    return Common.service.Session.end();  // Close Session in case of error
                })
                .done(function(){
                    t.endAsync(async);
                    t.done();
                });
        });
});