Ext.define('MaterialInventory.view.space.RoomList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.RoomListItem'],

    xtype: 'materialRoomsList',

    isNavigationList: true,

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No rooms identified.', 'MaterialInventory.view.space.RoomList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'materialRoomListItem',

        store: 'materialRooms',

        editViewClass: 'MaterialInventory.view.space.AisleList',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        items: [
            {
                xtype: 'container',
                height: '50px',
                docked: 'bottom',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Materials on Floor', 'MaterialInventory.view.space.RoomList'),
                        action: 'showFloorMaterials',
                        cls: 'button-item',
                        centered: true
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this;
        me.callParent(arguments);

        me.on('itemtap', me.onItemSingleTap, me);
    },

    onItemSingleTap: function (list, index, target, record, e) {
        var me = this,
            isMaterialsButton = !!e.target.parentElement.getAttribute('materialsbutton');

        if (!me.itemTapped) {
            me.itemTapped = true;

            if (isMaterialsButton) {
                me.deselect(record, true);
                me.fireEvent('itemmaterialbuttontap', record);
            } else {
                me.fireEvent('listitemtap', list, index, target, record);
            }

            e.stopPropagation();
            e.stopEvent();

            setTimeout(function () {
                me.itemTapped = false;
            }, 300);
        }

    }
});