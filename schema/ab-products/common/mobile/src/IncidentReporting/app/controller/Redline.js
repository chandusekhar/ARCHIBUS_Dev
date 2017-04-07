Ext.define('IncidentReporting.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    config: {
        refs: {
            mainView: 'main'
        },
        control: {
            documentItem: {
                displayredline: 'displayRedlinePhoto'
            }
        },

        redlineStoreId: 'documentsStore',

        documentField: 'doc'

    },

    saveRedlineData: function (record) {
        var me = this,
            legendComponent = me.getRedlineView().getLegendComponent(),
            storeId = me.getRedlineStoreId(),
            store = Ext.getStore(storeId),
            isStoreAutoSync = store.getAutoSync(),
            documentFieldName = me.getRedlineView().getDocumentField();

        Mask.displayLoadingMask();

        // Use setTimeout to allow the loading mask to display
        setTimeout(function () {
            legendComponent.getImageBase64(function (imageData) {
                if (imageData !== null) {
                    if (isStoreAutoSync) {
                        store.setAutoSync(false);
                    }
                    me.saveDataToModel(record, documentFieldName, imageData);
                    store.sync(function () {
                        store.setAutoSync(isStoreAutoSync);
                        // start overwrite
                        me.refreshDocumentItem(record.getId(), imageData);
                        // end overwrite
                        Mask.hideLoadingMask();
                    });
                } else {
                    Mask.hideLoadingMask();
                }
            }, me);
        }, 100);
    },

    /**
     * Overwrite to identify document record by id instead of name.
     * @param {String} documentField The document record id.
     * @param {String} imageData The base64 image data
     */
    refreshDocumentItem: function (documentId, imageData) {
        var me = this,
            documentItems = Ext.ComponentQuery.query('documentItem');

        Ext.each(documentItems, function (item) {
            if (item.getRecordId() === documentId) {
                item.setDocumentData(imageData);
            }
        }, me);
    }
});