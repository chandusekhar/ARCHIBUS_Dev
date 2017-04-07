Ext.define('AppLauncher.view.WebCentral', {
    extend: 'Ext.Container',

    xtype: 'webcentralsettings',

    config: {
        style: 'margin:10px',
        title: LocaleManager.getLocalizedString('Web Central Server', 'AppLauncher.view.WebCentral'),
        items: [
            {
                xtype: 'textfield',
                label: LocaleManager.getLocalizedString('Web Central URL', 'AppLauncher.view.WebCentral'),
                name: 'url',
                readOnly: true,
                labelAlign: Ext.os.is.Phone ? 'top' : 'left'
            },
            {
                xtype: 'container',
                height: '80px',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Change Web Central Server URL', 'AppLauncher.view.WebCentral'),
                        action: 'resetWebCentralUrl',
                        minWidth: Ext.os.is.Phone ? '300px' : '400px',
                        ui: 'action',
                        centered: true
                    }
                ]
            }
        ]
    }
});