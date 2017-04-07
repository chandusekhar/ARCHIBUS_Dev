/**
 * Test writing and reading to a file
 */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.device.File', function () {
        var async = t.beginAsync();

        LocalFileSystem = {
            TEMPORARY: window.TEMPORARY || 0,
            PERSISTENT: window.PERSISTENT || 1
        };

        Common.device.File.writeFile('TestFile.txt', '<svg>some data</svg>')
            .then(function () {
                return Common.device.File.readFile('TestFile.txt');
            })
            .then(function (fileData) {
                t.is(fileData, '<svg>some data</svg>');
                return Promise.resolve();
            })
            .then(null, function (error) {
                t.fail(error);
                return Promise.resolve();
            })
            .done(function () {
                t.endAsync(async);
                t.done();
            });
    });
});
