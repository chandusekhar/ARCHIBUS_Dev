Ext.define('Maintenance.view.manager.ScheduleApproveForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'scheduleApproveFormPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        title: LocaleManager.getLocalizedString('Approve Request Schedule', 'Maintenance.view.manager.ScheduleApproveForm'),

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'locateWorkRequest',
                align: 'left',
                iconCls: 'locate',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'approveButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.view.manager.ApproveForm'),
                ui: 'action',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'rejectButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Reject', 'Maintenance.view.manager.ApproveForm'),
                ui: 'action',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: Ext.os.is.Phone ? '' : LocaleManager.getLocalizedString('Cancel', 'Maintenance.view.manager.ApproveForm'),
                itemId: 'cancelWorkRequestButton',
                align: 'right',
                action: 'cancel',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'redline',
                align: 'right',
                action: 'openRedline',
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
                        itemId: 'scheduleApproveSegmentedButton',
                        centered: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '6em',
                            displayViews: false
                        },
                        items: [
                            {
                                type: 'selectbutton',
                                itemId: 'trades',
                                text: LocaleManager.getLocalizedString('Trades', 'Maintenance.view.manager.EstimateForm'),
                                displayViews: false,
                                store: 'workRequestTradesStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'craftspersons',
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.EstimateForm'),
                                displayViews: false,
                                store: 'workRequestCraftspersonsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'tools',
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.EstimateForm'),
                                displayViews: false,
                                store: 'workRequestToolsStore'
                            },
                            {
                                xtype: 'selectbutton',
                                itemId: 'documents',
                                text: LocaleManager.getLocalizedString('Documents', 'Maintenance.view.manager.EstimateForm'),
                                documentSelect: true,
                                displayViews: true,
                                view: 'workRequestDocumentList',
                                store: 'workRequestsStore'
                            },
                            //KB#3050980 Add Tab of Work Request References
                            {
                                xtype: 'selectbutton',
                                itemId:'references',
                                text: LocaleManager.getLocalizedString('References', 'Maintenance.view.manager.EstimateForm'),
                                documentSelect: false,
                                showBadgeText: true,
                                view: 'workRequestReferencesList',
                                store: 'referenceStore'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'scheduleEstimateFormTrades',
                hidden: true
            },
            {
                xtype: 'scheduleFormCraftspersons'
            },
            {
                xtype: 'scheduleFormTools',
                hidden: true
            },
            {
                xtype: 'workRequestDocumentList',
                hidden: true
            },
            {
                xtype: 'workRequestReferencesList',
                hidden: true
            },
            {
                xtype: 'requestDetailsPanel'
            }
        ]
    },

    initialize: function () {
        var me = this,
            visibleFields = ['mob_step_comments','requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description'];

        me.callParent();

        // by default, do not set editable fields as these depend on the record
        Maintenance.util.NavigationUtil.showFields(me, visibleFields);
    },

    applyRecord: function (record) {
        var me = this,
            viewSelector = me.down('viewselector'),
            scheduleCraftpersonsForm = me.down('scheduleFormCraftspersons'),
			mobStepComments = me.down('field[name=mob_step_comments]'),
            possibleActions = Ext.getStore('workRequestActionsStore').getCount();

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            if (mobStepComments) {
                mobStepComments.setReadOnly(possibleActions === 0 || record.mobileStatusStepChanged());
            }

            scheduleCraftpersonsForm.getItems().get('assignCraftspersonForm').setHidden(true);
            scheduleCraftpersonsForm.getItems().get('assignCraftspersonToolBar').setHidden(true);

			// KB 3044462 set editable fields if the user is the approver of the 'Edit and Approve' step
            if (record.get('step_type') === 'review' && record.get('step') === 'Edit and Approve') {
                Maintenance.util.NavigationUtil.showFields(me, me.visibleFields, me.editableFields);
            }
        }

        return record;
    }
});