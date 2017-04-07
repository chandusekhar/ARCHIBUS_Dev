Ext.define('SpaceOccupancy.view.CategoryList', {
    extend: 'Common.control.DataView',

    xtype: 'categoryList',

    requires: 'SpaceOccupancy.view.CategoryListItem',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        cls: 'component-list',

        useComponents: true,

        defaultType: 'categoryListItem',

        store: 'categoryListStore',

        editViewClass: 'SpaceOccupancy.view.TransactionCarousel',

        addViewClass: 'SpaceOccupancy.view.TransactionEdit',

        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                layout: {
                    pack: 'right'
                },
                items: [
                    {
                        xtype: 'titlebar',
                        titleAlign: 'left',
                        left: '0px',
                        title: LocaleManager.getLocalizedString('Survey Categories', 'SpaceOccupancy.view.CategoryList'),
                        itemId: 'categoryTitleBar'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'addCatTrans',
                        cls: Ext.os.is.Phone ? 'phone-button' : ''
                    }
                ]
            }
        ]
    }
});