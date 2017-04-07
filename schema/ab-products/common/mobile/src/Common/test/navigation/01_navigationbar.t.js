/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {


    t.requireOk('Common.view.navigation.NavigationBar', function () {
        var navigationBar = Ext.create('Common.view.navigation.NavigationBar', {isDetailView: false});

        t.done();

    });


});