Ext.define('Maintenance.view.manager.EstimateApproveForm', {
    extend: 'Common.view.navigation.EditBase',

    requires: ['Maintenance.view.ViewSelector'],

    xtype: 'estimateApproveFormPanel',

    visibleFields: ['mob_step_comments', 'requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description'],
    editableFields: ['mob_step_comments', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority'],

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        title: LocaleManager.getLocalizedString('Approve Request Estimation', 'Maintenance.view.manager.EstimateApproveForm'),

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
                        itemId: 'estimateApproveSegmentedButton',
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
                                itemId: 'parts',
                                text: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.manager.EstimateForm'),
                                displayViews: false,
                                store: 'workRequestPartsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'costs',
                                text: LocaleManager.getLocalizedString('Costs', 'Maintenance.view.manager.EstimateForm'),
                                displayViews: false,
                                store: 'workRequestCostsStore'
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
                xtype: 'estimateFormParts'
            },
            {
                xtype: 'estimateFormCosts',
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
        this.callParent();

        // by default, do not set editable fields as these depend on the record
        Maintenance.util.NavigationUtil.showFields(this, this.visibleFields);
    },

    applyRecord: function (record) {
        var me = this,
            viewSelector = me.down('viewselector'),
            estimateFormParts = me.down('estimateFormParts'),
			mobStepComments = me.down('field[name=mob_step_comments]'),
            possibleActions = Ext.getStore('workRequestActionsStore').getCount();

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            if (mobStepComments) {
                mobStepComments.setReadOnly(possibleActions === 0 || record.mobileStatusStepChanged());
            }

			estimateFormParts.getItems().get('addPartForm').setHidden(true);
            estimateFormParts.getItems().get('addPartToolBar').setHidden(true);

			// KB 3044462 set editable fields if the user is the approver of the 'Edit and Approve' step
            if (record.get('step_type') === 'review' && record.get('step') === 'Edit and Approve') {
                Maintenance.util.NavigationUtil.showFields(me, me.visibleFields, me.editableFields);
            }
        }

        return record;
    }
});