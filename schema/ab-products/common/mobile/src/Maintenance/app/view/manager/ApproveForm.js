Ext.define('Maintenance.view.manager.ApproveForm', {
    extend: 'Common.view.navigation.EditBase',

    requires: ['Maintenance.view.ViewSelector'],

    xtype: 'approveFormPanel',

    visibleFields: ['mob_step_comments', 'requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description'],
    editableFields: ['mob_step_comments', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id'],

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        title: LocaleManager.getLocalizedString('Approve Request', 'Maintenance.view.manager.ApproveForm'),
        
        displayMode: '',
        isRelatedRequest: false,

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
                xtype: 'requestDetailsPanel'
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        centered: true,
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '6em'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'Maintenance.view.manager.ApproveForm'),
                                documentSelect: true,
                                view: 'workRequestDocumentList',
                                store: 'workRequestsStore'
                            },
                            //KB#3050980 Add Tab of Work Request References
                            {
                                text: LocaleManager.getLocalizedString('References', 'Maintenance.view.manager.ApproveForm'),
                                documentSelect: false,
                                showBadgeText: true,
                                view: 'workRequestReferencesList',
                                store: 'referenceStore'
                            }
                        ]
                    }
                ]
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
            mobStepComments = me.down('field[name=mob_step_comments]'),
            possibleActions = Ext.getStore('workRequestActionsStore').getCount();

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            if (mobStepComments) {
                mobStepComments.setReadOnly(possibleActions === 0 || record.mobileStatusStepChanged());
            }

            // KB 3044462 set editable fields if the user is the approver of the 'Edit and Approve' step
            if (record.get('step_type') === 'review' && record.get('step') === 'Edit and Approve') {
                Maintenance.util.NavigationUtil.showFields(me, me.visibleFields, me.editableFields);
            }
        }

        return record;
    }
});