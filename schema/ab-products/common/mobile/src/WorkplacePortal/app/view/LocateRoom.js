Ext.define('WorkplacePortal.view.LocateRoom', {
    extend: 'Common.form.FormPanel',

    requires: [
        'WorkplacePortal.control.prompt.RoomNamePrompt',
        'WorkplacePortal.control.prompt.BuildingAddressPrompt'
    ],

    xtype: 'locateRoomPanel',

    config: {
        /*layout: 'vbox', */

        title: LocaleManager.getLocalizedString('Locate Room', 'WorkplacePortal.view.LocateRoom'),

        editViewClass: 'WorkplacePortal.view.FloorPlan',

        activityType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'locateRoomButton',
                text: LocaleManager.getLocalizedString('Locate', 'WorkplacePortal.view.LocateRoom'),
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'sitePrompt',
                        childFields: ['bl_id', 'fl_id', 'rm_id', 'name']
                    },
                    {
                        xtype: 'buildingAddressPrompt',
                        required: true
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'workplaceFloorPromptStore',
                        childFields: ['rm_id', 'name'],
                        required: true
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'spaceRoomPrompt',
                        childFields: ['name'],
                        required: true
                    },
                    {
                        xtype: 'roomNamePrompt'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent(arguments);

        // set panel title
        this.add(Ext.factory({docked: 'top', title: this.getTitle()}, Common.control.TitlePanel));
    }
});
