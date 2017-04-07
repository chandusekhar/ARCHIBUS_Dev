Ext.define('AssetReceipt.control.NextBarcodeField', {
    extend: 'Common.control.field.Barcode',

    xtype: 'nextBarcodeField',

    config: {
        /**
         * @cfg {Object} component The component of the field. The Common.control.BarCodeInput class is replaced with the extended
         *      AssetReceipt.control.NextBarcodeFieldInput class.
         */
        component: {
            xtype: 'barcodeinputnext',
            type: 'text'
        }
    },
    initialize: function () {
        this.callParent();

        this.getComponent().on({
            scope: this,
            nexticontap: 'onNextIconTap'
        });
    },

    onNextIconTap: function () {
        this.fireEvent('nexticontap', this);
    }

});