/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.lang.LocaleManager', function () {
        t.requireOk('Common.sync.Manager', 'Common.service.Session', 'Common.test.util.TestUser', 'Common.store.Buildings','Common.store.Floors','Common.store.Rooms', 'Common.store.FloorPrompt', 'Common.store.RoomPrompt', 'Common.Application',
            'Common.plugin.ListPaging', 'Common.form.FormPanel', 'Common.control.Search', 'Common.control.field.Prompt', function () {

                var async,
                    sitesStore,
                    blStore,
                    flStore,
                    rmStore,
                    form,
                    formRecord,
                    promptField;


                // Create TableDefs store
                Ext.create('Common.store.TableDefs');

                sitesStore = Ext.create('Common.store.Sites');
                blStore = Ext.create('Common.store.Buildings');
                flStore = Ext.create('Common.store.FloorPrompt');
                rmStore = Ext.create('Common.store.RoomPrompt');

                formRecord = Ext.create('Common.model.Equipment');
                formRecord.set('site_id', 'MARKET');

                async = t.beginAsync();

                // Register the test user
                Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                    .then(function () {
                        return Common.service.Session.start();
                    })
                    .then(function () {
                        return blStore.deleteAndImportRecords();
                    })
                    .then(function () {
                        return Ext.create('Common.store.Floors').deleteAndImportRecords();
                    })
                    .then(function () {
                        return Ext.create('Common.store.Rooms').deleteAndImportRecords();
                    })
                    .then(function () {
                        return Common.service.Session.end();
                    })
                    .then(SyncManager.loadStores(['sitesStore', 'buildingsStore', 'floorPromptStore', 'roomPromptStore']))
                    .then(function () {
                        form = Ext.factory({
                            model: 'Common.model.Equipment',
                            record: formRecord,
                            items: [
                                {
                                    xtype: 'prompt',
                                    name: 'site_id',
                                    label: 'Site Code',
                                    title: 'Sites',
                                    store: sitesStore,
                                    displayFields: [
                                        {
                                            name: 'site_id',
                                            title: 'Site Code'
                                        }
                                    ],
                                    childFields: ['bl_id', 'fl_id', 'rm_id']
                                },
                                {
                                    xtype: 'prompt',
                                    name: 'bl_id',
                                    label: 'Building Code',
                                    title: 'Buildings',
                                    store: blStore,
                                    selectedFields: ['name'],
                                    displayFields: [
                                        {
                                            name: 'bl_id',
                                            title: 'Building Code'
                                        },
                                        {
                                            name: 'name',
                                            title: 'Building'
                                        }
                                    ],
                                    parentFields: ['site_id']
                                },
                                {
                                    xtype: 'prompt',
                                    name: 'fl_id',
                                    label: 'Floor Code',
                                    title: 'Floor',
                                    store: flStore,
                                    selectedFields: ['name'],
                                    displayFields: [
                                        {
                                            name: 'fl_id',
                                            title: 'Floor Code'
                                        },
                                        {
                                            name: 'bl_id',
                                            title: 'Building Code'
                                        }
                                    ],
                                    parentFields: ['site_id', 'bl_id']
                                },
                                {
                                    xtype: 'prompt',
                                    name: 'rm_id',
                                    label: 'Room Code',
                                    title: 'Rooms',
                                    store: rmStore,
                                    selectedFields: ['name'],
                                    displayFields: [
                                        {
                                            name: 'rm_id',
                                            title: 'Room Code'
                                        },
                                        {
                                            name: 'fl_id',
                                            title: 'Floor Code'
                                        },
                                        {
                                            name: 'bl_id',
                                            title: 'Building Code'
                                        }
                                    ],
                                    parentFields: ['site_id', 'bl_id', 'fl_id']
                                }
                            ]
                        }, 'Common.form.FormPanel');
                        Ext.Viewport.add(form);

                        t.chain(
                            {waitFor: 'event', args: [form, 'painted'], desc: 'Form painted'},
                            {click: ">>prompt[name=rm_id]", desc: 'Clicked on the room prompt field'},
                            {waitForCQVisible: 'list', desc: 'Selection list displayed'},
                            {
                                click: '.x-list:not(.x-item-hidden) .x-list-item-first',
                                desc: 'Clicked on the first room in the list.'
                            },
                            {
                                waitFor: 5000,
                                desc: 'Wait for 5 seconds to be sure that field\'s value is set and the list is closed'
                            },
                            function (next) {
                                formRecord = form.getRecord();

                                promptField = form.down('prompt[name=bl_id]');
                                t.is(promptField.getComponent().input.dom.value, 'Headquarters', 'Building name is displayed in the field: "Headquarters"');
                                t.is(formRecord.get('bl_id'), 'HQ', 'Form record contains the bl_id value (HQ), not the user friendly value');

                                promptField = form.down('prompt[name=fl_id]');
                                t.is(promptField.getComponent().input.dom.value, 'First Floor', 'Floor name is displayed in the field: "First Floor"');
                                t.is(formRecord.get('fl_id'), '01', 'Form record contains the fl_id value (01), not the user friendly value');

                                promptField = form.down('prompt[name=rm_id]');
                                t.is(promptField.getComponent().input.dom.value, '105', 'Room name is displayed in the field: "105"');
                                t.is(formRecord.get('rm_id'), '105', 'Form record contains the rm_id value (105)');

                                t.endAsync(async);
                                t.done();
                                next();
                            }
                        );
                    }, this)
                    .then(null, function (error) {
                        t.fail(error);
                        return Common.service.Session.end();  // Close the Session if there is an error
                    });
            });
    });
});