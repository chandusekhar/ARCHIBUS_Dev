/**
 * Verifies the document check-in operation of the SyncStore class.
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.store.sync.SyncStore', 'Maintenance.model.WorkRequest', 'Common.log.Logger', function () {

        var workRequestModel = Ext.create('Maintenance.model.WorkRequest');
        var syncStore = Ext.create('Common.store.sync.SyncStore');

        // Add a new document to the WorkRequest model
        workRequestModel.setData({
            wr_id: 1,
            doc1: 'test1.jpg',
            doc1_isnew: true,
            doc1_contents: 'AAAAAAAAAAAA',
            doc2: 'test2.jpg',
            doc2_isnew: true,
            doc2_contents: 'BBBBBBBBBBBB',
            doc3: 'test3.jpg',
            doc3_isnew: true,
            doc3_contents: 'CCCCCCCCCCCC',
            doc4: 'test4.jpg',
            doc4_isnew: true,
            doc4_contents: 'DDDDDDDDDDDD'
        });

        syncStore.processDocumentFields(workRequestModel);

        t.is(workRequestModel.get('doc1'), 'test1.jpg', 'content of doc1 match.');
        t.is(workRequestModel.get('doc1_contents'), 'AAAAAAAAAAAA', 'content of doc1_contents field are populated.');

        t.is(workRequestModel.get('doc2'), 'test2.jpg', 'content of doc2 match.');
        t.is(workRequestModel.get('doc2_contents'), 'BBBBBBBBBBBB', 'content of doc2_contents field are populated.');

        t.is(workRequestModel.get('doc3'), 'test3.jpg', 'content of doc3 match.');
        t.is(workRequestModel.get('doc3_contents'), 'CCCCCCCCCCCC', 'content of doc3_contents field are populated.');

        t.is(workRequestModel.get('doc4'), 'test4.jpg', 'content of doc4 match.');
        t.is(workRequestModel.get('doc4_contents'), 'DDDDDDDDDDDD', 'content of doc4_contents field are populated.');

        // Verify the data processing when the isnew field is false


        workRequestModel.setData({
            wr_id: 1,
            doc1: 'test1.jpg',
            doc1_isnew: false,
            doc1_contents: 'AAAAAAAAAAAA',
            doc2: 'test2.jpg',
            doc2_isnew: false,
            doc2_contents: 'BBBBBBBBBBBB',
            doc3: 'test3.jpg',
            doc3_isnew: false,
            doc3_contents: 'CCCCCCCCCCCC',
            doc4: 'test4.jpg',
            doc4_isnew: false,
            doc4_contents: 'DDDDDDDDDDDD'
        });

        syncStore.processDocumentFields(workRequestModel);

        t.is(workRequestModel.get('doc1'), 'test1.jpg', 'content of doc1 match.');
        t.is(workRequestModel.get('doc1_contents'), '', 'content of doc1_contents field are not populated.');

        t.is(workRequestModel.get('doc2'), 'test2.jpg', 'content of doc2 match.');
        t.is(workRequestModel.get('doc2_contents'), '', 'content of doc2_contents field are not populated.');

        t.is(workRequestModel.get('doc3'), 'test3.jpg', 'content of doc3 match.');
        t.is(workRequestModel.get('doc3_contents'), '', 'content of doc3_contents field are not populated.');

        t.is(workRequestModel.get('doc4'), 'test4.jpg', 'content of doc4 match.');
        t.is(workRequestModel.get('doc4_contents'), '', 'content of doc4_contents field are not populated.');


        Ext.define('GenericModel', {
            extend: 'Common.data.Model',
            config: {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'document', type: 'string', isDocumentField: 'true'},
                    {name: 'document_contents', type: 'string'},
                    {name: 'document_isnew', type: 'boolean'}
                ]
            }
        });


        var model = Ext.create('GenericModel');

        syncStore.setModel('GenericModel');

        model.setData({
            id: 1,
            document: 'file.png',
            document_contents: 'ZZZ',
            document_isnew: true
        });

        syncStore.processDocumentFields(model);

        t.is(model.get('document'), 'file.png', 'content of document match.');
        t.is(model.get('document_contents'), 'ZZZ', 'content of document_contents field are populated.');

        model.setData({
            id: 1,
            document: 'file.png',
            document_contents: 'ZZZ',
            document_isnew: false
        });

        syncStore.processDocumentFields(model);

        t.is(model.get('document'), 'file.png', 'content of document match.');
        t.is(model.get('document_contents'), '', 'content of document_contents field are not populated.');

        t.done();


    });
});