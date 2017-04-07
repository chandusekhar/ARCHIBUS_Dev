/**
 * Displays a list of Sites.
 *
 * @since 21.2
 */
Ext.define('Space.view.SiteList', {
    extend: 'Common.control.DataView',

    requires: [
        'Space.view.SiteListItem',
        'Common.control.Search'
    ],

    xtype: 'siteListPanel',

    isNavigationList: true,

    itemTapped: false,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Sites', 'Space.view.SiteList'),
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

        editViewClass: 'Space.view.Site',

        cls: 'component-list',

        scrollToTopOnRefresh: false,

        useComponents: true,

        defaultType: 'siteListItem',

        store: 'spaceBookSites',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        noSitesMessage: '<div class="empty-text">' +
        LocaleManager.getLocalizedString('No sites identified.', 'Space.view.SiteList') + '</div>'
    },

    initialize: function () {
        var me = this,
            emptyTextMessage;

        me.callParent(arguments);

        // Set empty text
        emptyTextMessage = LocaleManager.getLocalizedString('{0} Tap the {1} icon in the title bar above to download your list of selected sites and associated data (e.g. buildings, floors, space organization & employees, etc.). <br />' +
            'Then select the Download Floor Plans button to download your plans.{2}',
            'Space.view.SiteList');

        me.setEmptyText(Ext.String.format(emptyTextMessage, '<div class="empty-text">', '<span class="ab-download-icon"></span>', '</div>'));
        me.on('itemtap', me.onSiteItemSingleTap, me);
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

    onSiteItemSingleTap: function (list, index, target, record, e) {
        var me = this,
            isDetailButton = !!e.target.getAttribute('detailbutton');

        if (!me.itemTapped) {
            me.itemTapped = true;

            if (isDetailButton) {
                me.deselect(record, true);
                me.fireEvent('itemdetailbuttontap', record);
            } else {
                me.fireEvent('listitemtap', list, index, target, record);
            }

            setTimeout(function () {
                me.itemTapped = false;
            }, 300);
        }
    }
});