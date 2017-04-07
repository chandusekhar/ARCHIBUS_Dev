Ext.define('Solutions.view.DocumentDownload', {
    extend: 'Ext.Container',

    requires: [
        'Common.document.DocumentManager',
        'Common.device.File'
    ],

    config: {
        style: 'margin:10px',
        items: [
            {
                xtype: 'fieldset',
                instructions: 'This example checks out an ARCHIBUS document and saves the document file on the device.'
            },
            {
                xtype: 'container',
                style: 'margin-top:20px',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                items: {
                    xtype: 'button',
                    text: 'Download',
                    itemId: 'downloadButton',
                    width: '70%'
                }
            },
            {
                xtype: 'container',
                style: 'margin-top:20px',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                items: {
                    xtype: 'button',
                    text: 'Display',
                    itemId: 'displayButton',
                    width: '70%'
                }
            }

        ],

        documentToDownload: {
            docTable: 'activity_log',
            docField: 'doc',
            docFile: 'activity_log-305-doc.doc',
            key: {
                activity_log_id: '305'
            }
        }
    },

    initialize: function () {
        var me = this,
            downloadButton = me.down('#downloadButton'),
            displayButton = me.down('#displayButton'),
            docToDownload = me.getDocumentToDownload(),
            deviceDocumentFileName = DocumentManager.generateFileName(docToDownload.docTable, docToDownload.docField, docToDownload.docFile, docToDownload.key),
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            deviceDocumentFolder = documentFolder + '/' + Common.Application.appName;

        downloadButton.on('tap', 'onDownloadDocument', me);
        displayButton.on('tap', 'onDisplayDocument', me);

        // Check if the document file has already been downloaded.
        Common.device.File.fileExists(deviceDocumentFolder + '/' + deviceDocumentFileName)
            .then(function () {
                // File Exists
                displayButton.setHidden(false);
                downloadButton.setText('Refresh');
            }, function () {
                // File does not exist
                displayButton.setHidden(true);
                downloadButton.setText('Download');
            });

    },

    /**
     * Download lease document ls-102-doc.doc
     */
    onDownloadDocument: function () {
        var me = this,
            docToDownload = this.getDocumentToDownload(),
            downloadButton = me.down('#downloadButton'),
            displayButton = me.down('#displayButton');

        DocumentManager.downloadOnDemandDocument(docToDownload.docTable, docToDownload.docField, docToDownload.docFile, docToDownload.key)
            .then(function () {
                Ext.Msg.alert('', 'Downloaded document ' + docToDownload.docFile + ' from the ' + docToDownload.docTable + ' table.');
                displayButton.setHidden(false);
                downloadButton.setText('Refresh');
            }, function (error) {
                Log.log('Error occured while downloading the document. ' + error, 'error');
            });
    },

    onDisplayDocument: function () {
        var docToDownload = this.getDocumentToDownload();
        DocumentManager.displayOnDemandDocument(docToDownload.key, docToDownload.docTable, docToDownload.docField, docToDownload.docFile);
    }


});