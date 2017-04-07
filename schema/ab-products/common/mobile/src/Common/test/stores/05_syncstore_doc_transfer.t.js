/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Maintenance.store.WorkRequests', 'Maintenance.model.WorkRequest',
        'Common.util.SynchronizationManager', 'Common.util.Device', 'Common.store.sync.ValidatingTableStore',
        'Common.store.TableDefs', 'Common.test.util.TestUser', 'Common.util.Network', 'Common.log.Logger', 'Common.config.GlobalParameters', function () {

            var workRequestStore = Ext.create('Maintenance.store.WorkRequests'),
                workRequestModel = Ext.create('Maintenance.model.WorkRequest'),
                tableDefsStore = Ext.create('Common.store.TableDefs'),
                imageData,
                async;

            // Add document fields to the store in case they are not defined in the file
            workRequestStore.serverFieldNames = ['wr_id', 'bl_id', 'fl_id', 'rm_id', 'site_id', 'cf_notes', 'date_requested', 'description',
                'eq_id', 'location', 'priority', 'prob_type', 'requestor', 'tr_id', 'status', 'mob_locked_by',
                'mob_pending_action', 'mob_wr_id', 'doc1', 'doc2', 'doc3', 'doc4'];

            imageData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAwUExURQAm///YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAt4U8AAAAJcEhZcwAADsIAAA7CARUoSoAAAAAVSURBVBjTY2AAAkEgYKCQQQ0zgAAAMp8EQTkXHrEAAAAASUVORK5CYII=';

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm');


            // Include required fields
            workRequestModel.set('wr_id', 1001);
            workRequestModel.set('bl_id', 'Building 1');
            workRequestModel.set('fl_id', 'Floor 1');
            workRequestModel.set('prob_type', 'Doc Test');
            workRequestModel.set('description', 'Doc Test');
            workRequestModel.set('mob_is_changed', 1);
            workRequestModel.set('mob_wr_id', 1001);

            workRequestModel.set('doc1', 'file1.jpg');
            workRequestModel.set('doc1_contents', imageData);
            workRequestModel.set('doc1_isnew', true);

            workRequestStore.add(workRequestModel);

            async = t.beginAsync();

            workRequestStore.on('write', function () {
                tableDefsStore.load(function () {
                    try {
                        SynchronizationManager.syncTransactionTables('workRequestsStore', function () {
                            // TODO: Check values here
                            t.done('Sync Finished');
                        });
                    } catch (e) {
                        console.log('Sync Error');
                    }

                });
            });

            workRequestStore.sync();

            t.endAsync(async);
            t.done();

        });

});


