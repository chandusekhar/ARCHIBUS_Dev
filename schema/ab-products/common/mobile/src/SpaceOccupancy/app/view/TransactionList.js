Ext.define('SpaceOccupancy.view.TransactionList', {
    extend: 'Common.control.DataView',

    xtype: 'transactionList',

    requires: [
        'SpaceOccupancy.view.TransactionListItem',
        'SpaceOccupancy.view.TransactionListHeader'
    ],

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        editViewClass: 'SpaceOccupancy.view.TransactionEdit',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'transactionListItem',

        store: 'roomPctsStore',

        title: '',

        toolBarButtons:[
            {
                xtype: 'toolbarbutton',
                iconCls: 'add',
                action: 'addTransaction',
                displayOn: 'all',
                align: 'right'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                docked: 'top',
                title: LocaleManager.getLocalizedString('Workspace Transactions', 'SpaceOccupancy.view.TransactionList'),
                layout: {
                    pack: 'right'
                }
            },
            {
                xtype: 'transactionListHeader'
            }
        ]
    }
});