Ext.define('AppLauncher.view.Log', {
    extend: 'Ext.Container',

    requires: 'Common.device.File',
    xtype: 'logpanel',

    config: {
        height: '100%',
        width: '100%',
        zIndex: 99,
        scrollable: true,
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Log','AppLauncher.view.Log'),
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Done','AppLauncher.view.Log'),
                        align: 'right',
                        itemId: 'doneButton'
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'logContainer',
                styleHtmlContent: true
            }
        ]
    },

    initialize: function() {
        var me = this,
            doneButton = me.down('#doneButton');

        doneButton.on('tap', 'onDoneButtonTap', me);
        me.getLogText();
    },

    // TODO: Should be in controller
    getLogText: function() {
        var me = this,
            logContainer = me.down('#logContainer');

        Common.device.File.readFile('log/archibusmobile.log')
            .then(function(text) {
                text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
                logContainer.setHtml(text);
            });
    },

    onDoneButtonTap: function() {
        var me = this;

        me.fireEvent('panelclose', me);
    }
});
