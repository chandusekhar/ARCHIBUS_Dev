Ext.define('Space.view.FloorList', {
    extend: 'Common.control.DataView',

    requires: [
        'Space.view.FloorListItem',
        'Common.control.Search'
    ],

    xtype: 'floorsListPanel',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Floors', 'Space.view.FloorList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'floorSearch',
                        placeHolder: LocaleManager.getLocalizedString('Search Floors', 'Space.view.FloorList')
                    }
                ]
            }
        ],

        parentId: null,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No floors identified.', 'Space.view.FloorList'), '</div>'].join(''),

        //Need to define this in app's navigation controller
        editViewClass: '',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'floorListItem',

        store: 'spaceBookFloors',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        }
    },

    initialize: function() {
        var me = this;
        me.callParent(arguments);

        me.on('itemtap', me.onSiteItemSingleTap, me);
    },

    onSiteItemSingleTap: function(list, index, target, record, e) {
        var me = this,
            isDetailButton = !!e.target.getAttribute('detailbutton');

        if(!me.itemTapped) {
            me.itemTapped = true;

            if(isDetailButton) {
                me.deselect(record, true);
                me.fireEvent('itemdetailbuttontap', record);
            } else {
                me.fireEvent('listitemtap', list, index, target, record);
            }

            setTimeout(function() {
                me.itemTapped = false;
            }, 2000);
        }

    }
});