/**
 *  A button used in the {@link Common.view.navigation.ViewSelector} class. The ViewSelectionButton provides a way to easily
 *  display and update the badgeText of the button.
 *
 *  @author Jeff Martin
 *  @since 21.2
 */

Ext.define('Common.control.button.ViewSelection', {
    extend: 'Ext.Button',

    xtype: 'selectbutton',

    config: {
        /**
         * @cfg {Ext.data.Store} store The store that contains the records for the view to be displayed
         * The number of items in the store is used to update the button badge text.
         */
        store: null,

        /**
         * @cfg {Boolean} documentSelect True if this button selects a document view. Documents are typically
         * stored in the parent view record. The parent record is used to display the number of documents in
         * the button badge text.
         */
        documentSelect: false,

        /**
         * @cfg {Boolean} showBadgeText True to display the badge text on the button. False to not display the
         * badge text
         */
        showBadgeText: true,

        /**
         *  @cfg {String/Object} view The xtype of view to be displayed when the button is tapped. The selection
         *  button can display an edit view or a list view depending on the number of items in the configured store.
         *  An object can be used to specify different views for list and edit forms.
         *
         * Example of configuring seperate edit and list views
         *
         *      view: {
         *              edit: 'workRequestCraftspersonEditPanel',
         *              list: 'workRequestCraftspersonListPanel'
         *      }
         *
         *
         */
        view: null


    },

    applyStore: function (store) {
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
        }
        return store;
    },

    updateStore: function (newStore, oldStore) {
        if(newStore) {
            newStore.on({
                scope: this,
                refresh: 'onStoreRefreshed'
            });

            newStore.onAfter({
                scope: this,
                write: 'onStoreWrite'
            });
        }

       if(oldStore) {
           oldStore.un({
               scope: this,
               refresh: 'onStoreRefreshed'
           });
           oldStore.unAfter({
               scope: this,
               write: 'onStoreWrite'
           });
       }
    },

    onStoreRefreshed: function(store) {
        this.doUpdateBadgeText(store);
    },

    onStoreWrite: function(store) {
        this.doUpdateBadgeText(store);
    },

    /**
     * @private
     * @param {Ext.data.Store} store The store associated with the selection view.
     */
    doUpdateBadgeText: function(store) {
        var me = this,
            showBadgeText = me.getShowBadgeText(),
            count,
            viewSelector,
            viewRecord;

        if(!showBadgeText) {
            return;
        }

        if(me.getDocumentSelect()) {
            viewSelector = me.up('viewselector');
            viewRecord = viewSelector.getRecord();
            me.updateDocumentFieldBadgeText(viewRecord);
        } else {
            count = store.getCount();
            if(count > 0) {
                me.setBadgeText(count.toString());
            } else {
                me.setBadgeText('');
            }
        }
    },

    /**
     * Updates the badgeText value for a document selection field.
     * @private
     * @param {Ext.data.Model} record The record of the parent view containing the document data.
     */
    updateDocumentFieldBadgeText: function(record) {
        var count = 0;
        if(record) {
            //<debug>
            if (typeof record.getDocumentCount !== 'function') {
                Ext.Logger.error('The record must contain a getDocumentCount() method that returns the number of documents');
            }
            //</debug>
            count = record.getDocumentCount();
        }

        if(count > 0) {
            this.setBadgeText(count.toString());
        } else {
            this.setBadgeText('');
        }
    }

});
