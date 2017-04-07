Ext.define('MaterialInventory.view.space.BinList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.BinListItem'],

    xtype: 'binslist',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Bins', 'MaterialInventory.view.space.BinList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'binSearch'
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
                        text: LocaleManager.getLocalizedString('Materials on Shelf', 'MaterialInventory.view.space.BinList'),
                        action: 'showShelfMaterials',
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
            LocaleManager.getLocalizedString('No bins identified.', 'MaterialInventory.view.space.BinList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'binListItem',

        store: 'materialBins',

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
})
;