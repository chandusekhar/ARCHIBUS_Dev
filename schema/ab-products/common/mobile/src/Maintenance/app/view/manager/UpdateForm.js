Ext.define('Maintenance.view.manager.UpdateForm', {
    extend: 'Maintenance.view.WorkRequestValidateBase',

    requires: ['Maintenance.view.ViewSelector'],

    xtype: 'updateFormPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        title: LocaleManager.getLocalizedString('Update', 'Maintenance.view.manager.UpdateForm'),

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
                itemId: 'bottomToolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        centered: true,
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        defaults: {
                            width: Ext.os.is.Phone ? '4.8em' : '7em',
                            scrollable: {
                                direction: 'vertical',
                                directionLock: true
                            }
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.UpdateForm'),
                                store: 'workRequestCraftspersonsStore',
                                view: 'scheduleFormCraftspersons',
                                record: null
                            },
                            {
                                text: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.manager.UpdateForm'),
                                store: 'workRequestPartsStore',
                                view: 'estimateFormParts'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.UpdateForm'),
                                store: 'workRequestToolsStore',
                                view: 'scheduleFormTools'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Costs', 'Maintenance.view.manager.UpdateForm'),
                                store: 'workRequestCostsStore',
                                view: 'estimateFormCosts',
                                record: null,
                                hidden: true
                            },
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'Maintenance.view.manager.UpdateForm'),
                                documentSelect: true,
                                view: 'workRequestDocumentList',
                                store: 'workRequestsStore'
                            },
                            //KB#3050980 Add Tab of Work Request References
                            {
                                text: LocaleManager.getLocalizedString('References', 'Maintenance.view.manager.UpdateForm'),
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
        var me = this,
            visibleFields, editableFields,
            bottomToolbar = me.query('[itemId=bottomToolbar]')[0],
            estimateCostsForm = bottomToolbar.query('viewselector [view=estimateFormCosts]')[0];

        if (me.getDisplayMode() === Constants.Approved) {
            visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description', 'cf_notes'];
            bottomToolbar.setHidden(true);
        } else if (me.getDisplayMode() === Constants.Issued) {
            visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'status', 'eq_id', 'priority', 'description', 'cf_notes'];
            editableFields = ['cf_notes'];
            estimateCostsForm.setHidden(false);
        } else if (me.getDisplayMode() === Constants.Completed) {
            visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description', 'cf_notes'];
            editableFields = ['cf_notes'];
            estimateCostsForm.setHidden(false);
        }

        if (me.getIsRelatedRequest()) {
            me.setTitle(LocaleManager.getLocalizedString('Work Request Details', 'Maintenance.view.manager.UpdateForm'));
        }
        me.callParent();
        //this.setFieldLabelAndLength('wr_sync');

        Maintenance.util.NavigationUtil.showFields(this, visibleFields, editableFields);
    },

    applyRecord: function (record) {
        var me = this,
            fields,
            viewSelector = me.down('viewselector'),
            estimateCostsForm,
            scheduleFormCraftspersons;

        if (record && viewSelector) {
            viewSelector.setRecord(record);

            if (me.getDisplayMode() === Constants.Issued || me.getDisplayMode() === Constants.Completed) {
                estimateCostsForm = me.down('viewselector [view=estimateFormCosts]');
                if (estimateCostsForm) {
                    estimateCostsForm.setRecord(record);
                }

                scheduleFormCraftspersons = me.down('viewselector [view=scheduleFormCraftspersons]');
                if (scheduleFormCraftspersons) {
                    scheduleFormCraftspersons.setRecord(record);
                }
            }

            //related work request and the current user cannot access this request directly, set all field read-only
            if (record.get('request_type') === 2 || record.get('prob_type') === 'PREVENTIVE MAINT' || record.get('is_wt_self_assign') === 1) {
                fields = me.query('field');
                Ext.each(fields, function (field) {
                    field.setReadOnly(true);
                });
            }

            // Hide the segmented buttons if current user cannot access this request directly
            if (record.get('request_type') === 2) {
                viewSelector.hide();
            }
        }

        return record;
    }

});