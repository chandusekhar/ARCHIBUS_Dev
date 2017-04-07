Ext.define('Common.view.navigation.ComponentListBase', {
    extend: 'Common.control.DataView',

    initialize: function () {
        var me = this,
            title,
            titlePanel;

        me.callParent(arguments);

        // Add the title panel
        if (Ext.isFunction(me.getTitle)) {
            title = me.getTitle();
            titlePanel = Ext.factory({docked: 'top', title: title}, Common.control.TitlePanel);
            me.add(titlePanel);
        }
    }
});