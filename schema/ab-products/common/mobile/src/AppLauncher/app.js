Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Common': '../Common',
    'AppLauncher': 'app'
});


Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {

    Ext.application({

        requires: [
            'Common.control.MessageBox',
            'AppLauncher.ui.IconData',
            'Ext.field.Toggle',
            'Common.control.field.Number',
            'Common.util.UserProfile'
        ],

        models: [
            'Common.model.App'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.Messages',
            'Preferences'
        ],

        views: [
            'Common.view.registration.RestartDevice',
            'Preferences',
            'AppItem',
            'AppList',
            'AppContainer',
            'AppLauncher.view.Log',
            'Setting',
            'WebCentral',
            'SyncSettings',
            'UserSettings',
            'LoggingSettings',
            'Version'
        ],

        controllers: [
            'Registration',
            'Version'
        ],

        profiles: ['Phone', 'Tablet'],


        name: 'AppLauncher'

    });
});
