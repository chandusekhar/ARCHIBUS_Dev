Ext.define('AppLauncher.view.AppContainer', {
    extend: 'Ext.Container',
    requires: 'AppLauncher.view.AppList',

    config: {
        cls: 'panelBackground',
        layout: 'vbox',
        items: [
            {
                xtype: 'titlebar',
                // TODO: For customer branding option, dock the ARCHIBUS toolbar on the bottom. Add an addtional toolbar
                // docked to the top for the customer branding elements.
                cls: 'ab-titlebar',
                docked: 'top',
                height: Ext.os.is.Phone ? '45px':'80px',
                items: [
                    {
                        xtype: 'container',
                        height: Ext.os.is.Phone ? '40px':'60px',
                        width: Ext.os.is.Phone ? '40px':'60px',
                        style: 'margin-left:8px',
                        itemId: 'abIcon'

                    },
                    {
                        xtype: 'container',
                        cls: 'ailogo',
                        height: Ext.os.is.Phone ? '40px':'60px',
                        width: Ext.os.is.Phone ? '150px':'225px',
                        itemId: 'ailogo'
                    },
                    {
                        xtype: 'button',
                        align: 'right',
                        iconCls: 'settings',
                        action: 'displayPreferences'
                    }
                ]

            },
            {
                xtype: 'appList',
                margin: '6px 0px 0px 0px',
                flex: 1
            }
        ]
    },

    initialize: function() {
        var me = this,
            iconContainer = me.down('#abIcon'),
            iconContainerCls = Ext.os.is.Phone ? 'ab-titlebar-logo': 'ab-titlebar-logo-large';

        // Use different images sizes for the phone and tablet platforms.
        iconContainer.addCls(iconContainerCls);
    }

});