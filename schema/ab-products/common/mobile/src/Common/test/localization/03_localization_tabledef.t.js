/**
 * Tests the translation of multiline heading values returned by the MobileSyncServiceAdapter.getTableDef
 * function.
 * Prerequisites
 * - Database with translated strings populated for the German language for the wr_sync table.
 */

/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.service.Session', 'Common.service.MobileSyncServiceAdapter', 'Common.test.util.TestUser',
        'Common.util.ConfigFileManager', 'Common.log.Logger', function () {

            var async;
            var getMlHeadingFromFieldDefs = function (fieldName, fieldDefs) {
                var i;

                for (i = 0; i < fieldDefs.length; i++) {
                    if (fieldDefs[i].name === fieldName) {
                        return fieldDefs[i].multiLineHeadings;
                    }
                }
                return '';
            };

            var convertMlHeadingArrayToString = function (mlHeading) {
                var headingString = '';
                Ext.each(mlHeading, function (headingItem) {
                    headingString += headingItem + ' ';
                });

                return Ext.String.trim(headingString);
            };

            var onFinished = function () {
                Common.service.Session.end();
                t.endAsync(async);
                t.done();
            };

            async = t.beginAsync();

            // Override the LocaleManager locale for testing
            LocaleManager.getBrowserLocale = function () {
                return 'de_DE';
            };


            // Register user
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return MobileSyncServiceAdapter.getTableDef('wr_sync');
                })
                .then(function (tableDef) {
                    var mlHeadingArray = getMlHeadingFromFieldDefs('location', tableDef.fieldDefs),
                        mlHeading = convertMlHeadingArrayToString(mlHeadingArray);
                    // German string should be Problemstelle

                    t.is(mlHeading, 'Problemstelle', 'German Multiline Heading matches');
                })
                .done(onFinished, onFinished);

        });
});