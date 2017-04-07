Ext.define('Maintenance.view.manager.ScheduleForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'scheduleFormPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        ignoreFieldChangeEvents: true,

        title: LocaleManager.getLocalizedString('Schedule', 'Maintenance.view.manager.ScheduleForm'),

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
                itemId: 'completeScheduling',
                align: 'right',
                text: LocaleManager.getLocalizedString('Complete Scheduling', 'Maintenance.view.manager.ScheduleForm'),
                ui: 'action',
                displayOn: 'all',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'forward',
                align: 'right',
                text: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ScheduleForm'),
                ui: 'action',
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
                                text: LocaleManager.getLocalizedString('Trades', 'Maintenance.view.manager.ScheduleForm'),
                                displayViews: false,
                                store: 'workRequestTradesStore'
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'craftspersons',
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.manager.ScheduleForm'),
                                displayViews: false,
                                store: 'workRequestCraftspersonsStore',
                                pressed: true
                            },
                            {
                                type: 'selectbutton',
                                itemId: 'tools',
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.manager.ScheduleForm'),
                                displayViews: false,
                                store: 'workRequestToolsStore'
                            },
                            {
                                xtype: 'selectbutton',
                                itemId: 'documents',
                                text: LocaleManager.getLocalizedString('Documents', 'Maintenance.view.manager.ScheduleForm'),
                                documentSelect: true,
                                displayViews: true,
                                view: 'workRequestDocumentList',
                                store: 'workRequestsStore'
                            },
                            //KB#3050980 Add Tab of Work Request References
                            {
                                xtype: 'selectbutton',
                                itemId:'references',
                                text: LocaleManager.getLocalizedString('References', 'Maintenance.view.manager.ScheduleForm'),
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
            visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description'];

        me.callParent();

        // Set the field labels for all of the panels in the form
        //this.setPanelFieldLabelsAndLength();

        Maintenance.util.NavigationUtil.showFields(this, visibleFields);
    },

    // TODO: It may be better to allow the panels to set their own field labels
    // This would require moving the setFieldLabelAndLength functions out of the
    // Common.form.FormPanel class
    /*setPanelFieldLabelsAndLength: function() {
     var me = this,
     requestPanel = me.down('requestDetailsPanel'),
     tradesPanel = me.down('scheduleEstimateFormTrades'),
     craftspersonsPanel = me.down('scheduleFormCraftspersons');


     me.setFieldLabelAndLengthForContainer('wr_sync', requestPanel);
     me.setFieldLabelAndLengthForContainer('wrtr_sync', tradesPanel);
     me.setFieldLabelAndLengthForContainer('wrcf_sync', craftspersonsPanel);
     },*/

    applyRecord: function (record) {
        var me = this,
            viewSelector = me.down('viewselector');

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            //kb#3045598:EditEstAndSchedAfterStepComplete=0: Estimation/Scheduling data should not allowed to be updated when the estimate/schedule pending step is completed.
            me.setResourceFormReadOnly(record);
        }

        return record;
    },

    /**
     * Determine whether show the edit form of each resource tabs according to current work request's step type and value of activity parameter 'EditEstAndSchedAfterStepComplete'.
     * @private
     * @param {Record} record.
     */
    /* jshint maxdepth:4 */
    setResourceFormReadOnly: function (record) {
        var me = this,
            craftspersonForm = me.down('scheduleFormCraftspersons'),
            toolsForm = me.down('scheduleFormTools'),
            isSchedulingCompleted = record.get('scheduling_comp'),
            preferencesStore = Ext.getStore('appPreferencesStore'),
            param = preferencesStore.findRecord('param_id', 'EditEstAndSchedAfterStepComplete');

        if (param && param.get('param_value')==='0' && isSchedulingCompleted===1) {
            craftspersonForm.getItems().get('assignCraftspersonForm').setHidden(true);
            craftspersonForm.getItems().get('assignCraftspersonToolBar').setHidden(true);
            toolsForm.getItems().get('assignToolForm').setHidden(true);
            toolsForm.getItems().get('assignToolToolBar').setHidden(true);
        }
    },

    /**
     * Overrides the Ext.form.Panel#getFields function. Limit the fields returned to only the fields
     * contained in the requestDetails panel
     * @override
     * @private
     * Returns all {@link Ext.field.Field field} instances inside this form.
     * @param {Boolean} byName return only fields that match the given name, otherwise return all fields.
     * @return {Object/Array} All field instances, mapped by field name; or an array if `byName` is passed.
     */
    /* jshint maxdepth:4 */
    getFields: function (byName) {
        var me = this,
            fields = {},
            itemName;

        var getFieldsFrom = function (item) {
            if (item.isField) {
                itemName = item.getName();

                if ((byName && itemName === byName) || typeof byName === 'undefined') {
                    if (fields.hasOwnProperty(itemName)) {
                        if (!Ext.isArray(fields[itemName])) {
                            fields[itemName] = [fields[itemName]];
                        }

                        fields[itemName].push(item);
                    } else {
                        fields[itemName] = item;
                    }
                }

            }

            if (item.isContainer) {
                item.items.each(getFieldsFrom);
            }
        };

        // Override: Only get items from the requestDetailsPanel
        /* Override: start */
        var requestPanel = me.down('requestDetailsPanel');
        requestPanel.getItems().each(getFieldsFrom);
        //this.getItems().each(getFieldsFrom);
        /* Override: end */

        return (byName) ? (fields[byName] || []) : fields;
    }
});