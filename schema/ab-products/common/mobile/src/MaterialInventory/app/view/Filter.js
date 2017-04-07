Ext.define('MaterialInventory.view.Filter', {
    extend: 'Common.view.navigation.FilterForm',

    xtype: 'filterPanel',

    config: {
        layout: 'vbox',

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Set Filter', 'MaterialInventory.view.Filter')
            },
            {
                xtype: 'fieldset',
                style: 'margin: 0 0 1.5em;',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        name: 'show',
                        label: LocaleManager.getLocalizedString('Display only items not inventoried', 'MaterialInventory.view.Filter'),
                        options: [
                            {text: LocaleManager.getLocalizedString('No', 'MaterialInventory.view.Filter'), value: 0},
                            {text: LocaleManager.getLocalizedString('Yes', 'MaterialInventory.view.Filter'), value: 1}
                        ]
                    }
                ]
            },

            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'prompt',
                        name: 'product_name',
                        label: LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.Filter'),
                        title: LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.Filter'),
                        store: 'materialData',
                        displayFields: [
                            {
                                name: 'product_name',
                                title: LocaleManager.getLocalizedString('Product Name', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'manufacturer_id',
                        label: LocaleManager.getLocalizedString('Manufacturer', 'MaterialInventory.view.Filter'),
                        title: LocaleManager.getLocalizedString('Manufacturer', 'MaterialInventory.view.Filter'),
                        store: 'manufacturers',
                        displayFields: [
                            {
                                name: 'manufacturer_id',
                                title: LocaleManager.getLocalizedString('Manufacturer', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'container_code',
                        barcodeFormat: [{fields: ['container_code']}]
                    },
                    {
                        xtype: 'prompt',
                        name: 'container_cat',
                        store: 'containerCategories',
                        title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.Filter'),
                        displayFields: [
                            {
                                name: 'container_cat',
                                title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.Filter')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'container_type',
                        store: 'containerTypes',
                        title: LocaleManager.getLocalizedString('Container Type', 'MaterialInventory.view.Filter'),
                        displayFields: [
                            {
                                name: 'container_cat',
                                title: LocaleManager.getLocalizedString('Container Category', 'MaterialInventory.view.Filter')
                            },
                            {
                                name: 'container_type',
                                title: LocaleManager.getLocalizedString('Container Type', 'MaterialInventory.view.Filter')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'container_status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'ALL'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'tier2',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'ALL'
                    },
                    {
                        xtype: 'prompt',
                        name: 'ghs_id',
                        label: LocaleManager.getLocalizedString('GHS Product Identifier', 'MaterialInventory.view.Filter'),
                        title: LocaleManager.getLocalizedString('GHS Product Identifier', 'MaterialInventory.view.Filter'),
                        store: 'ghsIdentifiers',
                        displayFields: [
                            {
                                name: 'ghs_id',
                                title: LocaleManager.getLocalizedString('GHS Product Identifier', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'custodian_id',
                        store: 'custodians',
                        title: LocaleManager.getLocalizedString('Custodian', 'MaterialInventory.view.Filter'),
                        displayFields: [
                            {
                                name: 'custodian_id',
                                title: LocaleManager.getLocalizedString('Custodian', 'MaterialInventory.view.Filter')
                            }
                        ]
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_updated_from',
                        label: LocaleManager.getLocalizedString('Date Updated From', 'MaterialInventory.view.Filter')
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_updated_to',
                        label: LocaleManager.getLocalizedString('Date Updated To', 'MaterialInventory.view.Filter')
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_last_inv_from',
                        label: LocaleManager.getLocalizedString('Date Last Inventory From', 'MaterialInventory.view.Filter')
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_last_inv_to',
                        label: LocaleManager.getLocalizedString('Date Last Inventory To', 'MaterialInventory.view.Filter')
                    },
                    {
                        xtype: 'prompt',
                        name: 'last_edited_by',
                        store: 'editUsers',
                        title: LocaleManager.getLocalizedString('Last Edited By', 'MaterialInventory.view.Filter'),
                        displayFields: [
                            {
                                name: 'last_edited_by',
                                title: LocaleManager.getLocalizedString('Last Edited By', 'MaterialInventory.view.Filter')
                            }
                        ]
                    }
                ]
            }
        ],

        dateUpdatedFromTooBig: LocaleManager.getLocalizedString('Date Updated From should not be greater than Date Updated To.', 'MaterialInventory.view.Filter'),
        dateLastInvFromTooBig: LocaleManager.getLocalizedString('Date Last Inventory From should not be greater than Date Last Inventory To.', 'MaterialInventory.view.Filter')
    },

    initialize: function () {
        this.callParent();

        this.setFieldLabelAndLength('msds_location_sync');

        this.setEnumerationLists();

        this.handleDateSelection();

        this.displayHideShowField();
    },

    /*
     * Set option values for enum list fields.
     */
    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['container_status', 'tier2'],
            localizedAllValue = LocaleManager.getLocalizedString('All', 'MaterialInventory.view.Filter');

        Ext.each(fieldNames, function (fieldName) {
            var options = [],
                fieldEnumList = TableDef.getEnumeratedList('msds_location_sync', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                options.push({displayValue: localizedAllValue, objectValue: "ALL"});
                options = options.concat(fieldEnumList);
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(options);
            }
        });
    },

    handleDateSelection: function () {
        var dateUpdateFrom = this.query('calendarfield[name=date_updated_from]')[0],
            dateUpdatedTo = this.query('calendarfield[name=date_updated_to]')[0],
            dateLastInvFrom = this.query('calendarfield[name=date_last_inv_from]')[0],
            dateLastInvTo = this.query('calendarfield[name=date_last_inv_to]')[0];

        dateUpdateFrom.on('change', this.onDateUpdateFromChange, this);
        dateUpdatedTo.on('change', this.onDateUpdateToChange, this);
        dateLastInvFrom.on('change', this.onDateLastInvFromChange, this);
        dateLastInvTo.on('change', this.onDateLastInvToChange, this);
    },

    onDateUpdateFromChange: function (field, newValue) {
        var dateNewValue,
            dateUpdatedTo = this.query('calendarfield[name=date_updated_to]')[0],
            dateUpdatedToValue = dateUpdatedTo.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateUpdatedToValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue > dateUpdatedToValue) {
                Ext.Msg.alert('', this.getDateUpdatedFromTooBig());
            }
        }
    },

    onDateUpdateToChange: function (field, newValue) {
        var dateNewValue,
            dateUpdatedFrom = this.query('calendarfield[name=date_updated_from]')[0],
            dateUpdatedFromValue = dateUpdatedFrom.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateUpdatedFromValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue < dateUpdatedFromValue) {
                Ext.Msg.alert('', this.getDateUpdatedFromTooBig());
            }
        }
    },

    onDateLastInvFromChange: function (field, newValue) {
        var dateNewValue,
            dateLastInvTo = this.query('calendarfield[name=date_last_inv_to]')[0],
            dateLastInvToValue = dateLastInvTo.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateLastInvToValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue > dateLastInvToValue) {
                Ext.Msg.alert('', this.getDateLastInvFromTooBig());
            }
        }
    },

    onDateLastInvToChange: function (field, newValue) {
        var dateNewValue,
            dateLastInvFrom = this.query('calendarfield[name=date_last_inv_from]')[0],
            dateLastInvFromValue = dateLastInvFrom.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateLastInvFromValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue < dateLastInvFromValue) {
                Ext.Msg.alert('', this.getDateLastInvFromTooBig());
            }
        }
    },

    displayHideShowField: function () {
        var field = this.down('selectlistfield[name=show]');

        if (field) {
            if (AppMode.getInventoryDate()) {
                field.setHidden(false);
            } else {
                field.setHidden(true);
            }
        }
    }
});
