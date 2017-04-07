Ext.define('MaterialInventory.control.BarcodePromptField', {
    extend: 'Common.control.field.Prompt',

    xtype: 'barcodePromptField',

    config: {
        component: {
            xtype: 'barcodepromptinput',
            type: 'text'
        }
    },

    initialize: function () {
        this.callParent();

        this.getComponent().on({
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
        me.doScan(function (scanResult) {
            me.setReadOnly(false);
            if (scanResult.error) {
                Ext.Msg.alert(me.errorTitle, scanResult.errorMessage);
                me.setPromptIsCleared(true);
            } else {
                // value is set from app controller, used for hidding the clear icon when no value is displayed in the field
                me.updateValue('');
                // Update field
                me.setPromptIsCleared(false);
                me.fireEvent('scancomplete', scanResult);
            }
        });
    },

    doScan: function (onCompleted, scope) {
        Common.device.Barcode.scan(onCompleted, scope);
    },

    applyReadOnly: function (config) {
        var me = this;

        me.callParent(arguments);

        if (config) {
            me.getComponent().barcodeIcon.addCls('x-barcode-hide-icon');
        } else {
            me.getComponent().barcodeIcon.removeCls('x-barcode-hide-icon');
        }
    }
});