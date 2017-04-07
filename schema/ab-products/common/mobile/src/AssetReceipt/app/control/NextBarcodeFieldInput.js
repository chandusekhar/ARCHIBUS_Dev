Ext.define('AssetReceipt.control.NextBarcodeFieldInput', {
    extend: 'Common.control.BarCodeInput',

    xtype: 'barcodeinputnext',

    // @private
    getTemplate: function () {
        // Template items
        return [
            {
                reference: 'input',
                tag: this.tag
            },
            {
                reference: 'mask',
                classList: [this.config.maskCls]
            },
            {
                reference: 'clearIcon',
                cls: 'x-clear-icon',
                style: Ext.os.is.Phone ? '' : 'margin-right: 3.2em'
            },
            {
                reference: 'barcodeIcon',
                cls: 'x-barcode',
                style: Ext.os.is.Phone ? '' : 'margin-right: 3em'
            },
            {
                reference: 'nextIcon',
                cls: 'x-next-field',
                style: Ext.os.is.Phone ? 'margin-top: 1.6em' : ''
            }
        ];
    },

    /**
     * @override
     */
    initElement: function () {
        var me = this;

        me.callParent();

        me.nextIcon.on({
            scope: me,
            tap: 'onNextIconTap'
        });
    },

    onNextIconTap: function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.fireEvent('nexticontap', this, e);
    }

});