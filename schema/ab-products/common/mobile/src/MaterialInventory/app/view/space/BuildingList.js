Ext.define('MaterialInventory.view.space.BuildingList', {
    extend: 'Common.control.DataView',

    requires: 'MaterialInventory.view.space.BuildingListItem',

    xtype: 'materialBuildingsListPanel',

    isNavigationList: true,

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No buildings identified.', 'MaterialInventory.view.space.BuildingList'), '</div>'].join(''),

        editViewClass: 'MaterialInventory.view.space.FloorList',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'materialBuildingListItem',

        store: 'materialBuildings',

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
                        text: LocaleManager.getLocalizedString('Materials at Site', 'MaterialInventory.view.space.BuildingList'),
                        action: 'showSiteMaterials',
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