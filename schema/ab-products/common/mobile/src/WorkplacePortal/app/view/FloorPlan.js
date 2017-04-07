Ext.define('WorkplacePortal.view.FloorPlan', {
    extend: 'Space.view.FloorPlan',

    xtype: 'workplacePortalFloorPlanPanel',

    config: {

        title: LocaleManager.getLocalizedString('Floor Plan', 'WorkplacePortal.view.FloorPlan'),

        editViewClass: 'WorkplacePortal.view.HotelingSearchConfirm',

        layout: '', // overwrite vbox layout from parent to display headerText centered

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'sitePlanButton',
                text: LocaleManager.getLocalizedString('Site', 'WorkplacePortal.view.FloorPlan'),
                align: 'right',
                displayOn: 'all'
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
                        placeHolder: LocaleManager.getLocalizedString('Search Rooms', 'WorkplacePortal.view.FloorPlan'),
                        enableBarcodeScanning: true,
                        barcodeFormat: [
                            {fields: ['name']},
                            {useDelimiter: true, fields:['bl_id', 'fl_id', 'rm_id']}
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
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Room List', 'WorkplacePortal.view.FloorPlan'),
                                itemId: 'roomList'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan', 'WorkplacePortal.view.FloorPlan'),
                                itemId: 'floorPlanView',
                                pressed: true
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'workplacePortalRoomsList',
                height: '100%',
                hidden: true
            },
            {
                xtype: 'svgcomponent',
                height: '100%'
            }
        ]
    }
});
