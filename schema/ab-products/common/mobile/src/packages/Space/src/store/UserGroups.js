Ext.define('Space.store.UserGroups', {
    extend: 'Common.store.sync.SqliteStore',

    requires: 'Space.model.UserGroup',

    config: {
        model: 'Space.model.UserGroup',
        storeId: 'userGroups',
        remoteFilter: true,
        enableAutoLoad: true,
        disablePaging: true,
        tableDisplayName: LocaleManager.getLocalizedString('User Groups', 'Space.store.UserGroups'),
        proxy: {
            type: 'Sqlite'
        }
    }
});