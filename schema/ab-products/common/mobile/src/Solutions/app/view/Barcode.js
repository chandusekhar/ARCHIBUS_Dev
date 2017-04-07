Ext.define('Solutions.view.Barcode', {
    extend: 'Ext.Container',
    requires: 'Common.control.field.Barcode',

    config: {
        items: [
            {
                xtype: 'fieldset',
                items: [
                    {
                        xtype: 'barcodefield',
                        label: 'Bar Code'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Format',
                        itemId: 'barcodeFormat',
                        readOnly: true
                    }
                ]
            }
        ]
    },

    initialize: function() {
        var barcodeField = this.down('barcodefield'),
            barCodeFormatField = this.down('#barcodeFormat');

        barcodeField.on('scancomplete', this.onScanCompleted, this);
        barcodeField.on('clearicontap', function(){
            barCodeFormatField.setValue('');
        }, this);
    },

    onScanCompleted: function(scanResult) {
        var barCodeFormatField = this.down('#barcodeFormat');

        barCodeFormatField.setValue(scanResult.format);
    }
});