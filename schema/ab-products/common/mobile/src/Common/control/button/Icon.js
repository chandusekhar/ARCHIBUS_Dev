/**
 * Displays an icon button without the additional overhead of the {@link Ext.Button} class.
 *
 * Requires a modification to the Sencha SASS icon and icon-font mixins. The mixins are located in the
 * ../schema/ab-products/common/mobile/src/touch/resources/themes/stylesheets/sencha-touch/base/mixins/_Class.scss
 * file.
 *
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.control.button.Icon', {
    extend: 'Ext.Component',

    xtype: 'iconbutton',

    config: {
        /**
         * @cfg {String} iconCls
         * Optional CSS class to add to the icon element. This is useful if you want to use a CSS
         * background image to create your Button icon.
         * @accessor
         */
        iconCls: null,

        baseCls: 'ab-icon-button'
    },

    template: [
        {
            tag: 'div',
            reference: 'iconbutton',
            className: Ext.baseCSSPrefix + 'button-icon'
        }
    ],

    initialize: function() {
        var me = this;

        me.callParent(arguments);

        me.iconbutton.on({
            scope: me,
            tap: 'onTap'
        });
    },

    /**
     * @private
     */
    updateIconCls: function(iconCls, oldIconCls) {
        var me = this,
            element = me.iconbutton;

        if (iconCls) {
            me.showIconElement();
            element.replaceCls(oldIconCls, iconCls);
        } else {
            element.removeCls(oldIconCls);
        }
    },

    /**
     * Used by `icon` and `iconCls` configurations to show the icon element.
     * @private
     */
    showIconElement: function() {
        this.iconbutton.removeCls(Ext.baseCSSPrefix + 'hidden');
        this.iconbutton.addCls(Ext.baseCSSPrefix + 'shown');
    },

    onTap: function(e) {
        var me = this;
        me.fireEvent('iconbuttontap', me, e);
    }

});
