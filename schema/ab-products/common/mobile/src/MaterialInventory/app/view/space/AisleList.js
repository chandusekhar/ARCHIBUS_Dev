Ext.define('MaterialInventory.view.space.AisleList', {
    extend: 'Common.control.DataView',

    requires: ['MaterialInventory.view.space.AisleListItem'],

    xtype: 'aisleslist',

    isNavigationList: true,

    config: {
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Aisles', 'MaterialInventory.view.space.AisleList'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left',
                        name: 'aisleSearch'
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
                        text: LocaleManager.getLocalizedString('Materials in Room', 'MaterialInventory.view.space.AisleList'),
                        action: 'showRoomMaterials',
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
            LocaleManager.getLocalizedString('No aisles identified.', 'MaterialInventory.view.space.AisleList'),
            '</div>'].join(''),

        cls: 'component-list',

        useComponents: true,

        defaultType: 'aisleListItem',

        store: 'materialAisles',

        editViewClass: 'MaterialInventory.view.space.CabinetList',

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