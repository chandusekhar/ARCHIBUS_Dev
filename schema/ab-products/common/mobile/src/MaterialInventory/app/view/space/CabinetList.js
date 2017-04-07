Ext.define('MaterialInventory.view.space.CabinetList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.CabinetListItem'],

    xtype: 'cabinetslist',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Cabinets', 'MaterialInventory.view.space.CabinetList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'cabinetSearch'
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
                        text: LocaleManager.getLocalizedString('Materials in Aisle', 'MaterialInventory.view.space.CabinetList'),
                        action: 'showAisleMaterials',
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
            LocaleManager.getLocalizedString('No cabinets identified.', 'MaterialInventory.view.space.CabinetList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'cabinetListItem',

        store: 'materialCabinets',

        editViewClass: 'MaterialInventory.view.space.ShelfList',

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