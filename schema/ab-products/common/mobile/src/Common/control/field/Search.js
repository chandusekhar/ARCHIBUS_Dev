/**
 * A custom search field that causes the focus to change when the keyboard is hidden on Android devices.
 * @since 21.1
 * @author Jeff Martin
 * @deprecated 23.1 Use {@link Common.control.Search} instead
 */
Ext.define('Common.control.field.Search', {
    extend: 'Common.control.field.Text',

    requires: 'Common.scripts.event.Android',

    xtype: 'commonsearchfield',

    config: {
        /**
         * @cfg
         * @inheritdoc Ext.field.Field
         */
        component: {
            type: 'search'
        },

        /**
         * @cfg
         * @inheritdoc Ext.field.Field
         */
        ui: 'search'


    },

    initialize: function() {
        var me = this;

        me.callParent(arguments);

        if(Ext.os.is.Android4) {
            AndroidEvent.on('hidekeyboard', me.onHideKeyboard, me);
        }

        // TODO: Add CSS class
        me.getComponent().setStyle('border:1px solid #748FB7;-webkit-text-fill-color:#ABBFD8');
    },

    // Remove the focus from the search field to prevent Nexus 7 devices from duplicating
    // the field contents
    onHideKeyboard: function() {
        this.blur();
    }
});
