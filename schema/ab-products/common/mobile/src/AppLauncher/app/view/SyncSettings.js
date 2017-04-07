Ext.define('AppLauncher.view.SyncSettings', {
    extend: 'Ext.Container',

    xtype:'syncsettings',
    
    config: {
        title: LocaleManager.getLocalizedString('Sync Settings', 'AppLauncher.view.SyncSettings'),
        items: [
            {
                xtype: 'fieldset',
                height: '80px',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                padding: '2px',
                margin: Ext.os.is.Phone ? '2px' : '20px',
                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Reset Background Data Sync Flag', 'AppLauncher.view.SyncSettings'),
                        action: 'resetSyncHistory',
                        minWidth: Ext.os.is.Phone ? '300px' : '400px',
                        ui: 'action'

                    }

                ]
            },
            {
                xtype: 'fieldset',
                height: '80px',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                padding: '2px',
                margin: Ext.os.is.Phone ? '2px' : '20px',
                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Clear Data', 'AppLauncher.view.SyncSettings'),
                        action: 'clearData',
                        minWidth: Ext.os.is.Phone ? '300px' : '400px',
                        ui: 'action'
                    }

                ]
            }
        ]
    }
});