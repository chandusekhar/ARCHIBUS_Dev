Ext.define('Maintenance.view.manager.UpdateFormMultiple', {
    extend: 'Maintenance.view.FormValidateBase',

    requires: ['Maintenance.view.ViewSelector'],

    xtype: 'updateFormMultiplePanel',

    config: {

        model: 'Maintenance.model.WorkRequest',

        title: LocaleManager.getLocalizedString('Update', 'Maintenance.view.manager.UpdateFormMultiple'),

        displayMode: '',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        items: [
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        itemId: 'updateSegmentedButton',
                        centered: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '6em',
                            displayViews: false
                        },
                        items: [
                            {
                                type: 'selectbutton',
                                itemId: 'craftspersons',
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.UpdateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestCraftspersonsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'parts',
                                text: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.manager.UpdateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestPartsStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'tools',
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.UpdateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestToolsStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'costs',
                                text: LocaleManager.getLocalizedString('Costs', 'Maintenance.view.manager.UpdateFormMultiple'),
                                displayViews: false,
                                store: 'workRequestCostsStore',
                                hidden: true
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'scheduleFormCraftspersons',
                multipleSelection: true
            },
            {
                xtype: 'estimateFormParts',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'scheduleFormTools',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'estimateFormCosts',
                hidden: true,
                multipleSelection: true
            },
            {
                xtype: 'workrequestSelectionPanel',
                listTitle: LocaleManager.getLocalizedString('Requests to Update', 'Maintenance.view.manager.UpdateFormMultiple')
            }
        ]
    },

    initialize: function () {
        var me = this,
            costsButton = me.query('#updateSegmentedButton selectbutton[itemId=costs]')[0];

        if (me.getDisplayMode() === Constants.Issued || me.getDisplayMode() === Constants.Completed) {
            costsButton.setHidden(false);
        }

        me.callParent();
    }
});