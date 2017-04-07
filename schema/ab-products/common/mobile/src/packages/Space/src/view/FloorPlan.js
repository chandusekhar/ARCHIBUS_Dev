/**
 * @since 21.2
 */
Ext.define('Space.view.FloorPlan', {
    extend: 'Floorplan.view.FloorPlan',

    requires: 'Common.control.TitlePanel',

    xtype: 'floorPlanPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Floor Plans', 'Space.view.FloorPlan'),

        surveyId: null,


        /**
         * @cfg {Ext.data.Model} record  The floor model for the displayed floor plan
         */
        record: null,

        planType: '',

        suspendEvents: false,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'refresh',
                action: 'syncSurvey',
                displayOn: 'all',
                align: 'right',
                hidden: true
            }
        ],

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        itemId: 'floorPlanSearch',
                        name: 'floorPlanSearch',
                        align: 'left',
                        enableBarcodeScanning: true,
                        barcodeFormat: [
                            {useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']},
                            {fields: ['name']}
                        ]
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
                                text: LocaleManager.getLocalizedString('Room List', 'Space.view.FloorPlan'),
                                itemId: 'roomList'

                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan', 'Space.view.FloorPlan'),
                                itemId: 'floorPlanView',
                                pressed: true
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'roomslist',
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
