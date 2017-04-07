/**
 * TextField with common configuration options applied.
 * Disables the Android input field overlay.
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.field.Text', {
    extend: 'Common.control.Text',

    xtype: 'commontextfield',

    config: {
        autoComplete: 'off'
    },

    initialize: function() {
        var inputComponent = this.getComponent();
        this.callParent();

        inputComponent.on('keyup', this.onInputChange, this);

        // Hide the text input overlay
        if(Ext.os.is.Android) {
            inputComponent.addCls('android-hide-overlay');
        }
    },

    onInputChange: function() {
        this.fireEvent('inputchanged', this);
    }
});

