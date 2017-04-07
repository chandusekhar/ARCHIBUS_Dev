/**
 * The input component for the {@link Common.control.field.TextPrompt} class
 * @private
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.control.TextPromptInput', {
    extend: 'Ext.field.Input',

    xtype: 'textpromptinput',

    tag: 'textarea',

    // Override the Ext.field.Input#getTemplate function. Add an arrow element to the input field.
    // @private
    getTemplate: function () {
        var items = [
            {
                reference: 'input',
                tag: this.tag
            },
            {
                reference: 'clearIcon',
                cls: 'x-clear-icon'
            },
            {
                reference: 'promptButton',
                cls: 'x-compose'
            }
        ];

        items.push({
            reference: 'mask',
            classList: [this.config.maskCls]
        });

        return items;
    },

    // Override The Ext.field.Input#initElement method. Add the tap event to the promptButton
    // element.
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
            paste: 'onPaste'
        });

        if (Ext.os.is.Android) {
            me.input.addCls('android-hide-overlay');
        }

        me.mask.on({
            tap: 'onMaskTap',
            scope: me
        });

        if (me.clearIcon) {
            me.clearIcon.on({
                tap: 'onClearIconTap',
                scope: me
            });
        }

        // Start override
        if (me.promptButton) {
            me.promptButton.on({
                tap: 'onPromptButtonTapped',
                scope: me
            });
        }

        // End override
    },

    onPromptButtonTapped: function (e) {
        this.fireEvent('textpromptbuttontap', this, e);
    }
});