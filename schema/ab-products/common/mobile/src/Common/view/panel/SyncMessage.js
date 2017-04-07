Ext.define('Common.view.panel.SyncMessage', {
    extend: 'Ext.Container',

    xtype: 'syncmessagepanel',

    config: {
        zIndex: 11,
        styleHtmlContent: true,
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        align: 'right',
                        itemId: 'doneButton'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            doneButton = me.down('#doneButton'),
            sizeMessage = LocaleManager.getLocalizedString('The following Web Central field values were not written to the client database because the data size exceeds the database limit', 'Common.view.Panel.SyncMessage'),
            tableStr = LocaleManager.getLocalizedString('Table', 'Common.view.panel.SyncMessage'),
            fieldStr = LocaleManager.getLocalizedString('Field', 'Common.view.panel.SyncMessage'),
            indentifierStr = LocaleManager.getLocalizedString('Identifier', 'Common.view.panel.SyncMessage'),
            titleStr = LocaleManager.getLocalizedString('Sync Messages','Common.view.panel.SyncMessage'),
            doneStr = LocalizedStrings.z_Done,
            fieldSizeStr = LocaleManager.getLocalizedString('Size (Bytes)', 'Common.view.panel.SyncMessage'),
            tpl;

        doneButton.setText(doneStr);
        doneButton.on('tap', function () {
            me.fireEvent('closemessageview');
        }, me);

        me.down('titlebar').setTitle(titleStr);

        tpl = new Ext.XTemplate(
            '<div>',
            '<p style="font-size:1.1em;font-weight:600">' + sizeMessage + '</p>',
            '<table><tr><th>' + tableStr + '</th><th>' + fieldStr + '</th><th>' + indentifierStr + '</th><th>' + fieldSizeStr + '</th></tr>',
            '<tpl for=".">',
            '<tr><td>{table}</td><td>{field}</td><td>{pkeys}</td><td>{fieldSize}</td></tr>',
            '</tpl></table></div>'
        );

        me.setTpl(tpl);
    }
});