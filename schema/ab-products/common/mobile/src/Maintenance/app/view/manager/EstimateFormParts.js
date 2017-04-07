Ext.define('Maintenance.view.manager.EstimateFormParts', {
    extend: 'Ext.Panel',

    xtype: 'estimateFormParts',

    itemTemplate: '<div class="prompt-list-hbox"><h1 style="width:35%;text-align:left">{[this.getPartDisplayValue(values.wr_id, values.part_id)]}</h1>' +
    '<div style="width:35%;text-align:left">{[values.pt_store_loc_id]}</div>'+
    '<div style="width:30%;text-align:left">{[this.getQuantityDisplayValue(values.qty_estimated, values.qty_actual)]}</div></div>',

    config: {

        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        items: [
            {
                xtype: 'titlebar',
                itemId: 'addPartToolBar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'switchToAddNewPartMode',
                        align: 'right'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.EstimateFormParts'),
                        action: 'addPart',
                        ui: 'action',
                        align: 'right'
                    },
                    //KB#3052028   Allow craftspersons to Add Purchased Parts on the mobile application
                    {
                        xtype:'button',
                        text: LocaleManager.getLocalizedString('Add Purchased Parts','Maintenance.view.manager.EstimateFormParts'),
                        action:'addPartsToInventory',
                        ui: 'action',
                        align:'right'
                    },
                    {
                        xtype: 'title',
                        itemId: 'part_titlebar_title',
                        title: LocaleManager.getLocalizedString('Add Part', 'Maintenance.view.manager.EstimateFormParts')
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'addPartForm',
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
                        xtype: 'prompt',
                        name: 'part_id',
                        itemId: 'part_id',
                        title: LocaleManager.getLocalizedString('Part', 'Maintenance.view.manager.EstimateFormParts'),
                        label: LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.EstimateFormParts'),
                        required: true,
                        store: 'partStorageLocStore',
                        parentFields: ['pt_store_loc_id'],
                        displayFields: [
                            {
                                name: 'part_id',
                                title: LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'pt_store_loc_id',
                                title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            //KB#3053142 Add Quantity on avaliable to Part code pop-up
                            {
                                name: 'qty_on_hand',
                                title: LocaleManager.getLocalizedString('Quantity Available', 'Maintenance.view.manager.EstimateFormParts')
                            }
                        ],
                        optionButton: {
                            iconCls: 'locate'
                        },
                        // TODO: flex configuration should not be needed here. We typically use flex to set relative widths
                        // in a vbox or hbox layout.
                        flex: 1
                    },
                    
                    {
                        xtype: 'prompt',
                        name: 'pt_store_loc_id',
                        itemId: 'pt_store_loc_id',
                        title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts'),
                        label: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts'),
                        required: true,
                        store: 'storageLocStore',
                        displayFields: [
                            {
                                name: 'pt_store_loc_id',
                                title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'pt_store_loc_name',
                                title: LocaleManager.getLocalizedString('Storage Location Name', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'bl_id',
                                title: LocaleManager.getLocalizedString('Building Code', 'Maintenance.view.manager.EstimateFormParts')
                            }
                        ],
                        optionButton: {
                            iconCls: 'locate'
                        },
                        flex: 1
                    },
                    
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Quantity Estimated', 'Maintenance.view.manager.EstimateFormParts'),
                        name: 'qty_estimated',
                        itemId: 'qty_estimated',
                        value: 0,
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'spinnerfield',
                        label: LocaleManager.getLocalizedString('Quantity Used', 'Maintenance.view.manager.EstimateFormParts'),
                        stepValue: 1,
                        minValue: 0,
                        name: 'qty_actual',
                        itemId: 'qty_actual'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.manager.EstimateFormParts')
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'workRequestPartsStore',
                // TODO: Use standard format notation - number:(v,2) instead of calling function
                itemTpl: '',
                itemId: 'partsList',
                height: Ext.os.is.Phone ? '8em' : '6em',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            list = me.down('list'),
            template = me.itemTemplate,
            formattedTpl = template,
            xTpl = new Ext.XTemplate(formattedTpl, {
                getPartDisplayValue: function (wr_id, part_id) {
                    return '' + (me.getMultipleSelection() ? (wr_id + ' ') : '') + part_id;
                },
                getQuantityDisplayValue: function (qty_estimated, qty_actual) {
                    var issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
                    || WorkRequestFilter.listType === Constants.Completed);

                    return Common.util.Format.formatNumber(issuedOrCompletedList ? qty_actual : qty_estimated, 2);
                }
            });

        if (list) {
            list.setItemTpl(xTpl);
        }

        if (!FormUtil.userCanEditResourcesAfterIssued()) {
            me.down('button[action=switchToAddNewPartMode]').setHidden(true);
            me.down('button[action=addPart]').setHidden(true);
        }

        me.callParent();

        me.displayFormFields();
    },

    displayFormFields: function () {
        var me = this,
            displayMode = WorkRequestFilter.listType,
            visibleFields,
            editableFields;

        if (displayMode === Constants.Issued || displayMode === Constants.Completed) {
            visibleFields = ['part_id', 'pt_store_loc_id','qty_estimated', 'qty_actual'];
            if (FormUtil.userCanEditResourcesAfterIssued()) {
                editableFields = ['part_id', 'pt_store_loc_id','qty_actual'];
            }
        } else {
            visibleFields = ['part_id', 'pt_store_loc_id','qty_estimated'];
            editableFields = ['part_id', 'pt_store_loc_id', 'qty_estimated'];
        }

        NavigationUtil.showFields(me, visibleFields, editableFields);
    }
});