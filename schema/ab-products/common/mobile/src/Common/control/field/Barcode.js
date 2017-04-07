/**
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.control.field.Barcode', {
    extend: 'Common.control.field.Text',

    requires: [
        'Common.control.BarCodeInput',
        'Common.device.Barcode'
    ],

    xtype: 'barcodefield',

    config: {
        /**
         * @cfg {Object} component The component of the field. The Ext.field.Input class is replaced with the extended
         *      Common.control.BarcodeInput class.
         */
        component: {
            xtype: 'barcodeinput',
            type: 'text'
        },

        /**
         * @cfg {Array} barcodeFormat Defines how the sccaned value should be parsed. Used since 23.1 for supporting multi-key barcode values.
         */
        barcodeFormat: []
    },

    errorTitle: LocaleManager.getLocalizedString('Scan Error', 'Common.control.field.Barcode'),

    initialize: function () {
        var me = this;

        me.callParent();
        me.element.addCls('x-barcode-clearicon');

        me.getComponent().on({
            scope: this,
            barcodeicontap: 'onBarcodeIconTap'
        });
    },

    onBarcodeIconTap: function (field, e) {
        this.doBarcodeIconTap(this, e);
    },

    // @private
    doBarcodeIconTap: function (me, e) {
        me.setReadOnly(true);
        e.preventDefault();
        e.stopPropagation();
        me.doScan()
            .then(function (scanResult) {
                me.setReadOnly(false);
                // Update field
                me.setValue(scanResult.code);
                me.fireEvent('scancomplete', scanResult);
            },
            function (error) {
                me.setReadOnly(false);
                Ext.Msg.alert(me.errorTitle, error);
            });
    },

    doScan: function () {
        return Common.device.Barcode.scanAndDecode(this.getBarcodeFormat());
    }

});