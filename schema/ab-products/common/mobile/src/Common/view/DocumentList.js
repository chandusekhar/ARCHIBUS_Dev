/**
 * Common DocumentList class. Super class for list of documents views.
 * @since 21.4
 * @author Ana Paduraru
 * @class
 */
Ext.define('Common.view.DocumentList', {
    extend: 'Ext.Container',
    requires: 'Common.view.DocumentItem',
    xtype: 'documentList',

    config: {
        layout: 'vbox',
        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Documents', 'Common.view.DocumentList'),
                docked: 'top'
            },
            {
                xtype: 'container',
                html: '<div class="empty-text">' + LocaleManager.getLocalizedString('No documents available', 'Common.view.DocumentList') + '</div>',
                itemId: 'documentMessage'
            }
        ],

        /**
         * @cfg {Ext.data.Store} The store associated with the document list. A store is required when using the
         * On Demand Document Download feature.
         */
        store: null,

        /**
         * @cfg {Boolean} enableImageRedline Set to true to display the image redline button
         */
        enableImageRedline: false,

        /**
         * @cfg {Boolean} enableDelete Set to true to display the delete button
         */
        enableDelete: false
    },

    applyStore: function (store) {
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
        }
        return store;
    },

    applyRecord: function (config) {
        if (config) {
            this.processDocumentFields(config);
        }
        return config;
    },

    processDocumentFields: function (record) {
        var me = this,
            store = me.getStore(),
            documents = record.getDocumentFieldsAndData(),
            enableImageRedline = me.getEnableImageRedline(),
            enableDelete = me.getEnableDelete(),
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            downloadDocumentsOnDemand = false;

        me.removeExistingItems();

        if (store && Ext.isFunction(store.getIncludeDocumentDataInSync)) {
            downloadDocumentsOnDemand = !store.getIncludeDocumentDataInSync();
        }

        Ext.each(documents, function (document) {
            var filePath,
                primaryKey,
                documentTable,
                fileName;

            if (downloadDocumentsOnDemand) {
                // Check if the document file is downloaded
                filePath = documentFolder + '/' + Common.Application.appName;
                primaryKey = me.generatePrimaryKeyObject(store.getDocumentTablePrimaryKeyFields(), record);
                documentTable = store.getDocumentTable();
                fileName = DocumentManager.generateFileName(documentTable, document.fieldName, document.file, primaryKey);

                Common.device.File.fileExists(filePath + '/' + fileName)
                    .then(function () {
                        document.fileExists = true;
                        return Promise.resolve();
                    }, function () {
                        document.fileExists = false;
                        return Promise.resolve();
                    })
                    .then(function () {
                        me.addDocumentItem (document, record, enableImageRedline, enableDelete, downloadDocumentsOnDemand);
                    });
            } else {
                me.addDocumentItem (document, record, enableImageRedline, enableDelete, downloadDocumentsOnDemand);
            }

        }, me);
    },

    addDocumentItem: function(document, record, enableImageRedline, enableDelete, downloadDocumentsOnDemand) {
        var me = this,
            documentMessage = me.down('#documentMessage'),
            documentItem;

        if (!Ext.isEmpty(document.file)) {
            documentMessage.setHidden(true);
            documentItem = Ext.factory({
                file: {
                    html: document.file
                },
                documentData: document.data,
                recordId: record.getId(),
                documentFieldId: document.fieldId,
                enableImageRedline: enableImageRedline,
                enableDelete: enableDelete,
                fieldName: document.fieldName,
                downloadDocumentsOnDemand: downloadDocumentsOnDemand,
                documentIsDownloaded: document.fileExists
            }, 'Common.view.DocumentItem');

            me.add(documentItem);
        }
    },


    /**
     * @private
     */
    generatePrimaryKeyObject: function (keyFields, record) {
        var primaryKey = {};

        Ext.each(keyFields, function (keyField) {
            primaryKey[keyField] = record.get(keyField);
        });

        return primaryKey;
    },


    /**
     * Destroy existing documentItems.
     */
    removeExistingItems: function () {
        var me = this,
            documentItems = me.query('documentItem');
        if (documentItems && documentItems.length > 0) {
            Ext.each(documentItems, function (documentItem) {
                me.remove(documentItem, true);
            }, me);
        }
    }

});