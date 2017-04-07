Ext.define('Maintenance.view.manager.EstimateForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'estimateFormPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        title: LocaleManager.getLocalizedString('Estimate', 'Maintenance.view.manager.EstimateForm'),

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
                itemId: 'completeEstimation',
                align: 'right',
                text: LocaleManager.getLocalizedString('Complete Estimation', 'Maintenance.view.manager.EstimateForm'),
                ui: 'action',
                displayOn: 'all',
                hidden: true
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
        var visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description'];

        this.callParent();

        Maintenance.util.NavigationUtil.showFields(this, visibleFields);
    },

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
            tradesForm = me.down('scheduleEstimateFormTrades'),
            partsForm = me.down('estimateFormParts'),
            costsForm = me.down('estimateFormCosts'),
            isEstimationCompleted = record.get('estimation_comp'),
            preferencesStore = Ext.getStore('appPreferencesStore'),
            param = preferencesStore.findRecord('param_id', 'EditEstAndSchedAfterStepComplete');

        if (param && param.get('param_value')==='0' && isEstimationCompleted===1) {
            tradesForm.getItems().get('addTradeContainer').getItems().get('addTradeForm').setHidden(true);
			tradesForm.getItems().get('addTradeContainer').getItems().get('addTradeToolBar').setHidden(true);
            partsForm.getItems().get('addPartForm').setHidden(true);
            partsForm.getItems().get('addPartToolBar').setHidden(true);
            costsForm.getItems().get('addOtherCostForm').setHidden(true);
            costsForm.getItems().get('addCostToolBar').setHidden(true);
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
            itemName,
            getFieldsFrom = function (item) {
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

        // Override: Only get items from the requestDetailsPanel and resumeCostsForm
        /* Override: start */
        me.down('requestDetailsPanel').getItems().each(getFieldsFrom);

        me.query('[itemId=resumeCostsForm]')[0].getItems().each(getFieldsFrom);
        //this.getItems().each(getFieldsFrom);
        /* Override: end */

        return (byName) ? (fields[byName] || []) : fields;
    },

    /**
     * Override {@link Common.form.FormPanel} to check that the field's table corresponds to record's table
     * @override
     * Registers change listeners for all fields included in the form panel. Updates the form record on
     * each field change.
     * Keeps the form model updated with the contents of the form. This simplifies the form
     * processing. We can call form.getRecord() and always get the contents of the form fields.
     */
    addFieldListeners: function () {
        var me = this,
            fields = me.query('field'),
            fieldChangedMessage = LocaleManager.getLocalizedString('Field Changed field: {0} newValue: {1} oldValue: {2}',
                'Common.form.FormPanel'),
            fieldLimitMessageTitle = LocaleManager.getLocalizedString('Input', 'Common.form.FormPanel'),
            fieldLimitMessage = LocaleManager.getLocalizedString('Input for field {0} is limited to {1} characters',
                'Common.form.FormPanel'),
            previousLength,
            record;

        Ext.each(fields, function (field) {
            if (field.xtype === 'commontextfield' || field.xtype === 'commontextareafield'
                || field.xtype === 'textpromptfield') {
                previousLength = 0;
                field.on('inputchanged', function (textfield) {
                    var maxLength = textfield.getMaxLength(),
                        value = textfield.getValue(),
                        currentLength = value.length;
                    if (maxLength && maxLength > 0) {
                        if (previousLength >= maxLength && currentLength === maxLength) {
                            Ext.Msg.alert(fieldLimitMessageTitle,
                                Ext.String.format(fieldLimitMessage, field.getLabel(), maxLength));
                        }
                    }
                    previousLength = value.length;
                }, me);
            }
            field.on('change', function (field, newValue, oldValue) {
                console.log(Ext.String.format(fieldChangedMessage, field.getName(), newValue, oldValue));
                record = me.getRecord();
                if (record) {
                    /* Override: start */

                    if (!Ext.isDefined(record.getServerTableName) || !Ext.isDefined(field.getServerTableName)
                        || record.getServerTableName() === field.getServerTableName()) {

                        /* Override: end */
                        console.log('Field Changed - field: ' + field.getName() + ' value: ' + field.getValue());
                        record.set(field.getName(), field.getValue());
                        if (me.isErrorPanelDisplayed) {
                            me.displayErrors(record);
                        }
                    }
                }
            }, me);
        }, me);
    }
});