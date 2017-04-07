/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.lang.LocaleManager', function () {
        t.requireOk('Common.sync.Manager', 'Common.service.Session', 'Common.test.util.TestUser', 'Common.store.Employees', 'Common.Application',
            'Common.plugin.ListPaging', 'Common.form.FormPanel', 'Common.control.Search', 'Common.control.field.Prompt', function () {

                var async,
                    store,
                    form,
                    record,
                    promptField;


                // Create TableDefs store
                Ext.create('Common.store.TableDefs');

                store = Ext.create('Common.store.Employees');
                record = Ext.create('Common.model.Employee');

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
                        store.load(function () {
                            form = Ext.factory({
                                model: 'Common.model.Employee',
                                record: record,
                                items: [
                                    {
                                        xtype: 'fieldset',
                                        items: [
                                            {
                                                xtype: 'prompt',
                                                name: 'em_id',
                                                title: 'Employees',
                                                label: 'Employee Code',
                                                store: 'employeesStore',
                                                selectedFields: ['name_first', 'name_last'],
                                                displayFields: [
                                                    {
                                                        name: 'name_first',
                                                        title: 'Name First'
                                                    },
                                                    {
                                                        name: 'name_last',
                                                        title: 'Name Last'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }, 'Common.form.FormPanel');
                            Ext.Viewport.add(form);

                            t.chain(
                                {waitFor: 'event', args: [form, 'painted'], desc: 'Form painted'},
                                {click: ">>prompt", desc: 'Clicked on the prompt field'},
                                {waitForCQVisible: 'list', desc: 'Selection list displayed'},
                                {click: '.x-list:not(.x-item-hidden) .x-list-item-first', desc: 'Clicked on the first employee in the list'},
                                {waitFor: 5000, desc: 'Wait for 5 seconds to be sure that field\'s value is set and the list is closed'},
                                function (next) {
                                    promptField = form.down('prompt');
                                    t.is(promptField.getComponent().input.dom.value, 'JOAN ABBERNAT', 'Prompt field displays name_first and name_last values: JOAN ABBERNAT');

                                    record = form.getRecord();
                                    t.is(record.get('em_id'), 'ABBERNAT, JOAN', 'Form record contains the em_id value (ABBERNAT, JOAN), not the user friendly value');

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
});