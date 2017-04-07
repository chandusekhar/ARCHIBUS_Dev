/**
 * Displays the Product Name, Manufacturer ID, Date Updated and Date Last Inventory in the header of a form.
 */
Ext.define('MaterialInventory.control.FormHeader', {
    extend: 'Ext.Component',

    xtype: 'materialformheader',

    template: [
        {
            cls: 'form-header',
            reference: 'formHeaderEl1',
            children: [
                {
                    cls: 'form-header-left',
                    reference: 'leftEl1',
                    text: ''
                },
                {
                    cls: 'form-header-right',
                    reference: 'rightEl1',
                    text: ''
                }
            ]
        },
        {
            cls: 'form-header',
            reference: 'formHeaderEl2',
            children: [
                {
                    cls: 'form-header-left',
                    reference: 'leftEl2',
                    text: ''
                },
                {
                    cls: 'form-header-right',
                    reference: 'rightEl2',
                    text: ''
                }
            ]
        },
        {
            cls: 'form-header',
            reference: 'formHeaderEl3',
            children: [
                {
                    cls: 'form-header-left',
                    reference: 'leftEl3',
                    text: ''
                },
                {
                    cls: 'form-header-right',
                    reference: 'rightEl3',
                    text: ''
                }
            ]
        }
    ],

    config: {
        productName: null,

        manufacturerId: null,

        dateUpdated: null,

        dateLastInv: null,

        lastEditedBy: null,

        dateUpdatedLabel: LocaleManager.getLocalizedString('Date Updated', 'MaterialInventory.control.FormHeader'),

        dateLastInvLabel: LocaleManager.getLocalizedString('Last Inventoried', 'MaterialInventory.control.FormHeader'),

        lastEditedByLabel: LocaleManager.getLocalizedString('Last Edited By', 'MaterialInventory.control.FormHeader'),

        displayLabels: true
    },

    applyProductName: function (config) {
        this.leftEl1.setText(config);
    },

    applyManufacturerId: function (config) {
        this.leftEl2.setText(config);
    },

    applyDateUpdated: function (config) {
        var dateString, parsedDate, processedDate;

        if (Ext.isString(config)) {
            parsedDate = Date.parse(config);
            if (!isNaN(parsedDate)) {
                processedDate = new Date(parsedDate);
            }
        }

        if (Ext.isDate(config)) {
            processedDate = config;
        }

        if (processedDate) {
            dateString = Ext.DateExtras.dateFormat(processedDate, LocaleManager.getLocalizedDateFormat());
        } else {
            dateString = config;
        }

        this.rightEl1.setText(this.getDateUpdatedText(dateString));
    },

    applyDateLastInv: function (config) {
        var dateString, parsedDate, processedDate;

        if (Ext.isString(config)) {
            parsedDate = Date.parse(config);
            if (!isNaN(parsedDate)) {
                processedDate = new Date(parsedDate);
            }
        }

        if (Ext.isDate(config)) {
            processedDate = config;
        }

        if (processedDate) {
            dateString = Ext.DateExtras.dateFormat(processedDate, LocaleManager.getLocalizedDateFormat());
        } else {
            dateString = config;
        }

        this.rightEl3.setText(this.getDateLastInvText(dateString));
    },

    applyLastEditedBy: function (config) {
        this.rightEl2.setText(this.getLastEditedByText(config));
    },

    getDateUpdatedText: function (config) {
        var displayLabels = this.getDisplayLabels(),
            dateUpdatedLabel = this.getDateUpdatedLabel(),
            dateUpdatedText;

        if (!displayLabels) {
            return config;
        }

        if (displayLabels && !Ext.isEmpty(dateUpdatedLabel) && !Ext.isEmpty(config)) {
            dateUpdatedText = dateUpdatedLabel + ': ' + config;
        } else {
            dateUpdatedText = config;
        }

        return dateUpdatedText;
    },

    getDateLastInvText: function (dateString) {
        var displayLabels = this.getDisplayLabels(),
            dateLastInvLabel = this.getDateLastInvLabel(),
            dateLastInvText;

        if (!displayLabels) {
            return dateString;
        }

        if (displayLabels && !Ext.isEmpty(dateLastInvLabel) && !Ext.isEmpty(dateString)) {
            dateLastInvText = dateLastInvLabel + ': ' + dateString;
        } else {
            dateLastInvText = dateString;
        }

        return dateLastInvText;
    },

    getLastEditedByText: function (config) {
        var displayLabels = this.getDisplayLabels(),
            lastEditedByLabel = this.getLastEditedByLabel(),
            lastEditedByText;

        if (!displayLabels) {
            return config;
        }

        if (displayLabels && !Ext.isEmpty(lastEditedByLabel) && !Ext.isEmpty(config)) {
            lastEditedByText = lastEditedByLabel + ': ' + config;
        } else {
            lastEditedByText = config;
        }

        return lastEditedByText;
    }

});