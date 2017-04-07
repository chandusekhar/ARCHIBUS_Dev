Ext.define('MaterialInventory.view.space.FloorList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.FloorListItem'],

    xtype: 'materialFloorsListPanel',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Floors', 'MaterialInventory.view.space.FloorList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'floorSearch'
                    }
                ]
            },
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
                        text: LocaleManager.getLocalizedString('Materials in Building', 'MaterialInventory.view.space.FloorList'),
                        action: 'showBuildingMaterials',
                        cls: 'button-item',
                        centered: true
                    }
                ]
            }
        ],

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        editViewClass: 'MaterialInventory.view.space.FloorPlan',

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No floors identified.', 'MaterialInventory.view.space.FloorList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'materialFloorListItem',

        store: 'materialFloors',

        parentRecord: null,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        }
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