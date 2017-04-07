Ext.define('AppLauncher.store.Preferences', {
    extend: 'Ext.data.Store',
    alias: 'store.Preferences',
    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'text', type: 'string'},
            {name: 'view', type: 'string'}
        ]
    }
});
