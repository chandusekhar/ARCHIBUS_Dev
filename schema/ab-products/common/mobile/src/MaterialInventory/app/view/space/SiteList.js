Ext.define('MaterialInventory.view.space.SiteList', {
    extend: 'Common.control.DataView',

    requires: [
        'MaterialInventory.view.space.SiteListItem'
    ],

    xtype: 'materialSiteListPanel',

    isNavigationList: true,

    itemTapped: false,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Sites', 'MaterialInventory.view.space.SiteList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'siteSearch'
                    }
                ]
            }
        ],

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        editViewClass: 'MaterialInventory.view.space.Site',

        cls: 'component-list',

        scrollToTopOnRefresh: false,

        useComponents: true,

        defaultType: 'materialSiteListItem',

        store: 'materialSites',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        noSitesMessage: '<div class="empty-text">' +
        LocaleManager.getLocalizedString('No sites identified.', 'MaterialInventory.view.space.SiteList') + '</div>'
    },

    initialize: function () {
        this.callParent(arguments);

        this.setEmptyText(this.noSitesMessage);

        this.on('itemtap', this.onSiteItemSingleTap, this);
    },
    /**
     * @override
     */
    updateData: function (data) {
        var store = this.getStore();

        if (data === '') {
            return;
        }

        if (!store) {
            this.setStore(Ext.create('Ext.data.Store', {
                data: data,
                autoDestroy: true
            }));
        } else {
            store.add(data);
        }
    },

    onSiteItemSingleTap: function (list, index, target, record) {
        var me = this;

        if (!me.itemTapped) {
            me.itemTapped = true;

            me.fireEvent('listitemtap', list, index, target, record);
        }

        setTimeout(function () {
            me.itemTapped = false;
        }, 300);
    }
});