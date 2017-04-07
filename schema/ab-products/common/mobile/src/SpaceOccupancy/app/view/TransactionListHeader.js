Ext.define('SpaceOccupancy.view.TransactionListHeader', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'transactionListHeader',

    config: {

        cls: ['x-toolbar'],

        //html is set in NavigationHelper.js
        transactionInfo: {
            html: ''
        }
    },

    applyTransactionInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getTransactionInfo());
    },

    updateTransactionInfo: function (newTransactionInfo, oldTransactionInfo) {
        if (newTransactionInfo) {
            this.add(newTransactionInfo);
        }
        if (oldTransactionInfo) {
            this.remove(oldTransactionInfo);
        }
    }
});