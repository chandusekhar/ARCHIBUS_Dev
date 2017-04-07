/**
 * Store class to maintain Tool models.
 *
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('Maintenance.store.Accounts', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.Account'],

    serverTableName: 'ac',

    serverFieldNames: ['ac_id', 'description'],
    inventoryKeyNames: ['ac_id'],

    config: {
        model: 'Maintenance.model.Account',
        storeId: 'acStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Accounts', 'Maintenance.store.Accounts'),
        sorters: [
            {
                property: 'ac_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});