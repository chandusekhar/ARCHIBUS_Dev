Ext.define('SpaceOccupancy.view.TransactionEdit', {
    extend: 'Common.view.navigation.EditBase',

    requires: ['Common.control.Select',
        'Common.control.field.Prompt'],

    xtype: 'transactionEdit',

    config: {
        title: LocaleManager.getLocalizedString('Transactions', 'SpaceOccupancy.view.TransactionEdit'),
        isCreateView: true,

        model: 'SpaceOccupancy.model.RoomPct',
        storeId: 'roomPctsStore',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                align: 'right',
                iconCls: 'check',
                cls: 'ab-icon-action',
                action: 'saveTransaction'
            },
            {
                xtype: 'toolbarbutton',
                align: 'right',
                iconCls: 'info',
                action: 'displayTransactionInfo'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'add',
                action: 'createEm',
                displayOn: 'all',
                align: 'right'
            }
        ],

        items: [
            {
                xtype: 'transactionForm',
                width: '100%',
                height: '100%',
                centered: false,
                flex: 1
            }
        ]

    },

    applyRecord: function (record) {
        var transactionForm = this.down('transactionForm');

        if (record !== null) {
            transactionForm.setRecord(record);
        }

        return record;
    }

});