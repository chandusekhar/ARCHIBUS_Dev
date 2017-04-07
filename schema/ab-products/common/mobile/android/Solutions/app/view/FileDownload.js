Ext.define('Solutions.view.FileDownload', {
    extend: 'Ext.Container',

    requires: [
        'Common.device.File'
    ],

    config: {
        style: 'margin:10px',
        items: [
            {
                xtype: 'fieldset',
                instructions: 'This example downloads the work_request.pdf file from the Web Central server.<br>The file URI is ' +
                Common.document.DocumentManager.getOrigin() + '/archibus/schema/ab-products/common/resources/pdf-forms/work_request.pdf'
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

        ]
    },

    initialize: function () {
        var me = this,
            downloadButton = me.down('#downloadButton'),
            displayButton = me.down('#displayButton'),
            targetFileName = 'work_request.pdf',
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            deviceFolder = documentFolder + '/' + Common.Application.appName;

        downloadButton.on('tap', 'onDownloadDocument', me);
        displayButton.on('tap', 'onDisplayDocument', me);

        // Check if the document file has already been downloaded.
        Common.device.File.fileExists(deviceFolder + '/' + targetFileName)
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
            downloadButton = me.down('#downloadButton'),
            displayButton = me.down('#displayButton'),
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            fileURI = Common.document.DocumentManager.getOrigin() + '/archibus/schema/ab-products/common/resources/pdf-forms/work_request.pdf';

        Common.document.DocumentManager.downloadFileWithURI(fileURI, 'work_request.pdf', documentFolder + '/' + Common.Application.appName)
            .then(function () {
                Ext.Msg.alert('', 'Downloaded file work_request.pdf');
                displayButton.setHidden(false);
                downloadButton.setText('Refresh');
            }, function (error) {
                Log.log('Error occured while downloading the file. ' + error, 'error');
            });
    },

    onDisplayDocument: function () {
        var documentFolder = GlobalParameters.onDemandDocumentFolder,
            filePath = documentFolder + '/' + Common.Application.appName + '/work_request.pdf';
        Common.document.DocumentManager.displayFile(filePath);
    }


});