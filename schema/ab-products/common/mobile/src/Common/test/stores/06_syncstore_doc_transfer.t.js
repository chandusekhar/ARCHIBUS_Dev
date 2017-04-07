/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Maintenance.store.WorkRequests', 'Maintenance.model.WorkRequest',
        'Common.util.SynchronizationManager', 'Common.util.Device', 'Common.store.sync.ValidatingTableStore',
        'Common.store.TableDefs', 'Common.Session', 'Common.store.UserProfiles',
        'Common.util.UserProfile', 'Common.service.workflow.Workflow', 'Common.config.GlobalParameters',
        'Common.test.util.TestUser', 'Common.util.Network', function () {

            var workRequestStore = Ext.create('Maintenance.store.WorkRequests'),
                tableDefsStore = Ext.create('Common.store.TableDefs'),
                userProfilesStore = Ext.create('Common.store.UserProfiles'),
                executeWorkFlowRules,
                imageData,
                async,

            // Work request to use for the test. The wr_id must exist in the mobile database.
                WRID = 1150000498;

            userProfilesStore.load();

            /**
             * Executes the server side workflow rules
             */
            executeWorkFlowRules = function () {
                var session = Ext.create('Common.Session');

                /**
                 * Process the Work Request data on the Web Central server
                 */
                session.doInSession(function () {
                    Common.service.workflow.Workflow.callMethod('AbBldgOpsHelpDesk-MaintenanceMobileService-syncWorkData',
                        'TRAM', 'WILL TRAM');
                });
            };

            // Add document fields to the store in case they are not defined in the file
            workRequestStore.serverFieldNames = ['wr_id', 'bl_id', 'fl_id', 'rm_id', 'site_id', 'cf_notes', 'date_requested', 'description',
                'eq_id', 'location', 'priority', 'prob_type', 'requestor', 'tr_id', 'status', 'mob_locked_by', 'mob_is_changed',
                'mob_pending_action', 'mob_wr_id', 'doc1', 'doc2', 'doc3', 'doc4', 'pmp_id', 'date_assigned', 'date_est_completion'];

            imageData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAwUExURQAm///YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAt4U8AAAAJcEhZcwAADsIAAA7CARUoSoAAAAAVSURBVBjTY2AAAkEgYKCQQQ0zgAAAMp8EQTkXHrEAAAAASUVORK5CYII=';

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

            async = t.beginAsync();

            workRequestStore.on('write', function () {
                tableDefsStore.load(function () {
                    // Simulate the Maintenance app sync process. Sync, run WFR, sync again.
                    SynchronizationManager.syncTransactionTables('workRequestsStore', function () {
                        // Check the value of the doc1_contentss field.
                        executeWorkFlowRules();
                        SynchronizationManager.syncTransactionTables('workRequestsStore', function () {

                            workRequestStore.load(function () {
                                var workRequestRecord = workRequestStore.findRecord('wr_id', WRID),
                                    docContents = workRequestRecord.get('doc1_contents'),
                                    fileName = workRequestRecord.get('doc1');

                                t.is(docContents && docContents.length > 0, true, 'Document contents are populated.');
                                t.is(fileName, 'file_1150000498.jpg', 'Document file name matches');

                                t.endAsync(async);
                                t.done();
                            });
                        }, this);
                    });
                });
            });

            // Use an existing work request assigned to user TRAM
            workRequestStore.load(function () {
                var workRequestRecord = workRequestStore.findRecord('wr_id', WRID);
                if (workRequestRecord === null) {
                    alert('Work Request ' + WRID + ' was not found in the database. Sync the Maintenance work requests or use a different wr_id.');
                    t.endAsync(async);
                    t.done();
                } else {
                    workRequestRecord.set('doc1', 'file_1150000498.jpg');
                    workRequestRecord.set('doc1_contents', imageData);
                    workRequestRecord.set('doc1_isnew', true);
                    workRequestRecord.set('mob_is_changed', 1);
                    workRequestStore.sync();
                }
            });
        });
});

