/**
 * Adds an additional element to the Ext.field.Input. The element displays a disclosure arrow.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.control.field.PromptInput', {

    extend: 'Ext.field.Input',

    xtype: 'promptinput',

    // Override the Ext.field.Input#getTemplate function. Add an arrow element to the input field.
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
                reference: 'clearIcon',
                cls: 'x-clear-icon'
            },
            {
                reference: 'barcodeIcon',
                cls: 'x-barcode'
            },
            {
                reference: 'promptArrow',
                cls: 'x-arrow'
            }
        ];

        return items;
    },

    initElement: function() {
        var me = this;

        me.callParent();

        if (me.barcodeIcon) {
            me.barcodeIcon.on({
                tap: 'onBarcodeIconTap',
                scope: me
            });
        }
    },

    // @private
    onBarcodeIconTap: function(e) {
        this.fireEvent('barcodeicontap', this, e);
    },

    /**
     * Helper method to update a specified attribute on the `fieldEl`, or remove the attribute all together.
     * Override to handle the case of a null input element.
     * @private
     * @override
     */
    updateFieldAttribute: function(attribute, newValue) {
        var input = this.input;

        // Do nothing if the input element is null
        if(Ext.isEmpty(input)) {
            return;
        }

        if (!Ext.isEmpty(newValue, true)) {
            input.dom.setAttribute(attribute, newValue);
        } else {
            input.dom.removeAttribute(attribute);
        }
    }
});
