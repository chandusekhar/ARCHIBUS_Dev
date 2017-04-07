Ext.define('Maintenance.view.manager.EstimateFormMultiple', {
    extend: 'Maintenance.view.FormValidateBase',

    xtype: 'estimateFormMultiplePanel',

    config: {

        model: 'Maintenance.model.WorkRequest',

        title: LocaleManager.getLocalizedString('Estimate', 'Maintenance.view.manager.EstimateFormMultiple'),

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'completeEstimation',
                align: 'right',
                text: LocaleManager.getLocalizedString('Complete Estimation', 'Maintenance.view.manager.EstimateFormMultiple'),
                ui: 'action',
                displayOn: 'all',
                hidden: true
            }
        ],

        items: [
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        itemId: 'estimateSegmentedButton',
                        centered: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '6em',
                            displayViews: false
                        },
                        items: [
                            {
                                type: 'selectbutton',
                                itemId: 'trades',
                                text: LocaleManager.getLocalizedString('Trades', 'Maintenance.view.manager.EstimateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestTradesStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'parts',
                                text: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.manager.EstimateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestPartsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'costs',
                                text: LocaleManager.getLocalizedString('Costs', 'Maintenance.view.manager.EstimateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestCostsStore'
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
                xtype: 'estimateFormParts',
                multipleSelection: true
            },
            {
                xtype: 'estimateFormCosts',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'workrequestSelectionPanel',
                listTitle: LocaleManager.getLocalizedString('Requests to Estimate', 'Maintenance.view.manager.EstimateFormMultiple')
            }
        ]
    }
});