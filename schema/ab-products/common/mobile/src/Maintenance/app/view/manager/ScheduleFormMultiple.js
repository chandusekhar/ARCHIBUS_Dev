Ext.define('Maintenance.view.manager.ScheduleFormMultiple', {
    extend: 'Maintenance.view.FormValidateBase',

    xtype: 'scheduleFormMultiplePanel',

    config: {

        model: 'Maintenance.model.WorkRequest',

        title: LocaleManager.getLocalizedString('Schedule', 'Maintenance.view.manager.ScheduleFormMultiple'),

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'completeScheduling',
                align: 'right',
                text: LocaleManager.getLocalizedString('Complete Scheduling', 'Maintenance.view.manager.ScheduleFormMultiple'),
                ui: 'action',
                displayOn: 'all',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'forwardMultipleButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ScheduleFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        itemId: 'scheduleSegmentedButton',
                        centered: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '6em',
                            displayViews: false
                        },
                        items: [
                            {
                                type: 'selectbutton',
                                itemId: 'trades',
                                text: LocaleManager.getLocalizedString('Trades', 'Maintenance.view.manager.ScheduleFormMultiple'),
                                displayViews: false,
                                store: 'workRequestTradesStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'craftspersons',
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.ScheduleFormMultiple'),
                                displayViews: false,
                                store: 'workRequestCraftspersonsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'tools',
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.ScheduleFormMultiple'),
                                displayViews: false,
                                store: 'workRequestToolsStore'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'scheduleEstimateFormTrades',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'scheduleFormCraftspersons',
                multipleSelection: true
            },
            {
                xtype: 'scheduleFormTools',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'workrequestSelectionPanel',
                listTitle: LocaleManager.getLocalizedString('Requests to Schedule', 'Maintenance.view.manager.ScheduleFormMultiple')
            }
        ]
    }
});