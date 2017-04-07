/**
 * Store class to maintain Trade models.
 *
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('Maintenance.store.manager.Trades', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.manager.Trade'],

    serverTableName: 'tr',

    serverFieldNames: ['tr_id', 'description', 'rate_hourly'],
    inventoryKeyNames: ['tr_id'],

    config: {
        model: 'Maintenance.model.manager.Trade',
        storeId: 'tradesStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Trades', 'Maintenance.store.manager.Trades'),
        sorters: [
            {
                property: 'tr_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});