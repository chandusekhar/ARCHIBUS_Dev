/**
 * Extend from 'Common.view.DocumentList' to display reference document list
 * by Guoqiang Jia
 */
Ext.define('Maintenance.view.WorkRequestReferencesLists', {
    extend: 'Common.view.DocumentList',
    xtype: 'workRequestReferencesList',
    requires:['Maintenance.view.WorkRequestReferenceListsItems'],
    config: {
        items: [
            {
               xtype: 'titlepanel',
               title: LocaleManager.getLocalizedString('References', 'Maintenance.view.WorkRequestReferencesLists'),
               docked: 'top'
            },
            {
                xtype: 'container',
                html: '<div class="empty-text">' + LocaleManager.getLocalizedString('No documents available', 'Common.view.DocumentList') + '</div>',
                itemId: 'documentMessage'
            }
        ],
        enableImageRedline: false,
        
        enableDelete: false
    },
    /**
     * Create references files list when page initialize
     */
    createReferenceFields: function () {
        //return record.getDocumentFieldsAndData();
        var me = this,
            documentMessage = me.down('#documentMessage'),
            store = Ext.getStore('referenceStore'),
            documentItem,
            enableImageRedline =false,
            filterArray;

        me.removeExistingItems();
        //Get filters from store
        filterArray=store.getFilters();
        store.retrieveAllStoreRecords(filterArray, function (documents) {
            if (documents.length === 0) {
                documentMessage.setHidden(false);
            }

            Ext.each(documents, function (document) {

                var configValue={
                    file: {
                        html:Ext.isEmpty(document.get('doc'))?'': document.get('doc')
                    },
                    documentData: document.get('doc_contents'),
                    recordId: document.get('mob_doc_id'),
                    documentFieldId: 'doc',
                    fieldName: 'doc',
                    enableImageRedline: enableImageRedline,
                    enableDisplayURL:Ext.isEmpty(document.get('url'))?false:true,
                    enableDisplay:Ext.isEmpty(document.get('doc'))?false:true
                };

                documentMessage.setHidden(true);
                documentItem = Ext.factory(configValue, 'Maintenance.view.WorkRequestReferenceListsItems');

                me.add(documentItem);
            });
        }, me);
    },
    /**
     * initialize
     */
    initialize: function () {
        this.callParent();
        this.createReferenceFields();
    }
});