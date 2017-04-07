Ext.define('IncidentReporting.view.Documents', {
    extend: 'Common.view.DocumentList',

    xtype: 'documentscard',

    config: {
        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                align: 'left',
                iconCls: 'camera',
                action: 'capturePhoto',
                displayOn: 'all'
            }
        ],

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        enableImageRedline: true
    },

    processDocumentFields: function (record) {
        var me = this,
            documentMessage = me.down('#documentMessage'),
            store = Ext.getStore('documentsStore'),
            mobIncidentId = record.get('mob_incident_id'),
            lockedBy = record.get('mob_locked_by'),
            documentItem,
            enableImageRedline = this.getEnableImageRedline(),
            filterArray;

        me.removeExistingItems();
        filterArray = me.getDocumentStoreFilter(lockedBy, mobIncidentId);
        store.retrieveAllStoreRecords(filterArray, function (documents) {
            if (documents.length === 0) {
                documentMessage.setHidden(false);
            }
            Ext.each(documents, function (document) {
                if (document.get('doc') !== null) {
                    documentMessage.setHidden(true);
                    documentItem = Ext.factory({
                        file: {
                            html: document.get('doc')
                        },
                        documentData: document.get('doc_contents'),
                        recordId: document.get('mob_doc_id'),
                        documentFieldId: 'doc',
                        fieldName: 'doc',
                        enableImageRedline: enableImageRedline
                    }, 'Common.view.DocumentItem');

                    me.add(documentItem);
                }
            });
        }, me);
    },

    getDocumentStoreFilter: function (lockedBy, mobIncidentId) {
        var filterArray = [], filter;
        filter = Ext.create('Common.util.Filter', {
            property: 'mob_is_changed',
            value: 1,
            exactMatch: true
        });
        filterArray.push(filter);
        filter = Ext.create('Common.util.Filter', {
            property: 'mob_locked_by',
            value: lockedBy,
            exactMatch: true
        });
        filterArray.push(filter);
        filter = Ext.create('Common.util.Filter', {
            property: 'mob_incident_id',
            value: mobIncidentId,
            exactMatch: true
        });
        filterArray.push(filter);

        return filterArray;
    },

    initialize: function () {
        this.callParent();
        IncidentReporting.util.Ui.setCameraIconVisibility(this.toolBarButtons);
    }
});