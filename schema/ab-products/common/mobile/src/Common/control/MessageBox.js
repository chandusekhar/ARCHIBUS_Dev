/**
 * Utility class for displaying a confirmation message box that allows the message text to be center, left or right
 * aligned.
 * The message box can be called using a global singleton Ext.FormattedMsg.
 *
 * Example usage:
 *
 *     Ext.FormattedMsg.confirm('Address' ,'Please enter your address:', function (buttonId) {
 *         if (buttonId === 'yes') {
 *             // Process address
 *               }, this);
 *           }
 *       }, this, 'left');
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.MessageBox', {
    extend: 'Ext.MessageBox',

    defaultTextStyle: 'text-align:center;padding-left:6px',

    config: {
        /**
         * @cfg {String} textAlign The value that is passed to the text-align style of the displayed text.
         * The value can be one of: 'center', 'left', 'right'.
         */
        textAlign: 'center'
    },

    /**
     * Displays a confirmation message box with Yes and No buttons (comparable to JavaScript's confirm). If a callback
     * function is passed it will be called after the user clicks either button, and the id of the button that was
     * clicked will be passed as the only parameter to the callback (could also be the top-right close button).
     *
     * @param {String} title The title bar text.
     * @param {String} message The message box body text.
     * @param {Function} fn A callback function which is called when the dialog is dismissed by clicking on the configured buttons.
     * @param {String} fn.buttonId The `itemId` of the button pressed, one of: 'ok', 'yes', 'no', 'cancel'.
     * @param {String} fn.value Value of the input field if either `prompt` or `multiLine` option is `true`.
     * @param {Object} fn.opt The config object passed to show.
     * @param {Object} scope The scope (`this` reference) in which the callback is executed.
     * @param {String} textAlign The alignment style to be applied to the message text. Can be one of: 'center', 'left', 'right'
     *
     * @return {Ext.MessageBox} this
     */
    confirm: function(title, message, fn, scope, textAlign) {
        var textAlignment = textAlign || 'center';
        return this.show({
            title       : title || null,
            textAlign   : textAlignment,
            message     : message || null,
            buttons     : Ext.MessageBox.YESNO,
            promptConfig: false,
            scope       : scope,
            fn: function() {
                if (fn) {
                    fn.apply(scope, arguments);
                }
            }
        });
    },

    /**
     * @private
     */
    applyMessage: function(config) {
        var textStyle = this.getTextAlign();
        config = {
            html : config,
            cls  : this.getBaseCls() + '-text',
            style: textStyle
        };

        return Ext.factory(config, Ext.Component, this._message);
    },

    /**
     * @private
     */
    applyTextAlign: function(config) {
        var textStyle = this.defaultTextStyle;
        if(config) {
            if (config === 'center' || config === 'left' || config === 'right') {
                textStyle = Ext.String.format('text-align:{0};padding-left:6px', config);
            }
        }
        return textStyle;
    }
}, function(MessageBox) {
    Ext.onSetup(function() {
        Ext.FormattedMsg = new MessageBox;
    });
});