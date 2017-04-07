/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.util.VersionInfo', function () {

        var async = t.beginAsync();

        Common.util.VersionInfo.getVersionInfo('')
            .then(function (versionInfo) {
                t.is(versionInfo.version, '23', 'Version matches');
                t.is(versionInfo.revision, '1', 'Revision matches');
                t.is(versionInfo.schemaversion, '141', 'Schema Version matches');
                t.is(versionInfo.cordovaversion, '3.5.0', 'Cordova version matches');
                t.endAsync(async);
                t.done();
            }, function (error) {
                t.endAsync(async);
                t.fail(error);
            });

    });
});
