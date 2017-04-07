/**
 * The Barcode field input component
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.control.BarCodeInput', {
    extend: 'Ext.field.Input',

    xtype: 'barcodeinput',

    // @private
    getTemplate: function() {
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
                cls: 'x-clear-icon'
            },
            {
                reference: 'barcodeIcon',
                cls: 'x-barcode'
            }
        ];
    },

    /**
     * @override
     */
    initElement: function() {
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
            tap: 'onInputTap'
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
        if(Ext.browser.is.ie && Ext.browser.version.major >=10){
            me.input.on({
                scope: me,
                keypress: 'onKeyPress'
            });
        }
    },

    onBarcodeIconTap: function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.fireEvent('barcodeicontap', this, e);
    },

    applyReadOnly: function(readOnly) {
        if(readOnly) {
            this.barcodeIcon.addCls('x-barcode-hide-icon');
        } else {
            this.barcodeIcon.removeCls('x-barcode-hide-icon');
        }

        return readOnly;
    }

});