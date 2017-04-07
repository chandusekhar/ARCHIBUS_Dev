Ext.define('Solutions.view.SearchBarcode', {
    extend: 'Ext.Container',
    requires: 'Common.control.Search',

    config: {
        items: [
            {
                xtype: 'toolbar',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'search',
                        // name is required for search history
                        name: 'simpleSearch',
                        // By default barcode icon is not displayed
                        enableBarcodeScanning: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                instructions: 'Scan simple barcode values, used before 23.1 release'
            },
            {
                xtype: 'toolbar',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'search',
                        // name is required for search history
                        name: 'multiKeySearch',
                        // By default barcode icon is not displayed
                        enableBarcodeScanning: true,
                        barcodeFormat: [{useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                instructions: 'Scan multi-key barcode values. Parses the barcode value using a delimiter set as application parameter AbSystemAdministration-MobileAppsBarcodeDelimiter and extracts bl_id, fl_id and rm_id.'
            }
        ]
    },

    initialize: function () {
        var simpleSearchField = this.down('search[name=simpleSearch]'),
            multiKeySearchField = this.down('search[name=multiKeySearch]');

        simpleSearchField.on('searchkeyup', this.onKeyUp, this);
        simpleSearchField.on('scancomplete', this.onScanComplete, this);
        simpleSearchField.on('searchclearicontap', function () {
            simpleSearchField.setValue('');
        }, this);

        multiKeySearchField.on('searchkeyup', this.onKeyUp, this);
        multiKeySearchField.on('scancomplete', this.onMultiKeyScanComplete, this);
        multiKeySearchField.on('searchclearicontap', function () {
            multiKeySearchField.setValue('');
        }, this);
    },

    onKeyUp: function (value) {
        Ext.Msg.alert('', 'Value entered: ' + value);
    },

    onScanComplete: function (scanResult) {
        Ext.Msg.alert('', 'Value scanned: ' + scanResult.code);
    },

    onMultiKeyScanComplete: function (scanResult) {
        var blIdValue = scanResult.fields.bl_id,
            flIdValue = scanResult.fields.fl_id,
            rmIdValue = scanResult.fields.rm_id,
            msg = Ext.String.format('Value scanned: {0}<br /> bl_id: {1}<br /> fl_id: {2}<br /> rm_id: {3}', scanResult.code, blIdValue, flIdValue, rmIdValue);
        Ext.Msg.alert('', msg);

    }
});