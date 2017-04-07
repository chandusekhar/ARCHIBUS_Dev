Ext.define('MaterialInventory.view.space.ShelfList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.ShelfListItem'],

    xtype: 'shelveslist',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Shelves', 'MaterialInventory.view.space.ShelfList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'shelfSearch'
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
                        text: LocaleManager.getLocalizedString('Materials in Cabinet', 'MaterialInventory.view.space.ShelfList'),
                        action: 'showCabinetMaterials',
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

        emptyText: ['<div class="empty-text">',
            LocaleManager.getLocalizedString('No shelves identified.', 'MaterialInventory.view.space.ShelfList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'shelfListItem',

        store: 'materialShelves',

        editViewClass: 'MaterialInventory.view.space.BinList',

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