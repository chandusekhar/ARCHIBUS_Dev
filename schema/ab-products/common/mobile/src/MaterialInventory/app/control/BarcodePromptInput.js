/**
 * Combines 'Common.control.field.PromptInput' and 'Common.control.BarCodeInput',
 */
Ext.define('MaterialInventory.control.BarcodePromptInput', {
    extend: 'Common.control.field.PromptInput',

    xtype: 'barcodepromptinput',

    // Override the Common.control.field.PromptInput#getTemplate function. Add the barcode scanning element.
    // @private
    getTemplate: function () {
        var items = [
            {
                reference: 'input',
                tag: this.tag
            },
            {
                reference: 'mask',
                classList: [this.config.maskCls]
            },
            {
                reference: 'barcodeIcon',
                cls: 'x-barcode',
                style: 'margin-right: 4em;'
            },
            {
                reference: 'clearIcon',
                cls: 'x-clear-icon'
            },
            {
                reference: 'promptArrow',
                cls: 'x-arrow'
            }
        ];

        return items;
    },

    /**
     * @override
     */
    initElement: function () {
        var me = this;

        me.callParent();

        me.input.on({
            scope: me,

            keyup: 'onKeyUp',
            keydown: 'onKeyDown',
            focus: 'onFocus',
            blur: 'onBlur',
            input: 'onInput',
            paste: 'onPaste',
            tap: 'onInputTap',
            clearicontap: 'onClearIconTap'
        });

        me.mask.on({
            scope: me,
            tap: 'onMaskTap'
        });

        if (me.clearIcon) {
            me.clearIcon.on({
                tap: 'onClearIconTap',
                touchstart: 'onClearIconPress',
                touchend: 'onClearIconRelease',
                scope: me
            });
        }

        me.barcodeIcon.on({
            scope: me,
            tap: 'onBarcodeIconTap'
        });

        // Hack for IE10. Seems like keyup event is not fired for 'enter' keyboard button, so we use keypress event instead to handle enter.
        if (Ext.browser.is.ie && Ext.browser.version.major >= 10) {
            me.input.on({
                scope: me,
                keypress: 'onKeyPress'
            });
        }
    },

    onBarcodeIconTap: function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.fireEvent('barcodeicontap', this, e);
    }
});
