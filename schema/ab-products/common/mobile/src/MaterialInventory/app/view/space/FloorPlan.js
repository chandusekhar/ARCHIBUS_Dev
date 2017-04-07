Ext.define('MaterialInventory.view.space.FloorPlan', {
    extend: 'Floorplan.view.FloorPlan',

    requires: 'Common.control.TitlePanel',

    xtype: 'materialFloorPlanPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Floor Plans', 'MaterialInventory.view.space.FloorPlan'),

        /**
         * @cfg {Ext.data.Model} record  The floor model for the displayed floor plan
         */
        record: null,

        planType: '',

        isModal: false,

        suspendEvents: false,

        editViewClass: 'MaterialInventory.view.space.AisleList',

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        itemId: 'floorPlanSearch',
                        align: 'left',
                        name: 'roomSearch'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        width: Ext.os.is.Phone ? '90%' : '50%',
                        defaults: {
                            width: '50%',
                            labelWidth: '100%'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Room List', 'MaterialInventory.view.space.FloorPlan'),
                                itemId: 'roomList'

                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan', 'MaterialInventory.view.space.FloorPlan'),
                                itemId: 'floorPlanView',
                                pressed: true
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'materialRoomsList',
                flex: 1,
                hidden: true
            },
            {
                xtype: 'svgcomponent',
                height: '100%'
            }
        ]
    },

    initialize: function () {
        var me = this,
            title,
            titlePanel = me.down('titlepanel');

        me.callParent(arguments);

        // Add the title panel
        if (Ext.isFunction(me.getTitle)) {
            title = me.getTitle();
            titlePanel = Ext.factory({docked: 'top', title: title}, Common.control.TitlePanel);
            me.insert(0, titlePanel);
        }
    },

    onClickRoom: (function () {
        var canFireEvent = true;
        return function (locationCodes) {
            var view = this.scope;
            if (canFireEvent) {
                canFireEvent = false;
                view.fireEvent('roomtap', locationCodes, view);
                setTimeout(function () {
                    canFireEvent = true;
                }, 1000);
            }
        };
    }())
});
