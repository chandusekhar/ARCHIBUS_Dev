/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
/* global Questionnaire */
StartTest(function (t) {

    t.requireOk('Questionnaire.store.Questions', 'Common.test.util.TestUser',
        'Common.store.sync.ValidatingTableStore', 'Common.util.Network', 'Common.store.TableDefs', 'Questionnaire.Question',
        'Questionnaire.FormFactory', 'Common.service.Session', 'Common.log.Logger', 'Common.sync.Manager', 'Common.config.GlobalParameters',
        function () {
            var async,
                store;


            // Create TableDefs store
            Ext.create('Common.store.TableDefs');

            store = Ext.create('Questionnaire.store.Questions');
            async = t.beginAsync();

            // Register the test user
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return store.deleteAndImportRecords();
                })
                .then(function () {
                    return Common.service.Session.end();
                })
                .then(function () {
                    store.filter('Questionnaire_id', 'SERVICE DESK - GROUP MOVE');
                    store.load(function (records) {
                        var form = Questionnaire.FormFactory.getQuestionaireForm(records);
                        Ext.Viewport.add(form);

                        t.chain(
                            {waitFor: 'event', args: [form, 'painted']},
                            {waitFor: 10000},
                            function (next) {
                                t.endAsync(async);
                                t.done();
                                next();
                            }
                        );
                    }, this);

                })
                .then(null, function (error) {
                    t.fail(error);
                    return Common.service.Session.end();  // Close the Session if there is an error
                });


        });
});

