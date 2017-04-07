Ext.define('AssetReceipt.control.ArrowTextField', {
    extend: 'Common.control.Text',

    xtype: 'arrowTextField',

    requires: 'Common.control.field.PromptInput',

    config: {
        /**
         * @cfg {Object} component The component of the field. The Ext.field.Input class is replaced with the extended
         *      Common.control.field.PromptInput class.
         */
        component: {
            xtype: 'promptinput',
            type: 'text'
        },

        clearIcon: false
    },

    initialize: function () {
        var barcodeIcon = this.getComponent().barcodeIcon;

        if (barcodeIcon) {
            barcodeIcon.hide();
        }

        this.on('singletap', this.onFieldTapped, this, {
            element: 'element'
        });
    },

    onFieldTapped: function () {
        this.fireEvent('fieldTapped', this);
    }

});