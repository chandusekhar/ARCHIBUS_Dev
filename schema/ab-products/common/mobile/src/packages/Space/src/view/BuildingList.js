/**
 * @since 21.2
 */
Ext.define('Space.view.BuildingList', {
    extend: 'Common.control.DataView',

    requires: 'Space.view.BuildingListItem',

    xtype: 'buildingsListPanel',

    isNavigationList: true,

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No buildings identified.', 'Space.view.BuildingList'), '</div>'].join(''),

        /**
         * @cfg parentId {String} The site_id value of the buildings displayed in the list
         */
        parentId: null,

        editViewClass: 'Space.view.FloorList',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'buildingListItem',

        store: 'spaceBookBuildings',

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
            }, 300);
        }

    }

});