Ext.define('MaterialInventory.view.MaterialForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'materialForm',

    requires: [
        'MaterialInventory.control.FormHeader'
    ],

    config: {
        title: LocaleManager.getLocalizedString('Edit Material', 'MaterialInventory.view.MaterialForm'),
        reviewTitle: LocaleManager.getLocalizedString('Review Material', 'MaterialInventory.view.MaterialForm'),

        model: 'MaterialInventory.model.MaterialLocation',
        storeId: 'materialLocations',

        formMode: 'add', // values add/edit/readOnly

        editViewClass: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'locateMaterial',
                iconCls: 'locate',
                cls: ['ab-icon-button', 'x-button-icon-secondary'],
                align: 'left',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'viewMsds',
                iconCls: 'news',
                cls: ['ab-icon-button', 'x-button-icon-secondary'],
                align: 'right',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'verifyMaterial',
                iconCls: 'check',
                cls: ['ab-icon-action'],
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'materialformheader',
                productName: '',
                manufacturerId: '',
                dateUpdated: '',
                dateLastInv: '',
                lastEditedBy: '',
                displayLabels: !Ext.os.is.Phone,
                dateLabel: LocaleManager.getLocalizedString('Date Last Updated:', 'MaterialInventory.view.MaterialForm')
            },

            {
                xtype: 'fieldset',
                style: 'margin-top:0.2em',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'prompt',
                        name: 'product_name',
                        store: 'materialData',
                        label: LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.MaterialForm'),
                        title: LocaleManager.getLocalizedString('Products', 'MaterialInventory.view.MaterialForm'),
                        required: true,
                        displayFields: [
                            {
                                name: 'manufacturer_id',
                                title: LocaleManager.getLocalizedString('Manufacturer', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'product_name',
                                title: LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'ghs_id',
                                title: LocaleManager.getLocalizedString('GHS Product Identifier', 'MaterialInventory.view.MaterialForm')
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'container_status',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        minValue: 0,
                        stepValue: 1,
                        name: 'quantity',
                        decimals: 2,
                        value: 0

                    },
                    {
                        xtype: 'prompt',
                        name: 'quantity_units',
                        valueField: 'bill_unit_id',
                        store: 'materialUnits',
                        title: LocaleManager.getLocalizedString('Quantity', 'MaterialInventory.view.MaterialForm'),
                        displayFields: [
                            {
                                name: 'bill_unit_id',
                                title: LocaleManager.getLocalizedString('Unit', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'bill_type_id',
                                title: LocaleManager.getLocalizedString('Type', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.MaterialForm')
                            }
                        ]
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'container_code',
                        barcodeFormat: [{fields: ['container_code']}]
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        minValue: 0,
                        stepValue: 1,
                        name: 'num_containers',
                        decimals: 0,
                        value: 1
                    },
                    {
                        xtype: 'prompt',
                        name: 'container_cat',
                        store: 'containerCategories',
                        title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.MaterialForm'),
                        displayFields: [
                            {
                                name: 'container_cat',
                                title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.MaterialForm')
                            }
                        ],
                        childFields: ['container_type']
                    },
                    {
                        xtype: 'prompt',
                        name: 'container_type',
                        store: 'containerTypes',
                        title: LocaleManager.getLocalizedString('Container Type', 'MaterialInventory.view.MaterialForm'),
                        displayFields: [
                            {
                                name: 'container_cat',
                                title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'container_type',
                                title: LocaleManager.getLocalizedString('Container Type', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.MaterialForm')
                            }
                        ],
                        parentFields: ['container_cat']
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_start'
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_end'
                    },
                    {
                        xtype: 'prompt',
                        name: 'custodian_id',
                        store: 'custodianEmployees',
                        title: LocaleManager.getLocalizedString('Custodian', 'MaterialInventory.view.MaterialForm'),
                        displayFields: [
                            {
                                name: 'custodian_id',
                                title: LocaleManager.getLocalizedString('Custodian', 'MaterialInventory.view.MaterialForm')
                            }
                        ]
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'description',
                        title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.MaterialForm'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        displayEditPanel: true
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'comments',
                        title: LocaleManager.getLocalizedString('Comments', 'MaterialInventory.view.MaterialForm'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        displayEditPanel: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                style: 'margin-top:0.4em',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'localizedspinnerfield',
                        stepValue: 1,
                        name: 'temperature',
                        decimals: 3,
                        value: 0
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'temperature_units',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        minValue: 0,
                        stepValue: 1,
                        name: 'pressure',
                        value: 0
                    },
                    {
                        xtype: 'prompt',
                        name: 'pressure_units',
                        valueField: 'bill_unit_id',
                        store: 'pressureUnits',
                        title: LocaleManager.getLocalizedString('Pressure', 'MaterialInventory.view.MaterialForm'),
                        displayFields: [
                            {
                                name: 'bill_unit_id',
                                title: LocaleManager.getLocalizedString('Unit', 'MaterialInventory.view.MaterialForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.MaterialForm')
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                style: 'margin-top:0.4em',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'buildingPrompt',
                        store: 'materialBuildings',
                        childFields: ['fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
                        parentFields: ['site_id'],
                        readOnly: true
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'materialFloors',
                        childFields: ['rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
                        parentFields: ['site_id', 'bl_id']
                    },
                    {
                        xtype: 'roomBarcodePrompt'
                    },
                    {
                        xtype: 'aislePrompt'
                    },
                    {
                        xtype: 'cabinetPrompt'
                    },
                    {
                        xtype: 'shelfPrompt'
                    },
                    {
                        xtype: 'binPrompt'
                    }
                ]
            },
            {
                xtype: 'hiddenfield',
                name: 'site_id'
            },
            {
                xtype: 'hiddenfield',
                name: 'last_edited_by'
            },
            {
                xtype: 'hiddenfield',
                name: 'msds_id'
            },
            {
                xtype: 'hiddenfield',
                name: 'manufacturer_id'
            },
            {
                xtype: 'hiddenfield',
                name: 'date_updated'
            },
            {
                xtype: 'hiddenfield',
                name: 'date_last_inv'
            },
            {
                xtype: 'hiddenfield',
                name: 'pressure_units_type'
            },
            {
                xtype: 'hiddenfield',
                name: 'quantity_units_type'
            }
        ]
    },

    initialize: function () {
        this.callParent();

        this.setFieldLabelAndLength('msds_location_sync');

        this.setEnumerationLists();

        this.setFormHeaderFields();

        this.handleUnitSelection();
    },

    /*
     * Set option values for enum list fields.
     */
    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['container_status', 'temperature_units'];

        Ext.each(fieldNames, function (fieldName) {
            var fieldEnumList = TableDef.getEnumeratedList('msds_location_sync', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(fieldEnumList);
            }
        });
    },

    setFormHeaderFields: function () {
        var productName,
            manufacturerId,
            dateUpdated,
            dateLastInv,
            lastEditedBy;

        // Set the Product Name value in the form header
        productName = this.down('prompt[name=product_name]');
        productName.on('change', this.onProductNameChanged, this);

        // Set the Manufacturer Id value in the form header
        manufacturerId = this.query('hiddenfield[name=manufacturer_id]')[0];
        manufacturerId.on('change', this.onManufacturerIdChanged, this);

        // Set the Date Updated value in the form header
        dateUpdated = this.query('hiddenfield[name=date_updated]')[0];
        dateUpdated.on('change', this.onDateUpdatedChanged, this);

        // Set the Date Last Inventory value in the form header
        dateLastInv = this.query('hiddenfield[name=date_last_inv]')[0];
        dateLastInv.on('change', this.onDateLastInvChanged, this);

        // Set the Last Edited By value in the form header
        lastEditedBy = this.query('hiddenfield[name=last_edited_by]')[0];
        lastEditedBy.on('change', this.onLastEditedByChanged, this);
    },

    onProductNameChanged: function (field, newValue) {
        var selectedRecord = field.getRecord(),
            msdsField = this.down('hiddenfield[name=msds_id]'),
            manufacturerField = this.down('hiddenfield[name=manufacturer_id]');

        if (selectedRecord && selectedRecord.get('msds_id')) {
            msdsField.setValue(selectedRecord.get('msds_id'));
        }

        if (selectedRecord && selectedRecord.get('manufacturer_id')) {
            manufacturerField.setValue(selectedRecord.get('manufacturer_id'));
        }

        this.down('materialformheader').setProductName(newValue);
    },

    onManufacturerIdChanged: function (field, newValue) {
        this.down('materialformheader').setManufacturerId(newValue);
    },

    onDateUpdatedChanged: function (field, newValue) {
        this.down('materialformheader').setDateUpdated(newValue);
    },

    onDateLastInvChanged: function (field, newValue) {
        this.down('materialformheader').setDateLastInv(newValue);
    },

    onLastEditedByChanged: function (field, newValue) {
        this.down('materialformheader').setLastEditedBy(newValue);
    },

    handleUnitSelection: function () {
        var pressureUnits = this.query('prompt[name=pressure_units]')[0],
            quantityUnits = this.query('prompt[name=quantity_units]')[0];

        pressureUnits.on('change', this.onPressureUnitsChange, this);
        quantityUnits.on('change', this.onQuantityUnitsChange, this);
    },

    onPressureUnitsChange: function (field) {
        var selectedRecord = field.getRecord(),
            pressureUnitsTypeField = this.down('hiddenfield[name=pressure_units_type]');

        if (selectedRecord && selectedRecord.get('bill_type_id') && pressureUnitsTypeField) {
            pressureUnitsTypeField.setValue(selectedRecord.get('bill_type_id'));
        }
    },

    onQuantityUnitsChange: function (field) {
        var selectedRecord = field.getRecord(),
            quantityUnitsTypeField = this.down('hiddenfield[name=quantity_units_type]');

        if (selectedRecord && selectedRecord.get('bill_type_id') && quantityUnitsTypeField) {
            quantityUnitsTypeField.setValue(selectedRecord.get('bill_type_id'));
        }
    },

    applyFormMode: function (mode) {
        var formHeader = this.down('materialformheader'),
            selectProductField = this.down('prompt[name=product_name]'),
            toolBarButtons = this.getToolBarButtons(),
            i,
            verifyBtn;

        for (i = 0; i < toolBarButtons.length; i++) {
            if (toolBarButtons[i].action === 'verifyMaterial') {
                verifyBtn = toolBarButtons[i];
            }
        }

        if (mode !== 'edit' || Ext.isEmpty(AppMode.getInventoryDate())) {
            Ext.Array.remove(toolBarButtons, verifyBtn);
        } else if (!verifyBtn) {
            verifyBtn = Ext.create('Common.control.button.Toolbar', {
                        action: 'verifyMaterial',
                        iconCls: 'check',
                        cls: ['ab-icon-action'],
                        align: 'right',
                        displayOn: 'all'
            });
            toolBarButtons.push(verifyBtn);
            MaterialInventory.util.Ui.setColorOfCheckButton(verifyBtn, this.getRecord());
        }

        formHeader.setHidden(mode === 'add');
        selectProductField.setHidden(mode !== 'add');

        if (mode === 'readOnly') {
            this.setAllFieldsReadOnly();
        } else {
            this.setEditableBarcodePromptFields();
        }
    },

    setAllFieldsReadOnly: function () {
        var fields = this.query('field');

        Ext.each(fields, function (field) {
            field.setReadOnly(true);
        });
    },

    // Set barcode prompt fields as not read only to display the barcode icon
    setEditableBarcodePromptFields: function () {
        var fields = this.query('barcodePromptField');

        Ext.each(fields, function (field) {
            field.setReadOnly(false);
        });
     }
});