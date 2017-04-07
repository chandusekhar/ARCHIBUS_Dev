Ext.define('Maintenance.view.manager.EstimateFormCosts', {
    extend: 'Ext.Panel',

    xtype: 'estimateFormCosts',

    itemTemplate: '<div class="prompt-list-hbox"><h1 style="width:30%;text-align:left">{[this.getCostDisplayValue(values.wr_id, values.other_rs_type)]}</h1>' +
        '<div style="width:25%;text-align:left">{[Common.util.Format.formatNumber(values.qty_used, 2)]}</div>' +
        '<div style="width:25%;text-align:left">{units_used}</div>' +
        '<div style="width:25%;text-align:left">' +
        '{[Common.util.Format.formatNumber(' +
        '(WorkRequestFilter.listType === Constants.Issued || WorkRequestFilter.listType === Constants.Completed) ?' +
        'values.cost_total : values.cost_estimated,' +
        ' 2, Common.util.Currency.getCurrencySymbol())]}' +
        '</div></div>' +
        '<div class="prompt-list-vbox"><h3>{description}</h3></div>',

    config: {

        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        items: [
            {
                xtype: 'titlebar',
                itemId: 'addCostToolBar',
                cls: 'form-header',
                items: [
					{
					    xtype: 'button',
					    iconCls: 'add',
					    action: 'switchToAddNewCostMode',
					    align: 'right'
					},
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.EstimateFormCosts'),
                        action: 'addOtherCost',
                        ui: 'action',
                        align: 'right'
                    },
                    {
                        xtype: 'title',
                        itemId: 'cost_titlebar_title',
                        title: LocaleManager.getLocalizedString('Add Other Cost', 'Maintenance.view.manager.EstimateFormCosts')
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'addOtherCostForm',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    stepValue: 0.1,
                    minValue: 0,
                    readOnly: true,
                    hidden: true
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Other Resource Type', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'other_rs_type',
                        itemId: 'other_rs_type',
                        required: true,
                        store: 'otherResourcesStore',
                        valueField: 'other_rs_type',
                        displayField: 'description'
                    },
                    {
                        xtype: 'commontextareafield',
                        label: LocaleManager.getLocalizedString('Other Resource Description', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'description',
                        serverTableName: 'wr_other_sync',
                        itemId: 'description'
                    },
                    {
                        xtype: 'container',
                        itemId: 'qtyUnitsContainer',
                        layout: Ext.os.is.Phone ? '' : 'hbox',
                        defaults: {
                            labelWidth: '40%',
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                            readOnly: true,
                            hidden: true
                        },
                        items: [
                            {
                                xtype: 'localizedspinnerfield',
                                minValue: 0,
                                stepValue: 1,
                                label: LocaleManager.getLocalizedString('Quantity Used', 'Maintenance.view.manager.EstimateFormCosts'),
                                name: 'qty_used',
                                itemId: 'qty_used',
                                value: 0,
                                width: '40%'
                            },
                            {
                                xtype: 'commontextfield',
                                label: LocaleManager.getLocalizedString('Units', 'Maintenance.view.manager.EstimateFormCosts'),
                                name: 'units_used',
                                itemId: 'units_used',
                                maxLength: 3,
                                style: 'border-bottom:1px solid #DDD',
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Estimated Cost', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_estimated',
                        itemId: 'cost_estimated',
                        value: 0,
                        labelFormat: 'currency',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Actual Cost', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_total',
                        itemId: 'cost_total',
                        value: 0,
                        labelFormat: 'currency',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Other Costs', 'Maintenance.view.manager.EstimateFormCosts')
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'workRequestCostsStore',
                itemTpl: '',
                itemId: 'costsList',
                height: Ext.os.is.Phone ? '8em' : '6em',
                flex: 1
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        itemId: 'resumeCostsFormTitle',
                        title: LocaleManager.getLocalizedString('Summary of Estimated Costs', 'Maintenance.view.manager.EstimateFormCosts')
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'resumeCostsForm',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelFormat: 'currency',
                    numericKeyboard: Ext.os.is.Phone ? false : true,
                    readOnly: true,
                    hidden: true
                },
                items: [
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Cost of Labor', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_est_labor'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Cost of Parts', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_est_parts'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Other Costs', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_est_other'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Total Cost', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_est_total'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Cost of Labor', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_labor'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Cost of Parts', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_parts'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Other Costs', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_other'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Total Cost', 'Maintenance.view.manager.EstimateFormCosts'),
                        name: 'cost_total'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            list = this.down('list'),
            template = this.itemTemplate,
            formattedTpl = template,
            descriptionEnumList,
            xTpl = new Ext.XTemplate(formattedTpl, {
                getCostDisplayValue: function (wr_id, other_rs_type) {
                    return '' + (me.getMultipleSelection() ? (wr_id + ' ') : '') + other_rs_type;
                }
            });

        if (list) {
            list.setItemTpl(xTpl);
        }
        
        descriptionEnumList = TableDef.getEnumeratedList('other_rs', 'description');
        if (descriptionEnumList && descriptionEnumList.length > 0) {
            me.query('selectfield[name=other_rs_type]')[0].setOptions(descriptionEnumList);
        }
        
        if(!FormUtil.userCanEditResourcesAfterIssued()){
            me.down('button[action=switchToAddNewCostMode]').setHidden(true);
            me.down('button[action=addOtherCost]').setHidden(true);
        }

        this.callParent();

        me.displayFormFields();
    },

    displayFormFields: function () {
        var me = this,
            displayMode = WorkRequestFilter.listType,
            visibleFields,
            editableFields,
            visibleContainers,
            summaryVisibleFields,
            resumeCostsForm = me.down('#resumeCostsForm');

        if (displayMode === Constants.Issued || displayMode === Constants.Completed) {
            visibleFields = ['other_rs_type', 'description', 'qty_used', 'units_used', 'cost_estimated', 'cost_total'];
            if(FormUtil.userCanEditResourcesAfterIssued()) {
                editableFields = ['other_rs_type', 'description', 'qty_used', 'units_used', 'cost_total'];
            }
            visibleContainers = ['qtyUnitsContainer'];
            summaryVisibleFields = ['cost_labor', 'cost_parts', 'cost_other', 'cost_total'];
            me.down('[itemId=resumeCostsFormTitle]').setTitle(LocaleManager.getLocalizedString('Summary of Actual Costs',
                'Maintenance.view.manager.EstimateFormCosts'));
        } else {
            visibleFields = ['other_rs_type', 'description', 'qty_used', 'units_used', 'cost_estimated'];
            editableFields = ['other_rs_type', 'description', 'qty_used', 'units_used', 'cost_estimated'];
            visibleContainers = ['qtyUnitsContainer'];
            summaryVisibleFields = ['cost_est_labor', 'cost_est_parts', 'cost_est_other', 'cost_est_total'];
        }

        NavigationUtil.showItemsByItemId(me, visibleContainers);
        NavigationUtil.showFields(me, visibleFields, editableFields);
        NavigationUtil.showFields(resumeCostsForm, summaryVisibleFields);
    },

    applyRecord: function (record) {
        if (record) {
            this.setResumeCostsFormFromWorkRequest(record);
        }
    },

    setResumeCostsFormFromWorkRequest: function (record) {
        var me = this,
            fieldSet = me.down('#resumeCostsForm').getItems();

        // set the costs to the fields
        fieldSet.each(function (field) {
            field.setValue(record.get(field.getName()));
        });
    },

    /**
     * Sums up the costs from the currently selected work requests and sets the values to the Resume Costs form fields.
     * To call for multiple selection case
     */
    setResumeCostsFormFromSelectedRequests: function () {
        var me = this,
            fieldSet = me.down('#resumeCostsForm').getItems(),
            fieldValues = [],
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        // set to zero all costs
        fieldSet.each(function (field) {
            fieldValues[field.getName()] = 0.00;
        });

        // sum up the costs from WRs
        Ext.Array.each(selectedWorkRequests, function (wr) {
            fieldSet.each(function (field) {
                fieldValues[field.getName()] += wr.get(field.getName());
            });
        });

        // set the costs to the fields
        fieldSet.each(function (field) {
            if (fieldValues[field.getName()] > 0) {
                field.setValue(fieldValues[field.getName()]);
            }
        });
    }
});
